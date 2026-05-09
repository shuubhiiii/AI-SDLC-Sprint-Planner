import { useEffect, useState } from 'react';



import {



  CalendarRange,



  ChevronDown,



  ChevronUp,



  CheckCircle2,



  Sparkles,



  PlayCircle,



  Sliders,



  Pencil,



  Plus,



  Trash2,



  Save,



  X,



  Loader2,



} from 'lucide-react';



import { Link } from 'react-router-dom';



import useProject from '../services/useProject.js';



import Card from '../components/Card.jsx';



import { updateSprint } from '../services/api.js';

function SprintCard({ sprint, index, projectId, onUpdated, doneCount = 0, defaultExpanded = false }) {



  const [editing, setEditing] = useState(false);



  const [expanded, setExpanded] = useState(defaultExpanded);



  const [name, setName] = useState(sprint.name);



  const [goal, setGoal] = useState(sprint.goal);



  const [duration, setDuration] = useState(sprint.duration_weeks || 2);



  const [tasks, setTasks] = useState(sprint.tasks || []);



  const [saving, setSaving] = useState(false);



  const [error, setError] = useState('');







  // Keep local state in sync when the sprint prop changes outside edit mode



  useEffect(() => {



    if (editing) return;



    setName(sprint.name);



    setGoal(sprint.goal);



    setDuration(sprint.duration_weeks || 2);



    setTasks(sprint.tasks || []);



  }, [sprint, editing]);







  const startEdit = () => {



    setError('');



    setEditing(true);



  };



  const cancel = () => {



    setEditing(false);



    setError('');



    setName(sprint.name);



    setGoal(sprint.goal);



    setDuration(sprint.duration_weeks || 2);



    setTasks(sprint.tasks || []);



  };







  const updateTask = (i, value) =>



    setTasks((arr) => arr.map((t, idx) => (idx === i ? value : t)));



  const removeTask = (i) =>



    setTasks((arr) => arr.filter((_, idx) => idx !== i));



  const addTask = () => setTasks((arr) => [...arr, '']);



  const moveTask = (i, dir) =>



    setTasks((arr) => {



      const j = i + dir;



      if (j < 0 || j >= arr.length) return arr;



      const next = arr.slice();



      [next[i], next[j]] = [next[j], next[i]];



      return next;



    });







  const save = async () => {



    const cleaned = tasks.map((t) => t.trim()).filter(Boolean);



    if (cleaned.length === 0) {



      setError('A sprint needs at least one task.');



      return;



    }



    setSaving(true);



    setError('');



    try {



      const updated = await updateSprint(projectId, index, {



        name: name.trim() || sprint.name,



        goal: goal.trim() || sprint.goal,



        duration_weeks: Number(duration) || sprint.duration_weeks,



        tasks: cleaned,



      });



      onUpdated?.(updated);



      setEditing(false);



    } catch (e) {



      setError(e?.response?.data?.detail || 'Failed to save sprint');



    } finally {



      setSaving(false);



    }



  };







  if (!editing) {
    const total = (sprint.tasks || []).length;
    const pct = total ? Math.round((doneCount / total) * 100) : 0;
    const accents = [
      'from-brand-500 to-fuchsia-500',
      'from-fuchsia-500 to-pink-500',
      'from-cyan-500 to-brand-500',
      'from-emerald-500 to-cyan-500',
      'from-amber-500 to-rose-500',
    ];
    const accent = accents[index % accents.length];

    return (
      <section className="card !p-0 overflow-hidden">
        {/* Compact header */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition"
        >
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${accent} grid place-items-center text-white font-bold text-sm shrink-0 shadow-md`}>
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{sprint.name}</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
              <span>{sprint.duration_weeks || 2}w</span>
              <span className="text-slate-600">·</span>
              <span>{total} task{total === 1 ? '' : 's'}</span>
              {doneCount > 0 && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-emerald-300">{doneCount}/{total} done</span>
                </>
              )}
            </div>
            {/* Mini progress bar */}
            <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${accent} transition-all`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <span className="text-slate-400 shrink-0">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </button>

        {/* Expanded body */}
        {expanded && (
          <div className="px-4 pb-4 pt-1 border-t border-white/5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Goal</div>
                <p className="text-slate-200 text-sm">{sprint.goal}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit();
                }}
                className="btn-ghost !px-3 !py-1.5 text-xs shrink-0"
              >
                <Pencil size={14} /> Edit
              </button>
            </div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">Tasks</div>
            <ul className="space-y-1.5 text-sm">
              {(sprint.tasks || []).map((tk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                  <span className="text-slate-200">{tk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    );
  }







  return (



    <Card title={`Editing ${sprint.name}`} icon={Pencil}>



      <div className="space-y-4">



        <div className="grid sm:grid-cols-3 gap-3">



          <label className="sm:col-span-2 block">



            <span className="text-xs uppercase tracking-wider text-slate-400">



              Sprint name



            </span>



            <input



              value={name}



              onChange={(e) => setName(e.target.value)}



              maxLength={120}



              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:border-brand-400"



            />



          </label>



          <label className="block">



            <span className="text-xs uppercase tracking-wider text-slate-400">



              Duration (weeks)



            </span>



            <input



              type="number"



              min={1}



              max={12}



              value={duration}



              onChange={(e) => setDuration(e.target.value)}



              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:border-brand-400"



            />



          </label>



        </div>







        <label className="block">



          <span className="text-xs uppercase tracking-wider text-slate-400">



            Sprint goal



          </span>



          <textarea



            value={goal}



            onChange={(e) => setGoal(e.target.value)}



            rows={2}



            maxLength={600}



            className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:border-brand-400"



          />



        </label>







        <div>



          <div className="flex items-center justify-between mb-2">



            <span className="text-xs uppercase tracking-wider text-slate-400">



              Tasks ({tasks.length})



            </span>



            <button



              type="button"



              onClick={addTask}



              disabled={tasks.length >= 30}



              className="btn-ghost !px-3 !py-1.5 text-xs disabled:opacity-50"



            >



              <Plus size={14} /> Add task



            </button>



          </div>



          <ul className="space-y-2">



            {tasks.map((t, i) => (



              <li



                key={i}



                className="flex items-start gap-2 bg-white/5 border border-white/10 rounded-xl p-2"



              >



                <div className="flex flex-col pt-1">



                  <button



                    type="button"



                    onClick={() => moveTask(i, -1)}



                    disabled={i === 0}



                    className="text-slate-400 hover:text-white text-xs disabled:opacity-30"



                    title="Move up"



                  >



                    ▲



                  </button>



                  <button



                    type="button"



                    onClick={() => moveTask(i, 1)}



                    disabled={i === tasks.length - 1}



                    className="text-slate-400 hover:text-white text-xs disabled:opacity-30"



                    title="Move down"



                  >



                    ▼



                  </button>



                </div>



                <input



                  value={t}



                  onChange={(e) => updateTask(i, e.target.value)}



                  placeholder={`Task #${i + 1}`}



                  className="flex-1 bg-transparent border-0 p-1.5 text-sm focus:outline-none"



                />



                <button



                  type="button"



                  onClick={() => removeTask(i)}



                  className="text-slate-400 hover:text-rose-300 p-1 shrink-0"



                  title="Remove task"



                >



                  <Trash2 size={16} />



                </button>



              </li>



            ))}



            {tasks.length === 0 && (



              <li className="text-sm text-slate-400 italic">



                No tasks yet — click “Add task” to create one.



              </li>



            )}



          </ul>



        </div>







        {error && (



          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 p-2.5 text-sm">



            {error}



          </div>



        )}







        <div className="flex justify-end gap-2 pt-2 border-t border-white/5">



          <button type="button" onClick={cancel} className="btn-ghost !px-3 !py-2">



            <X size={16} /> Cancel



          </button>



          <button



            type="button"



            onClick={save}



            disabled={saving}



            className="btn-primary !px-4 !py-2 disabled:opacity-60"



          >



            {saving ? (



              <>



                <Loader2 size={16} className="animate-spin" /> Saving…



              </>



            ) : (



              <>



                <Save size={16} /> Save sprint



              </>



            )}



          </button>



        </div>



        <p className="text-xs text-slate-500">



          Tip: completed tasks keep their tick if you don’t change their text.



        </p>



      </div>



    </Card>



  );



}







export default function SprintPlanning() {



  const { project, loading, error } = useProject();



  // Local override so the UI updates after save without refetching



  const [override, setOverride] = useState(null);







  if (loading) return <div className="text-slate-400">Loading…</div>;



  if (error) return <div className="text-rose-300">{error}</div>;



  if (!project) {



    return (



      <div className="card text-center py-14">



        <p className="text-slate-300 mb-4">No project plan yet.</p>



        <Link to="/new" className="btn-primary inline-flex">



          <Sparkles size={16} /> Generate Plan



        </Link>



      </div>



    );



  }







  const live = override || project;



  const sprints = live.plan.sprints || [];



  const totalWeeks = sprints.reduce((s, x) => s + (x.duration_weeks || 0), 0);







  return (



    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">



        <div>



          <span className="chip mb-2">



            <CalendarRange size={12} className="mr-1.5 text-brand-300" /> Agile Sprint Plan



          </span>



          <h1 className="text-3xl font-bold">{live.title} — Sprint Plan</h1>



          <p className="text-slate-400 mt-1">



            {sprints.length} sprints · approximately {totalWeeks} weeks total. Edit any



            sprint to tailor scope to your team.



          </p>



        </div>



      </div>







      <div className="space-y-3 max-w-3xl">



        {sprints.map((sp, i) => (



          <SprintCard



            key={i}



            sprint={sp}



            index={i}



            projectId={live.id}



            doneCount={Object.keys((live.progress || {})[String(i)] || {}).length}



            defaultExpanded={i === 0}



            onUpdated={(updated) => setOverride(updated)}



          />



        ))}



      </div>



    </div>



  );



}



