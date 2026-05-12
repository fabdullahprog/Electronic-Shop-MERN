"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.updateOrderStatus = exports.getAllOrders = exports.getOrder = exports.getMyOrders = exports.createOrder = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const Discount_1 = __importDefault(require("../models/Discount"));
const User_1 = __importDefault(require("../models/User"));
const email_1 = require("../utils/email");
const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, couponCode, note } = req.body;
        let itemsPrice = 0;
        let isPreOrder = false;
        const orderItems = [];
        for (const item of items) {
            const product = await Product_1.default.findById(item.product);
            if (!product) {
                res.status(404).json({ success: false, message: `Product not found` });
                return;
            }
            const price = product.discountPrice > 0 ? product.discountPrice : product.price;
            const itemIsPreOrder = product.stock <= 0;
            if (itemIsPreOrder)
                isPreOrder = true;
            orderItems.push({ product: product._id, name: product.name, image: product.images[0]?.url || '', price, quantity: item.quantity, size: item.size, color: item.color, isPreOrder: itemIsPreOrder });
            itemsPrice += price * item.quantity;
            if (!itemIsPreOrder)
                await Product_1.default.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
        }
        const shippingPrice = itemsPrice >= 1000 ? 0 : 80;
        let discountAmount = 0;
        if (couponCode) {
            const discount = await Discount_1.default.findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (discount && discount.endDate > new Date()) {
                if (discount.type === 'percentage')
                    discountAmount = Math.min((itemsPrice * discount.value) / 100, discount.maxDiscountAmount || Infinity);
                else
                    discountAmount = discount.value;
                await Discount_1.default.findByIdAndUpdate(discount._id, { $inc: { usageCount: 1 } });
            }
        }
        const totalPrice = itemsPrice + shippingPrice - discountAmount;
        const order = await Order_1.default.create({ user: req.user._id, items: orderItems, shippingAddress, paymentMethod, paymentStatus: 'pending', itemsPrice, discountAmount, shippingPrice, taxPrice: 0, totalPrice, couponCode, note, isPreOrder, statusHistory: [{ status: 'pending', note: 'Order placed' }] });
        try {
            const user = await User_1.default.findById(req.user._id).select('name email');
            if (user?.email) {
                const { subject, html } = email_1.emailTemplates.orderConfirmation(user.name, order);
                await (0, email_1.sendEmail)({ to: user.email, subject, html });
            }
        }
        catch (e) {
            console.error('Email error:', e);
        }
        const populated = await Order_1.default.findById(order._id).populate('user', 'name email');
        res.status(201).json({ success: true, order: populated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createOrder = createOrder;
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order_1.default.find({ user: req.user._id }).populate('items.product', 'name images').sort({ createdAt: -1 });
        res.json({ success: true, orders });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMyOrders = getMyOrders;
const getOrder = async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id).populate('user', 'name email phone').populate('items.product', 'name images');
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        res.json({ success: true, order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getOrder = getOrder;
const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;
        const query = {};
        if (status)
            query.orderStatus = status;
        if (search)
            query.orderNumber = { $regex: search, $options: 'i' };
        const total = await Order_1.default.countDocuments(query);
        const orders = await Order_1.default.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
        res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllOrders = getAllOrders;
const updateOrderStatus = async (req, res) => {
    try {
        const { status, note, trackingNumber } = req.body;
        const order = await Order_1.default.findById(req.params.id).populate('user', 'name email');
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        order.orderStatus = status;
        order.statusHistory.push({ status, note: note || `Status updated to ${status}`, updatedAt: new Date() });
        if (status === 'delivered')
            order.deliveredAt = new Date();
        if (status === 'cancelled') {
            order.cancelledAt = new Date();
            order.cancelReason = note;
            for (const item of order.items) {
                if (!item.isPreOrder)
                    await Product_1.default.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
            }
        }
        await order.save();
        try {
            const user = order.user;
            if (status === 'processing') {
                const { subject, html } = email_1.emailTemplates.orderApproved(user.name, order);
                await (0, email_1.sendEmail)({ to: user.email, subject, html });
            }
            else if (status === 'shipped') {
                const { subject, html } = email_1.emailTemplates.orderShipped(user.name, order, trackingNumber);
                await (0, email_1.sendEmail)({ to: user.email, subject, html });
            }
        }
        catch (e) {
            console.error('Email error:', e);
        }
        res.json({ success: true, order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const cancelOrder = async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        if (order.user.toString() !== req.user._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        if (!['pending', 'confirmed'].includes(order.orderStatus)) {
            res.status(400).json({ success: false, message: 'Cannot cancel this order' });
            return;
        }
        order.orderStatus = 'cancelled';
        order.cancelledAt = new Date();
        order.cancelReason = req.body.reason;
        order.statusHistory.push({ status: 'cancelled', note: req.body.reason || 'Cancelled by user', updatedAt: new Date() });
        for (const item of order.items) {
            if (!item.isPreOrder)
                await Product_1.default.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
        await order.save();
        res.json({ success: true, order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.cancelOrder = cancelOrder;
//# sourceMappingURL=orderController.js.map