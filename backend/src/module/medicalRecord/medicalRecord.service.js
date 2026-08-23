import prisma from "../../config/database.js"


//  create medical record  for daignosis 
export const createMedicalRecord = async (recordData) =>{
    const {patientId,doctorId,appointmentId, ...data} = recordData;
    const patient = await prisma.patient.findUnique({where:{id:patientId}})
    if(!patient){
        throw new Error("patient not found")
    }
    //docotor
    const doctor = await prisma.doctor.findUnique({
        where:{id:doctorId}
    })
    if(!doctor){
         throw new Error("doctor not found")
    }
    // apppointment
    if(appointmentId) {
        const appointment = await prisma.appointment.findUnique({
            where:{id:appointmentId}
        })
        if(!appointment){
            throw new Error("appointment not found")
        }
    }
    
    return await prisma.medicalRecord.create({
        data: {
            patientId,
            doctorId,
            appointmentId: appointmentId || undefined,
            symptoms: data.symptoms || [],
            ...data
        }
    });
}

// get all medical records
export const getAllMedicalRecords = async (page = 1, limit = 10, filters = {}) => {
  const skip = (page - 1) * limit;
  const where = {};

  if (filters.patientId) where.patientId = filters.patientId;
  if (filters.doctorId) where.doctorId = filters.doctorId;
  if (filters.fromDate) where.diagnosisDate = { gte: new Date(filters.fromDate) };
  if (filters.toDate) where.diagnosisDate = { ...where.diagnosisDate, lte: new Date(filters.toDate) };
  if (filters.search) {
    where.OR = [
      { diagnosis: { contains: filters.search } },
      { notes: { contains: filters.search } },
      { patient: { user: { fullName: { contains: filters.search } } } },
    ];
  }

  const [records, total] = await Promise.all([
    prisma.medicalRecord.findMany({
      where,
      include: {
        patient: {
          include: {
            user: { select: { fullName: true, email: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { fullName: true, email: true } },
          },
        },
        prescriptions: {
          where: { status: 'ACTIVE' },
        },
        reports: {
          where: { status: 'PENDING' },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.medicalRecord.count({ where }),
  ]);

  return {
    records,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// get meidcal record by id
export const getMedicalRecordById = async (id) =>{
    const record = await prisma.medicalRecord.findUnique({
        where:{id},
        include:{
            patient:true,
            doctor:true,
            appointment:true,
            prescriptions:true,
            reports:true
        }
    })
    if(!record){
        throw new Error("medical record not found")
    }
    return record
}

// update medical record by id
export const updateMedicalRecordById = async (id,updateData) =>{
    const record = await prisma.medicalRecord.update({
        where:{id},
        data:updateData
    })
    if(!record){
        throw new Error("medical record not found")
    }
    return record
}

// delete medical record by id
export const deleteMedicalRecordById = async (id) =>{
    const record = await prisma.medicalRecord.delete({
        where:{id}
    })
    if(!record){
        throw new Error("medical record not found")
    }
    return record   
        }

// Get patient history
export const getPatientHistory = async (patientId) => {
    const records = await prisma.medicalRecord.findMany({
        where: { patientId },
        include: {
            doctor: true,
            appointment: true,
            prescriptions: true,
            reports: true,
        },
    });

    if (!records || records.length === 0) {
        throw new Error("No medical records found for this patient");
    }

    return records;
};


//  create prescription servuce
export const createPrescription = async (prescriptionData) =>{
    const {medicalRecordId, ...data} = prescriptionData;
    const record = await prisma.medicalRecord.findUnique(
        {where :{id:medicalRecordId}}
    )
    if(!record ){
    throw new Error("medical record not found")
    }
    return await prisma.prescription.create({
        data:{
            medicalRecordId,
            ...data,
        },
        include:{
            medicalRecord:{
                include:{
                    patient:{
                        user:{
                            select:{fullName:true}
                        },
                    
                }},
                doctor:{
                    include:{
                        user:{
                            select:{fullName:true}
                        }

                    }
                }

            }


        }
    })

}


// get prescription by id 
export const getPrescriptionById = async(prescriptionId)=>{
    const prescription = await prisma.prescription.findUnique({
        where:{id:prescriptionId},
        include:{
            medicalRecord:{
                include:{
                    patient:{
                        user:{select:{fullName:true, email:true}}
                    }
                },
                doctor:{
                    include:{
                        user:{select:{fullName:true}}
                    }

                }
            }
        }
    })

    if(!prescription){
        throw new Error("prescription not found ")}
    return prescription

}


// update prescription 
export const updatePrescription = async (prescriptionId, updateData) =>{
    const existing = await prisma.prescription.findUnique({
        where:{id:prescriptionId}
    })
    if(!existing){
        throw new Error("prescription not found")
    }
    return await prisma.prescription.update({
        where:{id:prescriptionId},
        data:updateData,
        include:{
            medicalRecord:{
                include:{
                    patient:{
                        include:{
                            user:{select:{fullName:true}}
                        }
                    }
                }
            }
        }
    })
}


// delete prescription 
export const prescriptiondelete = async (prescriptionId) =>{
    const prescription = await prisma.prescription.findUnique({
        where:{id:prescriptionId}
    })
    if(!prescription)
        throw new Error("Prescription not found")

    await prisma.prescription.delete({
        where:{id:prescriptionId}
    })
    return {message:"prescription deleted successfully"}
}



// reports create
export const createReport = async(reportData) =>{
    const {medicalRecordId, ...data} = reportData;
    const record = await prisma.report.create({
        data:{
            medicalRecordId,
            ...data,
            date:data.date || new Date()
        },
        include:{
            medicalRecord:{
                include:{
                    patient:{
                        include:{
                            user:{
                                select:{fullName:true}
                            }
                        }
                    }
                }
            }

        }
    })
    return record;
}

// get reports by id 
export const getReportById = async(reportId) => {
    const report = await prisma.report.findUnique({
        where: { id: reportId },
        include: {
            medicalRecord: {
                include: {
                    patient: { include: { user: { select: { fullName: true } } } },
                    doctor: { include: { user: { select: { fullName: true } } } }
                }
            }
        }
    });
    if(!report) throw new Error("Report not found");
    return report;
}

///update reports
export const updateReport = async(reportId, updateData) => {
    const existing = await prisma.report.findUnique({ where: { id: reportId } });
    if(!existing) throw new Error("Report not found");
    
    return await prisma.report.update({
        where: { id: reportId },
        data: updateData
    });
}

//delete reports
export const deleteReport = async(reportId) => {
    const existing = await prisma.report.findUnique({ where: { id: reportId } });
    if(!existing) throw new Error("Report not found");
    
    await prisma.report.delete({ where: { id: reportId } });
    return { message: "Report deleted successfully" };
}


//get patientmedical history
export const getPatientMedicalHistory = async(patientId,page=1,limit=10) =>{
    const skip = (page-1)*limit
    const [records,total] = await Promise.all([
        prisma.medicalRecord.findMany({
            where:{patientId},
            include:{
                doctor:{
                    include:{
                        user:{select:{fullName:true}}
                    }
                },
                prescriptions:{
                    where:{status:"ACTIVE"}

                },
                reports:{
                    where:{status:{in:['PENDING','COMPLETED']}}
                }
            },
            skip,
            take:limit,
            orderBy:{diagnosisDate:"desc"}
        }),
        prisma.medicalRecord.count({where:{patientId}})
    ])
    return {records,pagination:{page,limit,total,
        totalPages:Math.ceil(total/limit)
    }}
}