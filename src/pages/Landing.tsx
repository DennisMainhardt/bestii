import Header from "@/components/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import ChatExample from "@/components/landing/ChatExample";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 antialiased">
      <Header />

      <main>
        <Hero />
        <Features />
        <ChatExample />
        <Testimonials />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
};

export default Landing; 