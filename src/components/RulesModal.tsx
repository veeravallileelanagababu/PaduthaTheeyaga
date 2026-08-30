import React from 'react';
import { X, Clock, Zap, CheckCircle2, Award } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="rules-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="rules-modal-card"
        className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.jpg"
              alt="Padutha Theeyaga Logo"
              className="w-9 h-9 rounded-xl object-cover border border-amber-500/40"
            />
            <div>
              <h3 className="text-lg font-black text-white">
                Padutha Theeyaga Event Rules
              </h3>
              <p className="text-xs text-slate-400">Official Event Guidelines</p>
            </div>
          </div>

          <button
            id="close-rules-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rules Grid */}
        <div className="space-y-4 text-xs text-slate-300">
          {/* Round Timings */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
              <Clock className="w-4 h-4" />
              <span>Round Timers & Difficulties</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <li className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                <strong className="block text-white">Easy Round</strong>
                Timer: <strong>1 Minute (60s)</strong>
              </li>
              <li className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300">
                <strong className="block text-white">Medium Round</strong>
                Timer: <strong>1m 30s (90s)</strong>
              </li>
              <li className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
                <strong className="block text-white">Hard Round</strong>
                Timer: <strong>2 Minutes (120s)</strong>
              </li>
            </ul>
          </div>

          {/* Buzzer Rules */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
              <Zap className="w-4 h-4" />
              <span>Buzzer Mechanics & Scoring</span>
            </div>
            <ul className="space-y-2 text-slate-300 pl-1">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong>First to Buzz:</strong> When a team leader presses the buzzer, the <strong>timer immediately pauses/stops</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <strong>Correct Answer:</strong> The team is awarded <strong>1 Point</strong> and the song is solved!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>
                  <strong>Wrong Answer:</strong> That team is locked out for the rest of this song, and the <strong>timer resumes immediately</strong> until time runs out or another team finds the correct answer!
                </span>
              </li>
            </ul>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase text-xs tracking-wider transition cursor-pointer"
        >
          Got it, let's play!
        </button>
      </div>
    </div>
  );
};
