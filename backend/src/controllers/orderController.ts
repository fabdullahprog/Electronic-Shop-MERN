import { Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import Discount from "../models/Discount";
import { sendEmail, emailTemplates } from "../utils/email";
import { AuthRequest } from "../types";

export const createOrder = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, note } =
      req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res
        .status(400)
        .json({ success: false, message: "No order items provided" });
      return;
    }

    let itemsPrice = 0;
    let isPreOrder = false;
    const orderItems = [];

    // ---------- 1. Process each item ----------
    for (const item of items) {
      if (!item.quantity || Number(item.quantity) < 1) {
        res
          .status(400)
          .json({ success: false, message: "Invalid item quantity" });
        return;
      }

      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404).json({ success: false, message: `Product not found` });
        return;
      }

      const hasSufficientStock = product.stock >= item.quantity;
      const itemIsPreOrder = Boolean(product.isPreOrder) && !hasSufficientStock;

      // For non‑pre‑order products, enforce stock availability
      if (!itemIsPreOrder && !hasSufficientStock) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} left.`,
        });
        return;
      }

      // Use best available price
      const price =
        product.discountPrice > 0 ? product.discountPrice : product.price;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || "",
        price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        isPreOrder: itemIsPreOrder,
      });

      itemsPrice += price * item.quantity;

      // Atomically decrement stock for non‑pre‑order products (Race condition protection)
      if (!itemIsPreOrder) {
        const updated = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true },
        );

        if (!updated) {
          res.status(400).json({
            success: false,
            message: `Stock changed while placing the order for "${product.name}". Please try again or reduce quantity.`,
          });
          return;
        }
      } else {
        isPreOrder = true;
      }
    }

    const shippingPrice = itemsPrice >= 1000 ? 0 : 80;
    let discountAmount = 0;

    // Apply coupon if valid
    if (couponCode) {
      const discount = await Discount.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });
      if (discount && discount.endDate > new Date()) {
        discountAmount =
          discount.type === "percentage"
            ? Math.min(
                (itemsPrice * discount.value) / 100,
                discount.maxDiscountAmount || Infinity,
              )
            : discount.value;

        await Discount.findByIdAndUpdate(discount._id, {
          $inc: { usageCount: 1 },
        });
      }
    }

    const totalPrice = itemsPrice + shippingPrice - discountAmount;

    const order = await Order.create({
      user: req.user!._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: "pending",
      itemsPrice,
      discountAmount,
      shippingPrice,
      taxPrice: 0,
      totalPrice,
      couponCode,
      note,
      isPreOrder,
      statusHistory: [{ status: "pending", note: "Order placed" }],
    });

    // Send confirmation email
    try {
      const { subject, html } = emailTemplates.orderSubmitted(
        req.user!.name,
        order,
      );
      await sendEmail({ to: req.user!.email, subject, html });
    } catch (e) {
      console.error("Email error:", e);
    }

    const populated = await Order.findById(order._id).populate(
      "user",
      "name email",
    );
    res.status(201).json({ success: true, order: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getMyOrders = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user!._id })
      .populate("items.product", "name images")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getOrder = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.product", "name images");
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    if (
      order.user._id.toString() !== req.user!._id.toString() &&
      req.user!.role !== "admin"
    ) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getAllOrders = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query: Record<string, unknown> = {};
    if (status) query.orderStatus = status;
    if (search) query.orderNumber = { $regex: search, $options: "i" };
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    res.json({
      success: true,
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { status, note, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    // ---------- Pre‑order stock validation ----------
    if (["shipped", "delivered"].includes(status)) {
      const preorderItems = order.items.filter((item) => item.isPreOrder);

      for (const item of preorderItems) {
        const product = await Product.findById(item.product);
        if (!product || product.stock < item.quantity) {
          const availableStock = product?.stock ?? 0;
          res.status(400).json({
            success: false,
            message: `Cannot mark this order as "${status}". Stock is not available for pre-order item "${item.name}". Required: ${item.quantity}, Available: ${availableStock}. Please update product stock.`,
          });
          return;
        }
      }

      // Reserve stock for pre-order items once shipment/delivery starts
      for (const item of preorderItems) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true },
        );
        if (!updated) {
          res.status(400).json({
            success: false,
            message: `${item.name} stock is insufficient for shipment.`,
          });
          return;
        }
        item.isPreOrder = false;
      }
      order.isPreOrder = order.items.some((item) => item.isPreOrder);
    }

    // Update the order status and history
    order.orderStatus = status;
    order.statusHistory.push({
      status,
      note: note || `Status updated to ${status}`,
      updatedAt: new Date(),
    });

    if (status === "delivered") order.deliveredAt = new Date();

    if (status === "cancelled") {
      order.cancelledAt = new Date();
      order.cancelReason = note;
      // Restore stock for non‑pre‑order items
      for (const item of order.items) {
        if (!item.isPreOrder) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
      }
    }

    await order.save();

    // Send email notifications
    try {
      const user = order.user as unknown as { name: string; email: string };
      if (status === "pending") {
        const { subject, html } = emailTemplates.orderSubmitted(
          user.name,
          order,
        );
        await sendEmail({ to: user.email, subject, html });
      } else if (status === "confirmed") {
        const { subject, html } = emailTemplates.orderConfirmed(
          user.name,
          order,
        );
        await sendEmail({ to: user.email, subject, html });
      } else if (status === "processing") {
        const { subject, html } = emailTemplates.orderApproved(
          user.name,
          order,
        );
        await sendEmail({ to: user.email, subject, html });
      } else if (status === "shipped") {
        const { subject, html } = emailTemplates.orderShipped(
          user.name,
          order,
          trackingNumber,
        );
        await sendEmail({ to: user.email, subject, html });
      } else if (status === "delivered") {
        const { subject, html } = emailTemplates.orderDelivered(
          user.name,
          order,
        );
        await sendEmail({ to: user.email, subject, html });
      } else if (status === "cancelled") {
        // নতুন যুক্ত করা ক্যান্সেল মেইল লজিক
        const { subject, html } = emailTemplates.orderCancelled(
          user.name,
          order,
          note,
        );
        await sendEmail({ to: user.email, subject, html });
      }
    } catch (e) {
      console.error("Email error:", e);
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const cancelOrder = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    if ((order.user as any)._id.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }
    if (!["pending", "confirmed"].includes(order.orderStatus)) {
      res
        .status(400)
        .json({ success: false, message: "Cannot cancel this order" });
      return;
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason;
    order.statusHistory.push({
      status: "cancelled",
      note: req.body.reason || "Cancelled by user",
      updatedAt: new Date(),
    });

    // Restore stock for non‑pre‑order items
    for (const item of order.items) {
      if (!item.isPreOrder) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }
    await order.save();

    // Send cancellation email
    try {
      const user = order.user as unknown as { name: string; email: string };
      const { subject, html } = emailTemplates.orderCancelled(
        user.name,
        order,
        req.body.reason,
      );
      await sendEmail({ to: user.email, subject, html });
    } catch (e) {
      console.error("Email error:", e);
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const deleteOrder = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    const isOwner = order.user.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === "admin";

    if (!isOwner && !isAdmin) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    if (order.orderStatus !== "cancelled") {
      res
        .status(400)
        .json({
          success: false,
          message: "Only cancelled orders can be deleted",
        });
      return;
    }

    await order.deleteOne();
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
