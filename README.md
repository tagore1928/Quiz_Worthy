# 🧠 Quiz Worthy - AI-Powered Quiz & Assessment Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React%2018-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite%205-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Groq AI](https://img.shields.io/badge/Groq%20AI-F05A28?style=flat&logo=openai&logoColor=white)](https://groq.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)

**Quiz Worthy** is a modern full-stack web application designed for interactive learning and assessment. It dynamically generates high-quality technical quizzes across various domains using high-speed **Groq AI (Llama 3)**, paired with real-time feedback, detailed performance metrics, and persistent user tracking powered by **Firebase**.

---

## 🌟 Key Features

- ⚡ **Dynamic AI Quiz Generation**: Generates contextual, multi-level multiple-choice questions in real time using Groq AI.
- 🎯 **Multi-Domain Topics**: DSA, System Design, React, Python, Cloud Computing, Databases, Computer Networks, Machine Learning, and custom user-entered topics.
- 📊 **Rich Analytics & Visualizations**: Real-time score summaries, time tracking, accuracy breakdowns, and interactive charts via Recharts.
- 🔒 **Authentication & User Profiles**: Seamless sign-up/login and user profile persistence using Firebase Authentication & Firestore.
- 🎨 **Modern Glassmorphic UI**: Sleek dark-mode aesthetic built with Tailwind CSS, Lucide icons, and responsive components.
- 📦 **Monorepo Architecture**: Clean separation into `frontend/` and `backend/` folders for streamlined development and deployment.

---

## 📂 Project Structure

```plaintext
Quiz Worthy/
├── backend/                  # Node.js + Express + Groq AI API
│   ├── src/
│   │   ├── routes/           # Express route handlers (/api/quiz)
│   │   ├── services/         # Groq AI quiz generation service & prompt engineering
│   │   └── index.ts          # Server entrypoint and middleware setup
│   ├── .env.example          # Backend environment variables template
│   ├── package.json          # Backend dependencies and scripts
│   └── tsconfig.json         # Backend TypeScript config
│
├── frontend/                 # React 18 + Vite + TailwindCSS Single Page App
│   ├── src/
│   │   ├── components/       # Reusable UI components (Navbar, ProtectedRoute, etc.)
│   │   ├── config/           # Firebase client configuration
│   │   ├── context/          # React Auth Context & Global state
│   │   ├── pages/            # Views (Home, QuizArena, QuizSummary, Profile, Login, Signup)
│   │   ├── types/            # TypeScript interfaces & definitions
│   │   ├── App.tsx           # Route configuration
│   │   └── main.tsx          # React application root
│   ├── .env.example          # Frontend environment variables template
│   ├── package.json          # Frontend dependencies and scripts
│   ├── tailwind.config.js    # Tailwind theme configuration
│   └── vite.config.ts        # Vite configuration & dev proxy
│
├── .env.example              # Root environment template combining all variables
├── .gitignore                # Global Git ignore rules
├── firebase.json             # Firebase configuration
├── firestore.rules           # Security rules for Cloud Firestore
├── package.json              # Root monorepo orchestration scripts
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Groq Cloud API Key](https://console.groq.com/)
- [Firebase Project](https://console.firebase.google.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/quiz-worthy.git
cd quiz-worthy
```

### 2. Environment Configuration

#### Backend Setup:
Create a `.env` file inside the `backend/` folder (or copy from `backend/.env.example`):
```bash
GROQ_API_KEY=gsk_your_groq_api_key_here
PORT=5000
CLIENT_URL=http://localhost:5173
```

#### Frontend Setup:
Create a `.env` file inside the `frontend/` folder (or copy from `frontend/.env.example`):
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
# Optional: Set VITE_API_BASE_URL for production deployment
VITE_API_BASE_URL=
```

---

### 3. Install Dependencies

You can install all dependencies for root, frontend, and backend with a single command from the root directory:

```bash
npm run install:all
```

Or install individually:
```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

---

### 4. Running on Localhost

Run both frontend and backend concurrently from the root directory:

```bash
npm run dev
```

- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

#### Running Services Separately:
```bash
# Run only Backend
npm run dev:backend

# Run only Frontend
npm run dev:frontend
```

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts both backend and frontend development servers concurrently |
| `npm run dev:frontend` | Starts Vite dev server for frontend on `http://localhost:5173` |
| `npm run dev:backend` | Starts Express server with hot-reload on `http://localhost:5000` |
| `npm run build` | Builds both backend (TypeScript compilation) and frontend (Vite bundle) |
| `npm run build:frontend` | Compiles TypeScript and creates optimized frontend production build in `frontend/dist/` |
| `npm run build:backend` | Compiles TypeScript backend into `backend/dist/` |
| `npm run install:all` | Installs root, frontend, and backend dependencies |

---

## 🌐 Deployment Guide

### Deploy to GitHub
1. Initialize git and commit the changes:
   ```bash
   git init
   git add .
   git commit -m "feat: restructure into frontend/backend and prepare deployment configuration"
   ```
2. Push to your GitHub repository:
   ```bash
   git remote add origin https://github.com/your-username/quiz-worthy.git
   git branch -M main
   git push -u origin main
   ```

### Deploying Frontend (Vercel / Netlify / Firebase Hosting)
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** Set `VITE_FIREBASE_*` and `VITE_API_BASE_URL` (URL of your deployed backend).

### Deploying Backend (Render / Railway / Fly.io / Heroku)
- **Root Directory:** `backend`
- **Build Command:** `npm run build`
- **Start Command:** `npm start` (or `node dist/index.js`)
- **Environment Variables:** Set `GROQ_API_KEY`, `PORT`, and `CLIENT_URL` (URL of your deployed frontend).

---

## 🛡️ Security & Environment Variables Note
- Never commit `.env` or sensitive API keys to GitHub.
- Use `.env.example` as a template for public reference.
- Configure appropriate Firestore Security Rules (`firestore.rules`) before deploying to production.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
