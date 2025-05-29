import { Heart, MessageCircle, Users, ShieldCheck, HelpCircle, FileText, Mail, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-footerDarkBrown text-neutral-200 pt-20 pb-12 border-t border-neutral-800">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-4">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-coral-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-4 font-display">
              BestieAI
            </h3>
            <p className="text-neutral-300 leading-relaxed max-w-sm text-sm">
              Lovingly built by a solo dev on a mission: to give you the radically honest, AI-powered friend we all deserve. Zero judgment, 100% heart.
            </p>
          </div>

          {/* Navigation Links - Column 1 */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-5 text-neutral-100 tracking-wide">Explore</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-neutral-300 hover:text-coral-500 transition-colors text-sm flex items-center"><MessageCircle size={16} className="mr-2 opacity-70" /> How It Works</a></li>
              <li><a href="#pricing" className="text-neutral-300 hover:text-coral-500 transition-colors text-sm flex items-center"><Users size={16} className="mr-2 opacity-70" /> Pricing Plans</a></li>
              <li><a href="#testimonials" className="text-neutral-300 hover:text-coral-500 transition-colors text-sm flex items-center"><Heart size={16} className="mr-2 opacity-70" /> Testimonials</a></li>
            </ul>
          </div>

          {/* Navigation Links - Column 2 */}
          <div className="md:col-span-3">
            <h4 className="font-semibold mb-5 text-neutral-100 tracking-wide">Support & Legal</h4>
            <ul className="space-y-3">
              <li><a href="#faq" className="text-neutral-300 hover:text-coral-500 transition-colors text-sm flex items-center"><HelpCircle size={16} className="mr-2 opacity-70" /> FAQ</a></li>
              <li><a href="/privacy" className="text-neutral-300 hover:text-coral-500 transition-colors text-sm flex items-center"><ShieldCheck size={16} className="mr-2 opacity-70" /> Privacy Policy</a></li>
              <li><a href="/terms" className="text-neutral-300 hover:text-coral-500 transition-colors text-sm flex items-center"><FileText size={16} className="mr-2 opacity-70" /> Terms of Service</a></li>
            </ul>
          </div>

          {/* Connect / Social Column */}
          <div className="md:col-span-3">
            <h4 className="font-semibold mb-5 text-neutral-100 tracking-wide">Connect with the Creator</h4>
            <ul className="space-y-3 mb-6">
              <li><a href="mailto:hello@bestieai.app" className="text-neutral-300 hover:text-coral-500 transition-colors text-sm flex items-center"><Mail size={16} className="mr-2 opacity-70" /> hello@bestieai.app</a></li>
            </ul>
            <h4 className="font-semibold mb-4 text-neutral-200 tracking-wide text-xs">Follow My Journey</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-300 hover:text-coral-500 transition-colors"><Github size={20} /></a>
              <a href="#" className="text-neutral-300 hover:text-coral-500 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-neutral-300 hover:text-coral-500 transition-colors"><Instagram size={20} /></a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-neutral-400 text-xs">
            &copy; {currentYear} BestieAI. Crafted with passion & purpose.
          </p>
          <p className="text-neutral-400 text-xs mt-3 sm:mt-0 flex items-center">
            Built by a human, for humans, with a whole lotta <Heart size={14} className="mx-1.5 text-red-500 fill-current" />.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 