import prisma from '../../config/database.js';
import { ENV } from '../../config/env.js';
import {
  initiateKhaltiPayment as khaltiInitiate,
  verifyKhaltiPayment as khaltiVerify,
  validateKhaltiCallback,
  buildKhaltiCallbackData,
  formatKhaltiErrorForUser,
  KhaltiError,
} from '../../config/khalti.js';
import socketEmitter from '../../utils/socketEmitter.js';

const AMOUNT_TO_PAISA = 100;

const toPaisa = (rupees) => Math.round(Number(rupees) * AMOUNT_TO_PAISA);
const toRupees = (paisa) => Number(paisa) / AMOUNT_TO_PAISA;

const generateOrderId = (type, id) => `${type}_${id}_${Date.now()}`;

const getPatientFromReference = async (paymentType, referenceId) => {
  if (paymentType === 'APPOINTMENT') {
    const appointment = await prisma.appointment.findUnique({
      where: { id: referenceId },
      include: {
        patient: {
          include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
        },
      },
    });
    if (!appointment) throw new KhaltiError('Appointment not found', 'REF_NOT_FOUND', { paymentType, referenceId });
    return { patient: appointment.patient, amount: appointment.consultationFee || 0, purchaseName: `Appointment - Dr. Consultation (${appointment.date})` };
  }

  if (paymentType === 'BILL') {
    const bill = await prisma.bill.findUnique({
      where: { id: referenceId },
      include: {
        patient: {
          include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
        },
      },
    });
    if (!bill) throw new KhaltiError('Bill not found', 'REF_NOT_FOUND', { paymentType, referenceId });
    if (bill.status === 'PAID') throw new KhaltiError('Bill is already paid', 'BILL_ALREADY_PAID', { billId: referenceId });
    if (bill.status === 'CANCELLED') throw new KhaltiError('Bill is cancelled', 'BILL_CANCELLED', { billId: referenceId });
    return { patient: bill.patient, amount: bill.totalAmount, purchaseName: `Bill #${bill.id}` };
  }

  throw new KhaltiError('Invalid payment type. Must be APPOINTMENT or BILL', 'INVALID_PAYMENT_TYPE', { paymentType });
};

export const initiateKhalti = async (payload, currentUser) => {
  const { paymentType, referenceId, amountOverride, customerName, customerEmail, customerPhone } = payload;

  if (!paymentType || !referenceId) {
    throw new KhaltiError('paymentType and referenceId are required', 'INVALID_PAYLOAD');
  }

  const { patient, amount: referenceAmount, purchaseName } = await getPatientFromReference(paymentType, referenceId);
  if (!patient) throw new KhaltiError('Patient not found for reference', 'PATIENT_NOT_FOUND');

  const amountNPR = Number(amountOverride) > 0 ? Number(amountOverride) : referenceAmount;
  if (!amountNPR || amountNPR <= 0) {
    throw new KhaltiError('Payment amount must be greater than zero', 'INVALID_AMOUNT');
  }

  if (currentUser && currentUser.role === 'PATIENT' && patient.userId !== currentUser.id) {
    throw new KhaltiError('You are not authorized to pay for this record', 'UNAUTHORIZED');
  }

  const purchaseOrderId = generateOrderId(paymentType, referenceId);

  const paymentRecord = await prisma.payment.create({
    data: {
      billId: paymentType === 'BILL' ? referenceId : null,
      appointmentId: paymentType === 'APPOINTMENT' ? referenceId : null,
      amount: amountNPR,
      method: 'KHALTI',
      status: 'PENDING',
      notes: `${paymentType} payment via Khalti - order ${purchaseOrderId}`,
      transactionId: purchaseOrderId,
      processedBy: patient.userId,
    },
  });

  try {
    const customerInfo = {
      name: customerName || patient.user?.fullName || 'Patient',
      email: customerEmail || patient.user?.email || undefined,
      phone: customerPhone || patient.user?.phone || undefined,
    };

    const khaltiResult = await khaltiInitiate({
      amount: toPaisa(amountNPR),
      purchase_order_id: purchaseOrderId,
      purchase_order_name: purchaseName,
      return_url: ENV.KHALTI_RETURN_URL || `${ENV.FRONTEND_URL}/payment/callback/khalti`,
      website_url: ENV.KHALTI_WEBSITE_URL || ENV.FRONTEND_URL,
      customer_info: customerInfo,
    });

    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        transactionId: khaltiResult.pidx,
        notes: `${paymentType} payment via Khalti - PIDX: ${khaltiResult.pidx}`,
      },
    });

    return {
      success: true,
      paymentId: paymentRecord.id,
      pidx: khaltiResult.pidx,
      payment_url: khaltiResult.payment_url,
      amount: amountNPR,
      amount_paisa: toPaisa(amountNPR),
      purchase_order_id: purchaseOrderId,
      expires_at: khaltiResult.expires_at,
      expires_in_seconds: khaltiResult.expires_in_seconds,
    };
  } catch (error) {
    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        status: 'FAILED',
        notes: `Khalti initiate failed: ${error.message}`,
      },
    });
    throw error;
  }
};

