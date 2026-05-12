"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplates = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const getSmtpConfig = () => {
    const smtpPort = parseInt(process.env.EMAIL_PORT || '587', 10);
    const smtpHost = process.env.EMAIL_HOST || '';
    const smtpUser = process.env.EMAIL_USER || '';
    const smtpPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');
    const fromEmail = process.env.EMAIL_FROM || smtpUser;
    const fromName = process.env.EMAIL_FROM_NAME || 'Electronic_db';
    if (!smtpHost || !smtpUser || !smtpPass) {
        throw new Error('Email configuration is missing');
    }
    return { smtpPort, smtpHost, smtpUser, smtpPass, fromEmail, fromName };
};
const sendEmail = async (options) => {
    const { smtpPort, smtpHost, smtpUser, smtpPass, fromEmail, fromName } = getSmtpConfig();
    const transporter = nodemailer_1.default.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
    });
    await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        ...options,
    });
};
exports.sendEmail = sendEmail;
const baseStyle = `font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;`;
const headerStyle = `background:#6C63FF;padding:30px;text-align:center;border-radius:8px 8px 0 0;`;
const bodyStyle = `background:white;padding:30px;border-radius:0 0 8px 8px;`;
exports.emailTemplates = {
    verifyEmail: (name, verificationUrl) => ({
        subject: 'Verify Your Email - Electronic_db',
        html: `<div style="${baseStyle}">
      <div style="${headerStyle}"><h1 style="color:white;margin:0;">Electronic_db</h1></div>
      <div style="${bodyStyle}">
        <h2>Hello, ${name}!</h2>
        <p style="color:#666;line-height:1.7;">Thank you for registering. Please verify your email to activate your account.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${verificationUrl}" style="background:#6C63FF;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">Verify Email Address</a>
        </div>
        <p style="color:#999;font-size:13px;">Link expires in 24 hours. If you didn't register, ignore this email.</p>
      </div></div>`,
    }),
    orderConfirmation: (name, order) => ({
        subject: `Order Confirmed #${order.orderNumber} - Electronic_db`,
        html: `<div style="${baseStyle}">
      <div style="${headerStyle}"><h1 style="color:white;margin:0;">Electronic_db</h1></div>
      <div style="${bodyStyle}">
        <h2 style="color:#28a745;">Order Confirmed!</h2>
        <p>Hello <strong>${name}</strong>, your order has been confirmed and payment received.</p>
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-BD')}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod}</p>
          <p><strong>Total:</strong> BDT ${order.totalPrice.toFixed(2)}</p>
        </div>
        <h3>Items:</h3>
        ${order.items.map(i => `<p>• ${i.name} × ${i.quantity} = BDT ${(i.price * i.quantity).toFixed(2)}</p>`).join('')}
        <p style="color:#666;margin-top:20px;">We'll notify you when your order is on its way!</p>
      </div></div>`,
    }),
    orderApproved: (name, order) => ({
        subject: `Order Approved & Processing #${order.orderNumber} - Electronic_db`,
        html: `<div style="${baseStyle}">
      <div style="${headerStyle}"><h1 style="color:white;margin:0;">Electronic_db</h1></div>
      <div style="${bodyStyle}">
        <h2 style="color:#6C63FF;">Delivery Process Started!</h2>
        <p>Hello <strong>${name}</strong>, great news! Your order has been approved and delivery process has started.</p>
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
          <p><strong>Order #:</strong> ${order.orderNumber}</p>
          <p><strong>Status:</strong> Processing for Delivery</p>
          <p><strong>Total:</strong> BDT${order.totalPrice.toFixed(2)}</p>
        </div>
        <p style="color:#666;">You'll receive another notification once shipped with tracking details.</p>
      </div></div>`,
    }),
    orderShipped: (name, order, trackingNumber) => ({
        subject: `Order Shipped #${order.orderNumber} - Electronic_db`,
        html: `<div style="${baseStyle}">
      <div style="${headerStyle}"><h1 style="color:white;margin:0;">Electronic_db</h1></div>
      <div style="${bodyStyle}">
        <h2 style="color:#17a2b8;">Order Shipped!</h2>
        <p>Hello <strong>${name}</strong>, your order is on its way!</p>
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
          <p><strong>Order #:</strong> ${order.orderNumber}</p>
          ${trackingNumber ? `<p><strong>Tracking #:</strong> ${trackingNumber}</p>` : ''}
          <p><strong>Est. Delivery:</strong> 3-5 business days</p>
        </div>
      </div></div>`,
    }),
    resetPassword: (name, resetUrl) => ({
        subject: 'Reset Your Password - Electronic_db',
        html: `<div style="${baseStyle}">
      <div style="${headerStyle}"><h1 style="color:white;margin:0;">Electronic_db</h1></div>
      <div style="${bodyStyle}">
        <h2>Password Reset</h2>
        <p>Hello <strong>${name}</strong>, you requested to reset your password.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${resetUrl}" style="background:#dc3545;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">Reset Password</a>
        </div>
        <p style="color:#999;font-size:13px;">Expires in 30 minutes. Ignore if you didn't request this.</p>
      </div></div>`,
    }),
};
//# sourceMappingURL=email.js.map