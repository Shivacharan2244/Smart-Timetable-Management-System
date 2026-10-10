import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  RefreshCw,
  CheckCheck,
  Calendar,
  Radio,
  Video,
  Upload
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await notificationService.getAll();
      setNotifications(response.data || []);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to fetch campus notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, readStatus: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'TIMETABLE_UPLOAD':
        return <Upload className="w-4 h-4 text-indigo-600" />;
      case 'MEETING':
        return <Video className="w-4 h-4 text-purple-600" />;
      case 'CLASS_CANCEL':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'ROOM_CHANGE':
        return <Radio className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <Bell className="w-3.5 h-3.5 text-indigo-600" />
            <span>Campus Broadcast Feed</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Institutional Notifications & Broadcasts
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time alerts for timetable uploads, schedule adjustments, meeting notices, and room reassignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="btn btn-secondary text-xs flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All as Read</span>
            </button>
          )}
          <button
            type="button"
            onClick={fetchNotifications}
            disabled={loading}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Unread banner */}
      <div className="card p-3.5 flex items-center justify-between border-l-4 border-l-indigo-600 bg-white border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              {unreadCount > 0 ? `${unreadCount} Unread Notifications` : 'All Alerts Caught Up!'}
            </h3>
            <p className="text-[11px] text-slate-400">
              Automated notifications generated across institutional timetable operations.
            </p>
          </div>
        </div>
        <span className="badge badge-primary text-xs font-semibold">
          {notifications.length} Total Alerts
        </span>
      </div>

      {/* Notifications List */}
      <div className="card divide-y divide-slate-100 overflow-hidden bg-white border border-slate-200">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
            Fetching notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Bell className="w-7 h-7 mx-auto mb-2 opacity-30 text-indigo-600" />
            No campus notifications generated yet.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.notificationId}
              className={`p-3.5 transition-colors flex items-start justify-between gap-4 ${
                !n.readStatus ? 'bg-indigo-50/20' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-slate-50 border border-slate-200 mt-0.5">
                  {getTypeIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">
                      {n.title}
                    </h4>
                    {!n.readStatus && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                    <span className="badge badge-secondary text-[10px] py-0 px-1.5">
                      {n.type || 'SYSTEM'}
                    </span>
                  </div>
                </div>
              </div>

              {!n.readStatus && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(n.notificationId)}
                  className="btn btn-secondary btn-sm shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
