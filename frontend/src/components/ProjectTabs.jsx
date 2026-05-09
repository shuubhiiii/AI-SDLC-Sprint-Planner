import { NavLink, useLocation } from 'react-router-dom';
import { ListChecks, Sliders, CalendarRange, PlayCircle, ShieldAlert } from 'lucide-react';

const VIEWS = [
  { label: 'Overview',      path: 'results',    icon: ListChecks  },
  { label: 'Customize',     path: 'customize',  icon: Sliders     },
  { label: 'Sprint Plan',   path: 'sprints',    icon: CalendarRange },
  { label: 'Execution',     path: 'execution',  icon: PlayCircle  },
  { label: 'Risks & Tests', path: 'risks',      icon: ShieldAlert },
];

/**
 * Pill row of links to every view of a project. Hides the pill for the
 * page you're currently on (so it reads as "other views" rather than
 * "mandatory steps").
 */
export default function ProjectTabs({ projectId }) {
  const { pathname } = useLocation();
  const visible = VIEWS.filter((v) => !pathname.startsWith(`/${v.path}`));

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
      <span className="uppercase tracking-wider mr-1">Other views</span>
      {visible.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={`/${path}/${projectId}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/0 text-slate-300 hover:bg-white/5 hover:text-white transition"
        >
          <Icon size={13} />
          {label}
        </NavLink>
      ))}
    </div>
  );
}
