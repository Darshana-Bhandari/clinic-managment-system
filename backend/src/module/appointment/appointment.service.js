

// book appointment
export const bookAppointment = async () =>{
    const {patientId,doctorId, date,time ,...data} = appointmentData;

    // check if patient exists 
    const patient = await prisma.patient.findUnique ({
        where:{
            id:patientId
        },
        include:{
            user:{
                select:{
                    fullName:true,
                    email:true
                }
            }

        }

    })

    if(!patient){
        throw new Error("Paitent not found ")
    }

    /// check if doctor exists
     const doctor = await prisma.doctor.findUnique({
        where:{id:doctorId},
        include:{
            user:{
                select:{
                    fullName:true
                }
                
            }
        }
     })


     if(!doctor){
        throw new Error("Docotr not found")
     }

     // check if doctor is available on that day
     const appointmentDate = new Date(date)
     const dayofWeek = appointmentDate.toLocaleDateString("en-Us",{weekday:'long'})


     const availableDays = doctor.availableDays || []

     const isAvailable = availableDays.some(day => day.day === dayofWeek)


     if(!isAvailable){
        throw new Error(`doctor is not availabe on ${dayofWeek}`)

     }

     // check if time  slot is availabe 
     const existingAppointment = await prisma.appointment.findFirst({
        where:{
            doctorId,
            date:appointmentDate,
            time,
            status:{
                in:['SCHEDULED','CONFIRMED']
            }
        }

     })

     if (existingAppointment){
        throw new Error("This time slot is already booked ")
     }


     // check if patient has conflicting 
     const patientConflict = await prisma.appointment.findFirst({
        where:{
            parentId,
            date:appointmentDate,
            time,
            status:{
                in:['SCHEDULED','CONFIRMED']
            }
            
        }
     })
      if (patientConflict){
        throw new Error("already haved an appointment in this time")
      } 


      /// create appointment
      const appointment = await prisma.appointment.create({
        data:{
            parentId,doctorId,date:appointmentDate,time, ... data , symptoms:data.symptoms || [],
            status:"SCHEDULED"
        },
        include :{
            patient:{
                user:{
                    select:{
                        fullName:true,
                        email:true,
                        phone:true
                    }
                }
            },
            doctor:{
                include:{
                    user:{
                        select:{
                            fullName:true
                        }
                    }
                }
            }
        }
      })

      // create audit log 
      await prisma.auditLog.create({
        data: {
            userId: patient.userId,
            action: 'APPOINTMENT_BOOKED',
            resource: 'Appointment',
            details: { appointmentId:appointment.id ,
                doctorid,
                date:appointmentDate,
                time
            },
          
        },
    });
    return appointment

}


/// get  all appointment (staff)
export const getAllAppointments = async (
  page = 1,
  limit = 10,
  filters = {}
) => {
  const skip = (page - 1) * limit;

  const where = {};

  // Status filter
  if (filters.status) {
    where.status = filters.status;
  }

  // Patient filter
  if (filters.patientId) {
    where.patientId = filters.patientId;
  }

  // Doctor filter
  if (filters.doctorId) {
    where.doctorId = filters.doctorId;
  }

  // Start date filter
  if (filters.startDate) {
    where.date = {
      ...where.date,
      gte: new Date(filters.startDate),
    };
  }

  // End date filter
  if (filters.endDate) {
    where.date = {
      ...where.date,
      lte: new Date(filters.endDate),
    };
  }

  // Search filter
  if (filters.search) {
    where.OR = [
      {
        patient: {
          user: {
            fullName: {
              contains: filters.search,
            },
          },
        },
      },
      {
        doctor: {
          user: {
            fullName: {
              contains: filters.search,
            },
          },
        },
      },
      {
        patient: {
          user: {
            email: {
              contains: filters.search,
            },
          },
        },
      },
    ];
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,

      include: {
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

        doctor: {
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
      },

      skip,
      take: Number(limit),

      orderBy: {
        date: "desc",
      },
    }),

    prisma.appointment.count({
      where,
    }),
  ]);

  return {
    appointments,

    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


// get appointment by id


// update 
// cancel