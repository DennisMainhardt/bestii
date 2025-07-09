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

After going through tough emotional times, I realized how rare it is to feel _truly understood_. So I built Bestii — combining my frontend expertise with Firebase backend services and LLM APIs — to make AI feel warm, personal, and useful beyond novelty.

---

## ✨ Features

- **💬 Multi-Persona Conversations** — Switch between GPT-4 or Claude personalities with persistent context
- **⚡ Real-Time Conversations** — Fast AI responses with optimistic UI updates
- **🔒 Secure Backend Proxy** — Zero API key exposure with Firebase Functions and Secret Manager
- **🧠 Memory Awareness** — Contextual responses built from previous chats (stored per persona)
- **📱 Familiar UI, Deep UX** — WhatsApp-like chat interface with professional-grade reliability
- **🎯 Production Ready** — Full authentication, error handling, and responsive design

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

- **Secure Architecture**: Implemented serverless API gateways with Firebase Functions and Secret Manager to prevent API key exposure
- **Memory-Aware LLMs**: Built a summarization system that maintains context across conversations using structured metadata
- **Real-Time Architecture**: Built real-time message sync with Firebase and optimistic UI updates
- **Modern Frontend Development**: Achieved <2s load times with code splitting, lazy loading, and TypeScript strict mode
- **User-Centered Design**: Balanced technical complexity with intuitive UX that feels natural, not robotic

## 📊 Performance & Scale

- **Load Time**: <2 seconds initial page load
- **Response Time**: <3 seconds average AI response
- **Memory Efficiency**: Automatic conversation summarization prevents context bloat
- **Security**: Zero API key exposure with Firebase Functions proxy
- **Scalability**: Firebase architecture supports concurrent users with real-time sync

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher, v22 recommended)
- Firebase CLI (`npm install -g firebase-tools`)
- OpenAI & Anthropic API keys
- Firebase project with Authentication and Firestore enabled

### Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/DennisMainhardt/bestii.git
    cd bestii
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

## 🤝 Contributing

While this is a personal portfolio project, I'm open to feedback and suggestions! Feel free to:

- Open an issue for bugs or feature requests
- Submit a pull request for improvements
- Share your thoughts on the UX/architecture

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## 🎯 About the Developer

Built with ❤️ by [Dennis Mainhardt](https://github.com/DennisMainhardt) — a frontend developer exploring backend technologies, passionate about creating AI experiences that feel human, not robotic.

**Connect with me:**

- 🚀 [Live Demo](https://bestii.me)
- 💼 [LinkedIn](https://linkedin.com/in/dennismainhardt)
- 📧 [Email](mailto:dennis.mainhardt@gmail.com)
