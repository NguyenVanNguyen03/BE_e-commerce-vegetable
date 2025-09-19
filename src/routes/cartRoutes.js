const express = require("express");
const {
  addToCart,
  getCart,
  removeFromCart,
  updateQuantity,
} = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", addToCart);
router.get("/", getCart);
router.put("/:productId", updateQuantity);
router.delete("/:productId", removeFromCart);

module.exports = router;
