import prisma from "../../config/database.js";


export const createPayment = async (paymentData) => {
    const { billId, amount, method, transactionId, notes } = paymentData;

    const bill = await prisma.bill.findUnique({
        where: { id: billId },
        include: {
            payments: true,
            patient: {
                include: {
                    user: {
                        select: { fullName: true, email: true, phone: true }
                    }
                }
            },
            appointment: true,
        }
    });

    if (!bill) {
        throw new Error("Bill not found");
    }

    if (bill.status === "CANCELLED") {
        throw new Error("Cannot make payment for a cancelled bill");
    }
    if (bill.status === "REFUNDED") {
        throw new Error("Cannot make payment for a refunded bill");
    }
    if (bill.status === "PAID") {
        throw new Error("Bill is already paid. Cannot make payment.");
    }

    const totalPaid = bill.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingAmount = bill.totalAmount - totalPaid;

    if (amount > remainingAmount) {
        throw new Error(`Payment amount exceeds the remaining bill amount. Remaining amount: ${remainingAmount}`);
    }

    const payment = await prisma.payment.create({
        data: {
            billId,
            amount,
            method,
            transactionId,
            notes,
            status: "COMPLETED",
        },
        include: {
            bill: {
                include: {
                    patient: {
                        include: {
                            user: {
                                select: { fullName: true, email: true, phone: true }
                            }
                        }
                    }
                }
            }
        }
    });

    const newTotalPaid = totalPaid + amount;
    let newStatus = bill.status;
    if (newTotalPaid >= bill.totalAmount) {
        newStatus = "PAID";
    } else if (newTotalPaid > 0) {
        newStatus = "PARTIALLY_PAID";
    }

    await prisma.bill.update({
        where: { id: billId },
        data: {
            status: newStatus,
            paymentDate: newStatus === "PAID" ? new Date() : undefined,
            paymentMethod: method,
        }
    });

    await prisma.auditLog.create({
        data: {
            userId: bill.generatedBy,
            action: "CREATE_PAYMENT",
            resource: "PAYMENT",
            details: {
                paymentId: payment.id,
                billId,
                amount,
                method,
            },
        }
    });

    await socketEmitter.emitPaymentReceived(payment);

    return payment;
};

