# 🍽️ VELOURA — Restaurant Ordering System

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-green" />
  <img src="https://img.shields.io/badge/Express.js-API-black" />
  <img src="https://img.shields.io/badge/MongoDB-Database-green" />
  <img src="https://img.shields.io/badge/JWT-Authentication-blue" />
  <img src="https://img.shields.io/badge/TailwindCSS-UI-38BDF8" />
  <img src="https://img.shields.io/badge/License-Custom-orange" />
</p>

<p align="center">
A premium full-stack restaurant ordering system with a customer ordering experience and a secure JWT-based admin dashboard.
</p>

---

## Preview

Add screenshots after deployment:

| Home           | Menu           |
| -------------- | -------------- |
| Add Screenshot | Add Screenshot |

| Checkout       | Admin Dashboard |
| -------------- | --------------- |
| Add Screenshot | Add Screenshot  |

---

# Project Overview

VELOURA is a modern restaurant ordering platform designed for premium dining experiences.

The application includes:

* Customer-facing restaurant pages
* Dynamic menu browsing
* Shopping cart system
* Checkout and order placement
* JWT-based admin authentication
* Inventory management
* Live order management dashboard
* MongoDB database support
* Automatic mock database fallback

---

# Main Features

## Customer Features

### Dynamic Menu Browsing

* Browse restaurant dishes
* Category filtering
* Search functionality
* Dietary filters
* Dish customization support

### Shopping Cart

* Local cart persistence
* Quantity controls
* Customization-aware cart items

### Checkout System

* Delivery or pickup orders
* Customer information validation
* Server-side price recalculation
* Tax calculation
* Delivery fee handling

### Order Confirmation

* Generate order number
* Display order confirmation

---

## Admin Features

### Secure Authentication

* JWT protected routes
* Environment variable credentials
* Database user authentication support

### Dashboard Analytics

* Total revenue
* Active orders
* Average order value
* Best-selling items

### Live Order Management

* View all orders
* Change order status
* Track order progress

### Inventory Manager

* Add menu items
* Edit dishes
* Delete dishes
* Toggle stock availability

---

# Tech Stack

| Layer          | Technologies                     |
| -------------- | -------------------------------- |
| Runtime        | Node.js                          |
| Backend        | Express.js                       |
| Database       | MongoDB + Mongoose               |
| Authentication | JWT + bcrypt                     |
| Frontend       | HTML + Tailwind CSS + JavaScript |
| Storage        | localStorage                     |

---

# Project Structure

```bash
restaurant-ordering-system/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── menuController.js
│   └── orderController.js
│
├── middleware/
│   ├── authMiddleware.js
│   └── errorHandler.js
│
├── models/
│   ├── User.js
│   ├── MenuItem.js
│   └── Order.js
│
├── routes/
│   ├── authRoutes.js
│   ├── menuRoutes.js
│   └── orderRoutes.js
│
├── scripts/
│   └── seed.js
│
├── public/
│   ├── index.html
│   ├── menu.html
│   ├── checkout.html
│   ├── admin.html
│   │
│   └── js/
│       ├── admin.js
│       ├── cart.js
│       ├── checkout.js
│       ├── menu.js
│       └── utils.js
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

---

# Installation

## Clone Repository

```bash
git clone YOUR_REPOSITORY_URL

cd restaurant-ordering-system
```

## Install Dependencies

```bash
npm install
```

---

# Environment Variables

Create:

```bash
.env
```

Example:

```env
PORT=3000

MONGODB_URI=your_mongodb_connection

ADMIN_USERNAME=your_admin_username

ADMIN_PASSWORD=your_admin_password

JWT_SECRET=your_secret_key
```

Important:

If your password contains special characters like:

```env
#
@
!
$
```

Use quotes:

```env
ADMIN_PASSWORD="Example#123"

JWT_SECRET="Secret#Token123"
```

---

# Database Seeding

Populate sample data:

```bash
npm run seed
```

---

# Run Project

Start server:

```bash
npm start
```

Open:

```bash
http://localhost:3000
```

---

# API Documentation

## Authentication

| Method | Endpoint         | Access  |
| ------ | ---------------- | ------- |
| POST   | /api/auth/login  | Public  |
| GET    | /api/auth/verify | Private |

---

## Menu

| Method | Endpoint      | Access |
| ------ | ------------- | ------ |
| GET    | /api/menu     | Public |
| GET    | /api/menu/:id | Public |
| POST   | /api/menu     | Admin  |
| PUT    | /api/menu/:id | Admin  |
| DELETE | /api/menu/:id | Admin  |

---

## Orders

| Method | Endpoint               | Access |
| ------ | ---------------------- | ------ |
| POST   | /api/orders            | Public |
| GET    | /api/orders            | Admin  |
| GET    | /api/orders/stats      | Admin  |
| GET    | /api/orders/:id        | Public |
| PUT    | /api/orders/:id/status | Admin  |

---

# Authentication Flow

### Login

Admin submits:

```text
Username
Password
```

↓

```text
POST /api/auth/login
```

↓

Server validates credentials

↓

JWT generated

↓

Token stored:

```javascript
localStorage.setItem("adminToken")
```

↓

Protected routes send:

```text
Authorization: Bearer TOKEN
```

↓

Middleware verifies token

---

# Dashboard Features

### KPI Cards

* Total Revenue
* Active Orders
* Average Order Value
* Best Seller

### Live Orders

* Customer details
* Ordered items
* Order status updates

### Inventory Management

* Create dishes
* Edit dishes
* Delete dishes
* Availability toggle

---

# Mock Mode

If MongoDB becomes unavailable:

* Application automatically switches to mock mode
* In-memory data is loaded
* Authentication uses environment credentials
* Sample data becomes available

---

# Available Scripts

```bash
npm start
```

Runs application

```bash
npm run seed
```

Seeds database

---

# Future Improvements

* Payment gateway integration
* Multiple admin users
* Role management
* Pagination
* Automated testing
* Order analytics charts
* Email notifications
* Rate limiting
* Better reporting system

---

# Deployment

Suggested platforms:

Backend:

* Render
* Railway

Frontend:

* Vercel
* Netlify

Database:

* MongoDB Atlas

---

# Contributing

Contributions are welcome.

Steps:

```bash
Fork repository

Create feature branch

git checkout -b feature-name

Commit changes

git push

Create Pull Request
```

---

# Author

Ahmed

---

# License

This project currently has no license file.
Add a LICENSE file before public release.
