import React, { useState } from 'react';
import { UserSession } from '../types';
import { sounds } from '../utils/audio';
import { Volume2, VolumeX, HelpCircle, Tv, LogOut, Shield, Users } from 'lucide-react';

interface HeaderNavProps {
  session: UserSession | null;
  onLogout: () => void;
  onOpenRules: () => void;
  onOpenProjector: () => void;
  isConnected: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  session,
  onLogout,
  onOpenRules,
  onOpenProjector,
  isConnected
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const handleToggleMute = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <header
      id="main-app-header"
      className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="Padutha Theeyaga Logo"
            className="w-10 h-10 rounded-2xl object-cover border border-amber-500/40 shadow-md shadow-amber-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                Padutha Theeyaga
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
                  }`}
                />
                {isConnected ? 'Live Synced' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Projector / Stage View */}
          <button
            id="header-projector-btn"
            type="button"
            onClick={onOpenProjector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="Open Auditorium Stage Display"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Auditorium Screen</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            type="button"
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title={isMuted ? 'Unmute Game Sounds' : 'Mute Sounds'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          {/* Rules Modal Trigger */}
          <button
            id="header-rules-btn"
            type="button"
            onClick={onOpenRules}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Event Rules & Timings"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Active Session Badge & Logout */}
          {session && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300">
                {session.role === 'admin' ? (
                  <>
                    <Shield className="w-3.5 h-3.5 text-amber-400" /> Admin
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5 text-emerald-400" /> {session.teamName}
                  </>
                )}
              </span>

              <button
                id="header-logout-btn"
                type="button"
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700 transition cursor-pointer"
                title="Switch Role or Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
