const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const { deleteImage } = require("./cloudinaryService");

// Đăng ký người dùng
exports.registerUser = async (data) => {
  const { name, email, password, role } = data;
  return await User.create({ name, email, password, role });
};

// Đăng nhập người dùng
exports.loginUser = async (email, password) => {
  if (!email || !password) {
    throw new ErrorResponse("Please provide an email and password", 400);
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ErrorResponse("Invalid credentials", 401);
  }

  return user;
};

// Lấy thông tin profile người dùng
exports.getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }
  return user;
};

// Cập nhật thông tin profile
exports.updateUserProfile = async (userId, data) => {
  const allowedUpdates = ["name", "email", "phone", "address"];
  const updates = Object.keys(data)
    .filter((key) => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {});

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  return user;
};

// Cập nhật mật khẩu
exports.updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  // Kiểm tra mật khẩu hiện tại
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ErrorResponse("Current password is incorrect", 401);
  }

  user.password = newPassword;
  await user.save();

  return user;
};

// Cập nhật avatar
exports.updateAvatar = async (userId, file) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  // Xóa avatar cũ nếu không phải avatar mặc định
  if (user.avatar.public_id !== "ecommerce/default-avatar") {
    await deleteImage(user.avatar.public_id);
  }

  // Cập nhật thông tin avatar mới
  user.avatar = {
    url: file.path,
    public_id: file.filename,
  };

  await user.save();
  return user;
};

// ========== ADMIN USER MANAGEMENT ==========

// Lấy tất cả users (admin only)
exports.getAllUsers = async (query) => {
  const { page = 1, limit = 10, role, search } = query;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return users;
};

// Lấy user theo ID (admin only)
exports.getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }
  return user;
};

// Cập nhật user (admin only)
exports.updateUser = async (userId, data) => {
  const allowedUpdates = ["name", "email", "role"];
  const updates = Object.keys(data)
    .filter((key) => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {});

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  return user;
};

// Xóa user (admin only)
exports.deleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  // Xóa avatar nếu không phải avatar mặc định
  if (user.avatar.public_id !== "ecommerce/default-avatar") {
    await deleteImage(user.avatar.public_id);
  }

  await User.findByIdAndDelete(userId);
};

// Thay đổi role user (admin only)
exports.changeUserRole = async (userId, role) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }

  return user;
};
