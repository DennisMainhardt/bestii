import { ThemeProvider } from "@/components/theme-provider";
import { Routes, Route, Navigate } from "react-router-dom";
import Chat from "@/components/Chat";
import Landing from "@/pages/Landing";
import Login from '@/pages/Login';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
