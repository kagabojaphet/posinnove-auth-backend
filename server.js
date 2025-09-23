// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();

// Trust Render proxy (needed for rate-limit, cookies, etc.)
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// Allow both local and deployed frontend URLs
const allowedOrigins = [
  'http://localhost:5173', // local frontend
  process.env.CLIENT_URL   // deployed frontend (Vercel)
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => res.send('🚀 API running'));

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}).catch(err => {
  console.error('Failed to connect to DB', err);
});
