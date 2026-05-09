import { Github, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-ink-900/60 border-b border-white/5">
      <div className="flex items-center justify-between px-4 lg:px-6 h-14">
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-fuchsia-500 grid place-items-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-semibold">ProjectPilot AI</span>
        </div>

        <div className="hidden lg:block text-sm text-slate-400">
          AI-powered SDLC & Agile Planning Assistant
        </div>

        <div className="flex items-center gap-2">
          <Link to="/new" className="btn-primary text-sm">
            <Sparkles size={16} /> New Plan
          </Link>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost text-sm"
          >
            <Github size={16} /> GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
