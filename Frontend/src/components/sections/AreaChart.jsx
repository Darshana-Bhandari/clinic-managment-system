import React, { useId, useState } from 'react';

/**
 * Dependency-free stacked-ish area chart (two series).
 * data: [{ day, online, cash }]
 */
const AreaChart = ({ data, height = 220 }) => {
  const gid = useId().replace(/:/g, '');
  const [hover, setHover] = useState(null);

  const w = 720;
  const h = height;
  const padX = 8;
  const padTop = 16;
  const padBottom = 28;

  const totals = data.map((d) => d.online + d.cash);
  const max = Math.max(...totals) * 1.15;
  const stepX = (w - padX * 2) / (data.length - 1);
  const x = (i) => padX + i * stepX;
  const y = (v) => padTop + (1 - v / max) * (h - padTop - padBottom);

  const linePath = (accessor) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(accessor(d)).toFixed(1)}`).join(' ');

  const areaPath = (accessor) =>
    `${linePath(accessor)} L ${x(data.length - 1).toFixed(1)} ${h - padBottom} L ${x(0).toFixed(1)} ${h - padBottom} Z`;

  const totalAcc = (d) => d.online + d.cash;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* gridlines */}
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={g}
            x1={padX}
            x2={w - padX}
            y1={padTop + g * (h - padTop - padBottom)}
            y2={padTop + g * (h - padTop - padBottom)}
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="1"
          />
        ))}

        {/* total area (online + cash) */}
        <path d={areaPath(totalAcc)} fill={`url(#area-${gid})`} />
        <path d={linePath(totalAcc)} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* online line */}
        <path d={linePath((d) => d.online)} fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" opacity="0.9" />

        {/* hover markers */}
        {data.map((d, i) => (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <rect x={x(i) - stepX / 2} y={0} width={stepX} height={h} fill="transparent" />
            {hover === i && (
              <>
                <line x1={x(i)} x2={x(i)} y1={padTop} y2={h - padBottom} className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1" />
                <circle cx={x(i)} cy={y(totalAcc(d))} r="4.5" fill="#0d9488" stroke="#fff" strokeWidth="2" />
              </>
            )}
          </g>
        ))}
      </svg>

      {/* x labels (first, middle, last) */}
      <div className="mt-1 flex justify-between px-1 text-[11px] text-slate-400">
        <span>{data[0].day}</span>
        <span>{data[Math.floor(data.length / 2)].day}</span>
        <span>{data[data.length - 1].day}</span>
      </div>

      {/* tooltip */}
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900"
          style={{ left: `${(x(hover) / w) * 100}%`, transform: 'translateX(-50%)' }}
        >
          <p className="font-semibold text-slate-900 dark:text-white">{data[hover].day}</p>
          <p className="mt-1 flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-primary-600" /> Total: Rs. {(data[hover].online + data[hover].cash).toLocaleString('en-IN')}
          </p>
          <p className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-sky-400" /> Online: Rs. {data[hover].online.toLocaleString('en-IN')}
          </p>
        </div>
      )}
    </div>
  );
};

export default AreaChart;