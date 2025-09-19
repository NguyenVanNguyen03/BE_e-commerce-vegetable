const mongoose = require("mongoose");

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

module.exports = mongoose.model("Category", categorySchema);
