import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";

export const register = async ({ name, email, password }) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    const error = new Error("User already exists");
    error.errorCode = "USER_ALREADY_EXISTS";
    throw error;
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return { user: { id: user._id, name: user.name, email: user.email }, token };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("Email or password is incorrect");
    error.errorCode = "INVALID_CREDENTIALS";
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Email or password is incorrect");
    error.errorCode = "INVALID_CREDENTIALS";
    throw error;
  }

  const token = generateToken(user._id);
  return { user: { id: user._id, name: user.name, email: user.email }, token };
};
