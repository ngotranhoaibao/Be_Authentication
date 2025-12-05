import User from "../models/user.model.js";
import { generateTokens } from "../utils/generateToken.js";

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
    refreshTokens: tokens.refreshToken,
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

  const user = await User.findById(decoded.id).select("+refreshTokens");
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
export const updateUserProfile = async (userId, { name, email,role }) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name, email,role },
    { new: true }
  );
  return updatedUser;
};
