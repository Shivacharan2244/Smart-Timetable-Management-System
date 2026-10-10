import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  facultyService,
  metadataService
} from '../../services/api';
import { format12HourRange } from '../../utils/formatters';
import {
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Clock,
  Video,
  AlertCircle,
  Building,
  User,
  X,
  DoorOpen,
  BookOpen,
  Zap,
  CheckCircle,
  Radio,
  Sparkles,
  ArrowRight,
  Moon
} from 'lucide-react';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

// Helper to reliably get Day of Week from YYYY-MM-DD in local timezone
const getDayFromDateString = (dateStr) => {
  if (!dateStr) return 'MONDAY';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return 'MONDAY';
  const [y, m, d] = parts;
  const localDate = new Date(y, m - 1, d);
  const dayName = localDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  return DAYS.includes(dayName) ? dayName : 'MONDAY';
};

// Check if current time is outside college timetable hours (09:00 AM – 04:05 PM)
const isCurrentTimePastCollegeHours = () => {
  const now = new Date();
  const curMin = now.getHours() * 60 + now.getMinutes();
  const collegeStartMin = 9 * 60;      // 09:00 AM = 540 min
  const collegeEndMin = 16 * 60 + 5;   // 04:05 PM = 965 min
  return curMin > collegeEndMin || curMin < collegeStartMin;
};

