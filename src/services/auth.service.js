import User from "../models/user.model.js";
import { generateTokens } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

dotenv.config();
export const register = async ({ name, email, password }) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    const error = new Error("User already exists");
    error.errorCode = "USER_ALREADY_EXISTS";
    throw error;
  }

  const user = await User.create({ name, email, password });
  const token = generateTokens(user._id);

  return { user: { id: user._id, name: user.name, email: user.email }, token };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Email không tồn tại");
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Mật khẩu không đúng");
  }
  const tokens = generateTokens(user._id);
  await User.findByIdAndUpdate(user._id, {
    refreshToken: tokens.refreshToken,
  });

  return {
    tokens,
  };
};

export const refreshTokenProcess = async (refreshTokenFromCookie) => {
  if (!refreshTokenFromCookie) {
    throw new Error("Refresh token không tồn tại");
  }

  let decoded;
  try {
    decoded = jwt.verify(
      refreshTokenFromCookie,
      process.env.JWT_REFRESH_SECRET
    );
  } catch (error) {
    throw new Error("Refresh token không hợp lệ");
  }

  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user || user.refreshToken !== refreshTokenFromCookie) {
    throw new Error("Refresh token không hợp lệ");
  }
  const newAccessToken = jwt.sign(
    { id: user._id },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRE,
    }
  );

  return {
    accessToken: newAccessToken,
  };
};
export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};
export const deleteUserProfile = async (userId) => {
  await User.findByIdAndDelete(userId);
};
export const updateUserProfile = async (userId, { name, email, role }) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name, email, role },
    { new: true }
  );
  return updatedUser;
};
export const getAllUsersByAdmin = async () => {
  const users = await User.find().select("-password");
  return users;
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("EMAIL_NOT_FOUND");

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Yêu cầu đặt lại mật khẩu</h2>
      <p>Bạn nhận được email này vì chúng tôi nhận được yêu cầu đổi mật khẩu cho tài khoản của bạn.</p>
      <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
      <p>Hoặc copy link này: ${resetUrl}</p>
      <p>Link hết hạn sau 10 phút.</p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Yêu cầu đổi mật khẩu (Password Reset)",
      html: message,
    });
    return { message: "Email sent" };
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new Error("EMAIL_SEND_FAILED");
  }
};

export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw new Error("TOKEN_INVALID_OR_EXPIRED");

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return { message: "Password updated" };
};
