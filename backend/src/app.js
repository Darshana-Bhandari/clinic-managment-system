import express from "express"
import routes from "./routes/index.js";




 const app =express();

 app.use(express.json()) //(it is expree inbuilt middleware function)   // it is used to convert the http payload json into  javascript object to understand the req.body

/// api routes
app.use("/api",routes)



 export default app