export default function FreeFacultyPage() {
  const navigate = useNavigate();

  // Date defaults to today
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  // Day of week automatically computed from selected date
  const [day, setDay] = useState(() => getDayFromDateString(new Date().toISOString().split('T')[0]));

  // Selected time slot: '' means default to present timeslot
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [statusFilter, setStatusFilter] = useState('FREE'); // DEFAULT TO FREE FACULTY ONLY!
  const [searchQuery, setSearchQuery] = useState('');

  const [currentTimeStr, setCurrentTimeStr] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Dropdown options
  const [departments, setDepartments] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  // Results
  const [facultyMatrix, setFacultyMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Selected faculty for detail modal
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Sort time slots numerically: Period 1 through Period 7 (concluding at 04:05 PM)
  const sortedTimeSlots = useMemo(() => {
    return [...timeSlots].sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0));
  }, [timeSlots]);

  // Determine which slot matches the current live clock (between 09:00 AM and 04:05 PM)
  const resolveLiveSlot = (slots) => {
    if (!slots || slots.length === 0) return null;
    const now = new Date();
    const curMin = now.getHours() * 60 + now.getMinutes();

    for (const s of slots) {
      if (s.startTime && s.endTime) {
        const [sh, sm] = s.startTime.split(':').map(Number);
        const [eh, em] = s.endTime.split(':').map(Number);
        const sMin = sh * 60 + sm;
        const eMin = eh * 60 + em;
        if (curMin >= sMin && curMin < eMin) {
          return s;
        }
      }
    }
    return null;
  };

  const activeLiveSlot = resolveLiveSlot(sortedTimeSlots);
  const isPastCollegeHours = isCurrentTimePastCollegeHours();
  const isPresentSlotMode = !selectedSlotId; // When no specific slot is selected, default to present timeslot

  // Ticking 1-second clock display
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Load initial options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [deptsRes, slotsRes] = await Promise.all([
          metadataService.getDepartments().catch(() => ({ data: [] })),
          metadataService.getTimeSlots().catch(() => ({ data: [] }))
        ]);
        setDepartments(deptsRes.data || []);
        const rawSlots = slotsRes.data || [];
        setTimeSlots(rawSlots);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch matrix whenever date, day, selectedSlotId, or department changes
  const fetchMatrix = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const params = {
        date,
        day,
        timeSlotId: selectedSlotId || undefined, // undefined triggers backend live/present-timeslot evaluation
        departmentId: selectedDeptId || undefined
      };
      const response = await facultyService.getMatrix(params);
      setFacultyMatrix(response.data || []);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to calculate faculty availability.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, [date, day, selectedSlotId, selectedDeptId]);

  // When user selects a date, the DAY OF WEEK AUTOMATICALLY CHANGES!
  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (newDate) {
      const autoDay = getDayFromDateString(newDate);
      setDay(autoDay);
    }
  };

  // Reset to live present timeslot
  const handleResetToPresentSlot = () => {
    const todayIso = new Date().toISOString().split('T')[0];
    setDate(todayIso);
    setDay(getDayFromDateString(todayIso));
    setSelectedSlotId('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'FREE':
        return (
          <span className="badge badge-success flex items-center gap-1 font-bold text-xs py-1 px-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>🟢 Free</span>
          </span>
        );
      case 'BUSY':
        return (
          <span className="badge badge-danger flex items-center gap-1 font-bold text-xs py-1 px-2.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>🔴 Busy</span>
          </span>
        );
      case 'MEETING':
        return (
          <span className="badge badge-warning flex items-center gap-1 font-bold text-xs py-1 px-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>🟡 In Meeting</span>
          </span>
        );
      case 'OFF_DUTY':
        return (
          <span className="badge badge-secondary flex items-center gap-1 font-semibold text-xs py-1 px-2.5 bg-slate-100 text-slate-500 border border-slate-200">
            <Moon className="w-3 h-3 text-slate-400" />
            <span>Off Duty (Past 4:05 PM)</span>
          </span>
        );
      default:
        return (
          <span className="badge badge-secondary flex items-center gap-1 font-medium text-xs py-1 px-2.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>⚪ Unavailable</span>
          </span>
        );
    }
  };

  const filteredFaculty = facultyMatrix.filter((f) => {
    // Status Filter (By default, only FREE faculty are visible!)
    if (statusFilter !== 'ALL' && f.status !== statusFilter) {
      return false;
    }
    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        (f.facultyName && f.facultyName.toLowerCase().includes(q)) ||
        (f.facultyCode && f.facultyCode.toLowerCase().includes(q)) ||
        (f.departmentName && f.departmentName.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const freeCount = facultyMatrix.filter((f) => f.status === 'FREE').length;
  const busyCount = facultyMatrix.filter((f) => f.status === 'BUSY').length;
  const meetingCount = facultyMatrix.filter((f) => f.status === 'MEETING').length;
  const offDutyCount = facultyMatrix.filter((f) => f.status === 'OFF_DUTY').length;

  const activeSlot = sortedTimeSlots.find((s) => String(s.timeSlotId) === String(selectedSlotId));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Faculty Availability Engine (Bell Hours: 09:00 AM – 04:05 PM)</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Free Faculty Finder</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Live availability during college hours (09:00 AM – 04:05 PM) or scheduled slot inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isPresentSlotMode ? (
            <button
              type="button"
              onClick={fetchMatrix}
              disabled={loading}
              className="btn btn-secondary text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'spin' : ''}`} />
              <span>Refresh Present Slot</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResetToPresentSlot}
              className="btn btn-primary text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Reset to Present Timeslot</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-Time / Selected Slot Banner */}
      <div className={`p-3.5 rounded-lg border transition-all ${
        isPresentSlotMode
          ? isPastCollegeHours
            ? 'bg-slate-50 border-slate-300 text-slate-900'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            {isPresentSlotMode ? (
              isPastCollegeHours ? (
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Moon className="w-4 h-4" />
                </div>
              ) : (
                <span className="relative flex h-3.5 w-3.5 shrink-0 mt-1 sm:mt-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
                </span>
              )
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Calendar className="w-4 h-4" />
              </div>
            )}

            <div>
              <div className="text-xs font-bold flex flex-wrap items-center gap-2">
                <span>
                  {isPresentSlotMode
                    ? isPastCollegeHours
                      ? '🌙 PAST 04:05 PM — COLLEGE HOURS CONCLUDED'
                      : '🟢 LIVE PRESENT TIMESLOT ACTIVE'
                    : `📅 SELECTED TIMESLOT: ${day}, ${activeSlot ? `PERIOD ${activeSlot.periodNumber}` : 'CUSTOM'}`}
                </span>
                <span className="text-slate-300 font-normal">•</span>
                <span className="font-mono text-xs font-extrabold bg-white/90 px-2 py-0.5 rounded border border-slate-200 text-slate-800 shadow-xs">
                  🕒 {currentTimeStr}
                </span>
                <span className="text-slate-300 font-normal">•</span>
                <span className="font-semibold text-slate-700">{day}, {date}</span>
              </div>

              <p className="text-[11px] text-slate-600 mt-1">
                {isPresentSlotMode ? (
                  isPastCollegeHours ? (
                    <>
                      Current time is <strong>{currentTimeStr}</strong> (greater than 04:05 PM). College timetable operating hours run strictly <strong>09:00 AM – 04:05 PM</strong>. Since classes have concluded for today, <strong>no free faculty are shown</strong>. Pick a date and time slot below to inspect faculty availability.
                    </>
                  ) : activeLiveSlot ? (
                    <>
                      Live College Period in session: <strong className="text-slate-900 font-mono">Period {activeLiveSlot.periodNumber} ({format12HourRange(activeLiveSlot.startTime, activeLiveSlot.endTime)})</strong>. Showing faculty who are free right now in this live period.
                    </>
                  ) : (
                    <>
                      Present timeslot between periods. Showing faculty free in the current timetable window.
                    </>
                  )
                ) : (
                  <>
                    Inspecting scheduled availability for <strong className="text-slate-900">{day} ({date})</strong> during <strong className="text-slate-900 font-mono">{activeSlot ? `Period ${activeSlot.periodNumber} (${format12HourRange(activeSlot.startTime, activeSlot.endTime)})` : 'Selected Period'}</strong>. Showing free faculty for this exact slot.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isPresentSlotMode && (
              <button
                type="button"
                onClick={handleResetToPresentSlot}
                className="btn btn-sm btn-secondary text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Default: Present Timeslot</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Period Selector (09:00 AM till 04:05 PM) */}
        {sortedTimeSlots.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 font-semibold">Periods (09:00 AM – 04:05 PM):</span>
            <button
              type="button"
              onClick={handleResetToPresentSlot}
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                isPresentSlotMode
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              ⚡ Present Timeslot (Live)
            </button>
            {sortedTimeSlots.map((s) => {
              const isSelected = selectedSlotId === String(s.timeSlotId);
              return (
                <button
                  key={s.timeSlotId}
                  type="button"
                  onClick={() => setSelectedSlotId(String(s.timeSlotId))}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  P{s.periodNumber} ({format12HourRange(s.startTime, s.endTime)})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Filter Bar */}
      <div className="card p-3.5 bg-white border border-slate-200 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {/* Date Picker (Changing date automatically updates Day of Week!) */}
          <div>
            <label className="label text-[11px] font-bold text-slate-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="input text-xs font-medium"
            />
          </div>

          {/* Day of Week (Automatically synchronized from Date) */}
          <div>
            <label className="label text-[11px] flex items-center justify-between">
              <span className="font-bold text-slate-700">Day of Week</span>
              <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1 py-0.2 rounded">Auto</span>
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="select text-xs font-semibold bg-slate-50 border-indigo-200 text-indigo-900"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d} {d === day ? '✓' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Time Slot (Operating Bell Hours: 09:00 AM – 04:05 PM) */}
          <div>
            <label className="label text-[11px] font-bold text-slate-700">
              Time Slot (Till 04:05 PM)
            </label>
            <select
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              className="select text-xs font-mono font-medium"
            >
              <option value="">⚡ Default: Present Timeslot</option>
              {sortedTimeSlots.map((s) => (
                <option key={s.timeSlotId} value={s.timeSlotId}>
                  P{s.periodNumber} ({format12HourRange(s.startTime, s.endTime)})
                  {s.periodNumber === 7 ? ' [Till 04:05 PM]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="label text-[11px] font-bold text-slate-700">Department</label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="select text-xs"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="label text-[11px] font-bold text-slate-700">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select text-xs font-semibold"
            >
              <option value="FREE">🟢 Free Faculty Only</option>
              <option value="BUSY">🔴 In Class / Busy</option>
              <option value="MEETING">🟡 In Meeting</option>
              <option value="ALL">⚪ All Faculty</option>
            </select>
          </div>

          {/* Search Faculty */}
          <div>
            <label className="label text-[11px] font-bold text-slate-700">Search Faculty</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-8 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Evaluated Window:</span>
            <strong className="text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {activeSlot
                ? `Period ${activeSlot.periodNumber} (${format12HourRange(activeSlot.startTime, activeSlot.endTime)})`
                : isPastCollegeHours
                ? `Present Timeslot (> 04:05 PM: Concluded)`
                : activeLiveSlot
                ? `Period ${activeLiveSlot.periodNumber} (${format12HourRange(activeLiveSlot.startTime, activeLiveSlot.endTime)})`
                : `Live Clock (${currentTimeStr})`}
            </strong>
          </div>

          <button
            type="button"
            onClick={fetchMatrix}
            className="btn btn-primary text-xs flex items-center gap-1.5 shadow-sm"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Recalculate Availability</span>
          </button>
        </div>
      </div>

      {/* Interactive KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('FREE')}
          className={`card p-3.5 border-l-4 border-l-emerald-500 text-left transition-all hover:shadow-md cursor-pointer ${
            statusFilter === 'FREE' ? 'ring-2 ring-emerald-500 bg-emerald-50/40 shadow-sm' : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Free Instructors</span>
            {statusFilter === 'FREE' && (
              <span className="badge badge-success text-[10px] py-0 px-1.5 font-bold">Showing</span>
            )}
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-600 font-mono">
            {freeCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isPresentSlotMode && isPastCollegeHours
              ? 'Past 04:05 PM — No classes in session'
              : 'Available for lectures / substitution'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('BUSY')}
          className={`card p-3.5 border-l-4 border-l-rose-500 text-left transition-all hover:shadow-md cursor-pointer ${
            statusFilter === 'BUSY' ? 'ring-2 ring-rose-500 bg-rose-50/40 shadow-sm' : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Lectures (Busy)</span>
            {statusFilter === 'BUSY' && (
              <span className="badge badge-danger text-[10px] py-0 px-1.5 font-bold">Showing</span>
            )}
          </div>
          <div className="mt-1 text-2xl font-black text-rose-600 font-mono">
            {busyCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Assigned to lecture in slot</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('MEETING')}
          className={`card p-3.5 border-l-4 border-l-amber-500 text-left transition-all hover:shadow-md cursor-pointer ${
            statusFilter === 'MEETING' ? 'ring-2 ring-amber-500 bg-amber-50/40 shadow-sm' : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Meetings</span>
            {statusFilter === 'MEETING' && (
              <span className="badge badge-warning text-[10px] py-0 px-1.5 font-bold">Showing</span>
            )}
          </div>
          <div className="mt-1 text-2xl font-black text-amber-600 font-mono">
            {meetingCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">In departmental / admin meeting</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`card p-3.5 border-l-4 border-l-indigo-500 text-left transition-all hover:shadow-md cursor-pointer ${
            statusFilter === 'ALL' ? 'ring-2 ring-indigo-500 bg-indigo-50/40 shadow-sm' : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Evaluated</span>
            {statusFilter === 'ALL' && (
              <span className="badge badge-primary text-[10px] py-0 px-1.5 font-bold">Showing</span>
            )}
          </div>
          <div className="mt-1 text-2xl font-black text-slate-800 font-mono">
            {facultyMatrix.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Total registered faculty</p>
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-md border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Faculty Availability Professional Roster */}
      <div className="card overflow-hidden bg-white border border-slate-200 shadow-xs">
        {/* Status Pill Tabs & Table Header */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-slate-800 uppercase">
                {statusFilter === 'FREE' && '🟢 AVAILABLE FREE FACULTY'}
                {statusFilter === 'BUSY' && '🔴 FACULTY CURRENTLY IN CLASS / BUSY'}
                {statusFilter === 'MEETING' && '🟡 FACULTY IN SCHEDULED MEETINGS'}
                {statusFilter === 'ALL' && '📋 COMPLETE FACULTY ROSTER & STATUS'}
              </span>
              <span className="badge badge-secondary text-[11px] font-mono">
                {filteredFaculty.length} visible
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {statusFilter === 'FREE' &&
                (isPresentSlotMode && isPastCollegeHours
                  ? 'Past 04:05 PM: College hours have concluded, so no free faculty are active right now.'
                  : 'Displaying only instructors who have NO active classes or conflicting duties in the evaluated period.')}
              {statusFilter === 'BUSY' && 'Displaying instructors who are currently teaching in the evaluated period.'}
              {statusFilter === 'MEETING' && 'Displaying instructors who are attending meetings in the evaluated period.'}
              {statusFilter === 'ALL' && 'Displaying all registered instructors across all availability states.'}
            </p>
          </div>

          {/* Quick Segmented Status Tabs */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setStatusFilter('FREE')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                statusFilter === 'FREE'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300" />
              <span>Free Faculty Only ({freeCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('BUSY')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                statusFilter === 'BUSY'
                  ? 'bg-rose-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-300" />
              <span>In Class ({busyCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('MEETING')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                statusFilter === 'MEETING'
                  ? 'bg-amber-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-300" />
              <span>In Meeting ({meetingCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                statusFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All ({facultyMatrix.length})</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Faculty Code</th>
                <th>Faculty Name</th>
                <th>Department</th>
                <th>Current Duty / Lecture</th>
                <th>Room</th>
                <th className="text-right">Today's Classes</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
                    Calculating faculty availability matrix...
                  </td>
                </tr>
              ) : filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    {isPresentSlotMode && isPastCollegeHours && statusFilter === 'FREE' ? (
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto border border-slate-200">
                          <Moon className="w-6 h-6 text-slate-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">
                            No Free Faculty Shown (Past 04:05 PM)
                          </h3>
                          <p className="text-xs text-slate-600 mt-1">
                            Current time is <strong>{currentTimeStr}</strong> (greater than 04:05 PM). College timetable operating hours run strictly <strong>09:00 AM – 04:05 PM</strong>.
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            All scheduled periods have concluded for the day. To inspect free faculty for any specific period or date, select from the options below:
                          </p>
                        </div>
                        <div className="pt-2 flex flex-wrap justify-center gap-1.5">
                          {sortedTimeSlots.map((s) => (
                            <button
                              key={s.timeSlotId}
                              type="button"
                              onClick={() => setSelectedSlotId(String(s.timeSlotId))}
                              className="btn btn-secondary btn-sm text-xs font-mono"
                            >
                              P{s.periodNumber} ({format12HourRange(s.startTime, s.endTime)})
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-sm mx-auto space-y-2">
                        <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-700 text-xs">
                          No faculty records found for the chosen filter criteria.
                        </p>
                        {statusFilter !== 'ALL' && (
                          <button
                            type="button"
                            onClick={() => setStatusFilter('ALL')}
                            className="btn btn-secondary btn-sm text-xs"
                          >
                            Show All Faculty Instead
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((f) => (
                  <tr
                    key={f.facultyId}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedFaculty(f);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <td>{getStatusBadge(f.status)}</td>
                    <td className="font-mono text-xs font-semibold text-slate-600 whitespace-nowrap">
                      {f.facultyCode}
                    </td>
                    <td>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[170px]">{f.facultyName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[190px]">
                        {f.email}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-secondary text-xs truncate max-w-[160px] inline-block">
                        {f.departmentName || 'General'}
                      </span>
                    </td>
                    <td className="text-xs max-w-[220px]">
                      {f.currentClass ? (
                        <div className="font-semibold text-slate-800 truncate" title={f.currentClass}>
                          {f.currentClass}
                        </div>
                      ) : (
                        <span className="text-emerald-600 font-semibold italic flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 inline text-emerald-500" />
                          <span>Available (Free from lecture)</span>
                        </span>
                      )}
                    </td>
                    <td className="text-xs whitespace-nowrap">
                      {f.currentClass && f.currentClass.includes('Room') ? (
                        <span className="badge badge-secondary text-xs font-mono">
                          {f.currentClass.split('Room ')[1]?.split(')')[0] || 'Assigned'}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="text-right font-mono font-bold text-slate-800 text-xs whitespace-nowrap">
                      <span className="badge badge-secondary text-xs font-mono font-bold">
                        {f.todayWorkload || 0} classes
                      </span>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {f.status === 'FREE' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/meetings?facultyId=${f.facultyId}&date=${date}`);
                          }}
                          className="btn btn-primary btn-sm flex items-center gap-1 ml-auto shadow-xs text-xs font-semibold"
                        >
                          <Video className="w-3 h-3" />
                          <span>Schedule Meeting</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFaculty(f);
                            setIsDetailModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm ml-auto text-xs"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Faculty Details Modal */}
      {isDetailModalOpen && selectedFaculty && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <span className="badge badge-primary text-xs font-mono">{selectedFaculty.facultyCode}</span>
                <span>{getStatusBadge(selectedFaculty.status)}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="modal-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedFaculty.facultyName}</h3>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedFaculty.email} • {selectedFaculty.departmentName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-md border border-slate-200">
                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Faculty Code</div>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">{selectedFaculty.facultyCode}</div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Department</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedFaculty.departmentName}</div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Current Assignment</div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {selectedFaculty.currentClass || 'Free / No class active'}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Current Room</div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {selectedFaculty.currentClass && selectedFaculty.currentClass.includes('Room')
                      ? selectedFaculty.currentClass.split('Room ')[1]?.split(')')[0]
                      : '—'}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Today's Total Workload</div>
                  <div className="font-bold text-slate-900 mt-0.5 font-mono">
                    {selectedFaculty.todayWorkload || 0} scheduled classes
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Evaluated Period</div>
                  <div className="font-semibold text-indigo-700 mt-0.5 font-mono">
                    {activeSlot
                      ? format12HourRange(activeSlot.startTime, activeSlot.endTime)
                      : isPastCollegeHours
                      ? 'Concluded (> 04:05 PM)'
                      : activeLiveSlot
                      ? format12HourRange(activeLiveSlot.startTime, activeLiveSlot.endTime)
                      : `Live Clock (${currentTimeStr})`}
                  </div>
                </div>
              </div>

              {selectedFaculty.status === 'FREE' && (
                <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>This instructor is free and available for appointments or substitute lectures during this period.</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {selectedFaculty.status === 'FREE' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    navigate(`/admin/meetings?facultyId=${selectedFaculty.facultyId}&date=${date}`);
                  }}
                  className="btn btn-primary text-xs mr-auto flex items-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Schedule Meeting With Faculty</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="btn btn-secondary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
