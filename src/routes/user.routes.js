import express from "express";
import {
  updateProfileUserController,
  deleteProfileUserController,
} from "../controllers/user.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
const router = express.Router();
router.put("/profile/:userId", protect, updateProfileUserController);
router.delete("/profile/:userId", protect, authorize('admin'), deleteProfileUserController);
export default router;
