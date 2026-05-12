"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const User_1 = __importDefault(require("../models/User"));
async function main() {
    await mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/Electronic_db');
    const existing = await User_1.default.findOne({ email: 'admin@Electronic.com' });
    if (existing) {
        console.log('Admin already exists');
        process.exit(0);
    }
    await User_1.default.create({ name: 'Admin', email: 'admin@Electronic.com', password: 'Admin20262026', role: 'admin', isEmailVerified: true });
    console.log('Admin created! Email: admin@Electronic.com | Password: Admin20262026');
    process.exit(0);
}
main().catch(err => { console.error(err); process.exit(1); });
//# sourceMappingURL=createAdmin.js.map