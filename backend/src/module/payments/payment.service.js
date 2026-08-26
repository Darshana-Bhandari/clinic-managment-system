import prisma from "../../config/database.js"


// create payment

export const createPayment = async (paymentData) =>{
    const{ billId, amount, method, transactionId, note } = paymentData; // Destructure the paymentData object to extract the required fields

    // Check if the bill exists
    const bill = await prisma.bill.findUnique({
        where: { id: billId },
        include:{
            payments:true, // Include the payments associated with the bill
        }
    });

    if (!bill) {
        throw new Error("Bill not found");
    }

    // check the amount bill is valid or not for the payment
    if(bill.status === "CANCELLED"){
        throw new Error("Cannot make payment for a cancelled bill");
    }
    if(bill.status === "REFUNDED"){
        throw new Error("Cannot make payment for a refunded bill");
    }

    if(bill.status === "PAID" ){
        throw new Error("Bill is already paid. Cannot make payment.");
}


// calculate the total amount paid for the bill
    const totalPaid = bill.payments.reduce((sum, payment) => sum + payment.amount, 0);  // Calculate the total amount paid for the bill by summing up the amounts of all payments associated with the bill
    const remainingAmount = bill.totalAmount - totalPaid;     2000 -1500

    if(amount > remainingAmount){
        throw new Error(`Payment amount exceeds the remaining bill amount. Remaining amount: ${remainingAmount}`);
    }

    // create the payment
    const payment = await prisma.payment.create({
        data:{
            billId,
            amount,
            method,
            transactionId,
            note,
            status: "COMPLETED", // Set the payment status to "COMPLETED" by default
        },
        include:{
            bill:{
                include:{
                    patient:{
                        include:{
                            user:{
                                select:{
                                    fullName:true,
                                    email:true,
                                    phone:true
                                }
                            }
                        }
                    }
                }
            }
        }
        

    })

    //update the bill status
    const newTotalpaid =totalPaid + amount 
    let newStatus = bill.status
    if(newTotalpaid >= bill.totalAmount){
        newStatus ="PAID"
    }
    else if(newTotalpaid>0){
        newStatus = "PARTIALLY_PAID"
    }

    await prisma.bill.update({
        where:{id:billId},
        data:{
            status:newStatus,
            paymentDate:newStatus === "PAID"? new Date() :undefined,
            paymentMethod:method,
        }
    })

    // create audit log
    await prisma.auditLog.create({
        data:{
            action:"CREATE_PAYMENT",
            entityId:payment.id,
            entityType:"PAYMENT",
            description:`Payment of amount ${amount} created for bill ${billId}`,
        }
    })

    return payment;
}


