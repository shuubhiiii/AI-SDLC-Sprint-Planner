import { useEffect, useMemo, useState } from 'react';



import { Link, useNavigate, useParams } from 'react-router-dom';



import {



  Sliders,



  Cpu,



  Users,



  CalendarRange,



  Layers,



  Target,



  Sparkles,



  Loader2,



  ArrowRight,



  CheckCircle2,



} from 'lucide-react';



import Card from '../components/Card.jsx';



import LoadingAnimation from '../components/LoadingAnimation.jsx';



import { customizeProject, getProject, listProjects } from '../services/api.js';



const TECH_OPTIONS = ['React', 'Angular', 'Flutter', 'FastAPI', 'Node.js'];



const TEAM_OPTIONS = [



  'Solo developer',



  'Small team',



  'Medium team',



  'Enterprise team',



];



const ARCH_OPTIONS = ['Monolith', 'Microservices', 'Serverless', 'Modular Monolith'];



const PRIORITY_OPTIONS = [



  'Fast MVP',



  'Scalability',



  'Security',



  'Performance',



  'Budget-friendly',



];







const SPRINT_DURATIONS = [1, 2, 3, 4];



const TIMELINE_OPTIONS = [4, 6, 8, 12, 16, 24];







const REGEN_STEPS = [



  'Reading your customization preferences',



  'Re-biasing the recommended tech stack',



  'Recomputing sprint count and durations',



  'Adjusting workload for your team size',



  'Re-prioritizing features and requirements',



  'Rebuilding milestones and timeline',



  'Validating the optimized plan',



];







// Estimated total regeneration time in ms (Gemini round-trip).



// Used to advance the progress bar smoothly while we wait.



const REGEN_ESTIMATE_MS = 18000;







function defaultPrefs(existing) {



  return {



    tech_stack: existing?.tech_stack || [],



    team_size: existing?.team_size || '',



    sprint_duration_weeks: existing?.sprint_duration_weeks || 2,



    timeline_weeks: existing?.timeline_weeks || 8,



    architecture: existing?.architecture || '',



    priority: existing?.priority || '',



    notes: existing?.notes || '',



  };



}







