# Qourio-Backend
# 📦 Parcel Delivery Management System (SaaS)

A role-based backend API system for managing parcel deliveries between senders and receivers — built with **Express.js**, **Mongoose**, and **TypeScript**. This system supports full lifecycle tracking of parcels, including status updates, filtering, and real-time delivery progress, while ensuring **secure access control** for Senders, Receivers, and Admins.

---

## 🔑 Key Features

- **Authentication & Authorization** (JWT-based)
- **Role Management**: Sender, Receiver, Admin
- **Parcel Creation & Tracking**  
- **Status History Logging**
- **Filtering by Status, Date, Type**
- **Admin Panel APIs**: Block users/parcels, update statuses
- **Validation using Zod**
- **Secure & Scalable REST API Design**

---

## 📁 Tech Stack

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **TypeScript**
- **Zod** (for request validation)
- **JWT** (Auth)

---

## 🚀 Getting Started

```bash
git clone https://github.com/rashedul-dev/Qourio-backend
cd parcel-delivery-system
npm install
npm run dev
