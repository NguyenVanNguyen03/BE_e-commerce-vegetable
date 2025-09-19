const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const CartItem = require("../models/CartItem");
const ErrorResponse = require("../utils/errorResponse");

// Tạo đơn hàng từ giỏ hàng
exports.createOrder = async (userId) => {
  // Ensure user has phone and address before creating order
  const User = require("../models/User");
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse("User not found", 404);
  }
  if (!user.phone || !user.address) {
    throw new ErrorResponse(
      "Phone and address are required to place an order",
      400
    );
  }
  const cart = await CartItem.findOne({ user: userId }).populate(
    "items.product",
    "price salePrice"
  );
  if (!cart || cart.items.length === 0) {
    throw new ErrorResponse("Cart is empty", 400);
  }

  // Filter out items whose product no longer exists
  const validItems = cart.items.filter((item) => item.product);
  if (validItems.length !== cart.items.length) {
    // Remove invalid items from cart to keep state consistent
    cart.items = validItems;
    await cart.save();
  }
  if (validItems.length === 0) {
    throw new ErrorResponse("Products in cart are no longer available", 400);
  }

  const totalAmount = validItems.reduce((sum, item) => {
    const unitPrice = item.product.salePrice || item.product.price || 0;
    return sum + unitPrice * item.quantity;
  }, 0);

  const order = await Order.create({ user: userId, totalAmount });

  const orderDetails = validItems.map((item) => ({
    order: order._id,
    product: item.product._id,
    quantity: item.quantity,
    priceEach: item.product.salePrice || item.product.price || 0,
  }));

  await OrderDetail.insertMany(orderDetails);
  await CartItem.deleteOne({ user: userId });

  return order;
};

// Lấy danh sách đơn hàng của người dùng
exports.getOrders = async (userId) => {
  return await Order.find({ user: userId }).sort("-createdAt");
};

// Lấy chi tiết đơn hàng
exports.getOrderDetails = async (orderId) => {
  return await OrderDetail.find({ order: orderId }).populate(
    "product",
    "name price imageUrl"
  );
};

// ========== ADMIN ORDER MANAGEMENT ==========

// Lấy tất cả orders (admin only)
exports.getAllOrders = async (query) => {
  const { page = 1, limit = 10, status, userId, startDate, endDate } = query;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.user = userId;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const orders = await Order.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(filter);

  return {
    orders,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    },
  };
};

// Lấy order theo ID (admin only)
exports.getOrderById = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("user", "name email")
    .populate({
      path: "orderDetails",
      populate: {
        path: "product",
        select: "name price imageUrl",
      },
    });

  if (!order) {
    throw new ErrorResponse("Order not found", 404);
  }

  return order;
};

// Cập nhật trạng thái order (admin only)
exports.updateOrderStatus = async (orderId, status) => {
  const validStatuses = ["processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new ErrorResponse("Invalid order status", 400);
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true, runValidators: true }
  ).populate("user", "name email");

  if (!order) {
    throw new ErrorResponse("Order not found", 404);
  }

  return order;
};

// Xóa order (admin only)
exports.deleteOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ErrorResponse("Order not found", 404);
  }

  // Xóa order details trước
  await OrderDetail.deleteMany({ order: orderId });
  // Xóa order
  await Order.findByIdAndDelete(orderId);
};

// Lấy thống kê orders (admin only)
exports.getOrderStats = async () => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$totalAmount" },
      },
    },
  ]);

  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$totalAmount" },
      },
    },
  ]);

  return {
    statusStats: stats,
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
  };
};
