import { useState } from 'react';

/**
 * Simple controlled tabs. `tabs` = [{ id, label, icon }]
 */
export default function SectionTabs({ tabs, value, onChange }) {
  const [internal, setInternal] = useState(tabs[0]?.id);
  const active = value ?? internal;
  const setActive = onChange ?? setInternal;

  return (
    <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActive(id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
            active === id
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          {Icon && <Icon size={14} />} {label}
        </button>
      ))}
    </div>
  );
}
