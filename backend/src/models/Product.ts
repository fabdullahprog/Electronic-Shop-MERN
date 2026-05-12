import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';
import { IProduct } from '../types';

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: [true, 'Description is required'] },
    shortDescription: String,
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, trim: true, default: '' },
    images: [{ url: String, public_id: String }],
    variants: [{
      size: String, color: String, weight: String,
      sku: String, stock: { type: Number, default: 0 }, price: Number,
    }],
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    tags: [String],
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isPreOrder: { type: Boolean, default: false },
    preOrderNote: String,
    weight: Number,
    offerLabel: String,
    offerEndDate: Date,
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  if (this.price && this.discountPrice) {
    this.discountPercent = Math.round(((this.price - this.discountPrice) / this.price) * 100);
   }
  next();
});

productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1, brand: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
