import React, { useState } from 'react';
import { GameState, Team, UserSession } from '../types';
import { TimerWidget } from './TimerWidget';
import { BuzzerButton } from './BuzzerButton';
import { ROUND_CONFIG } from '../data/defaultSongs';
import { Trophy, Users, Shield, Zap, AlertCircle, Info } from 'lucide-react';

interface TeamPanelProps {
  session: UserSession;
  gameState: GameState;
  teams: Team[];
  onLogout: () => void;
  onOpenRules: () => void;
}

export const TeamPanel: React.FC<TeamPanelProps> = ({
  session,
  gameState,
  teams,
  onLogout,
  onOpenRules
}) => {
  const currentTeam = teams.find((t) => t.id === session.teamId) || {
    id: session.teamId || 'unknown',
    teamName: session.teamName || 'My Team',
    leaderName: session.leaderName || 'Leader',
    membersCount: 4,
    score: 0,
    isOnline: true,
    lastActive: Date.now(),
    isBuzzerLocked: false,
    buzzCount: 0,
    correctCount: 0,
    wrongCount: 0
  };

  const isLocked = gameState.lockedTeams.includes(currentTeam.id);
  const isCurrentTeamBuzzed = gameState.buzzedTeam?.teamId === currentTeam.id;
  const buzzedTeamName = gameState.buzzedTeam?.teamName;
  const isTie = gameState.isTieBreakDetected;
  const roundInfo = ROUND_CONFIG[gameState.currentRound] || ROUND_CONFIG.easy;

  // Sorting for current rank
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const myRank = sortedTeams.findIndex((t) => t.id === currentTeam.id) + 1;

  // Buzzer Click Handler
  const handleBuzzerPress = async () => {
    if (gameState.status !== 'running' || !gameState.timerRunning || isLocked) {
      return;
    }

    try {
      await fetch('/api/game/buzz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: currentTeam.id,
          clientTimestamp: Date.now()
        })
      });
    } catch (err) {
      console.error('Buzzer press error:', err);
    }
  };

  return (
    <div id="team-panel-root" className="w-full max-w-5xl mx-auto space-y-6">
      {/* Team Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center font-black text-black text-xl shadow-lg shadow-amber-500/20">
            {currentTeam.teamName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">
                {currentTeam.teamName}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Rank #{myRank || 1}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Leader: <strong className="text-slate-200">{currentTeam.leaderName}</strong> ({currentTeam.membersCount} Members)
            </p>
          </div>
        </div>

        {/* Live Score Display & Quick Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right px-4 py-1.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Team Score
            </span>
            <span className="font-['Orbitron',monospace] text-2xl font-black text-amber-400">
              {currentTeam.score} <span className="text-xs text-slate-400">PTS</span>
            </span>
          </div>

          <button
            id="team-rules-btn"
            type="button"
            onClick={onOpenRules}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="Event Rules & Timings"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            id="team-logout-btn"
            type="button"
            onClick={onLogout}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
          >
            Switch
          </button>
        </div>
      </div>

      {/* Main Grid: Question / Lyrics & Big Buzzer with Side Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Big Buzzer Deck (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Big Interactive Buzzer Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="text-center mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                TEAM BUZZER DECK
              </span>
            </div>

            <BuzzerButton
              onBuzz={handleBuzzerPress}
              disabled={gameState.status !== 'running' || !gameState.timerRunning}
              isFirstBuzzer={isCurrentTeamBuzzed}
              buzzedTeamName={buzzedTeamName}
              isCurrentTeamBuzzed={isCurrentTeamBuzzed}
              isLocked={isLocked}
              isTie={isTie}
              status={gameState.status}
              myTeamName={currentTeam.teamName}
            />

            {/* Tie Break Alert Indicator */}
            {isTie && (
              <div className="mt-4 p-3 rounded-2xl bg-purple-950/80 border border-purple-500 text-purple-200 text-xs text-center font-bold animate-pulse">
                ⚡ TIE BREAK IN EFFECT: Both teams buzzed simultaneously!
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Side Timer & Live Scoreboard (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Side Timer */}
          <TimerWidget
            timeRemaining={gameState.timeRemaining}
            initialDuration={gameState.initialDuration}
            timerRunning={gameState.timerRunning}
            status={gameState.status}
            roundName={roundInfo.name}
            size="lg"
          />

          {/* Standings Widget */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-300">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Standings</span>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">
                {teams.length} Teams
              </span>
            </div>

            <div className="space-y-2">
              {sortedTeams.map((t, idx) => {
                const isMe = t.id === currentTeam.id;
                return (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                      isMe
                        ? 'bg-amber-500/20 border-amber-500/60 font-bold text-white shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-black">
                        {idx + 1}
                      </span>
                      <span className="truncate max-w-[130px]">
                        {t.teamName} {isMe && '(You)'}
                      </span>
                    </div>

                    <span className="font-['Orbitron',monospace] font-black text-amber-400">
                      {t.score} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Round Rules Quick Card */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Round Timings
            </div>
            <ul className="space-y-1 text-[11px]">
              <li>• Easy: <strong>1 min (60s)</strong></li>
              <li>• Medium: <strong>1m 30s (90s)</strong></li>
              <li>• Hard: <strong>2 min (120s)</strong></li>
              <li>• Tie Break: <strong>2 min (Hard songs)</strong></li>
              <li className="text-amber-400 font-medium pt-1">
                • Buzzer pauses timer; wrong answer resumes timer!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
