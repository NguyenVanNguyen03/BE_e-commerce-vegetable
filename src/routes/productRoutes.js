const express = require("express");
const {
  getProductsAll,
  getProductId,
  createProduct,
  updateProduct,
  deleteProduct,
  // Admin endpoints
  getAllProducts,
  getProductById: getProductByIdAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  getProductStats,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../services/cloudinaryService");

const router = express.Router();

// Public routes
router
  .route("/")
  .get(getProductsAll)
  .post(protect, authorize("admin"), upload.array("images", 10), createProduct);

router
  .route("/:id")
  .get(getProductId)
  .put(protect, authorize("admin"), upload.array("images", 10), updateProduct)
  .delete(protect, authorize("admin"), deleteProduct);

// Admin routes
router
  .route("/admin/products")
  .get(protect, authorize("admin"), getAllProducts)
  .post(
    protect,
    authorize("admin"),
    upload.single("image"),
    createProductAdmin
  );

router
  .route("/admin/products/stats")
  .get(protect, authorize("admin"), getProductStats);

router
  .route("/admin/products/:id")
  .get(protect, authorize("admin"), getProductByIdAdmin)
  .put(protect, authorize("admin"), upload.single("image"), updateProductAdmin)
  .delete(protect, authorize("admin"), deleteProductAdmin);

module.exports = router;
