// middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

// Apply to auth/login to limit brute-force
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login requests per windowMs
  message: { message: 'Too many login attempts from this IP, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
