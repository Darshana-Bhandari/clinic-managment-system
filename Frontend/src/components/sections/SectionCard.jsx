import React from 'react';

/** Titled panel used to frame dashboard widgets. */
const SectionCard = ({ title, subtitle, action, children, className = '', bodyClassName = '' }) => (
  <section className={`card flex min-w-0 flex-col ${className}`}>
    {(title || action) && (
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div>
          {title && <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </header>
    )}
    <div className={`flex-1 p-5 ${bodyClassName}`}>{children}</div>
  </section>
);

export default SectionCard;