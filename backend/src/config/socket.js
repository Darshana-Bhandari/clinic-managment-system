import {server} from "socket.io";
import prisma from "../config/database.js";
import { ENV } from "./env.js";
import app from "../app.js";




let io = null; // Initialize io as null

// function to intialize socket.io server
export const initializeSocket = (server) =>{
    io = new server(server, {
        cors:{
            origin: ENV.FRONTEND_URL  || 'http://localhost:5173',
            credentials:true,
            methods:['GET','POST','PUT','DELETE'],
        },
        pingTimeout: 60000,  // 60 seconds
        pingInterval: 25000, // 25 seconds
    })


    // authentication middleware for socket.io
    io.use(async (socket, next)=>{
        try{
            const token = socket.handshake.auth.token; // get token from handshake auth
            if(!token){
                throw new Error("No token provided");
            }

            // Verify token and get userId
            const userId = await verifyToken(token,ENV.JWT_ACCESS_SECRET); // Assuming you have a function to verify JWT
            const user = await prisma.user.findUnique({where:{id:userId},
                include:{
                    patient:true,
                    doctor:true,
                }
            });
            if(!user){
                throw new Error("User not found");
            }
            if(!user.isActive){
                throw new Error("User is not active");
            }
            socket.user = user; // Attach user to socket object for later use
            socket.userId = user.id; // Attach userId to socket object for later use
            socket.role=user.role; // Attach role to socket object for later use

            // store user's room based in role and id, for example: "patient-<userId>" or "doctor-<userId>"
            socket.join(`${user.role}-${user.id}`);
            if(user.role === 'PATIENT' && user.patient){
                socket.join(`patient-${user.patient.id}`);
            }
            if(user.role === 'DOCTOR' && user.doctor){
                socket.join(`doctor-${user.doctor.id}`);
            }

            next(); // Proceed to the next middleware or event handler

        }
        catch(err){
            console.error("Socket authentication error:", err);
            next(new Error("Authentication error"));
        }
    })

    // connection handler 
    io.on('connection', (socket)=>{
        console.log(`User connected: ${socket.user.fullName} (${socket.user.role})`);

        // join role-based room 
        socket.join(`${socket.user.role}-${socket.user.id}`);
        // notify others about user status 
        socket.brodcast.emit('userStatusChanged', {userId: socket.user.id, status:'online'});
        // setupevent handlers 
        setupEventHandlers(socket);


        // handle disconnection
        socket.on('disconnect', ()=>{
            console.log(`User disconnected: ${socket.user.fullName} (${socket.user.role})`);
            // notify others about user status 
            socket.brodcast.emit('userStatusChanged', {userId: socket.user.id, status:'offline'});
        })


   

    // handle errors 
    io.on('error', (error)=>{
        console.log(`socket error:`, error);
    })
     })
    return io; // Return the initialized io instance

}


// event handler for socket events
const setupEventHandlers = (socket)=>{
    // appintment relted events
    //book appointment 
    socket.on('bookAppointment', async (data)=>{
        try{
            // broadcast to doctor and staff  room  that a new appointment is booked
            io.to(`doctor_${data.doctorId}`).emit('newAppointment', {...data,
                 bookedBY:socket.userId, 
                 fullName: socket.fullName, 
                 timestamp: new Date()
                });
                 io.to(`staff`).emit('newAppointment', {...data,
                 bookedBY:socket.userId, 
                 fullName: socket.fullName, 
                 timestamp: new Date()});

                 // confirm to patient 
                 socket.emit('appointmentBooked', {...data,
                 bookedBY:socket.userId,  
                 timestamp: new Date()
                });

        }
        catch(err){
            console.error("Error booking appointment:", err);
            socket.emit('bookAppointmentError', {message: "Error booking appointment"});
        }
    });
}


//update appontment
socket.on('updateAppointment', async (data)=>{
    try{
        const {appointmentId, ...updateData} = data;
        // broadcast to doctor and staff  room  that a new appointment is booked
        const appointment = await prisma.appointment.update({
            where: {id: appointmentId},
            include:{
                patient:true,
                doctor:true,
            }
       
        }) 
        if(appointment){
            io.to(`doctor_${appointment.doctorId}`).emit('appointmentUpdated', {...appointment,
                 appointmentId:appointment.id,
                 ...updateData,
                 timestamp: new Date()
                }); 

                io.to(`staff`).emit('appointmentUpdated', {...appointment,
                    appointmentId:appointment.id,
                    ...updateData,
                    timestamp: new Date()
                   });

                // confirm to patient 
                socket.emit('appointmentUpdated', {...appointment,
                    appointmentId:appointment.id,
                    ...updateData,
                    timestamp: new Date()
                   });
        }
    }
     catch(err){
            console.error("Error updating appointment:", err);
            socket.emit('updateAppointmentError', {message: "Error updating appointment"});
       }   })



       // cancel appointment
       // chat events
       

    

        