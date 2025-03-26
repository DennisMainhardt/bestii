# Modern Chatbot Documentation

## Overview

Modern Chatbot is a web application that provides a WhatsApp-like interface for interacting with ChatGPT. The application features a clean, modern design with a focus on user experience and seamless communication with the AI.

## Features

- WhatsApp-style chat interface
- Real-time message updates
- ChatGPT integration
- Message history
- Responsive design
- Dark/Light mode support
- Message status indicators (sent, delivered, read)

## Technical Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI Components
- React Query for data fetching
- React Router for navigation
- Zod for validation

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── services/      # API and external service integrations
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── styles/        # Global styles and Tailwind configuration
```

## Routes

- `/` - Redirects to /chat
- `/chat` - Main chat interface
- `/settings` - User settings and preferences
- `/history` - Chat history and past conversations

## Core Components

### Chat Interface

- `ChatContainer`: Main container for the chat interface
- `MessageList`: Displays the conversation history
- `MessageInput`: Handles user input and message sending
- `MessageBubble`: Individual message display component
- `ChatHeader`: Displays chat information and controls

### ChatGPT Integration

- `ChatGPTService`: Handles communication with the ChatGPT API
- `MessageProcessor`: Processes and formats messages for ChatGPT
- `ResponseHandler`: Manages ChatGPT responses and error handling

## Key Functions

### Message Handling

```typescript
// Send message to ChatGPT
async function sendMessage(message: string) {
  // Process message
  // Send to ChatGPT API
  // Handle response
  // Update UI
}

// Receive and process ChatGPT response
async function handleChatGPTResponse(response: string) {
  // Process response
  // Format message
  // Update chat history
}
```

### State Management

- Message history
- Chat status
- User preferences
- API connection state

## API Integration

The application integrates with the ChatGPT API to:

- Send user messages
- Receive AI responses
- Handle conversation context
- Manage API rate limits
- Handle errors and retries

## User Experience

- Real-time message updates
- Typing indicators
- Message status indicators
- Smooth scrolling
- Message grouping by time
- Support for text formatting

## Security

- API key management
- Input sanitization
- Rate limiting
- Error handling
- Secure message storage

## Future Enhancements

- File attachment support
- Voice message integration
- Group chat functionality
- Message search
- Conversation export
- Custom AI model selection

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- ChatGPT API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Add your ChatGPT API key to the .env file

### Development

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
