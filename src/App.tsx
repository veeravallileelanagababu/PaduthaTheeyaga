import React, { useState, useEffect, useRef } from 'react';
import { GameState, Team, Song, UserSession } from './types';
import { HeaderNav } from './components/HeaderNav';
import { AuthScreen } from './components/AuthScreen';
import { TeamPanel } from './components/TeamPanel';
import { AdminPanel } from './components/AdminPanel';
import { ProjectorView } from './components/ProjectorView';
import { RulesModal } from './components/RulesModal';
import { DEFAULT_SONGS } from './data/defaultSongs';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('telugu_quiz_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [gameState, setGameState] = useState<GameState>({
    status: 'idle',
    currentRound: 'easy',
    currentSongId: DEFAULT_SONGS[0]?.id || null,
    currentSong: DEFAULT_SONGS[0] || null,
    timeRemaining: 60,
    initialDuration: 60,
    timerRunning: false,
    timerStartedAt: null,
    buzzedTeam: null,
    buzzerQueue: [],
    isTieBreakDetected: false,
    tieTeams: [],
    lockedTeams: [],
    solvedSongsCount: 0,
    recentActivity: 'Connecting to live game stream...',
    history: []
  });

  const [teams, setTeams] = useState<Team[]>([]);
  const [songs, setSongs] = useState<Song[]>(DEFAULT_SONGS);
  const [isConnected, setIsConnected] = useState(false);
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch initial state & songs
  const fetchInitialData = async () => {
    try {
      const [stateRes, songsRes] = await Promise.all([
        fetch('/api/game/state'),
        fetch('/api/songs')
      ]);

      const stateData = await stateRes.json();
      const songsData = await songsRes.json();

      if (stateData.success) {
        setGameState(stateData.gameState);
        setTeams(stateData.teams);
        setIsConnected(true);
      }
      if (songsData.success) {
        setSongs(songsData.songs);
      }
    } catch {
      // Fallback
    }
  };

  // Real-time EventSource connection
  useEffect(() => {
    fetchInitialData();

    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource('/api/events');
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
      };

      es.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.gameState) {
            setGameState(payload.gameState);
          }
          if (payload.teams) {
            setTeams(payload.teams);
          }
        } catch {
          // parse error
        }
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();
        setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    // Fallback sync polling every 5s
    const pollInterval = setInterval(() => {
      fetchInitialData();
    }, 5000);

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      clearInterval(pollInterval);
    };
  }, []);

  // Team Leader Heartbeat Ping
  useEffect(() => {
    if (session?.role === 'team' && session.teamId) {
      const pingInterval = setInterval(() => {
        fetch('/api/teams/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamId: session.teamId })
        }).catch(() => {});
      }, 15000);

      return () => clearInterval(pingInterval);
    }
  }, [session]);

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    localStorage.setItem('telugu_quiz_session', JSON.stringify(newSession));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('telugu_quiz_session');
  };

  // If in auditorium stage screen mode
  if (isProjectorMode) {
    return (
      <ProjectorView
        gameState={gameState}
        teams={teams}
        onExitProjector={() => setIsProjectorMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <HeaderNav
        session={session}
        onLogout={handleLogout}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenProjector={() => setIsProjectorMode(true)}
        isConnected={isConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-center">
        {!session ? (
          <AuthScreen onLogin={handleLogin} teams={teams} />
        ) : session.role === 'admin' ? (
          <AdminPanel
            gameState={gameState}
            teams={teams}
            songs={songs}
            onRefresh={fetchInitialData}
            onOpenProjector={() => setIsProjectorMode(true)}
          />
        ) : (
          <TeamPanel
            session={session}
            gameState={gameState}
            teams={teams}
            onLogout={handleLogout}
            onOpenRules={() => setIsRulesOpen(true)}
          />
        )}
      </main>

      {/* Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
}
