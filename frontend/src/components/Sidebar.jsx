import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  ListChecks,
  MessageSquare,
  Cpu,
  Sliders,
  CalendarRange,
  PlayCircle,
  ShieldAlert,
  FolderOpen,
} from 'lucide-react';
import { getProject, listProjects } from '../services/api.js';

const items = [
  { to: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/new',       label: 'New Project', icon: Sparkles },
  { to: '/results',   label: 'AI Results',  icon: ListChecks },
  { to: '/ask',       label: 'Ask AI',      icon: MessageSquare },
];

const PROJECT_VIEWS = [
  { path: 'results',   label: 'Overview',      icon: ListChecks },
  { path: 'customize', label: 'Customize',     icon: Sliders },
  { path: 'sprints',   label: 'Sprint Plan',   icon: CalendarRange },
  { path: 'execution', label: 'Execution',     icon: PlayCircle },
  { path: 'risks',     label: 'Risks & Tests', icon: ShieldAlert },
];

// Match any project-scoped route: /results, /results/:id, /customize/:id, etc.
function useActiveProjectId() {
  const { pathname } = useLocation();
  for (const v of PROJECT_VIEWS) {
    const m = pathname.match(new RegExp(`^/${v.path}(?:/(\\d+))?/?$`));
    if (m) return { id: m[1] || null, view: v.path };
  }
  return { id: null, view: null };
}

const LAST_PROJECT_KEY = 'pp_last_project_id';

// Returns the project id for the sub-nav. The id can come from:
//   1. The URL (/results/9, /customize/9, ...)
//   2. localStorage when the URL is a project-scoped path without id
//      (e.g. /results loads the latest project, so re-use the last id).
//   3. localStorage when the user is anywhere else, so the sub-nav stays
//      visible across navigation.
function useStickyProjectId() {
  const { id: urlId, view } = useActiveProjectId();
  const [stickyId, setStickyId] = useState(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(LAST_PROJECT_KEY);
  });

  useEffect(() => {
    if (urlId) {
      setStickyId(urlId);
      window.localStorage.setItem(LAST_PROJECT_KEY, urlId);
    }
  }, [urlId]);

  // If no sticky id yet but the user is on a project page (e.g. /results
  // with no id in URL), fetch the most recent project once and use that.
  useEffect(() => {
    if (urlId || stickyId || !view) return;
    let cancelled = false;
    listProjects()
      .then((list) => {
        if (cancelled || !list?.length) return;
        const latest = String(list[0].id);
        setStickyId(latest);
        window.localStorage.setItem(LAST_PROJECT_KEY, latest);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [urlId, stickyId, view]);

  return {
    id: urlId || stickyId,
    view,
    isActive: !!view,
  };
}

function ProjectSubNav({ projectId, activeView }) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    let cancelled = false;
    getProject(projectId)
      .then((p) => !cancelled && setTitle(p?.title || `Project #${projectId}`))
      .catch(() => !cancelled && setTitle(`Project #${projectId}`));
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <div className="mt-2 ml-2 pl-3 border-l border-white/10">
      <div className="flex items-center gap-2 px-2 py-1.5 text-xs uppercase tracking-wider text-slate-400">
        <FolderOpen size={12} />
        <span className="truncate" title={title}>
          {title || 'Loading…'}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        {PROJECT_VIEWS.map(({ path, label, icon: Icon }) => {
          const isActive = path === activeView;
          return (
            <NavLink
              key={path}
              to={`/${path}/${projectId}`}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-brand-500/15 text-white border border-brand-500/30'
                  : 'text-slate-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={15} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { id: projectId, view: activeView, isActive } = useStickyProjectId();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 p-4 gap-2 border-r border-white/5">
      <div className="flex items-center gap-2 px-2 py-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 grid place-items-center shadow-lg shadow-brand-500/30">
          <Cpu size={18} className="text-white" />
        </div>
        <NavLink to="/" className="leading-tight">
          <div className="font-bold leading-tight">ProjectPilot</div>
          <div className="text-xs text-slate-400 leading-tight">AI Planner</div>
        </NavLink>
      </div>

      <nav className="flex flex-col gap-1 mt-2">
        {items.map(({ to, label, icon: Icon }) => {
          const isResults = to === '/results';
          return (
            <div key={to}>
              <NavLink
                to={isResults && projectId ? `/results/${projectId}` : to}
                end={!isResults}
                className={({ isActive: linkActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                    linkActive || (isResults && isActive)
                      ? 'bg-brand-500/15 text-white border border-brand-500/30'
                      : 'text-slate-300 hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
              {isResults && projectId && (
                <ProjectSubNav projectId={projectId} activeView={activeView} />
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto card !p-4">
        <div className="text-xs text-slate-400 mb-1">Tip</div>
        <div className="text-sm">
          Open a plan from <strong>AI Results</strong> to access Sprint Plan, Customize, Execution and Risks.
        </div>
      </div>
    </aside>
  );
}
