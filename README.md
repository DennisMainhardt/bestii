### A modern, emotionally intelligent AI chatbot designed to be a "No Bullshit Therapist 2.0."

The Chatbot provides a safe, non-judgmental space for users to explore their thoughts and feelings. It's not just an assistant; it's a transformative companion that helps users break negative cycles, understand their emotional patterns, and foster personal growth. The AI persona, "Raze," is brutally honest yet compassionate, using long-term memory and deep emotional awareness to guide users toward clarity and self-empowerment.

---

## ✨ Key Features

- **🧠 Emotionally Intelligent AI:** Engage in deep, meaningful conversations with an AI that understands context, remembers past interactions, and provides insightful guidance.
- **🔐 Secure User Authentication:** Safe and secure login with Email & Password or Google, including email verification and password reset flows.
- **📝 Long-Term Memory:** The AI summarizes conversations to build long-term memory, allowing it to recognize patterns and recall important details over time.
- **🎭 Multiple Personas:** Switch between different AI personalities (like the tough-love "Raze") to get the support you need.
- **💬 Real-Time Chat Interface:** A beautiful, modern, and responsive chat interface built for a seamless user experience.
- **🌐 Stunning Landing Page:** A fully-featured landing page to introduce users to the app's mission and features.
- **📱 Fully Responsive:** A seamless experience across all devices, from desktop to mobile.

---

## 🚀 Technology Stack

- **Framework:** [React](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
- **Backend & Auth:** [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **AI Services:** [OpenAI API](https://openai.com/) & [Anthropic API](https://www.anthropic.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Form Management:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation.

---

## 🛠️ Getting Started

Follow these instructions to set up the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)
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

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and add your credentials.

**Firebase:**
You'll need to create a new Web App in your Firebase project settings to get these values.

```env
VITE_FIREBASE_API_KEY="your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
VITE_FIREBASE_MEASUREMENT_ID="your_measurement_id" # Optional
```

**AI Services:**

```env
VITE_OPENAI_API_KEY="your_openai_api_key"
VITE_ANTHROPIC_API_KEY="your_anthropic_api_key"
```

### 4. Run the Development Server

```bash
pnpm run dev
```

The application should now be running on `http://localhost:5173` (or another port if 5173 is in use).

---

## 📂 Project Structure

Here's a brief overview of the key directories in this project:

```
/src
├── /components       # Reusable UI components (Chat, Header, UI elements)
├── /constants        # Global constants (e.g., AI prompts)
├── /context          # React Context providers (e.g., AuthContext)
├── /firebase         # Firebase configuration and utility functions
├── /hooks            # Custom React hooks
├── /lib              # Utility functions (e.g., cn for classnames)
├── /pages            # Top-level page components (Landing, Login, etc.)
├── /services         # Services for interacting with APIs (AI, Firebase)
├── /types            # TypeScript type definitions
├── App.tsx           # Main application component with routing
└── main.tsx          # Application entry point
```

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## ❤️ Acknowledgements

A huge thank you to the creators and maintainers of the open-source libraries that made this project possible.

---

_Crafted with passion & purpose by [Dennis Mainhardt](https://bestii.me)._
