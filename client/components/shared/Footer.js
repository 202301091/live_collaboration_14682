import React from 'react';
export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950 py-12 text-center text-xs text-gray-500 relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Branding */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-gray-300 tracking-tight">LiveSpace AI</span>
            <span className="text-[10px] text-gray-600 font-medium">© 2026 LiveSpace. All rights reserved.</span>
          </div>
          <p className="text-[10px] text-gray-600 max-w-xs mt-1">
            Fictional collaborative platform demonstrating advanced full-stack and WebSocket real-time system architectures.
          </p>
        </div>
        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-gray-400 font-semibold tracking-wide uppercase text-[10px]">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <span className="text-gray-800">|</span>
          <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
          <span className="text-gray-800">|</span>
          <a href="#" className="hover:text-white transition-colors">API Docs</a>
          <span className="text-gray-800">|</span>
          <a href="mailto:support@LiveSpace-workspace.ai" className="hover:text-white transition-colors">Contact Support</a>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
