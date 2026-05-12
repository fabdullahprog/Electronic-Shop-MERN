import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from '../models/User';
async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/Electronic_db');
  const existing = await User.findOne({ email: 'admin@Electronic.com' });
  if (existing) { console.log('Admin already exists'); process.exit(0); }
  await User.create({ name: 'Admin', email: 'admin@Electronic.com', password: 'Admin20262026', role: 'admin', isEmailVerified: true });
  console.log('Admin created! Email: admin@Electronic.com | Password: Admin20262026');
  process.exit(0);
}
main().catch(err => { console.error(err); process.exit(1); });