const syncBillAfterPayment = async (billId, paymentRecord) => {
  if (!billId) return null;

  const bill = await prisma.bill.findUnique({
    where: { id: billId },
    include: { payments: true },
  });
  if (!bill) return null;

  const totalPaid = bill.payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  let status = bill.status;
  if (totalPaid >= bill.totalAmount) status = 'PAID';
  else if (totalPaid > 0) status = 'PARTIALLY_PAID';
  else status = 'UNPAID';

  return prisma.bill.update({
    where: { id: billId },
    data: {
      status,
      paymentDate: status === 'PAID' ? new Date() : bill.paymentDate,
      paymentMethod: 'KHALTI',
    },
  });
};

const confirmAppointmentAfterPayment = async (appointmentId) => {
  if (!appointmentId) return null;
  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CONFIRMED' },
  });
};

export const verifyKhalti = async (payload) => {
  const { pidx } = payload;

  if (!pidx) {
    throw new KhaltiError('pidx is required for verification', 'MISSING_PIDX');
  }

  const paymentRecord = await prisma.payment.findFirst({
    where: {
      OR: [{ transactionId: pidx }, { notes: { contains: pidx } }],
    },
    include: {
      bill: {
        include: {
          patient: {
            include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
          },
        },
      },
      appointment: {
        include: {
          doctor: { include: { user: { select: { id: true, fullName: true } } } },
          patient: {
            include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
          },
        },
      },
    },
  });

  if (!paymentRecord) {
    throw new KhaltiError('Payment record not found for this pidx', 'PAYMENT_NOT_FOUND', { pidx });
  }

  if (paymentRecord.status === 'COMPLETED') {
    return {
      success: true,
      alreadyCompleted: true,
      message: 'Payment already completed and verified',
      paymentId: paymentRecord.id,
      amount: paymentRecord.amount,
      status: paymentRecord.status,
      pidx,
    };
  }

  const verification = await khaltiVerify(pidx);

  let paymentStatus = 'FAILED';
  let message = 'Payment verification failed';

  if (verification.payment_completed) {
    paymentStatus = 'COMPLETED';
    message = 'Payment verified successfully';
  } else if (verification.status === 'Pending' || verification.status === 'PENDING') {
    paymentStatus = 'PENDING';
    message = 'Payment is pending';
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: paymentRecord.id },
    data: {
      status: paymentStatus,
      notes: `Khalti verification status: ${verification.status || 'unknown'}. TXN: ${verification.transaction_id || pidx}`,
      ...(paymentStatus === 'COMPLETED' ? { paymentDate: new Date() } : {}),
    },
    include: {
      bill: {
        include: {
          patient: { include: { user: { select: { fullName: true, email: true } } } },
        },
      },
      appointment: true,
    },
  });

  if (paymentStatus === 'COMPLETED') {
    await syncBillAfterPayment(paymentRecord.billId, updatedPayment);
    if (paymentRecord.appointmentId) {
      await confirmAppointmentAfterPayment(paymentRecord.appointmentId);
    }

    await socketEmitter.emitPaymentReceived(updatedPayment);
  } else if (paymentStatus === 'FAILED') {
    await socketEmitter.emitPaymentFailed(
      paymentRecord.billId,
      paymentRecord.amount,
      'KHALTI',
      verification.status || 'Verification failed'
    );
  }

  return {
    success: paymentStatus === 'COMPLETED',
    paymentStatus,
    message,
    paymentId: updatedPayment.id,
    amount: updatedPayment.amount,
    pidx: verification.pidx,
    transaction_id: verification.transaction_id,
    khalti_status: verification.status,
    bill_id: updatedPayment.billId,
    appointment_id: updatedPayment.appointmentId,
  };
};

export const handleKhaltiCallback = async (queryParams, bodyParams) => {
  const callbackData = buildKhaltiCallbackData(queryParams, bodyParams);
  const { pidx, amount } = callbackData;
  const expectedAmount = amount ? toRupees(amount) : undefined;

  try {
    const verification = await validateKhaltiCallback(callbackData, {
      amount: expectedAmount,
    });

    const verifyResult = await verifyKhalti({ pidx });

    return {
      success: true,
      ...verifyResult,
      redirect_url: `${ENV.FRONTEND_URL}/payment/success?pidx=${pidx}&paymentId=${verifyResult.paymentId}`,
    };
  } catch (error) {
    const userMessage = formatKhaltiErrorForUser(error);
    return {
      success: false,
      error: error.message,
      error_code: error.code || 'CALLBACK_ERROR',
      user_message: userMessage,
      redirect_url: `${ENV.FRONTEND_URL}/payment/failed?reason=${encodeURIComponent(userMessage)}`,
    };
  }
};

export const getKhaltiPaymentStatus = async (pidx) => {
  const payment = await prisma.payment.findFirst({
    where: {
      OR: [{ transactionId: pidx }, { notes: { contains: pidx } }],
    },
    include: {
      bill: { select: { id: true, status: true, totalAmount: true } },
      appointment: { select: { id: true, status: true } },
    },
  });

  if (!payment) {
    return {
      success: false,
      error: 'Payment record not found',
      pidx,
    };
  }

  let khalti = null;
  try {
    khalti = await khaltiVerify(pidx);
  } catch (err) {
    khalti = { error: err.message };
  }

  return {
    success: true,
    paymentId: payment.id,
    status: payment.status,
    amount: payment.amount,
    method: payment.method,
    bill: payment.bill,
    appointment: payment.appointment,
    khalti_status: khalti?.status,
    payment_completed: khalti?.payment_completed ?? (payment.status === 'COMPLETED'),
  };
};

export default {
  initiateKhalti,
  verifyKhalti,
  handleKhaltiCallback,
  getKhaltiPaymentStatus,
};