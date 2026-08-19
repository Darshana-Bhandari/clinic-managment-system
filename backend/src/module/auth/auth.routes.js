import express from "express";

import * as authController from "./auth.controller.js";

import {
  verifyToken,
  isAdmin,
} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(isAdmin);

// Get user by ID
router.get(
  "/users/:id",
  authController.getUserById
);

export default router;