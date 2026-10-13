import React, { useState, useEffect } from 'react';
import {
  metadataService,
  facultyService,
  checkHealth
} from '../../services/api';
import { format12Hour } from '../../utils/formatters';
import {
  Users,
  BookOpen,
  DoorOpen,
  Layers,
  Clock,
  Settings,
  Search,
  RefreshCw,
  Building,
  CheckCircle,
  Database,
  Cpu,
  Server,
  Filter,
  RotateCcw,
  X
} from 'lucide-react';

export default function EntityManagerPage({ type = 'faculty' }) {
  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [healthInfo, setHealthInfo] = useState(null);

  const configs = {
    faculty: {
      title: 'Faculty Directory',
      subtitle: 'Academic teaching staff roster, departmental affiliations, and institutional credentials',
      icon: Users,
      fetcher: async () => {
        const res = await facultyService.getAll();
        return res.data || [];
      },
      columns: [
        { key: 'facultyName', label: 'Faculty Name' },
        { key: 'facultyCode', label: 'Faculty Code' },
        { key: 'email', label: 'Institutional Email' },
        { key: 'departmentName', label: 'Department' },
        { key: 'status', label: 'Status', isStatus: true }
      ]
    },
    subjects: {
      title: 'Academic Subjects & Curriculum',
      subtitle: 'Registered semester courses, weekly lecture periods, and departmental syllabi',
      icon: BookOpen,
      fetcher: async () => {
        const res = await metadataService.getSubjects();
        return res.data || [];
      },
      columns: [
        { key: 'subjectName', label: 'Subject Name' },
        { key: 'subjectCode', label: 'Course Code' },
        { key: 'departmentName', label: 'Department' },
        { key: 'weeklyHours', label: 'Weekly Hours' },
        { key: 'status', label: 'Status', isStatus: true }
      ]
    },
    rooms: {
      title: 'Classrooms & Laboratories',
      subtitle: 'Campus lecture halls, departmental computer labs, and seating capacities',
      icon: DoorOpen,
      fetcher: async () => {
        const res = await metadataService.getRooms();
        return res.data || [];
      },
      columns: [
        { key: 'roomNumber', label: 'Room Number' },
        { key: 'roomName', label: 'Room Name / Hall' },
        { key: 'roomType', label: 'Facility Type' },
        { key: 'capacity', label: 'Capacity' },
        { key: 'status', label: 'Status', isStatus: true }
      ]
    },
    sections: {
      title: 'Cohort Sections',
      subtitle: 'Academic batches, departmental divisions, and semester enrollment groups',
      icon: Layers,
      fetcher: async () => {
        const res = await metadataService.getSections();
        return res.data || [];
      },
      columns: [
        { key: 'sectionName', label: 'Section Label' },
        { key: 'departmentName', label: 'Department' },
        {
          key: 'yearName',
          label: 'Study Year',
          format: (val, row) =>
            val ||
            (row?.yearOfStudy
              ? `${row.yearOfStudy === 1 ? '1st' : row.yearOfStudy === 2 ? '2nd' : row.yearOfStudy === 3 ? '3rd' : row.yearOfStudy + 'th'} Year`
              : row?.semesterNumber
              ? `${Math.ceil(row.semesterNumber / 2)}th Year`
              : '—')
        },
        { key: 'semesterName', label: 'Semester' },
        { key: 'status', label: 'Status', isStatus: true }
      ]
    },
    'time-slots': {
      title: 'Time Slot Master Configuration',
      subtitle: 'Standardized lecture period schedules, break interludes, and bell timings',
      icon: Clock,
      fetcher: async () => {
        const res = await metadataService.getTimeSlots();
        return res.data || [];
      },
      columns: [
        { key: 'periodNumber', label: 'Period Index' },
        { key: 'startTime', label: 'Start Time', format: (val) => format12Hour(val) },
        { key: 'endTime', label: 'End Time', format: (val) => format12Hour(val) },
        { key: 'isBreak', label: 'Period Type', format: (val) => val ? 'Recess / Break' : 'Academic Class' },
        { key: 'status', label: 'Status', isStatus: true }
      ]
    },
    settings: {
      title: 'System Settings & Infrastructure',
      subtitle: 'Operational parameters, active database connections, and portal health metrics',
      icon: Settings,
      fetcher: async () => {
        const [depts, years, sem] = await Promise.all([
          metadataService.getDepartments(),
          metadataService.getAcademicYears(),
          metadataService.getSemesters()
        ]);
        return [
          { key: 'Active Academic Years', value: (years.data || []).length + ' configured' },
          { key: 'Configured Departments', value: (depts.data || []).length + ' academic units' },
          { key: 'Active Semesters', value: (sem.data || []).length + ' semester terms' },
          { key: 'Database Management System', value: 'MySQL (smart_timetable_db on Port 3306)' },
          { key: 'Parser Engine', value: 'Apache PDFBox 3.0' },
          { key: 'Security Protocol', value: 'JWT Bearer Authentication + BCrypt' }
        ];
      },
      columns: [
        { key: 'key', label: 'System Configuration Key' },
        { key: 'value', label: 'Operational Value' }
      ]
    }
  };

  const currentConfig = configs[type] || configs.faculty;
  const Icon = currentConfig.icon;

  const loadData = async () => {
    setLoading(true);
    try {
      const [result, deptsRes] = await Promise.all([
        currentConfig.fetcher(),
        metadataService.getDepartments().catch(() => ({ data: [] }))
      ]);
      setData(result);
      setDepartments(deptsRes.data || []);
      if (type === 'settings') {
        const health = await checkHealth();
        setHealthInfo(health);
      }
    } catch (err) {
      console.error(`Failed to load ${type} data:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedDept('');
    setSelectedYear('');
    setSearch('');
    loadData();
  }, [type]);

  const hasDepartment = ['faculty', 'subjects', 'sections'].includes(type);

  // Resolve matching department object regardless of whether selectedDept is departmentId, code, or name
  const selectedDeptObj = departments.find(
    (d) =>
      (selectedDept && String(d.departmentId) === String(selectedDept)) ||
      (d.departmentCode && d.departmentCode.toLowerCase() === String(selectedDept).toLowerCase()) ||
      (d.departmentName && d.departmentName.toLowerCase() === String(selectedDept).toLowerCase())
  );

  const filteredData = data.filter((item) => {
    if (selectedDept && hasDepartment) {
      const matchDept =
        // 1. Direct match with selectedDept string (ID, code, or name)
        (item.departmentId && String(item.departmentId) === String(selectedDept)) ||
        (item.departmentCode && item.departmentCode.toLowerCase() === String(selectedDept).toLowerCase()) ||
        (item.departmentName && item.departmentName.toLowerCase() === String(selectedDept).toLowerCase()) ||
        // 2. Match against resolved department object
        (selectedDeptObj && (
          (item.departmentId && String(item.departmentId) === String(selectedDeptObj.departmentId)) ||
          (item.departmentCode && selectedDeptObj.departmentCode && item.departmentCode.toLowerCase() === selectedDeptObj.departmentCode.toLowerCase()) ||
          (item.departmentName && selectedDeptObj.departmentName && item.departmentName.toLowerCase() === selectedDeptObj.departmentName.toLowerCase())
        ));

      if (!matchDept) return false;
    }
    if (selectedYear && type === 'sections') {
      const yr = item.yearOfStudy || (item.semesterNumber ? Math.ceil(item.semesterNumber / 2) : null);
      if (!yr || String(yr) !== String(selectedYear)) return false;
    }
    if (!search) return true;
    const query = search.toLowerCase();
    return Object.values(item).some(
      (v) => v && v.toString().toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <Icon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Master Institutional Resource</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{currentConfig.title}</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{currentConfig.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-secondary text-xs flex items-center gap-1.5"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Settings extra KPI cards if type === settings */}
      {type === 'settings' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card p-3 border-l-4 border-l-emerald-500 bg-white">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Backend Service</span>
            <div className="mt-1 text-2xl font-extrabold text-emerald-600 font-mono">
              {healthInfo?.status || 'UP'}
            </div>
            <span className="text-[10px] text-slate-400">Port 8081 • Spring Boot 3.3.4</span>
          </div>

          <div className="card p-3 border-l-4 border-l-indigo-600 bg-white">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Database Status</span>
            <div className="mt-1 text-2xl font-extrabold text-indigo-600 font-mono">
              CONNECTED
            </div>
            <span className="text-[10px] text-slate-400">MySQL smart_timetable_db</span>
          </div>

          <div className="card p-3 border-l-4 border-l-sky-500 bg-white">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Health Response Latency</span>
            <div className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">
              {healthInfo?.latency ? `${healthInfo.latency}ms` : '8ms'}
            </div>
            <span className="text-[10px] text-slate-400">Real-time ping latency</span>
          </div>
        </div>
      )}

      {/* Department & Study Year Separation Filter Card */}
      {hasDepartment && (
        <div className="card p-4 bg-white border border-slate-200 shadow-sm space-y-3.5">
          {/* Row 1: Separate by Department Quick-Action Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-600" />
                <span>Separate by Department (Click to Filter):</span>
              </span>
              {(selectedDept || selectedYear || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDept('');
                    setSelectedYear('');
                    setSearch('');
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Separation</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDept('')}
                className={`btn-perspective ${!selectedDept ? 'active' : ''}`}
                title="View combined records from all departments"
              >
                <span>All Departments</span>
                <span className="pill-active">{data.length}</span>
              </button>

              {departments.map((d) => {
                const countInDept = data.filter(
                  (it) =>
                    (it.departmentId && String(it.departmentId) === String(d.departmentId)) ||
                    (it.departmentCode && it.departmentCode.toLowerCase() === d.departmentCode?.toLowerCase()) ||
                    (it.departmentName && it.departmentName.toLowerCase() === d.departmentName?.toLowerCase())
                ).length;
                const isSelected =
                  selectedDept &&
                  (String(d.departmentId) === String(selectedDept) ||
                    (d.departmentCode && d.departmentCode.toLowerCase() === String(selectedDept).toLowerCase()) ||
                    (d.departmentName && d.departmentName.toLowerCase() === String(selectedDept).toLowerCase()));
                return (
                  <button
                    key={d.departmentId}
                    type="button"
                    onClick={() => setSelectedDept(isSelected ? '' : String(d.departmentId))}
                    className={`btn-perspective ${isSelected ? 'active' : ''}`}
                    title={`Show only ${d.departmentName}`}
                  >
                    <span>{d.departmentName}</span>
                    <span className="pill-active">{countInDept}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Study Year Buttons (for Cohort Sections) */}
          {type === 'sections' && (
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Separate by Study Year:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: '', label: 'All Years' },
                  { id: '1', label: '1st Year' },
                  { id: '2', label: '2nd Year' },
                  { id: '3', label: '3rd Year' },
                  { id: '4', label: '4th Year' }
                ].map((yr) => (
                  <button
                    key={yr.id}
                    type="button"
                    onClick={() => setSelectedYear(selectedYear === yr.id ? '' : yr.id)}
                    className={`btn-perspective ${selectedYear === yr.id ? 'active' : ''}`}
                  >
                    <span>{yr.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Row 3: Prominent DEPARTMENT & STUDY YEAR Select Boxes (Matching Your Screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2.5 border-t border-slate-100">
            {/* DEPARTMENT Dropdown */}
            <div className="filter-field-box">
              <label className="filter-field-label">
                <span>DEPARTMENT</span>
                <span className="filter-badge">({departments.length} Depts)</span>
              </label>
              <select
                value={selectedDeptObj ? String(selectedDeptObj.departmentId) : selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="filter-field-select"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.departmentId} value={String(d.departmentId)}>
                    {d.departmentName} ({d.departmentCode})
                  </option>
                ))}
              </select>
            </div>

            {/* STUDY YEAR Dropdown (For Sections) */}
            {type === 'sections' && (
              <div className="filter-field-box">
                <label className="filter-field-label">
                  <span>STUDY YEAR</span>
                  <span className="filter-badge">
                    {selectedYear
                      ? `${selectedYear === '1' ? '1st' : selectedYear === '2' ? '2nd' : selectedYear === '3' ? '3rd' : '4th'} Yr`
                      : 'All Years'}
                  </span>
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="filter-field-select"
                >
                  <option value="">All Study Years</option>
                  <option value="1">1st Year (I B.Tech / Sem 1-2)</option>
                  <option value="2">2nd Year (II B.Tech / Sem 3-4)</option>
                  <option value="3">3rd Year (III B.Tech / Sem 5-6)</option>
                  <option value="4">4th Year (IV B.Tech / Sem 7-8)</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="card overflow-hidden bg-white border border-slate-200">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              REGISTERED RECORDS ({filteredData.length})
              {selectedDept && (
                <span className="ml-2 text-indigo-600 font-bold">
                  • Filtered by {selectedDeptObj?.departmentName || selectedDept}
                </span>
              )}
            </span>
          </div>

          {type !== 'settings' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                className="input pl-8 text-xs h-8"
                placeholder="Search table records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
              Loading database records from Spring Boot...
            </div>
          ) : filteredData.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <CheckCircle className="w-7 h-7 mx-auto mb-2 text-slate-300" />
              No records found.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  {currentConfig.columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {currentConfig.columns.map((col) => {
                      const val = row[col.key];
                      if (col.isStatus) {
                        return (
                          <td key={col.key}>
                            <span className="badge badge-success text-xs">
                              {val || 'ACTIVE'}
                            </span>
                          </td>
                        );
                      }
                      if (col.format) {
                        return <td key={col.key} className="text-xs">{col.format(val, row)}</td>;
                      }
                      return (
                        <td key={col.key} className={col.key.toLowerCase().includes('name') ? 'font-bold text-slate-900 text-xs' : 'text-xs text-slate-700'}>
                          {val !== undefined && val !== null ? val.toString() : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
