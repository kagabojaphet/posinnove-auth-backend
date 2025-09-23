// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/user.js';
import sendEmail from '../utils/email.js';

const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

const signAccessToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
const signRefreshToken = (payload) => jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_EXPIRES });

/* Register */
export const register = async (req, res) => {
  // express-validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array().map(e => e.msg).join(', ') });

  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashed });

    // Send welcome email (fire and forget)
    sendEmail(
      user.email,
      'Welcome to Auth System',
      `<p>Hi ${user.name || ''},</p><p>Thanks for registering.</p>`
    );

    return res.status(201).json({ message: 'Registration successful!', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

/* Login */
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array().map(e => e.msg).join(', ') });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials.' });

    const payload = { id: user._id, name: user.name, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save refresh token in DB
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    // Set refresh token as HTTPOnly cookie (secure in production)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days (match REFRESH_EXPIRES)
    });

    // Send login email (optional) - can be throttled in production
    sendEmail(
      user.email,
      'Login Notification',
      `<p>Hi ${user.name || ''},</p><p>You just signed in to your account.</p>`
    );

    return res.json({
      message: 'Login successful!',
      token: accessToken,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

/* Refresh token endpoint */
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token provided' });

    // verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Refresh token invalid or expired' });
    }

    // find user and check token exists in DB
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const found = user.refreshTokens.find(rt => rt.token === token);
    if (!found) return res.status(401).json({ message: 'Refresh token not recognized' });

    // Issue new access token (optionally rotate refresh token)
    const newAccess = signAccessToken({ id: user._id, name: user.name, email: user.email });

    return res.json({ token: newAccess, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Refresh token error', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

/* Logout: remove refresh token and clear cookie */
export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      // Remove the specific refresh token from DB (if present)
      await User.updateOne({ 'refreshTokens.token': token }, { $pull: { refreshTokens: { token } } });
    }

    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    return res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

/* me - protected by access token middleware */
export const me = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  return res.json({ user: req.user });
};
