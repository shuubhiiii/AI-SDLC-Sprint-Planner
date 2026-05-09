import { useEffect, useMemo, useState } from 'react';



import { Link, useParams } from 'react-router-dom';



import {



  PlayCircle,



  Sparkles,



  Sliders,



  CheckCircle2,



  Circle,



  CalendarRange,



  TrendingUp,



} from 'lucide-react';



import Card from '../components/Card.jsx';



import { getProject, listProjects, updateTaskProgress } from '../services/api.js';

function pctOf(progress, sprints) {



  const total = sprints.reduce((s, sp) => s + (sp.tasks?.length || 0), 0);



  if (!total) return { total: 0, done: 0, pct: 0 };



  const done = Object.values(progress || {}).reduce(



    (s, m) => s + Object.keys(m || {}).length,



    0



  );



  return { total, done, pct: Math.round((done / total) * 100) };



}







export default function Execution() {



  const { id } = useParams();



  const [project, setProject] = useState(null);



  const [progress, setProgress] = useState({});



  const [loading, setLoading] = useState(true);



  const [error, setError] = useState('');



  const [savingKey, setSavingKey] = useState(null);







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



        setProgress(p.progress || {});



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







  const sprints = project?.plan?.sprints || [];







  const stats = useMemo(() => pctOf(progress, sprints), [progress, sprints]);







  // Active sprint = first sprint that isn't fully complete



  const activeSprintIndex = useMemo(() => {



    for (let i = 0; i < sprints.length; i++) {



      const total = sprints[i].tasks?.length || 0;



      const done = Object.keys(progress[String(i)] || {}).length;



      if (done < total) return i;



    }



    return sprints.length - 1;



  }, [sprints, progress]);







  const isDone = (si, ti) => Boolean(progress[String(si)]?.[String(ti)]);







  const toggleTask = async (si, ti) => {



    if (!project) return;



    const key = `${si}:${ti}`;



    const next = !isDone(si, ti);



    // optimistic



    setProgress((prev) => {



      const cp = { ...prev };



      const bucket = { ...(cp[String(si)] || {}) };



      if (next) bucket[String(ti)] = true;



      else delete bucket[String(ti)];



      if (Object.keys(bucket).length) cp[String(si)] = bucket;



      else delete cp[String(si)];



      return cp;



    });



    setSavingKey(key);



    try {



      const res = await updateTaskProgress(project.id, si, ti, next);



      setProgress(res.progress || {});



    } catch (e) {



      setError(e?.response?.data?.detail || 'Failed to update task');



    } finally {



      setSavingKey(null);



    }



  };







  if (loading) return <div className="text-slate-400">Loading…</div>;



  if (error) return <div className="text-rose-300">{error}</div>;



  if (!project)



    return (



      <Card title="No project to execute" icon={PlayCircle}>



        <p className="text-slate-300 mb-4">



          Generate a plan first, then start execution.



        </p>



        <Link to="/new" className="btn-primary inline-flex">



          <Sparkles size={16} /> Create a Plan



        </Link>



      </Card>



    );







  return (



    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">



        <div>



          <span className="chip mb-2">



            <PlayCircle size={12} className="mr-1.5 text-brand-300" /> Execution Mode



          </span>



          <h1 className="text-3xl font-bold">{project.title}</h1>



          <p className="text-slate-400 mt-1 max-w-3xl">



            Track sprint-by-sprint task completion. Progress is saved automatically.



          </p>



        </div>







      </div>







      {/* Progress overview */}



      <div className="grid sm:grid-cols-3 gap-4">



        <Card title="Overall Progress" icon={TrendingUp}>



          <div className="text-3xl font-bold">{stats.pct}%</div>



          <div className="text-sm text-slate-400 mt-1">



            {stats.done} / {stats.total} tasks complete



          </div>



          <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">



            <div



              className="h-full bg-gradient-to-r from-brand-500 to-fuchsia-500 transition-all"



              style={{ width: `${stats.pct}%` }}



            />



          </div>



        </Card>



        <Card title="Active Sprint" icon={CalendarRange}>



          <div className="text-lg font-semibold">



            {sprints[activeSprintIndex]?.name || '—'}



          </div>



          <div className="text-sm text-slate-400 mt-1">



            {sprints[activeSprintIndex]?.goal || 'All sprints complete'}



          </div>



        </Card>



        <Card title="Total Sprints" icon={CalendarRange}>



          <div className="text-3xl font-bold">{sprints.length}</div>



          <div className="text-sm text-slate-400 mt-1">



            {sprints.reduce((s, sp) => s + (sp.duration_weeks || 0), 0)} weeks total



          </div>



        </Card>



      </div>







      {/* Sprint-wise task boards */}



      <div className="space-y-4">



        {sprints.map((sp, si) => {



          const total = sp.tasks?.length || 0;



          const done = Object.keys(progress[String(si)] || {}).length;



          const pct = total ? Math.round((done / total) * 100) : 0;



          const isActive = si === activeSprintIndex;



          return (



            <section



              key={si}



              className={`card ${



                isActive ? 'ring-1 ring-brand-400/40 shadow-lg shadow-brand-500/10' : ''



              }`}



            >



              <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">



                <div>



                  <div className="flex items-center gap-2">



                    <h3 className="section-title">{sp.name}</h3>



                    {isActive && pct < 100 && (



                      <span className="chip !bg-brand-500/20 !border-brand-400/40 text-brand-100">



                        Active



                      </span>



                    )}



                    {pct === 100 && (



                      <span className="chip !bg-emerald-500/15 !border-emerald-400/40 text-emerald-200">



                        Done



                      </span>



                    )}



                  </div>



                  <p className="text-sm text-slate-400 mt-1">{sp.goal}</p>



                </div>



                <div className="text-right">



                  <div className="text-sm text-slate-300">



                    {done} / {total} · {sp.duration_weeks}w



                  </div>



                  <div className="mt-1 w-40 h-1.5 rounded-full bg-white/10 overflow-hidden">



                    <div



                      className="h-full bg-brand-400 transition-all"



                      style={{ width: `${pct}%` }}



                    />



                  </div>



                </div>



              </header>







              <ul className="grid md:grid-cols-2 gap-2">



                {(sp.tasks || []).map((t, ti) => {



                  const done = isDone(si, ti);



                  const saving = savingKey === `${si}:${ti}`;



                  return (



                    <li key={ti}>



                      <button



                        type="button"



                        onClick={() => toggleTask(si, ti)}



                        disabled={saving}



                        className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl border transition ${



                          done



                            ? 'bg-emerald-500/10 border-emerald-400/30'



                            : 'bg-white/0 border-white/10 hover:bg-white/5'



                        } ${saving ? 'opacity-60' : ''}`}



                      >



                        {done ? (



                          <CheckCircle2 size={18} className="text-emerald-300 mt-0.5 shrink-0" />



                        ) : (



                          <Circle size={18} className="text-slate-400 mt-0.5 shrink-0" />



                        )}



                        <span



                          className={`text-sm ${



                            done ? 'line-through text-slate-400' : 'text-slate-200'



                          }`}



                        >



                          {t}



                        </span>



                      </button>



                    </li>



                  );



                })}



              </ul>



            </section>



          );



        })}



      </div>



    </div>



  );



}



