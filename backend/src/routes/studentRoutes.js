import express from "express";
import { getStudents } from "../controllers/studentController.js";

export const studentRoutes = express.Router();

studentRoutes.get("/students", getStudents);