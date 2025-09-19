const asyncHandler = require("../middleware/async");
const orderService = require("../services/orderService");

// Tạo đơn hàng từ giỏ hàng
exports.createOrder = asyncHandler(async (req, res, next) => {
  const order = await orderService.createOrder(req.user.id);
  res.status(201).json({ success: true, data: order });
});

// Lấy danh sách đơn hàng của người dùng
exports.getOrders = asyncHandler(async (req, res, next) => {
  const orders = await orderService.getOrders(req.user.id);
  res.status(200).json({ success: true, data: orders });
});

// Lấy chi tiết đơn hàng
exports.getOrderDetails = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const orderDetails = await orderService.getOrderDetails(orderId);
  res.status(200).json({ success: true, data: orderDetails });
});

// ========== ADMIN ORDER MANAGEMENT ==========

// Lấy tất cả orders (admin only)
exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const result = await orderService.getAllOrders(req.query);
  res.status(200).json({
    success: true,
    count: result.pagination.totalItems,
    data: result.orders,
  });
});

// Lấy order theo ID (admin only)
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const order = await orderService.getOrderById(req.params.id);
  res.status(200).json({
    success: true,
    data: order,
  });
});

// Cập nhật trạng thái order (admin only)
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, status);
  res.status(200).json({
    success: true,
    data: order,
  });
});

// Xóa order (admin only)
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  await orderService.deleteOrder(req.params.id);
  res.status(200).json({
    success: true,
    data: {},
  });
});

// Lấy thống kê orders (admin only)
exports.getOrderStats = asyncHandler(async (req, res, next) => {
  const stats = await orderService.getOrderStats();
  res.status(200).json({
    success: true,
    data: stats,
  });
});
