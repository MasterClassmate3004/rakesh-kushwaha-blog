# 🚀 Premium Urban-Tech Blog

A state-of-the-art, high-performance tech blog built with **Next.js 15**, **Framer Motion**, and **Prisma**. Designed with a premium Apple-inspired aesthetic featuring glassmorphism, fluid animations, and a dark-mode-first interface.

---

## ✨ Key Features

### 🎨 Visual & Interactive Excellence
- **Liquid Fill Titles**: Blog titles feature a slow "liquid flow" fill effect on hover that snaps back instantly on hover-out.
- **Glassmorphism UI**: High-end translucent cards and navigation using backdrop-filters.
- **Premium Animations**: Smooth page transitions and micro-interactions powered by Framer Motion.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewing.

### 🔐 Authentication & Compliance
- **Secure Auth**: Custom authentication system using `NextAuth.js` with role-based access.
- **Legal Dialogs**: Integrated **Terms & Conditions** dialog during registration.
- **Cookie Consent**: Built-in, non-intrusive cookie consent banner with local storage persistence.
- **Auto-Login**: Seamless transition from account creation to being logged in.

### 📝 Content & Community
- **Dynamic Blog System**: Real-time content fetching with Prisma and SQLite.
- **Smart Comments**: Commenting system with admin approval workflow.
- **User Profiles**: Dynamic profiles with high-quality photo uploads and auto-generated avatars for new users.
- **Author Dashboard**: Dedicated admin panel for post creation and comment moderation.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database**: [Prisma](https://www.prisma.io/) with SQLite
- **Auth**: [Auth.js (NextAuth)](https://authjs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- npm or yarn

### 2. Installation
```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma generate
```

### 3. Environment Variables
Create a `.env` file in the root:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-here"
ADMIN_EMAIL="admin@blog.local"
ADMIN_PASSWORD="admin123"
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the result.

---

## 🧪 Testing Workflow
To verify all features, refer to the [Testing Workflow](.agent/workflows/testing-workflow.md) which covers everything from Liquid Animations to Authentication flows.

---

## 📝 License
Created by **Nitya Jain**. All rights reserved.
