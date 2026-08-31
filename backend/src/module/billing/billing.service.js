import prisma from "../../config/database.js";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED INCLUDE BLOCK — used in every bill query
// ─────────────────────────────────────────────────────────────────────────────

const BILL_INCLUDE = {
    patient: {
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                },
            },
        },
    },
    appointment: {
        include: {
            doctor: {
                include: {
                    user: {
                        select: { fullName: true },
                    },
                },
            },
        },
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const generateBillNumber = () =>
    `BILL-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

const generateInvoiceNumber = () =>
    `INV-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE BILL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a new itemised bill for a patient.
 *
 * @param {object}  billData
 * @param {string}  billData.patientId
 * @param {string}  [billData.appointmentId]
 * @param {Array}   billData.items          - [{description, quantity, unitPrice, discount, total}]
 * @param {number}  [billData.tax]          - bill-level tax in NPR, default 0
 * @param {number}  [billData.discount]     - bill-level discount in NPR, default 0
 * @param {string}  [billData.notes]
 * @param {string}  billData.generatedBy    - userId of the staff generating the bill
 */
export const generateBill = async (billData) => {
    const {
        patientId,
        appointmentId,
        items,
        tax = 0,
        discount = 0,
        notes,
        generatedBy,
    } = billData;

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
    });
    if (!patient) throw new Error("Patient not found");

    // Verify appointment exists (optional)
    if (appointmentId) {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!appointment) throw new Error("Appointment not found");
    }

    // Calculate totals
    const subtotal    = items.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = subtotal + tax - discount;

    if (totalAmount < 0) {
        throw new Error("Total amount cannot be negative — check discount value");
    }

    const billNumber    = generateBillNumber();
    const invoiceNumber = generateInvoiceNumber();

    // Persist
    const bill = await prisma.bill.create({
        data: {
            patientId,
            appointmentId: appointmentId || undefined,
            billNumber,
            invoiceNumber,
            items,
            subtotal,
            tax,
            discount,
            totalAmount,
            notes,
            generatedBy,
            status: "UNPAID",
        },
        include: BILL_INCLUDE,
    });

    // Audit log
    await prisma.auditLog.create({
        data: {
            userId: generatedBy,
            action: "CREATE",
            description: `Bill ${billNumber} generated for patient ${patientId}. Total: NPR ${totalAmount}`,
        },
    });

    return bill;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL BILLS  (paginated + filtered)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {number}  page
 * @param {number}  limit
 * @param {object}  filters  - { patientId, status, fromDate, toDate, search }
 */
