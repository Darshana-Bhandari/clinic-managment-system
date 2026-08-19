import express from "express";

import {
  verifyToken,
  isAdmin,
} from "../../middleware/authMiddleware.js";

import {
  getUserById,
} from "./auth.controller.js";

const router = express.Router();

router.use(verifyToken);
router.use(isAdmin);

router.get("/users/:id", getUserById);

export default router;
