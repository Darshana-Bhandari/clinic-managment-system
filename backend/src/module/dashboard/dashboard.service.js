import prisma from '../../config/database.js';

// ==================== DATE RANGE HELPER ====================
const getDateRange = (period, startDate, endDate) => {
  let start, end;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else {
    end = new Date();
    end.setHours(23, 59, 59, 999);
    start = new Date();

    if (period === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      start.setDate(start.getDate() - 7);
    } else if (period === 'month') {
      start.setMonth(start.getMonth() - 1);
    } else if (period === 'year') {
      start.setFullYear(start.getFullYear() - 1);
    } else {
      // Default: last 30 days
      start.setDate(start.getDate() - 30);
    }
  }

  return { start, end };
};

// ==================== INDIVIDUAL STAT FETCHERS ====================

const getPatientStatistics = async ({ start, end }) => {
  const [total, newInPeriod] = await Promise.all([
    prisma.patient.count(),
    prisma.patient.count({ where: { createdAt: { gte: start, lte: end } } }),
  ]);
  return { total, newInPeriod };
};

const getDoctorStatistics = async ({ start, end }) => {
  const [total, newInPeriod] = await Promise.all([
    prisma.doctor.count(),
    prisma.doctor.count({ where: { createdAt: { gte: start, lte: end } } }),
  ]);
  return { total, newInPeriod };
};

const getAppointmentStatistics = async ({ start, end }, doctorId) => {
  const baseWhere = { date: { gte: start, lte: end } };
  if (doctorId) baseWhere.doctorId = doctorId;

  const [total, completed, cancelled, scheduled, noShow] = await Promise.all([
    prisma.appointment.count({ where: baseWhere }),
    prisma.appointment.count({ where: { ...baseWhere, status: 'COMPLETED' } }),
    prisma.appointment.count({ where: { ...baseWhere, status: 'CANCELLED' } }),
    prisma.appointment.count({ where: { ...baseWhere, status: 'SCHEDULED' } }),
    prisma.appointment.count({ where: { ...baseWhere, status: 'NO_SHOW' } }),
  ]);

  return { total, completed, cancelled, scheduled, noShow };
};

const getDepartmentStatistics = async () => {
  const [total, active] = await Promise.all([
    prisma.department.count(),
    prisma.department.count({ where: { isActive: true } }),
  ]);
  return { total, active };
};

const getRevenueStatistics = async ({ start, end }) => {
  const [paidResult, totalResult, pendingCount] = await Promise.all([
    prisma.bill.aggregate({
      where: { generatedAt: { gte: start, lte: end }, status: 'PAID' },
      _sum: { totalAmount: true },
    }),
    prisma.bill.aggregate({
      where: { generatedAt: { gte: start, lte: end } },
      _sum: { totalAmount: true },
    }),
    prisma.bill.count({ where: { generatedAt: { gte: start, lte: end }, status: 'UNPAID' } }),
  ]);

  return {
    totalRevenue: paidResult._sum.totalAmount || 0,
    totalBilled: totalResult._sum.totalAmount || 0,
    pendingPayments: pendingCount,
  };
};

const getBillingStatistics = async ({ start, end }) => {
  const where = { generatedAt: { gte: start, lte: end } };
  const [totalBills, paidBills, unpaidBills, cancelledBills, partialBills] = await Promise.all([
    prisma.bill.count({ where }),
    prisma.bill.count({ where: { ...where, status: 'PAID' } }),
    prisma.bill.count({ where: { ...where, status: 'UNPAID' } }),
    prisma.bill.count({ where: { ...where, status: 'CANCELLED' } }),
    prisma.bill.count({ where: { ...where, status: 'PARTIALLY_PAID' } }),
  ]);
  return { totalBills, paidBills, unpaidBills, cancelledBills, partialBills };
};

const getMedicalRecordStatistics = async ({ start, end }) => {
  return prisma.medicalRecord.count({ where: { createdAt: { gte: start, lte: end } } });
};

