import { ThemeProvider } from "@/components/theme-provider";
import { Routes, Route, Navigate } from "react-router-dom";
import Chat from "@/components/Chat";
import Landing from "@/pages/Landing";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/login" element={<Navigate to="/chat" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
