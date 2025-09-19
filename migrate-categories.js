const mongoose = require("mongoose");
require("dotenv").config();

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter category name"],
    unique: true,
    trim: true,
    maxlength: [50, "Category name cannot exceed 50 characters"],
  },
  image: {
    type: String,
    required: [true, "Please upload category image"],
  },
});

const Category = mongoose.model("Category", categorySchema);

async function migrateCategories() {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Lấy tất cả categories hiện có
    const categories = await Category.find({ image: { $exists: false } });
    console.log(`Found ${categories.length} categories without image field`);

    // Cập nhật từng category với image mặc định
    for (const category of categories) {
      const defaultImage = `https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=${encodeURIComponent(
        category.name
      )}`;

      await Category.findByIdAndUpdate(category._id, {
        image: defaultImage,
      });

      console.log(`Updated category: ${category.name}`);
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Chạy migration
migrateCategories();
