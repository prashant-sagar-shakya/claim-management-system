# 🛡️ Claim Management System

A powerful full-stack **Claim Management System** that streamlines the interaction between **policyholders** and **administrators** in a secure, responsive, and modern web application. Built with **React + TypeScript**, **MongoDB**, **TailwindCSS**, **GSAP**, and **JWT authentication**, the system enables end-to-end insurance lifecycle management including policy tracking, premium payments, and claims processing.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* Secure login/register with **JWT**
* Password encryption using **bcrypt**
* Role-based routing for **Users** and **Admins**
* Route protection using `admin-route.tsx` and `protected-route.tsx`

### 🧾 Policy Management

* Add/view/edit policies
* Attributes: `policy_type`, `coverage_amount`, `premium_amount`, `start_date`, `end_date`, `description`

### 💳 Premium Payments

* Pay premiums with record-keeping
* Fields: `policy_id`, `policyholder_id`, `amount`, `payment_type`, `payment_date`, `processed_at`, `description`

### 📑 Claim Management

* Submit claims on active policies
* Admins can **approve** / **reject** claims
* Fields: `claim_amount`, `claim_date`, `status`, `description`

### 📊 Admin Dashboard

* Access to **all users**, **claims**, **payments**, and **policies**
* Manage system-wide statistics

### 💡 UX & Animation

* **GSAP** for high-end, smooth animations
* **TailwindCSS** for modern UI
* **Theme toggle** support: Light, Dark, System
* Toast-based notifications with contextual feedback

---

## 🧠 Tech Stack

| Layer     | Tech                                |
| --------- | ----------------------------------- |
| Frontend  | React, TypeScript, TailwindCSS      |
| Backend   | Node.js (API integration planned)   |
| Database  | MongoDB + Mongoose                  |
| Auth      | JWT + bcrypt                        |
| Animation | GSAP (GreenSock Animation Platform) |
| Tooling   | Vite, ESLint, Prettier              |

---

## 🛠️ Setup Instructions

### 1. Clone the Project

```bash
git clone https://github.com/prashantsagarshakya/claim-management-system.git
cd claim-management-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file and add:

```env
VITE_MONGODB_URI=your_mongodb_connection_string
VITE_JWT_SECRET=your_super_secret_key
```

### 4. Start Development Server

```bash
npm run dev
```

---

## 🌐 MongoDB Integration

> Located in `src/utils/mongodb-connector.ts`

* Connects securely to MongoDB Atlas
* All collections and models are defined using **Mongoose** (`User`, `Policy`, `Payment`, `Claim`)
* Handles data validation, schema enforcement, and relationship mapping

---

## 📖 Route Guards

* **Protected Routes**: `protected-route.tsx` ensures only authenticated users can access
* **Admin Routes**: `admin-route.tsx` checks both login status and user role

---

## 🌈 Theme System

> Managed via `theme-provider.tsx`, `theme-toggle.tsx`

* Toggle Light, Dark, or System preference
* Uses `localStorage` and CSS class switching
* Fully integrated across UI components

---

## 🧪 Testing

Future-proof your app by integrating:

* [`Jest`](https://jestjs.io/)
* [`React Testing Library`](https://testing-library.com/)
* Backend API testing using [`Supertest`](https://github.com/ladjs/supertest)

---

## 📦 Docker Deployment (Optional)

1. Create `Dockerfile` and `.dockerignore`
2. Add MongoDB URI as env variable
3. Deploy to:

   * **Render**
   * **Vercel**
   * **AWS ECS / Fargate**

## 🔐 Security Notes

* Ensure `.env` is **excluded from Git** via `.gitignore`
* Use strong secret keys for JWT and hashing
* Consider rate limiting, CSRF protection for production

---

## 📈 Future Improvements

* 📧 Email Notifications (Claim updates, Payment confirmations)
* 📊 Charts in Admin Dashboard (D3.js / Recharts)
* 🌐 Internationalization (i18n)
* 🧾 Invoice generation for payments

---

## 🧑‍💻 Author

**Prashant Sagar Shakya**
Built with ❤️ using React, MongoDB, GSAP, and Tailwind
[GitHub](https://github.com/prashantsagarshakya)
[LinkedIn](https://www.linkedin.com/in/prashant-sagar-shakya01/)

---

## 📄 License

Licensed under the [MIT License](LICENSE)