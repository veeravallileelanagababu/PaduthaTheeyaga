import React from 'react';
import { GameState, Team, Difficulty } from '../types';
import { TimerWidget } from './TimerWidget';
import { ROUND_CONFIG } from '../data/defaultSongs';
import { Trophy, Zap, AlertCircle, Sparkles, Film, Mic, Eye, HelpCircle } from 'lucide-react';

interface ProjectorViewProps {
  gameState: GameState;
  teams: Team[];
  onExitProjector: () => void;
}

export const ProjectorView: React.FC<ProjectorViewProps> = ({
  gameState,
  teams,
  onExitProjector
}) => {
  const currentSong = gameState.currentSong;
  const roundInfo = ROUND_CONFIG[gameState.currentRound] || ROUND_CONFIG.easy;
  const isRevealed = gameState.status === 'revealed';

  // Sort teams by score
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div
      id="projector-stage-container"
      className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-between select-none relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="Padutha Theeyaga Logo"
            className="w-14 h-14 rounded-2xl object-cover border border-amber-500/40 shadow-lg shadow-amber-500/30"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-rose-300 to-indigo-300 bg-clip-text text-transparent">
              Padutha Theeyaga
            </h1>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              Live Stage Arena
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-1.5 rounded-full border text-sm font-bold uppercase tracking-wider ${roundInfo.badgeColor}`}
          >
            {roundInfo.name} • {roundInfo.duration}s
          </div>

          <button
            id="exit-projector-btn"
            type="button"
            onClick={onExitProjector}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
          >
            Exit Stage View
          </button>
        </div>
      </header>

      {/* Buzzer Alert Banner (When Buzzed or Tie) */}
      {gameState.buzzedTeam && (
        <div
          id="projector-buzzer-alert"
          className={`my-3 p-4 rounded-2xl border-2 flex items-center justify-between shadow-2xl animate-in zoom-in-95 duration-200 relative z-20 ${
            gameState.isTieBreakDetected
              ? 'bg-purple-950/90 border-purple-400 text-purple-200 shadow-purple-950/80'
              : 'bg-rose-950/90 border-rose-500 text-white shadow-rose-950/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/10">
              <Zap className="w-8 h-8 text-yellow-300 animate-bounce" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest font-black text-yellow-400">
                {gameState.isTieBreakDetected ? '⚡ TIE BREAK ALERT (Simultaneous Buzz)' : '🚨 BUZZER CLAIMED! TIMER PAUSED'}
              </div>
              <div className="text-3xl font-black tracking-tight">
                {gameState.isTieBreakDetected ? gameState.tieTeams.join(' & ') : gameState.buzzedTeam.teamName}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-slate-300 block">
              Reaction Time
            </span>
            <span className="font-['Orbitron',monospace] text-2xl font-black text-amber-300">
              {(gameState.buzzedTeam.reactionTimeMs / 1000).toFixed(2)}s
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Lyrics Arena + Timer & Leaderboard */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 flex-1 items-stretch relative z-10">
        {/* Left Side: Massive Lyrics & Question Deck (8 cols) */}
        <section className="lg:col-span-8 flex flex-col justify-center rounded-3xl bg-slate-900/80 border border-slate-800 p-8 shadow-2xl relative">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            <span>Decode the English Lyrics into Telugu Song</span>
            <span>Round {gameState.currentRound.toUpperCase()}</span>
          </div>

          {currentSong ? (
            <div className="flex flex-col justify-center flex-1 my-auto">
              <blockquote className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-100 font-serif italic leading-tight text-center px-4 py-6">
                &ldquo;{currentSong.englishTranslatedLyrics}&rdquo;
              </blockquote>

              {/* Clues */}
              {currentSong.hints && currentSong.hints.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  {currentSong.hints.map((hint, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700 text-slate-300"
                    >
                      💡 Clue {idx + 1}: {hint}
                    </span>
                  ))}
                </div>
              )}

              {/* Revealed Answer Box */}
              {isRevealed && (
                <div className="mt-8 p-6 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 animate-in fade-in zoom-in-95 duration-300 text-center">
                  <div className="text-xs uppercase font-bold text-emerald-400 tracking-wider mb-1">
                    Decoded Telugu Song Answer
                  </div>
                  <h3 className="text-4xl font-black text-white">
                    🎵 {currentSong.title}
                  </h3>
                  <p className="text-lg text-amber-300 font-medium mt-1">
                    Movie: {currentSong.movie}
                  </p>
                  {currentSong.originalTeluguLyric && (
                    <p className="text-base text-emerald-200 mt-2 font-medium">
                      Telugu: {currentSong.originalTeluguLyric}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center my-auto p-12 text-slate-500">
              <h2 className="text-2xl font-bold text-slate-400">Waiting for next song to launch...</h2>
            </div>
          )}
        </section>

        {/* Right Side: Big Timer + Live Leaderboard (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6 justify-between">
          {/* Big Timer */}
          <TimerWidget
            timeRemaining={gameState.timeRemaining}
            initialDuration={gameState.initialDuration}
            timerRunning={gameState.timerRunning}
            status={gameState.status}
            roundName={roundInfo.name}
            size="giant"
          />

          {/* Live Team Leaderboard Sidebar */}
          <div className="flex-1 flex flex-col rounded-3xl bg-slate-900/80 border border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-200">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Live Leaderboard</span>
              </div>
              <span className="text-xs text-slate-400">{sortedTeams.length} Teams</span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] pr-1">
              {sortedTeams.map((team, idx) => {
                const isBuzzed = gameState.buzzedTeam?.teamId === team.id;
                const isLocked = gameState.lockedTeams.includes(team.id);

                return (
                  <div
                    key={team.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isBuzzed
                        ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-500/40'
                        : isLocked
                        ? 'bg-rose-950/30 border-rose-900/50 opacity-60'
                        : 'bg-slate-800/60 border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          idx === 0
                            ? 'bg-amber-400 text-black'
                            : idx === 1
                            ? 'bg-slate-300 text-black'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-sm font-bold truncate max-w-[140px]">
                          {team.teamName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {team.leaderName}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-['Orbitron',monospace] text-lg font-black text-amber-400">
                        {team.score}
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-1">
                        PTS
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer Activity Ticker */}
      <footer className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-medium text-slate-300">
            {gameState.recentActivity || 'Live Event Stream Connected'}
          </span>
        </div>

        <div className="font-semibold text-slate-400">
          Total Decoded: {gameState.solvedSongsCount} Songs
        </div>
      </footer>
    </div>
  );
};
