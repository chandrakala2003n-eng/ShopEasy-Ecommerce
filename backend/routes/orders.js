const Product = require("../models/Product");
const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Create a new order (logged-in users only)
// Create a new order (logged-in users only)
router.post("/", protect, async (req, res) => {
  const reservedProducts = [];

  // Restore reserved stock if order creation fails
  const restoreStock = async () => {
    for (const item of reservedProducts) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }
  };

  try {
    const { items, address, totalAmount } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !address?.trim() ||
      !Number.isFinite(Number(totalAmount)) ||
      Number(totalAmount) < 0
    ) {
      return res.status(400).json({
        message: "Valid order details are required",
      });
    }

    const validItems = items.every(
      (item) =>
        item.productId !== undefined &&
        item.title?.trim() &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) >= 0 &&
        Number.isInteger(Number(item.quantity)) &&
        Number(item.quantity) > 0
    );

    if (!validItems) {
      return res.status(400).json({
        message: "Invalid product details in order",
      });
    }

    // Combine quantities if the same MongoDB product appears more than once
    const mongoQuantities = {};

    for (const item of items) {
      const productId = String(item.productId);

      if (productId.startsWith("mongo-")) {
        const mongoId = productId.replace("mongo-", "");

        if (!/^[a-fA-F0-9]{24}$/.test(mongoId)) {
          return res.status(400).json({
            message: "Invalid MongoDB product ID",
          });
        }

        mongoQuantities[mongoId] =
          (mongoQuantities[mongoId] || 0) + Number(item.quantity);
      }
    }

    // Reserve stock for MongoDB products
    for (const [productId, quantity] of Object.entries(mongoQuantities)) {
      const product = await Product.findOneAndUpdate(
        {
          _id: productId,
          stock: { $gte: quantity },
        },
        {
          $inc: { stock: -quantity },
        },
        { new: true }
      );

      if (!product) {
        await restoreStock();

        return res.status(400).json({
          message: "Insufficient stock or product not found.",
        });
      }

      reservedProducts.push({ productId, quantity });
    }

    const order = new Order({
      userId: req.user._id,
      email: req.user.email,
      items,
      address: address.trim(),
      totalAmount: Number(totalAmount),
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Order error:", error);

    try {
      await restoreStock();
    } catch (restoreError) {
      console.error("Stock restoration error:", restoreError);
    }

    res.status(500).json({
      message: "Failed to place order",
    });
  }
});

// Get all customer orders (Admin only)
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Fetch all orders error:", error);

    res.status(500).json({
      message: "Failed to fetch all orders",
    });
  }
});

// Cancel order by customer (logged-in user only)
router.put("/cancel/:orderId", protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Customers can cancel only before shipping
    if (!["Order Placed", "Processing"].includes(order.status)) {
      return res.status(400).json({
        message: "This order cannot be cancelled now.",
      });
    }

    // Restore stock for MongoDB products
    const mongoQuantities = {};

    for (const item of order.items) {
      const productId = String(item.productId);

      if (productId.startsWith("mongo-")) {
        const mongoId = productId.replace("mongo-", "");

        if (/^[a-fA-F0-9]{24}$/.test(mongoId)) {
          mongoQuantities[mongoId] =
            (mongoQuantities[mongoId] || 0) + Number(item.quantity);
        }
      }
    }

    for (const [productId, quantity] of Object.entries(mongoQuantities)) {
      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: quantity },
      });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Customer cancellation error:", error);

    res.status(500).json({
      message: "Failed to cancel order",
    });
  }
});

// Get orders for the logged-in user only
router.get("/:userId", protect, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({
        message: "You are not allowed to view these orders",
      });
    }

    const orders = await Order.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
});

// Update order status (Admin only)
// Update order status (Admin only)
router.put("/status/:orderId", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Order Placed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Do not reactivate an already cancelled order
    if (order.status === "Cancelled" && status !== "Cancelled") {
      return res.status(400).json({
        message: "A cancelled order cannot be reactivated",
      });
    }

    // Check previous status before updating
const wasAlreadyCancelled = order.status === "Cancelled";

// Save the new status
order.status = status;
await order.save();

// Restore stock only on the first cancellation
if (status === "Cancelled" && !wasAlreadyCancelled) {

      for (const item of order.items) {
        const productId = String(item.productId);

        if (productId.startsWith("mongo-")) {
          const mongoId = productId.replace("mongo-", "");

          if (/^[a-fA-F0-9]{24}$/.test(mongoId)) {
            mongoQuantities[mongoId] =
              (mongoQuantities[mongoId] || 0) + Number(item.quantity);
          }
        }
      }

      for (const [productId, quantity] of Object.entries(mongoQuantities)) {
        await Product.findByIdAndUpdate(productId, {
          $inc: { stock: quantity },
        });
      }
    }

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    res.status(500).json({
      message: "Failed to update order status",
    });
  }
});

module.exports = router;
