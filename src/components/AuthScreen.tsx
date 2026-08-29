import React, { useState } from 'react';
import { UserSession, Team } from '../types';
import { Shield, Users, Sparkles, Key, ArrowRight, Music4, Lock } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (session: UserSession) => void;
  teams: Team[];
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, teams }) => {
  const [role, setRole] = useState<'team' | 'admin'>('team');
  const [teamName, setTeamName] = useState('');
  const [teamPassword, setTeamPassword] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [membersCount, setMembersCount] = useState('4');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Quick preset team selector
  const handleQuickSelectTeam = (t: Team) => {
    setTeamName(t.teamName);
    setLeaderName(t.leaderName);
    setTeamPassword('pass123'); // default password
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !teamPassword) {
      setErrorMsg('Please enter your Team Name and Password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/team-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName,
          password: teamPassword,
          leaderName,
          membersCount
        })
      });
      const data = await res.json();
      if (data.success && data.team) {
        onLogin({
          role: 'team',
          teamId: data.team.id,
          teamName: data.team.teamName,
          leaderName: data.team.leaderName
        });
      } else {
        setErrorMsg(data.message || 'Login failed. Check your password.');
      }
    } catch {
      setErrorMsg('Server connection failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) {
      setErrorMsg('Please enter Admin Password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await res.json();
      if (data.success) {
        onLogin({ role: 'admin' });
      } else {
        setErrorMsg(data.message || 'Invalid admin password.');
      }
    } catch {
      setErrorMsg('Server connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-screen-container"
      className="min-h-[85vh] flex flex-col items-center justify-center p-4 relative"
    >
      {/* Decorative Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <img
            src="/logo.jpg"
            alt="Padutha Theeyaga Logo"
            className="w-28 h-28 rounded-3xl object-cover shadow-2xl shadow-amber-500/30 border-2 border-amber-500/40 mx-auto mb-2"
          />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Padutha Theeyaga
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            Live Buzzer Event Arena
          </p>
        </div>

        {/* Role Switch Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
          <button
            id="login-role-team-tab"
            type="button"
            onClick={() => {
              setRole('team');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              role === 'team'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Panel</span>
          </button>

          <button
            id="login-role-admin-tab"
            type="button"
            onClick={() => {
              setRole('admin');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              role === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Panel</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs font-semibold text-center animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* TEAM LOGIN FORM */}
        {role === 'team' ? (
          <form onSubmit={handleTeamSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Team Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Team Mavericks"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Team Password *
              </label>
              <input
                type="password"
                required
                placeholder="Secret password"
                value={teamPassword}
                onChange={(e) => setTeamPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm"
              />
            </div>

            <button
              id="team-login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <span>{isLoading ? 'Entering Arena...' : 'Login & Open Buzzer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick pre-made teams quick-fill for easy demonstration */}
            {teams.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Select Demo Team:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {teams.slice(0, 3).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleQuickSelectTeam(t)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      {t.teamName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        ) : (
          /* ADMIN LOGIN FORM */
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Quiz Master Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Enter admin password (e.g. admin123)"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Default password: <code className="text-amber-400 font-mono">admin123</code> or <code className="text-amber-400 font-mono">admin</code>
              </p>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <span>{isLoading ? 'Verifying Admin...' : 'Enter Admin Control Room'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
