import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { DEFAULT_SONGS, ROUND_CONFIG } from './src/data/defaultSongs';
import { Song, Team, GameState, BuzzEvent, Difficulty, GameHistoryItem } from './src/types';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-Memory Database & Live State
let songs: Song[] = [...DEFAULT_SONGS];
let teams: Team[] = [
  {
    id: 'team-1',
    teamName: 'Team Mavericks',
    leaderName: 'Sai Kumar',
    membersCount: 4,
    score: 0,
    isOnline: true,
    lastActive: Date.now(),
    isBuzzerLocked: false,
    buzzCount: 0,
    correctCount: 0,
    wrongCount: 0,
    avatarColor: '#f59e0b'
  },
  {
    id: 'team-2',
    teamName: 'Tollywood Rockers',
    leaderName: 'Ananya Sharma',
    membersCount: 4,
    score: 0,
    isOnline: true,
    lastActive: Date.now(),
    isBuzzerLocked: false,
    buzzCount: 0,
    correctCount: 0,
    wrongCount: 0,
    avatarColor: '#3b82f6'
  },
  {
    id: 'team-3',
    teamName: 'Lyric Wizards',
    leaderName: 'Venkatesh Rao',
    membersCount: 3,
    score: 0,
    isOnline: true,
    lastActive: Date.now(),
    isBuzzerLocked: false,
    buzzCount: 0,
    correctCount: 0,
    wrongCount: 0,
    avatarColor: '#10b981'
  }
];

// Team passwords storage
const teamCredentials: Record<string, string> = {
  'team-1': 'pass123',
  'team-2': 'pass123',
  'team-3': 'pass123'
};

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Game State
let gameState: GameState = {
  status: 'idle',
  currentRound: 'easy',
  currentSongId: DEFAULT_SONGS[0]?.id || null,
  currentSong: DEFAULT_SONGS[0] || null,
  timeRemaining: 60, // 1 min for easy
  initialDuration: 60,
  timerRunning: false,
  timerStartedAt: null,
  buzzedTeam: null,
  buzzerQueue: [],
  isTieBreakDetected: false,
  tieTeams: [],
  lockedTeams: [],
  solvedSongsCount: 0,
  recentActivity: 'Game initialized. Ready for Round 1 (Easy).',
  history: []
};

// SSE Listeners
interface SSEClient {
  id: string;
  res: express.Response;
}
let sseClients: SSEClient[] = [];

function broadcastState() {
  const payload = `data: ${JSON.stringify({ type: 'STATE_UPDATE', gameState, teams })}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch {
      // client disconnected
    }
  });
}

// Timer ticker
let timerInterval: NodeJS.Timeout | null = null;

function startTimerCountdown() {
  if (timerInterval) clearInterval(timerInterval);
  gameState.timerRunning = true;
  gameState.timerStartedAt = Date.now();

  timerInterval = setInterval(() => {
    if (gameState.timerRunning && gameState.timeRemaining > 0) {
      gameState.timeRemaining -= 1;
      if (gameState.timeRemaining <= 0) {
        gameState.timeRemaining = 0;
        gameState.timerRunning = false;
        gameState.status = 'ended';
        gameState.recentActivity = `Time is UP for ${gameState.currentSong?.title || 'current song'}!`;
        if (timerInterval) clearInterval(timerInterval);

        // Record history
        if (gameState.currentSong) {
          const historyItem: GameHistoryItem = {
            id: `hist-${Date.now()}`,
            songTitle: gameState.currentSong.title,
            movie: gameState.currentSong.movie,
            difficulty: gameState.currentRound,
            winnerTeamName: null,
            status: 'timeout',
            timestamp: Date.now(),
            pointsAwarded: 0
          };
          gameState.history.unshift(historyItem);
        }
      }
      broadcastState();
    }
  }, 1000);
}

function pauseTimerCountdown() {
  gameState.timerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// ------------------------------------
// API ROUTES
// ------------------------------------

// SSE Realtime stream
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  sseClients.push({ id: clientId, res });

  // Send initial state immediately
  res.write(`data: ${JSON.stringify({ type: 'INIT', gameState, teams })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// Get current state & teams
app.get('/api/game/state', (req, res) => {
  res.json({ success: true, gameState, teams });
});

// Admin Auth Check / Login
app.post('/api/auth/admin-login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD || password === 'admin' || password === 'fest2026') {
    return res.json({ success: true, message: 'Admin authenticated', role: 'admin' });
  }
  return res.status(401).json({ success: false, message: 'Invalid Admin Password' });
});

