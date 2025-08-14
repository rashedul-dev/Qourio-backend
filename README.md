# Qourio-Backend

# 📦 Parcel Delivery Management System (SaaS)

A role-based backend API system for managing parcel deliveries between senders and receivers — built with **Express.js**, **Mongoose**, and **TypeScript**. This system supports full lifecycle tracking of parcels, including status updates, filtering, and real-time delivery progress, while ensuring **secure access control** for Senders, Receivers, and Admins.

---

Live Demo: [Parcel Delivery System](https://qourio-api.vercel.app).

Postman Documentation: [Parcel Delivery System Postman Documentation](https://documenter.getpostman.com/view/45058243/2sB3BGHA4N)

## 🧩 Tech Stack

- **Node.js + Express** — Backend framework
- **MongoDB + Mongoose** — NoSQL Database with ODM
- **Zod** — Schema validation
- **TypeScript** — Optional typing
- **JWT** — Authentication
- **dotenv** — Config management
- **Postman** — API testing and documentation
- **ESLint** — Code quality and linting
- **Prettier** — Code formatting
- **Vercel** — Deployment platform

## 🧱 Features

- 🔐 Authentication: Email/password-based login using JWT and Passport js.
- 🔁 Role-based access (`SENDER`, `RECEIVER`, `ADMIN`, `SUPER_ADMIN`, `DELIVERY_MAN`)
- 📦 Parcel lifecycle: Request, approve, picked, dispatch, deliver, block, cancel, flagged
- 🔄 Status Tracking: Track status changes for each parcel.
- 🧱 Scalable Modular Architecture
- ⚠️ Global error and validation handling

---

## 🛠️ Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/rashedul-dev/Qourio-backend
cd QOURIO

# 2. Install dependencies
npm install

# 3. Configure environment
.env.example .env

# 4. Update .env with your MongoDB URI, nodemailer credentials, redis credentials, etc.
PORT=4000
DB_URL=mongodb+srv://<db_user>:<db_password>@cluster0.4pnfxkm.mongodb.net/percel_delivery_system?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=development


# 5. Run locally
npm run dev

```

---

### Email and password of some dummy users for testing :

```
// SUPER_ADMIN
"email": "super@gmail.com",
"password": "SUPER!123"


// SENDER
"email": "sender@gmail.com",
password: "!SENDER123"

// RECEIVER
"email": "receiver@gmail.com",
 "password": "!RECEIVER123",

// DELIVERY_MAN
"email": "deliveryman@gmail.com",
"password": "DELIVERYMAN!123"

```

---

## 📁 Folder Structure

```
── Parcel Delivery.postman_collection.json
├── src
│   ├── app
│   │   ├── config
│   │   │   ├── env.ts
│   │   │   └── passport.ts
│   │   ├── interfaces
│   │   │   ├── error.types.ts
│   │   │   └── index.d.ts
│   │   ├── middlewares
│   │   │   ├── checkAuth.ts
│   │   │   ├── globalErrorHandler.ts
│   │   │   ├── notFound.ts
│   │   │   └── validateRequest.ts
│   │   ├── modules
│   │   │   ├── auth
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── parcel
│   │   │   │   ├── parcel.controller.ts
│   │   │   │   ├── parcel.interface.ts
│   │   │   │   ├── parcel.model.ts
│   │   │   │   ├── parcel.routes.ts
│   │   │   │   ├── parcel.service.ts
│   │   │   │   ├── parcel.utils.ts
│   │   │   │   └── parcel.validation.ts
│   │   │   └── user
│   │   │       ├── user.contants.ts
│   │   │       ├── user.controller.ts
│   │   │       ├── user.interface.ts
│   │   │       ├── user.model.ts
│   │   │       ├── user.routes.ts
│   │   │       ├── user.service.ts
│   │   │       └── user.validation.ts
│   │   ├── routes
│   │   │   └── index.ts
│   │   └── utils
│   │       ├── builder
│   │       │   ├── QueryBuilder.ts
│   │       │   └── constants.ts
│   │       ├── catchAsync.ts
│   │       ├── errorHelpers
│   │       │   ├── AppError.ts
│   │       │   ├── handleCastError.ts
│   │       │   ├── handleDuplicateError.ts
│   │       │   ├── handlerValidationError.ts
│   │       │   └── handlerZodError.ts
│   │       ├── generateTrackingId.ts
│   │       ├── jwt
│   │       │   ├── jwt.ts
│   │       │   ├── setCookie.ts
│   │       │   └── userTokens.ts
│   │       ├── seedSuperAdmin.ts
│   ├── app.ts
│   └── server.ts
├── tsconfig.json
├── README.md
├── eslint.config.mjs
├── package-lock.json
├── package.json
└── vercel.json

```

---

## 👤 User Roles

| Role           | Responsibilities                                          |
| -------------- | --------------------------------------------------------- |
| `SENDER`       | send/cancel/delete parcels, view own parcels, status      |
| `RECEIVER`     | View incoming parcels, confirm delivery, delivery history |
| `DELIVERY_MAN` | Currently admin can assign to parcel, and create          |
| `ADMIN`        | Manage users, create admins and personnel, manage coupons |
| `SUPER_ADMIN`  | Similar to admin but can create super admins              |

---

## 📡 API Endpoints

### 🔐 Auth

| Method | Endpoint          | Description       |
| ------ | ----------------- | ----------------- |
| POST   | `/login`          | User login        |
| POST   | `/refresh-token`  | Refresh JWT token |
| POST   | `/logout`         | Logout user       |
| POST   | `/reset-password` | Reset password    |

---

### 👤 Users

| Method | Endpoint          | Role                  | Description              |
| ------ | ----------------- | --------------------- | ------------------------ |
| POST   | `/register`       | `Public`              | Register sender/receiver |
| GET    | `/all-users`      | `ADMIN`/`SUPER_ADMIN` | Get all users            |
| GET    | `/:id`            | `Authenticated`       | Get user by ID           |
| PATCH  | `/:id`            | `Authenticated`       | Update user profile      |
| PATCH  | `/:id/block-user` | `ADMIN`/`SUPER_ADMIN` | Block/Delete user        |

---

### 📦 Parcels

| Method | Endpoint                | Role       | Description            |
| ------ | ----------------------- | ---------- | ---------------------- |
| POST   | `/`                     | `SENDER`   | Create parcel          |
| POST   | `/cancel/:id`           | `SENDER`   | Cancel parcel          |
| POST   | `/delete/:id`           | `SENDER`   | Delete parcel          |
| GET    | `/me`                   | `SENDER`   | View sender's parcels  |
| GET    | `/:id/status-log`       | `SENDER`   | View parcel status log |
| GET    | `/me/incoming`          | `RECEIVER` | Incoming parcels       |
| GET    | `/me/history`           | `RECEIVER` | Delivery history       |
| PATCH  | `/confirm/:id`          | `RECEIVER` | Confirm delivery       |
| GET    | `/`                     | `ADMIN`    | Get all parcels        |
| POST   | `/create-parcel`        | `ADMIN`    | Admin creates parcel   |
| PATCH  | `/:id/delivery-status`  | `ADMIN`    | Update delivery status |
| PATCH  | `/:id/block-status`     | `ADMIN`    | Block/unblock a parcel |
| GET    | `/:id/details`          | `ADMIN`    | Get parcel details     |
| GET    | `/tracking/:trackingId` | `Public`   | Track parcel           |

---

## 🔁 Parcel Lifecycle

### 🔄 Normal Flow

```
  Requested --> Approved
  Requested --> Cancelled

  Approved --> Picked

  Picked --> Dispatched

  Dispatched --> InTransit

  InTransit --> OutForDelivery
  InTransit --> Rescheduled

  OutForDelivery --> Delivered
  OutForDelivery --> FailedAttempt

  FailedAttempt --> Rescheduled

  Rescheduled --> OutForDelivery

  Delivered --> Received

  Cancelled --> Approved
  Cancelled --> Blocked

  Blocked --> Approved

  Returned --> Approved
  Flagged --> Approved
  Lost --> Approved
  Damaged --> Approved

```

---
