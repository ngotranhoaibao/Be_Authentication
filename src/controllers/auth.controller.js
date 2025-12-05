import {
  register,
  login,
  refreshTokenProcess,
  logoutUser,
} from "../services/auth.service.js";
import { validationResult } from "express-validator";
import { errorResponse, successResponse } from "../utils/response.js";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
export const refresh = async (req, res) => {
  try {
    const refreshTokenFromCookie = req.cookies.refreshToken;
    const tokens = await refreshTokenProcess(
      refreshTokenFromCookie
    );

    res.status(200).json({
      message: "Lấy token mới thành công",
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
export const registerController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors
      .array()
      .map((e) => ({ field: e.param, message: e.msg }));
    return errorResponse(res, 400, "Validation errors", formatted);
  }

  try {
    const { name, email, password } = req.body;
    const data = await register({ name, email, password });
    return successResponse(res, data, "User registered successfully", 201);
  } catch (error) {
    return errorResponse(res, 400, error.message, error.errorCode);
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { tokens } = await login({ email, password });
    res.cookie("refreshToken", tokens.refreshToken, COOKIE_OPTIONS);
    res.status(200).json({
      accessToken: tokens.accessToken,

    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const getProfileController = async (req, res) => {
  try {
    return successResponse(res, req.user, "User profile retrieved", 200);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
export const logoutController = async (req, res) => {
  try {
    await logoutUser(req.user._id);

    res.clearCookie("refreshToken");

    return successResponse(res, null, "User logged out successfully", 200);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
