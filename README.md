# 🤖 AI Interview Agent

A complete, full-stack AI-powered interviewing platform that simulates realistic technical and behavioral interviews. Upload your resume, turn on your webcam, and let the Google Gemini AI conduct a comprehensive, interactive 10-question interview tailored to your exact skills and desired job role.

![AI Interview Agent](https://img.shields.io/badge/Status-Production_Ready-success)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=flat&logo=sqlite&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat&logo=google&logoColor=white)

---

## ✨ Key Features

*   **🎥 Realistic Live Video Feed:** Native webcam integration for a high-pressure face-to-face interview simulation.
*   **🗣️ Voice & Speech-to-Text:** The AI speaks its questions aloud using the Web Speech API, and you can answer using the integrated Speech-to-Text transcriber.
*   **🧠 Gemini-Powered Brain:** Uses `gemini-2.5-flash` to analyze your uploaded resume PDF and generate 10 highly-tailored questions spanning Introductory, Behavioral, Technical, Scenario, and Wrap-up rounds.
*   **📄 Robust PDF Extraction:** A custom, synchronous, zero-dependency PDF text extractor guarantees crash-free resume parsing.
*   **💾 Zero-Config Local Database:** Uses `SQLite` and `Prisma` for frictionless local development and easy deployment.
*   **🔒 Secure Authentication:** Custom JWT & bcrypt-based user authentication.

---

## 🏗️ Architecture

The app is built as a monolithic full-stack application configured for a "One-Place" deployment.
*   **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Lucide Icons.
*   **Backend:** Node.js, Express.
*   **Database:** SQLite (managed via Prisma ORM).
*   **AI Engine:** Google GenAI SDK.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
*   Node.js (v18+)
*   A Google Gemini API Key

### 1. Clone & Install
```bash
git clone https://github.com/your-username/AiInterviewAgent.git
cd AiInterviewAgent

# Install all dependencies (concurrently, server, and client)
npm run install:all
```

### 2. Environment Variables
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="Your_Super_Secret_Key_Here"
GEMINI_API_KEY="Your_Google_Gemini_Key_Here"
```
*(No environment variables are needed in the `client` directory for local dev!)*

### 3. Setup Database
```bash
cd server
npx prisma db push
```

### 4. Run the App
From the **root folder** (`AiInterviewAgent`), run:
```bash
npm run dev
```
Both the React Frontend (Port `5173`) and the Express Backend (Port `5000`) will boot up concurrently.

---

## 🌍 Deployment (Railway "One-Place" Setup)

This repository is strictly configured to compile the React frontend and serve it dynamically through the Node.js Express backend in production. This means you deploy the **entire app** as one single service on [Railway](https://railway.app/).

1. **Push to GitHub:** Push this exact repository to your GitHub.
2. **Deploy on Railway:** Create a "New Project" -> "Deploy from GitHub repo" and select this repo.
3. **Important - Add a Volume:** Go to your new Railway Service -> **Settings -> Volumes**. Create a new Volume and set the Mount Path to `/app/server`. **(If you skip this, your SQLite user data will be deleted every time the server restarts!)**
4. **Add Variables:** Go to the Variables tab and paste the same `.env` values (PORT, JWT_SECRET, GEMINI_API_KEY).
5. **Generate Domain:** Go to the Networking tab and click "Generate Domain".

Wait for the build to finish, and your full-stack app is live on a single URL!

---

## 📜 License
MIT License. Feel free to fork and improve!
