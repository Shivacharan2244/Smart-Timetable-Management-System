import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  timetableService,
  notificationService,
  liveClassService,
  meetingService,
  facultyService
} from '../../services/api';
import { format12Hour, format12HourRange } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  Bell,
  CheckCircle,
  GraduationCap,
  CalendarDays,
  Radio,
  Video,
  ArrowRight,
  UserCheck,
  AlertCircle,
  RefreshCw,
  DoorOpen
} from 'lucide-react';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function FacultyDashboard() {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const todayDateObj = new Date();
  const todayDayName = todayDateObj.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const activeDay = DAYS.includes(todayDayName) ? todayDayName : 'MONDAY';
  const currentDateFormatted = todayDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const loadFacultyData = async () => {
    setLoading(true);
    try {
      let facId = currentUser?.facultyId;
      let facName = currentUser?.name;

      // Lookup faculty details if id not on currentUser
      if (!facId && currentUser?.email) {
        const facRes = await facultyService.getAll();
        if (facRes.success && facRes.data) {
          const matched = facRes.data.find(
            (f) => f.email?.toLowerCase() === currentUser.email?.toLowerCase()
          );
          if (matched) {
            facId = matched.facultyId;
            facName = matched.facultyName;
            setFacultyInfo(matched);
          }
        }
      } else if (facId) {
        const singleRes = await facultyService.getById(facId);
        if (singleRes.success) setFacultyInfo(singleRes.data);
      }

      const promises = [];

      // 1. Timetable entries for this faculty
      if (facId) {
        promises.push(
          timetableService.getEntriesByFaculty(facId).then((res) => {
            if (res.success && res.data) setEntries(res.data);
          })
        );
      }

      // 2. Notifications
      if (currentUser?.id) {
        promises.push(
          notificationService.getByUser(currentUser.id).then((res) => {
            if (res.success && res.data) setNotifications(res.data);
          })
        );
      }

      // 3. Live classes
      promises.push(
        liveClassService.getToday().then((res) => {
          if (res.success && res.data) {
            const myLive = res.data.filter((c) => {
              if (!c.facultyName || !facName) return false;
              return (
                c.facultyName.toLowerCase().includes(facName.toLowerCase()) ||
                facName.toLowerCase().includes(c.facultyName.toLowerCase())
              );
            });
            setLiveClasses(myLive);
          }
        })
      );

      // 4. Meetings
      if (facId) {
        promises.push(
          meetingService.getByFaculty(facId).then((res) => {
            if (res.success && res.data) setMeetings(res.data);
          })
        );
      }

      await Promise.allSettled(promises);
    } catch (err) {
      console.error('Failed to load faculty portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacultyData();
  }, [currentUser]);

  // Today's classes from timetable
  const todayClasses = entries.filter((e) => e.dayOfWeek === activeDay);

  // Determine current class and next class
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let currentClass = null;
  let nextClass = null;

  for (const item of todayClasses) {
    if (item.startTime && item.endTime) {
      const [sh, sm] = item.startTime.split(':').map(Number);
      const [eh, em] = item.endTime.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;

      if (currentMinutes >= startMin && currentMinutes < endMin) {
        currentClass = item;
      } else if (currentMinutes < startMin && !nextClass) {
        nextClass = item;
      }
    }
  }

  const unreadAlertsCount = notifications.filter((n) => !n.readStatus).length;
  const displayName = facultyInfo?.facultyName || currentUser?.name || 'Faculty Member';

  return (
    <div className="space-y-4">
      {/* Top Greeting (Item 18 from prompt: "Good Morning, Dr. Alan Turing") */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-white border border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Faculty Personal Station</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Good Morning, {displayName}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {currentDateFormatted} • Department: {facultyInfo?.departmentName || 'Engineering & Technology'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadFacultyData}
            disabled={loading}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip (Item 18: Current class, Next class, Today's total classes, Notifications) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Current Class */}
        <div className="card p-3 border-l-4 border-l-emerald-500 bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Class</span>
          <div className="mt-1 text-sm font-bold text-slate-900 truncate">
            {currentClass ? currentClass.subjectName : 'No lecture in progress'}
          </div>
          <span className="text-[10px] text-slate-400">
            {currentClass ? `Room ${currentClass.roomNumber} (${currentClass.sectionName})` : 'Enjoy your preparation interval'}
          </span>
        </div>

        {/* Next Class */}
        <div className="card p-3 border-l-4 border-l-indigo-500 bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Next Class</span>
          <div className="mt-1 text-sm font-bold text-slate-900 truncate">
            {nextClass ? nextClass.subjectName : 'All duties concluded'}
          </div>
          <span className="text-[10px] text-slate-400">
            {nextClass ? `${format12Hour(nextClass.startTime)} at Room ${nextClass.roomNumber}` : 'No further classes today'}
          </span>
        </div>

        {/* Today's Total Classes */}
        <div className="card p-3 border-l-4 border-l-sky-500 bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Classes</span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">
            {todayClasses.length}
          </div>
          <span className="text-[10px] text-slate-400">Scheduled teaching periods</span>
        </div>

        {/* Notifications */}
        <div className="card p-3 border-l-4 border-l-amber-500 bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Notifications</span>
          <div className="mt-1 text-2xl font-extrabold text-amber-600 font-mono">
            {unreadAlertsCount}
          </div>
          <span className="text-[10px] text-slate-400">Unread broadcasts & alerts</span>
        </div>
      </div>

      {/* Today's Timetable Table (Item 18 from prompt: | Time | Subject | Room | Section | Status |) */}
      <div className="card overflow-hidden bg-white border border-slate-200">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>TODAY'S TIMETABLE ({activeDay})</span>
          </div>
          <Link to="/faculty/timetable" className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">
            <span>Full Weekly Schedule</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Subject</th>
                <th>Room</th>
                <th>Section</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
                    Loading personal schedule...
                  </td>
                </tr>
              ) : todayClasses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No teaching periods scheduled for your faculty profile on {activeDay}.
                  </td>
                </tr>
              ) : (
                todayClasses.map((item) => (
                  <tr key={item.entryId} className="hover:bg-slate-50">
                    <td className="font-mono text-xs font-bold text-slate-700 whitespace-nowrap">
                      {format12HourRange(item.startTime, item.endTime)} (P{item.periodNumber})
                    </td>
                    <td>
                      <div className="font-bold text-slate-900 text-xs">{item.subjectName}</div>
                      <span className="font-mono text-[10px] text-indigo-600">{item.subjectCode || 'LEC'}</span>
                    </td>
                    <td>
                      <span className="badge badge-secondary text-xs">Room {item.roomNumber}</span>
                    </td>
                    <td>
                      <span className="badge badge-primary text-xs font-semibold">{item.sectionName}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        item.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'
                      } text-xs font-semibold`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scheduled Meetings Table */}
      {meetings.length > 0 && (
        <div className="card overflow-hidden bg-white border border-slate-200">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-600" />
              <span>YOUR UPCOMING INSTITUTIONAL MEETINGS</span>
            </div>
            <Link to="/faculty/meetings" className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Meeting Title</th>
                  <th>Room</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((m) => (
                  <tr key={m.meetingId} className="hover:bg-slate-50">
                    <td className="font-semibold text-xs text-slate-800">{m.date}</td>
                    <td className="font-mono text-xs font-bold text-slate-700">
                      {format12HourRange(m.startTime, m.endTime)}
                    </td>
                    <td className="font-bold text-xs text-slate-900">{m.title}</td>
                    <td>
                      {m.roomNumber ? (
                        <span className="badge badge-secondary text-xs">Room {m.roomNumber}</span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Virtual / Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-primary text-xs font-semibold">{m.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
