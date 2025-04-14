# Modern Persona Chatbot (Raze/Reyna)

A sophisticated chatbot application featuring multiple, distinct AI personas (Raze & Reyna), a dynamic, persistent memory system, and a real-time interactive UI. Built with React, TypeScript, Vite, Firebase (Auth & Firestore), Tailwind CSS, and Shadcn UI.

This application allows users to engage in deep, contextually aware conversations with AI personalities like:

- **Raze:** A brutally honest, no-fluff AI therapist archetype (powered by GPT models) designed for radical clarity and emotional breakthroughs.
- **Reyna:** (Planned) An alternative persona (potentially powered by Claude models) offering a different therapeutic style.

It leverages a sophisticated **persistent memory system** to provide nuanced and evolving interactions.

## Core Features

- **Multiple Distinct AI Personas:** Switch between different AI personalities, each with its own unique voice, core prompts, and potentially different underlying AI models (e.g., Raze/GPT, Reyna/Claude).
- **Dynamic Prompt Engineering:** Constructs prompts for the AI _before each message_ by fusing:
  - **Static Base Prompt:** Persona-specific core instructions, personality, rules, and mic-drop ending requirements (defined in `src/components/Chat.tsx` -> `getBaseSystemPrompt`).
  - **Long-Term Context (Summaries):** Text from the 3 most recent session summaries (`fusedMemory`) retrieved from Firestore.
  - **Extracted Metadata:** Key people, emotional themes, and triggers (`fusedMetadata`) derived from the latest 3 summaries. Includes specific instructions for the AI on _how to use themes_ for pattern recall and connection.
  - **Dynamic Metadata Injection:** Metadata is only injected into the prompt if the key people, themes, or triggers have changed since the last turn, optimizing token usage.
  - **Short-Term Context (Recent Messages):** The last 6 raw messages (`lastMessages`) from the current session state.
  - **Current User Input:** The message just sent by the user.
  - **Persona Reminder:** An inline reminder for the AI to maintain its specific persona (e.g., Raze).
- **Persistent Memory System:**
  - **Automatic Session Summarization:** Captures conversation context for future sessions and metadata extraction.
    - **Trigger:** Creates a summary using the active persona's AI model every `SUMMARIZE_THRESHOLD` (currently 6) messages exchanged since the last summary.
    - **Content:** Summaries include both the narrative text and structured `metadata` (key_people, key_events, emotional_themes, triggers).
    - **Storage:** Summaries are saved to Firestore under `/users/{userId}/personas/{personaId}/memory_sessions/{summaryId}`.
    - **Control:** Uses `lastSummaryTimestamp` in the user document (`/users/{userId}`) to track which messages have been included in a summary.
  - **Dynamic Metadata Extraction:** The AI model itself (via a dedicated prompt in the `generateSummary` method) extracts structured metadata (people, events, themes, triggers) from the conversation chunk being summarized.
  - **Session Activation:** Resets `lastSummaryTimestamp` to `null` when a user sends a new message, indicating a new active session segment requiring summarization.
- **Real-time Chat Interface:** Smooth, responsive chat UI built with React and Shadcn UI, featuring typing indicators and automatic scrolling. Listener logic includes debouncing and locking (`isSummarizingRef`) to prevent duplicate summary generation on rapid Firestore updates.
- **Firebase Integration:**
  - **Authentication:** Secure user sign-up/sign-in (Email/Password, Google). Includes email verification and password reset flows.
  - **Firestore Database:** Stores user profiles, messages per persona, and the detailed memory summaries (including metadata) per persona.
  - **Security Rules:** Robust Firestore rules (`firestore.rules`) restrict access to ensure users can only interact with their own data. Includes validation functions for data integrity.
- **Modern Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Shadcn UI, Firebase SDK v9+.
- **Testing:** Includes unit tests for Firebase security rules using `@firebase/rules-unit-testing` and the Emulator Suite (`tests/`). Addresses previous race condition issues by using targeted document deletion in `beforeEach` instead of global cleanup.

## Project Structure (Key Areas)

```
src/
├── components/       # Reusable UI components (ChatInput, ChatMessage, Header, Chat.tsx)
├── constants/        # Prompts, configuration values
├── context/          # React Context (AuthContext)
├── firebase/         # Firebase configuration (firebaseConfig.ts, firestoreUtils.ts)
├── services/         # API interaction layer (authService, messageService, memoryService, ChatGPTService, ClaudeService)
├── types/            # TypeScript type definitions (Message, Persona, SummaryMetadata, etc.)
├── App.tsx           # Main application component with routing logic
├── main.tsx          # Application entry point
└── index.css         # Global styles / Tailwind directives

tests/                # Firebase rules unit tests
firestore.rules       # Firestore security rules definition
firebase.json         # Firebase project config (incl. emulator settings)
README.md             # This file
# ... other config files (vite.config.ts, tailwind.config.js, etc.)
```

## Key Logic Flow: `handleSendMessage` in `Chat.tsx`

1.  User sends message (`messageContent`).
2.  Set `isAiResponding` state to `true`.
3.  Asynchronously save user message to Firestore (listener will update UI).
4.  Call `markSessionAsActive` (updates `lastSummaryTimestamp` to `null`).
5.  Fetch last 3 summaries (`getRecentMemorySummaries`).
6.  Extract `summary` text into `fusedMemory`.
7.  Extract metadata (people, themes, triggers) into `currentPeopleSet`, etc.
8.  Compare `current` metadata sets with `lastUsedMetadataRef`.
9.  **If metadata changed:**
    - Build `fusedMetadata` string including people, triggers, and theme recall instructions.
    - Log injection.
