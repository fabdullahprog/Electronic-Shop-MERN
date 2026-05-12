// ─── User 
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  avatar?: string;
  isEmailVerified: boolean;
  addresses?: Address[];
  wishlist?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Address {
  _id?: string;
  label: string;
  street: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
  isDefault: boolean;
}

// ─── Category 
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: Category;
  discount: number;
  isActive: boolean;
  order: number;
}

// ─── Product 
export interface ProductImage {
  url: string;
  public_id: string;
}

export interface ProductVariant {
  size?: string;
  color?: string;
  weight?: string;
  sku?: string;
  stock: number;
  price?: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice: number;
  discountPercent: number;
  category: Category;
  brand?: string;
  images: ProductImage[];
  variants: ProductVariant[];
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
  offerLabel?: string;
  weight?: number;
  createdAt: string;
}

// ─── Cart 
export interface CartItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  stock: number;
  quantity: number;
  size: string;
  color: string;
  isPreOrder: boolean;
}

// ─── Order 
export interface OrderItem {
  product: string | Product;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  isPreOrder: boolean;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
}

export interface StatusHistory {
  status: string;
  note?: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentMethod = 'COD' | 'bKash' | 'Nagad' | 'Bank' | 'Card';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: StatusHistory[];
  itemsPrice: number;
  discountAmount: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  couponCode?: string;
  note?: string;
  isPreOrder: boolean;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Review 
export interface Review {
  _id: string;
  product: string;
  user: { _id: string; name: string; avatar?: string };
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

// ─── Discount 
export interface Discount {
  _id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  endDate: string;
  isActive: boolean;
}

// ─── Dashboard 
export interface DashboardStats {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalRevenue: number;
}

export interface MonthlyRevenue {
  _id: { year: number; month: number };
  revenue: number;
  orders: number;
}

// ─── API 
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pages: number;
}

// ─── Filter 
export interface ProductFilters {
  keyword?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number;
  featured?: string;
  trending?: string;
  inStock?: string;
}
