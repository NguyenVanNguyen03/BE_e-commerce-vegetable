const asyncHandler = require("../middleware/async");
const categoryService = require("../services/categoryService");

// Tạo category
exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({ success: true, data: category });
});

// Lấy tất cả category
exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await categoryService.getCategories();
  res.status(200).json({ success: true, data: categories });
});

// Lấy category theo ID
exports.getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res.status(200).json({ success: true, data: category });
});

// Cập nhật category
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body
  );
  res.status(200).json({ success: true, data: category });
});

// Xóa category
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const result = await categoryService.deleteCategory(req.params.id);
  res.status(200).json({ success: true, data: result });
});

// ========== ADMIN ENDPOINTS ==========

// Lấy tất cả categories cho admin (với phân trang)
exports.getCategoriesAdmin = asyncHandler(async (req, res, next) => {
  const result = await categoryService.getCategoriesAdmin(req.query);
  res.status(200).json(result);
});

// Lấy category theo ID cho admin
exports.getCategoryByIdAdmin = asyncHandler(async (req, res, next) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res.status(200).json({ success: true, data: category });
});

// Tạo category mới cho admin
exports.createCategoryAdmin = asyncHandler(async (req, res, next) => {
  const category = await categoryService.createCategoryAdmin(
    req.body,
    req.file
  );
  res.status(201).json({ success: true, data: category });
});

// Cập nhật category cho admin
exports.updateCategoryAdmin = asyncHandler(async (req, res, next) => {
  const category = await categoryService.updateCategoryAdmin(
    req.params.id,
    req.body,
    req.file
  );
  res.status(200).json({ success: true, data: category });
});

// Xóa category cho admin
exports.deleteCategoryAdmin = asyncHandler(async (req, res, next) => {
  const result = await categoryService.deleteCategory(req.params.id);
  res.status(200).json({ success: true, data: result });
});

// Lấy thống kê categories cho admin
exports.getCategoryStatsAdmin = asyncHandler(async (req, res, next) => {
  const stats = await categoryService.getCategoryStatsAdmin();
  res.status(200).json({ success: true, data: stats });
});