10. **Else:**
    - `fusedMetadata` remains empty.
    - Log skip.
11. Update `lastUsedMetadataRef` with `current` sets.
12. Get last 6 messages from state (`lastMessages`).
13. Get `baseSystemPrompt` for the current persona.
14. Construct `finalSystemPrompt` by combining:
    - `baseSystemPrompt`
    - `fusedMemory`
    - `fusedMetadata` (potentially empty)
    - `lastMessages`
    - `messageContent` (current user input)
    - `personaReminder`
15. Log components and final prompt + estimated tokens.
16. Call `service.setSystemPrompt(finalSystemPrompt)` on the relevant AI service instance.
17. Call `aiService.sendMessage(messageContent)` to get AI response.
18. Asynchronously save AI response to Firestore (listener updates UI).
19. Set `isAiResponding` state to `false`.

## Key Logic Flow: Firestore Listener & Summarization (`Chat.tsx`)

1.  Firestore listener (`getMessages`) observes changes in the user's message collection for the current persona.
2.  On change, callback fires -> debounced via `setTimeout` (100ms).
3.  Debounced callback checks `isSummarizingRef` lock. If locked, exits.
4.  Sets `isSummarizingRef` lock to `true`.
5.  Processes incoming messages, updates local `chatHistories` state (optimistically comparing with previous state to avoid redundant renders).
6.  Calls `triggerMemorySummarizationIfNeeded` with the _potentially_ updated message list.
7.  Releases lock in `finally` block.
8.  `triggerMemorySummarizationIfNeeded`:
    - Gets `lastSummaryTimestamp` from user doc.
    - Filters message list for messages newer than timestamp.
    - If count >= `SUMMARIZE_THRESHOLD`:
      - Selects AI service (GPT/Claude).
      - Calls `service.generateSummary(messagesToSummarize)`.
      - `generateSummary` uses a specific prompt asking the AI to produce JSON containing `summary` and `metadata` (people, events, themes, triggers).
      - Parses the JSON response.
      - Calls `saveSummary` (in `firestoreUtils.ts`) to save the summary text and metadata map to `/memory_sessions`.
      - Calls `updateLastSummaryTimestamp` to save the timestamp of the _last_ message included in this summary back to the user document.

## Setup

1.  **Clone & Install:**

    ```bash
    git clone <your-repository-url>
    cd modern-chatbot # Or your project directory name
    npm install
    ```

2.  **Set up Firebase Project:**

    - Create project at [console.firebase.google.com](https://console.firebase.google.com/).
    - Add a **Web App**.
    - Enable **Authentication** (Email/Password, Google). Configure authorized domains (`localhost`). Set up Email Verification redirect URL in templates.
    - Enable **Firestore Database** (start in Test Mode initially, then apply rules).
    - Obtain Firebase Web App config keys.

3.  **Set up AI Service APIs:**

    - Get API keys from [OpenAI](https://platform.openai.com/api-keys) and [Anthropic](https://console.anthropic.com/settings/keys).

4.  **Configure Environment Variables:**

    - Create `.env` file in root.
    - Add Firebase config keys (`VITE_FIREBASE_*`).
    - Add AI service API keys (`VITE_OPENAI_API_KEY`, `VITE_ANTHROPIC_API_KEY`).
    - **Add `.env` to `.gitignore`!**

5.  **Configure & Deploy Firebase Security Rules:**

    - Review and understand `firestore.rules`.
    - **Test Rules Locally:** Use `npm test` (requires Firebase Emulator Suite running or use `firebase emulators:exec --only firestore 'npm test'`).
    - **Deploy Rules:**
      - Ensure `firebase.json` points to `firestore.rules`.
      - Run `firebase deploy --only firestore:rules`.
      - Address any deployment warnings.

6.  **Create Firestore Indexes:**
    - Run the app (`npm run dev`).
    - Interact with the chat features.
    - Check the browser console for Firestore errors indicating missing indexes.
    - Click the provided links to create the required composite indexes in the Firebase console.

## Running the Development Server

```bash
npm run dev
```

Access at `http://localhost:5173` (or specified port).

## Building for Production

```bash
npm run build
```

Deploy the contents of the `dist` folder.

## Future Considerations / Potential Improvements

- **Token Optimization:** Further condense base prompts or explore more advanced context management if token limits become an issue again.
- **Error Handling:** Enhance UI feedback for specific API or Firestore errors.
- **Streaming Responses:** Implement streaming for AI responses for better perceived performance.
- **Model Selection UI:** Allow users to choose the underlying model for a persona if desired.
- **Advanced Metadata Usage:** Develop features that explicitly leverage stored metadata beyond prompt injection (e.g., querying summaries based on mentioned people).
- **Claude Implementation:** Fully implement and test the `ClaudeService` for the Reyna persona if not already complete.
- **UI Polish:** Refine styles, transitions, and user experience elements.
- **More Robust State Management:** Consider libraries like Zustand or Redux Toolkit if state complexity grows significantly.
