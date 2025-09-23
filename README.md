# Auth Backend

This is the backend of the authentication system built with **Node.js, Express, and MongoDB**.  
It provides APIs for user registration, login, and authentication.

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/kagabojaphet/posinnove-auth-backend.git
cd auth-backend

2. Install dependencies
bash
npm install

3. Set environment variables
Create a .env file in the project root and add:

.env

PORT=5000
MONGO_URI=<your_mongodb_connection_string>
CLIENT_URL=http://localhost:5173
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=<specify_time>
REFRESH_TOKEN_SECRET=<your_refresh_token_secret>
REFRESH_TOKEN_EXPIRES_IN=<specify-days>
CLIENT_URL_PROD=<your_production_url>
# Email (for nodemailer)
EMAIL_HOST=<your_smtp>
EMAIL_PORT=<your_port>
EMAIL_USER=<your_email>
EMAIL_PASS=<your_password>

4. Run locally
bash
npm run dev

The server will be available at:
http://localhost:5000

5. Run in production
bash
npm start

6. API Endpoints

POST /api/auth/register — Register a new user
POST /api/auth/login — Login a user
POST /api/auth/refresh — Refresh access token
GET /api/auth/me — Get logged-in user info
