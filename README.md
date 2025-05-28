# Modern Persona Chatbot

A sophisticated chatbot application featuring multiple AI personas, persistent memory, and real-time interaction, built with React, TypeScript, Vite, Firebase, Tailwind CSS, Shadcn UI, and Framer Motion.

This application allows users to engage in conversations with distinct AI personalities. It leverages a persistent memory system to provide contextually relevant interactions. It now also features a redesigned, engaging landing page to welcome users.

## Core Features

- **Multi-Persona Interaction:** Engage with distinct AI personalities (e.g., "Raze", "Reyna") powered by different underlying models (ChatGPT, Claude via API).
- **Real-time Chat Interface:** Smooth, responsive chat UI with typing indicators, automatic scrolling, and optimistic UI updates for user messages.
- **Firebase Integration:**
  - **Authentication:** Secure user sign-up/sign-in via Email/Password and Google Sign-in.
    - Robust email verification flow with dedicated redirect handling.
    - Password reset functionality.
    - Firestore user profile (`/users/{uid}`) created upon first sign-up/sign-in.
  - **Firestore Database:**
    - Stores user profiles (`/users/{uid}`).
    - Stores chat messages per user, tagged with the relevant persona (`/users/{uid}/messages`).
    - Stores AI-generated session summaries per persona (`/users/{userId}/personas/{personaId}/summaries`).
    - Stores session metadata (`/users/{userId}/personas/{personaId}/session/metadata`) for controlling summarization.
  - **Security Rules:** Configured to protect user data.
- **Persistent Memory System:**
  - **Fused Memory Injection:** Dynamically constructs prompts for the AI.
  - **Automatic Session Summarization:** Ensures conversation context is captured.
- **Redesigned Landing Page:**
  - **Hero Section:** Engaging hero with an animated phone mock-up displaying a live-typing chat sequence, built with Framer Motion.
  - **Features Section:** Highlights key benefits and functionalities.
  - **Testimonials Section:** Displays user feedback with star ratings and before/after scenarios.
  - **FAQ Section:** Answers common questions.
  - **Footer:** Contains relevant links and information.
- **User Dashboard:**
  - **Profile Section:** Allows users to view and update their profile information.
  - **Subscription Section:** (Placeholder/Future capability for managing subscriptions).
- **Modern Tech Stack:**
  - React & TypeScript
  - Vite for fast development build tooling
  - Tailwind CSS for utility-first styling
  - Shadcn UI for pre-built, accessible components
  - Framer Motion for animations (especially on the landing page)
  - `react-hook-form` & `zod` for robust form handling and validation
  - `react-hot-toast` for notifications
- **UI/UX:**
  - **New Navigation Header:** Redesigned header with smooth scroll-activated blur/opacity effects and a mobile-friendly responsive menu, inspired by modern UI patterns. Includes user authentication status, profile dropdown, and theme toggle.
  - Loading indicators for asynchronous operations.
  - Protected routes (`/chat`, `/dashboard`) accessible only after login.
  - Responsive design for various screen sizes.
  - Dark/Light theme support.
  - Persona selection interface.

## Recent Major Updates (Post-Initial Multi-Persona Setup)

### 1. Comprehensive Landing Page Redesign

The application now features a completely revamped landing page (`src/pages/Landing.tsx`) designed to be engaging and informative. This redesign was heavily inspired by the `DennisMainhardt/brutally-honest-buddy-bot` repository. Key components include:

- `src/components/landing/Hero.tsx`: Features a prominent phone mock-up with a live-typing chat animation powered by Framer Motion, showcasing the chatbot's interaction style.
- `src/components/landing/Features.tsx`: Clearly outlines the unique selling propositions of the chatbot.
- `src/components/landing/Testimonials.tsx`: Displays authentic-looking user testimonials with avatars, before/after states, and star ratings, including a "Legendary CTA" block.
- `src/components/landing/FAQ.tsx`: Addresses frequently asked questions.
- `src/components/landing/Footer.tsx`: Standard footer with navigation and copyright.
  The integration also involved merging Tailwind CSS configurations (custom colors, fonts, animations) and global styles from the inspiration repository.

### 2. Navigation Header Overhaul

The main application header (`src/components/Header.tsx`) was redesigned to provide a modern and fluid user experience.

- **Inspiration:** The design and animation concepts were drawn from a `shadcn/ui` block (`hero-section-1`).
- **Implementation:** Relevant navigation elements and animations (like scroll-based background opacity/blur changes and smooth mobile menu transitions) were extracted and adapted into the existing `Header.tsx`.
- **Integration:** The new header seamlessly integrates existing functionalities like `useAuth` for conditional rendering of login/signup buttons vs. user profile dropdown, theme toggling, and logout logic. `next/link` was replaced with `react-router-dom`'s `Link`.

### 3. Performance Optimization

Significant effort was dedicated to addressing UI performance, particularly scroll lag experienced on the new landing page in Google Chrome.

