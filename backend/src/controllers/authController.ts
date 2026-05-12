import { Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import { sendEmail, emailTemplates } from '../utils/email';
import { AuthRequest } from '../types';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) { res.status(400).json({ success: false, message: 'Email already registered' }); return; }
    const user = await User.create({ name, email, password, phone });
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    const { subject, html } = emailTemplates.verifyEmail(user.name, verificationUrl);
    await sendEmail({ to: user.email, subject, html });
    res.status(201).json({ success: true, message: 'Registration successful! Please check your email to verify your account.' });
  } catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};

export const verifyEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ emailVerificationToken: hashedToken, emailVerificationExpire: { $gt: Date.now() } });
    if (!user) { res.status(400).json({ success: false, message: 'Invalid or expired verification token' }); return; }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();
    res.json({ success: true, message: 'Email verified successfully! You can now login.' });
  } catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ success: false, message: 'Please provide email and password' }); return; }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) { res.status(401).json({ success: false, message: 'Invalid email or password' }); return; }
    if (!user.isEmailVerified) { res.status(401).json({ success: false, message: 'Please verify your email before logging in' }); return; }
    if (!user.isActive) { res.status(401).json({ success: false, message: 'Your account has been deactivated' }); return; }
    const token = generateToken(user._id.toString(), user.role);
    res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone, isEmailVerified: user.isEmailVerified } });
  } catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};

export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) { res.status(404).json({ success: false, message: 'No user with that email' }); return; }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const { subject, html } = emailTemplates.resetPassword(user.name, resetUrl);
    try {
      await sendEmail({ to: user.email, subject, html });
      res.json({ success: true, message: 'Password reset email sent' });
    } catch {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) { res.status(400).json({ success: false, message: 'Invalid or expired reset token' }); return; }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?._id);
  res.json({ success: true, user });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.user?._id, { name: req.body.name, phone: req.body.phone, avatar: req.body.avatar }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('+password');
    if (!user || !(await user.matchPassword(req.body.currentPassword))) { res.status(400).json({ success: false, message: 'Current password is incorrect' }); return; }
    user.password = req.body.newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};

export const resendVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    if (user.isEmailVerified) { res.status(400).json({ success: false, message: 'Email already verified' }); return; }
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    const { subject, html } = emailTemplates.verifyEmail(user.name, verificationUrl);
    await sendEmail({ to: user.email, subject, html });
    res.json({ success: true, message: 'Verification email resent' });
  } catch (error) { res.status(500).json({ success: false, message: (error as Error).message }); }
};
