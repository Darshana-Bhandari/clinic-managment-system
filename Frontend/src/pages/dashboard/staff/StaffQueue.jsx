import React, { useState } from 'react';
import { PhoneCall, Clock, Users2, Check } from 'lucide-react';
import SectionCard from '../../../components/sections/SectionCard';
import { liveQueue as initialQueue } from '../../../utils/dashboardData';

const getNextToken = (token) => {
  const [p, n] = token.split('-');
  return `${p}-${String(Number(n) + 1).padStart(2, '0')}`;
};

const Queue = () => {
  const [queueState, setQueueState] = useState(initialQueue);
  const [calledNotice, setCalledNotice] = useState('');

  const handleCallNext = (index) => {
    const updated = [...queueState];
    const item = updated[index];
    const currentNum = parseInt(item.current.split('-')[1]);
    const nextToken = `${item.current.split('-')[0]}-${String(currentNum + 1).padStart(2, '0')}`;
    
    item.current = nextToken;
    if (item.waiting > 0) {
      item.waiting -= 1;
    }

    setQueueState(updated);
    setCalledNotice(`Calling token ${nextToken} for ${item.doctor}!`);
    setTimeout(() => setCalledNotice(''), 3500);
  };

  return (
    <div className="space-y-6">
      {calledNotice && (
        <div className="animate-in fade-in flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
          <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold">{calledNotice}</span>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        Live queue is broadcasting over WebSocket — patients see updates on their phones instantly.
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {queueState.map((q, idx) => (
          <SectionCard key={q.doctor} title={q.doctor} subtitle={q.dept}>
            <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-center text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-100">Now serving</p>
              <p className="mt-1 font-display text-5xl font-extrabold">{q.current}</p>
              <p className="mt-1 text-sm text-primary-100">Next: {getNextToken(q.current)}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 p-3 dark:border-slate-800">
                <Users2 className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="font-display text-lg font-bold text-slate-900 dark:text-white">{q.waiting}</p>
                  <p className="text-[11px] text-slate-400">in queue</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 p-3 dark:border-slate-800">
                <Clock className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="font-display text-lg font-bold text-slate-900 dark:text-white">{q.eta.replace('~', '')}</p>
                  <p className="text-[11px] text-slate-400">est. wait</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCallNext(idx)}
              className="btn btn-primary btn-full mt-4 flex items-center justify-center gap-2"
            >
              <PhoneCall className="h-4 w-4" /> Call next patient
            </button>
          </SectionCard>
        ))}
      </div>
    </div>
  );
};

export default Queue;