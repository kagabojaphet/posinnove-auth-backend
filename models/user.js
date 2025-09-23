// src/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now }
});

// Prevent OverwriteModelError on hot reloads / nodemon restarts
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
