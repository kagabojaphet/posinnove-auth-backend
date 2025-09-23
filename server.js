import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();

// Trust proxy (needed for Render if behind proxy)
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// Allow dev and prod frontend origins
const allowedOrigins = [
  process.env.CLIENT_URL,       // localhost
  process.env.CLIENT_URL_PROD,  // Vercel
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like Postman)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `CORS not allowed from origin ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.get('/', (req, res) => res.send('🚀 API running'));

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
});
