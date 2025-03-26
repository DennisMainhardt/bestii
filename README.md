# Modern Chatbot

A modern, responsive chatbot application built with React, TypeScript, and Vite. The application features two AI personas powered by different language models:

- **Raze**: Powered by OpenAI's GPT model
- **Rayna**: Powered by Anthropic's Claude 3.7 Sonnet model

## Features

- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- 🌙 Dark/Light mode support
- 💬 Real-time chat interface
- 🤖 Multiple AI personas with different personalities
- 🔄 Responsive design for all devices
- ⚡ Fast and efficient with Vite
- 🔒 Secure API key handling

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key
- Anthropic API key

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/modern-chatbot.git
cd modern-chatbot
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add your API keys:

```env
# OpenAI API Key
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API Key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. Start the development servers:

```bash
npm run dev:all
```

This will start both the frontend (port 3000) and backend (port 3001) servers.

## Available Scripts

- `npm run dev` - Start the frontend development server
- `npm run server` - Start the backend proxy server
- `npm run dev:all` - Start both frontend and backend servers concurrently
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally

## Project Structure

```
modern-chatbot/
├── src/
│   ├── components/     # React components
│   ├── services/       # API service classes
│   ├── types/         # TypeScript type definitions
│   └── App.tsx        # Main application component
├── server.js          # Backend proxy server
├── .env.example       # Example environment variables
└── package.json       # Project dependencies and scripts
```

## Environment Variables

- `VITE_OPENAI_API_KEY`: Your OpenAI API key
- `VITE_ANTHROPIC_API_KEY`: Your Anthropic API key

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
