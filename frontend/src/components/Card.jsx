export default function Card({ title, icon: Icon, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || Icon) && (
        <header className="flex items-center gap-3 mb-4">
          {Icon && (
            <div className="w-9 h-9 rounded-lg bg-brand-500/15 border border-brand-500/30 grid place-items-center text-brand-300">
              <Icon size={18} />
            </div>
          )}
          {title && <h3 className="section-title">{title}</h3>}
        </header>
      )}
      {children}
    </section>
  );
}
