import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { liveClassService, facultyService, metadataService } from '../../services/api';
import { format12HourRange } from '../../utils/formatters';
import {
  Radio,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  BookOpen,
  Users,
  RefreshCw,
  AlertCircle,
  DoorOpen,
  X,
  Check
} from 'lucide-react';

const TABS = ['RUNNING', 'ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'];

export default function FacultyLiveClassesPage() {
  const { currentUser } = useAuth();
  const [classes, setClasses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('RUNNING');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Detail Modal
  const [selectedClass, setSelectedClass] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Room reassignment modal state
  const [isRoomChangeModalOpen, setIsRoomChangeModalOpen] = useState(false);
  const [newRoomId, setNewRoomId] = useState('');
  const [changeReason, setChangeReason] = useState('Relocation due to facility requirement');
  const [modalLoading, setModalLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      let resolvedFacultyName = currentUser?.name;
      let resolvedFacultyId = currentUser?.facultyId;

      const [classRes, roomsRes, allFacRes] = await Promise.all([
        liveClassService.getToday(),
        metadataService.getRooms().catch(() => ({ data: [] })),
        facultyService.getAll().catch(() => ({ data: [] }))
      ]);

      setRooms(roomsRes.data || []);

      if (!resolvedFacultyId && currentUser?.email && allFacRes.data) {
        const matched = allFacRes.data.find(
          (f) => f.email?.toLowerCase() === currentUser.email?.toLowerCase()
        );
        if (matched) {
          resolvedFacultyId = matched.facultyId;
          resolvedFacultyName = matched.facultyName;
          setFacultyInfo(matched);
        }
      }

      if (classRes.success && classRes.data) {
        // Filter classes for this faculty member
        const myClasses = classRes.data.filter((c) => {
          if (c.facultyName && resolvedFacultyName) {
            return (
              c.facultyName.toLowerCase().includes(resolvedFacultyName.toLowerCase()) ||
              resolvedFacultyName.toLowerCase().includes(c.facultyName.toLowerCase())
            );
          }
          return false;
        });
        setClasses(myClasses);
      }
    } catch (err) {
      console.error('Failed to load faculty live classes:', err);
      setError('Could not load today live class duties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleStartClass = async (id) => {
    try {
      const res = await liveClassService.start(id);
      setSuccess('Class status updated to RUNNING.');
      loadData();
      if (selectedClass && selectedClass.liveClassId === id) {
        setSelectedClass(res.data);
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start class.');
    }
  };

  const handleEndClass = async (id) => {
    try {
      const res = await liveClassService.end(id);
      setSuccess('Class marked as COMPLETED.');
      loadData();
      if (selectedClass && selectedClass.liveClassId === id) {
        setSelectedClass(res.data);
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to conclude class.');
    }
  };

  const handleCancelClass = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled lecture?')) return;
    try {
      const res = await liveClassService.cancel(id, 'Faculty administrative reschedule');
      setSuccess('Class cancelled successfully.');
      loadData();
      setIsDetailModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel class.');
    }
  };

  const handleChangeRoomSubmit = async (e) => {
    e.preventDefault();
    if (!newRoomId || !selectedClass) return;
    setModalLoading(true);
    try {
      await liveClassService.changeRoom(
        selectedClass.liveClassId,
        newRoomId,
        changeReason || 'Relocated by Faculty'
      );
      setSuccess('Class relocated to new room successfully.');
      setIsRoomChangeModalOpen(false);
      setIsDetailModalOpen(false);
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change class room.');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredClasses = classes.filter((c) => {
    if (activeTab === 'ALL') return true;
    return (c.status || '').toUpperCase() === activeTab;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="badge badge-success font-bold text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>🟢 Running</span>
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
      default:
        return <span className="badge badge-secondary text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <Radio className="w-3.5 h-3.5 text-indigo-600" />
            <span>Real-Time Lecture Control</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            My Live Classes & Attendance Control
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Today's scheduled teaching duties for {facultyInfo?.facultyName || currentUser?.name || 'Faculty Member'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 rounded-md border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-list">
        {TABS.map((tab) => {
          const count =
            tab === 'ALL'
              ? classes.length
              : classes.filter((c) => (c.status || '').toUpperCase() === tab).length;

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

      {/* Table */}
      <div className="card overflow-hidden bg-white border border-slate-200">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>TODAY'S TEACHING SESSIONS</span>
          <span className="text-slate-500">
            Total {filteredClasses.length} assigned lecture periods
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Time Window</th>
                <th>Subject</th>
                <th>Room</th>
                <th>Section</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
                    Loading today's classes...
                  </td>
                </tr>
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <Radio className="w-8 h-8 text-slate-300" />
                      <div className="text-sm font-semibold text-slate-700">
                        {activeTab === 'RUNNING'
                          ? 'No lectures currently in session'
                          : 'No lecture sessions found'}
                      </div>
                      <div className="text-xs text-slate-400 text-center">
                        {activeTab === 'RUNNING'
                          ? 'You do not have a teaching session underway right now.'
                          : 'No sessions match the selected tab filter.'}
                      </div>
                      {activeTab === 'RUNNING' && classes.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setActiveTab('UPCOMING')}
                            className="btn btn-secondary text-xs"
                          >
                            View Upcoming
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('ALL')}
                            className="btn btn-primary text-xs"
                          >
                            View All Today ({classes.length})
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClasses.map((c) => (
                  <tr key={c.liveClassId} className="hover:bg-slate-50">
                    <td>{getStatusBadge(c.status)}</td>
                    <td className="font-mono text-xs font-bold text-slate-700 whitespace-nowrap">
                      {format12HourRange(c.startTime, c.endTime)}
                    </td>
                    <td>
                      <div className="font-bold text-slate-900 text-xs">{c.subjectName}</div>
                      <span className="font-mono text-[10px] text-indigo-600">{c.subjectCode || 'LEC'}</span>
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

      {/* Class Details Modal */}
      {isDetailModalOpen && selectedClass && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <span className="badge badge-primary text-xs">{selectedClass.sectionName}</span>
                <span>{getStatusBadge(selectedClass.status)}</span>
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
                  Code: {selectedClass.subjectCode || '—'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-md border border-slate-200">
                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Location</div>
                  <div className="font-semibold text-slate-900 mt-0.5">Room {selectedClass.roomNumber}</div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Cohort Section</div>
                  <div className="font-semibold text-indigo-700 mt-0.5">{selectedClass.sectionName}</div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Time Window</div>
                  <div className="font-mono font-semibold text-slate-900 mt-0.5">
                    {format12HourRange(selectedClass.startTime, selectedClass.endTime)}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Current Status</div>
                  <div className="mt-0.5">{getStatusBadge(selectedClass.status)}</div>
                </div>
              </div>
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
                    onClick={() => handleCancelClass(selectedClass.liveClassId)}
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
      {isRoomChangeModalOpen && selectedClass && (
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

            <form onSubmit={handleChangeRoomSubmit}>
              <div className="modal-body space-y-3">
                <div>
                  <label className="label">New Classroom</label>
                  <select
                    value={newRoomId}
                    onChange={(e) => setNewRoomId(e.target.value)}
                    className="select text-xs"
                    required
                  >
                    {rooms.map((r) => (
                      <option key={r.roomId} value={r.roomId}>
                        Room {r.roomNumber} ({r.roomType || 'Hall'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Reason</label>
                  <input
                    type="text"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsRoomChangeModalOpen(false)}
                  className="btn btn-secondary text-xs"
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs"
                  disabled={modalLoading || !newRoomId}
                >
                  {modalLoading ? 'Saving...' : 'Confirm Reallocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
