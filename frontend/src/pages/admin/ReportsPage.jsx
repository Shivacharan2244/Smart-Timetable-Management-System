import React, { useState, useEffect } from 'react';
import {
  reportsService,
  timetableService,
  meetingService
} from '../../services/api';
import { format12HourRange } from '../../utils/formatters';
import {
  FileBarChart2,
  Users,
  DoorOpen,
  Calendar,
  AlertTriangle,
  Video,
  RefreshCw,
  Clock,
  Building,
  CheckCircle2,
  Search,
  Filter
} from 'lucide-react';

const TABS = ['WORKLOAD', 'ROOM_UTILIZATION', 'SCHEDULE_SUMMARY', 'MEETINGS_SUMMARY'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('WORKLOAD');
  const [overview, setOverview] = useState(null);
  const [facultyWorkload, setFacultyWorkload] = useState([]);
  const [roomUtilization, setRoomUtilization] = useState([]);
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Search filter inside reports
  const [reportSearch, setReportSearch] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [ovRes, fwRes, ruRes, ttRes, mtRes] = await Promise.all([
        reportsService.getOverview().catch(() => ({ data: null })),
        reportsService.getFacultyWorkload().catch(() => ({ data: [] })),
        reportsService.getRoomUtilization().catch(() => ({ data: [] })),
        timetableService.getAllEntries().catch(() => ({ data: [] })),
        meetingService.getAll().catch(() => ({ data: [] }))
      ]);

      setOverview(ovRes.data);
      setFacultyWorkload(fwRes.data || []);
      setRoomUtilization(ruRes.data || []);
      setTimetableEntries(ttRes.data || []);
      setMeetings(mtRes.data || []);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to load report analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filtered lists
  const filteredWorkload = facultyWorkload.filter((f) => {
    if (!reportSearch) return true;
    const q = reportSearch.toLowerCase();
    return (
      (f.facultyName && f.facultyName.toLowerCase().includes(q)) ||
      (f.facultyCode && f.facultyCode.toLowerCase().includes(q)) ||
      (f.departmentName && f.departmentName.toLowerCase().includes(q))
    );
  });

  const filteredRooms = roomUtilization.filter((r) => {
    if (!reportSearch) return true;
    const q = reportSearch.toLowerCase();
    return (
      (r.roomNumber && String(r.roomNumber).toLowerCase().includes(q)) ||
      (r.roomType && r.roomType.toLowerCase().includes(q))
    );
  });

  const filteredTimetable = timetableEntries.filter((t) => {
    if (selectedSectionFilter && t.sectionName !== selectedSectionFilter) return false;
    if (!reportSearch) return true;
    const q = reportSearch.toLowerCase();
    return (
      (t.subjectName && t.subjectName.toLowerCase().includes(q)) ||
      (t.facultyName && t.facultyName.toLowerCase().includes(q)) ||
      (t.roomNumber && String(t.roomNumber).toLowerCase().includes(q)) ||
      (t.sectionName && t.sectionName.toLowerCase().includes(q))
    );
  });

  const uniqueSections = Array.from(new Set(timetableEntries.map((e) => e.sectionName).filter(Boolean)));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <FileBarChart2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Audit & Analytical Intelligence</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Institutional Reports & Resource Allocation
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchReports}
            disabled={loading}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip (Item 19 from prompt) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-3 border-l-4 border-l-indigo-600 bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Scheduled Hours</span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">
            {overview?.totalScheduledHours ?? 0} <span className="text-xs font-normal text-slate-400">hrs/week</span>
          </div>
          <span className="text-[10px] text-slate-400">Across all academic sections</span>
        </div>

        <div className="card p-3 border-l-4 border-l-emerald-500 bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Faculty Workload</span>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600 font-mono">
            {overview?.averageFacultyWorkloadHours ?? 0} <span className="text-xs font-normal text-slate-400">hrs/faculty</span>
          </div>
          <span className="text-[10px] text-slate-400">Active teaching staff</span>
        </div>

        <div className="card p-3 border-l-4 border-l-sky-500 bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Room Utilization</span>
          <div className="mt-1 text-2xl font-extrabold text-sky-600 font-mono">
            {overview?.averageRoomUtilizationPercent ?? 0}%
          </div>
          <span className="text-[10px] text-slate-400">Mean classroom occupancy</span>
        </div>

        <div className="card p-3 border-l-4 border-l-purple-500 bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Meetings Recorded</span>
          <div className="mt-1 text-2xl font-extrabold text-purple-600 font-mono">
            {overview?.totalMeetings ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Academic appointments</span>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="tab-list">
        <button
          type="button"
          onClick={() => setActiveTab('WORKLOAD')}
          className={`tab-btn ${activeTab === 'WORKLOAD' ? 'active' : ''}`}
        >
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Faculty Workload</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ROOM_UTILIZATION')}
          className={`tab-btn ${activeTab === 'ROOM_UTILIZATION' ? 'active' : ''}`}
        >
          <div className="flex items-center gap-1.5">
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Room Utilization</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SCHEDULE_SUMMARY')}
          className={`tab-btn ${activeTab === 'SCHEDULE_SUMMARY' ? 'active' : ''}`}
        >
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetable Report</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MEETINGS_SUMMARY')}
          className={`tab-btn ${activeTab === 'MEETINGS_SUMMARY' ? 'active' : ''}`}
        >
          <div className="flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5" />
            <span>Meetings Summary</span>
          </div>
        </button>
      </div>

      {/* Filter and Search Bar for Tables */}
      <div className="card p-3 bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Filter report records..."
            value={reportSearch}
            onChange={(e) => setReportSearch(e.target.value)}
            className="input pl-8 text-xs h-8"
          />
        </div>

        {activeTab === 'SCHEDULE_SUMMARY' && (
          <div className="w-full sm:w-auto">
            <select
              value={selectedSectionFilter}
              onChange={(e) => setSelectedSectionFilter(e.target.value)}
              className="select text-xs h-8 font-semibold text-indigo-900"
            >
              <option value="">All Sections</option>
              {uniqueSections.map((sec) => (
                <option key={sec} value={sec}>Section: {sec}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-md border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: Faculty Workload Table (Item 19) */}
      {activeTab === 'WORKLOAD' && (
        <div className="card overflow-hidden bg-white border border-slate-200">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>FACULTY WORKLOAD REPORT</span>
            <span className="text-slate-500">
              Total {filteredWorkload.length} instructors evaluated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Department</th>
                  <th className="text-right">Classes</th>
                  <th className="text-right">Hours</th>
                  <th className="w-48">Workload Distribution</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
                      Loading faculty workload...
                    </td>
                  </tr>
                ) : filteredWorkload.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No faculty records matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredWorkload.map((f, idx) => {
                    const classes = f.classCount ?? f.assignedClassesCount ?? 0;
                    const hours = f.totalHours ?? f.weeklyHours ?? classes;
                    const percent = Math.min(100, Math.round((hours / 24) * 100));
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td>
                          <div className="font-bold text-slate-900 text-xs">{f.facultyName}</div>
                          <span className="font-mono text-[10px] text-slate-400">{f.facultyCode}</span>
                        </td>
                        <td>
                          <span className="badge badge-secondary text-xs">{f.departmentName || 'General'}</span>
                        </td>
                        <td className="text-right font-mono font-bold text-slate-800 text-xs">
                          {classes}
                        </td>
                        <td className="text-right font-mono font-bold text-indigo-700 text-xs">
                          {hours} hrs
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  percent > 85 ? 'bg-rose-500' : percent > 50 ? 'bg-indigo-600' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-slate-500 w-8 text-right">
                              {percent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Room Utilization Table (Item 19) */}
      {activeTab === 'ROOM_UTILIZATION' && (
        <div className="card overflow-hidden bg-white border border-slate-200">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>ROOM UTILIZATION REPORT</span>
            <span className="text-slate-500">
              Total {filteredRooms.length} lecture halls and laboratories
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Facility Type</th>
                  <th className="text-right">Classes</th>
                  <th className="text-right">Occupied Hours</th>
                  <th className="w-48 text-right">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
                      Loading room occupancy...
                    </td>
                  </tr>
                ) : filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No rooms matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((r, idx) => {
                    const utilPercent = r.utilizationPercentage ?? 0;
                    const roomClasses = r.classCount ?? r.assignedEntriesCount ?? 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td>
                          <span className="badge badge-primary text-xs font-bold font-mono">
                            Room {r.roomNumber}
                          </span>
                        </td>
                        <td className="text-xs text-slate-700">{r.roomType || 'Classroom'}</td>
                        <td className="text-right font-mono font-bold text-slate-800 text-xs">
                          {roomClasses}
                        </td>
                        <td className="text-right font-mono font-bold text-slate-800 text-xs">
                          {r.occupiedHours || 0} hrs/wk
                        </td>
                        <td>
                          <div className="flex items-center gap-2 justify-end">
                            <div className="w-28 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  utilPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, utilPercent)}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-800 w-10 text-right">
                              {utilPercent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Timetable Report Table (Item 19) */}
      {activeTab === 'SCHEDULE_SUMMARY' && (
        <div className="card overflow-hidden bg-white border border-slate-200">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>TIMETABLE MASTER AUDIT REPORT</span>
            <span className="text-slate-500">
              Showing {filteredTimetable.length} scheduled periods
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Subject</th>
                  <th>Faculty</th>
                  <th>Room</th>
                  <th>Day</th>
                  <th>Time Period</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
                      Loading schedule records...
                    </td>
                  </tr>
                ) : filteredTimetable.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No timetable records found.
                    </td>
                  </tr>
                ) : (
                  filteredTimetable.slice(0, 50).map((t) => (
                    <tr key={t.entryId} className="hover:bg-slate-50">
                      <td>
                        <span className="badge badge-primary text-xs font-semibold font-mono">
                          {t.sectionName}
                        </span>
                      </td>
                      <td>
                        <div className="font-bold text-slate-900 text-xs">{t.subjectName}</div>
                        <span className="font-mono text-[10px] text-indigo-600">{t.subjectCode || 'LEC'}</span>
                      </td>
                      <td className="text-xs text-slate-700 font-medium">{t.facultyName}</td>
                      <td>
                        <span className="badge badge-secondary text-xs">Room {t.roomNumber}</span>
                      </td>
                      <td className="font-semibold text-slate-800 text-xs">{t.dayOfWeek}</td>
                      <td className="font-mono text-xs font-bold text-slate-700 whitespace-nowrap">
                        {format12HourRange(t.startTime, t.endTime)} (P{t.periodNumber})
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Meetings Summary Table */}
      {activeTab === 'MEETINGS_SUMMARY' && (
        <div className="card overflow-hidden bg-white border border-slate-200">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>MEETINGS SUMMARY REPORT</span>
            <span className="text-slate-500">
              Total {meetings.length} consultations scheduled
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Meeting</th>
                  <th>Faculty</th>
                  <th>Date</th>
                  <th>Time Window</th>
                  <th>Room</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((m) => (
                  <tr key={m.meetingId} className="hover:bg-slate-50">
                    <td className="font-bold text-slate-900 text-xs">{m.title}</td>
                    <td className="text-xs text-slate-700 font-medium">{m.facultyName}</td>
                    <td className="font-semibold text-slate-800 text-xs">{m.date}</td>
                    <td className="font-mono text-xs font-bold text-slate-700">
                      {format12HourRange(m.startTime, m.endTime)}
                    </td>
                    <td>
                      {m.roomNumber ? (
                        <span className="badge badge-secondary text-xs">Room {m.roomNumber}</span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unassigned</span>
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