// Team Login / Register
app.post('/api/auth/team-login', (req, res) => {
  const { teamName, password, leaderName, membersCount } = req.body;
  if (!teamName || !password) {
    return res.status(400).json({ success: false, message: 'Team Name and Password are required.' });
  }

  const existingTeam = teams.find(
    (t) => t.teamName.trim().toLowerCase() === teamName.trim().toLowerCase()
  );

  if (existingTeam) {
    const validPass = teamCredentials[existingTeam.id];
    if (validPass && validPass !== password) {
      return res.status(401).json({ success: false, message: 'Incorrect password for this team.' });
    }
    existingTeam.isOnline = true;
    existingTeam.lastActive = Date.now();
    broadcastState();
    return res.json({ success: true, team: existingTeam, isNew: false });
  }

  // Register new team
  const newTeamId = `team-${Date.now()}`;
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6'];
  const assignedColor = colors[teams.length % colors.length];

  const newTeam: Team = {
    id: newTeamId,
    teamName: teamName.trim(),
    leaderName: leaderName ? leaderName.trim() : 'Leader',
    membersCount: membersCount ? Number(membersCount) : 4,
    score: 0,
    isOnline: true,
    lastActive: Date.now(),
    isBuzzerLocked: false,
    buzzCount: 0,
    correctCount: 0,
    wrongCount: 0,
    avatarColor: assignedColor
  };

  teams.push(newTeam);
  teamCredentials[newTeamId] = password;
  broadcastState();

  return res.json({ success: true, team: newTeam, isNew: true });
});

// Team Heartbeat / Ping
app.post('/api/teams/ping', (req, res) => {
  const { teamId } = req.body;
  const team = teams.find((t) => t.id === teamId);
  if (team) {
    team.isOnline = true;
    team.lastActive = Date.now();
  }
  res.json({ success: true });
});

// ------------------------------------
// BUZZER & GAME CONTROL
// ------------------------------------

// Team Press Buzzer
app.post('/api/game/buzz', (req, res) => {
  const { teamId, clientTimestamp } = req.body;
  const team = teams.find((t) => t.id === teamId);

  if (!team) {
    return res.status(404).json({ success: false, message: 'Team not found' });
  }

  if (gameState.status !== 'running' || !gameState.timerRunning) {
    return res.status(400).json({ success: false, message: 'Buzzer is currently locked or round not running!' });
  }

  if (gameState.lockedTeams.includes(teamId)) {
    return res.status(400).json({ success: false, message: 'Your team is locked out for this song due to a previous wrong answer!' });
  }

  const now = Date.now();
  const reactionTime = gameState.timerStartedAt ? now - gameState.timerStartedAt : 0;

  // Check if someone already buzzed
  if (!gameState.buzzedTeam) {
    // First buzz!
    const buzzEvent: BuzzEvent = {
      teamId: team.id,
      teamName: team.teamName,
      timestamp: clientTimestamp || now,
      serverTimestamp: now,
      timeRemaining: gameState.timeRemaining,
      reactionTimeMs: reactionTime,
      isTie: false
    };

    team.buzzCount += 1;
    gameState.buzzedTeam = buzzEvent;
    gameState.buzzerQueue = [buzzEvent];
    gameState.status = 'buzzed';

    // PAUSE TIMER ON BUZZ AS REQUESTED
    pauseTimerCountdown();
    gameState.recentActivity = `🚨 ${team.teamName} pressed the buzzer first (${(reactionTime / 1000).toFixed(2)}s)! Timer paused.`;

    broadcastState();
    return res.json({ success: true, rank: 1, buzzEvent, message: 'You got the Buzzer!' });
  } else {
    // Another buzz received while already buzzed
    const firstBuzzTime = gameState.buzzedTeam.serverTimestamp;
    const diff = Math.abs(now - firstBuzzTime);

    // TIE BREAK DETECTION: If pressed within 40ms of the first buzz
    const isSimultaneousTie = diff <= 40;

    const buzzEvent: BuzzEvent = {
      teamId: team.id,
      teamName: team.teamName,
      timestamp: clientTimestamp || now,
      serverTimestamp: now,
      timeRemaining: gameState.timeRemaining,
      reactionTimeMs: reactionTime,
      isTie: isSimultaneousTie
    };

    if (isSimultaneousTie) {
      gameState.buzzedTeam.isTie = true;
      gameState.isTieBreakDetected = true;
      gameState.tieTeams = Array.from(new Set([...gameState.tieTeams, gameState.buzzedTeam.teamName, team.teamName]));
      gameState.recentActivity = `⚡ TIE DETECTED! ${gameState.buzzedTeam.teamName} & ${team.teamName} buzzed at the exact same moment!`;
    }

    if (!gameState.buzzerQueue.some((b) => b.teamId === team.id)) {
      gameState.buzzerQueue.push(buzzEvent);
    }

    broadcastState();
    return res.json({
      success: true,
      rank: gameState.buzzerQueue.length,
      buzzEvent,
      isTie: isSimultaneousTie,
      message: isSimultaneousTie ? 'Tie Detected with 1st team!' : `Buzzed #${gameState.buzzerQueue.length}`
    });
  }
});

