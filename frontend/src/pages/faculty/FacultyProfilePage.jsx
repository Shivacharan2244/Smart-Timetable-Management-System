import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { facultyService, timetableService } from '../../services/api';
import {
  User,
  Mail,
  Building,
  Award,
  BookOpen,
  Clock,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';

export default function FacultyProfilePage() {
  const { currentUser } = useAuth();
  const [faculty, setFaculty] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        let facId = currentUser?.facultyId;
        if (!facId && currentUser?.email) {
          const allRes = await facultyService.getAll();
          if (allRes.success && allRes.data) {
            const found = allRes.data.find(
              (f) => f.email?.toLowerCase() === currentUser.email?.toLowerCase()
            );
            if (found) {
              facId = found.facultyId;
              setFaculty(found);
            }
          }
        } else if (facId) {
          const res = await facultyService.getById(facId);
          if (res.success) setFaculty(res.data);
        }

        if (facId) {
          const ttRes = await timetableService.getEntriesByFaculty(facId);
          if (ttRes.success && ttRes.data) {
            setEntries(ttRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-white border border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            <span>Faculty Credentials</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            My Profile & Teaching Portfolio
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Institutional assignment, department affiliation, and weekly academic load
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile Card */}
        <div className="card p-5 bg-white border border-slate-200">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Institutional Identity
            </h3>
          </div>

          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-extrabold shadow-sm">
              {faculty?.facultyName ? faculty.facultyName.charAt(0) : currentUser?.name?.charAt(0) || 'F'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {faculty?.facultyName || currentUser?.name || 'Faculty Member'}
              </h3>
              <span className="badge badge-primary text-[10px] mt-1">
                {currentUser?.role || 'FACULTY'}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
              </span>
              <span className="font-semibold text-slate-800">{faculty?.email || currentUser?.email || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-400" /> Faculty Code
              </span>
              <span className="font-mono font-semibold text-slate-800">{faculty?.facultyCode || 'FAC-' + (faculty?.facultyId || 'N/A')}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" /> Department
              </span>
              <span className="font-semibold text-slate-800">{faculty?.departmentName || 'Artificial Intelligence and Machine Learning'}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> System Status
              </span>
              <span className="badge badge-success text-[10px]">
                {faculty?.status || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Teaching Portfolio Summary */}
        <div className="card p-5 bg-white border border-slate-200">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Teaching Workload & Assignments
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-md bg-indigo-50/50 border border-indigo-100">
              <span className="text-[10px] font-bold text-indigo-900 uppercase">Weekly Lectures</span>
              <div className="text-xl font-mono font-extrabold text-indigo-700 mt-0.5">
                {entries.length}
              </div>
              <span className="text-[10px] text-slate-400">Class periods</span>
            </div>

            <div className="p-3 rounded-md bg-emerald-50/50 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-900 uppercase">Assigned Hours</span>
              <div className="text-xl font-mono font-extrabold text-emerald-700 mt-0.5">
                {entries.length} hrs / wk
              </div>
              <span className="text-[10px] text-slate-400">Contact duration</span>
            </div>
          </div>

          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Enrolled Course Modules ({new Set(entries.map((e) => e.subjectCode)).size})
          </h4>

          {entries.length === 0 ? (
            <p className="text-slate-400 text-xs italic">
              No active timetable allocations found in the current semester schedule.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {Array.from(new Set(entries.map((e) => e.subjectCode))).map((code) => {
                const entry = entries.find((e) => e.subjectCode === code);
                const count = entries.filter((e) => e.subjectCode === code).length;
                return (
                  <div
                    key={code}
                    className="p-2.5 rounded bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {entry?.subjectName}
                      </div>
                      <div className="text-[10px] font-mono text-indigo-600">
                        Code: {code}
                      </div>
                    </div>
                    <span className="badge badge-secondary text-[10px] font-mono">
                      {count} {count === 1 ? 'period' : 'periods'} / wk
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