- **Key Culprit:** `backdrop-blur` effects on the header were identified as a primary source of lag in Chrome, while performing well in Safari.
- **Iterative Adjustments:**
  - Header: Various combinations of `bg-opacity` and `backdrop-blur` levels (e.g., `-lg`, `-md`, `-sm`, and complete removal) were tested to find a balance between aesthetics and performance.
  - `Hero.tsx` animations: Framer Motion animations (phone pulse/glow, typing dots) were temporarily disabled to isolate their performance impact.
  - `Testimonials.tsx`: A minor pulse animation was also temporarily disabled.
- **Current Status:** Animations have been re-enabled. The header uses a moderate `backdrop-blur` (`backdrop-blur-sm`) and background opacity (`bg-background/50`) which provides an acceptable performance level on Chrome while retaining a good visual effect. Ongoing monitoring might be needed for further fine-tuning.

### 4. User Dashboard

A user dashboard (`src/pages/Dashboard.tsx`) was implemented with:

- `src/components/dashboard/ProfileSection.tsx`: For users to view and update their profile.
- `src/components/dashboard/SubscriptionSection.tsx`: Placeholder for future subscription management.
- `src/components/dashboard/DashboardNav.tsx`: Navigation within the dashboard.
  The header was updated to include a dropdown menu for accessing "Account Settings" (leading to the dashboard) and "Log Out".

## Project Structure (Key Areas)

```
src/
├── components/       # Reusable UI components
│   ├── landing/      # Components specific to the new Landing Page (Hero, Features, Testimonials, etc.)
│   ├── dashboard/    # Components specific to the User Dashboard
│   ├── ui/           # Shadcn UI components (Button, DropdownMenu, etc.)
│   └── (common components like ChatInput, ChatMessage, Header, ThemeToggle)
├── constants/        # Prompts, configuration values
├── context/          # React Context (AuthContext)
├── pages/            # Top-level page components (Landing, Login, Chat, Dashboard, etc.)
├── services/         # API interaction layer
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── App.tsx           # Main application component with routing logic
├── main.tsx          # Application entry point
├── firebase/         # Firebase configuration and initialization
│   └── firebaseConfig.ts
└── index.css         # Global styles / Tailwind directives
```

## Setup

1.  **Clone & Install:**

    ```bash
    git clone <your-repository-url>
    cd modern-chatbot
    npm install
    # or yarn install
    ```

