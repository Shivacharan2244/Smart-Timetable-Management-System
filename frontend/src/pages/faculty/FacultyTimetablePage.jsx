import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { timetableService, facultyService, metadataService } from '../../services/api';
import { format12HourRange } from '../../utils/formatters';
import {
  CalendarDays,
  Clock,
  BookOpen,
  MapPin,
  Users,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  DoorOpen,
  X
} from 'lucide-react';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function FacultyTimetablePage() {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const fetchFacultySchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      let resolvedFacultyId = currentUser?.facultyId;

      const [slotsRes, allFacRes] = await Promise.all([
        metadataService.getTimeSlots().catch(() => ({ data: [] })),
        facultyService.getAll().catch(() => ({ data: [] }))
      ]);

      const slots = slotsRes.data || [];
      setTimeSlots(slots.sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0)));

      // If facultyId is not in auth context directly, look up by email
      if (!resolvedFacultyId && currentUser?.email && allFacRes.data) {
        const matched = allFacRes.data.find(
          (f) => f.email?.toLowerCase() === currentUser.email?.toLowerCase()
        );
        if (matched) {
          resolvedFacultyId = matched.facultyId;
          setFacultyInfo(matched);
        }
      } else if (resolvedFacultyId) {
        const singleFacRes = await facultyService.getById(resolvedFacultyId);
        if (singleFacRes.success) {
          setFacultyInfo(singleFacRes.data);
        }
      }

      if (resolvedFacultyId) {
        const entriesRes = await timetableService.getEntriesByFaculty(resolvedFacultyId);
        if (entriesRes.success && entriesRes.data) {
          setEntries(entriesRes.data);
        }
      } else {
        setError('No active faculty profile linked to this user account.');
      }
    } catch (err) {
      console.error('Error fetching faculty timetable:', err);
      setError('Failed to fetch personal timetable schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultySchedule();
  }, [currentUser]);

  // Helper to find entries for slot and day
  const getCellEntries = (day, slot) => {
    return entries.filter(
      (e) =>
        e.dayOfWeek === day &&
        (e.timeSlotId === slot.timeSlotId ||
          (e.startTime === slot.startTime && e.periodNumber === slot.periodNumber))
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
            <span>Personal Academic Allocation</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            My Weekly Timetable Matrix
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {facultyInfo
              ? `${facultyInfo.facultyName} (${facultyInfo.facultyCode}) • ${facultyInfo.departmentName || 'Engineering'}`
              : 'Weekly teaching matrix and classroom duties'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchFacultySchedule}
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
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 border-l-4 border-l-indigo-600 bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Weekly Periods</span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">
            {entries.length}
          </div>
          <span className="text-[10px] text-slate-400">Total allocated classes</span>
        </div>

        <div className="card p-3 border-l-4 border-l-emerald-500 bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Teaching Hours</span>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600 font-mono">
            {entries.length} hrs
          </div>
          <span className="text-[10px] text-slate-400">Weekly contact load</span>
        </div>

        <div className="card p-3 border-l-4 border-l-sky-500 bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Distinct Subjects</span>
          <div className="mt-1 text-2xl font-extrabold text-sky-600 font-mono">
            {new Set(entries.map((e) => e.subjectCode || e.subjectName)).size}
          </div>
          <span className="text-[10px] text-slate-400">Curriculum courses</span>
        </div>
      </div>

      {/* Monday -> Saturday Grid */}
      <div className="card overflow-hidden bg-white border border-slate-200">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>PERSONAL TEACHING SCHEDULE (MONDAY – SATURDAY)</span>
          <span className="text-slate-500">
            Click any cell to view syllabus and section specifics
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="timetable-grid-table">
            <thead>
              <tr>
                <th className="time-header">Time / Period</th>
                {DAYS.map((day) => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
                    Loading personal timetable...
                  </td>
                </tr>
              ) : timeSlots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    No lecture periods configured in system.
                  </td>
                </tr>
              ) : (
                timeSlots.map((slot) => (
                  <tr key={slot.timeSlotId}>
                    <td className="timetable-period-th">
                      <div className="period-title font-bold text-slate-800">Period {slot.periodNumber}</div>
                      <div className="period-time-range font-mono text-[11px] text-slate-600 whitespace-nowrap font-semibold mt-0.5">
                        {format12HourRange(slot.startTime, slot.endTime)}
                      </div>
                    </td>

                    {DAYS.map((day) => {
                      const cellEntries = getCellEntries(day, slot);
                      return (
                        <td key={day}>
                          {cellEntries.length === 0 ? (
                            <div className="timetable-cell-empty p-2 flex items-center justify-center">
                              <span className="text-[11px] font-semibold text-slate-300">Free Period</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {cellEntries.map((e) => (
                                <div
                                  key={e.entryId}
                                  onClick={() => setSelectedEntry(e)}
                                  className="timetable-cell-compact"
                                  title="Click to view details"
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <span className="timetable-cell-subject">
                                      {e.subjectName}
                                    </span>
                                    <span className="timetable-cell-code">
                                      {e.subjectCode || 'LEC'}
                                    </span>
                                  </div>

                                  <div className="timetable-cell-footer mt-2">
                                    <span className="timetable-cell-room">
                                      <DoorOpen className="w-2.5 h-2.5 text-slate-400" />
                                      <span>Room {e.roomNumber}</span>
                                    </span>
                                    <span className="badge badge-primary text-[9px] py-0 px-1 font-mono">
                                      {e.sectionName}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <span className="badge badge-primary text-xs">{selectedEntry.dayOfWeek}</span>
                <span className="badge badge-secondary text-xs">Period {selectedEntry.periodNumber}</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedEntry(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedEntry.subjectName}</h3>
                <span className="font-mono text-xs text-indigo-600 font-bold">
                  Code: {selectedEntry.subjectCode || '—'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-md border border-slate-200">
                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Cohort Section</div>
                  <div className="font-bold text-indigo-700 mt-0.5">{selectedEntry.sectionName}</div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Location</div>
                  <div className="font-bold text-slate-900 mt-0.5">Room {selectedEntry.roomNumber}</div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Time Window</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {format12HourRange(selectedEntry.startTime, selectedEntry.endTime)}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Status</div>
                  <div className="mt-0.5">
                    <span className="badge badge-success text-xs font-semibold">{selectedEntry.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="btn btn-primary text-xs"
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
