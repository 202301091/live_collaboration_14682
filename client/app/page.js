'use client';
import React from 'react';
import { SocketProvider,useSocket} from '../context/SocketContext.js';
import { useStore } from '../store/useStore.js';
import Navbar from '../components/shared/Navbar.js';
import Features from '../components/shared/Features.js';
import SharedCanvas from '../components/canvas/SharedCanvas.js';
import VotingWidget from '../components/realtime/VotingWidget.js';
import SharedCounter from '../components/realtime/SharedCounter.js';
import ThemeSync from '../components/realtime/ThemeSync.js';
import ReactionBlaster from '../components/realtime/ReactionBlaster.js';
import ActivityLog from '../components/realtime/ActivityLog.js';
import CursorOverlay from '../components/realtime/CursorOverlay.js';
import HeatmapOverlay from '../components/realtime/HeatmapOverlay.js';
import Footer from '../components/shared/Footer.js';
import ChatWidget from '../components/chat/ChatWidget.js';

function InnerPage() {
  const theme = useStore((state) => state.theme);
  const cursors = useStore((state) => state.cursors);
  const { sendCursorMove } = useStore();
  const handleMouseMove = (e) => {
    window.dispatchEvent(new CustomEvent('local:mousemove', {
      detail: { x: e.clientX, y: e.clientY }
    }));
  };
  React.useEffect(() => {
    const handleLocalMouse = (e) => {
      const socketContext = window.LiveSpace_socket_dispatchers;
      if (socketContext) {
        socketContext.sendCursorMove(e.detail);
      }
    };
    window.addEventListener('local:mousemove', handleLocalMouse);
    return () => window.removeEventListener('local:mousemove', handleLocalMouse);
  }, []);
  
  const getThemeClass = () => {
    switch (theme) {
      case 'light': return 'bg-slate-50 text-slate-900 theme-light';
      case 'cyberpunk': return 'bg-black text-yellow-400 theme-cyberpunk';
      default: return 'bg-slate-950 text-slate-100 theme-dark';
    }
  };
  return (
    <div 
      onMouseMove={handleMouseMove}
      className={`min-h-screen relative flex flex-col overflow-x-hidden select-none transition-colors duration-500 ${getThemeClass()}`}
    >

      <CursorOverlay />

      <HeatmapOverlay />

      <Navbar />

      <Features />

      <main id="sandbox-demo" className="relative max-w-7xl mx-auto px-6 py-12 w-full flex flex-col gap-8 scroll-mt-20 z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-6">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-800/30 uppercase tracking-wider">
            Interactive Sandbox
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            Live Collaboration Sandbox
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 font-medium mt-4 leading-relaxed">
            Every drawing stroke, counter change, feature vote, reaction blast, active theme toggle, and audio play command updates immediately for all connected visitors.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 items-stretch">

          <div className="lg:col-span-2 flex flex-col items-stretch">
            <SharedCanvas />
          </div>

          <div className="flex flex-col md:flex-row w-full gap-6">
            <VotingWidget />
            <SharedCounter />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <ThemeSync />
          <ReactionBlaster />
          <ActivityLog />
        </div>
      </main>

      <Footer />

      <ChatWidget />
    </div>
  );
}

export default function Home() {
  return (
    <SocketProvider>
      <SocketConsumerWrapper>
        <InnerPage />
      </SocketConsumerWrapper>
    </SocketProvider>
  );
}

function SocketConsumerWrapper({ children }) {
  const socketContext = useSocket();
  
  React.useEffect(() => {
    if (socketContext) {
      window.LiveSpace_socket_dispatchers = socketContext;
    }
  }, [socketContext]);
  return <>{children}</>;
}
