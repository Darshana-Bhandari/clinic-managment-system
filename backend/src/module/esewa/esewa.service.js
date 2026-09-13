import prisma from '../../config/database.js';
import { ENV } from '../../config/env.js';
import { esewa } from '../../config/esewa.js';
import socketEmitter from '../../utils/socketEmitter.js';

const generateTransactionUuid = () =>
  `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const getReferenceFromPayment = async (paymentType, referenceId) => {
  if (paymentType === 'APPOINTMENT') {
    const appointment = await prisma.appointment.findUnique({
      where: { id: referenceId },
      include: {
        doctor: {
          select: { consultationFee: true },
        },
        patient: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, phone: true },
            },
          },
        },
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    return {
      reference: appointment,
      patient: appointment.patient,
      amount: Number(appointment.doctor?.consultationFee || 0),
      purchaseName: `Appointment - ${appointment.id}`,
    };
  }

  if (paymentType === 'BILL') {
    const bill = await prisma.bill.findUnique({
      where: { id: referenceId },
      include: {
        patient: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, phone: true },
            },
          },
        },
      },
    });

    if (!bill) {
      throw new Error('Bill not found');
    }

    if (bill.status === 'PAID') {
      throw new Error('Bill is already paid');
    }

    if (bill.status === 'CANCELLED') {
      throw new Error('Bill is cancelled');
    }

    if (bill.status === 'REFUNDED') {
      throw new Error('Bill is refunded');
    }

    return {
      reference: bill,
      patient: bill.patient,
      amount: Number(bill.totalAmount || 0),
      purchaseName: `Bill #${bill.billNumber}`,
    };
  }

  throw new Error('Invalid payment type. Must be APPOINTMENT or BILL');
};

const syncBillAfterPayment = async (billId) => {
  if (!billId) return null;

  const bill = await prisma.bill.findUnique({
    where: { id: billId },
    include: { payments: true },
  });

  if (!bill) return null;

  const totalPaid = bill.payments
    .filter((payment) => payment.status === 'COMPLETED')
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  let nextStatus = bill.status;

  if (totalPaid >= bill.totalAmount) {
    nextStatus = 'PAID';
  } else if (totalPaid > 0) {
    nextStatus = 'PARTIALLY_PAID';
  }

  return prisma.bill.update({
    where: { id: billId },
    data: {
      status: nextStatus,
      paymentDate: nextStatus === 'PAID' ? new Date() : bill.paymentDate,
      paymentMethod: 'ESEWA',
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

const isValidEsewaVerification = (verification) => {
  const status = String(verification?.status || '').toUpperCase();

  return (
    status === 'COMPLETE' ||
    status === 'COMPLETED' ||
    status === 'SUCCESS' ||
    status === 'SUCCESSFUL' ||
    status === 'PAID' ||
    verification?.transaction_code === '00'
  );
};

export const initiateEsewaPayment = async (payload, currentUser) => {
  const { paymentType, referenceId, amountOverride, customerName, customerEmail, customerPhone } = payload;

  if (!paymentType || !referenceId) {
    throw new Error('paymentType and referenceId are required');
  }

  const { patient, amount: referenceAmount, purchaseName } = await getReferenceFromPayment(paymentType, referenceId);

  if (!patient) {
    throw new Error('Patient not found for this payment reference');
  }

  const amountNpr = Number(amountOverride) > 0 ? Number(amountOverride) : referenceAmount;

  if (!amountNpr || amountNpr <= 0) {
    throw new Error('Payment amount must be greater than zero');
  }

  if (currentUser && currentUser.role === 'PATIENT' && patient.userId !== currentUser.id) {
    throw new Error('You are not authorized to pay for this record');
  }

  const transactionUuid = generateTransactionUuid();

  const paymentRecord = await prisma.payment.create({
    data: {
      billId: paymentType === 'BILL' ? referenceId : null,
      appointmentId: paymentType === 'APPOINTMENT' ? referenceId : null,
      amount: amountNpr,
      method: 'ESEWA',
      status: 'PENDING',
      notes: `${paymentType} payment via eSewa - order ${transactionUuid}`,
      transactionId: transactionUuid,
      processedBy: patient.userId,
    },
  });

  try {
    const paymentUrl = await esewa.initiatePayment({
      amount: String(amountNpr),
      total_amount: String(amountNpr),
      transaction_uuid: transactionUuid,
    });

    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        notes: `${paymentType} payment via eSewa - order ${transactionUuid} | payment_url=${paymentUrl}`,
      },
    });

    return {
      success: true,
      paymentId: paymentRecord.id,
      transaction_uuid: transactionUuid,
      payment_url: paymentUrl,
      amount: amountNpr,
      purchase_name: purchaseName,
      customer: {
        name: customerName || patient.user?.fullName || 'Patient',
        email: customerEmail || patient.user?.email || undefined,
        phone: customerPhone || patient.user?.phone || undefined,
      },
      status: 'PENDING',
    };
  } catch (error) {
    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        status: 'FAILED',
        notes: `eSewa initiation failed: ${error.message}`,
      },
    });

    throw error;
  }
};