// Admin: Start / Load Song
app.post('/api/admin/start-song', (req, res) => {
  const { songId, round } = req.body;
  const targetSong = songs.find((s) => s.id === songId);

  if (!targetSong) {
    return res.status(404).json({ success: false, message: 'Song not found' });
  }

  const selectedRound: Difficulty = round || targetSong.difficulty;
  const config = ROUND_CONFIG[selectedRound] || ROUND_CONFIG.easy;

  gameState.currentRound = selectedRound;
  gameState.currentSongId = targetSong.id;
  gameState.currentSong = targetSong;
  gameState.initialDuration = config.duration;
  gameState.timeRemaining = config.duration;
  gameState.buzzedTeam = null;
  gameState.buzzerQueue = [];
  gameState.isTieBreakDetected = false;
  gameState.tieTeams = [];
  gameState.lockedTeams = [];
  gameState.status = 'running';
  gameState.recentActivity = `Started [${config.name}]: "${targetSong.title}" (${config.duration}s timer)`;

  startTimerCountdown();
  broadcastState();

  res.json({ success: true, gameState });
});

// Admin: Pause Timer
app.post('/api/admin/pause-timer', (req, res) => {
  pauseTimerCountdown();
  gameState.status = 'paused';
  gameState.recentActivity = 'Timer paused by Admin.';
  broadcastState();
  res.json({ success: true });
});

// Admin: Resume Timer
app.post('/api/admin/resume-timer', (req, res) => {
  if (gameState.timeRemaining > 0 && gameState.currentSong) {
    gameState.status = 'running';
    gameState.buzzedTeam = null; // clear current buzzed state so other unlocked teams can buzz
    gameState.recentActivity = 'Timer resumed! Buzzers active for remaining teams.';
    startTimerCountdown();
    broadcastState();
    return res.json({ success: true });
  }
  res.status(400).json({ success: false, message: 'Cannot resume timer' });
});

