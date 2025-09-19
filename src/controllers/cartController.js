const asyncHandler = require("../middleware/async");
const cartService = require("../services/cartService");

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const cartItem = await cartService.addToCart(
    req.user.id,
    productId,
    quantity
  );
  res.status(200).json({ success: true, data: cartItem });
});

// Cập nhật số lượng sản phẩm trong giỏ
exports.updateQuantity = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const cartItem = await cartService.updateQuantity(
    req.user.id,
    productId,
    Number(quantity)
  );
  res.status(200).json({ success: true, data: cartItem });
});

// Lấy giỏ hàng của người dùng
exports.getCart = asyncHandler(async (req, res, next) => {
  const cart = await cartService.getCart(req.user.id);
  res.status(200).json({ success: true, data: cart });
});

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const cartItem = await cartService.removeFromCart(req.user.id, productId);
  res.status(200).json({ success: true, data: cartItem });
});
