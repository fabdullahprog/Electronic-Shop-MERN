import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Category from '../models/Category';
import Product from '../models/Product';
async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/Electronic_db');
  await Category.deleteMany({});
  const cats = await Category.insertMany([
    { name: 'Electronics' }, { name: 'Fashion' }, { name: 'Home & Living' },
    { name: 'Sports & Fitness' }, { name: 'Books' }, { name: 'Beauty & Care' },
    { name: 'Toys & Games' }, { name: 'Food & Grocery' },
  ]);
  await Product.deleteMany({});
  await Product.insertMany([
    { name: 'Wireless Bluetooth Headphones', description: 'High-quality headphones with ANC and 30h battery.', shortDescription: 'Premium audio experience', price: 3500, discountPrice: 2800, category: cats[0]._id, brand: 'SoundMax', stock: 50, isTrending: true, isFeatured: true, ratings: 4.5, numReviews: 28, tags: ['headphones','wireless'], images: [{ url: 'https://placehold.co/500x500?text=Headphones', public_id: 's1' }] },
    { name: 'Smart Fitness Watch', description: 'Advanced smartwatch for health tracking and notifications.', shortDescription: 'Your health companion', price: 8500, discountPrice: 6999, category: cats[0]._id, brand: 'FitPro', stock: 30, isTrending: true, isFeatured: true, ratings: 4.3, numReviews: 45, tags: ['watch','fitness'], images: [{ url: 'https://placehold.co/500x500?text=SmartWatch', public_id: 's2' }] },
    { name: 'Premium Cotton T-Shirt', description: '100% premium cotton available in multiple colors and sizes.', price: 650, category: cats[1]._id, brand: 'StyleWear', stock: 200, isFeatured: true, ratings: 4.1, numReviews: 89, variants: [{ size: 'S', color: 'White', stock: 50 }, { size: 'M', color: 'Blue', stock: 70 }], images: [{ url: 'https://placehold.co/500x500?text=T-Shirt', public_id: 's3' }] },
    { name: 'Ceramic Coffee Mug Set', description: 'Set of 6 beautiful ceramic mugs for morning coffee.', price: 1200, discountPrice: 950, category: cats[2]._id, brand: 'HomeDecor', stock: 75, isTrending: true, ratings: 4.7, numReviews: 34, images: [{ url: 'https://placehold.co/500x500?text=MugSet', public_id: 's4' }] },
    { name: 'Yoga Mat Premium', description: 'Non-slip yoga mat with alignment lines, 6mm thickness.', price: 2200, discountPrice: 1750, category: cats[3]._id, brand: 'YogaPro', stock: 60, isFeatured: true, ratings: 4.6, numReviews: 52, images: [{ url: 'https://placehold.co/500x500?text=YogaMat', public_id: 's5' }] },
    { name: 'Water Bottle Insulated', description: '1L stainless steel bottle: cold 24h, hot 12h.', price: 850, category: cats[3]._id, brand: 'HydroFlask', stock: 0, isTrending: true, ratings: 4.4, numReviews: 67, images: [{ url: 'https://placehold.co/500x500?text=Bottle', public_id: 's6' }] },
  ]);
  console.log('Seed complete! 8 categories + 6 products created.'); process.exit(0);
}
main().catch(err => { console.error(err); process.exit(1); });
