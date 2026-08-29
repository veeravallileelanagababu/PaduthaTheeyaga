import React, { useState } from 'react';
import { Radio, Lock, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface BuzzerButtonProps {
  onBuzz: () => void;
  disabled: boolean;
  isFirstBuzzer: boolean;
  buzzedTeamName?: string;
  isCurrentTeamBuzzed: boolean;
  isLocked: boolean;
  isTie: boolean;
  status: string;
  myTeamName: string;
}

export const BuzzerButton: React.FC<BuzzerButtonProps> = ({
  onBuzz,
  disabled,
  isFirstBuzzer,
  buzzedTeamName,
  isCurrentTeamBuzzed,
  isLocked,
  isTie,
  status,
  myTeamName
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePointerDown = () => {
    if (disabled || isLocked) return;
    setIsPressed(true);
    sounds.playBuzzer();
    onBuzz();
  };

  const handlePointerUp = () => {
    setIsPressed(false);
  };

  // State Logic
  let buttonLabel = 'PRESS BUZZER';
  let subLabel = 'Tap fast when you decode the song!';
  let buttonTheme = 'active'; // 'active' | 'success' | 'locked' | 'other-buzzed' | 'idle'

  if (isLocked) {
    buttonTheme = 'locked';
    buttonLabel = 'LOCKED OUT';
    subLabel = 'Wrong answer submitted. Unlocks for next song.';
  } else if (isCurrentTeamBuzzed) {
    buttonTheme = 'success';
    buttonLabel = isTie ? '⚡ TIE BREAK BUZZ!' : '🎉 YOU BUZZED #1!';
    subLabel = 'Timer paused! State your song name & movie now!';
  } else if (buzzedTeamName) {
    buttonTheme = 'other-buzzed';
    buttonLabel = `${buzzedTeamName} BUZZED`;
    subLabel = 'Timer paused! Waiting for quiz master decision...';
  } else if (status !== 'running') {
    buttonTheme = 'idle';
    buttonLabel = 'BUZZER IDLE';
    subLabel = status === 'paused' ? 'Round paused by Admin' : 'Waiting for host to start song...';
  }

  return (
    <div id="buzzer-container" className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-4">
      {/* Outer Glow Halo */}
      <div className="relative flex items-center justify-center">
        {buttonTheme === 'active' && !disabled && (
          <div className="absolute -inset-4 rounded-full bg-rose-500/20 blur-xl animate-pulse pointer-events-none" />
        )}
        {buttonTheme === 'success' && (
          <div className="absolute -inset-6 rounded-full bg-emerald-500/30 blur-2xl animate-pulse pointer-events-none" />
        )}
        {buttonTheme === 'other-buzzed' && (
          <div className="absolute -inset-4 rounded-full bg-amber-500/20 blur-xl pointer-events-none" />
        )}

        {/* 3D Physical Button Base Rim */}
        <div
          className={`p-4 rounded-full border-4 shadow-2xl transition-all duration-200 ${
            buttonTheme === 'active'
              ? 'bg-slate-900 border-rose-500/40 shadow-rose-950/80 ring-8 ring-rose-500/10'
              : buttonTheme === 'success'
              ? 'bg-slate-900 border-emerald-400 shadow-emerald-950/80 ring-8 ring-emerald-500/20'
              : buttonTheme === 'locked'
              ? 'bg-slate-950 border-slate-700 shadow-none ring-4 ring-rose-950/30'
              : buttonTheme === 'other-buzzed'
              ? 'bg-slate-900 border-amber-500/40 ring-4 ring-amber-500/10'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          {/* Pushable Buzzer Dome */}
          <button
            id="team-buzzer-btn"
            type="button"
            disabled={disabled || isLocked}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            className={`relative flex flex-col items-center justify-center rounded-full select-none cursor-pointer transition-all duration-100 outline-none ${
              // Sizing
              'w-56 h-56 sm:w-64 sm:h-64'
            } ${
              buttonTheme === 'active'
                ? isPressed
                  ? 'bg-gradient-to-b from-rose-700 to-red-900 translate-y-2 shadow-inner scale-95'
                  : 'bg-gradient-to-b from-red-500 via-rose-600 to-red-800 shadow-[0_12px_0_#991b1b,0_20px_25px_rgba(0,0,0,0.6)] hover:brightness-110 active:translate-y-2 active:shadow-inner'
                : buttonTheme === 'success'
                ? 'bg-gradient-to-b from-emerald-400 via-emerald-600 to-teal-800 shadow-[0_10px_0_#065f46,0_20px_25px_rgba(0,0,0,0.6)]'
                : buttonTheme === 'locked'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-75 shadow-none'
                : buttonTheme === 'other-buzzed'
                ? 'bg-gradient-to-b from-amber-600 to-yellow-800 shadow-[0_8px_0_#78350f] cursor-not-allowed'
                : 'bg-slate-800 text-slate-400 cursor-not-allowed shadow-[0_8px_0_#1e293b]'
            }`}
          >
            {/* Top Gloss Reflection */}
            <div className="absolute top-3 left-6 right-6 h-12 bg-white/20 rounded-full blur-[1px] pointer-events-none" />

            {/* Icon */}
            <div className="mb-2">
              {buttonTheme === 'locked' ? (
                <Lock className="w-12 h-12 text-slate-400" />
              ) : buttonTheme === 'success' ? (
                <CheckCircle2 className="w-14 h-14 text-white animate-bounce" />
              ) : buttonTheme === 'other-buzzed' ? (
                <ShieldAlert className="w-12 h-12 text-amber-200" />
              ) : buttonTheme === 'active' ? (
                <Zap className={`w-14 h-14 text-white ${isPressed ? 'scale-90' : 'animate-pulse'}`} />
              ) : (
                <Radio className="w-10 h-10 text-slate-500" />
              )}
            </div>

            {/* Main Label */}
            <span
              className={`font-['Orbitron',sans-serif] font-black tracking-wider text-center px-4 leading-tight ${
                buttonTheme === 'active'
                  ? 'text-white text-2xl sm:text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                  : buttonTheme === 'success'
                  ? 'text-white text-xl sm:text-2xl drop-shadow-md'
                  : buttonTheme === 'locked'
                  ? 'text-rose-400 text-lg sm:text-xl'
                  : buttonTheme === 'other-buzzed'
                  ? 'text-amber-100 text-lg sm:text-xl'
                  : 'text-slate-400 text-lg'
              }`}
            >
              {buttonLabel}
            </span>

            {/* Micro Team Tag */}
            <span className="mt-2 text-xs font-semibold uppercase tracking-widest text-white/80 bg-black/30 px-3 py-0.5 rounded-full">
              {myTeamName}
            </span>
          </button>
        </div>
      </div>

      {/* Subtext info */}
      <div className="mt-5 text-center">
        <p
          className={`text-sm font-medium transition-colors ${
            buttonTheme === 'active'
              ? 'text-rose-400 animate-pulse'
              : buttonTheme === 'success'
              ? 'text-emerald-400 font-bold'
              : buttonTheme === 'locked'
              ? 'text-rose-400/90'
              : buttonTheme === 'other-buzzed'
              ? 'text-amber-400'
              : 'text-slate-400'
          }`}
        >
          {subLabel}
        </p>
      </div>
    </div>
  );
};
