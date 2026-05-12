"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCoupon = exports.deleteDiscount = exports.updateDiscount = exports.createDiscount = exports.getDiscounts = void 0;
const Discount_1 = __importDefault(require("../models/Discount"));
const getDiscounts = async (_req, res) => {
    try {
        const discounts = await Discount_1.default.find().sort({ createdAt: -1 });
        res.json({ success: true, discounts });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.getDiscounts = getDiscounts;
const createDiscount = async (req, res) => {
    try {
        const d = await Discount_1.default.create(req.body);
        res.status(201).json({ success: true, discount: d });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.createDiscount = createDiscount;
const updateDiscount = async (req, res) => {
    try {
        const d = await Discount_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, discount: d });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.updateDiscount = updateDiscount;
const deleteDiscount = async (req, res) => {
    try {
        await Discount_1.default.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Deleted' });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.deleteDiscount = deleteDiscount;
const validateCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        const discount = await Discount_1.default.findOne({ code: code.toUpperCase(), isActive: true });
        if (!discount) {
            res.status(404).json({ success: false, message: 'Invalid coupon code' });
            return;
        }
        if (discount.endDate < new Date()) {
            res.status(400).json({ success: false, message: 'Coupon expired' });
            return;
        }
        if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
            res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
            return;
        }
        if (cartTotal < discount.minOrderAmount) {
            res.status(400).json({ success: false, message: `Min order BDT ${discount.minOrderAmount}` });
            return;
        }
        let discountAmount = discount.type === 'percentage' ? Math.min((cartTotal * discount.value) / 100, discount.maxDiscountAmount || Infinity) : discount.value;
        res.json({ success: true, discount, discountAmount });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
exports.validateCoupon = validateCoupon;
//# sourceMappingURL=discountController.js.map