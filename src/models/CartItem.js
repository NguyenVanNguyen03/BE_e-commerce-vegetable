const mongoose = require("mongoose");

const cartEntrySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity cannot be less than 1"],
    default: 1,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartEntrySchema],
  },
  { timestamps: true }
);

// Index on user ensures one document per user
cartItemSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model("CartItem", cartItemSchema);
