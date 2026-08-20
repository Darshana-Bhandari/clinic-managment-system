import prisma from "../../config/database"; 


// create medical record
export const createMedicalRecord = async (recordData) => {
    const {patientId, doctorId, appointmentId, ...data} = recordData;
    const patient = await prisma.patient.findUnique({where: {id: patientId}});
        if(!patientId) {
            throw new Error("Patient not found")
        }
}

//doctor 
const doctor = await prisma.doctor.findUnique({
    where:{where:{id: doctorId}}
})
if(!doctor) {
    throw new Error("Doctor not found")
}
//appointment
const appointment = await prisma.appointment.findUnique({
    where:{where:{id: appointmentId}}
})  
if(!appointment) {
    throw new Error("Appointment not found")
}
