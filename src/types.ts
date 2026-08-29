export type Difficulty = 'easy' | 'medium' | 'hard' | 'tie-break';

export interface Song {
  id: string;
  title: string;
  movie: string;
  originalTeluguLyric: string;
  englishTranslatedLyrics: string;
  difficulty: Difficulty;
  hints: string[];
  correctAnswer: string;
  singer?: string;
  year?: string;
  isCustom?: boolean;
}

export interface Team {
  id: string;
  teamName: string;
  leaderName: string;
  membersCount: number;
  score: number;
  isOnline: boolean;
  lastActive: number;
  isBuzzerLocked: boolean;
  buzzCount: number;
  correctCount: number;
  wrongCount: number;
  avatarColor?: string;
}

export interface BuzzEvent {
  teamId: string;
  teamName: string;
  timestamp: number;
  serverTimestamp: number;
  timeRemaining: number;
  reactionTimeMs: number;
  isTie: boolean;
  tieWithTeams?: string[];
}

export interface GameState {
  status: 'idle' | 'running' | 'paused' | 'buzzed' | 'revealed' | 'ended';
  currentRound: Difficulty;
  currentSongId: string | null;
  currentSong: Song | null;
  timeRemaining: number;
  initialDuration: number;
  timerRunning: boolean;
  timerStartedAt: number | null;
  buzzedTeam: BuzzEvent | null;
  buzzerQueue: BuzzEvent[];
  isTieBreakDetected: boolean;
  tieTeams: string[];
  lockedTeams: string[];
  solvedSongsCount: number;
  recentActivity: string;
  history: GameHistoryItem[];
}

export interface GameHistoryItem {
  id: string;
  songTitle: string;
  movie: string;
  difficulty: Difficulty;
  winnerTeamName: string | null;
  status: 'solved' | 'skipped' | 'timeout';
  timestamp: number;
  pointsAwarded: number;
}

export interface UserSession {
  role: 'admin' | 'team';
  teamId?: string;
  teamName?: string;
  leaderName?: string;
  token?: string;
}
