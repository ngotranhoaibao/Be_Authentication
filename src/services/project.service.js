import Project from '../models/project.model.js';
// 1. Tạo Project (Tự động lấy ID người đang login làm owner)
export const createProject = async (data, userId) => {
  // Tạo project mới với owner là userId
  const project = new Project({
    ...data,
    owner: userId
  });
  return await project.save();
};
// 2. Cập nhật Project (Có check quyền)
export const updateProject = async (projectId, data, userId, userRole) => {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('PROJECT_NOT_FOUND');

    // CHECK QUYỀN SỞ HỮU:
    // Nếu người sửa KHÔNG PHẢI chủ sở hữu VÀ cũng KHÔNG PHẢI admin
    if (project.owner.toString() !== userId && userRole !== 'admin') {
      throw new Error('FORBIDDEN'); // Không có quyền
    }

    // Nếu qua được bước trên nghĩa là có quyền
    const updatedProject = await Project.findByIdAndUpdate(projectId, data, { new: true });
    return updatedProject;
}

// 3. Xóa Project (Tương tự)
export const deleteProject = async (projectId, userId, userRole) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error('PROJECT_NOT_FOUND');

  if (project.owner.toString() !== userId && userRole !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  return await Project.findByIdAndDelete(projectId);
};

// 4. Lấy danh sách (Ai lấy của người nấy - hoặc Admin xem hết)
export const getMyProjects = async (userId, userRole) => {
  if (userRole === 'admin') {
    return await Project.find().populate('owner', 'name email');
  }
  // Nếu là user thường, chỉ lấy project của mình
  return await Project.find({ owner: userId });
};
export const getAllProjects = async (query) => {
  // 1. XỬ LÝ PHÂN TRANG (PAGINATION)
  const page = parseInt(query.page) || 1; // Mặc định trang 1
  const limit = parseInt(query.limit) || 10; // Mặc định 10 dòng/trang
  const skip = (page - 1) * limit;

  // 2. XỬ LÝ SẮP XẾP (SORTING)
  // VD: ?sort=-createdAt (Mới nhất lên đầu) hoặc ?sort=name (A-Z)
  const sort = query.sort || '-createdAt'; // Mặc định: Mới nhất trước

  // 3. XỬ LÝ LỌC & TÌM KIẾM (FILTER & SEARCH)
  const filter = { ...query };
  
  // Loại bỏ các field đặc biệt không phải là dữ liệu trong DB
  const excludeFields = ['page', 'sort', 'limit', 'fields'];
  excludeFields.forEach((el) => delete filter[el]);

  // Tìm kiếm gần đúng (Regex) cho tên dự án (Nếu có tham số name)
  if (query.name) {
    filter.name = { $regex: query.name, $options: 'i' }; // 'i': không phân biệt hoa thường
  }

  // 4. THỰC HIỆN TRUY VẤN
  // .find(filter): Lọc theo điều kiện
  // .sort(sort): Sắp xếp
  // .skip(skip): Bỏ qua n bản ghi đầu
  // .limit(limit): Chỉ lấy n bản ghi
  // .populate: Lấy thông tin owner
  const projects = await Project.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('owner', 'name email');

  // 5. ĐẾM TỔNG SỐ BẢN GHI (Để Frontend biết có bao nhiêu trang)
  const totalProjects = await Project.countDocuments(filter);
  const totalPages = Math.ceil(totalProjects / limit);

  // 6. TRẢ VỀ KẾT QUẢ KÈM METADATA
  return {
    projects,
    pagination: {
      page,
      limit,
      totalProjects,
      totalPages
    }
  };
};