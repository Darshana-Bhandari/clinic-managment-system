import prisma from '../../config/database.js';
import { ENV } from '../../config/env.js';

const CLINIC = {
  name: ENV.CLINIC_NAME || 'New Life Polyclinic & Hospital Pvt. Ltd.',
  address: ENV.CLINIC_ADDRESS || 'Pashupatinath, Kathmandu, Nepal',
  phone: ENV.CLINIC_PHONE || '+977-1-4400000',
  email: ENV.CLINIC_EMAIL || 'info@newlifepolyclinic.com',
  registration: ENV.CLINIC_REG_NO || 'Regd. No: 123456/071-072',
  pan: ENV.CLINIC_PAN || 'PAN: 123456789',
  logo: ENV.CLINIC_LOGO_URL || '',
};

const formatCurrency = (amount) => `NPR ${Number(amount || 0).toFixed(2)}`;

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-NP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const buildInvoiceData = async (bill) => {
  if (!bill) throw new Error('Bill is required for invoice generation');

  const patient = bill.patient || (await prisma.patient.findUnique({
    where: { id: bill.patientId },
    include: { user: { select: { fullName: true, email: true, phone: true } } },
  }));

  const payments = await prisma.payment.findMany({
    where: { billId: bill.id },
    orderBy: { paymentDate: 'asc' },
  });

  const doctor = bill.appointment?.doctor
    ? bill.appointment.doctor
    : await prisma.doctor.findFirst({
        where: { id: bill.appointment?.doctorId },
        include: { user: { select: { fullName: true } } },
      }).catch(() => null);

  const subtotal = Number(bill.subtotal || 0);
  const tax = Number(bill.tax || 0);
  const discount = Number(bill.discount || 0);
  const totalAmount = Number(bill.totalAmount || 0);
  const totalPaid = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((s, p) => s + Number(p.amount), 0);
  const balanceDue = Math.max(0, totalAmount - totalPaid);

  return {
    clinic: CLINIC,
    bill: {
      id: bill.id,
      billNumber: bill.billNumber,
      invoiceNumber: bill.invoiceNumber,
      date: formatDate(bill.generatedAt || bill.createdAt),
      dueDate: bill.dueDate ? formatDate(bill.dueDate) : formatDate(bill.generatedAt || bill.createdAt),
      status: bill.status,
      notes: bill.notes || '',
    },
    patient: {
      name: patient?.user?.fullName || patient?.name || 'Unknown Patient',
      email: patient?.user?.email || patient?.email || '-',
      phone: patient?.user?.phone || patient?.phone || '-',
      address: patient?.address || '-',
      patientCode: patient?.patientCode || patient?.id || bill.patientId,
    },
    doctor: doctor
      ? { name: doctor.user?.fullName || doctor.name || '-', department: doctor.department || '-' }
      : null,
    items: Array.isArray(bill.items)
      ? bill.items.map((item, i) => ({
          sn: i + 1,
          description: item.description || 'Item',
          quantity: Number(item.quantity || 1),
          unitPrice: Number(item.unitPrice || 0),
          discount: Number(item.discount || 0),
          total: Number(item.total || 0),
        }))
      : [],
    amounts: {
      subtotal,
      discount,
      tax,
      totalAmount,
    },
    payments: payments.map((p) => ({
      id: p.id,
      date: formatDate(p.paymentDate || p.createdAt),
      method: p.method,
      transactionId: p.transactionId || '-',
      status: p.status,
      amount: Number(p.amount || 0),
    })),
    totals: {
      subtotal,
      discount,
      tax,
      totalAmount,
      totalPaid,
      balanceDue,
    },
    generatedAt: new Date().toISOString(),
  };
};

export const generateInvoiceJSON = async (billId) => {
  const bill = await prisma.bill.findUnique({
    where: { id: billId },
    include: {
      patient: {
        include: { user: { select: { fullName: true, email: true, phone: true } } },
      },
      appointment: {
        include: {
          doctor: {
            include: { user: { select: { fullName: true } } },
          },
        },
      },
    },
  });
  if (!bill) throw new Error('Bill not found');
  return buildInvoiceData(bill);
};

export const generateInvoiceByInvoiceNumber = async (invoiceNumber) => {
  const bill = await prisma.bill.findUnique({
    where: { invoiceNumber },
    include: {
      patient: {
        include: { user: { select: { fullName: true, email: true, phone: true } } },
      },
      appointment: {
        include: { doctor: { include: { user: { select: { fullName: true } } } } },
      },
    },
  });
  if (!bill) throw new Error('Bill not found');
  return buildInvoiceData(bill);
};

