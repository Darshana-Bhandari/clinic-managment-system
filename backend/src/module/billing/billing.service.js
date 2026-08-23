import prisma from "../../config/database.js";


// generate Bill 
export const generateBill = async (billData) =>{
    const{patientId,appoinmentId,items, tax, discount,notes,genratedBy} = billData


    // if patient exists
    const patient = await prisma.patient.findUnique({
        where:{id:patientId},
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
        throw new Error("patient not found")
    }

    // appointment is provided or not 
    if(appointentId){
        const appointment= await prisma.appointment.findUnique({
            where:{id:appoinmentId},
        })
        if(!appoinmentId)
            throw new Error("appointment  not found")
    }



    // 1 =150   sum=0+150=150+1
    // 2= 100

    // calulate  subtotal
    const subtotal= items.reduce((sum, item)=>  // before taxx add and  subtract dicount 
        sum + item.total,0)
    //     sum=0
    // sum=sum +items.total,0)


    // calculate total amount
    const totalAmount = subtotal + tax - dicount 


    // genrate bill and invoice numbers
    const billNumber = `BILL-${Date.now()}-${Math.random().toString(36).substring(2,6).toUpperCase}`  // BIll-2026.10394
    const inVoiceNumber =`INV-${Date.now()}-${Math.random().toString(36).substring(2,6).toUpperCase}` 


    // create bill 
    const bill = await prisma.bill.create({
        data:{
            patientId,
            appointentId,billNumber,inVoiceNumber,
            items,
            subtotal,totalAmount,notes,genratedBy,
            status:"UNPAID"
        },
        include:{
            patient:{
                inlcude:{
                    user:{
                        select:{
                            id:true,
                            fullName,email:true,
                            phone:true
                        }
                    }
                }
                
            },
            apoontment:{
                include:{
                    docotor:{
                        include:{
                            user:{
                                select:{
                                    fullName:true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: genratedBy,
      action: 'Bill generated',
      resource:"Bill",
      details:{
        billId:bill.id,
        patientId,
        appoinmentId,
        totalAmount,
        billNumber
      },
      description: `Bill generate with this bill number: ${billNumber}`,
    },
  });



    return bill

    


}


// get all  biill 
export const gettAllBills = async (page=1,limit=10,filters={}) =>{
    const skip = (page-1)*limit  // pagination
    const where ={}
    if(filters.patientId) 
where.patientId= filters.patientId      //select patientId from patient where patientId="8q290854q90"
    if(filters.status) 
        where.status= filters.status;
    if(filters.fromDate) 
        where.generatedAt={gte:new Date(filters.fromDate)}
    if(filters.toDate) 
        where.generatedAt={gte:new Date(filters.toDate)}

// sorting for the search box  by bill number and patientName
    if(filters.search){
        where.OR =[
            {billNumber:{
                contains:filters.search
            }},
            {patient:{user:{fullName:{
                contains:filters.search
            }}}}
        ]
    }

    cons [bills,total]=await Promise.all([
        prisma.bill.findMany({
            where,
            inlcude:{
                patient:{
                    include:{
                        user:{
                            select:{
                                id:true,
                            fullName,email:true,
                            phone:true

                            }

                        }
                    }
                },
                apoontment:{
                include:{
                    docotor:{
                        include:{
                            user:{
                                select:{
                                    fullName:true
                                }
                            }
                        }
                    }
                }
            },
            payments:{
                orderBy:{paymentDate:"desc"}
            }


            },
            skip,take:limit,
            orderBy:{generatedAt:'desc'}
        }),
        prisma.bill.count({where})       // count, sum 


    ])
    return {
        bills,pagination:{
            page,limit,total,
            totalPages:Math.cell(total/limit)
        }
    }


}


// get bill by Id 
// get bill by invlice number 
//update BIll 
// cancel Bill





