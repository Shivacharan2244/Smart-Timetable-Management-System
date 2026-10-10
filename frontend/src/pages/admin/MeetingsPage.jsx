import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  meetingService,
  facultyService,
  metadataService
} from '../../services/api';
import { format12HourRange } from '../../utils/formatters';
import {
  Video,
  Plus,
  RefreshCw,
  Calendar,
  Clock,
  DoorOpen,
  User,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Search,
  X,
  Edit,
  Trash2,
  Info,
  Check
} from 'lucide-react';

export default function MeetingsPage() {
  const [searchParams] = useSearchParams();

  const [meetings, setMeetings] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Top Filter Bar State (Item 14 from prompt)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Meeting Form Modal State (Item 15 from prompt)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    meetingId: null,
    title: '',
    facultyId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '10:30',
    duration: 30,
    roomId: '',
    description: '',
    status: 'SCHEDULED'
  });
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Smart Slot Suggestions State (Item 16 from prompt)
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [isFindingSlots, setIsFindingSlots] = useState(false);
  const [suggestionNote, setSuggestionNote] = useState(null);

  // Detail Modal State
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Cancellation State
  const [cancelMeetingItem, setCancelMeetingItem] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [meetingsRes, facRes, roomsRes] = await Promise.all([
        meetingService.getAll(),
        facultyService.getAll(),
        metadataService.getRooms().catch(() => ({ data: [] }))
      ]);

      setMeetings(meetingsRes.data || []);
      const fList = facRes.data || [];
      setFaculties(fList);
      const rList = roomsRes.data || [];
      setRooms(rList);

      // Handle query params from Free Faculty page
      const paramFaculty = searchParams.get('facultyId');
      const paramDate = searchParams.get('date');
      if (paramFaculty) {
        setFormData((prev) => ({
          ...prev,
          facultyId: paramFaculty,
          date: paramDate || prev.date
        }));
        setIsModalOpen(true);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to load meetings data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute end time when start time or duration changes
  const updateEndTime = (startTimeStr, durationMin) => {
    if (!startTimeStr) return '10:30';
    const [h, m] = startTimeStr.split(':').map(Number);
    const totalMinutes = h * 60 + m + Number(durationMin);
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  // Smart Slot Finder (Item 16 from prompt)
  const handleFindSuggestions = async (facId, dt, dur, rmId) => {
    if (!facId) return;
    setIsFindingSlots(true);
    setSuggestionNote(null);
    try {
      const params = {
        facultyId: facId,
        date: dt || formData.date,
        durationMinutes: dur || formData.duration,
        roomId: rmId || undefined
      };
      const response = await meetingService.getSuggestedSlots(params);
      const slots = response.data || [];
      setSuggestedSlots(slots);
      if (slots.length === 0) {
        setSuggestionNote('No conflict-free slots found in this window. Try a shorter duration.');
      }
    } catch (err) {
      setSuggestionNote('Unable to compute slot suggestions.');
    } finally {
      setIsFindingSlots(false);
    }
  };

  // Open Clean Add Modal
  const handleOpenAdd = () => {
    setFormError(null);
    setIsEditing(false);
    setSuggestedSlots([]);
    setSuggestionNote(null);
    const defaultFacId = faculties[0]?.facultyId ? String(faculties[0].facultyId) : '';
    const defaultRoomId = rooms[0]?.roomId ? String(rooms[0].roomId) : '';
    setFormData({
      meetingId: null,
      title: '',
      facultyId: defaultFacId,
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '10:30',
      duration: 30,
      roomId: defaultRoomId,
      description: '',
      status: 'SCHEDULED'
    });
    setIsModalOpen(true);
    if (defaultFacId) {
      handleFindSuggestions(defaultFacId, new Date().toISOString().split('T')[0], 30, defaultRoomId);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (m) => {
    setFormError(null);
    setIsEditing(true);
    setSuggestedSlots([]);
    setSuggestionNote(null);
    setIsDetailModalOpen(false);

    // Compute duration in minutes
    let dur = 30;
    if (m.startTime && m.endTime) {
      const [sh, sm] = m.startTime.split(':').map(Number);
      const [eh, em] = m.endTime.split(':').map(Number);
      dur = (eh * 60 + em) - (sh * 60 + sm);
      if (dur <= 0) dur = 30;
    }

    setFormData({
      meetingId: m.meetingId,
      title: m.title || '',
      facultyId: m.facultyId ? String(m.facultyId) : '',
      date: m.date || new Date().toISOString().split('T')[0],
      startTime: m.startTime?.slice(0, 5) || '10:00',
      endTime: m.endTime?.slice(0, 5) || '10:30',
      duration: dur,
      roomId: m.roomId ? String(m.roomId) : '',
      description: m.description || '',
      status: m.status || 'SCHEDULED'
    });
    setIsModalOpen(true);
  };

  // Save Meeting with backend conflict verification (Item 15)
  const handleSaveMeeting = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        facultyId: Number(formData.facultyId),
        date: formData.date,
        startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
        endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
        roomId: formData.roomId ? Number(formData.roomId) : null,
        description: formData.description,
        status: formData.status
      };

      if (isEditing && formData.meetingId) {
        await meetingService.update(formData.meetingId, payload);
        setSuccessMessage('Meeting schedule updated successfully.');
      } else {
        await meetingService.create(payload);
        setSuccessMessage('New meeting appointment scheduled successfully.');
      }

      setIsModalOpen(false);
      await loadData();
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      // Format friendly error message instead of raw backend exception
      const raw = err.response?.data?.message || err.message || '';
      const facultyObj = faculties.find((f) => String(f.facultyId) === String(formData.facultyId));
      const facultyName = facultyObj ? facultyObj.facultyName : 'Faculty member';

      if (raw.toLowerCase().includes('conflict') || raw.toLowerCase().includes('already') || raw.toLowerCase().includes('class')) {
        setFormError(
          `⚠️ Meeting Conflict: ${facultyName} has a scheduled lecture or prior meeting between ${formData.startTime} and ${formData.endTime}. Please select another time or use the suggestions below.`
        );
      } else {
        setFormError(raw || 'Failed to schedule meeting. Please verify slot availability.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Meeting
  const handleConfirmCancel = async () => {
    if (!cancelMeetingItem) return;
    setIsCancelling(true);
    try {
      await meetingService.cancel(cancelMeetingItem.meetingId);
      setMeetings((prev) =>
        prev.map((m) =>
          m.meetingId === cancelMeetingItem.meetingId ? { ...m, status: 'CANCELLED' } : m
        )
      );
      setIsCancelModalOpen(false);
      setCancelMeetingItem(null);
      setSuccessMessage('Meeting has been cancelled.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel meeting.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Filter logic
  const filteredMeetings = meetings.filter((m) => {
    // Status filter
    if (filterStatus !== 'ALL' && m.status !== filterStatus) {
      return false;
    }
    // Date filter
    if (filterDate && m.date !== filterDate) {
      return false;
    }
    // Faculty filter
    if (filterFaculty && String(m.facultyId) !== String(filterFaculty)) {
      return false;
    }
    // Room filter
    if (filterRoom && String(m.roomId) !== String(filterRoom)) {
      return false;
    }
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.facultyName && m.facultyName.toLowerCase().includes(q)) ||
        (m.roomNumber && String(m.roomNumber).toLowerCase().includes(q)) ||
        (m.description && m.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <span className="badge badge-success font-bold text-xs">
            🟢 Scheduled
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
          <span className="badge badge-info font-bold text-xs">
            🔵 Completed
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

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '30 min';
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? `${diff} min` : '30 min';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <Video className="w-3.5 h-3.5 text-indigo-600" />
            <span>Institutional Operations</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Institutional Meetings & Consultations
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
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Top Filter Bar (Item 14 from prompt) */}
      <div className="card p-3.5 bg-white border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          {/* Search */}
          <div>
            <label className="label text-[11px]">Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Title, faculty, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-8 text-xs"
              />
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="label text-[11px]">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input text-xs"
            />
          </div>

          {/* Faculty Filter */}
          <div>
            <label className="label text-[11px]">Faculty</label>
            <select
              value={filterFaculty}
              onChange={(e) => setFilterFaculty(e.target.value)}
              className="select text-xs"
            >
              <option value="">All Faculty</option>
              {faculties.map((f) => (
                <option key={f.facultyId} value={f.facultyId}>
                  {f.facultyName}
                </option>
              ))}
            </select>
          </div>

          {/* Room Filter */}
          <div>
            <label className="label text-[11px]">Room</label>
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="select text-xs"
            >
              <option value="">All Rooms</option>
              {rooms.map((r) => (
                <option key={r.roomId} value={r.roomId}>
                  Room {r.roomNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="label text-[11px]">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">🟢 Scheduled</option>
              <option value="UPCOMING">🟡 Upcoming</option>
              <option value="COMPLETED">🔵 Completed</option>
              <option value="CANCELLED">🔴 Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-3 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3 rounded-md border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Meetings Professional Table (Item 14 from prompt) */}
      <div className="card overflow-hidden bg-white border border-slate-200">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>MEETINGS LEDGER</span>
          <span className="text-slate-500">
            Total {filteredMeetings.length} records matching filters
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time Window</th>
                <th>Meeting Title</th>
                <th>Faculty</th>
                <th>Room</th>
                <th className="text-right">Duration</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
                    Loading meetings schedule...
                  </td>
                </tr>
              ) : filteredMeetings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <Video className="w-8 h-8 mx-auto mb-2 opacity-20 text-indigo-600" />
                    No scheduled meetings found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredMeetings.map((m) => (
                  <tr key={m.meetingId} className="hover:bg-slate-50">
                    <td className="font-semibold text-slate-800 text-xs whitespace-nowrap">
                      {m.date}
                    </td>
                    <td className="font-mono text-xs font-bold text-slate-700 whitespace-nowrap">
                      {format12HourRange(m.startTime, m.endTime)}
                    </td>
                    <td>
                      <div className="font-bold text-slate-900 text-xs">{m.title}</div>
                      {m.description && (
                        <div className="text-[11px] text-slate-500 truncate max-w-xs" title={m.description}>
                          {m.description}
                        </div>
                      )}
                    </td>
                    <td className="text-xs">
                      <div className="font-semibold text-slate-800">{m.facultyName || 'Faculty'}</div>
                      <span className="font-mono text-[10px] text-slate-400">{m.facultyCode || '—'}</span>
                    </td>
                    <td>
                      {m.roomNumber ? (
                        <span className="badge badge-secondary text-xs">Room {m.roomNumber}</span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="text-right font-mono text-xs text-slate-600">
                      {calculateDuration(m.startTime, m.endTime)}
                    </td>
                    <td>{getStatusBadge(m.status)}</td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMeeting(m);
                            setIsDetailModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          title="View Details"
                        >
                          View
                        </button>
                        {m.status !== 'CANCELLED' && m.status !== 'COMPLETED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(m)}
                              className="btn btn-secondary btn-sm"
                              title="Edit"
                            >
                              <Edit className="w-3 h-3 text-indigo-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCancelMeetingItem(m);
                                setIsCancelModalOpen(true);
                              }}
                              className="btn btn-secondary btn-sm text-rose-600 hover:text-rose-800"
                              title="Cancel Meeting"
                            >
                              Cancel
                            </button>
                          </>
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

      {/* Meeting Creation / Edit Modal (Item 15 from prompt) */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog max-w-lg">
            <div className="modal-header">
              <h3 className="modal-title flex items-center gap-1.5">
                <Video className="w-4 h-4 text-indigo-600" />
                <span>{isEditing ? 'Edit Scheduled Meeting' : 'Schedule New Meeting'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="modal-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMeeting}>
              <div className="modal-body space-y-3.5">
                {/* Conflict Alert (Item 15) */}
                {formError && (
                  <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <div className="flex-1 font-medium">{formError}</div>
                  </div>
                )}

                {/* Meeting Title */}
                <div>
                  <label className="label">Meeting Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Department Academic Review / Faculty Sync"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input text-xs"
                  />
                </div>

                {/* Faculty & Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Target Faculty</label>
                    <select
                      value={formData.facultyId}
                      onChange={(e) => {
                        const newFacId = e.target.value;
                        setFormData({ ...formData, facultyId: newFacId });
                        handleFindSuggestions(newFacId, formData.date, formData.duration, formData.roomId);
                      }}
                      className="select text-xs"
                      required
                    >
                      <option value="">Select Faculty</option>
                      {faculties.map((f) => (
                        <option key={f.facultyId} value={f.facultyId}>
                          {f.facultyName} ({f.facultyCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setFormData({ ...formData, date: newDate });
                        handleFindSuggestions(formData.facultyId, newDate, formData.duration, formData.roomId);
                      }}
                      className="input text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Duration & Time Range */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label">Duration</label>
                    <select
                      value={formData.duration}
                      onChange={(e) => {
                        const dur = Number(e.target.value);
                        const newEnd = updateEndTime(formData.startTime, dur);
                        setFormData({ ...formData, duration: dur, endTime: newEnd });
                        handleFindSuggestions(formData.facultyId, formData.date, dur, formData.roomId);
                      }}
                      className="select text-xs"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => {
                        const st = e.target.value;
                        const newEnd = updateEndTime(st, formData.duration);
                        setFormData({ ...formData, startTime: st, endTime: newEnd });
                      }}
                      className="input text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="input text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Smart Meeting Suggestions (Item 16 from prompt) */}
                <div className="p-3 rounded-md bg-indigo-50/60 border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Available Time Suggestions</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleFindSuggestions(formData.facultyId, formData.date, formData.duration, formData.roomId)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                      disabled={isFindingSlots || !formData.facultyId}
                    >
                      {isFindingSlots ? 'Computing...' : 'Recalculate'}
                    </button>
                  </div>

                  {suggestedSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              startTime: slot.startTime,
                              endTime: slot.endTime
                            });
                            setFormError(null);
                          }}
                          className="px-2.5 py-1 rounded bg-white border border-indigo-200 text-xs font-mono font-medium text-indigo-800 hover:bg-indigo-600 hover:text-white transition-all shadow-xs flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3" />
                          <span>{format12HourRange(slot.startTime, slot.endTime)}</span>
                          <span className="text-[10px] text-emerald-600 font-bold ml-0.5">[Use This Slot]</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic">
                      {suggestionNote || 'Select faculty, date and duration to view clash-free slot suggestions.'}
                    </div>
                  )}
                </div>

                {/* Room */}
                <div>
                  <label className="label">Meeting Room / Hall</label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="select text-xs"
                  >
                    <option value="">Virtual / No Room Assigned</option>
                    {rooms.map((r) => (
                      <option key={r.roomId} value={r.roomId}>
                        Room {r.roomNumber} ({r.roomType || 'Conference'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="label">Description / Agenda</label>
                  <input
                    type="text"
                    placeholder="Brief description or meeting agenda notes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary text-xs"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Verifying & Saving...' : isEditing ? 'Update Meeting' : 'Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meeting Detail Modal */}
      {isDetailModalOpen && selectedMeeting && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <span className="badge badge-primary text-xs">{selectedMeeting.date}</span>
                <span>{getStatusBadge(selectedMeeting.status)}</span>
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
                <h3 className="text-base font-bold text-slate-900">{selectedMeeting.title}</h3>
                <span className="text-xs text-slate-500 font-mono">
                  Time: {format12HourRange(selectedMeeting.startTime, selectedMeeting.endTime)} ({calculateDuration(selectedMeeting.startTime, selectedMeeting.endTime)})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-md border border-slate-200">
                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Faculty Attendee</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{selectedMeeting.facultyName}</div>
                  <div className="text-slate-500 font-mono text-[11px]">{selectedMeeting.facultyCode || '—'}</div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Assigned Room</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {selectedMeeting.roomNumber ? `Room ${selectedMeeting.roomNumber}` : 'Virtual / Unassigned'}
                  </div>
                </div>
              </div>

              {selectedMeeting.description && (
                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
                  <strong className="text-slate-900">Agenda / Details: </strong>
                  {selectedMeeting.description}
                </div>
              )}
            </div>

            <div className="modal-footer">
              {selectedMeeting.status !== 'CANCELLED' && selectedMeeting.status !== 'COMPLETED' && (
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedMeeting)}
                  className="btn btn-secondary text-xs mr-auto flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Edit Meeting</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="btn btn-primary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && cancelMeetingItem && (
        <div className="modal-backdrop">
          <div className="modal-dialog max-w-sm">
            <div className="modal-header">
              <h3 className="modal-title text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Confirm Meeting Cancellation</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="modal-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body text-xs text-slate-600 space-y-2">
              <p>
                Are you sure you want to cancel the meeting appointment for{' '}
                <strong className="text-slate-900">{cancelMeetingItem.title}</strong>?
              </p>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] font-mono">
                {cancelMeetingItem.date} • {cancelMeetingItem.startTime?.slice(0, 5)} – {cancelMeetingItem.endTime?.slice(0, 5)}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="btn btn-secondary text-xs"
                disabled={isCancelling}
              >
                Close
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