export const renderInvoiceHTML = async (billId) => {
  const data = await generateInvoiceJSON(billId);

  const itemsRows = data.items
    .map(
      (i) => `
      <tr>
        <td style="text-align:center;padding:8px;border:1px solid #ddd">${i.sn}</td>
        <td style="padding:8px;border:1px solid #ddd">${i.description}</td>
        <td style="text-align:center;padding:8px;border:1px solid #ddd">${i.quantity}</td>
        <td style="text-align:right;padding:8px;border:1px solid #ddd">${formatCurrency(i.unitPrice)}</td>
        <td style="text-align:right;padding:8px;border:1px solid #ddd">${formatCurrency(i.discount)}</td>
        <td style="text-align:right;padding:8px;border:1px solid #ddd">${formatCurrency(i.total)}</td>
      </tr>`,
    )
    .join('');

  const paymentRows = data.payments.length
    ? data.payments
        .map(
          (p) => `
      <tr>
        <td style="padding:6px;border:1px solid #ddd">${p.date}</td>
        <td style="padding:6px;border:1px solid #ddd">${p.method}</td>
        <td style="padding:6px;border:1px solid #ddd">${p.transactionId}</td>
        <td style="padding:6px;border:1px solid #ddd">${p.status}</td>
        <td style="text-align:right;padding:6px;border:1px solid #ddd">${formatCurrency(p.amount)}</td>
      </tr>`,
        )
        .join('')
    : `<tr><td colspan="5" style="text-align:center;padding:12px;color:#666;border:1px solid #ddd">No payments recorded</td></tr>`;

  const doctorRow = data.doctor
    ? `<tr><td style="padding:4px 0"><strong>Doctor:</strong></td><td style="padding:4px 0">${data.doctor.name}${data.doctor.department ? ` (${data.doctor.department})` : ''}</td></tr>`
    : '';

  const statusBadgeColor =
    data.bill.status === 'PAID'
      ? '#15803d'
      : data.bill.status === 'PARTIALLY_PAID'
      ? '#a16207'
      : data.bill.status === 'REFUNDED'
      ? '#7c3aed'
      : data.bill.status === 'CANCELLED'
      ? '#991b1b'
      : '#b45309';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${data.bill.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #111; }
    .invoice { max-width: 850px; margin: 0 auto; }
    header { display:flex; justify-content: space-between; border-bottom: 2px solid #1e40af; padding-bottom:16px; margin-bottom:24px;}
    .clinic h1 { margin: 0; color: #1e3a8a; font-size: 22px; }
    .clinic p { margin: 2px 0; font-size: 13px; color: #334155; }
    .invoice-badge { text-align: right; }
    .badge {
      display:inline-block; padding:6px 14px; border-radius: 999px;
      color: white; font-weight: 700; font-size: 12px; letter-spacing: 0.5px;
      background: ${statusBadgeColor};
    }
    .meta { margin-top:6px; color:#475569; font-size:13px; }
    .section { display:flex; justify-content: space-between; margin-bottom: 24px; }
    .box { width: 48%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .box h3 { margin: 0 0 8px; font-size: 14px; color: #1e293b; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; }
    .box table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .box td { padding: 3px 0; color: #334155; }
    table.items, table.payments { width:100%; border-collapse: collapse; margin-bottom:16px; font-size: 13px; }
    table.items th, table.payments th { background:#1e40af; color:#fff; padding:10px 8px; text-align:left; font-weight:600; }
    table.items td, table.payments td { font-size:13px; }
    .summary { width: 320px; margin-left: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .summary td { padding: 8px 14px; font-size:13px; }
    .summary td:first-child { background:#f1f5f9; color:#475569; font-weight:500; }
    .summary td:last-child { text-align:right; color:#0f172a; }
    .total-row td { background:#1e40af !important; color:#fff !important; font-weight: 700 !important; font-size: 15px !important; }
    .due-row td { background:#fef2f2 !important; font-weight:700; }
    .notes { background: #fefce8; border-left: 4px solid #eab308; padding: 12px 16px; margin-top: 16px; border-radius: 4px; }
    footer { margin-top: 40px; border-top:1px solid #e2e8f0; padding-top: 16px; text-align:center; font-size: 12px; color: #64748b; }
    .signatures { display:flex; justify-content: space-between; margin-top: 48px; color: #475569; font-size: 13px;}
    .sig { width: 180px; border-top: 1px solid #64748b; padding-top: 6px; text-align: center; }
    @media print {
      body { padding: 0; }
      .invoice { max-width: 100%; }
      header { border-bottom: 2px solid #1e40af; }
      .no-print { display:none; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <header>
      <div class="clinic">
        <h1>${data.clinic.name}</h1>
        <p>${data.clinic.address}</p>
        <p>Phone: ${data.clinic.phone} | Email: ${data.clinic.email}</p>
        <p>${data.clinic.registration} | ${data.clinic.pan}</p>
      </div>
      <div class="invoice-badge">
        <div class="badge">${data.bill.status}</div>
        <div class="meta">
          <div><strong>Invoice No:</strong> ${data.bill.invoiceNumber}</div>
          <div><strong>Bill No:</strong> ${data.bill.billNumber}</div>
          <div><strong>Date:</strong> ${data.bill.date}</div>
        </div>
      </div>
    </header>

    <div class="section">
      <div class="box">
        <h3>Bill To (Patient)</h3>
        <table>
          <tr><td style="width:100px"><strong>Name:</strong></td><td>${data.patient.name}</td></tr>
          <tr><td><strong>Code:</strong></td><td>${data.patient.patientCode}</td></tr>
          <tr><td><strong>Phone:</strong></td><td>${data.patient.phone}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${data.patient.email}</td></tr>
          <tr><td><strong>Address:</strong></td><td>${data.patient.address}</td></tr>
        </table>
      </div>
      <div class="box">
        <h3>Details</h3>
        <table>
          <tr><td style="width:120px"><strong>Invoice Date:</strong></td><td>${data.bill.date}</td></tr>
          <tr><td><strong>Due Date:</strong></td><td>${data.bill.dueDate}</td></tr>
          ${doctorRow}
          <tr><td><strong>Status:</strong></td><td style="color:${statusBadgeColor};font-weight:600">${data.bill.status}</td></tr>
        </table>
      </div>
    </div>

    <h3 style="margin: 0 0 8px; color:#1e293b; font-size:15px">1. Items & Services</h3>
    <table class="items">
      <thead>
        <tr>
          <th style="width:40px;text-align:center">S.N.</th>
          <th>Description</th>
          <th style="width:80px;text-align:center">Qty</th>
          <th style="width:110px;text-align:right">Unit Price</th>
          <th style="width:110px;text-align:right">Discount</th>
          <th style="width:120px;text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <table class="summary">
      <tr><td>Subtotal</td><td>${formatCurrency(data.totals.subtotal)}</td></tr>
      <tr><td>Discount</td><td>- ${formatCurrency(data.totals.discount)}</td></tr>
      <tr><td>Tax</td><td>+ ${formatCurrency(data.totals.tax)}</td></tr>
      <tr class="total-row"><td>Grand Total</td><td>${formatCurrency(data.totals.totalAmount)}</td></tr>
      <tr><td>Total Paid</td><td>${formatCurrency(data.totals.totalPaid)}</td></tr>
      <tr class="due-row"><td>Balance Due</td><td>${formatCurrency(data.totals.balanceDue)}</td></tr>
    </table>

    <h3 style="margin: 24px 0 8px; color:#1e293b; font-size:15px">2. Payment History</h3>
    <table class="payments">
      <thead>
        <tr>
          <th>Date</th>
          <th>Method</th>
          <th>Transaction ID</th>
          <th>Status</th>
          <th style="text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${paymentRows}
      </tbody>
    </table>

    ${data.bill.notes ? `<div class="notes"><strong>Notes:</strong> ${data.bill.notes}</div>` : ''}

    <div class="signatures">
      <div class="sig">Patient / Receiver Signature</div>
      <div class="sig">Cashier / Receptionist</div>
      <div class="sig">Authorized Signatory</div>
    </div>

    <footer>
      Thank you for choosing ${data.clinic.name}. Please retain this invoice for records.
      <div style="margin-top:4px">Generated on ${new Date(data.generatedAt).toLocaleString()} | Invoice is electronically auto-generated.</div>
    </footer>

    <div class="no-print" style="margin-top: 24px; text-align:center">
      <button onclick="window.print()" style="padding:10px 20px;background:#1e40af;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">🖨️ Print / Save as PDF</button>
    </div>
  </div>
</body>
</html>`;
};

export const getInvoiceReceipt = async (paymentId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      bill: {
        include: {
          patient: {
            include: { user: { select: { fullName: true, email: true, phone: true } } },
          },
        },
      },
    },
  });
  if (!payment) throw new Error('Payment record not found');

  return {
    receiptNumber: `REC-${payment.id.slice(-8).toUpperCase()}`,
    date: formatDate(payment.paymentDate || payment.createdAt),
    patient: {
      name: payment.bill?.patient?.user?.fullName || 'N/A',
      phone: payment.bill?.patient?.user?.phone || 'N/A',
    },
    payment: {
      id: payment.id,
      method: payment.method,
      transactionId: payment.transactionId || '-',
      status: payment.status,
      amount: payment.amount,
      notes: payment.notes || '',
    },
    bill: {
      id: payment.billId,
      billNumber: payment.bill?.billNumber,
      invoiceNumber: payment.bill?.invoiceNumber,
      totalAmount: payment.bill?.totalAmount,
    },
    formattedAmount: formatCurrency(payment.amount),
  };
};

export default {
  generateInvoiceJSON,
  generateInvoiceByInvoiceNumber,
  renderInvoiceHTML,
  getInvoiceReceipt,
};