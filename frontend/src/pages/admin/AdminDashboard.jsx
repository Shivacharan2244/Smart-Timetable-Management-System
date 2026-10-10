import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  dashboardService,
  liveClassService,
  timetableService,
  uploadService,
  meetingService
} from '../../services/api';
import { format12HourRange } from '../../utils/formatters';
import {
  Users,
  BookOpen,
  DoorOpen,
  Layers,
  CalendarCheck,
  Radio,
  Video,
  Upload,
  UserCheck,
  FileBarChart2,
  RefreshCw,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle2,
  Play,
  CalendarDays,
  ShieldCheck,
  History
} from 'lucide-react';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalFaculty: 0,
    totalSubjects: 0,
    totalRooms: 0,
    totalSections: 0,
    totalTimetableEntries: 0,
    activeClasses: 0,
    upcomingMeetings: 0,
  });

  const [todayClasses, setTodayClasses] = useState([]);
  const [scheduleEntries, setScheduleEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveTab, setLiveTab] = useState('RUNNING'); // 'RUNNING' (default: only currently active classes) or 'ALL'

  // Formatted date and day
  const todayDateObj = new Date();
  const currentFormattedDate = todayDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const todayDayName = todayDateObj.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const activeDay = DAYS.includes(todayDayName) ? todayDayName : 'MONDAY';

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, liveRes, todayTtRes] = await Promise.all([
        dashboardService.getSummary(),
        liveClassService.getAll().catch(() => ({ data: [] })),
        timetableService.getEntriesByDay(activeDay).catch(() => ({ data: [] }))
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      setTodayClasses(liveRes.data || []);
      setScheduleEntries(todayTtRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
      setError('Unable to fetch live database statistics. Please ensure backend is reachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const runningClasses = todayClasses.filter((c) => (c.status || '').toUpperCase() === 'RUNNING');
  const displayedLiveClasses = liveTab === 'RUNNING' ? runningClasses : todayClasses;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="badge badge-success font-bold text-xs">
            🟢 Running
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="badge badge-warning font-bold text-xs">
            🟡 Upcoming
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="badge badge-secondary font-medium text-xs">
            ⚪ Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="badge badge-danger font-bold text-xs">
            🔴 Cancelled
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="badge badge-success font-bold text-xs">
            🟢 Active
          </span>
        );
      default:
        return <span className="badge badge-secondary text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Greeting & Date (Item 17 from prompt) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-white border border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Good Morning, Admin
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {currentFormattedDate} • Smart Academic Operations Center Live
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadDashboardData}
            disabled={loading}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Row (Compact, Enterprise, Item 17 from prompt) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        <div className="card p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Faculty</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">
            {stats.totalFaculty || 0}
          </div>
          <span className="text-[10px] text-slate-400">Teaching Staff</span>
        </div>

        <div className="card p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Subjects</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">
            {stats.totalSubjects || 0}
          </div>
          <span className="text-[10px] text-slate-400">Curriculum Courses</span>
        </div>

        <div className="card p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Rooms</span>
            <DoorOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">
            {stats.totalRooms || 0}
          </div>
          <span className="text-[10px] text-slate-400">Halls & Labs</span>
        </div>

        <div className="card p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sections</span>
            <Layers className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">
            {stats.totalSections || 0}
          </div>
          <span className="text-[10px] text-slate-400">Student Cohorts</span>
        </div>

        <div className="card p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Lectures</span>
            <Radio className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-1 text-2xl font-extrabold text-amber-600 font-mono">
            {runningClasses.length > 0 ? runningClasses.length : stats.activeClasses || 0}
          </div>
          <span className="text-[10px] text-slate-400">In Session Now</span>
        </div>

        <div className="card p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Periods</span>
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-1 text-2xl font-extrabold text-indigo-600 font-mono">
            {stats.totalTimetableEntries || 0}
          </div>
          <span className="text-[10px] text-slate-400">Scheduled In MySQL</span>
        </div>
      </div>

      {/* Quick Actions Bar (Item 17 from prompt) */}
      <div className="card p-3.5 bg-white border border-slate-200">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Operations Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/upload')}
            className="p-2.5 rounded-md border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all text-left flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Upload className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Upload Timetable</span>
              <span className="text-[10px] text-slate-400">Parse College PDF</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/free-faculty')}
            className="p-2.5 rounded-md border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-left flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Find Free Faculty</span>
              <span className="text-[10px] text-slate-400">Availability Matrix</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/meetings')}
            className="p-2.5 rounded-md border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 transition-all text-left flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Video className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Schedule Meeting</span>
              <span className="text-[10px] text-slate-400">Clash-Free Booking</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/reports')}
            className="p-2.5 rounded-md border border-slate-200 hover:border-sky-500 hover:bg-sky-50/40 transition-all text-left flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <FileBarChart2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">View Reports</span>
              <span className="text-[10px] text-slate-400">Workload & Occupancy</span>
            </div>
          </button>
        </div>
      </div>

      {/* Today's Schedule Table (Item 17 from prompt) */}
      <div className="card overflow-hidden bg-white border border-slate-200">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>TODAY'S SCHEDULE ({activeDay})</span>
          </div>
          <Link to="/admin/timetable" className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">
            <span>View Master Timetable</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Subject</th>
                <th>Faculty</th>
                <th>Room</th>
                <th>Section</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
                    Loading today's schedule...
                  </td>
                </tr>
              ) : scheduleEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No timetable schedule entries registered for {activeDay}.
                  </td>
                </tr>
              ) : (
                scheduleEntries.slice(0, 10).map((e) => (
                  <tr key={e.entryId} className="hover:bg-slate-50">
                    <td className="font-mono text-xs font-bold text-slate-700 whitespace-nowrap">
                      {format12HourRange(e.startTime, e.endTime)} (P{e.periodNumber})
                    </td>
                    <td>
                      <div className="font-bold text-slate-900 text-xs">{e.subjectName}</div>
                      <span className="font-mono text-[10px] text-indigo-600">{e.subjectCode || 'LEC'}</span>
                    </td>
                    <td className="text-xs text-slate-700 font-medium">{e.facultyName}</td>
                    <td>
                      <span className="badge badge-secondary text-xs">Room {e.roomNumber}</span>
                    </td>
                    <td>
                      <span className="badge badge-primary text-xs">{e.sectionName}</span>
                    </td>
                    <td>{getStatusBadge(e.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Campus Operations Table (Item 17 from prompt) */}
      <div className="card overflow-hidden bg-white border border-slate-200">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="font-bold tracking-tight">LIVE CAMPUS OPERATIONS</span>
            </div>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-200/80 border border-slate-300/50">
              <button
                type="button"
                onClick={() => setLiveTab('RUNNING')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${
                  liveTab === 'RUNNING'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Currently Running ({runningClasses.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setLiveTab('ALL')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  liveTab === 'ALL'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>All Today's Schedule ({todayClasses.length})</span>
              </button>
            </div>
          </div>
          <Link to="/admin/live-classes" className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">
            <span>Manage All Live Classes</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Time</th>
                <th>Subject</th>
                <th>Faculty</th>
                <th>Room</th>
                <th>Section</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
                    Loading live sessions...
                  </td>
                </tr>
              ) : displayedLiveClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <Radio className="w-8 h-8 text-slate-300" />
                      <div className="text-sm font-semibold text-slate-700">
                        {liveTab === 'RUNNING'
                          ? 'No lecture sessions currently running right now'
                          : 'No lecture sessions scheduled for today'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {liveTab === 'RUNNING'
                          ? 'Sessions will automatically appear here when their period is active.'
                          : 'There are no active entries in the timetable for today.'}
                      </div>
                      {liveTab === 'RUNNING' && todayClasses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setLiveTab('ALL')}
                          className="btn btn-secondary text-xs mt-1"
                        >
                          View All Today's Scheduled Classes ({todayClasses.length})
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                displayedLiveClasses.slice(0, 15).map((c) => (
                  <tr key={c.liveClassId} className="hover:bg-slate-50">
                    <td>{getStatusBadge(c.status)}</td>
                    <td className="font-mono text-xs font-bold text-slate-700 whitespace-nowrap">
                      {format12HourRange(c.startTime, c.endTime)}
                    </td>
                    <td>
                      <div className="font-bold text-slate-900 text-xs">{c.subjectName}</div>
                      <span className="font-mono text-[10px] text-indigo-600">{c.subjectCode || 'LEC'}</span>
                    </td>
                    <td className="text-xs text-slate-700 font-medium">{c.facultyName}</td>
                    <td>
                      <span className="badge badge-secondary text-xs">Room {c.roomNumber}</span>
                    </td>
                    <td>
                      <span className="badge badge-primary text-xs font-semibold">{c.sectionName}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
