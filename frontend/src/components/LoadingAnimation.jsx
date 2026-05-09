import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

/**
 * Animated agent workflow indicator. Cycles through `steps`,
 * marking each as completed in turn while the backend works.
 */
export default function LoadingAnimation({ steps, activeIndex }) {
  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="relative w-10 h-10 grid place-items-center">
          <span className="absolute inset-0 rounded-full bg-brand-500/30 animate-ping" />
          <span className="absolute inset-1 rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500" />
          <Loader2 className="relative text-white animate-spin" size={18} />
        </div>
        <div>
          <div className="font-semibold">AI Agent is planning your project…</div>
          <div className="text-xs text-slate-400">
            Reasoning across requirements, SDLC, sprints, risks and more.
          </div>
        </div>
      </div>

      <ol className="space-y-2">
        {steps.map((step, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <motion.li
              key={step}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                isActive
                  ? 'bg-brand-500/10 border-brand-500/40'
                  : isDone
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-white/0 border-white/5'
              }`}
            >
              <span className="w-6 h-6 grid place-items-center">
                {isDone ? (
                  <CheckCircle2 className="text-emerald-400" size={18} />
                ) : isActive ? (
                  <Loader2 className="animate-spin text-brand-300" size={18} />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                )}
              </span>
              <span
                className={`text-sm ${
                  isActive ? 'text-white' : isDone ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {step}
              </span>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