export const getAllBills = async (page = 1, limit = 10, filters = {}) => {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.status)    where.status    = filters.status;

    // Date range — merged correctly to avoid overwriting
    if (filters.fromDate || filters.toDate) {
        where.generatedAt = {};
        if (filters.fromDate) where.generatedAt.gte = new Date(filters.fromDate);
        if (filters.toDate)   where.generatedAt.lte = new Date(filters.toDate);
    }

    // Full-text search across billNumber, invoiceNumber, and patient name
    if (filters.search) {
        where.OR = [
            { billNumber:    { contains: filters.search } },
            { invoiceNumber: { contains: filters.search } },
            { patient: { user: { fullName: { contains: filters.search } } } },
        ];
    }

    const [bills, total] = await Promise.all([
        prisma.bill.findMany({
            where,
            include: BILL_INCLUDE,
            skip,
            take: limit,
            orderBy: { generatedAt: "desc" },
        }),
        prisma.bill.count({ where }),
    ]);

    return {
        bills,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// GET BILL BY ID
// ─────────────────────────────────────────────────────────────────────────────

export const getBillById = async (billId) => {
    const bill = await prisma.bill.findUnique({
        where: { id: billId },
        include: BILL_INCLUDE,
    });

    if (!bill) throw new Error("Bill not found");

    return bill;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET BILL BY INVOICE NUMBER
// ─────────────────────────────────────────────────────────────────────────────

export const getBillByInvoiceNumber = async (invoiceNumber) => {
    const bill = await prisma.bill.findUnique({
        where: { invoiceNumber },
        include: BILL_INCLUDE,
    });

    if (!bill) throw new Error(`Bill with invoice number "${invoiceNumber}" not found`);

    return bill;
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE BILL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates a bill's items, tax, discount, or notes.
 * Automatically recalculates subtotal and totalAmount when financials change.
 * PAID and REFUNDED bills are locked from editing.
 */
export const updateBill = async (billId, updateData) => {
    const existing = await prisma.bill.findUnique({
        where: { id: billId },
    });

    if (!existing) throw new Error("Bill not found");

    if (existing.status === "PAID" || existing.status === "REFUNDED") {
        throw new Error(
            `Bill cannot be edited — current status is "${existing.status}"`
        );
    }

    // Auto-recalculate if financials are changing
    let recalculated = {};
    if (
        updateData.items    !== undefined ||
        updateData.tax      !== undefined ||
        updateData.discount !== undefined
    ) {
        const items    = updateData.items    ?? existing.items;
        const tax      = updateData.tax      !== undefined ? updateData.tax      : existing.tax;
        const discount = updateData.discount !== undefined ? updateData.discount : existing.discount;
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const totalAmount = subtotal + tax - discount;

        if (totalAmount < 0) {
            throw new Error("Total amount cannot be negative — check discount value");
        }

        recalculated = { subtotal, totalAmount };
    }

    const updated = await prisma.bill.update({
        where: { id: billId },
        data:  { ...updateData, ...recalculated },
        include: BILL_INCLUDE,
    });

    return updated;
};

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL BILL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cancels an UNPAID or PARTIALLY_PAID bill.
 * PAID bills must go through the payment module's refund flow instead.
 *
 * @param {string} billId
 * @param {string} [reason]
 * @param {string} [cancelledBy]  - userId of the staff member cancelling
 */
export const cancelBill = async (billId, reason, cancelledBy) => {
    const existing = await prisma.bill.findUnique({
        where: { id: billId },
    });

    if (!existing) throw new Error("Bill not found");

    if (existing.status === "PAID") {
        throw new Error("Cannot cancel a paid bill — use the refund flow instead");
    }
    if (existing.status === "CANCELLED") {
        throw new Error("Bill is already cancelled");
    }
    if (existing.status === "REFUNDED") {
        throw new Error("Cannot cancel a refunded bill");
    }

    const appendedNotes = reason
        ? `${existing.notes ? existing.notes + "\n" : ""}Cancellation reason: ${reason}`.trim()
        : existing.notes;

    const cancelled = await prisma.bill.update({
        where: { id: billId },
        data:  { status: "CANCELLED", notes: appendedNotes },
        include: BILL_INCLUDE,
    });

    await prisma.auditLog.create({
        data: {
            userId: cancelledBy || existing.generatedBy,
            action: "UPDATE",
            description: `Bill ${existing.billNumber} cancelled. Reason: ${reason || "N/A"}`,
        },
    });

    return cancelled;
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE BILL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hard-deletes a bill. Only UNPAID or CANCELLED bills may be deleted.
 */
export const deleteBill = async (billId, deletedBy) => {
    const existing = await prisma.bill.findUnique({
        where: { id: billId },
    });

    if (!existing) throw new Error("Bill not found");

    if (!["UNPAID", "CANCELLED"].includes(existing.status)) {
        throw new Error(
            `Only UNPAID or CANCELLED bills can be deleted — current status is "${existing.status}"`
        );
    }

    await prisma.bill.delete({ where: { id: billId } });

    await prisma.auditLog.create({
        data: {
            userId: deletedBy || existing.generatedBy,
            action: "DELETE",
            description: `Bill ${existing.billNumber} (NPR ${existing.totalAmount}) deleted`,
        },
    });

    return { message: `Bill ${existing.billNumber} deleted successfully` };
};

// ─────────────────────────────────────────────────────────────────────────────
// BILLING SUMMARY  (admin dashboard stats)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aggregate billing statistics for a given date range.
 */
export const getBillSummary = async (filters = {}) => {
    const where = {};

    if (filters.fromDate || filters.toDate) {
        where.generatedAt = {};
        if (filters.fromDate) where.generatedAt.gte = new Date(filters.fromDate);
        if (filters.toDate)   where.generatedAt.lte = new Date(filters.toDate);
    }

    const [
        totalBills,
        totalAmountAgg,
        unpaidAgg,
        paidAgg,
        partiallyPaidCount,
        cancelledCount,
        refundedCount,
    ] = await Promise.all([
        prisma.bill.count({ where }),
        prisma.bill.aggregate({ where,                                  _sum: { totalAmount: true } }),   // aggregate functionused to calculate the total revenue from all bills in the specified date range.
        prisma.bill.aggregate({ where: { ...where, status: "UNPAID"        }, _sum: { totalAmount: true } }),  //this line calculates the total unpaid amount from all bills in the specified date range.
        prisma.bill.aggregate({ where: { ...where, status: "PAID"          }, _sum: { totalAmount: true } }),
        prisma.bill.count({    where: { ...where, status: "PARTIALLY_PAID" } }),
        prisma.bill.count({    where: { ...where, status: "CANCELLED"      } }),
        prisma.bill.count({    where: { ...where, status: "REFUNDED"       } }),
    ]);

    return {
        totalBills,
        totalRevenue:       totalAmountAgg._sum.totalAmount ?? 0,
        unpaidAmount:       unpaidAgg._sum.totalAmount      ?? 0,
        paidAmount:         paidAgg._sum.totalAmount        ?? 0,
        partiallyPaidCount,
        cancelledCount,
        refundedCount,
    };
};
