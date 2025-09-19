const cloudinary = require("../utils/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Cấu hình storage cho Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "samples/ecommerce", // Tên folder trên Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "gif"], // Định dạng file cho phép
    transformation: [{ width: 1000, height: 1000, crop: "limit" }], // Giới hạn kích thước ảnh
  },
});

// Cấu hình upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

// Hàm xóa ảnh từ Cloudinary
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
  }
};

module.exports = {
  upload,
  deleteImage,
};
