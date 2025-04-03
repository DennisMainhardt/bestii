# Modern Chatbot UI

This project is a modern chatbot interface built with React, TypeScript, Vite, Tailwind CSS, and Shadcn UI.

## Features

- User authentication using Firebase:
  - Email/Password Sign-up & Sign-in
  - Google Sign-In
  - Email verification flow (using Action Code Links)
  - Password reset functionality
  - Secure password visibility toggles
  - Centralized authentication state management (`AuthContext`)
- Protected routes for authenticated users (`/chat`)
- Real-time form validation on blur (`react-hook-form`, `zod`)
- Toast notifications for user feedback (`react-hot-toast`)
- Loading indicators during async operations
- Dark/Light theme toggle
- Responsive design
- Landing page (`/`)
- Basic chat interface structure (`/chat` - functionality pending)

## Setup

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd modern-chatbot
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up Firebase:**

    - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    - Create a Web App within your Firebase project.
    - Enable Authentication methods: Go to Authentication -> Sign-in method and enable "Email/Password" and "Google".
    - Find your Firebase configuration keys in Project Settings -> General -> Your apps -> Web app.
    - **Authorize Domains:** Go to Authentication -> Settings -> **Authorized domains** and ensure `localhost` (for development) and your production domain are listed.
    - **Configure Email Verification Redirect:** Go to Authentication -> **Templates** -> Email address verification. Click the pencil icon (Edit), enable "Customize action URL", and enter the URL for your verification handler page (e.g., `http://localhost:3000/finish-verification` for development, replacing the domain/port as needed). Save the template.

4.  **Configure Environment Variables:**

    - Create a file named `.env` by copying `.env.example`.
    - Fill in your Firebase configuration keys in the `.env` file.
    - **Important:** Add `.env` to your `.gitignore` file.

5.  **Configure Firebase Security Rules:**
    - **(Crucial Step)** Go to your Firebase project console (Firestore Database, Realtime Database, or Storage).
    - Update the security rules to ensure only authenticated and authorized users can access data. Deny all access by default and explicitly grant permissions based on `request.auth`.

## Running the Development Server

```bash
npm run dev
# or
# yarn dev
```

This will start the Vite development server, typically at `http://localhost:5173`.

## Building for Production

```bash
npm run build
# or
# yarn build
```

This command bundles the application for production deployment into the `dist` folder.
