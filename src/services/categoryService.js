const Category = require("../models/Category");
const ErrorResponse = require("../utils/errorResponse");
const { deleteImage } = require("./cloudinaryService");

// Tạo category
exports.createCategory = async (data) => {
  return await Category.create(data);
};

// Lấy tất cả category
exports.getCategories = async () => {
  return await Category.find();
};

// Lấy category theo ID
exports.getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ErrorResponse("Category not found", 404);
  }
  return category;
};

// Cập nhật category
exports.updateCategory = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    throw new ErrorResponse("Category not found", 404);
  }
  return category;
};

// Xóa category
exports.deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ErrorResponse("Category not found", 404);
  }
  await Category.findByIdAndDelete(id);
  return { message: "Category deleted successfully" };
};

// ========== ADMIN FUNCTIONS ==========

// Lấy tất cả categories cho admin (với phân trang và tìm kiếm)
exports.getCategoriesAdmin = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  // Tạo filter object
  const filter = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  // Tạo sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Tính toán pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Lấy categories với pagination
  const categories = await Category.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Đếm tổng số categories
  const total = await Category.countDocuments(filter);

  // Tính toán pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  return {
    success: true,
    count: total,
    data: categories,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      hasNextPage,
      hasPrevPage,
      limit: parseInt(limit),
    },
  };
};

// Lấy thống kê categories cho admin
exports.getCategoryStatsAdmin = async () => {
  const totalCategories = await Category.countDocuments();

  // Lấy categories được tạo trong 30 ngày qua
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentCategories = await Category.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  // Lấy categories có nhiều products nhất (nếu có relation với products)
  const categoriesWithProductCount = await Category.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "category",
        as: "products",
      },
    },
    {
      $project: {
        name: 1,
        productCount: { $size: "$products" },
        createdAt: 1,
      },
    },
    {
      $sort: { productCount: -1 },
    },
    {
      $limit: 5,
    },
  ]);

  return {
    totalCategories,
    recentCategories,
    categoriesWithProductCount,
  };
};

// Tạo category mới cho admin (với upload ảnh)
exports.createCategoryAdmin = async (data, file) => {
  const categoryData = {
    name: data.name,
  };

  // Nếu có file upload, sử dụng URL từ Cloudinary
  if (file) {
    categoryData.image = file.path;
  } else if (data.image) {
    // Nếu không có file nhưng có URL, sử dụng URL
    categoryData.image = data.image;
  } else {
    throw new ErrorResponse("Image is required", 400);
  }

  return await Category.create(categoryData);
};

// Cập nhật category cho admin (với upload ảnh)
exports.updateCategoryAdmin = async (id, data, file) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ErrorResponse("Category not found", 404);
  }

  const updateData = {
    name: data.name,
  };

  // Nếu có file upload mới
  if (file) {
    // Xóa ảnh cũ nếu có
    if (category.image && category.image.includes("cloudinary")) {
      const publicId = category.image.split("/").pop().split(".")[0];
      await deleteImage(`samples/ecommerce/${publicId}`);
    }
    updateData.image = file.path;
  } else if (data.image) {
    // Nếu không có file nhưng có URL (giữ nguyên ảnh cũ hoặc URL mới)
    updateData.image = data.image;
  }
  // Nếu không có file và không có URL mới, giữ nguyên ảnh cũ

  const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  return updatedCategory;
};
