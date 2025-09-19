const express = require("express");
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  // Admin endpoints
  getCategoriesAdmin,
  getCategoryByIdAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
  getCategoryStatsAdmin,
} = require("../controllers/categoryController");
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../services/cloudinaryService");

const router = express.Router();


// Lấy tất cả category (public)
router.get("/", getCategories);

// Lấy category theo ID (public)
router.get("/:id", getCategoryById);

router.get(
  "/admin/categories",
  protect,
  authorize("admin"),
  getCategoriesAdmin
);

// Lấy category theo ID cho admin
router.get(
  "/admin/categories/:id",
  protect,
  authorize("admin"),
  getCategoryByIdAdmin
);

// Tạo category mới cho admin
router.post(
  "/admin/categories",
  protect,
  authorize("admin"),
  upload.single("image"),
  createCategoryAdmin
);

// Cập nhật category cho admin
router.put(
  "/admin/categories/:id",
  protect,
  authorize("admin"),
  upload.single("image"),
  updateCategoryAdmin
);

// Xóa category cho admin
router.delete(
  "/admin/categories/:id",
  protect,
  authorize("admin"),
  deleteCategoryAdmin
);

// Lấy thống kê categories cho admin
router.get(
  "/admin/categories/stats",
  protect,
  authorize("admin"),
  getCategoryStatsAdmin
);

// Tạo category (chỉ admin)
router.post("/", protect, authorize("admin"), createCategory);

// Cập nhật category (chỉ admin)
router.put("/:id", protect, authorize("admin"), updateCategory);

// Xóa category (chỉ admin)
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
