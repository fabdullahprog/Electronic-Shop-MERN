import { Request, Response } from 'express';
import Discount from '../models/Discount';

export const getDiscounts = async (_req: Request, res: Response): Promise<void> => {
  try { const discounts = await Discount.find().sort({ createdAt: -1 }); res.json({ success: true, discounts }); } catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
export const createDiscount = async (req: Request, res: Response): Promise<void> => {
  try { const d = await Discount.create(req.body); res.status(201).json({ success: true, discount: d }); } catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
export const updateDiscount = async (req: Request, res: Response): Promise<void> => {
  try { const d = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, discount: d }); } catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
export const deleteDiscount = async (req: Request, res: Response): Promise<void> => {
  try { await Discount.findByIdAndDelete(req.params.id); res.json({ success: true, message: 'Deleted' }); } catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, cartTotal } = req.body;
    const discount = await Discount.findOne({ code: code.toUpperCase(), isActive: true });
    if (!discount) { res.status(404).json({ success: false, message: 'Invalid coupon code' }); return; }
    if (discount.endDate < new Date()) { res.status(400).json({ success: false, message: 'Coupon expired' }); return; }
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) { res.status(400).json({ success: false, message: 'Coupon usage limit reached' }); return; }
    if (cartTotal < discount.minOrderAmount) { res.status(400).json({ success: false, message: `Min order BDT ${discount.minOrderAmount}` }); return; }
    let discountAmount = discount.type === 'percentage' ? Math.min((cartTotal * discount.value) / 100, discount.maxDiscountAmount || Infinity) : discount.value;
    res.json({ success: true, discount, discountAmount });
  } catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
