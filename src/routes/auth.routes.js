import express from "express";
import {
  registerController,
  loginController,
  getProfileController,
  logoutController,
  refresh,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  registerValidator,
  loginValidator,
} from "../validators/auth.validator.js";

const router = express.Router();

router.post("/register", registerValidator, registerController);
router.post("/login", loginValidator, loginController);
router.get("/me", protect, getProfileController);
router.post("/refresh-token", refresh);

router.post("/logout", protect, logoutController);
export default router;
