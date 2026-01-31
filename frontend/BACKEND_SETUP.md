# Backend & Database Setup Guide

## 📊 Database Schema Overview

### MongoDB Collections Created:

#### 1. **Sellers Collection**
```json
{
  "fullName": "string",
  "email": "string (unique)",
  "password": "string (hashed)",
  "phone": "string",
  "storeName": "string",
  "businessType": "individual|small_business|corporation",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "taxId": "string",
  "bankAccount": "string",
  "idDocument": {
    "fileName": "string",
    "uploadDate": "date",
    "verified": "boolean"
  },
  "isVerified": "boolean",
  "verifiedAt": "date",
  "rating": "number (0-5)",
  "totalSales": "number",
  "totalOrders": "number",
  "totalProducts": "number",
  "isActive": "boolean",
  "createdAt": "date",
  "updatedAt": "date"
}
```

#### 2. **Users Collection**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string (unique)",
  "password": "string (hashed)",
  "phone": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "totalOrders": "number",
  "totalSpent": "number",
  "isActive": "boolean",
  "emailVerified": "boolean",
  "preferences": {
    "newsletter": "boolean",
    "notifications": "boolean"
  },
  "createdAt": "date",
  "updatedAt": "date"
}
```

---

## 🚀 Setup Instructions

### Step 1: Install Backend Dependencies
```bash
cd server
npm install
```

### Step 2: Configure Environment Variables
The `.env` file is already set up with:
```
MONGO_URL=mongodb+srv://rk8816616:raush616@cluster0.awwc1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
NODE_ENV=development
```

### Step 3: Start Backend Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Backend will run on: **http://localhost:5000**

### Step 4: In Another Terminal, Start React Frontend
```bash
npm start
```

Frontend will run on: **http://localhost:3000**

---

## 🔌 API Endpoints

### Seller Authentication

#### POST `/api/seller-auth/register`
Register a new seller with 3-step verification
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "phone": "+1234567890",
  "storeName": "TechGear Store",
  "businessType": "small_business",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "taxId": "12-3456789",
  "bankAccount": "****1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Seller registered successfully. Pending verification.",
  "token": "jwt_token_here",
  "seller": { ...seller_object }
}
```

#### POST `/api/seller-auth/login`
Login with email and password
```json
{
  "email": "john@example.com",
  "password": "secure123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "seller": { ...seller_object }
}
```

#### GET `/api/seller-auth/profile`
Get seller profile (requires token)
```
Headers: Authorization: Bearer <token>
```

#### POST `/api/seller-auth/verify/:sellerId`
Verify seller account (Admin only)

---

### Seller Dashboard

#### GET `/api/seller/dashboard`
Get seller dashboard data (requires token)

#### GET `/api/seller/info`
Get complete seller information (requires token)

#### PUT `/api/seller/update`
Update seller information (requires token)

---

### User Authentication

#### POST `/api/user-auth/register`
Register a new customer

#### POST `/api/user-auth/login`
Login customer

#### GET `/api/user-auth/profile`
Get user profile (requires token)

---

## 🔐 Security Features

✅ **Password Hashing**: bcryptjs with salt rounds 10
✅ **JWT Tokens**: Secure token-based authentication
✅ **Email Validation**: Email format validation
✅ **Input Validation**: All fields validated before saving
✅ **Unique Emails**: Database constraint prevents duplicate emails
✅ **Password Requirements**: Minimum 8 characters
✅ **Data Protection**: Sensitive data (passwords) never returned in responses

---

## 📱 Data Flow

```
React Frontend (3000)
        ↓
   API Calls (localhost:5000)
        ↓
  Express Server (5000)
        ↓
  MongoDB (Cluster0)
        ↓
  Seller/User Collections
```

### Authentication Flow:
1. User enters credentials on SellerAuth page
2. React sends POST request to `/api/seller-auth/register` or `/login`
3. Backend validates data and hashes password
4. Seller/User document created in MongoDB
5. JWT token returned and stored in localStorage
6. User redirected to dashboard with token in headers

---

## 🧪 Testing the API

Use Postman or similar tools:

### Test Seller Registration:
```
POST http://localhost:5000/api/seller-auth/register
Content-Type: application/json

{
  "fullName": "Test Seller",
  "email": "test@example.com",
  "password": "password123",
  "phone": "1234567890",
  "storeName": "Test Store",
  "businessType": "individual",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "taxId": "12-3456789",
  "bankAccount": "1234567890"
}
```

### Test Seller Login:
```
POST http://localhost:5000/api/seller-auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

---

## 🐛 Troubleshooting

**Issue**: "Connection error. Make sure backend is running"
- **Solution**: Make sure backend server is running on port 5000

**Issue**: "Invalid MongoDB connection"
- **Solution**: Check MONGO_URL in server/.env file

**Issue**: "Email already registered"
- **Solution**: User already exists in database, use login instead

**Issue**: "Invalid credentials"
- **Solution**: Check email and password are correct

---

## 🎉 You're Ready!

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: Connected to Cluster0

All seller and user data is now persisted in MongoDB! 🚀
