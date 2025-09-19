const asyncHandler = require("../middleware/async");
const productService = require("../services/productService");
const ErrorResponse = require("../utils/errorResponse");

// Lấy tất cả sản phẩm (public) với phân trang và tìm kiếm
exports.getProductsAll = asyncHandler(async (req, res, next) => {
  const result = await productService.getProductsAll(req.query);
  res.status(200).json({ success: true, data: result });
});

// Lấy sản phẩm theo ID
exports.getProductId = asyncHandler(async (req, res, next) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({ success: true, data: product });
});

// Tạo sản phẩm mới
exports.createProduct = asyncHandler(async (req, res, next) => {
  const productData = { ...req.body, images: req.files };
  const product = await productService.createProduct(productData);
  res.status(201).json({
    success: true,
    data: product,
  });
});

// Cập nhật sản phẩm
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const productData = { ...req.body };
  const oldImagesToDelete = productData.oldImages
    ? JSON.parse(productData.oldImages)
    : [];

  // Thêm ảnh mới upload vào productData nếu có
  if (req.files && req.files.length > 0) {
    productData.images = req.files;
  } else if (productData.hasOwnProperty("images") && !productData.images) {
    productData.images = [];
  } else {
    delete productData.images;
  }

  const product = await productService.updateProduct(
    req.params.id,
    productData,
    oldImagesToDelete
  );

  if (!product) {
    return next(new ErrorResponse("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// Xóa sản phẩm
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await productService.deleteProduct(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});

// ========== ADMIN PRODUCT MANAGEMENT ==========

// Lấy tất cả sản phẩm với phân trang (admin only)
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  const result = await productService.getAllProducts(req.query);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// Lấy sản phẩm theo ID (admin only)
exports.getProductById = asyncHandler(async (req, res, next) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({
    success: true,
    data: product,
  });
});

// Tạo sản phẩm mới (admin only)
exports.createProductAdmin = asyncHandler(async (req, res, next) => {
  const productData = { ...req.body };

  // Handle single image upload
  if (req.file) {
    productData.image = req.file.path;
  }

  const product = await productService.createProductAdmin(productData);
  res.status(201).json({
    success: true,
    data: product,
  });
});

// Cập nhật sản phẩm (admin only)
exports.updateProductAdmin = asyncHandler(async (req, res, next) => {
  const productData = { ...req.body };

  // Handle single image upload
  if (req.file) {
    productData.image = req.file.path;
  }

  const product = await productService.updateProductAdmin(
    req.params.id,
    productData
  );

  if (!product) {
    return next(new ErrorResponse("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// Xóa sản phẩm (admin only)
exports.deleteProductAdmin = asyncHandler(async (req, res, next) => {
  await productService.deleteProductAdmin(req.params.id);
  res.status(200).json({
    success: true,
    data: {},
  });
});

// Lấy thống kê sản phẩm (admin only)
exports.getProductStats = asyncHandler(async (req, res, next) => {
  const stats = await productService.getProductStats();
  res.status(200).json({
    success: true,
    data: stats,
  });
});
