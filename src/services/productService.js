const Product = require("../models/Product");
const ErrorResponse = require("../utils/errorResponse");
const { deleteImage } = require("./cloudinaryService");

// Lấy tất cả sản phẩm (public) với phân trang, tìm kiếm, lọc cơ bản
exports.getProductsAll = async (queryParams = {}) => {
  const {
    page = 1,
    limit = 12,
    q,
    category,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  const filter = {};

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  const skip = (Number(page) - 1) * Number(limit);

  const products = await Product.find(filter)
    .populate("category", "name")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Product.countDocuments(filter);

  return {
    products,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalItems: total,
      itemsPerPage: Number(limit),
    },
  };
};

// Lấy sản phẩm theo ID
exports.getProductById = async (id) => {
  const product = await Product.findById(id).populate("category", "name");
  if (!product) {
    throw new ErrorResponse(`Product not found with id of ${id}`, 404);
  }
  return product;
};

// Tạo sản phẩm mới
exports.createProduct = async (data) => {
  const productData = { ...data };

  // Xử lý upload ảnh
  if (productData.images && Array.isArray(productData.images)) {
    productData.images = productData.images.map((file) => ({
      public_id: file.filename,
      url: file.path,
    }));
  } else {
    productData.images = []; // Đảm bảo images là một mảng nếu không có file nào được upload
  }

  return await Product.create(productData);
};

// Cập nhật sản phẩm
exports.updateProduct = async (id, data, oldImages) => {
  let product = await Product.findById(id);

  if (!product) {
    throw new ErrorResponse(`Product not found with id of ${id}`, 404);
  }

  const productData = { ...data };

  // Xử lý xóa ảnh cũ nếu có
  if (oldImages && Array.isArray(oldImages)) {
    for (const image of oldImages) {
      await deleteImage(image.public_id);
    }
  }

  // Xử lý upload ảnh mới
  if (productData.images && Array.isArray(productData.images)) {
    // Kết hợp ảnh cũ (nếu có ảnh cũ không bị xóa) và ảnh mới
    const newImages = productData.images.map((file) => ({
      public_id: file.filename,
      url: file.path,
    }));
    // Note: Logic này sẽ thay thế tất cả ảnh cũ bằng ảnh mới. Nếu muốn giữ ảnh cũ, cần truyền cả ảnh cũ và ảnh mới trong request data.
    // Tạm thời sẽ thay thế tất cả ảnh cũ bằng ảnh mới được gửi lên.
    productData.images = newImages;
  } else if (oldImages && Array.isArray(oldImages)) {
    // Nếu không có ảnh mới được gửi lên nhưng có yêu cầu xóa ảnh cũ, set images về mảng rỗng.
    productData.images = [];
  } else {
    // Nếu không có ảnh mới và cũng không yêu cầu xóa ảnh cũ, giữ nguyên ảnh hiện tại trong productData
    delete productData.images; // Không update trường images nếu không có dữ liệu mới
  }

  // Cập nhật thông tin sản phẩm (bao gồm cả mảng ảnh mới nếu có)
  product = await Product.findByIdAndUpdate(id, productData, {
    new: true,
    runValidators: true,
  });

  return product;
};

// Xóa sản phẩm
exports.deleteProduct = async (id) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new ErrorResponse(`Product not found with id of ${id}`, 404);
  }

  // Xóa tất cả ảnh của sản phẩm trên Cloudinary
  if (product.images && Array.isArray(product.images)) {
    for (const image of product.images) {
      await deleteImage(image.public_id);
    }
  }

  await Product.findByIdAndDelete(id);
};

// ========== ADMIN PRODUCT MANAGEMENT ==========

// Lấy tất cả sản phẩm với phân trang, tìm kiếm và lọc (admin only)
exports.getAllProducts = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  // Tạo filter object
  const filter = {};

  // Tìm kiếm theo tên sản phẩm
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  // Lọc theo category
  if (category) {
    filter.category = category;
  }

  // Lọc theo giá
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Tạo sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Tính toán pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Thực hiện query
  const products = await Product.find(filter)
    .populate("category", "name")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Đếm tổng số sản phẩm
  const total = await Product.countDocuments(filter);

  return {
    products,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalItems: total,
      itemsPerPage: Number(limit),
    },
  };
};

// Lấy thống kê sản phẩm (admin only)
exports.getProductStats = async () => {
  const totalProducts = await Product.countDocuments();

  const categoryStats = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        avgPrice: { $avg: "$price" },
        totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $unwind: "$categoryInfo",
    },
    {
      $project: {
        categoryName: "$categoryInfo.name",
        count: 1,
        avgPrice: { $round: ["$avgPrice", 2] },
        totalValue: { $round: ["$totalValue", 2] },
      },
    },
  ]);

  const priceStats = await Product.aggregate([
    {
      $group: {
        _id: null,
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        avgPrice: { $avg: "$price" },
        totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
      },
    },
  ]);

  const stockStats = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalStock: { $sum: "$stock" },
        lowStock: {
          $sum: {
            $cond: [{ $lt: ["$stock", 10] }, 1, 0],
          },
        },
        outOfStock: {
          $sum: {
            $cond: [{ $eq: ["$stock", 0] }, 1, 0],
          },
        },
      },
    },
  ]);

  return {
    totalProducts,
    categoryStats,
    priceStats: priceStats[0] || {},
    stockStats: stockStats[0] || {},
  };
};

