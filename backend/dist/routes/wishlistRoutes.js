"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wishlistController_1 = require("../controllers/wishlistController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.protect, wishlistController_1.getWishlist);
router.put('/:productId', authMiddleware_1.protect, wishlistController_1.toggleWishlist);
exports.default = router;
//# sourceMappingURL=wishlistRoutes.js.map