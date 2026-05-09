import { useNavigate } from 'react-router-dom';
import { Sparkles, Play } from 'lucide-react';

/**
 * Full-page landing.
 * The hero image fits the viewport (no zoom/crop). A dark band
 * covers the painted CTA row in the artwork, and real, properly
 * styled buttons sit in that band — guaranteed to look correct
 * with no pixel-perfect overlay needed.
 */
export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#05060f] flex items-center justify-center overflow-hidden">
      <div className="relative inline-block max-w-full max-h-screen">
        <img
          src="/hero.png"
          alt="ProjectPilot AI"
          draggable={false}
          className="block max-w-full max-h-screen w-auto h-auto select-none"
        />

        {/* Mask covering the painted button row (left half of image) */}
        <div
          className="absolute"
          style={{
            left: '3%',
            top: '74%',
            width: '44%',
            height: '12%',
            background:
              'linear-gradient(to bottom, rgba(5,6,15,0) 0%, rgba(5,6,15,0.9) 25%, rgba(5,6,15,0.95) 100%)',
            borderRadius: '14px',
          }}
        />

        {/* Real buttons */}
        <div
          className="absolute flex flex-wrap items-center"
          style={{ left: '4%', top: '77.5%', gap: 'clamp(8px, 0.9vw, 14px)' }}
        >
          <button
            type="button"
            onClick={() => navigate('/new')}
            className="inline-flex items-center justify-center gap-[0.5em] rounded-2xl
                       font-semibold text-white
                       bg-gradient-to-r from-brand-500 via-fuchsia-500 to-brand-500
                       bg-[length:200%_100%] hover:bg-[position:100%_0]
                       shadow-lg shadow-fuchsia-500/40
                       focus-visible:ring-4 focus-visible:ring-fuchsia-400/50
                       active:scale-[0.985] transition"
            style={{
              fontSize: 'clamp(11px, 1.1vw, 16px)',
              padding: 'clamp(8px, 0.9vw, 14px) clamp(14px, 1.6vw, 24px)',
            }}
          >
            <Sparkles size="1.1em" /> Start a New Plan
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center gap-[0.5em] rounded-2xl
                       font-semibold text-slate-100
                       bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md
                       focus-visible:ring-4 focus-visible:ring-cyan-300/50
                       active:scale-[0.985] transition"
            style={{
              fontSize: 'clamp(11px, 1.05vw, 15px)',
              padding: 'clamp(8px, 0.9vw, 14px) clamp(14px, 1.6vw, 24px)',
            }}
          >
            <Play size="1em" /> See How It Works
          </button>
        </div>
      </div>
    </div>
  );
}
