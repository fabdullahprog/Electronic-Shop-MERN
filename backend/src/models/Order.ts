import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IOrder } from '../types';

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true, default: () => 'ORD-' + uuidv4().slice(0, 8).toUpperCase() },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      name: String, image: String,
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
      size: String, color: String,
      isPreOrder: { type: Boolean, default: false },
    }],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: String, zip: String,
      country: { type: String, default: 'Bangladesh' },
    },
    paymentMethod: { type: String, enum: ['COD', 'bKash', 'Nagad', 'Bank', 'Card'], default: 'COD' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paymentInfo: { transactionId: String, paidAt: Date },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    statusHistory: [{ status: String, note: String, updatedAt: { type: Date, default: Date.now } }],
    itemsPrice: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    taxPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    couponCode: String,
    note: String,
    isPreOrder: { type: Boolean, default: false },
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

export default mongoose.model<IOrder>('Order', orderSchema);
