import prisma from '../../config/database.js'
import { MESSAGES } from '../../constans/messages.js'




// get dashboard  statistics\
export const getDashboardStatistics = async (filters={})=>{
    const {period, startDate, endDate, departmentId, doctorId} = filters;
    const whereClause = {};

    /// calculate data based on period 
    const dataRange = getDataRange(period, startDate, endDate);
    // get all statistics in parallel
    const [patientstats, doctorstats, appoinmentstats, departmentstats, revenuestats, billingstats, medicalRecordStats] = await Promise.all([
        getPatientStatistics(dataRange),
        getDoctorStatistics(dataRange),
        getAppointmentStatistics(dataRange, departmentId, doctorId),
        getDepartmentStatistics(dataRange),
        getRevenueStatistics(dataRange),
        getBillingStatistics(dataRange),
        getMedicalRecordStatistics(dataRange)
    ]);

    return {
        patientstats,
        doctorstats,
        appoinmentstats,
        departmentstats,
        revenuestats,
        billingstats,
        medicalRecordStats
    }


}


