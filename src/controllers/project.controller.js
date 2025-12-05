import {
    createProject,
    getMyProjects,
    updateProject,
    deleteProject,
} from "../services/project.service.js";
import {successResponse,errorResponse} from "../utils/response.js";
export const create = async (req, res) => {
    try {
        // req.user.id lấy từ Token
        const newProject = await createProject(req.body, req.user.id);
        return successResponse(res, 'Tạo dự án thành công', newProject, 201);
    } catch (err) {
        return errorResponse(res, err.message, 500);
    }
}
export const update = async (req, res) => {
    try {
        const updated = await updateProject(
            req.params.id, 
            req.body, 
            req.user.id,  
            req.user.role 
        );
        return successResponse(res, updated, 'Cập nhật thành công');
    } catch (err) {
        if (err.message === 'FORBIDDEN') 
            return errorResponse(res, 403, 'Bạn không có quyền sửa dự án này', 'FORBIDDEN');
        if (err.message === 'PROJECT_NOT_FOUND') 
            return errorResponse(res, 404, 'Không tìm thấy');
        return errorResponse(res, 500, 'Lỗi server', err.message);
    }
};

export const remove = async (req, res) => {
    try {
        await deleteProject(
            req.params.id, 
            req.user.id,  
            req.user.role 
        );
        return successResponse(res, null, 'Xóa thành công');
    } catch (err) {
        if (err.message === 'FORBIDDEN') 
            return errorResponse(res, 403, 'Bạn không có quyền xóa dự án này', 'FORBIDDEN');
        if (err.message === 'PROJECT_NOT_FOUND') 
            return errorResponse(res, 404, 'Không tìm thấy');
        return errorResponse(res, 500, 'Lỗi server', err.message);
    }
};
export const getAll = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role; 
    const projects = await getMyProjects(userId, userRole); 
    return successResponse(res, projects, 'Lấy tất cả dự án thành công', 200); 
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};