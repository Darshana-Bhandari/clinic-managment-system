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