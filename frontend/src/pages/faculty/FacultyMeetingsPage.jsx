import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { meetingService, facultyService } from '../../services/api';
import { format12HourRange } from '../../utils/formatters';
import {
  Video,
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  DoorOpen,
  X
} from 'lucide-react';

export default function FacultyMeetingsPage() {
  const { currentUser } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const loadMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      let resolvedFacultyId = currentUser?.facultyId;

      if (!resolvedFacultyId && currentUser?.email) {
        const facRes = await facultyService.getAll();
        if (facRes.success && facRes.data) {
          const matched = facRes.data.find(
            (f) => f.email?.toLowerCase() === currentUser.email?.toLowerCase()
          );
          if (matched) {
            resolvedFacultyId = matched.facultyId;
          }
        }
      }

      if (resolvedFacultyId) {
        const res = await meetingService.getByFaculty(resolvedFacultyId);
        if (res.success && res.data) {
          setMeetings(res.data);
        }
      } else {
        const res = await meetingService.getAll();
        if (res.success && res.data && currentUser?.name) {
          const filtered = res.data.filter(
            (m) => m.facultyName && m.facultyName.toLowerCase().includes(currentUser.name.toLowerCase())
          );
          setMeetings(filtered);
        }
      }
    } catch (err) {
      console.error('Failed to load faculty meetings:', err);
      setError('Could not retrieve scheduled institutional meetings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, [currentUser]);

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
            <span>Institutional Appointments</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            My Scheduled Meetings & Consultations
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Department reviews, academic consultations, and administrative committee meetings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadMeetings}
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

      {/* KPI Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 border-l-4 border-l-indigo-600 bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Meetings</span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">
            {meetings.length}
          </div>
          <span className="text-[10px] text-slate-400">Assigned appointments</span>
        </div>

        <div className="card p-3 border-l-4 border-l-emerald-500 bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Confirmed</span>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600 font-mono">
            {meetings.filter((m) => m.status === 'SCHEDULED' || m.status === 'CONFIRMED').length}
          </div>
          <span className="text-[10px] text-slate-400">Active calendar commitments</span>
        </div>

        <div className="card p-3 border-l-4 border-l-amber-500 bg-white">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed / Other</span>
          <div className="mt-1 text-2xl font-extrabold text-amber-600 font-mono">
            {meetings.filter((m) => m.status !== 'SCHEDULED' && m.status !== 'CONFIRMED').length}
          </div>
          <span className="text-[10px] text-slate-400">Past or concluded</span>
        </div>
      </div>

      {/* Meetings Table */}
      <div className="card overflow-hidden bg-white border border-slate-200">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>MEETINGS SCHEDULE</span>
          <span className="text-slate-500">
            Total {meetings.length} appointments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time Window</th>
                <th>Meeting Title</th>
                <th>Room / Venue</th>
                <th>Duration</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
                    Loading meeting schedule...
                  </td>
                </tr>
              ) : meetings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircle className="w-7 h-7 mx-auto mb-2 text-emerald-500" />
                    No upcoming meetings scheduled on your calendar.
                  </td>
                </tr>
              ) : (
                meetings.map((m) => (
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
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{m.description}</div>
                      )}
                    </td>
                    <td>
                      {m.roomNumber ? (
                        <span className="badge badge-secondary text-xs">Room {m.roomNumber}</span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Virtual / Unassigned</span>
                      )}
                    </td>
                    <td className="font-mono text-xs text-slate-600">
                      {calculateDuration(m.startTime, m.endTime)}
                    </td>
                    <td>
                      <span className="badge badge-primary text-xs font-semibold">{m.status}</span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedMeeting(m)}
                        className="btn btn-secondary btn-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMeeting && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <span className="badge badge-primary text-xs">{selectedMeeting.date}</span>
                <span className="badge badge-secondary text-xs">{selectedMeeting.status}</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedMeeting(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedMeeting.title}</h3>
                <span className="font-mono text-xs text-indigo-600 font-bold">
                  Time: {format12HourRange(selectedMeeting.startTime, selectedMeeting.endTime)} ({calculateDuration(selectedMeeting.startTime, selectedMeeting.endTime)})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-md border border-slate-200">
                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Location</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedMeeting.roomNumber ? `Room ${selectedMeeting.roomNumber}` : 'Virtual / Unassigned'}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Date</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedMeeting.date}</div>
                </div>
              </div>

              {selectedMeeting.description && (
                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
                  <strong className="text-slate-900">Agenda: </strong>
                  {selectedMeeting.description}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setSelectedMeeting(null)}
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