export const verifyEsewaPayment = async (payload = {}) => {
  const { data, transaction_uuid, amount } = payload;

  if (!data && !transaction_uuid) {
    throw new Error('data or transaction_uuid is required for verification');
  }

  const verification = data ? await esewa.verifyPayment(String(data)) : null;

  const transactionUuid = verification?.transaction_uuid || transaction_uuid;

  if (!transactionUuid) {
    throw new Error('Unable to determine transaction_uuid from eSewa callback');
  }

  const paymentRecord = await prisma.payment.findFirst({
    where: {
      OR: [{ transactionId: transactionUuid }, { notes: { contains: transactionUuid } }],
    },
    include: {
      bill: {
        include: {
          patient: {
            include: {
              user: { select: { id: true, fullName: true, email: true, phone: true } },
            },
          },
        },
      },
      appointment: {
        include: {
          doctor: { include: { user: { select: { id: true, fullName: true } } } },
          patient: {
            include: {
              user: { select: { id: true, fullName: true, email: true, phone: true } },
            },
          },
        },
      },
    },
  });

  if (!paymentRecord) {
    throw new Error('Payment record not found for this eSewa transaction');
  }

  if (paymentRecord.status === 'COMPLETED') {
    return {
      success: true,
      alreadyCompleted: true,
      message: 'Payment already completed and verified',
      paymentId: paymentRecord.id,
      status: paymentRecord.status,
      transaction_uuid: transactionUuid,
    };
  }

  const isVerified = isValidEsewaVerification(verification);

  const updatedPayment = await prisma.payment.update({
    where: { id: paymentRecord.id },
    data: {
      status: isVerified ? 'COMPLETED' : 'FAILED',
      paymentDate: isVerified ? new Date() : paymentRecord.paymentDate,
      notes: `eSewa verification status: ${verification?.status || 'unknown'} | txn=${transactionUuid}`,
    },
    include: {
      bill: true,
      appointment: true,
    },
  });

  if (isVerified) {
    await syncBillAfterPayment(paymentRecord.billId);

    if (paymentRecord.appointmentId) {
      await confirmAppointmentAfterPayment(paymentRecord.appointmentId);
    }

    await socketEmitter.emitPaymentReceived(updatedPayment);

    return {
      success: true,
      paymentId: updatedPayment.id,
      status: updatedPayment.status,
      message: 'Payment verified successfully',
      transaction_uuid: transactionUuid,
      amount: updatedPayment.amount,
    };
  }

  await socketEmitter.emitPaymentFailed(updatedPayment, {
    provider: 'ESEWA',
    message: verification?.status || 'Verification failed',
  });

  return {
    success: false,
    paymentId: updatedPayment.id,
    status: updatedPayment.status,
    message: verification?.status || 'Payment verification failed',
    transaction_uuid: transactionUuid,
    amount: updatedPayment.amount,
  };
};

export const getEsewaPaymentStatus = async (transactionUuid, totalAmount) => {
  const result = await esewa.getTransactionStatus(transactionUuid, String(totalAmount || 0));

  return {
    success: true,
    transaction_uuid: transactionUuid,
    status: result?.status,
    total_amount: result?.total_amount,
    ref_id: result?.ref_id,
  };
};

export const isEsewaConfigured = () =>
  Boolean(ENV.ESEWA_SECRET_KEY && ENV.ESEWA_PRODUCT_CODE && ENV.ESEWA_SUCCESS_URL && ENV.ESEWA_FAILURE_URL);