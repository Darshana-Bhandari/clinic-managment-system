import React from 'react';

/**
 * Horizontal ranked bar list.
 * items: [{ name, dept, count, initials }]
 */
const BarList = ({ items, unit = '' }) => {
  const max = Math.max(...items.map((i) => i.count)) || 1;

  return (
    <ul className="space-y-4">
      {items.map((it) => (
        <li key={it.name}>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              {it.initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{it.name}</p>
                <p className="shrink-0 text-sm font-bold text-slate-900 dark:text-white">
                  {it.count}
                  {unit && <span className="ml-1 text-xs font-normal text-slate-400">{unit}</span>}
                </p>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
                    style={{ width: `${(it.count / max) * 100}%` }}
                  />
                </div>
                <span className="w-24 shrink-0 truncate text-xs text-slate-400">{it.dept}</span>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default BarList;