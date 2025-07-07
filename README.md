# Bestii — The best friend you always needed, now built with code.

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

> ### 🧠 **Live Demo: [bestii.me](https://bestii.me)**

---

## 💡 What is Bestii?

**Bestii** is an AI-powered chat platform that feels like texting your most emotionally intelligent best friend — no judgment, just understanding. Built for people who need real talk, mental clarity, or just someone who _gets it_ — even at 2am.

Whether you're venting, spiraling, or reflecting, Bestii gives you **multiple AI personas** to talk to — each with memory, personality, and depth.

---

## 🔍 Why I Built This

After going through tough emotional times, I realized how rare it is to feel _truly understood_. So I built Bestii — combining my love for frontend dev, LLMs, and human-centered design — to make AI feel warm, personal, and useful beyond novelty.

---

## ✨ Features

- **💬 Multi-Persona Conversations** — Switch between GPT-4 or Claude personalities with persistent context.
- **⚡ Real-Time Response Streaming** — Stream AI replies as they generate, like you're really texting.
- **🔒 Secure Backend Proxy** — No API key leakage thanks to Firebase Functions and Secret Manager.
- **🧠 Memory Awareness** — Contextual responses built from previous chats (stored per persona).
- **📱 Familiar UI, Deep UX** — Built to feel like a WhatsApp conversation with the soul of a TED Talk.

---

## 🧰 Tech Overview

| Category     | Tech Stack                                                          |
| :----------- | :------------------------------------------------------------------ |
| **Frontend** | React, TypeScript, TailwindCSS, Shadcn/UI, Vite                     |
| **Backend**  | Node.js, Firebase Cloud Functions                                   |
| **Platform** | Firebase (Auth, Firestore, Hosting, Secret Manager, Emulator Suite) |
| **AI APIs**  | OpenAI GPT-4, Anthropic Claude                                      |

---

## 🧠 What I Learned

- Implementing secure, serverless API gateways with Firebase Functions.
- Architecting memory-aware LLM chat systems with clean fallback logic.
- Streaming AI completions efficiently and managing async UX flows.
- Building scalable React frontends with strong type safety and performance.
- Balancing technical performance with emotional user experience design.

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher, v22 recommended)
- Firebase CLI (`npm install -g firebase-tools`)
- OpenAI & Anthropic API keys

### Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/DennisMainhardt/modern-chatbot.git
    cd modern-chatbot
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Firebase and add your secrets:**

    ```bash
    firebase login
    firebase use --add
    firebase functions:secrets:set OPENAI_API_KEY
    firebase functions:secrets:set ANTHROPIC_API_KEY
    ```

4.  **Create a `.env.development` file:**
    Replace `YOUR_PROJECT_ID` with your actual Firebase project ID.
    ```env
    VITE_CHAT_COMPLETION_URL=http://127.0.0.1:5001/YOUR_PROJECT_ID/us-central1/chatCompletion
    VITE_ANTHROPIC_COMPLETION_URL=http://127.0.0.1:5001/YOUR_PROJECT_ID/us-central1/anthropicCompletion
    ```

### Run Locally

You will need two terminals.

**Terminal 1:**

```bash
firebase emulators:start
```

**Terminal 2:**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🚀 Deployment

1.  **Build the project:**

    ```bash
    npm run build
    ```

2.  **Deploy to Firebase:**
    ```bash
    firebase deploy
    ```

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.
