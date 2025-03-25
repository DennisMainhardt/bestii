import { ThemeProvider } from "@/components/theme-provider";
import Chat from "@/components/Chat";
import Header from "@/components/Header";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto h-[calc(100vh-4rem)]">
          <Chat />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