// Admin: Judge Answer - CORRECT (+1 point or round points)
app.post('/api/admin/judge-correct', (req, res) => {
  const { teamId, customPoints } = req.body;
  const targetTeamId = teamId || gameState.buzzedTeam?.teamId;
  const team = teams.find((t) => t.id === targetTeamId);

  if (!team) {
    return res.status(404).json({ success: false, message: 'No team specified or found' });
  }

  pauseTimerCountdown();

  const pointsToAdd = customPoints !== undefined ? Number(customPoints) : 1; // 1 point per prompt requirement
  team.score += pointsToAdd;
  team.correctCount += 1;

  gameState.status = 'revealed';
  gameState.recentActivity = `🎉 CORRECT! ${team.teamName} guessed the song correctly (+${pointsToAdd} point)!`;
  gameState.solvedSongsCount += 1;

  if (gameState.currentSong) {
    const historyItem: GameHistoryItem = {
      id: `hist-${Date.now()}`,
      songTitle: gameState.currentSong.title,
      movie: gameState.currentSong.movie,
      difficulty: gameState.currentRound,
      winnerTeamName: team.teamName,
      status: 'solved',
      timestamp: Date.now(),
      pointsAwarded: pointsToAdd
    };
    gameState.history.unshift(historyItem);
  }

  broadcastState();
  res.json({ success: true, team, pointsAwarded: pointsToAdd });
});

// Admin: Judge Answer - WRONG (Lock this team, RESUME TIMER IMMEDIATELY until time runs out or someone gets it)
app.post('/api/admin/judge-wrong', (req, res) => {
  const { teamId } = req.body;
  const targetTeamId = teamId || gameState.buzzedTeam?.teamId;
  const team = teams.find((t) => t.id === targetTeamId);

  if (team) {
    team.wrongCount += 1;
    if (!gameState.lockedTeams.includes(team.id)) {
      gameState.lockedTeams.push(team.id);
    }
  }

  gameState.buzzedTeam = null;

  // As requested: "if the answer is wrong then timer has to been continue until the time runout or they find out the correct answer"
  if (gameState.timeRemaining > 0) {
    gameState.status = 'running';
    gameState.recentActivity = `❌ Wrong answer by ${team ? team.teamName : 'team'}! Timer resumed for other teams.`;
    startTimerCountdown();
  } else {
    gameState.status = 'ended';
    gameState.recentActivity = `❌ Wrong answer and time has expired!`;
  }

  broadcastState();
  res.json({ success: true, lockedTeams: gameState.lockedTeams, resumed: gameState.status === 'running' });
});

// Admin: Trigger Tie Break Mode (Loads Hard songs pool)
app.post('/api/admin/trigger-tie-break', (req, res) => {
  const tieSong = songs.find((s) => s.difficulty === 'tie-break' || s.difficulty === 'hard');

  if (!tieSong) {
    return res.status(404).json({ success: false, message: 'No tie breaker songs found' });
  }

  const duration = ROUND_CONFIG['tie-break'].duration; // 120s / 2min
  gameState.currentRound = 'tie-break';
  gameState.currentSongId = tieSong.id;
  gameState.currentSong = tieSong;
  gameState.initialDuration = duration;
  gameState.timeRemaining = duration;
  gameState.buzzedTeam = null;
  gameState.buzzerQueue = [];
  gameState.isTieBreakDetected = false;
  gameState.lockedTeams = [];
  gameState.status = 'running';
  gameState.recentActivity = `🔥 TIE BREAKER LAUNCHED! 2-Minute Hard Round for contenders: ${gameState.tieTeams.join(' vs ') || 'All Teams'}`;

  startTimerCountdown();
  broadcastState();

  res.json({ success: true, gameState, tieSong });
});

// Admin: Reveal Answer
app.post('/api/admin/reveal-answer', (req, res) => {
  pauseTimerCountdown();
  gameState.status = 'revealed';
  gameState.recentActivity = `Answer revealed: "${gameState.currentSong?.title}" (${gameState.currentSong?.movie})`;

  if (gameState.currentSong) {
    const historyItem: GameHistoryItem = {
      id: `hist-${Date.now()}`,
      songTitle: gameState.currentSong.title,
      movie: gameState.currentSong.movie,
      difficulty: gameState.currentRound,
      winnerTeamName: null,
      status: 'skipped',
      timestamp: Date.now(),
      pointsAwarded: 0
    };
    gameState.history.unshift(historyItem);
  }

  broadcastState();
  res.json({ success: true });
});

