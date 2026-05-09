import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Activity,
  Layers,
  ShieldCheck,
  Rocket,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { listProjects, deleteProject } from '../services/api.js';
import Card from '../components/Card.jsx';

const stats = [
  { label: 'Active Workflow Steps', value: '10', icon: Activity },
  { label: 'SDLC Phases', value: '6',  icon: Layers },
  { label: 'Risk Categories',     value: '4',  icon: ShieldCheck },
  { label: 'Avg. Plan Time',      value: '<30s', icon: Rocket },
];

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    listProjects()
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const onDelete = async (id) => {
    if (!confirm('Delete this project plan?')) return;
    await deleteProject(id);
    refresh();
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="gradient-border rounded-2xl">
        <div className="rounded-2xl p-8 lg:p-12 bg-ink-800/50">
          <span className="chip mb-4">
            <Sparkles size={12} className="mr-1.5 text-brand-300" /> Agentic AI Workflow
          </span>
          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight">
            Turn raw ideas into{' '}
            <span className="bg-gradient-to-r from-brand-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              enterprise-grade plans
            </span>
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            ProjectPilot AI analyzes your idea and generates a complete SDLC + Agile
            plan: requirements, sprints, user stories, risks, testing checklist and
            recommended tech stack — in seconds.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/new" className="btn-primary">
              <Sparkles size={16} /> Start a New Plan
            </Link>
            <Link to="/results" className="btn-ghost">
              View Latest Results <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card !p-5">
            <div className="flex items-center gap-3 mb-2 text-brand-300">
              <Icon size={18} />
              <span className="text-xs uppercase tracking-wider text-slate-400">
                {label}
              </span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        ))}
      </section>

      {/* Recent projects */}
      <Card title="Recent AI Plans" icon={Layers}>
        {loading ? (
          <div className="text-slate-400 text-sm">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 mb-4">No plans yet. Generate your first one.</p>
            <Link to="/new" className="btn-primary">
              <Sparkles size={16} /> Create Plan
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(p.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/results/${p.id}`} className="btn-ghost text-sm">
                    Open <ArrowRight size={14} />
                  </Link>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="btn-ghost text-sm !px-2"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
