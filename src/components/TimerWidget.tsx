import React, { useEffect, useRef } from 'react';
import { Clock, Pause, Play, AlertTriangle } from 'lucide-react';
import { sounds } from '../utils/audio';

interface TimerWidgetProps {
  timeRemaining: number;
  initialDuration: number;
  timerRunning: boolean;
  status: string;
  roundName: string;
  size?: 'sm' | 'md' | 'lg' | 'giant';
}

export const TimerWidget: React.FC<TimerWidgetProps> = ({
  timeRemaining,
  initialDuration,
  timerRunning,
  status,
  roundName,
  size = 'md'
}) => {
  const prevTimeRef = useRef(timeRemaining);

  // Play subtle tick sound on last 10 seconds if timer is running
  useEffect(() => {
    if (timerRunning && timeRemaining > 0 && timeRemaining <= 10 && timeRemaining !== prevTimeRef.current) {
      sounds.playTick();
    }
    prevTimeRef.current = timeRemaining;
  }, [timeRemaining, timerRunning]);

  const percentage = Math.max(0, Math.min(100, (timeRemaining / (initialDuration || 60)) * 100));

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // Dynamic color based on time remaining
  const isUrgent = timeRemaining <= 15 && timeRemaining > 0;
  const isCritical = timeRemaining <= 5 && timeRemaining > 0;
  const isZero = timeRemaining === 0;

  let strokeColor = 'stroke-emerald-400';
  let textColor = 'text-emerald-400';
  let glowColor = 'shadow-emerald-500/20';

  if (isCritical || isZero) {
    strokeColor = 'stroke-rose-500';
    textColor = 'text-rose-500';
    glowColor = 'shadow-rose-500/40';
  } else if (isUrgent) {
    strokeColor = 'stroke-amber-400';
    textColor = 'text-amber-400';
    glowColor = 'shadow-amber-500/30';
  }

  // Radius and sizing
  const radius = size === 'giant' ? 84 : size === 'lg' ? 64 : size === 'sm' ? 36 : 50;
  const strokeWidth = size === 'giant' ? 10 : size === 'lg' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div
      id="timer-widget-container"
      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl ${glowColor} transition-all duration-300`}
    >
      {/* Header tag */}
      <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <Clock className="w-3.5 h-3.5" />
        <span>{roundName}</span>
      </div>

      {/* SVG Circular Progress & Digital Counter */}
      <div className="relative flex items-center justify-center">
        <svg
          width={svgSize}
          height={svgSize}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            className="stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            className={`${strokeColor} transition-all duration-500 ease-linear`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Inner Digital Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            id="timer-digital-display"
            className={`font-['Orbitron',monospace] font-extrabold tracking-tight ${
              size === 'giant' ? 'text-5xl' : size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-xl' : 'text-3xl'
            } ${textColor} ${isUrgent && timerRunning ? 'animate-pulse' : ''}`}
          >
            {formattedTime}
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            {timeRemaining > 0 ? (timerRunning ? 'REMAINING' : 'PAUSED') : 'TIME UP'}
          </span>
        </div>
      </div>

      {/* Status indicator bar */}
      <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700/60">
        {status === 'buzzed' ? (
          <span className="flex items-center gap-1 text-amber-400 animate-pulse">
            <Pause className="w-3 h-3 fill-amber-400" /> Buzzer Stopped Timer
          </span>
        ) : timerRunning ? (
          <span className="flex items-center gap-1 text-emerald-400">
            <Play className="w-3 h-3 fill-emerald-400" /> Timer Running
          </span>
        ) : timeRemaining === 0 ? (
          <span className="flex items-center gap-1 text-rose-400">
            <AlertTriangle className="w-3 h-3" /> Time Over
          </span>
        ) : (
          <span className="text-slate-400">Ready</span>
        )}
      </div>
    </div>
  );
};