// ==================== MAIN DASHBOARD STATISTICS ====================

export const getDashboardStatistics = async (filters = {}) => {
  const { period, startDate, endDate, doctorId } = filters;
  const dateRange = getDateRange(period, startDate, endDate);

  const [patientStats, doctorStats, appointmentStats, departmentStats, revenueStats, billingStats, medicalRecordCount] =
    await Promise.all([
      getPatientStatistics(dateRange),
      getDoctorStatistics(dateRange),
      getAppointmentStatistics(dateRange, doctorId),
      getDepartmentStatistics(),
      getRevenueStatistics(dateRange),
      getBillingStatistics(dateRange),
      getMedicalRecordStatistics(dateRange),
    ]);

  return {
    period: period || 'last30days',
    dateRange: { start: dateRange.start, end: dateRange.end },
    patients: patientStats,
    doctors: doctorStats,
    appointments: appointmentStats,
    departments: departmentStats,
    revenue: revenueStats,
    billing: billingStats,
    medicalRecords: { count: medicalRecordCount },
  };
};

// ==================== DAILY SUMMARY ====================

export const getDailySummary = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    appointmentsToday,
    completedToday,
    revenueToday,
    newPatientsToday,
    noShowsToday,
  ] = await Promise.all([
    prisma.appointment.count({ where: { date: { gte: todayStart, lte: todayEnd } } }),
    prisma.appointment.count({ where: { date: { gte: todayStart, lte: todayEnd }, status: 'COMPLETED' } }),
    prisma.bill.aggregate({
      where: { generatedAt: { gte: todayStart, lte: todayEnd }, status: 'PAID' },
      _sum: { totalAmount: true },
    }),
    prisma.patient.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.appointment.count({ where: { date: { gte: todayStart, lte: todayEnd }, status: 'NO_SHOW' } }),
  ]);

  return {
    date: todayStart.toISOString().split('T')[0],
    appointmentsToday,
    completedToday,
    revenueToday: revenueToday._sum.totalAmount || 0,
    newPatientsToday,
    noShowsToday,
  };
};

// ==================== REVENUE REPORT ====================

export const getRevenueReport = async (from, to) => {
  const start = from ? new Date(from) : (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d; })();
  const end = to ? new Date(to) : new Date();

  const bills = await prisma.bill.findMany({
    where: { generatedAt: { gte: start, lte: end }, status: { in: ['PAID', 'PARTIALLY_PAID'] } },
    select: { billNumber: true, totalAmount: true, status: true, paymentMethod: true, generatedAt: true },
    orderBy: { generatedAt: 'asc' },
  });

  const totalRevenue = bills.reduce((sum, b) => sum + b.totalAmount, 0);

  const byMethod = bills.reduce((acc, b) => {
    const method = b.paymentMethod || 'CASH';
    acc[method] = (acc[method] || 0) + b.totalAmount;
    return acc;
  }, {});

  return {
    from: start,
    to: end,
    totalRevenue,
    billCount: bills.length,
    byPaymentMethod: byMethod,
    bills,
  };
};

// ==================== DOCTOR LOAD ====================

export const getDoctorLoad = async (from, to) => {
  const start = from ? new Date(from) : (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d; })();
  const end = to ? new Date(to) : new Date();

  const appointments = await prisma.appointment.groupBy({
    by: ['doctorId'],
    where: { date: { gte: start, lte: end } },
    _count: { id: true },
  });

  // Enrich with doctor info
  const doctorIds = appointments.map((a) => a.doctorId);
  const doctors = await prisma.doctor.findMany({
    where: { id: { in: doctorIds } },
    include: { user: { select: { fullName: true } } },
  });

  const doctorMap = Object.fromEntries(doctors.map((d) => [d.id, d]));

  return appointments.map((a) => ({
    doctorId: a.doctorId,
    doctorName: doctorMap[a.doctorId]?.user?.fullName || 'Unknown',
    specialization: doctorMap[a.doctorId]?.specialization || 'N/A',
    appointmentCount: a._count.id,
  }));
};