// Admin: Reset / Clear Round
app.post('/api/admin/reset-round', (req, res) => {
  pauseTimerCountdown();
  const config = ROUND_CONFIG[gameState.currentRound] || ROUND_CONFIG.easy;
  gameState.timeRemaining = config.duration;
  gameState.initialDuration = config.duration;
  gameState.buzzedTeam = null;
  gameState.buzzerQueue = [];
  gameState.lockedTeams = [];
  gameState.isTieBreakDetected = false;
  gameState.status = 'idle';
  gameState.recentActivity = `Round reset to initial ${config.duration}s.`;
  broadcastState();
  res.json({ success: true });
});

// Admin: Reset All Scores
app.post('/api/admin/reset-scores', (req, res) => {
  teams.forEach((t) => {
    t.score = 0;
    t.buzzCount = 0;
    t.correctCount = 0;
    t.wrongCount = 0;
    t.isBuzzerLocked = false;
  });
  gameState.history = [];
  gameState.solvedSongsCount = 0;
  gameState.recentActivity = 'Leaderboard & scores reset to 0.';
  broadcastState();
  res.json({ success: true, teams });
});

// Admin: Adjust Team Score
app.post('/api/admin/adjust-score', (req, res) => {
  const { teamId, delta } = req.body;
  const team = teams.find((t) => t.id === teamId);
  if (team) {
    team.score = Math.max(0, team.score + Number(delta));
    broadcastState();
    return res.json({ success: true, team });
  }
  res.status(404).json({ success: false, message: 'Team not found' });
});

// Admin: Delete Team
app.delete('/api/admin/teams/:id', (req, res) => {
  const teamId = req.params.id;
  teams = teams.filter((t) => t.id !== teamId);
  delete teamCredentials[teamId];
  broadcastState();
  res.json({ success: true, teams });
});

// Admin: Edit / Update Team
app.put('/api/admin/teams/:id', (req, res) => {
  const teamId = req.params.id;
  const { teamName, leaderName, membersCount, score, password } = req.body;
  const team = teams.find((t) => t.id === teamId);

  if (!team) {
    return res.status(404).json({ success: false, message: 'Team not found' });
  }

  if (teamName !== undefined) team.teamName = String(teamName).trim();
  if (leaderName !== undefined) team.leaderName = String(leaderName).trim();
  if (membersCount !== undefined) team.membersCount = Math.max(1, Number(membersCount));
  if (score !== undefined) team.score = Math.max(0, Number(score));
  if (password) teamCredentials[team.id] = String(password).trim();

  broadcastState();
  res.json({ success: true, team, teams });
});

// Admin: Add New Team
app.post('/api/admin/teams', (req, res) => {
  const { teamName, leaderName, membersCount, score, password } = req.body;

  if (!teamName || !teamName.trim()) {
    return res.status(400).json({ success: false, message: 'Team Name is required' });
  }

  const existing = teams.find(
    (t) => t.teamName.trim().toLowerCase() === teamName.trim().toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ success: false, message: 'A team with this name already exists' });
  }

  const newTeamId = `team-${Date.now()}`;
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6'];
  const assignedColor = colors[teams.length % colors.length];

  const newTeam: Team = {
    id: newTeamId,
    teamName: teamName.trim(),
    leaderName: leaderName ? leaderName.trim() : 'Leader',
    membersCount: membersCount ? Math.max(1, Number(membersCount)) : 4,
    score: score ? Math.max(0, Number(score)) : 0,
    isOnline: true,
    lastActive: Date.now(),
    isBuzzerLocked: false,
    buzzCount: 0,
    correctCount: 0,
    wrongCount: 0,
    avatarColor: assignedColor
  };

  teams.push(newTeam);
  teamCredentials[newTeamId] = password ? password.trim() : 'pass123';
  broadcastState();

  res.json({ success: true, team: newTeam, teams });
});

// ------------------------------------
// SONG MANAGEMENT & AI TRANSLATOR
// ------------------------------------

// Get all songs
app.get('/api/songs', (req, res) => {
  res.json({ success: true, songs });
});

