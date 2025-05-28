const Footer = () => {
  return (
    <footer className="bg-warm-800 text-warm-100 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-warm-300 to-coral-300 bg-clip-text text-transparent mb-4 font-display">
              Your Friend Who Gets It
            </h3>
            <p className="text-warm-300 leading-relaxed max-w-md">
              Here for the real conversations, the tough love, and everything in between.
              Because everyone deserves a friend who truly understands.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-warm-200">Let's Connect</h4>
            <ul className="space-y-2 text-warm-300">
              <li><a href="#" className="hover:text-warm-100 transition-colors">How We Chat</a></li>
              <li><a href="#" className="hover:text-warm-100 transition-colors">Friend Pricing</a></li>
              <li><a href="#" className="hover:text-warm-100 transition-colors">Why I'm Different</a></li>
              <li><a href="#" className="hover:text-warm-100 transition-colors">Questions</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-warm-200">Support</h4>
            <ul className="space-y-2 text-warm-300">
              <li><a href="#" className="hover:text-warm-100 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-warm-100 transition-colors">Privacy Promise</a></li>
              <li><a href="#" className="hover:text-warm-100 transition-colors">Friend Agreement</a></li>
              <li><a href="#" className="hover:text-warm-100 transition-colors">Say Hi</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-warm-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-warm-400 text-sm">
            © 2024 Your Friend Who Gets It. All friendship rights reserved.
          </p>
          <p className="text-warm-400 text-sm mt-4 md:mt-0">
            Made with 💕 for people who want real connections
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 