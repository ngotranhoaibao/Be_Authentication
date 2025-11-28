import { register, login } from "../services/auth.service.js";
import { validationResult } from "express-validator";
import { errorResponse, successResponse } from "../utils/response.js";

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors
      .array()
      .map((e) => ({ field: e.param, message: e.msg }));
    return errorResponse(res, 400, "Validation errors", formatted);
  }

  try {
    const { email, password } = req.body;
    const data = await login({ email, password });
    return successResponse(res, data, "User logged in successfully", 200);
  } catch (error) {
    return errorResponse(res, 401, error.message, error.errorCode);
  }
};

export const getProfileController = async (req, res) => {
  try {
    return successResponse(res, req.user, "User profile retrieved", 200);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