// Tạo sản phẩm mới (admin only)
exports.createProductAdmin = async (data) => {
  const productData = { ...data };

  // Xử lý single image upload
  if (productData.image) {
    productData.imageUrl = productData.image;
    delete productData.image; // Remove the temporary field
  }

  // Coerce numeric fields from multipart strings
  if (productData.price !== undefined) {
    productData.price = Number(productData.price);
  }
  if (productData.salePrice !== undefined && productData.salePrice !== "") {
    productData.salePrice = Number(productData.salePrice);
  } else if (productData.salePrice === "") {
    delete productData.salePrice;
  }
  if (productData.stock !== undefined) {
    productData.stock = Number(productData.stock);
  }

  // Validate required fields
  if (!productData.name) {
    throw new ErrorResponse("Product name is required", 400);
  }
  if (!productData.description) {
    throw new ErrorResponse("Product description is required", 400);
  }
  if (
    productData.price === undefined ||
    isNaN(productData.price) ||
    productData.price <= 0
  ) {
    throw new ErrorResponse("Valid price is required", 400);
  }
  if (
    productData.salePrice !== undefined &&
    (isNaN(productData.salePrice) || productData.salePrice <= 0)
  ) {
    throw new ErrorResponse("Sale price must be greater than 0", 400);
  }
  if (
    productData.salePrice !== undefined &&
    productData.salePrice >= productData.price
  ) {
    throw new ErrorResponse("Sale price must be less than original price", 400);
  }
  if (
    productData.stock !== undefined &&
    (isNaN(productData.stock) || productData.stock < 0)
  ) {
    throw new ErrorResponse("Stock cannot be negative", 400);
  }
  if (!productData.category) {
    throw new ErrorResponse("Category is required", 400);
  }
  if (!productData.imageUrl) {
    throw new ErrorResponse("Product image is required", 400);
  }

  return await Product.create(productData);
};

// Cập nhật sản phẩm (admin only)
exports.updateProductAdmin = async (id, data) => {
  let product = await Product.findById(id);

  if (!product) {
    throw new ErrorResponse(`Product not found with id of ${id}`, 404);
  }

  const productData = { ...data };

  // Xử lý single image upload
  if (productData.image) {
    // Xóa ảnh cũ nếu có (chỉ xóa nếu ảnh cũ là từ Cloudinary)
    if (product.imageUrl && product.imageUrl.includes("cloudinary.com")) {
      // Extract public_id from Cloudinary URL
      const urlParts = product.imageUrl.split("/");
      const publicId = urlParts[urlParts.length - 1].split(".")[0];
      await deleteImage(publicId);
    }
    productData.imageUrl = productData.image;
    delete productData.image; // Remove the temporary field
  } else {
    // Không có ảnh mới, giữ nguyên ảnh cũ
    delete productData.image;
  }

  // Validate required fields
  if (productData.name && !productData.name.trim()) {
    throw new ErrorResponse("Product name cannot be empty", 400);
  }
  if (productData.description && !productData.description.trim()) {
    throw new ErrorResponse("Product description cannot be empty", 400);
  }
  if (productData.price !== undefined && productData.price <= 0) {
    throw new ErrorResponse("Price must be greater than 0", 400);
  }
  if (productData.salePrice && productData.salePrice <= 0) {
    throw new ErrorResponse("Sale price must be greater than 0", 400);
  }
  if (
    productData.salePrice &&
    productData.price &&
    productData.salePrice >= productData.price
  ) {
    throw new ErrorResponse("Sale price must be less than original price", 400);
  }
  if (productData.stock !== undefined && productData.stock < 0) {
    throw new ErrorResponse("Stock cannot be negative", 400);
  }

  // Cập nhật thông tin sản phẩm
  product = await Product.findByIdAndUpdate(id, productData, {
    new: true,
    runValidators: true,
  }).populate("category", "name");

  return product;
};

// Xóa sản phẩm (admin only)
exports.deleteProductAdmin = async (id) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new ErrorResponse(`Product not found with id of ${id}`, 404);
  }

  // Xóa ảnh trên Cloudinary nếu có
  if (product.imageUrl && product.imageUrl.includes("cloudinary.com")) {
    const urlParts = product.imageUrl.split("/");
    const publicId = urlParts[urlParts.length - 1].split(".")[0];
    await deleteImage(publicId);
  }

  await Product.findByIdAndDelete(id);
};