export const getPayments = async (page = 1, limit = 10, filter = {}) => {
    const skip = (page - 1) * limit;
    const where = {};

    if (filter.billId) where.billId = filter.billId;
    if (filter.status) where.status = filter.status;
    if (filter.method) where.method = filter.method;
    if (filter.fromDate) {
        where.paymentDate = { ...(where.paymentDate || {}), gte: new Date(filter.fromDate) };
    }
    if (filter.toDate) {
        where.paymentDate = { ...(where.paymentDate || {}), lte: new Date(filter.toDate) };
    }
    if (filter.patientId) {
        where.bill = { patientId: filter.patientId };
    }
    if (filter.search) {
        where.OR = [
            { transactionId: { contains: filter.search, mode: "insensitive" } },
            { notes: { contains: filter.search, mode: "insensitive" } },
        ];
    }

    const [total, payments] = await Promise.all([
        prisma.payment.count({ where }),
        prisma.payment.findMany({
            where,
            skip,
            take: limit,
            orderBy: { paymentDate: "desc" },
            include: {
                bill: {
                    include: {
                        patient: {
                            include: {
                                user: {
                                    select: { fullName: true, email: true, phone: true }
                                }
                            }
                        }
                    }
                }
            }
        })
    ]);

    return {
        total,
        page,
        limit,
        payments,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getPaymentById = async (paymentId) => {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
            bill: {
                include: {
                    patient: {
                        include: {
                            user: {
                                select: { fullName: true, email: true, phone: true }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!payment) throw new Error("Payment not found");
    return payment;
};

export const getPaymentByBillId = async (billId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where: { billId },
            include: {
                bill: {
                    include: {
                        patient: {
                            include: {
                                user: {
                                    select: { fullName: true, email: true, phone: true }
                                }
                            }
                        }
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { paymentDate: "desc" },
        }),
        prisma.payment.count({ where: { billId } }),
    ]);

    return {
        payments,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const updatePayment = async (paymentId, updateData) => {
    const existingPayment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { bill: true }
    });

    if (!existingPayment) {
        throw new Error("Payment not found");
    }
    if (existingPayment.status === "REFUNDED") {
        throw new Error("Cannot update a refunded payment");
    }

    if (updateData.amount && updateData.amount !== existingPayment.amount) {
        const bill = await prisma.bill.findUnique({
            where: { id: existingPayment.billId },
            include: { payments: true }
        });

        const totalPaid = bill.payments.reduce((sum, p) => sum + p.amount, 0) - existingPayment.amount;
        const remainingAmount = bill.totalAmount - totalPaid;

        if (updateData.amount > remainingAmount) {
            throw new Error(`Updated payment amount exceeds the remaining bill amount. Remaining amount: ${remainingAmount}`);
        }

        let newStatus = bill.status;
        if (totalPaid + updateData.amount >= bill.totalAmount) {
            newStatus = "PAID";
        } else if (totalPaid + updateData.amount > 0) {
            newStatus = "PARTIALLY_PAID";
        } else {
            newStatus = "UNPAID";
        }

        await prisma.bill.update({
            where: { id: bill.id },
            data: { status: newStatus }
        });
    }

    const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: updateData,
        include: {
            bill: {
                include: {
                    patient: {
                        include: {
                            user: {
                                select: { fullName: true, email: true, phone: true }
                            }
                        }
                    }
                }
            }
        }
    });

    await prisma.auditLog.create({
        data: {
            action: "UPDATE_PAYMENT",
            resource: "PAYMENT",
            details: {
                paymentId: updatedPayment.id,
                billId: updatedPayment.billId,
            },
        }
    });

    return updatedPayment;
};

export const refundPayment = async (paymentId, refundData) => {
    const { reason } = refundData;

    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { bill: true }
    });

    if (!payment) {
        throw new Error("Payment not found");
    }
    if (payment.status === "REFUNDED") {
        throw new Error("Payment is already refunded");
    }
    if (payment.status === "CANCELLED") {
        throw new Error("Cannot refund a cancelled payment");
    }

    const refundedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
            status: "REFUNDED",
            refundedAt: new Date(),
            refundReason: reason || "Payment refunded",
            notes: reason || payment.notes,
        },
        include: {
            bill: {
                include: {
                    patient: {
                        include: {
                            user: {
                                select: { fullName: true, email: true, phone: true }
                            }
                        }
                    }
                }
            }
        }
    });

    const remainingPayments = await prisma.payment.findMany({
        where: {
            billId: payment.billId,
            status: { not: "REFUNDED" }
        }
    });

    if (remainingPayments.length === 0) {
        await prisma.bill.update({
            where: { id: payment.billId },
            data: { status: "REFUNDED" }
        });
    } else {
        const totalPaid = remainingPayments.reduce((sum, p) => sum + p.amount, 0);
        const bill = await prisma.bill.findUnique({ where: { id: payment.billId } });
        let newStatus = bill.status;
        if (totalPaid >= bill.totalAmount) newStatus = "PAID";
        else if (totalPaid > 0) newStatus = "PARTIALLY_PAID";
        else newStatus = "UNPAID";

        await prisma.bill.update({
            where: { id: payment.billId },
            data: { status: newStatus }
        });
    }

    await socketEmitter.emitPaymentFailed(
        refundedPayment.billId,
        refundedPayment.amount,
        refundedPayment.method,
        refundedPayment.refundReason
    );

    return refundedPayment;
};