// get all payments with pagination and filtering(dashboard)
export const getPayments = async (page=1, limit=10, filter={}) => {
    const skip = (page-1)* limit;
    const where = {};

    if(filter.billId){
        where.billId = filter.billId;
    }
    if(filters.status) where.status = filter.status;
    if(filters.method) where.method = filter.method;
    if(filters.fromDate ){
        where.paymentDate = where.paymentDate = { gte: new Date(filter.fromDate) };
    }
    if(filters.toDate){
        where.paymentDate = where.paymentDate = { lte: new Date(filter.toDate) };
    }
    if(filters.patientId){
        where.bill = {
            patientId: filter.patientId,
        }
    }
    if(filters.search){
        where.OR = [
            { transactionId: { contains: filters.search, mode: "insensitive" } },
            { note: { contains: filters.search, mode: "insensitive" } },
        ]
    }
    const [total, payments] = await Promise.all([  // it is ued to execute multiple asynchronous operations concurrently and wait for all of them to complete before proceeding. In this case, it is used to fetch the total count of payments and the list of payments based on the provided filters and pagination parameters.
        prisma.payment.count({ where }),
        prisma.payment.findMany({
            where,
            skip,
            take: limit,
            orderBy:{
                paymentDate:"desc"
            },
            include:{
                bill:{
                    include:{
                        patient:{
                            include:{
                                user:{
                                    select:{
                                        fullName:true,
                                        email:true,
                                        phone:true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
    ])

    return {
        total,
        page,
        limit,
        payments
    }


}

// get payment by id

// get payment by bill
export const getPaymentById = async (billId, page=1, limit=10) => {
    const skip = (page-1)* limit;

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where:{ billId },
            include:{
                bill:{
                    include:{
                        patient:{
                            include:{
                                user:{
                                    select:{
                                        fullName:true,
                                        email:true,
                                        phone:true
                                    }
                                }}
                    }
                }
              
            }
    
},
skip,
take:limit,
orderBy:{
    paymentDate:"desc"}
}),
prisma.payment.count({ where:{ billId } }),
    ])


    return {
        payments,
        pagination:{
            page,
            limit,
            total,
            totalPages: Math.ceil(total/limit)
        }
    }


}

// get payment summary for dashboard


// update payment
export const updatePayment = async (paymentId, updateData) =>{
    const existingPayment = await prisma.payment.findUnique({
        where:{ id: paymentId },
        include:{
            bill:true
        }
    })

    if(!existingPayment){
        throw new Error("Payment not found");
    }
    // check if payment can be updated 
    if(existingPayment.status === "REFUNDED"){
        throw new Error("Cannot update a refunded payment");
    }

    // if the amount is being updated, check if the new amount is valid
    if(updateData.amount && updateData.amount !== existingPayment.amount){
        const bill = await prisma.bill.findUnique({
            where:{ id: existingPayment.billId },
            include:{
                payments:true
            }
        })
        const totalPaid = bill.payments.reduce((sum, payment) => sum + payment.amount, 0) - existingPayment.amount;  250 
        const remainingAmount = bill.totalAmount - totalPaid;  // baki rahyo 
        if(updateData.amount > remainingAmount){
            throw new Error(`Updated payment amount exceeds the remaining bill amount. Remaining amount: ${remainingAmount}`);
        }

        //update bill status if payment amount chnages 
        let newStatus = bill.status;
        if(totalPaid >= bill.totalAmount){   1000 >= 1000 
            newStatus = "PAID";
        }
        
        else if(totalPaid > 0 ){   // 1000-900 =100
            newStatus = "PARTIALLY_PAID";
        }
        else{
            newStatus = "UNPAID";
        }

        await prisma.bill.update({
            where:{ id: bill.id },
            data:{
                status:newStatus,
            
    }
})
    }


    const updatedPayment = await prisma.payment.update({    
        where:{
            id: paymentId
        },
        data:updataData,
        include:{
            bill:{
                include:{
                    patient:{
                        include:{
                            user:{
                                select:{
                                    fullName:true,
                                    email:true,
                                    phone:true      

                }

            }
        }
    }
}}}


})

// create audit log
 await prisma.auditLog.create({
    data:{
        action:"UPDATE_PAYMENT",
        entityId:updatedPayment.id,
        entityType:"PAYMENT",
        description:`Payment ${paymentId} updated`,
    }       
}
)

return updatedPayment;

}


// reunfud 

// status bill 
//delete payment

//get payment histroy (admin and staff dashboard)
export const getPaymentHistory = async (patientId , page=1, limit=10) =>{
    const skip = (page-1)* limit;
    
    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where:{
                bill:{
                    patientId:patientId
                }
            },
            include:{
                bill:{
                    include:{
                        patient:{
                            include:{
                                user:{
                                    select:{
                                        fullName:true,
                                        email:true,
                                        phone:true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            skip,
            take:limit,
            orderBy:{
                paymentDate:"desc"
            }
        }),
        prisma.payment.count({
            where:{
                bill:{
                    patientId:patientId
                }
            }
        })
    ])

    return {
        payments,
        pagination:{
            page,
            limit,
            total,
            totalPages: Math.ceil(total/limit)
        }
    }


}

// Refund payment
export const refundPayment = async (paymentId, refundData) => {
    const { reason } = refundData;

    // Check if payment exists
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { bill: true }
    });

    if (!payment) {
        throw new Error("Payment not found");
    }

    // Check if payment is already refunded
    if (payment.status === "REFUNDED") {
        throw new Error("Payment is already refunded");
    }

    // Check if payment can be refunded
    if (payment.status === "CANCELLED") {
        throw new Error("Cannot refund a cancelled payment");
    }

    // Update payment status to REFUNDED
    const refundedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
            status: "REFUNDED",
            note: reason || "Payment refunded"
        }
    });

    // Update bill status if all payments are refunded
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
    }

    return refundedPayment;
}

// Alias for getAllPayments to match controller
export const getAllPayments = async (page=1, limit=10, filters={}) => {
    return getPayments(page, limit, filters);
}

// Alias for getPaymentByBillId to match controller
export const getPaymentByBillId = async (billId) => {
    return getPaymentById(billId);
}

// Alias for getPatientPaymentHistory to match controller
export const getPatientPaymentHistory = async (patientId, page=1, limit=10) => {
    return getPaymentHistory(patientId, page, limit);
}
