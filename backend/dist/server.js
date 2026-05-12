"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const app = (0, express_1.default)();
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests, please try again later.',
});
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', limiter);
// Routes
app.use('/api/auth', require('./routes/authRoutes').default);
app.use('/api/products', require('./routes/productRoutes').default);
app.use('/api/categories', require('./routes/categoryRoutes').default);
app.use('/api/orders', require('./routes/orderRoutes').default);
app.use('/api/users', require('./routes/userRoutes').default);
app.use('/api/reviews', require('./routes/reviewRoutes').default);
app.use('/api/upload', require('./routes/uploadRoutes').default);
app.use('/api/discount', require('./routes/discountRoutes').default);
app.use('/api/dashboard', require('./routes/dashboardRoutes').default);
app.use('/api/wishlist', require('./routes/wishlistRoutes').default);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'Electronic_db API is running', timestamp: new Date() });
});
// Error handler
app.use(require('./middleware/errorMiddleware').default);
// Connect MongoDB & Start Server
const PORT = parseInt(process.env.PORT || '5000', 10);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Electronic_db';
mongoose_1.default.connect(MONGO_URI)
    .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
})
    .catch((err) => {
    console.error('MongoDB Error:', err.message);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=server.js.map