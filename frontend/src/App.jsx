import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProjectInput from './pages/ProjectInput.jsx';
import Results from './pages/Results.jsx';
import SprintPlanning from './pages/SprintPlanning.jsx';
import RisksTesting from './pages/RisksTesting.jsx';
import Customize from './pages/Customize.jsx';
import Execution from './pages/Execution.jsx';
import AskAI from './pages/AskAI.jsx';

function AppShell({ children }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 px-4 lg:px-8 py-6 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
        <footer className="border-t border-white/5 py-4 px-6 text-xs text-slate-500">
          © {new Date().getFullYear()} ProjectPilot AI · Built with React, Tailwind, FastAPI & OpenAI
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  if (location.pathname === '/') {
    return <Landing />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new" element={<ProjectInput />} />
        <Route path="/results" element={<Results />} />
        <Route path="/results/:id" element={<Results />} />
        <Route path="/sprints" element={<SprintPlanning />} />
        <Route path="/sprints/:id" element={<SprintPlanning />} />
        <Route path="/risks" element={<RisksTesting />} />
        <Route path="/risks/:id" element={<RisksTesting />} />
        <Route path="/customize" element={<Customize />} />
        <Route path="/customize/:id" element={<Customize />} />
        <Route path="/execution" element={<Execution />} />
        <Route path="/execution/:id" element={<Execution />} />
        <Route path="/ask" element={<AskAI />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
