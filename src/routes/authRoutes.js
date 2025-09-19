// routes/authRoutes.js
const express = require("express");
const {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  uploadAvatar,
  // Admin functions
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../services/cloudinaryService");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Profile routes - require authentication
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);
router.put("/avatar", protect, upload.single("avatar"), uploadAvatar);

// ========== ADMIN USER MANAGEMENT ROUTES ==========
// All admin routes require authentication and admin role
router.get("/admin/users", protect, authorize("admin"), getAllUsers);
router.get("/admin/users/:id", protect, authorize("admin"), getUserById);
router.put("/admin/users/:id", protect, authorize("admin"), updateUser);
router.delete("/admin/users/:id", protect, authorize("admin"), deleteUser);
router.put(
  "/admin/users/:id/role",
  protect,
  authorize("admin"),
  changeUserRole
);

module.exports = router;
