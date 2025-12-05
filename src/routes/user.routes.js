import express from "express";
import {
  updateProfileUserController,
  deleteProfileUserController,
  getAllUsersByAdminController,
} from "../controllers/user.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
const router = express.Router();
router.put("/profile/:userId", protect, updateProfileUserController);


//admin
router.delete("/profile/:userId", protect, authorize('admin'), deleteProfileUserController);
router.get("/all", protect, authorize('admin'), getAllUsersByAdminController);

export default router;
