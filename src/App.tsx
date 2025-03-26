import { ThemeProvider } from "@/components/theme-provider";
import Chat from "@/components/Chat";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <Chat />
      </div>
    </ThemeProvider>
  );
}

export default App;
