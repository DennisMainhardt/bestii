# Modern Persona Chatbot

A sophisticated chatbot application featuring multiple AI personas, persistent memory, and real-time interaction, built with React, TypeScript, Vite, Firebase, Tailwind CSS, and Shadcn UI.

This application allows users to engage in conversations with distinct AI personalities (like "Raze" using GPT or "Reyna" using Claude). It leverages a persistent memory system to provide contextually relevant interactions by dynamically injecting recent conversation summaries and messages into the AI prompts.

## Core Features

- **Multi-Persona Interaction:** Engage with distinct AI personalities (e.g., "Raze", "Reyna") powered by different underlying models (ChatGPT, Claude via API).
- **Real-time Chat Interface:** Smooth, responsive chat UI with typing indicators, automatic scrolling, and optimistic UI updates for user messages.
- **Firebase Integration:**
  - **Authentication:** Secure user sign-up/sign-in via Email/Password and Google Sign-in.
    - Robust email verification flow with dedicated redirect handling.
    - Password reset functionality.
    - Firestore user profile (`/users/{uid}`) created upon first sign-up/sign-in, storing `uid`, `email`, `displayName`, `createdAt`, `providerId`, and `lastLoginAt`.
  - **Firestore Database:**
    - Stores user profiles (`/users/{uid}`).
    - Stores chat messages per user, tagged with the relevant persona (`/users/{uid}/messages`, contains `persona` field).
    - Stores AI-generated session summaries per persona (`/users/{userId}/personas/{personaId}/summaries`).
    - Stores session metadata (`/users/{userId}/personas/{personaId}/session/metadata`) for controlling summarization (`lastSummarizedMessageTimestamp`).
  - **Security Rules:** Requires careful configuration to protect user data (see Setup section).
- **Persistent Memory System:**
  - **Fused Memory Injection:** Dynamically constructs prompts for the AI before _each_ message by combining:
    - Base persona instructions (defining the AI's core personality).
    - The 3 most recent session summaries retrieved from Firestore (long-term context).
    - The 5 most recent chat messages from the current session state (short-term context).
  - **Automatic Session Summarization:** Ensures conversation context is captured for future sessions.
    - **Regular Trigger:** Creates a summary using the active persona's AI model every `SUMMARIZE_THRESHOLD` (currently 6) messages exchanged.
    - **Fallback Triggers:** Ensures context isn't lost even if the threshold isn't met:
      - **Inactivity:** Summarizes unsummarized messages after `INACTIVITY_TIMEOUT_MS` (currently 2 minutes) of user inactivity.
      - **Page Unload:** Attempts a _best-effort_ summary of unsummarized messages when the user closes the tab/browser (`beforeunload`). Note: Completion is not guaranteed due to browser limitations on asynchronous operations during unload.
    - **Metadata Control:** Uses `lastSummarizedMessageTimestamp` in Firestore metadata (`/users/{uid}/personas/{personaId}/session/metadata`) to track which messages have been included in a summary, preventing redundant summarization.
    - **Session Activation:** Resets the `lastSummarizedMessageTimestamp` to `null` (`markSessionAsActive`) when a user sends a new message, indicating new, unsummarized activity has begun.
- **Modern Tech Stack:**
  - React & TypeScript
  - Vite for fast development build tooling
  - Tailwind CSS for utility-first styling
  - Shadcn UI for pre-built, accessible components
  - `react-hook-form` & `zod` for robust form handling and validation
  - `react-hot-toast` for notifications
- **UI/UX:**
  - Loading indicators for asynchronous operations (initial history loading, AI response).
  - Protected routes (`/chat`) accessible only after login.
  - Responsive design for various screen sizes.
  - Dark/Light theme support (via Shadcn UI).
  - Persona selection interface.

## Project Structure (Key Areas)

```
src/
├── components/       # Reusable UI components (ChatInput, ChatMessage, Header, etc.)
├── constants/        # Prompts, configuration values (e.g., SUMMARIZE_THRESHOLD)
├── context/          # React Context (AuthContext)
├── features/         # (Placeholder - if splitting features later)
├── hooks/            # Custom React Hooks (if any)
├── pages/            # Top-level page components (Login, Chat)
├── services/         # API interaction layer (authService, messageService, memoryService, ChatGPTService, ClaudeService)
├── types/            # TypeScript type definitions (Message, Persona, etc.)
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
