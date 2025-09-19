const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true,
    maxlength: [100, "Product name cannot exceed 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please enter product description"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  price: {
    type: Number,
    required: [true, "Please enter product price"],
    maxlength: [5, "Product price cannot exceed 5 characters"],
    default: 0,
  },
  salePrice: {
    type: Number,
    maxlength: [8, "Price cannot exceed 8 characters"],
  },
  imageUrl: {
    type: String,
    required: [true, "Please upload product image"],
  },
  avgRating: {
    type: Number,
    default: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  stock: {
    type: Number,
    required: [true, "Please enter product stock"],
    maxlength: [5, "Product stock cannot exceed 5 characters"],
    default: 0,
  },
});

module.exports = mongoose.model("Product", productSchema);
