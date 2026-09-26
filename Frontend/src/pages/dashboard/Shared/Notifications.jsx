import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../../../services/notificationService.js';
import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';
import toast from 'react-hot-toast';
import {
  FiBell, FiCheck, FiTrash2, FiCalendar, FiUser, FiDollarSign,
  FiAlertCircle, FiInfo, FiChevronLeft, FiChevronRight, FiInbox,
} from 'react-icons/fi';

const formatTimeAgo = (value) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const iconByType = {
  APPOINTMENT: { Icon: FiCalendar, tone: 'bg-sky-100 text-sky-700' },
  PATIENT: { Icon: FiUser, tone: 'bg-violet-100 text-violet-700' },
  PAYMENT: { Icon: FiDollarSign, tone: 'bg-emerald-100 text-emerald-700' },
  ALERT: { Icon: FiAlertCircle, tone: 'bg-rose-100 text-rose-700' },
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNotifications({
        page: pagination.page,
        limit: pagination.limit,
        ...(filter === 'unread' ? { unread: true } : {}),
      });
      const items = data.notifications || data.notification || data || [];
      setNotifications(Array.isArray(items) ? items : []);
      setUnreadCount(data.unreadCount ?? data.unread ?? items.filter((item) => !item.read).length);
      if (data.pagination) setPagination((current) => ({ ...current, ...data.pagination }));
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unable to load notifications';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [filter, pagination.limit, pagination.page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const updateUnread = (amount) => setUnreadCount((count) => Math.max(0, count + amount));

  const handleMarkAsRead = async (id) => {
    const target = notifications.find((notification) => notification.id === id);
    if (!target || target.read) return;
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item));
    updateUnread(-1);
    try { await markAsRead(id); } catch (err) {
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: false } : item));
      updateUnread(1);
      toast.error(err.response?.data?.message || 'Could not mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!unreadCount) return;
    const previous = notifications;
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    try { await markAllAsRead(); toast.success('All notifications marked as read'); } catch (err) {
      setNotifications(previous);
      setUnreadCount(previous.filter((item) => !item.read).length);
      toast.error(err.response?.data?.message || 'Could not update notifications');
    }
  };

  const handleDelete = async (id) => {
    const previous = notifications;
    const target = previous.find((item) => item.id === id);
    setNotifications((items) => items.filter((item) => item.id !== id));
    if (target && !target.read) updateUnread(-1);
    try { await deleteNotification(id); } catch (err) {
      setNotifications(previous);
      if (target && !target.read) updateUnread(1);
      toast.error(err.response?.data?.message || 'Could not delete notification');
    }
  };

  const handleClearAll = async () => {
    const previous = notifications;
    setNotifications([]);
    setUnreadCount(0);
    try { await clearAllNotifications(); toast.success('Notifications cleared'); } catch (err) {
      setNotifications(previous);
      setUnreadCount(previous.filter((item) => !item.read).length);
      toast.error(err.response?.data?.message || 'Could not clear notifications');
    }
  };

  const visibleLabel = useMemo(() => filter === 'unread' ? 'Unread notifications' : 'All notifications', [filter]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3"><div className="rounded-2xl bg-teal-100 p-3 text-teal-700"><FiBell size={22} /></div><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Updates</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Notifications</h1><p className="mt-1 text-sm text-slate-500">Stay current with your care, appointments, and payments.</p></div></div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={handleMarkAllAsRead} disabled={!unreadCount} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"><FiCheck size={16} /> Mark all read</button><button type="button" onClick={handleClearAll} disabled={!notifications.length} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><FiTrash2 size={16} /> Clear all</button></div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 sm:px-7"><div className="flex gap-5">{['all', 'unread'].map((tab) => <button type="button" key={tab} onClick={() => { setFilter(tab); setPagination((current) => ({ ...current, page: 1 })); }} className={`border-b-2 py-2 text-sm font-semibold capitalize transition ${filter === tab ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>{tab}{tab === 'unread' && unreadCount > 0 && <span className="ml-2 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] text-rose-700">{unreadCount}</span>}</button>)}</div><span className="hidden text-xs text-slate-400 sm:block">{pagination.total || notifications.length} total</span></div>
        {isLoading ? <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div> : error ? <div className="px-6 py-16 text-center"><p className="text-sm text-rose-600">{error}</p><button type="button" onClick={fetchNotifications} className="mt-3 text-sm font-semibold text-teal-700 hover:text-teal-800">Try again</button></div> : !notifications.length ? <div className="px-6 py-20 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400"><FiInbox size={28} /></div><h2 className="font-semibold text-slate-900">You’re all caught up</h2><p className="mt-1 text-sm text-slate-500">{filter === 'unread' ? 'There are no unread notifications.' : 'New updates will appear here.'}</p></div> : <div>{notifications.map((notification) => { const { Icon, tone } = iconByType[notification.type] || { Icon: FiInfo, tone: 'bg-slate-100 text-slate-600' }; return <article key={notification.id} onClick={() => { handleMarkAsRead(notification.id); if (notification.link) navigate(notification.link); }} className={`group flex cursor-pointer gap-3 border-b border-slate-100 px-5 py-4 transition last:border-0 sm:gap-4 sm:px-7 ${notification.read ? 'bg-white hover:bg-slate-50' : 'bg-teal-50/60 hover:bg-teal-50'}`}><div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={18} /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><h3 className={`truncate text-sm ${notification.read ? 'font-medium text-slate-800' : 'font-bold text-slate-900'}`}>{notification.title}</h3>{!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-teal-600" />}</div><p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{notification.message}</p><p className="mt-2 text-xs font-medium text-slate-400">{formatTimeAgo(notification.createdAt)}</p></div><div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:transition group-hover:opacity-100">{!notification.read && <button type="button" onClick={(event) => { event.stopPropagation(); handleMarkAsRead(notification.id); }} className="rounded-lg p-2 text-teal-700 hover:bg-teal-100" title="Mark as read" aria-label="Mark as read"><FiCheck size={16} /></button>}<button type="button" onClick={(event) => { event.stopPropagation(); handleDelete(notification.id); }} className="rounded-lg p-2 text-rose-600 hover:bg-rose-100" title="Delete notification" aria-label="Delete notification"><FiTrash2 size={16} /></button></div></div></div></article>; })}</div>}
        {pagination.totalPages > 1 && <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 sm:px-7"><span className="text-xs font-medium text-slate-500">Page {pagination.page} of {pagination.totalPages}</span><div className="flex gap-2"><button type="button" onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))} disabled={pagination.page === 1} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40" aria-label="Previous page"><FiChevronLeft size={16} /></button><button type="button" onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))} disabled={pagination.page === pagination.totalPages} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40" aria-label="Next page"><FiChevronRight size={16} /></button></div></div>}
      </section>
      <p className="text-center text-xs text-slate-400">{visibleLabel} are kept here so important updates are easy to find.</p>
    </div>
  );
};

export default Notifications;