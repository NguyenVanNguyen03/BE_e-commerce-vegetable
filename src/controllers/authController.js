const asyncHandler = require("../middleware/async");
const authService = require("../services/authService");
const { sendTokenResponse } = require("../services/tokenService");
const ErrorResponse = require("../utils/errorResponse");
const cloudinary = require("../utils/cloudinary");

// Đăng ký người dùng
exports.register = asyncHandler(async (req, res, next) => {
  const user = await authService.registerUser(req.body);
  sendTokenResponse(user, 200, res);
});

// Đăng nhập người dùng
exports.login = asyncHandler(async (req, res, next) => {
  const user = await authService.loginUser(req.body.email, req.body.password);
  sendTokenResponse(user, 200, res);
});

// Lấy thông tin profile
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await authService.getUserProfile(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// Cập nhật thông tin profile
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const user = await authService.updateUserProfile(req.user.id, req.body);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// Cập nhật mật khẩu
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await authService.updatePassword(
    req.user.id,
    currentPassword,
    newPassword
  );
  sendTokenResponse(user, 200, res);
});

// Upload avatar
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse("Please upload an image file", 400));
  }

  try {
    const updatedUser = await authService.updateAvatar(req.user.id, req.file);

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    // Nếu có lỗi, xóa file đã upload
    if (req.file && req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    next(error);
  }
});

// ========== ADMIN USER MANAGEMENT ==========

// Lấy tất cả users (admin only)
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await authService.getAllUsers(req.query);
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// Lấy user theo ID (admin only)
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await authService.getUserById(req.params.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// Cập nhật user (admin only)
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await authService.updateUser(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// Xóa user (admin only)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await authService.deleteUser(req.params.id);
  res.status(200).json({
    success: true,
    data: {},
  });
});

// Thay đổi role user (admin only)
exports.changeUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  const user = await authService.changeUserRole(req.params.id, role);
  res.status(200).json({
    success: true,
    data: user,
  });
});
