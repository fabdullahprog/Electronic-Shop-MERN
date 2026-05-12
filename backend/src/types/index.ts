import { Document, Types } from 'mongoose';
import { Request } from 'express';

// ─── User 
export interface IAddress {
  _id?: Types.ObjectId;
  label: string;
  street: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'user' | 'admin';
  avatar?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpire?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  addresses: IAddress[];
  wishlist: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getEmailVerificationToken(): string;
  getResetPasswordToken(): string;
}

// ─── Category 
export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: Types.ObjectId;
  discount: number;
  isActive: boolean;
  order: number;
}

// ─── Product 
export interface IProductVariant {
  size?: string;
  color?: string;
  weight?: string;
  sku?: string;
  stock: number;
  price?: number;
}

export interface IProductImage {
  url: string;
  public_id: string;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice: number;
  discountPercent: number;
  category: Types.ObjectId;
  brand?: string;
  images: IProductImage[];
  variants: IProductVariant[];
  stock: number;
  sku?: string;
  tags: string[];
  ratings: number;
  numReviews: number;
  isFeatured: boolean;
  isTrending: boolean;
  isActive: boolean;
  isPreOrder: boolean;
  preOrderNote?: string;
  weight?: number;
  offerLabel?: string;
  offerEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Order 
export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  isPreOrder: boolean;
}

export interface IShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
}

export interface IStatusHistory {
  status: string;
  note?: string;
  updatedAt: Date;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: 'COD' | 'bKash' | 'Nagad' | 'Bank' | 'Card';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentInfo?: { transactionId?: string; paidAt?: Date };
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  statusHistory: IStatusHistory[];
  itemsPrice: number;
  discountAmount: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  couponCode?: string;
  note?: string;
  isPreOrder: boolean;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Review 
export interface IReview extends Document {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Discount 
export interface IDiscount extends Document {
  _id: Types.ObjectId;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit: number;
  applicableCategories: Types.ObjectId[];
  applicableProducts: Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

// ─── Request Extensions 
export interface AuthRequest extends Request {
  user?: IUser;
}

// ─── API Response 
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}



