import React, { useState } from 'react';
import { GameState, Team, Song, Difficulty } from '../types';
import { ROUND_CONFIG } from '../data/defaultSongs';
import { TimerWidget } from './TimerWidget';
import { sounds } from '../utils/audio';
import { fireCelebrationConfetti } from '../utils/confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  Zap,
  Flame,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Sparkles,
  Upload,
  Download,
  Users,
  Music,
  History,
  Tv,
  Edit,
  Search,
  Check,
  Film,
  Lock,
  Unlock,
  AlertTriangle,
  Key
} from 'lucide-react';

interface AdminPanelProps {
  gameState: GameState;
  teams: Team[];
  songs: Song[];
  onRefresh: () => void;
  onOpenProjector: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  gameState,
  teams,
  songs,
  onRefresh,
  onOpenProjector
}) => {
  const [activeTab, setActiveTab] = useState<'control' | 'songs' | 'teams' | 'history'>('control');
  const [selectedRound, setSelectedRound] = useState<Difficulty>(gameState.currentRound || 'easy');
  const [selectedSongId, setSelectedSongId] = useState<string>(gameState.currentSongId || songs[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Song Form State
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongMovie, setNewSongMovie] = useState('');
  const [newSongTelugu, setNewSongTelugu] = useState('');
  const [newSongEnglish, setNewSongEnglish] = useState('');
  const [newSongDifficulty, setNewSongDifficulty] = useState<Difficulty>('easy');
  const [newSongHints, setNewSongHints] = useState('');
  const [newSongSinger, setNewSongSinger] = useState('');
  const [newSongAnswer, setNewSongAnswer] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Edit Team State
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editLeaderName, setEditLeaderName] = useState('');
  const [editMembersCount, setEditMembersCount] = useState('4');
  const [editScore, setEditScore] = useState('0');
  const [editPassword, setEditPassword] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const handleOpenEditTeam = (team: Team) => {
    setEditingTeam(team);
    setEditTeamName(team.teamName);
    setEditLeaderName(team.leaderName || '');
    setEditMembersCount(String(team.membersCount || 4));
    setEditScore(String(team.score || 0));
    setEditPassword('');
    setEditSuccess('');
  };

  const handleSaveTeamEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    try {
      const res = await fetch(`/api/admin/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: editTeamName,
          leaderName: editLeaderName,
          membersCount: Number(editMembersCount),
          score: Number(editScore),
          password: editPassword || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditSuccess('Team details updated successfully!');
        onRefresh();
        setTimeout(() => {
          setEditingTeam(null);
          setEditSuccess('');
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to update team:', err);
    }
  };

  // Add Team Modal State
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [addTeamName, setAddTeamName] = useState('');
  const [addLeaderName, setAddLeaderName] = useState('');
  const [addMembersCount, setAddMembersCount] = useState('4');
  const [addScore, setAddScore] = useState('0');
  const [addPassword, setAddPassword] = useState('pass123');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTeamName.trim()) {
      setAddError('Team name is required.');
      return;
    }
    setAddError('');

    try {
      const res = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: addTeamName,
          leaderName: addLeaderName,
          membersCount: Number(addMembersCount),
          score: Number(addScore),
          password: addPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setAddSuccess('New team registered successfully!');
        onRefresh();
        setAddTeamName('');
        setAddLeaderName('');
        setAddMembersCount('4');
        setAddScore('0');
        setAddPassword('pass123');
        setTimeout(() => {
          setIsAddTeamOpen(false);
          setAddSuccess('');
        }, 1000);
      } else {
        setAddError(data.message || 'Failed to add team.');
      }
    } catch {
      setAddError('Server connection error.');
    }
  };

  // Change Admin Password State
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [currAdminPass, setCurrAdminPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [isPassLoading, setIsPassLoading] = useState(false);

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newAdminPass !== confirmAdminPass) {
      setPassError('New passwords do not match!');
      return;
    }

    if (newAdminPass.length < 3) {
      setPassError('Password must be at least 3 characters.');
      return;
    }

    setIsPassLoading(true);

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currAdminPass,
          newPassword: newAdminPass
        })
      });
      const data = await res.json();
      if (data.success) {
        setPassSuccess('Admin password updated successfully!');
        setCurrAdminPass('');
        setNewAdminPass('');
        setConfirmAdminPass('');
        setTimeout(() => {
          setIsChangePassOpen(false);
          setPassSuccess('');
        }, 1500);
      } else {
        setPassError(data.message || 'Failed to update password.');
      }
    } catch {
      setPassError('Server connection error.');
    } finally {
      setIsPassLoading(false);
    }
  };

  const currentSong = gameState.currentSong;
  const roundInfo = ROUND_CONFIG[selectedRound] || ROUND_CONFIG.easy;

  // Filtered songs by selected difficulty or search
  const filteredSongs = songs.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.movie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.englishTranslatedLyrics.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // --- ACTIONS ---

  const handleStartSong = async (songIdToStart?: string) => {
    const targetId = songIdToStart || selectedSongId;
    if (!targetId) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/admin/start-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: targetId, round: selectedRound })
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePauseTimer = async () => {
    await fetch('/api/admin/pause-timer', { method: 'POST' });
    onRefresh();
  };

  const handleResumeTimer = async () => {
    await fetch('/api/admin/resume-timer', { method: 'POST' });
    onRefresh();
  };

  const handleResetRound = async () => {
    if (confirm('Reset timer and buzzers for this round?')) {
      await fetch('/api/admin/reset-round', { method: 'POST' });
      onRefresh();
    }
  };

  const handleJudgeCorrect = async (teamId?: string) => {
    sounds.playCorrect();
    fireCelebrationConfetti();
    await fetch('/api/admin/judge-correct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, customPoints: 1 }) // 1 point per user prompt
    });
    onRefresh();
  };

  const handleJudgeWrong = async (teamId?: string) => {
    sounds.playWrong();
    await fetch('/api/admin/judge-wrong', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId })
    });
    onRefresh();
  };

  const handleRevealAnswer = async () => {
    await fetch('/api/admin/reveal-answer', { method: 'POST' });
    onRefresh();
  };

  const handleAdjustScore = async (teamId: string, delta: number) => {
    await fetch('/api/admin/adjust-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, delta })
    });
    onRefresh();
  };

  const handleResetAllScores = async () => {
    if (confirm('Are you sure you want to reset ALL team scores and history to 0?')) {
      await fetch('/api/admin/reset-scores', { method: 'POST' });
      onRefresh();
    }
  };

  const handleDeleteSong = async (id: string) => {
    if (confirm('Delete this song from bank?')) {
      await fetch(`/api/songs/${id}`, { method: 'DELETE' });
      onRefresh();
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (confirm('Delete this team?')) {
      await fetch(`/api/admin/teams/${id}`, { method: 'DELETE' });
      onRefresh();
    }
  };

  // Add Custom Song Form Submit
  const handleCreateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSongTitle || !newSongEnglish) {
      alert('Please provide song title and English translated lyrics.');
      return;
    }

    try {
      const res = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSongTitle,
          movie: newSongMovie || 'Tollywood',
          originalTeluguLyric: newSongTelugu,
          englishTranslatedLyrics: newSongEnglish,
          difficulty: newSongDifficulty,
          hints: newSongHints.split(',').map((h) => h.trim()).filter(Boolean),
          correctAnswer: newSongAnswer || newSongTitle,
          singer: newSongSinger
        })
      });
      const data = await res.json();
      if (data.success) {
        setFormSuccess('Song successfully added to bank!');
        setNewSongTitle('');
        setNewSongMovie('');
        setNewSongTelugu('');
        setNewSongEnglish('');
        setNewSongHints('');
        setNewSongSinger('');
        setNewSongAnswer('');
        onRefresh();
        setTimeout(() => setFormSuccess(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };



  // Bulk Upload File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        let songList = [];

        if (file.name.endsWith('.json')) {
          songList = JSON.parse(text);
        } else {
          // Parse CSV (Header: title,movie,englishLyrics,teluguLyrics,difficulty,hints,answer,singer)
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
          
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
            if (cols[0] && cols[2]) {
              songList.push({
                title: cols[0],
                movie: cols[1] || 'Movie',
                englishTranslatedLyrics: cols[2],
                originalTeluguLyric: cols[3] || '',
                difficulty: cols[4] || 'medium',
                hints: cols[5] ? cols[5].split(';') : [],
                correctAnswer: cols[6] || cols[0],
                singer: cols[7] || ''
              });
            }
          }
        }

        if (songList.length > 0) {
          const res = await fetch('/api/songs/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ songList })
          });
          const data = await res.json();
          if (data.success) {
            alert(`Successfully imported ${data.addedCount} songs!`);
            onRefresh();
          }
        }
      } catch {
        alert('Failed to parse uploaded file. Please check format.');
      }
    };
    reader.readAsText(file);
  };

  // Download Sample CSV Template
  const handleDownloadSampleCsv = () => {
    const csvContent =
      'title,movie,englishTranslatedLyrics,originalTeluguLyric,difficulty,hints,correctAnswer,singer\n' +
      '"Butta Bomma","Ala Vaikunthapurramuloo","Doll in a basket you wrapped around me","బుట్టబొమ్మ బుట్టబొమ్మ","easy","Allu Arjun; Thaman S","Butta Bomma","Armaan Malik"\n' +
      '"Saranga Dariya","Love Story","Clay pot on right shoulder peacock feather on left","దాని కుడి భుజం మీన కదిలే కడవా","medium","Sai Pallavi; Naga Chaitanya","Saranga Dariya","Mangli"\n' +
      '"Sirivennela","Shyam Singha Roy","O glorious moonlight cradle of gentle smiles","సిరివెన్నెల చిరునవ్వుల ఊయల","hard","Nani; Sai Pallavi","Sirivennela","Anurag Kulkarni"';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'telugu_songs_quiz_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="admin-panel-root" className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Admin Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src="/logo.jpg"
            alt="Padutha Theeyaga Logo"
            className="w-12 h-12 rounded-2xl object-cover border border-amber-500/40 shadow-lg shadow-amber-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded-md bg-amber-500 text-black">
                ADMIN CONTROL ROOM
              </span>
              <span className="text-xs text-slate-400">Quiz Master Master Console</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              Padutha Theeyaga Master Control
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="change-admin-pass-btn"
            type="button"
            onClick={() => setIsChangePassOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>Change Password</span>
          </button>

          <button
            id="open-projector-btn"
            type="button"
            onClick={onOpenProjector}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-900 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Tv className="w-4 h-4" />
            <span>Auditorium Stage Screen</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          id="tab-control"
          type="button"
          onClick={() => setActiveTab('control')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'control'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Live Match Control</span>
        </button>

        <button
          id="tab-songs"
          type="button"
          onClick={() => setActiveTab('songs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'songs'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Song Bank ({songs.length})</span>
        </button>



        <button
          id="tab-teams"
          type="button"
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'teams'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Teams & Scores ({teams.length})</span>
        </button>

        <button
          id="tab-history"
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'history'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>History ({gameState.history.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE MATCH CONTROL */}
      {/* ========================================================================= */}
      {activeTab === 'control' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Round & Song Selection & Timer Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Difficulty Round Selector */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  1. Select Event Round & Duration
                </span>
                <span className="text-xs text-amber-400 font-semibold">
                  Rule: Easy (1m) • Med (1m30s) • Hard (2m)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
                  const cfg = ROUND_CONFIG[diff];
                  const isSelected = selectedRound === diff;
                  return (
                    <button
                      key={diff}
                      id={`select-round-${diff}`}
                      type="button"
                      onClick={() => {
                        setSelectedRound(diff);
                        // find first song of this round if exists
                        const matching = songs.find((s) => s.difficulty === diff);
                        if (matching) setSelectedSongId(matching.id);
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        isSelected
                          ? `${cfg.badgeColor} border-2 ring-2 ring-amber-500/20`
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-black uppercase tracking-wider">
                        {cfg.name}
                      </div>
                      <div className="text-lg font-extrabold font-['Orbitron',monospace] mt-1 text-white">
                        {cfg.duration}s
                      </div>
                      <div className="text-[10px] text-slate-400">
                        +{cfg.points} pts / song
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Song Picker for Selected Round */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  2. Choose Song to Broadcast
                </span>
                <span className="text-xs text-slate-400">
                  {songs.filter((s) => s.difficulty === selectedRound).length} songs available in {roundInfo.name}
                </span>
              </div>

              <select
                id="song-selector-dropdown"
                value={selectedSongId}
                onChange={(e) => setSelectedSongId(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {songs
                  .filter((s) => s.difficulty === selectedRound)
                  .map((song) => (
                    <option key={song.id} value={song.id}>
                      {song.title} ({song.movie}) — &ldquo;{song.englishTranslatedLyrics.slice(0, 50)}...&rdquo;
                    </option>
                  ))}
                {songs.filter((s) => s.difficulty === selectedRound).length === 0 && (
                  <option value="">No songs found for this difficulty. Add one in Song Bank!</option>
                )}
              </select>

              {/* Master Control Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
                <button
                  id="admin-start-song-btn"
                  type="button"
                  disabled={isSubmitting || !selectedSongId}
                  onClick={() => handleStartSong()}
                  className="flex-1 min-w-[160px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Launch Song & Timer</span>
                </button>

                {gameState.timerRunning ? (
                  <button
                    id="admin-pause-timer-btn"
                    type="button"
                    onClick={handlePauseTimer}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition cursor-pointer"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    id="admin-resume-timer-btn"
                    type="button"
                    onClick={handleResumeTimer}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>Resume Timer</span>
                  </button>
                )}

                <button
                  id="admin-reset-round-btn"
                  type="button"
                  onClick={handleResetRound}
                  title="Reset Timer to Initial"
                  className="flex items-center gap-1.5 px-3.5 py-3 rounded-xl text-sm font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>

                <button
                  id="admin-reveal-answer-btn"
                  type="button"
                  onClick={handleRevealAnswer}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Reveal Answer</span>
                </button>


              </div>
            </div>

            {/* Currently Active Song Preview Card */}
            {currentSong && (
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Current Active Song in Match</span>
                  <span className="text-amber-400">{currentSong.title}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[11px] font-bold uppercase text-amber-400/90 block mb-1">
                    English Translated Lyrics (Shown to Students):
                  </span>
                  <p className="text-base text-slate-100 font-serif italic font-semibold">
                    &ldquo;{currentSong.englishTranslatedLyrics}&rdquo;
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-emerald-400 font-bold">
                      Answer: {currentSong.title} ({currentSong.movie})
                    </div>
                    {currentSong.hints && currentSong.hints.length > 0 && (
                      <div className="text-slate-400">
                        Clues: {currentSong.hints.join(' • ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Buzzer Deck & Real-time Judgment (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Live Buzzer Queue / First-to-Buzz Deck */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-200">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Live Buzzer Deck</span>
                </div>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-800 text-slate-300">
                  {gameState.buzzerQueue.length} Buzzes Recorded
                </span>
              </div>



              {/* First Buzz Spotlight */}
              {gameState.buzzedTeam ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/80 via-slate-900 to-rose-950/80 border-2 border-rose-500/80 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      1st BUZZER WINNER
                    </span>
                    <span className="font-['Orbitron',monospace] text-xs font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded-md">
                      {(gameState.buzzedTeam.reactionTimeMs / 1000).toFixed(2)}s reaction
                    </span>
                  </div>

                  <div className="text-2xl font-black text-white">
                    {gameState.buzzedTeam.teamName}
                  </div>

                  <p className="text-xs text-slate-300">
                    Timer automatically stopped. Ask the team for the Telugu song & movie name!
                  </p>

                  {/* JUDGMENT BUTTONS */}
                  <div className="pt-2 border-t border-rose-900/60 grid grid-cols-2 gap-2">
                    <button
                      id="judge-correct-btn"
                      type="button"
                      onClick={() => handleJudgeCorrect()}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Correct (+1 Pt)</span>
                    </button>

                    <button
                      id="judge-wrong-btn"
                      type="button"
                      onClick={() => handleJudgeWrong()}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Wrong (Resume Timer)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-slate-800/80 text-slate-400">
                  <Zap className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs font-semibold">
                    {gameState.timerRunning
                      ? 'Timer is running! Waiting for any team to press buzzer...'
                      : 'No buzzer pressed yet. Start the round to activate buzzers.'}
                  </p>
                </div>
              )}

              {/* Buzzer Queue List */}
              {gameState.buzzerQueue.length > 1 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-bold uppercase text-slate-400">
                    Buzzer Queue:
                  </div>
                  {gameState.buzzerQueue.map((b, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 text-xs"
                    >
                      <span className="font-semibold text-slate-200">
                        #{idx + 1} {b.teamName}
                      </span>
                      <span className="text-slate-400 font-mono">
                        +{(b.reactionTimeMs / 1000).toFixed(2)}s
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Locked Teams List (Teams that answered wrong this round) */}
              {gameState.lockedTeams.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked Out For This Song (Wrong Answer):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {gameState.lockedTeams.map((tid) => {
                      const t = teams.find((item) => item.id === tid);
                      return (
                        <span
                          key={tid}
                          className="px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 text-[11px] font-semibold"
                        >
                          {t ? t.teamName : tid}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Side Timer Preview */}
            <TimerWidget
              timeRemaining={gameState.timeRemaining}
              initialDuration={gameState.initialDuration}
              timerRunning={gameState.timerRunning}
              status={gameState.status}
              roundName={roundInfo.name}
              size="lg"
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SONG BANK & UPLOAD */}
      {/* ========================================================================= */}
      {activeTab === 'songs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add / Import Song Form (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Add Song Form */}
            <form
              onSubmit={handleCreateSong}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Add New Telugu Song
                </span>
                <span className="text-[11px] text-amber-400 font-medium">Custom Song</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Song Title (Telugu Song Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samajavaragamana"
                  value={newSongTitle}
                  onChange={(e) => setNewSongTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Movie Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ala Vaikunthapurramuloo"
                    value={newSongMovie}
                    onChange={(e) => setNewSongMovie(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={newSongDifficulty}
                    onChange={(e) => setNewSongDifficulty(e.target.value as Difficulty)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm"
                  >
                    <option value="easy">Easy (1 min)</option>
                    <option value="medium">Medium (1m 30s)</option>
                    <option value="hard">Hard (2 min)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-400 block mb-1">
                  English Translated Lyrics (The Puzzle to Decode) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. O you who walks with the graceful stride of a royal elephant, having seen you can I restrain myself..."
                  value={newSongEnglish}
                  onChange={(e) => setNewSongEnglish(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Original Telugu Lyrics (Reference)
                </label>
                <input
                  type="text"
                  placeholder="సామజవరగమనా.. నిను చూసి ఆగగలనా.."
                  value={newSongTelugu}
                  onChange={(e) => setNewSongTelugu(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Hints / Clues (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Allu Arjun, Pooja Hegde, Thaman S"
                  value={newSongHints}
                  onChange={(e) => setNewSongHints(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Singer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sid Sriram"
                    value={newSongSinger}
                    onChange={(e) => setNewSongSinger(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Correct Answer Text
                  </label>
                  <input
                    type="text"
                    placeholder="Song title & movie"
                    value={newSongAnswer}
                    onChange={(e) => setNewSongAnswer(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Song to Bank</span>
              </button>
            </form>

            {/* Bulk Upload Box */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Bulk Import Songs (CSV / JSON)
              </span>
              <p className="text-xs text-slate-400">
                Upload your college event song database in one click using CSV or JSON file.
              </p>

              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold cursor-pointer">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="flex items-center gap-1.5 p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  title="Download Sample CSV Template"
                >
                  <Download className="w-4 h-4" />
                  <span>Template</span>
                </button>
              </div>
            </div>
          </div>

          {/* Song Bank List (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Available Songs in Bank ({songs.length})
                </span>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search song, movie, lyric..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Song List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredSongs.map((song) => {
                  const cfg = ROUND_CONFIG[song.difficulty] || ROUND_CONFIG.easy;
                  const isCurrent = gameState.currentSongId === song.id;

                  return (
                    <div
                      key={song.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full border ${cfg.badgeColor}`}
                          >
                            {cfg.name} ({cfg.duration}s)
                          </span>
                          <span className="text-sm font-bold text-white">
                            {song.title}
                          </span>
                          <span className="text-xs text-amber-400/90 font-medium">
                            ({song.movie})
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRound(song.difficulty);
                              setSelectedSongId(song.id);
                              handleStartSong(song.id);
                              setActiveTab('control');
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer"
                          >
                            ▶ Launch
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSong(song.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 font-serif italic line-clamp-2">
                        &ldquo;{song.englishTranslatedLyrics}&rdquo;
                      </p>

                      {song.hints && song.hints.length > 0 && (
                        <div className="mt-2 text-[11px] text-slate-400">
                          Hints: {song.hints.join(' • ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TEAMS & SCOREBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div>
              <h3 className="text-lg font-black text-white">Registered Teams</h3>
              <p className="text-xs text-slate-400">
                Manage points, team standings, and buzzer permissions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddTeamOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Team</span>
              </button>

              <button
                type="button"
                onClick={handleResetAllScores}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 cursor-pointer"
              >
                Reset All Scores to 0
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team, idx) => {
              const isLocked = gameState.lockedTeams.includes(team.id);

              return (
                <div
                  key={team.id}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs font-black">
                        #{idx + 1}
                      </span>
                      <span className="text-base font-black text-white">
                        {team.teamName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditTeam(team)}
                        className="p-1 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                        title="Edit Team Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                        title="Delete Team"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 space-y-0.5">
                    <div>Leader: <strong className="text-slate-200">{team.leaderName}</strong></div>
                    <div>Members: <strong className="text-slate-200">{team.membersCount}</strong></div>
                    <div>Buzzes: {team.buzzCount} | Correct: {team.correctCount} | Wrong: {team.wrongCount}</div>
                  </div>

                  {/* Score Display & Quick Points Adjust */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Total Points
                      </span>
                      <span className="font-['Orbitron',monospace] text-2xl font-black text-amber-400">
                        {team.score}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAdjustScore(team.id, -1)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 cursor-pointer"
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustScore(team.id, 1)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow cursor-pointer"
                      >
                        +1
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white">Played Songs History</h3>
            <span className="text-xs text-slate-400">
              {gameState.history.length} rounds logged
            </span>
          </div>

          {gameState.history.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No rounds recorded yet. Start a match to see song outcomes!
            </div>
          ) : (
            <div className="space-y-2">
              {gameState.history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status === 'solved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.status === 'timeout'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.status}
                    </span>
                    <div>
                      <div className="font-bold text-white text-sm">
                        {item.songTitle} ({item.movie})
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Round: {item.difficulty.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {item.winnerTeamName ? (
                      <span className="text-emerald-400 font-bold">
                        🏆 Winner: {item.winnerTeamName} (+{item.pointsAwarded} pt)
                      </span>
                    ) : (
                      <span className="text-slate-500">No Winner</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">Edit Team Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTeam(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {editSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-semibold text-center">
                {editSuccess}
              </div>
            )}

            <form onSubmit={handleSaveTeamEdit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Leader Name
                  </label>
                  <input
                    type="text"
                    value={editLeaderName}
                    onChange={(e) => setEditLeaderName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Members Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editMembersCount}
                    onChange={(e) => setEditMembersCount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Total Score (Points)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editScore}
                    onChange={(e) => setEditScore(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    New Password (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Team Modal */}
      {isAddTeamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">Register New Team</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddTeamOpen(false);
                  setAddError('');
                }}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-semibold text-center">
                {addError}
              </div>
            )}

            {addSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-semibold text-center">
                {addSuccess}
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tollywood Superstars"
                  value={addTeamName}
                  onChange={(e) => setAddTeamName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Leader Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh"
                    value={addLeaderName}
                    onChange={(e) => setAddLeaderName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Members Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={addMembersCount}
                    onChange={(e) => setAddMembersCount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Initial Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addScore}
                    onChange={(e) => setAddScore(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Team Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. pass123"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddTeamOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Add Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Change Admin Password Modal */}
      {isChangePassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">Change Admin Password</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsChangePassOpen(false);
                  setPassError('');
                  setPassSuccess('');
                }}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {passError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-semibold text-center">
                {passError}
              </div>
            )}

            {passSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-semibold text-center">
                {passSuccess}
              </div>
            )}

            <form onSubmit={handleChangeAdminPassword} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Current Admin Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={currAdminPass}
                  onChange={(e) => setCurrAdminPass(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  New Admin Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmAdminPass}
                  onChange={(e) => setConfirmAdminPass(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsChangePassOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPassLoading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {isPassLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