2.  **Set up Firebase Project:**

    - Create a project at [console.firebase.google.com](https://console.firebase.google.com/).
    - Add a **Web App** to your project.
    - **Enable Authentication:** Go to Authentication -> Sign-in method and enable "Email/Password" and "Google".
    - **Enable Firestore Database:** Go to Firestore Database -> Create database. Start in **Test mode** for initial development (allows all reads/writes), but **remember to secure it with rules before any production use.**
    - **Authorize Domains** (Authentication -> Settings -> Authorized domains): Ensure `localhost` is listed for development. Add your deployed app's domain later.
    - **Configure Email Verification Redirect:** (Authentication -> Templates -> Email verification -> Edit (pencil icon) -> Customize action URL). Set the URL your app will handle for completing verification (e.g., `http://localhost:5173/verify-email`). Ensure this matches your routing setup.
    - **Obtain Firebase Config:** Find your Web App's configuration keys in Project Settings -> General -> Your apps -> SDK setup and configuration -> Config. You'll need these for your environment variables.

3.  **Set up AI Service APIs:**

    - Obtain API keys from [OpenAI](https://platform.openai.com/api-keys) (for ChatGPT models) and [Anthropic](https://console.anthropic.com/settings/keys) (for Claude models).

4.  **Configure Environment Variables:**

    - Create a `.env` file in the project root (copy `.env.example` if it exists).
    - Add your Firebase configuration keys:
      ```
      VITE_FIREBASE_API_KEY=your_api_key
      VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
      VITE_FIREBASE_PROJECT_ID=your_project_id
      VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
      VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
      VITE_FIREBASE_APP_ID=your_app_id
      ```
    - Add your AI service API keys:
      ```
      VITE_OPENAI_API_KEY=your_openai_key
      VITE_ANTHROPIC_API_KEY=your_anthropic_key
      ```
    - **SECURITY:** Add `.env` to your `.gitignore` file to prevent accidentally committing your secret keys.

5.  **Configure Firebase Security Rules (Firestore) - CRUCIAL:**

    - **Importance:** Default test rules are insecure. You **must** restrict database access to prevent unauthorized data access or modification. These rules define _who_ can read/write _what_ data in your Firestore database.
    - The rules for this project are located in `firestore.rules`. They aim to ensure users can only access and modify _their own_ data across profiles, messages, summaries, and metadata.
    - Key principles implemented:

      - Helper functions (`isAuthenticated`, `isOwner`, `isNonEmptyString`, `isServerTimestamp`, `isTimestampOrNull`) for clarity and reuse.
      - User Profile (`/users/{userId}`): Owner `get`, `create` (with field validation), `update` (specific allowed fields, immutable fields protected). `list`, `delete` disallowed.
      - Messages (`/users/{userId}/messages/{messageId}`): Owner `read`, `create` (with field validation). `update`, `delete` disallowed.
      - Persona Summaries (`/users/{userId}/personas/{personaId}/summaries/{summaryId}`): Owner `read`, `create` (with validation). `update`, `delete` disallowed.
      - Session Metadata (`/users/{userId}/personas/{personaId}/session/metadata`): Owner `get`, `create` (with validation), `update` (only `lastSummarizedMessageTimestamp` field). `list`, `delete` disallowed.

    - **Testing Security Rules with the Emulator Suite:**

      - **Benefits:** Testing rules locally using the Firebase Emulator Suite is essential for catching errors before deployment. It provides a fast, isolated environment without affecting live data.
      - **Test Files:** Unit tests for the rules are located in the `tests/` directory (`users.rules.test.ts`, `messages.rules.test.ts`, `personas.rules.test.ts`).
      - **Framework:** Tests utilize the `@firebase/rules-unit-testing` library to simulate authenticated and unauthenticated requests against the rules loaded into the Firestore emulator. Helper functions in `tests/testUtils.ts` (like `setupFirestoreTestEnvironment`, `teardownFirestoreTestEnvironment`) manage the emulator lifecycle.
      - **Running Tests:**
        ```bash
        # Ensure Firestore emulator is running (e.g., via `firebase emulators:start`)
        # Then, in another terminal:
        npm test
        # Or, run tests directly against the emulator without starting it separately:
        # firebase emulators:exec --only firestore 'npm test'
        ```
      - **Handling Test Intermittency (Race Conditions):**
        - **Problem:** During development, intermittent test failures (`PERMISSION_DENIED` or `NOT_FOUND` errors) were observed, often passing on the first run but failing on subsequent runs. This was traced to race conditions caused by the interaction between Jest's test execution order and the test helper `clearFirestoreData()` being called in an `afterEach` block. Clearing _all_ data after _each_ test in one suite could interfere with the `beforeEach` setup of a test in another suite running concurrently or immediately after.
        - **Solution:** The fix involved removing the global `afterEach(() => clearFirestoreData())` hooks from the test suites. Instead, each suite's `beforeEach` hook was modified to _explicitly delete only the specific documents_ relevant to that suite using `deleteDoc()` _before_ setting up the required test data with `setDoc()`. This ensures true test isolation and prevents cross-suite interference, leading to stable and reliable test results.

    - **Deploying Security Rules:**
      - **Method 1: Firebase CLI (Recommended):**
        - Ensure you have the Firebase CLI installed (`npm install -g firebase-tools`) and are logged in (`firebase login`).
        - Make sure your `firebase.json` file correctly points to your rules file. It should contain a `firestore` block like this:
          ```json
          {
            "firestore": {
              "rules": "firestore.rules"
              // Add "indexes": "firestore.indexes.json" if managing indexes via CLI
            }
            // ... other configurations like emulators ...
          }
          ```
          _(If you encounter `Cannot understand what targets to deploy` errors, check this configuration.)_
        - From your project root, run:
          ```bash
          firebase deploy --only firestore:rules
          ```
        - **Deployment Warnings:** Pay attention to any warnings during deployment (e.g., `Unused function`, `Invalid variable name`). These often indicate unused code or potential errors that should be cleaned up in `firestore.rules`, even if the deployment succeeds. We encountered and fixed an `Unused function` warning during development.
      - **Method 2: Manual Console Upload:**
        - Go to your Firebase project -> Firestore Database -> Rules tab.
        - Copy the entire content of your local `firestore.rules` file.
        - Paste it into the editor in the console, replacing the existing rules.
        - Click **Publish**. _(Use the Rules Playground here to test changes before publishing)_.

6.  **Create Firestore Indexes:**

    - Firestore often requires specific composite indexes for complex queries used in the application (e.g., fetching messages by persona sorted by time, fetching recent summaries sorted by time).
    - Run the application (`npm run dev`). When performing actions that trigger these queries for the first time, Firebase will log errors in the browser's developer console containing direct links to create the necessary indexes.
    - Click these links and create the suggested indexes in the Firebase console. Common required indexes might include:
      - Collection: `messages`, Fields: `userId` (asc), `persona` (asc), `createdAt` (desc) - _Adjust based on actual queries_
      - Collection: `summaries` (within the subcollection path), Fields: `createdAt` (desc)
      - _(Look for specific error messages from Firestore in your console)_

## Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Access the application at `http://localhost:5173` (or the port specified by Vite).

## Building for Production

```bash
npm run build
# or
yarn build
```

This command generates a `dist` folder containing the optimized static assets. Deploy the contents of this folder to your preferred hosting provider (e.g., Firebase Hosting, Netlify, Vercel).

## Local Network Testing (UI/UX Only)

To view the UI on a mobile device on the same network (without full login functionality via IP):

1.  Run `npm run dev -- --host`.
2.  Access `http://<your-computer-ip>:<port>` from your mobile browser.

For full functionality testing (including login) on other devices, consider using a tunneling service like `ngrok` or deploying to a preview environment.
