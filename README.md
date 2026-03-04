<div align="center">

  <h1>🤖 AI Interview Agent</h1>
  <p><strong>A full-stack, audio-interactive, AI-powered mock interview platform</strong></p>

  <br/>

  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />

</div>

---

## 🌟 Overview

**AI Interview Agent** is a premium mock interview web application that uses **Google Gemini 2.5 Flash** to simulate real-world technical and HR interviews. Simply upload your resume PDF, configure your ideal interview settings, and the AI generates highly targeted questions based on your actual experience — then evaluates your answers with detailed, constructive AI feedback.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **PDF Resume Parsing** | Upload your resume and the AI tailors every question to your experience |
| 🎛️ **Premium Settings Panel** | Choose Difficulty, Focus Area, Interview Type, Question Style, Company Type |
| ⏱️ **Timed Mode** | Real countdown timer auto-submits your answer when time expires |
| 🎙️ **Voice Input** | Speak your answers using the Web Speech API (Chrome) |
| 🔊 **AI Voice Narration** | Questions are read aloud via Text-to-Speech automatically |
| 📊 **Dashboard & History** | View all past interviews, scores, and completion status |
| 💬 **AI Feedback Engine** | Each answer scored out of 10 with constructive Gemini feedback |
| 🌙 **Dark / Light Mode** | Seamless theme toggle with full dark mode support |

---

## 🗂️ Project Structure

```
AiInterviewAgent/
├── client/                   # React frontend (Vite + Tailwind)
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Dashboard.jsx
│       │   ├── SetupInterview.jsx
│       │   ├── InterviewRoom.jsx
│       │   └── Feedback.jsx
│       ├── components/
│       │   └── Navbar.jsx
│       └── context/
│           └── AuthContext.jsx
│
└── server/                   # Express backend
    ├── controllers/
    │   ├── authController.js
    │   └── interviewController.js
    ├── middlewares/
    │   └── authMiddleware.js
    ├── prisma/
    │   ├── schema.prisma     # PostgreSQL schema (User, Interview, Question)
    │   └── client.js
    ├── routes/
    │   ├── authRoutes.js
    │   └── interviewRoutes.js
    ├── utils/
    │   └── gemini.js         # Google Gemini AI integration
    └── index.js
```

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Axios, Lucide React  
**Backend:** Node.js, Express.js, JWT Authentication, Multer (PDF upload)  
**Database:** PostgreSQL + Prisma ORM  
**AI:** Google Gemini 2.5 Flash (`@google/genai`)  
**PDF Parsing:** `pdf-parse`  
**Audio:** Web Speech API (browser-native, no dependencies)

---

## 🚀 Getting Started (Local)

### 1. Clone the repo
```bash
git clone https://github.com/akshya44/AiInterviewAgent.git
cd AiInterviewAgent
```

### 2. Set up environment variables

**`server/.env`:**
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/aiinterview
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
```

**`client/.env`:**
```env
VITE_API_URL=http://localhost:5000
```

### 3. Install & run backend
```bash
cd server
npm install            # also runs prisma generate automatically
npx prisma migrate dev --name init   # creates PostgreSQL tables
npm run dev
```

### 4. Install & run frontend
```bash
cd client
npm install
npm run dev
```

Visit → `http://localhost:5173`

---

## 🎯 How It Works

1. **Sign Up / Login** — JWT-secured authentication
2. **Setup Interview** — Enter job role, upload your PDF resume, and configure your 6 premium interview settings
3. **Interview Room** — The AI narrates the question, you type or speak your answer. A countdown timer activates in Timed Mode
4. **Feedback** — After completing all 5 questions, view your individual scores and AI-generated feedback for each answer

---

## ☁️ Deploying on Render

1. **New → PostgreSQL** database on Render (Free tier)
2. **New → Blueprint** → connect `akshya44/AiInterviewAgent` (uses `render.yaml`)
3. Set env vars in the backend service: `DATABASE_URL`, `GEMINI_API_KEY`, `JWT_SECRET`
4. After first deploy, run in the Render Shell:
   ```bash
   npx prisma migrate deploy --schema=prisma/schema.prisma
   ```

---

<div align="center">
  <sub>Built with ❤️ by <strong>Akshya</strong></sub>
</div>
