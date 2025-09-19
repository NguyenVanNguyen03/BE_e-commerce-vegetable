const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderDetails,
  // Admin functions
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

// User routes
router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:orderId", getOrderDetails);

router.get("/admin/orders/stats", authorize("admin"), getOrderStats);
router.get("/admin/orders", authorize("admin"), getAllOrders);
router.put("/admin/orders/:id/status", authorize("admin"), updateOrderStatus);
router.delete("/admin/orders/:id", authorize("admin"), deleteOrder);
router.get("/admin/orders/:id", authorize("admin"), getOrderById);

module.exports = router;
