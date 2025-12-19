# 🌟 FundRaise – Empower Change Through Crowdfunding
[![Build Status](https://img.shields.io/github/actions/workflow/status/ezrahel/fundraising/ci.yml?branch=main&style=flat-square)](https://github.com/your-username/fundraise/actions)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

[![Version](https://img.shields.io/github/v/release/your-username/fundraise?style=flat-square)](https://github.com/your-username/fundraise/releases)

<!-- [![Deploy on Vercel](https://img.shields.io/badge/deploy%20on-vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/fundraise) -->

Welcome to **FundRaising**, the modern crowdfunding platform where ideas turn into impact. Built with the latest in web tech—**Next.js**, **React**, and **TypeScript**—FundRaise enables creators, communities, and changemakers to launch and manage campaigns with ease, clarity, and powerful insights.

---

## 🚀 Key Features

### 🔐 Secure & Seamless Authentication

* Firebase Authentication with email/password
* Social logins (Google, Facebook, Apple)
* Email verification
* Password reset functionality
* "Remember Me" for faster access
* Production-ready Go backend for auth operations

### 📢 Campaign Management Made Simple

* Launch and customize fundraising campaigns
* Track real-time campaign performance
* Share campaigns with built-in social integration
* Access campaign insights and analytics

### 📊 Interactive Campaign Dashboard

* Overview of all campaigns and activity
* Dynamic charts & KPIs (powered by Recharts)
* Quick access buttons for key actions

### 📈 Advanced Analytics

* Conversion funnel visualization
* Audience & donor demographics
* Campaign performance trends and growth analysis

### 💸 Flexible Donations

* Support for multiple payment gateways
* Transparent transaction history and processing fees
* Real-time donation updates

### 👤 Personal Profile Controls

* Manage personal info & settings
* Control notifications and privacy preferences
* Enhanced account security features

---

## 🧰 Tech Stack

| Layer        | Tools & Libraries                        |
| ------------ | ---------------------------------------- |
| **Frontend** | Next.js 14, React 18, TypeScript         |
| **Styling**  | Tailwind CSS, Shadcn UI                  |
| **Charts**   | Recharts                                 |
| **Auth**     | Firebase Authentication                   |
| **Backend**  | Go (Golang) with Firebase Admin SDK      |
| **Database** | Firestore                                 |
| **UI/UX**    | Responsive design, accessible components |

---

## ⚙️ Getting Started

### 🧩 1. Clone the Repository

```bash
git clone https://github.com/ezrahel/fundraising.git
cd fundraising
```

### 📦 2. Install Dependencies

```bash
npm install
```

### 🔐 3. Set Up Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and OAuth providers)
3. Create a Firestore database
4. Download your service account key

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions.

### 🔑 4. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:8090
```

Create a `server/.env` file:

```env
PORT=8090
ALLOWED_ORIGIN=http://localhost:3000
GOOGLE_APPLICATION_CREDENTIALS=./israelfirebase.json
```

Place your Firebase service account JSON file as `server/israelfirebase.json`

### ▶️ 5. Run Locally

**Start the Go Backend:**
```bash
cd server
go run cmd/api/main.go
```

**Start the Next.js Frontend (in a new terminal):**
```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

The Go API server will run on `http://localhost:8090`

---

## 🗂️ Project Structure

```
fundraise/
├── app/                 # App Router pages and layouts
├── components/          # Reusable UI components
├── contexts/            # React contexts (Auth, etc.)
├── lib/                 # Utility functions and Firebase config
├── server/              # Go backend
│   ├── auth/           # Authentication handlers
│   ├── campaign/        # Campaign handlers
│   ├── cmd/api/        # Main application entry
│   └── internal/       # Internal server code
├── styles/              # Global and scoped styles
├── public/              # Static assets
└── ...
```

---

## 🤝 Contributing to FundRaise

We love community support! Here’s how you can help:

1. **Fork** this repo
2. **Create** a new branch

   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. **Commit** your work

   ```bash
   git commit -m "Add YourFeatureName"
   ```
4. **Push** and create a PR

   ```bash
   git push origin feature/YourFeatureName
   ```

---

## 📜 License

FundRaise is open-sourced under the [MIT License](LICENSE). Feel free to use, modify, and share responsibly.

---

## 🧑‍💼 Authors

* **Adelakin Israel** – Creator & Lead Developer – [@ezrahel](https://github.com/ezrahel)

---

## 💬 Support & Community

Need help? Want to connect?

* 📧 Email: [support@fundraise.com](mailto:support@fundraise.com)
* 💬 Slack: [Join Our Community](#)
* 🐛 Bug Reports: Submit via [GitHub Issues](https://github.com/ezrahel/fundraising/issues)

---

## 🙏 Acknowledgments

Thanks to these amazing tools and libraries that power the FundRaising project:

* 💎 [Shadcn UI](https://ui.shadcn.com/) – Elegant UI components
* 📈 [Recharts](https://recharts.org/) – Beautiful data visualizations
* ⚛️ [Next.js](https://nextjs.org/) – The backbone of our frontend

---

> **FundRaising** — *Fuel ideas. Fund dreams. Change the world.*

