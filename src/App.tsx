import { ThemeProvider } from "@/components/theme-provider";
import { Routes, Route, Navigate } from "react-router-dom";
import Chat from "@/components/Chat";
import Landing from "@/pages/Landing";
import Login from '@/pages/Login';
import ProtectedRoute from "./components/ProtectedRoute";
import FinishVerification from "@/pages/FinishVerification";
import Dashboard from "@/pages/Dashboard";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <div className="h-full bg-background">
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
      </TooltipProvider>
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
}

export default App;
