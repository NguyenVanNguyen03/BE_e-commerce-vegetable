const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const ErrorResponse = require("../utils/errorResponse");

// Thêm sản phẩm vào giỏ hàng - một document CartItem mỗi user, items là mảng
exports.addToCart = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ErrorResponse("Product not found", 404);
  }

  let cart = await CartItem.findOne({ user: userId });
  if (!cart) {
    cart = new CartItem({ user: userId, items: [] });
  }

  const existing = cart.items.find(
    (i) => i.product.toString() === productId.toString()
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();

  // Trả về item vừa thêm/cập nhật, populate để FE dùng
  const populated = await CartItem.findOne({ _id: cart._id })
    .populate("items.product", "name price imageUrl")
    .lean();

  const dto = populated.items.find(
    (i) => i.product._id.toString() === productId.toString()
  );

  return {
    _id: dto._id,
    user: userId,
    product: dto.product,
    quantity: dto.quantity,
    addedAt: dto.addedAt,
  };
};

// Cập nhật số lượng tuyệt đối cho một sản phẩm trong giỏ
exports.updateQuantity = async (userId, productId, quantity) => {
  const cart = await CartItem.findOne({ user: userId });
  if (!cart) {
    throw new ErrorResponse("Cart is empty", 404);
  }

  const item = cart.items.find(
    (i) => i.product.toString() === productId.toString()
  );

  if (!item) {
    throw new ErrorResponse("Cart item not found", 404);
  }

  if (quantity < 1) {
    // remove item when quantity < 1
    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId.toString()
    );
  } else {
    item.quantity = quantity;
  }

  await cart.save();

  const populated = await CartItem.findOne({ _id: cart._id })
    .populate("items.product", "name price imageUrl")
    .lean();

  const dto = populated.items.find(
    (i) => i.product._id.toString() === productId.toString()
  );

  // If removed, dto will be undefined; return a minimal payload
  return dto
    ? {
        _id: dto._id,
        user: userId,
        product: dto.product,
        quantity: dto.quantity,
        addedAt: dto.addedAt,
      }
    : { _id: null, user: userId, product: { _id: productId }, quantity: 0 };
};

// Lấy giỏ hàng của người dùng - trả mảng item giống cũ
exports.getCart = async (userId) => {
  const cart = await CartItem.findOne({ user: userId })
    .populate("items.product", "name price imageUrl")
    .lean();

  if (!cart) return [];

  return cart.items.map((i) => ({
    _id: i._id,
    user: userId,
    product: i.product,
    quantity: i.quantity,
    addedAt: i.addedAt,
  }));
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (userId, productId) => {
  const cart = await CartItem.findOne({ user: userId });
  if (!cart) {
    throw new ErrorResponse("Cart is empty", 404);
  }

  const index = cart.items.findIndex(
    (i) => i.product.toString() === productId.toString()
  );
  if (index === -1) {
    throw new ErrorResponse("Cart item not found", 404);
  }

  const removed = cart.items[index];
  cart.items.splice(index, 1);
  await cart.save();

  return {
    _id: removed._id,
    user: userId,
    product: removed.product,
    quantity: removed.quantity,
    addedAt: removed.addedAt,
  };
};
