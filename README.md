# Modern, Emotionally Intelligent AI Chatbot

### A "No Bullshit Therapist 2.0" designed for transformative conversations.

This project is more than a chatbot—it's an exploration into creating a truly helpful AI companion. It serves as a safe, non-judgmental space where users can explore their thoughts and feelings with an AI that listens, remembers, and provides guidance.

The primary AI persona, "Raze," is designed to be brutally honest yet compassionate, leveraging long-term memory and deep emotional awareness to help users break negative cycles, understand their emotional patterns, and foster genuine personal growth.

---

<p align="center">
  <!-- Add a screenshot or GIF of your application here -->
  <!-- <img src="link-to-your-screenshot.png" alt="Application Screenshot" width="700"> -->
</p>

---

## ✨ Key Features

- **🧠 Emotionally Intelligent AI:** Engage in deep, meaningful conversations with an AI that understands context, remembers past interactions, and provides insightful guidance.
- **🎭 Dual AI Personas:** Switch between different AI personalities ("Raze" for tough love, "Reyna" for a softer approach) to get the support you need.
- **📝 Long-Term Memory System:** The AI automatically summarizes key points from conversations to build a long-term memory, enabling it to recognize patterns and recall important details over time.
- **💳 Credit-Based Usage System:**
  - **Free Tier:** All users receive 5 free message credits daily.
  - **Daily & Monthly Resets:** Credits reset daily, with up to 6 resets per month, preventing abuse while providing ample free access.
  - **Real-Time UI Updates:** Credit counts update across the UI instantly without needing a page refresh, powered by real-time Firestore listeners.
- **🔐 Secure User Authentication:** Safe and secure login with Email/Password or Google, including email verification, password reset, and robust Firestore security rules.
- **💬 Modern, Real-Time Chat:** A beautiful and responsive chat interface built with shadcn/ui, Tailwind CSS, and Firestore for a seamless, real-time experience.
- **💅 User-Friendly Notifications:**
  - **Out of Credits Notice:** A custom, centered UI component gracefully informs users when they're out of credits, with options to upgrade or dismiss.
  - **Toast Notifications:** Non-intrusive `react-hot-toast` notifications for other events.
- **🌐 Stunning Landing Page:** A fully-featured, animated landing page to introduce users to the app's mission and features.
- **📱 Fully Responsive:** A flawless experience across all devices, from desktop to mobile.

---

## 🚀 Technology Stack

<p align="left">
  <a href="https://react.dev/" target="_blank"><img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"></a>
  <a href="https://vitejs.dev/" target="_blank"><img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://tailwindcss.com/" target="_blank"><img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://firebase.google.com/" target="_blank"><img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"></a>
  <a href="https://ui.shadcn.com/" target="_blank"><img src="https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="Shadcn/UI"></a>
  <a href="https://www.framer.com/motion/" target="_blank"><img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion"></a>
</p>

- **Framework:** [React](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
- **Backend & Auth:** [Firebase](https://firebase.google.com/) (Authentication, Firestore, Security Rules)
- **AI Services:** [OpenAI API](https://openai.com/) & [Anthropic API](https://www.anthropic.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Form Management:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation.

---

## 🛠️ Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) (or your preferred package manager)
- A [Firebase](https://firebase.google.com/) project
- API keys from [OpenAI](https://openai.com/) and [Anthropic](https://www.anthropic.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/modern-chatbot.git
cd modern-chatbot
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of your project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and add your credentials for Firebase and the AI services.

### 4. Set Up Firebase

1.  **Create a Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Create a Web App:** In your project settings, create a new Web App and copy the configuration object. Fill in the `VITE_FIREBASE_*` variables in your `.env` file with these values.
3.  **Enable Authentication:**
    - In the Firebase Console, go to the **Authentication** section.
    - Enable the **Email/Password** and **Google** sign-in providers.
4.  **Set Up Firestore:**
    - Go to the **Firestore Database** section and create a new database.
    - Start in **production mode** (which uses secure rules by default).
5.  **Deploy Firestore Rules:**
    - This project includes a `firestore.rules` file with security rules.
    - Install the Firebase CLI if you haven't already: `npm install -g firebase-tools`.
    - Log in to Firebase: `firebase login`.
    - Deploy the rules from your project directory:
      ```bash
      firebase deploy --only firestore:rules
      ```

### 5. Run the Development Server

```bash
pnpm run dev
```

The application should now be running on `http://localhost:5173`.

---

## ⚙️ Core Functionality Explained

### Credit System

The credit system is designed to be generous for free users while preventing abuse.

- **On Sign-Up:** A new user document is created in Firestore with default values (`credits: 5`, `monthlyResets: 0`, etc.). This is handled in `src/context/AuthContext.tsx`.
- **On Login:** The `AuthContext` checks the user's `lastCreditReset` and `monthlyCycleStart` timestamps to determine if credits or monthly resets should be replenished.
- **Sending a Message:** Before a message is sent, `src/services/messageService.ts` calls `checkAndDecrementCredits`. This function runs a Firestore transaction to atomically check for credits and decrement the count, preventing race conditions.
- **Security:** The `firestore.rules` file ensures that users can only ever decrement their own credits by 1 or have them reset to 5 (during the daily reset), preventing any client-side manipulation.

### AI Memory

The AI's long-term memory is achieved through a summarization process.

- **Trigger:** After a certain number of messages (e.g., 6), `src/components/Chat.tsx` triggers a summarization of the recent conversation.
- **Process:** The relevant messages are sent to one of the AI services (`ChatGPTService` or `ClaudeService`) to generate a concise summary.
- **Storage:** This summary is saved in a `summaries` subcollection in Firestore, linked to the user and AI persona.
- **Recall:** When a new conversation starts or a new message is sent, the most recent summaries are fetched and injected into the AI's system prompt, giving it the context of past interactions.

---

## 📂 Project Structure

```
/src
├── /components       # Reusable UI components (Chat, Header, UI elements)
├── /constants        # Global constants (e.g., AI prompts)
├── /context          # React Context providers (AuthContext for user state)
├── /firebase         # Firebase configuration and utility functions
├── /hooks            # Custom React hooks
├── /lib              # Utility functions (cn for classnames)
├── /pages            # Top-level page components (Landing, Login, Chat)
├── /services         # Services for interacting with APIs (AI, Firestore)
├── /types            # TypeScript type definitions
├── App.tsx           # Main application component with routing
└── main.tsx          # Application entry point
```

---

## 🔮 Future Improvements

- **Secure Credit Resets:** Move the daily/monthly credit reset logic from the client-side `AuthContext` to a secure, server-side **Firebase Cloud Function**. This will make the system invulnerable to client-side time manipulation.
- **Stripe Integration:** Add a `SubscriptionSection` and integrate Stripe for handling paid plans and unlocking unlimited credits.
- **Admin Dashboard:** A separate dashboard for admins to view user stats and manage the application.
- **More AI Personas:** Introduce new AI personalities with different specialties.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

_Crafted with passion & purpose by [Dennis Mainhardt](https://bestii.me)._
