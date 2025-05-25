import { ThemeProvider } from "@/components/theme-provider";
import { Routes, Route, Navigate } from "react-router-dom";
import Chat from "@/components/Chat";
import Landing from "@/pages/Landing";
import Login from '@/pages/Login';
import ProtectedRoute from "./components/ProtectedRoute";
import FinishVerification from "@/pages/FinishVerification";
import Dashboard from "@/pages/Dashboard";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Root route always shows Landing page */}
          <Route path="/" element={<Landing />} />
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/chat" element={<Chat />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          {/* Login route (Login page handles redirecting logged-in users away) */}
          <Route path="/login" element={<Login />} />
          {/* Verification handler route */}
          <Route path="/finish-verification" element={<FinishVerification />} />
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
}

export default App;
