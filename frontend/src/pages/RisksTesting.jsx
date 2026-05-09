import { useState } from 'react';



import { Link } from 'react-router-dom';



import {



  ShieldAlert,



  ShieldCheck,



  Bug,



  Sparkles,



  Cpu,



  Globe,



  Lock,



  Zap,



} from 'lucide-react';



import useProject from '../services/useProject.js';



import Card from '../components/Card.jsx';



import SectionTabs from '../components/SectionTabs.jsx';

const RISK_TABS = [



  { id: 'technical',   label: 'Technical',   icon: Cpu },



  { id: 'security',    label: 'Security',    icon: Lock },



  { id: 'scalability', label: 'Scalability', icon: Globe },



  { id: 'timeline',    label: 'Timeline',    icon: Zap },



];







const TEST_TABS = [



  { id: 'functional',  label: 'Functional' },



  { id: 'ui',          label: 'UI' },



  { id: 'api',         label: 'API' },



  { id: 'security',    label: 'Security' },



  { id: 'performance', label: 'Performance' },



];







export default function RisksTesting() {



  const { project, loading, error } = useProject();



  const [riskTab, setRiskTab] = useState('technical');



  const [testTab, setTestTab] = useState('functional');







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







  const risks = project.plan.risks || {};



  const tests = project.plan.testing_checklist || {};



  const currentRisks = risks[riskTab] || [];



  const currentTests = tests[testTab] || [];







  return (



    <div className="space-y-6">
      <div>



        <span className="chip mb-2">



          <ShieldAlert size={12} className="mr-1.5 text-brand-300" /> Risks & Testing



        </span>



        <h1 className="text-3xl font-bold">{project.title}</h1>



        <p className="text-slate-400 mt-1">Risk analysis with mitigations and a full QA checklist.</p>



      </div>







      <Card title="Risk Analysis" icon={ShieldAlert}>



        <div className="mb-4">



          <SectionTabs tabs={RISK_TABS} value={riskTab} onChange={setRiskTab} />



        </div>



        {currentRisks.length === 0 ? (



          <p className="text-slate-400 text-sm">No risks recorded for this category.</p>



        ) : (



          <ul className="space-y-3">



            {currentRisks.map((r, i) => (



              <li key={i} className="rounded-xl border border-white/10 p-4">



                <div className="flex items-center gap-2 text-rose-300 font-medium">



                  <Bug size={16} /> {r.risk}



                </div>



                <div className="mt-2 text-sm text-slate-200">



                  <span className="text-emerald-300 font-medium">Mitigation:</span>{' '}



                  {r.mitigation}



                </div>



              </li>



            ))}



          </ul>



        )}



      </Card>







      <Card title="Testing Checklist" icon={ShieldCheck}>



        <div className="mb-4">



          <SectionTabs tabs={TEST_TABS} value={testTab} onChange={setTestTab} />



        </div>



        <ul className="grid md:grid-cols-2 gap-2">



          {currentTests.map((t, i) => (



            <li



              key={i}



              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"



            >



              <input type="checkbox" className="accent-brand-500" />



              <span>{t}</span>



            </li>



          ))}



        </ul>



      </Card>



    </div>



  );



}



