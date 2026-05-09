import { useState } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { askAI } from '../services/api.js';
import Card from '../components/Card.jsx';

const SUGGESTIONS = [
  'Compare microservices vs. monolith for a new SaaS MVP.',
  'Give me 5 user stories for a fitness tracking app.',
  'What are the top security risks for a fintech web app?',
  'Suggest a tech stack for a real-time chat product.',
];

export default function AskAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (q) => {
    const question = (q ?? input).trim();
    if (!question || loading) return;
    setInput('');
    const next = [...messages, { role: 'user', content: question }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await askAI(question);
      setMessages([
        ...next,
        { role: 'ai', content: res.answer, provider: res.provider },
      ]);
    } catch (err) {
      setMessages([
        ...next,
        {
          role: 'ai',
          content:
            'Sorry, the AI request failed: ' +
            (err?.response?.data?.detail || err.message),
          provider: 'error',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Ask AI</h1>
        <p className="text-slate-400 mt-1">
          Free-form questions answered by your configured AI provider (Gemini /
          OpenAI). Useful when you need something beyond the structured plan.
        </p>
      </div>

      <Card title="Conversation" icon={Sparkles}>
        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
          {messages.length === 0 && (
            <div className="text-sm text-slate-400">
              Try one of the suggestions below, or type your own question.
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-fuchsia-500 grid place-items-center shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-brand-500/20 border border-brand-500/30 text-slate-100'
                    : 'bg-white/5 border border-white/10 text-slate-100'
                }`}
              >
                {m.content}
                {m.role === 'ai' && m.provider && (
                  <div className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">
                    via {m.provider}
                  </div>
                )}
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 grid place-items-center shrink-0">
                  <User size={16} className="text-slate-200" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-fuchsia-500 grid place-items-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-slate-300 inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Thinking…
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="mt-5 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your project, SDLC, sprints, risks…"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm
                       focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/30"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} /> Send
          </button>
        </form>

        {/* Suggestions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={loading}
              className="chip hover:bg-white/10 transition disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
