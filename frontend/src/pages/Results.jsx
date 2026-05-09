import { Link } from 'react-router-dom';

import {

  FileText,

  ListChecks,

  Layers,

  Shield,

  Cpu,

  Target,

  Users,

  CalendarRange,

  Sparkles,

  Sliders,

} from 'lucide-react';

import useProject from '../services/useProject.js';

import Card from '../components/Card.jsx';

function Empty() {

  return (

    <div className="card text-center py-14">

      <p className="text-slate-300 mb-4">No project plan yet.</p>

      <Link to="/new" className="btn-primary inline-flex">

        <Sparkles size={16} /> Generate Your First Plan

      </Link>

    </div>

  );

}



export default function Results() {

  const { project, loading, error } = useProject();



  if (loading) return <div className="text-slate-400">Loading…</div>;

  if (error) return <div className="text-rose-300">{error}</div>;

  if (!project) return <Empty />;



  const { plan } = project;

  const s = plan.summary || {};

  const nfr = plan.non_functional_requirements || {};

  const prefs = project.preferences;

  const hasPrefs =

    prefs &&

    (prefs.tech_stack?.length ||

      prefs.team_size ||

      prefs.architecture ||

      prefs.priority ||

      prefs.sprint_duration_weeks ||

      prefs.timeline_weeks ||

      prefs.notes);



  return (

    <div className="space-y-6">
      <div>

        <span className="chip mb-2">

          <Sparkles size={12} className="mr-1.5 text-brand-300" />

          {hasPrefs ? 'AI Optimized Plan' : 'AI Recommended Plan'}

        </span>

        <h1 className="text-3xl font-bold">{project.title}</h1>

        <p className="text-slate-400 mt-1 max-w-3xl">{s.elevator_pitch}</p>

        {!hasPrefs && (

          <p className="text-xs text-slate-500 mt-2 max-w-3xl">

            This is the AI’s starting recommendation. Use the{' '}

            <strong>Customize</strong> tab above to tailor it to your tech stack, team size and timeline.

          </p>

        )}

      </div>



      {hasPrefs && (

        <Card title="Applied Customization" icon={Sliders}>

          <div className="flex flex-wrap gap-2">

            {prefs.tech_stack?.length > 0 && (

              <span className="chip">Tech: {prefs.tech_stack.join(', ')}</span>

            )}

            {prefs.team_size && <span className="chip">{prefs.team_size}</span>}

            {prefs.architecture && <span className="chip">{prefs.architecture}</span>}

            {prefs.priority && <span className="chip">Priority: {prefs.priority}</span>}

            {prefs.sprint_duration_weeks && (

              <span className="chip">{prefs.sprint_duration_weeks}-wk sprints</span>

            )}

            {prefs.timeline_weeks && (

              <span className="chip">{prefs.timeline_weeks}-wk timeline</span>

            )}

          </div>

          {prefs.notes && (

            <p className="text-sm text-slate-300 mt-3">

              <span className="text-slate-400">Notes: </span>

              {prefs.notes}

            </p>

          )}

        </Card>

      )}



      {/* Summary */}

      <div className="grid lg:grid-cols-3 gap-4">

        <Card title="Project Type" icon={Target}>

          <div className="text-lg font-semibold">{s.project_type || '—'}</div>

        </Card>

        <Card title="Target Users" icon={Users}>

          <div className="flex flex-wrap gap-2">

            {(s.target_users || []).map((u) => (

              <span key={u} className="chip">{u}</span>

            ))}

          </div>

        </Card>

        <Card title="Main Objective" icon={Sparkles}>

          <p className="text-slate-200">{s.main_objective || '—'}</p>

        </Card>

      </div>



      {/* Features */}

      <Card title="Feature Breakdown" icon={Layers}>

        <div className="grid md:grid-cols-2 gap-4">

          {(plan.features || []).map((cat) => (

            <div key={cat.category} className="rounded-xl border border-white/10 p-4 bg-white/0">

              <div className="font-semibold text-brand-200 mb-2">{cat.category}</div>

              <ul className="space-y-1.5 text-sm text-slate-200">

                {cat.items.map((it) => (

                  <li key={it} className="flex items-start gap-2">

                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />

                    <span>{it}</span>

                  </li>

                ))}

              </ul>

            </div>

          ))}

        </div>

      </Card>



      {/* Functional / Non-functional */}

      <div className="grid lg:grid-cols-2 gap-4">

        <Card title="Functional Requirements" icon={ListChecks}>

          <ul className="space-y-2 text-sm">

            {(plan.functional_requirements || []).map((r, i) => (

              <li key={i} className="flex gap-3">

                <span className="text-brand-300 font-mono">{String(i + 1).padStart(2, '0')}</span>

                <span>{r}</span>

              </li>

            ))}

          </ul>

        </Card>



        <Card title="Non-Functional Requirements" icon={Shield}>

          <div className="space-y-3 text-sm">

            {Object.entries(nfr).map(([k, items]) => (

              <div key={k}>

                <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">

                  {k}

                </div>

                <div className="flex flex-wrap gap-2">

                  {(items || []).map((it) => (

                    <span key={it} className="chip">{it}</span>

                  ))}

                </div>

              </div>

            ))}

          </div>

        </Card>

      </div>



      {/* SDLC */}

      <Card title="SDLC Plan" icon={FileText}>

        <ol className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {(plan.sdlc_plan || []).map((p, i) => (

            <li key={p.phase} className="rounded-xl border border-white/10 p-4">

              <div className="text-xs text-brand-300 mb-1">Phase {i + 1}</div>

              <div className="font-semibold">{p.phase}</div>

              <p className="text-sm text-slate-300 mt-1">{p.objective}</p>

              <div className="mt-3">

                <div className="text-xs uppercase text-slate-400 mb-1">Tasks</div>

                <ul className="text-sm text-slate-200 list-disc pl-5 space-y-0.5">

                  {(p.tasks || []).map((t) => <li key={t}>{t}</li>)}

                </ul>

              </div>

              <div className="mt-3">

                <div className="text-xs uppercase text-slate-400 mb-1">Deliverables</div>

                <div className="flex flex-wrap gap-2">

                  {(p.deliverables || []).map((d) => <span key={d} className="chip">{d}</span>)}

                </div>

              </div>

            </li>

          ))}

        </ol>

      </Card>



      {/* User Stories */}

      <Card title="User Stories" icon={Users}>

        <div className="grid md:grid-cols-2 gap-3">

          {(plan.user_stories || []).map((u, i) => (

            <div key={i} className="rounded-xl border border-white/10 p-4 text-sm">

              <span className="text-brand-300">As a</span>{' '}

              <strong>{u.role}</strong>,{' '}

              <span className="text-brand-300">I want</span> {u.goal},{' '}

              <span className="text-brand-300">so that</span> {u.benefit}.

            </div>

          ))}

        </div>

      </Card>



      {/* Tech Stack */}

      <Card title="Recommended Tech Stack" icon={Cpu}>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {Object.entries(plan.tech_stack || {}).map(([area, items]) => (

            <div key={area} className="rounded-xl border border-white/10 p-4">

              <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">{area}</div>

              <ul className="space-y-2 text-sm">

                {(items || []).map((it) => (

                  <li key={it.name}>

                    <div className="font-semibold">{it.name}</div>

                    <div className="text-slate-400">{it.reason}</div>

                  </li>

                ))}

              </ul>

            </div>

          ))}

        </div>

      </Card>



      {/* Timeline */}

      {plan.timeline && (

        <Card title={`Timeline · ${plan.timeline.total_weeks} weeks`} icon={CalendarRange}>

          <div className="relative pl-4 border-l border-white/10 space-y-4">

            {(plan.timeline.milestones || []).map((m, i) => (

              <div key={i} className="relative">

                <span className="absolute -left-[9px] top-1.5 w-3 h-3 rounded-full bg-brand-400 ring-4 ring-brand-400/20" />

                <div className="text-xs text-brand-300">Week {m.week}</div>

                <div className="text-sm">{m.milestone}</div>

              </div>

            ))}

          </div>

        </Card>

      )}

    </div>

  );

}

