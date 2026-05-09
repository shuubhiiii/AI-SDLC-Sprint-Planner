import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send } from 'lucide-react';
import { generateProject, getWorkflowSteps } from '../services/api.js';
import LoadingAnimation from '../components/LoadingAnimation.jsx';
import Card from '../components/Card.jsx';

const EXAMPLES = [
  'I want to build a food delivery app that connects local restaurants to nearby customers.',
  'Build an AI tutor for high-school math with adaptive practice and progress tracking.',
  'A SaaS platform for small clinics to manage appointments, patients and billing.',
  'A team productivity tool with AI-generated weekly retrospectives.',
];

export default function ProjectInput() {
  const [idea, setIdea] = useState('');
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    getWorkflowSteps().then(setSteps).catch(() => setSteps([]));
  }, []);

  // Drive the animated step indicator while waiting for the backend.
  useEffect(() => {
    if (!submitting || steps.length === 0) return;
    setActiveStep(0);
    const interval = setInterval(() => {
      setActiveStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 800);
    return () => clearInterval(interval);
  }, [submitting, steps]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (idea.trim().length < 10) {
      setError('Please describe your idea in at least 10 characters.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const project = await generateProject(idea.trim(), title.trim() || undefined);
      navigate(`/results/${project.id}`);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Failed to generate plan. Please try again.',
      );
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <div className="py-10">
        <LoadingAnimation steps={steps} activeIndex={activeStep} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <span className="chip mb-3">
          <Sparkles size={12} className="mr-1.5 text-brand-300" /> Step 1 of 1
        </span>
        <h1 className="text-3xl font-bold">Describe your project idea</h1>
        <p className="text-slate-400 mt-2">
          Be specific about the problem and the users. The AI agent will produce a
          full SDLC and Agile plan.
        </p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Project Title (optional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. FoodieGo"
              className="mt-1 w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-brand-400"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Project Idea</label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={6}
              placeholder="I want to build a food delivery app…"
              className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-brand-400 resize-y"
            />
            <div className="text-xs text-slate-500 mt-1">{idea.length}/2000</div>
          </div>

          {error && (
            <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                type="button"
                key={ex}
                onClick={() => setIdea(ex)}
                className="chip hover:bg-white/10"
              >
                {ex.slice(0, 48)}…
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              <Send size={16} /> Generate Plan
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
