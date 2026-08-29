import React from 'react';
import { Song, Difficulty } from '../types';
import { ROUND_CONFIG } from '../data/defaultSongs';
import { Tv, Sparkles } from 'lucide-react';

interface LyricsDisplayCardProps {
  song: Song | null;
  round: Difficulty;
  isRevealed: boolean;
  winnerTeamName?: string | null;
  status: string;
}

export const LyricsDisplayCard: React.FC<LyricsDisplayCardProps> = ({
  round,
  isRevealed,
  winnerTeamName,
  status
}) => {
  const roundInfo = ROUND_CONFIG[round] || ROUND_CONFIG.easy;

  return (
    <div
      id="lyrics-display-card"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-8 transition-all"
    >
      {/* Top Banner with Difficulty & Round Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${roundInfo.badgeColor}`}
          >
            {roundInfo.name} ({roundInfo.duration}s)
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Round Value: +{roundInfo.points} pts
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            {status === 'running' ? '⚡ LIVE QUESTION' : status === 'paused' ? '⏸️ PAUSED' : status === 'revealed' ? '✅ ROUND REVEALED' : '⌛ IDLE'}
          </span>
        </div>
      </div>

      {/* Main Stage Screen Prompt */}
      <div className="my-6 text-center px-4 py-8 rounded-2xl bg-slate-950/60 border border-slate-800/80">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 mb-3 border border-amber-500/20">
          <Tv className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-black text-white tracking-tight">
          Watch Main Stage Projector Screen
        </h3>
        <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          Lyrics and hints are broadcasted on the main event stage screen. Press your team buzzer below as soon as you decode the melody!
        </p>
      </div>

      {/* Result Status Banner (When round is revealed) */}
      {isRevealed && (
        <div
          id="revealed-song-banner"
          className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-500/40 animate-in fade-in"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Round Completed
            </span>
            {winnerTeamName && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-slate-950">
                Points awarded to: {winnerTeamName}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
