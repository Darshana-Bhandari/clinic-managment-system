import { PaymentMethod } from "@prisma/client";
import prisma from "../../config/database.js";
import { ENV } from "../../config/env.js";
import { unknown } from "zod";




///initiate  khalti payement 


export const initiateKhaltiPayment = async (paymentData) =>{
    const {amount, purchaseOrderId, purchaseOrderName, customerName, customerEmail, paymentType,referenceId} = paymentData;

    //validate payment type and reference 
    let refernce = null;
    let patientId = null;
    let userId = null;

    if(paymentType === "APPOINTMENT" && referenceId){
        const appointment = await prisma.appointment.findUnique({
            where:{id:referenceId},
            include:{
                patient:{
                    include:{
                        user:true
                    }
                }
            }
        })

        if(!appointment){
            throw new Error("Appointment not found")
        }

        refernce= apoointment;
        patientId = appointment.patientId,
        user= appointment.patient.userId
    }
    else if (paymentType==="BILL" && reference){
        const bill = await prisma.bill.findUnique({
            where:{id:referenceId},
            include:{
                patient:{
                    include:{
                        user:true
                    }
                }
            }
        })
        if(!bill){
            throw new Error("Bill not found");
        }
        if(bill.status === "PAID"){
            throw new Error("Bill is already paid ")
        }
         refernce= apoointment;
        patientId = appointment.patientId,
        user= appointment.patient.userId
    }
    else {
        throw new Error("invalid payment type or reference Id ")
    }

    // create payment record 
    const paymentRecrd = await prisma.payment.create({
        data:{
            billId: paymentType === "BILL" ? referenceId: null,
            amount: amount/100 ,  // convert from paisa to NPR
            method:"KHALTI",
            status:"PENDING",
            notes: `${paymentType} payment via khalti `,
            transactionId: purchaseOrderId
        }
    });

    /// initate khalti payment 
    try{
        const customerInfo = {
            name:customerName || reference.patient.user.fullName,
            email:customerEmail || refernce.patient.user.email,
            phone:customerPhone || refernce.patient.user.phone || "",
        }

        // khalti response 
        const khaltiResponse = await initiateKhaltiPayment({
            amount:amount ,
            purchase_order_id:purchaseOrderId,
            purchase_order_name : purchaseOrderName,
            return_url:ENV.KHALTI_RETURN_URL,
            website_url: ENV.KHALTI_WEBSITE_URL,
            customer_info:customerInfo,
        })
        // update payment record with khalit PIDX
       const updatepayment = await prisma.payment.update({
            where:{id:paymentRecord.id},
            data:{
                transactionId:khaltiResponse.pidx,
                notes: `${paymentType} payment via khalti -PIDX:${PaymentResponse.pidx}`,
            }
        })

        return{
            paymentId:paymentRecord.id,
            pidx:khaltiResponse.pidx,
            paymentUrl:khaltiResponse.paymentUrl,
            amount:amount/100,
        }


    }
    catch(error){
        //update payment status to failed
        await prisma.payment.update({
            where:{id:paymentRecord.id},
            data:{
                status:"FAILED",
                notes: `Failed:${error.message}`,
            }
            
        })
        throw new Error(`Khalti payment initiate failed:${error.message}`)

    }
}



// verify payment 
export const verifyKhaltiPayment = async (pidx) =>{
    try{
        // verify with khalti
        const verification =  await verifyKhaltiPayment(pidx)
        const paymentRecord = await prisma.payment.findFirst({where:{transactionId:pidx},
            include:{
                bill:{
                    include:{
                        patient:{
                            include:{
                                user:true
                            }
                        }
                    }
                }
            }
        })

        if(!paymentRecord){
            throw new Error("payment record not found");
        }

        // check if payment is already processed
        if(paymentRecord.status === "COMPLETED"){
            return{
                success:true,
                message:"payment already completed",
                payment:paymentRecord

            }
        }

        // update payment status based on verification
        let paymentStatus ="FAILED";
        let billStatus= "UNPAID";
        let successMessage = "Payment verfication failed"

        if(verification.status === 'COMPLETED' || verification.status ==="SUCCESS"){
            paymentStatus = "COMPLETED";
            billStatus = "PAID",
            successMessage= "payment verification sucessfully"
        }

        //update bill if this is a bill payment 
        if(paymentRecord.billId){
            await prisma.bill.update({
                where:{id:paymentRecord.billId},
                data:{
                    status:"PAID",
                    paymentDate:new Date(),
                    PaymentMethod: "KHALTI"
                }
            })
        }

        // notification via socket 
        if (paymentRecord.bill?.patient?.userId){
            emitToUser(paymentRecord.bill.patient.insuranceProvider, 'payment:confirmed',{
                paymentId:paymentRecord.id,
                amount:paymentRecord.amount,
                status:"COMPLETED",
                transactionId:pidx,
            })
        }

    //   
    
    else if (verification.status === "pending"){
        paymentStatus = "pending",
        successMessage ="payment is pending verification"
    }
    else {
        paymentStatus = "FAILED",
        successMessage= "payment failed verification"
    }

    // update payment record 
     const updatedpayment = await prisma.payment.update({
            where:{id:paymentRecord.id},
            data:{
                status:paymentStatus,
                notes: `khalti verification: ${verification.status || unknown}`,
                ...(paymentStatus === "COMPLETED" ? {paymenDate :new Date() }: {}),
            },
            include:{
                bill:{
                    include:{
                        patient:{
                            include:{
                                user:true
                            }
                        }
                    }
                }
            }
        });

        return{
            success:paymentStatus === "COMPLETED",
            message:successMessage,
            payment:updatedpayment,
            verification
        }





    }
    

    

    catch(error){
        console.log("khalti verification failed")

    }


}