import React, { useState, useEffect } from 'react';
import {
  liveClassService,
  metadataService
} from '../../services/api';
import { format12HourRange } from '../../utils/formatters';
import {
  Radio,
  Play,
  CheckCircle,
  XCircle,
  DoorOpen,
  RefreshCw,
  Clock,
  User,
  BookOpen,
  Layers,
  AlertTriangle,
  Building,
  Check,
  X,
  Search,
  Filter,
  Eye,
  Calendar
} from 'lucide-react';

const TABS = ['RUNNING', 'ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'];

export default function LiveClassesPage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Active filters - default to RUNNING so user sees only currently running classes
  const [activeTab, setActiveTab] = useState('RUNNING');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Live Class Detail Modal state
  const [selectedClass, setSelectedClass] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Room change modal state
  const [isRoomChangeModalOpen, setIsRoomChangeModalOpen] = useState(false);
  const [newRoomId, setNewRoomId] = useState('');
  const [roomChangeReason, setRoomChangeReason] = useState('Classroom reassignment due to facility optimization');
  const [isChangingRoom, setIsChangingRoom] = useState(false);
  const [roomError, setRoomError] = useState(null);

  // Cancellation modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Faculty administrative leave or department rescheduling');
  const [isCancelling, setIsCancelling] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Ensure today's schedule is synced
      await liveClassService.syncToday().catch(() => null);

      const [classesRes, secRes, deptsRes, roomsRes] = await Promise.all([
        liveClassService.getAll(),
        metadataService.getSections().catch(() => ({ data: [] })),
        metadataService.getDepartments().catch(() => ({ data: [] })),
        metadataService.getRooms().catch(() => ({ data: [] }))
      ]);

      setClasses(classesRes.data || []);
      setSections(secRes.data || []);
      setDepartments(deptsRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to fetch live classes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Class action handlers
  const handleStartClass = async (id) => {
    try {
      const res = await liveClassService.start(id);
      setClasses((prev) => prev.map((c) => (c.liveClassId === id ? res.data : c)));
      if (selectedClass && selectedClass.liveClassId === id) {
        setSelectedClass(res.data);
      }
      setSuccessMessage('Lecture session commenced. Status is now RUNNING.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start class session.');
    }
  };

  const handleEndClass = async (id) => {
    try {
      const res = await liveClassService.end(id);
      setClasses((prev) => prev.map((c) => (c.liveClassId === id ? res.data : c)));
      if (selectedClass && selectedClass.liveClassId === id) {
        setSelectedClass(res.data);
      }
      setSuccessMessage('Lecture session concluded successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to conclude lecture.');
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedClass) return;
    setIsCancelling(true);
    try {
      const res = await liveClassService.cancel(selectedClass.liveClassId, cancelReason);
      setClasses((prev) => prev.map((c) => (c.liveClassId === selectedClass.liveClassId ? res.data : c)));
      setSelectedClass(res.data);
      setIsCancelModalOpen(false);
      setSuccessMessage('Lecture marked as CANCELLED.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel session.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmChangeRoom = async () => {
    if (!selectedClass || !newRoomId) return;
    setIsChangingRoom(true);
    setRoomError(null);
    try {
      const res = await liveClassService.changeRoom(selectedClass.liveClassId, newRoomId, roomChangeReason);
      setClasses((prev) => prev.map((c) => (c.liveClassId === selectedClass.liveClassId ? res.data : c)));
      setSelectedClass(res.data);
      setIsRoomChangeModalOpen(false);
      setSuccessMessage('Classroom reallocated successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setRoomError(err.response?.data?.message || 'Failed to reassign classroom.');
    } finally {
      setIsChangingRoom(false);
    }
  };

  // Filter logic
  const filteredClasses = classes.filter((c) => {
    // Tab filter
    if (activeTab !== 'ALL' && (c.status || '').toUpperCase() !== activeTab) {
      return false;
    }
    // Section filter
    if (selectedSection && c.sectionName !== selectedSection) {
      return false;
    }
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        (c.subjectName && c.subjectName.toLowerCase().includes(q)) ||
        (c.subjectCode && c.subjectCode.toLowerCase().includes(q)) ||
        (c.facultyName && c.facultyName.toLowerCase().includes(q)) ||
        (c.roomNumber && c.roomNumber.toLowerCase().includes(q)) ||
        (c.sectionName && c.sectionName.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const runningCount = classes.filter((c) => c.status === 'RUNNING').length;
  const upcomingCount = classes.filter((c) => c.status === 'UPCOMING').length;
  const completedCount = classes.filter((c) => c.status === 'COMPLETED').length;
  const cancelledCount = classes.filter((c) => c.status === 'CANCELLED').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="badge badge-success flex items-center gap-1 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>🟢 Running</span>
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="badge badge-warning flex items-center gap-1 font-bold">
            <span>🟡 Upcoming</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="badge badge-secondary flex items-center gap-1 font-medium">
            <span>⚪ Completed</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="badge badge-danger flex items-center gap-1 font-bold">
            <span>🔴 Cancelled</span>
          </span>
        );
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <Radio className="w-3.5 h-3.5 text-indigo-600" />
            <span>Live Campus Operations</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Section-Wise Live Classes Monitoring
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'spin' : ''}`} />
            <span>Sync Today's Schedule</span>
          </button>
        </div>
      </div>

      {/* Top Filter Bar (Item 9 from prompt) */}
      <div className="card p-3.5 bg-white border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          {/* Section Dropdown */}
          <div>
            <label className="label text-[11px] font-bold text-indigo-950">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="select text-xs font-semibold bg-indigo-50/50 border-indigo-200 text-indigo-950"
            >
              <option value="">All Campus Sections</option>
              {sections.map((s) => (
                <option key={s.sectionId} value={s.sectionName}>
                  Section: {s.sectionName}
                </option>
              ))}
            </select>
          </div>

          {/* Department Dropdown */}
          <div>
            <label className="label text-[11px]">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="select text-xs"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentCode || d.departmentName}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="label text-[11px]">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input text-xs"
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="label text-[11px] font-bold text-slate-700">Status Filter</label>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="select text-xs font-semibold bg-emerald-50/50 border-emerald-300 text-emerald-950"
            >
              <option value="RUNNING">🟢 Currently Running ({runningCount})</option>
              <option value="ALL">All Statuses ({classes.length})</option>
              <option value="UPCOMING">🟡 Upcoming ({upcomingCount})</option>
              <option value="COMPLETED">⚪ Completed ({completedCount})</option>
              <option value="CANCELLED">🔴 Cancelled ({cancelledCount})</option>
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="label text-[11px]">Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Course, faculty, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-8 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-3 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3 rounded-md border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected Section Indicator Banner */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Selected Section:
          </span>
          <span className="font-extrabold text-sm text-indigo-400">
            {selectedSection || 'All Campus Cohorts'}
          </span>
        </div>
        <div className="text-xs text-slate-400">
          Total Lectures: <strong className="text-white">{filteredClasses.length}</strong>
        </div>
      </div>

      {/* Tabs (Item 10 from prompt: [All] [Running] [Upcoming] [Completed] [Cancelled]) */}
      <div className="tab-list">
        {TABS.map((tab) => {
          const count =
            tab === 'ALL'
              ? classes.length
              : tab === 'RUNNING'
              ? runningCount
              : tab === 'UPCOMING'
              ? upcomingCount
              : tab === 'COMPLETED'
              ? completedCount
              : cancelledCount;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            >
              {tab === 'RUNNING' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1" />
              )}
              <span>{tab === 'RUNNING' ? 'CURRENTLY RUNNING' : tab}</span>
              <span className="badge badge-secondary ml-1 text-[10px] py-0 px-1.5 font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section-wise Live Classes Table (Item 9 from prompt) */}
      <div className="card overflow-hidden bg-white border border-slate-200">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Time Window</th>
                <th>Subject Name</th>
                <th>Teaching Faculty</th>
                <th>Room</th>
                <th>Section</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
                    Synchronizing live campus periods...
                  </td>
                </tr>
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <Radio className="w-8 h-8 text-slate-300" />
                      <div className="text-sm font-semibold text-slate-700">
                        {activeTab === 'RUNNING'
                          ? 'No lecture sessions currently running right now'
                          : 'No lecture sessions found matching filters'}
                      </div>
                      <div className="text-xs text-slate-400 text-center">
                        {activeTab === 'RUNNING'
                          ? 'There are no active classes at this moment. You can view all today\'s classes or upcoming sessions.'
                          : 'No records match the current section and filter criteria.'}
                      </div>
                      {activeTab === 'RUNNING' && classes.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setActiveTab('UPCOMING')}
                            className="btn btn-secondary text-xs"
                          >
                            View Upcoming ({upcomingCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('ALL')}
                            className="btn btn-primary text-xs"
                          >
                            View All Today's Classes ({classes.length})
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClasses.map((c) => (
                  <tr key={c.liveClassId}>
                    <td>{getStatusBadge(c.status)}</td>
                    <td className="font-mono text-xs font-bold text-slate-700 whitespace-nowrap">
                      {format12HourRange(c.startTime, c.endTime)}
                    </td>
                    <td>
                      <div className="font-bold text-slate-900 text-xs">{c.subjectName}</div>
                      <span className="font-mono text-[10px] text-indigo-600">
                        {c.subjectCode || 'LEC'}
                      </span>
                    </td>
                    <td className="text-xs text-slate-800 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.facultyName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-secondary text-xs">Room {c.roomNumber}</span>
                    </td>
                    <td>
                      <span className="badge badge-primary text-xs font-semibold">{c.sectionName}</span>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClass(c);
                            setIsDetailModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          title="View Details"
                        >
                          View
                        </button>
                        {c.status === 'UPCOMING' && (
                          <button
                            type="button"
                            onClick={() => handleStartClass(c.liveClassId)}
                            className="btn btn-primary btn-sm flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>Start</span>
                          </button>
                        )}
                        {c.status === 'RUNNING' && (
                          <button
                            type="button"
                            onClick={() => handleEndClass(c.liveClassId)}
                            className="btn btn-success btn-sm flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Complete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Class Details Modal (Item 11 from prompt) */}
      {isDetailModalOpen && selectedClass && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <span className="badge badge-primary text-xs">{selectedClass.sectionName}</span>
                <span className="badge badge-secondary text-xs">{getStatusBadge(selectedClass.status)}</span>
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
                <h3 className="text-base font-bold text-slate-900">{selectedClass.subjectName}</h3>
                <span className="font-mono text-xs text-indigo-600 font-bold">
                  Course Code: {selectedClass.subjectCode || '—'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-md border border-slate-200">
                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Faculty Member</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{selectedClass.facultyName}</div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Location</div>
                  <div className="font-semibold text-slate-900 mt-0.5">Room {selectedClass.roomNumber}</div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Section</div>
                  <div className="font-semibold text-indigo-700 mt-0.5">{selectedClass.sectionName}</div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Time Window</div>
                  <div className="font-mono font-semibold text-slate-900 mt-0.5">
                    {format12HourRange(selectedClass.startTime, selectedClass.endTime)}
                  </div>
                </div>
              </div>

              {selectedClass.remarks && (
                <div className="text-xs text-slate-600 bg-amber-50 p-2.5 rounded border border-amber-200">
                  <strong className="text-amber-800">Remarks: </strong>
                  {selectedClass.remarks}
                </div>
              )}
            </div>

            <div className="modal-footer">
              {selectedClass.status !== 'COMPLETED' && selectedClass.status !== 'CANCELLED' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setNewRoomId(String(rooms[0]?.roomId || ''));
                      setIsRoomChangeModalOpen(true);
                    }}
                    className="btn btn-secondary text-xs mr-auto flex items-center gap-1.5"
                  >
                    <DoorOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Change Room</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="btn btn-danger text-xs flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Class</span>
                  </button>

                  {selectedClass.status === 'RUNNING' && (
                    <button
                      type="button"
                      onClick={() => handleEndClass(selectedClass.liveClassId)}
                      className="btn btn-success text-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </button>
                  )}

                  {selectedClass.status === 'UPCOMING' && (
                    <button
                      type="button"
                      onClick={() => handleStartClass(selectedClass.liveClassId)}
                      className="btn btn-primary text-xs flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Class</span>
                    </button>
                  )}
                </>
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

      {/* Change Room Modal */}
      {isRoomChangeModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog max-w-sm">
            <div className="modal-header">
              <h3 className="modal-title flex items-center gap-1.5">
                <DoorOpen className="w-4 h-4 text-indigo-600" />
                <span>Reallocate Classroom</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsRoomChangeModalOpen(false)}
                className="modal-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body space-y-3">
              {roomError && (
                <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {roomError}
                </div>
              )}

              <div>
                <label className="label">New Classroom / Lab</label>
                <select
                  value={newRoomId}
                  onChange={(e) => setNewRoomId(e.target.value)}
                  className="select text-xs"
                >
                  {rooms.map((r) => (
                    <option key={r.roomId} value={r.roomId}>
                      Room {r.roomNumber} ({r.roomType || 'Hall'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Reason for Reallocation</label>
                <input
                  type="text"
                  value={roomChangeReason}
                  onChange={(e) => setRoomChangeReason(e.target.value)}
                  className="input text-xs"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setIsRoomChangeModalOpen(false)}
                className="btn btn-secondary text-xs"
                disabled={isChangingRoom}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmChangeRoom}
                className="btn btn-primary text-xs"
                disabled={isChangingRoom || !newRoomId}
              >
                {isChangingRoom ? 'Saving...' : 'Confirm Reassignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Class Modal */}
      {isCancelModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog max-w-sm">
            <div className="modal-header">
              <h3 className="modal-title text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Confirm Class Cancellation</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="modal-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body space-y-3 text-xs">
              <p className="text-slate-600">
                Are you sure you want to cancel the lecture for{' '}
                <strong className="text-slate-900">{selectedClass?.subjectName}</strong>?
              </p>

              <div>
                <label className="label">Cancellation Reason</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="input text-xs"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="btn btn-secondary text-xs"
                disabled={isCancelling}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="btn btn-danger text-xs"
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