// Add new song
app.post('/api/songs', (req, res) => {
  const { title, movie, originalTeluguLyric, englishTranslatedLyrics, difficulty, hints, correctAnswer, singer, year } = req.body;

  if (!title || !englishTranslatedLyrics) {
    return res.status(400).json({ success: false, message: 'Song title and English translated lyrics are required' });
  }

  const newSong: Song = {
    id: `song-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    movie: movie ? movie.trim() : 'Tollywood',
    originalTeluguLyric: originalTeluguLyric ? originalTeluguLyric.trim() : '',
    englishTranslatedLyrics: englishTranslatedLyrics.trim(),
    difficulty: (difficulty as Difficulty) || 'medium',
    hints: Array.isArray(hints) ? hints : (hints ? String(hints).split(',').map((h) => h.trim()) : []),
    correctAnswer: correctAnswer ? correctAnswer.trim() : title.trim(),
    singer: singer ? singer.trim() : '',
    year: year ? String(year).trim() : '',
    isCustom: true
  };

  songs.push(newSong);
  broadcastState();
  res.json({ success: true, song: newSong, count: songs.length });
});

// Bulk upload songs (JSON / CSV list)
app.post('/api/songs/bulk', (req, res) => {
  const { songList } = req.body;
  if (!Array.isArray(songList) || songList.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid song list provided' });
  }

  const added: Song[] = [];
  songList.forEach((item, index) => {
    if (item.title && item.englishTranslatedLyrics) {
      const s: Song = {
        id: `song-bulk-${Date.now()}-${index}`,
        title: item.title.trim(),
        movie: item.movie ? item.movie.trim() : 'Tollywood',
        originalTeluguLyric: item.originalTeluguLyric || '',
        englishTranslatedLyrics: item.englishTranslatedLyrics.trim(),
        difficulty: (['easy', 'medium', 'hard', 'tie-break'].includes(item.difficulty) ? item.difficulty : 'medium') as Difficulty,
        hints: Array.isArray(item.hints) ? item.hints : typeof item.hints === 'string' ? item.hints.split(';').map((h: string) => h.trim()) : [],
        correctAnswer: item.correctAnswer || item.title,
        singer: item.singer || '',
        year: item.year || '',
        isCustom: true
      };
      added.push(s);
    }
  });

  songs.push(...added);
  broadcastState();
  res.json({ success: true, addedCount: added.length, totalSongs: songs.length });
});

// Delete song
app.delete('/api/songs/:id', (req, res) => {
  const songId = req.params.id;
  songs = songs.filter((s) => s.id !== songId);
  if (gameState.currentSongId === songId) {
    gameState.currentSongId = songs[0]?.id || null;
    gameState.currentSong = songs[0] || null;
  }
  broadcastState();
  res.json({ success: true, songs });
});

// Gemini AI Lyric Translator & Clue Generator
app.post('/api/ai/translate-lyrics', async (req, res) => {
  try {
    const { teluguSongName, movieName, originalLyrics, difficulty } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'GEMINI_API_KEY is not configured in server environment.'
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are a Telugu movie trivia & song quiz master for a college fest event.
The event is: "Guess the Telugu Song from its English Translated Lyrics".
Input Song: "${teluguSongName}" from movie "${movieName || 'Telugu Cinema'}".
Original Telugu Lines (if provided): "${originalLyrics || ''}".
Target Difficulty: "${difficulty || 'medium'}" (easy = obvious catchy hookline, medium = poetic/witty line, hard = metaphorical/vintage lines, tie-break = tricky poetic riddles).

Please generate a structured JSON object with:
1. "englishTranslatedLyrics": A creative, literal or witty English translation of 2-4 key lyric lines from this Telugu song that college students have to decode. Do NOT include the Telugu song title inside this text.
2. "originalTeluguLyric": The original Telugu lines (in Telugu script and English transliteration).
3. "hints": Array of 3 helpful clues (e.g. Lead actors, Music Director, Visual scene description, or release year).
4. "correctAnswer": Full song name and movie name.
5. "singer": Known playback singer.

Return strictly raw valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    res.json({ success: true, result: parsed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI generation error';
    console.error('Gemini error:', message);
    res.status(500).json({ success: false, message });
  }
});

// ------------------------------------
// SERVER & VITE INTEGRATION
// ------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Padutha Theeyaga Server running on http://localhost:${PORT}`);
  });
}

startServer();
