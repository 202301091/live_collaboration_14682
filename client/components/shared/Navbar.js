import React from 'react';
import { useStore } from '../../store/useStore';
export function Navbar() {
  const activeUsers = useStore((state) => state.activeUsers);
  const me = useStore((state) => state.me);
  // Group online user list
  const allOnline = [
    ...(me ? [{ id: 'me', username: `${me.username} (You)`, color: me.color }] : []),
    ...activeUsers.filter((u) => u.id !== me?.id)
  ];
  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-slate-950/40 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-white">LiveSpace</span>
          <span className="px-1.5 py-0.5 rounded bg-violet-600/20 text-violet-400 border border-violet-500/30 text-[9px] font-bold uppercase tracking-wider">
            Workspace
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-400 tracking-wide uppercase">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#sandbox-demo" className="hover:text-white transition-colors">Live Sandbox</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-300">
              {allOnline.length} Live
            </span>
            
            <div className="flex items-center ml-2 -space-x-1.5">
              {allOnline.slice(0, 4).map((u) => (
                <div
                  key={u.id}
                  style={{ backgroundColor: u.color }}
                  className="w-5 h-5 rounded-full border border-slate-950 flex items-center justify-center text-[8px] font-extrabold text-slate-950 cursor-help"
                  title={u.username}
                >
                  {u.username[0]}
                </div>
              ))}
              {allOnline.length > 4 && (
                <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-950 flex items-center justify-center text-[7px] font-bold text-gray-300">
                  +{allOnline.length - 4}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
