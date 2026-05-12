"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.get('/verify-email/:token', authController_1.verifyEmail);
router.post('/forgot-password', authController_1.forgotPassword);
router.put('/reset-password/:token', authController_1.resetPassword);
router.post('/resend-verification', authController_1.resendVerification);
router.get('/me', authMiddleware_1.protect, authController_1.getMe);
router.put('/update-profile', authMiddleware_1.protect, authController_1.updateProfile);
router.put('/change-password', authMiddleware_1.protect, authController_1.changePassword);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map