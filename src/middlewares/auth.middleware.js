import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { errorResponse } from "../utils/response.js";

export const protect = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization (format: "Bearer <token>")
    const token = req.header("Authorization").replace("Bearer ", "");

    // Không có token → chặn ngay
    if (!token) {
      return errorResponse(res, 401, "No token, authorization denied");
    }

    // Giải mã token bằng JWT_SECRET để lấy payload (id user)
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Gắn thông tin user vào req.user (bỏ password để tránh lộ)
    req.user = await User.findById(decoded.id).select("-password");

    // Cho request đi tiếp vào controller
    next();
  } catch (error) {
    // Token hết hạn / sai signature / corrupt
    return errorResponse(res, 401, "Token is not valid");
  }
};
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res, 
        403, 
        'Bạn không có quyền thực hiện hành động này', 
        'FORBIDDEN'
      );
    }
    next();
  };
};
