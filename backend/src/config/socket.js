import {Server} from "socket.io";
import prisma from "../config/database.js";
import { ENV } from "./env.js";
import app from "../app.js";




let io = null; // Initialize io as null

// function to intialize socket.io server
export const initializeSocket = (server) =>{
    io = new Server(server, {
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


//update appontment
socket.on('updateAppointment', async (data)=>{
    try{
        const {appointmentId, ...updateData} = data;
        // broadcast to doctor and staff  room  that a new appointment is booked
        const appointment = await prisma.appointment.update({
            where: {id: appointmentId},
            data: updateData,
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



       // cancel appointmentog
       socket.on('appointment:cancel', async(data) =>{
        try{
            const { appointmentId, reason}= data;
            const appointment = await  prisma.appointment.findUnique({where:{id:appointmentId},
                 include:{
                patient:true,
                doctor:true
                 }
            })

            if(appointment){
                io.to(`patient_${appointment.patientId}`).emit('appointment:cancelled',{
                    appointmentId,
                    reason,
                    timestamp:new Date()
                })
                io.to(`doctor_${appointment.doctorId}`).emit('appointment:cancel',{
                     appointmentId,
                    reason,
                    timestamp:new Date()
                });
                io.to('staff').emit('appointment:cancel',{
                     appointmentId,
                    reason,
                    timestamp:new Date()
                })
            }
           
            }


        
        catch(error){
            socket.emit("appointment:error",{
                message:error.message
            })
        }

       })


       // chat events

       socket.on('chat:message', async(data)=>{
        try{
            const {recipientId, message, type="text"} = data;

            // store message in database 
            const chatMessage = await prisma.chatMessage.create({
                data:{
                    senderId:socket.userId,
                    recipientId,
                    message,
                    type,
                    read:false,
                },
                include:{
                    sender:{
                        select:{
                        fullName:true,
                        avatar:true,

                    }
                }
            }
                
            });
            // emit to recipient
            io.to(`user_${recipientId}`).emit('chat:message',{
                ...chatMessage,
                timestamp:new Date(),
            })
            //confirm to sender
            socket.emit('chat:sent',{
                ...chatMessage,
                timestamp:new Date(),
            })

        }
        catch(error){
            socket.emit("chat:error",{
                message:error.message,
            })
        }
       })

       // Mark message as read
       socket.on('chat:read', async(data)=>{
        try{
            const {messageId} = data;
            await prisma.chatMessage.update({
                where:{id:messageId},
                data:{read:true,readAt: new Date()}

            })

            // notify the sender
            const message = await prisma.chatMessage.findUnique({where:{id:messageId},
                select:{senderId:true}
            });
            if(message){
                io.to(`user_${message.senderId}`).emit('chat:read',{
                    messageId,
                    readAt:new Date(),
                })
        }
            
            
        }
        catch(error){
             socket.emit("chat:error",{
                message:error.message,
            })
        }
       })


       //get chat history
       socket.on('chat:history', async(data)=>{
        try{
            const {userId , limit=50, offset=0} = data;

            const messages = await prisma.chatMessage.findMany({
                where:{
                    OR:[
                        {senderId:socket.userId, recipientId:userId},  // messages sent by the current user to the specified user
                        {senderId:userId, recipientId:socket.userId}    // 
                    ]
                },
                include:{
                    sender:{
                        select:{
                            fullName:true,
                            avatar:true,
                        }
                    }
                },
                orderBy:{
                    createdAt:'desc'
                },
                take:limit,
                skip:offset,

            });
            socket.emit('chat:history', {
                messages:messages.reverse(), // reverse to show oldest first
                total:messages.length,
            })
        }
        catch(error){
            socket.emit("chat:error",{
                message:error.message,
            })
        }
       })


       /// typing indicator
       socket.on('chat:typing', (data)=>{
        try{
            const {recipientId, isTyping} = data;
            io.to(`user_${recipientId}`).emit('chat:typing',{
                senderId:socket.userId,
                isTyping,
                timestamp:new Date(),
            })

        }
        catch(error){
            socket.emit("chat:error",{
                message:error.message,
            })
        }
       })


       /// user status indicator
         socket.on('user:status', (data)=>{
          try{
            const {status} = data;
            // broadcast to all users that this user is online/offline
            socket.broadcast.emit('user:status',{
                userId:socket.userId,
                status,
                timestamp:new Date(),
            })
          }
          catch(error){
            socket.emit("user:status:error",{
                message:error.message,
            })
          }
         })

         //Notifications events

         //send notifications
         socket.on('notification:send', async(data)=>{
            try{
                const {recipientId, title, message, type="info"} = data;
                // store notification in database
                const notification = await prisma.notification.create({
                    data:{
                        senderId:socket.userId,
                        recipientId,
                        title,
                        message,
                        type,
                        read:false,
                    }
                });
                // emit to recipient
                io.to(`user_${recipientId}`).emit('notification:received',{
                    ...notification,
                    timestamp:new Date(),
                })
                // confirm to sender
                socket.emit('notification:sent',{
                    ...notification,
                    timestamp:new Date(),
                })
            }
            catch(error){
                socket.emit("notification:error",{
                    message:error.message,
                })
            }
         })


         // mark notification as read
         socket.on('notification:read', async(data)=>{
            try{
                const {notificationId} = data;
                await prisma.notification.update({
                    where:{id:notificationId},
                    data:{read:true, readAt:new Date()},
                });
                // notify the sender
                const notification = await prisma.notification.findUnique({
                    where:{id:notificationId},
                    select:{senderId:true}
                });
                if(notification){
                    io.to(`user_${notification.senderId}`).emit('notification:read',{
                        notificationId,
                        readAt:new Date(),
                    })
                }
            }
            catch(error){
                socket.emit("notification:error",{
                    message:error.message,
                })
            }
         })

         //get unread notifications count
            socket.on('notification:unreadCount', async(data)=>{
                try{
                    const count = await prisma.notification.count({
                        where:{
                            recipientId:socket.userId,
                            read:false,
                        }
                    });
                    socket.emit('notification:unreadCount',{
                        count,
                        timestamp:new Date(),
                    })

                }
                catch(error){
                    socket.emit("notification:error",{
                        message:error.message,
                    })
                }
            })



       // patient events
         socket.on('patient:update', async(data)=>{
          try{
            const {patientId, ...updateData} = data;
            const patient = await prisma.patient.update({
                where:{id:patientId},
                data:updateData,
            });

            // Broadcast to doctor and staff rooms that a patient has been updated
            io.to(`doctor_${patient.doctorId}`).emit('patient:updated',{
                ...patient,
                timestamp:new Date(),
            });
            io.to('staff').emit('patient:updated',{
                ...patient,
                timestamp:new Date(),
            });
            // notify the patient
            io.to(`patient_${patientId}`).emit('patient:updated',{
                ...patient,
                timestamp:new Date(),
            })
          }
          catch(error){
            socket.emit("patient:error",{
                message:error.message,
            })
          }
         })



         //patient medical record events
            socket.on('medicalRecord:update', async(data)=>{
                try{
                    const{patientId , recordId, ...updateData} = data;
                    io.to(`patient_${patientId}`).emit('medicalRecord:updated',{
                        recordId,
                        ...updateData,
                        timestamp:new Date(),
                    
                    });
                    io.to(`doctor_${data.doctorId}`).emit('medicalRecord:updated',{
                        recordId,
                        ...updateData,
                        timestamp:new Date(),
                    });
                }
                catch(error){
                    socket.emit("medicalRecord:error",{
                        message:error.message,
                    })
                }
            })


            //doctor events
            //doctor availability update
            socket.on('doctor:update', async(data)=>{
                try{
                    const {doctorId, ...updateData} = data;
                    const doctor = await prisma.doctor.update({
                        where:{id:doctorId},
                        data:updateData,
                    });

                    // Broadcast to patient and staff rooms that a doctor has been updated
                    io.to(`patient_${doctor.patientId}`).emit('doctor:updated',{
                        ...doctor,
                        timestamp:new Date(),
                    });
                    io.to('staff').emit('doctor:updated',{
                        ...doctor,
                        timestamp:new Date(),
                    });
                    // notify the doctor
                    io.to(`doctor_${doctorId}`).emit('doctor:updated',{
                        ...doctor,
                        timestamp:new Date(),
                    })
                }
                catch(error){
                    socket.emit("doctor:error",{
                        message:error.message,
                    })
                }
            }
            )

}


            

    

        