export const getPaymentHistory = async (patientId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where: {
                bill: { patientId: patientId }
            },
            include: {
                bill: {
                    include: {
                        patient: {
                            include: {
                                user: {
                                    select: { fullName: true, email: true, phone: true }
                                }
                            }
                        }
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { paymentDate: "desc" },
        }),
        prisma.payment.count({
            where: {
                bill: { patientId: patientId }
            }
        })
    ]);

    return {
        payments,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getAllPayments = async (page = 1, limit = 10, filters = {}) => {
    return getPayments(page, limit, filters);
};

export const getPatientPaymentHistory = async (patientId, page = 1, limit = 10) => {
    return getPaymentHistory(patientId, page, limit);
};

export const getTransactionHistory = async (filters = {}, page = 1, limit = 50) => {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.method) where.method = filters.method;
    if (filters.status) where.status = filters.status;
    if (filters.billId) where.billId = filters.billId;
    if (filters.appointmentId) where.appointmentId = filters.appointmentId;
    if (filters.patientId) {
        where.bill = { patientId: filters.patientId };
    }
    if (filters.fromDate) {
        where.paymentDate = { ...(where.paymentDate || {}), gte: new Date(filters.fromDate) };
    }
    if (filters.toDate) {
        where.paymentDate = { ...(where.paymentDate || {}), lte: new Date(filters.toDate) };
    }
    if (filters.transactionId) {
        where.transactionId = { contains: filters.transactionId, mode: 'insensitive' };
    }
    if (filters.search) {
        where.OR = [
            { notes: { contains: filters.search, mode: 'insensitive' } },
            { transactionId: { contains: filters.search, mode: 'insensitive' } },
        ];
    }

    const [transactions, total, aggregate] = await Promise.all([
        prisma.payment.findMany({
            where,
            include: {
                bill: {
                    include: {
                        patient: {
                            include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
                        },
                    },
                },
            },
            skip,
            take: Number(limit),
            orderBy: { paymentDate: 'desc' },
        }),
        prisma.payment.count({ where }),
        prisma.payment.aggregate({
            where: { ...where, status: 'COMPLETED' },
            _sum: { amount: true },
            _count: { _all: true },
        }),
    ]);

    const summary = {
        totalTransactions: total,
        completedCount: aggregate._count._all || 0,
        totalVolume: aggregate._sum.amount || 0,
    };

    return {
        transactions,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
        summary,
    };
};

export const getPaymentSummary = async (filters = {}) => {
    const where = {};
    if (filters.fromDate) where.paymentDate = { ...(where.paymentDate || {}), gte: new Date(filters.fromDate) };
    if (filters.toDate) where.paymentDate = { ...(where.paymentDate || {}), lte: new Date(filters.toDate) };

    const all = await prisma.payment.findMany({ where, select: { method: true, status: true, amount: true } });

    const summary = {
        totalCount: all.length,
        totalVolume: 0,
        byMethod: {},
        byStatus: {},
    };

    for (const tx of all) {
        if (tx.status === 'COMPLETED') summary.totalVolume += Number(tx.amount);
        summary.byMethod[tx.method] = (summary.byMethod[tx.method] || 0) + Number(tx.amount || 0);
        summary.byStatus[tx.status] = (summary.byStatus[tx.status] || 0) + 1;
    }

    return summary;
};

export const deletePayment = async (paymentId, actorId = null) => {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { bill: { include: { payments: true } } },
    });

    if (!payment) {
        throw new Error("Payment not found");
    }

    const bill = payment.bill;
    const totalPaid = bill.payments
        .filter((p) => p.id !== paymentId && p.status === "COMPLETED")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    let newStatus = bill.status;
    if (totalPaid >= bill.totalAmount) {
        newStatus = "PAID";
    } else if (totalPaid > 0) {
        newStatus = "PARTIALLY_PAID";
    } else {
        newStatus = "UNPAID";
    }

    await prisma.$transaction([
        prisma.bill.update({
            where: { id: bill.id },
            data: {
                status: newStatus,
                paymentDate: newStatus === "PAID" ? new Date() : null,
                paymentMethod: newStatus === "PAID" ? bill.paymentMethod : null,
            },
        }),
        prisma.payment.delete({ where: { id: paymentId } }),
        prisma.auditLog.create({
            data: {
                userId: actorId,
                action: "DELETE_PAYMENT",
                resource: "PAYMENT",
                details: {
                    paymentId,
                    billId: bill.id,
                    amount: payment.amount,
                    method: payment.method,
                },
            },
        }),
    ]);

    return { success: true, paymentId, billId: bill.id, newBillStatus: newStatus };
};

export const getTransactionsCSV = async (filters = {}) => {
    const result = await getTransactionHistory(filters, 1, 100000);
    const rows = [
        ['Date', 'Transaction ID', 'Patient Name', 'Patient Email', 'Patient Phone',
         'Bill ID', 'Method', 'Status', 'Amount (NPR)', 'Notes', 'Payment ID'],
    ];

    for (const p of result.transactions) {
        const patient = p.bill?.patient?.user || {};
        rows.push([
            p.paymentDate?.toISOString() || p.createdAt?.toISOString() || '',
            p.transactionId || '',
            patient.fullName || '',
            patient.email || '',
            patient.phone || '',
            p.billId || '',
            p.method,
            p.status,
            String(Number(p.amount || 0).toFixed(2)),
            (p.notes || '').replace(/\n/g, ' '),
            p.id,
        ]);
    }

    return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
};