export default function Customize() {



  const { id } = useParams();



  const navigate = useNavigate();







  const [project, setProject] = useState(null);



  const [loading, setLoading] = useState(true);



  const [saving, setSaving] = useState(false);



  const [error, setError] = useState('');



  const [prefs, setPrefs] = useState(defaultPrefs());







  // Regeneration progress (0-100) + active step index, driven by elapsed time



  const [progressPct, setProgressPct] = useState(0);



  const [stepIndex, setStepIndex] = useState(0);



  const [elapsedSec, setElapsedSec] = useState(0);







  useEffect(() => {



    let cancelled = false;



    async function load() {



      setLoading(true);



      setError('');



      try {



        let p;



        if (id) {



          p = await getProject(id);



        } else {



          const list = await listProjects();



          if (!list?.length) {



            if (!cancelled) {



              setProject(null);



              setLoading(false);



            }



            return;



          }



          p = await getProject(list[0].id);



        }



        if (cancelled) return;



        setProject(p);



        setPrefs(defaultPrefs(p.preferences));



      } catch (e) {



        if (!cancelled) setError(e?.response?.data?.detail || 'Failed to load project');



      } finally {



        if (!cancelled) setLoading(false);



      }



    }



    load();



    return () => {



      cancelled = true;



    };



  }, [id]);







  const toggleTech = (t) => {



    setPrefs((p) => ({



      ...p,



      tech_stack: p.tech_stack.includes(t)



        ? p.tech_stack.filter((x) => x !== t)



        : [...p.tech_stack, t],



    }));



  };







  const summaryChips = useMemo(() => {



    const out = [];



    if (prefs.tech_stack.length) out.push(`Tech: ${prefs.tech_stack.join(', ')}`);



    if (prefs.team_size) out.push(prefs.team_size);



    if (prefs.sprint_duration_weeks) out.push(`${prefs.sprint_duration_weeks}-wk sprints`);



    if (prefs.timeline_weeks) out.push(`${prefs.timeline_weeks}-wk timeline`);



    if (prefs.architecture) out.push(prefs.architecture);



    if (prefs.priority) out.push(`Priority: ${prefs.priority}`);



    return out;



  }, [prefs]);







  const onSubmit = async (e) => {



    e.preventDefault();



    if (!project) return;



    setSaving(true);



    setError('');



    setProgressPct(0);



    setStepIndex(0);



    setElapsedSec(0);



    try {



      const updated = await customizeProject(project.id, prefs);



      setProgressPct(100);



      setStepIndex(REGEN_STEPS.length);



      // brief flash of "complete" before navigating



      await new Promise((r) => setTimeout(r, 350));



      navigate(`/results/${updated.id}`);



    } catch (e2) {



      setError(e2?.response?.data?.detail || 'Failed to regenerate plan');



      setSaving(false);



      setProgressPct(0);



    }



  };







  // While saving, advance the bar smoothly toward ~95% based on elapsed time



  // (the final 5% is filled the moment the API responds).



  useEffect(() => {



    if (!saving) return undefined;



    const start = performance.now();



    const id = setInterval(() => {



      const elapsed = performance.now() - start;



      const ratio = Math.min(elapsed / REGEN_ESTIMATE_MS, 1);



      // ease-out so it slows as it approaches the cap



      const eased = 1 - Math.pow(1 - ratio, 2);



      const pct = Math.min(95, Math.round(eased * 95));



      setProgressPct((prev) => (pct > prev ? pct : prev));



      setElapsedSec(Math.floor(elapsed / 1000));



      const idx = Math.min(



        REGEN_STEPS.length - 1,



        Math.floor((eased * REGEN_STEPS.length))



      );



      setStepIndex(idx);



    }, 200);



    return () => clearInterval(id);



  }, [saving]);







  if (loading) return <div className="text-slate-400">Loading…</div>;



  if (!project)



    return (



      <Card title="No project to customize" icon={Sliders}>



        <p className="text-slate-300 mb-4">



          Generate a plan first, then come back to tailor it to your stack and team.



        </p>



        <Link to="/new" className="btn-primary inline-flex">



          <Sparkles size={16} /> Create a Plan



        </Link>



      </Card>



    );







  if (saving) {



    return (



      <div className="space-y-6">



        <div>



          <span className="chip mb-2">



            <Sliders size={12} className="mr-1.5 text-brand-300" /> Regenerating



          </span>



          <h1 className="text-3xl font-bold">Optimizing your plan…</h1>



          <p className="text-slate-400 mt-1">



            The AI is rebuilding <span className="text-slate-200 font-medium">{project.title}</span>{' '}



            using your customization. This usually takes 10–25 seconds.



          </p>



        </div>







        <div className="card max-w-2xl mx-auto">



          <div className="flex items-baseline justify-between mb-2">



            <span className="text-sm text-slate-300">Regeneration progress</span>



            <span className="text-sm font-mono text-brand-200">



              {progressPct}% · {elapsedSec}s



            </span>



          </div>



          <div className="h-3 rounded-full bg-white/10 overflow-hidden">



            <div



              className="h-full bg-gradient-to-r from-brand-500 to-fuchsia-500 transition-all duration-300 ease-out"



              style={{ width: `${progressPct}%` }}



            />



          </div>



          <p className="text-xs text-slate-500 mt-2">



            We hold the last 5% until the AI response is fully validated.



          </p>



        </div>







        <LoadingAnimation steps={REGEN_STEPS} activeIndex={stepIndex} />



      </div>



    );



  }







  return (



    <div className="space-y-6">
      <div>



        <span className="chip mb-2">



          <Sliders size={12} className="mr-1.5 text-brand-300" /> Customize Plan



        </span>



        <h1 className="text-3xl font-bold">Tailor this plan to your needs</h1>



        <p className="text-slate-400 mt-1">



          Let’s customize <span className="text-slate-200 font-medium">{project.title}</span> your way.



          The AI will regenerate the plan to match your preferences.



        </p>



      </div>







      <form onSubmit={onSubmit} className="space-y-6">



        <Card title="Preferred Tech Stack" icon={Cpu}>



          <div className="flex flex-wrap gap-2">



            {TECH_OPTIONS.map((t) => {



              const on = prefs.tech_stack.includes(t);



              return (



                <button



                  type="button"



                  key={t}



                  onClick={() => toggleTech(t)}



                  className={`px-3 py-2 rounded-xl text-sm border transition ${



                    on



                      ? 'bg-brand-500/20 border-brand-400 text-white'



                      : 'bg-white/0 border-white/10 text-slate-300 hover:bg-white/5'



                  }`}



                >



                  {on && <CheckCircle2 size={14} className="inline mr-1.5 -mt-0.5" />}



                  {t}



                </button>



              );



            })}



          </div>



          <p className="text-xs text-slate-400 mt-3">



            Pick any combination. The AI will recommend matching layers and reasons.



          </p>



        </Card>







        <div className="grid lg:grid-cols-2 gap-4">



          <Card title="Team Size" icon={Users}>



            <div className="grid grid-cols-2 gap-2">



              {TEAM_OPTIONS.map((t) => (



                <label



                  key={t}



                  className={`cursor-pointer px-3 py-2 rounded-xl border text-sm text-center transition ${



                    prefs.team_size === t



                      ? 'bg-brand-500/20 border-brand-400 text-white'



                      : 'bg-white/0 border-white/10 text-slate-300 hover:bg-white/5'



                  }`}



                >



                  <input



                    type="radio"



                    name="team_size"



                    value={t}



                    checked={prefs.team_size === t}



                    onChange={(e) => setPrefs({ ...prefs, team_size: e.target.value })}



                    className="hidden"



                  />



                  {t}



                </label>



              ))}



            </div>



          </Card>







          <Card title="Architecture Preference" icon={Layers}>



            <div className="grid grid-cols-2 gap-2">



              {ARCH_OPTIONS.map((a) => (



                <label



                  key={a}



                  className={`cursor-pointer px-3 py-2 rounded-xl border text-sm text-center transition ${



                    prefs.architecture === a



                      ? 'bg-brand-500/20 border-brand-400 text-white'



                      : 'bg-white/0 border-white/10 text-slate-300 hover:bg-white/5'



                  }`}



                >



                  <input



                    type="radio"



                    name="architecture"



                    value={a}



                    checked={prefs.architecture === a}



                    onChange={(e) => setPrefs({ ...prefs, architecture: e.target.value })}



                    className="hidden"



                  />



                  {a}



                </label>



              ))}



            </div>



          </Card>



        </div>







        <div className="grid lg:grid-cols-2 gap-4">



          <Card title="Sprint Duration" icon={CalendarRange}>



            <div className="flex flex-wrap gap-2">



              {SPRINT_DURATIONS.map((w) => (



                <button



                  type="button"



                  key={w}



                  onClick={() => setPrefs({ ...prefs, sprint_duration_weeks: w })}



                  className={`px-4 py-2 rounded-xl text-sm border transition ${



                    prefs.sprint_duration_weeks === w



                      ? 'bg-brand-500/20 border-brand-400 text-white'



                      : 'bg-white/0 border-white/10 text-slate-300 hover:bg-white/5'



                  }`}



                >



                  {w} {w === 1 ? 'week' : 'weeks'}



                </button>



              ))}



            </div>



            <p className="text-xs text-slate-400 mt-3">
              You'll get{' '}
              <span className="text-brand-200 font-medium">
                {Math.max(1, Math.round(prefs.timeline_weeks / prefs.sprint_duration_weeks))}
              </span>{' '}
              sprints across your {prefs.timeline_weeks}-week timeline. A longer
              timeline means more sprints, not longer ones (Agile keeps sprints 1–4 weeks).
            </p>



          </Card>







          <Card title="Project Timeline" icon={CalendarRange}>



            <div className="flex flex-wrap gap-2">



              {TIMELINE_OPTIONS.map((w) => (



                <button



                  type="button"



                  key={w}



                  onClick={() => setPrefs({ ...prefs, timeline_weeks: w })}



                  className={`px-4 py-2 rounded-xl text-sm border transition ${



                    prefs.timeline_weeks === w



                      ? 'bg-brand-500/20 border-brand-400 text-white'



                      : 'bg-white/0 border-white/10 text-slate-300 hover:bg-white/5'



                  }`}



                >



                  {w} weeks



                </button>



              ))}



            </div>



          </Card>



        </div>







        <Card title="Top Priority" icon={Target}>



          <div className="flex flex-wrap gap-2">



            {PRIORITY_OPTIONS.map((p) => (



              <button



                type="button"



                key={p}



                onClick={() => setPrefs({ ...prefs, priority: p })}



                className={`px-3 py-2 rounded-xl text-sm border transition ${



                  prefs.priority === p



                    ? 'bg-brand-500/20 border-brand-400 text-white'



                    : 'bg-white/0 border-white/10 text-slate-300 hover:bg-white/5'



                }`}



              >



                {p}



              </button>



            ))}



          </div>



        </Card>







        <Card title="Additional Notes (optional)" icon={Sparkles}>



          <textarea



            value={prefs.notes}



            onChange={(e) => setPrefs({ ...prefs, notes: e.target.value })}



            rows={3}



            maxLength={1000}



            placeholder="e.g. must integrate with Stripe, support multi-tenant, deploy on AWS only…"



            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-400"



          />



          <div className="text-right text-xs text-slate-500 mt-1">



            {prefs.notes.length}/1000



          </div>



        </Card>







        {summaryChips.length > 0 && (



          <Card title="Your Customization" icon={CheckCircle2}>



            <div className="flex flex-wrap gap-2">



              {summaryChips.map((c) => (



                <span key={c} className="chip">



                  {c}



                </span>



              ))}



            </div>



          </Card>



        )}







        {error && (



          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 p-3 text-sm">



            {error}



          </div>



        )}







        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end sticky bottom-2">



          <Link to={`/results/${project.id}`} className="btn-ghost justify-center">



            Cancel



          </Link>



          <button



            type="submit"



            disabled={saving}



            className="btn-primary justify-center disabled:opacity-60"



          >



            {saving ? (



              <>



                <Loader2 size={16} className="animate-spin" /> Regenerating…



              </>



            ) : (



              <>



                Regenerate Optimized Plan <ArrowRight size={16} />



              </>



            )}



          </button>



        </div>



      </form>



    </div>



  );



}



