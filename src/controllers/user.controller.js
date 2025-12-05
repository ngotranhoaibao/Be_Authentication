import { updateUserProfile, deleteUserProfile, getAllUsersByAdmin } from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/response.js";
export const updateProfileUserController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email,role } = req.body;
    const updatedUser = await updateUserProfile(userId, { name, email, role });
    return successResponse(res, updatedUser, "User profile updated", 200);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
export const deleteProfileUserController = async (req, res) => {
  try {
    const userId = req.user._id;
    await deleteUserProfile(userId);
    return successResponse(res, null, "User profile deleted", 200);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
export const getAllUsersByAdminController = async (req, res) => {
  try {
    const users = await getAllUsersByAdmin();
    return successResponse(res, users, "All users retrieved", 200);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};