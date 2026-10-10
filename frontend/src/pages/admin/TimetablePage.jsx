import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  timetableService,
  metadataService,
  facultyService
} from '../../services/api';
import { format12HourRange } from '../../utils/formatters';
import {
  CalendarDays,
  Plus,
  RefreshCw,
  Filter,
  Search,
  X,
  Edit,
  Trash2,
  Clock,
  DoorOpen,
  User,
  Users,
  UserCheck,
  BookOpen,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Table as TableIcon,
  Grid as GridIcon,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Building
} from 'lucide-react';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function TimetablePage() {
  const navigate = useNavigate();

  // Data State
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Metadata dropdown options
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [timetables, setTimetables] = useState([]);

  // Active View Tab: 'WEEKLY' or 'LIST'
  const [viewMode, setViewMode] = useState('WEEKLY');

  // Active View Perspective: 'SECTION' | 'FACULTY' | 'ROOM' | 'SUBJECT'
  const [viewPerspective, setViewPerspective] = useState('SECTION');

  // Active Filters
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState(''); // '1', '2', '3', '4' or ''
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    entryId: null,
    timetableId: '',
    dayOfWeek: 'MONDAY',
    timeSlotId: '',
    subjectId: '',
    facultyId: '',
    roomId: '',
    status: 'ACTIVE'
  });
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load all initial metadata and entries
  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [
        entriesRes,
        ayRes,
        semRes,
        deptsRes,
        secRes,
        facRes,
        roomsRes,
        subjRes,
        slotsRes,
        ttRes
      ] = await Promise.all([
        timetableService.getAllEntries(),
        metadataService.getAcademicYears().catch(() => ({ data: [] })),
        metadataService.getSemesters().catch(() => ({ data: [] })),
        metadataService.getDepartments().catch(() => ({ data: [] })),
        metadataService.getSections().catch(() => ({ data: [] })),
        facultyService.getAll().catch(() => ({ data: [] })),
        metadataService.getRooms().catch(() => ({ data: [] })),
        metadataService.getSubjects().catch(() => ({ data: [] })),
        metadataService.getTimeSlots().catch(() => ({ data: [] })),
        metadataService.getTimetables().catch(() => ({ data: [] }))
      ]);

      const loadedEntries = entriesRes.data || [];
      const loadedSections = secRes.data || [];
      setEntries(loadedEntries);
      setAcademicYears(ayRes.data || []);
      setSemesters(semRes.data || []);
      setDepartments(deptsRes.data || []);
      setSections(loadedSections);
      setFaculties(facRes.data || []);
      setRooms(roomsRes.data || []);
      setSubjects(subjRes.data || []);
      setTimeSlots(slotsRes.data || []);
      setTimetables(ttRes.data || []);

      // Check query params first (e.g. from upload result)
      const params = new URLSearchParams(window.location.search);
      const qDept = params.get('dept');
      const qYear = params.get('year');
      const qSec = params.get('section');

      if (qYear) setSelectedYear(qYear);

      if (qDept) {
        setSelectedDept(qDept);
        if (qSec) {
          setSelectedSection(qSec);
        } else {
          const deptMatch = deptsRes.data?.find((d) =>
            (d.departmentCode && d.departmentCode.toLowerCase() === qDept.toLowerCase()) ||
            (d.departmentName && d.departmentName.toLowerCase() === qDept.toLowerCase()) ||
            String(d.departmentId) === String(qDept)
          );
          const deptId = deptMatch ? deptMatch.departmentId : null;
          const matchingSec = loadedSections.find((s) => s.departmentId === deptId);
          if (matchingSec) setSelectedSection(matchingSec.sectionName);
        }
      } else {
        // Default to first registered department
        if (deptsRes.data && deptsRes.data.length > 0) {
          const firstDept = deptsRes.data[0];
          setSelectedDept(firstDept.departmentCode || firstDept.departmentName);
          const matchingSec = loadedSections.find((s) => s.departmentId === firstDept.departmentId);
          if (matchingSec) setSelectedSection(matchingSec.sectionName);
        }
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to load timetable entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Resolve currently selected department object
  const currentDeptObj = useMemo(() => {
    if (!selectedDept) return null;
    return departments.find((d) =>
      String(d.departmentId) === String(selectedDept) ||
      (d.departmentCode && d.departmentCode.toLowerCase() === selectedDept.toLowerCase()) ||
      (d.departmentName && d.departmentName.toLowerCase() === selectedDept.toLowerCase())
    );
  }, [departments, selectedDept]);

  // Filter sections strictly by chosen department and study year (NO cross-department contamination)
  const availableSections = useMemo(() => {
    let list = sections;
    if (currentDeptObj) {
      list = list.filter((s) => s.departmentId === currentDeptObj.departmentId);
    }
    if (selectedYear) {
      list = list.filter((s) => {
        const yr = s.yearOfStudy || (s.semesterNumber ? Math.ceil(s.semesterNumber / 2) : null);
        return yr && String(yr) === String(selectedYear);
      });
    }
    return list;
  }, [sections, currentDeptObj, selectedYear]);

  // Handle department change - switches strictly to sections belonging to that department
  const handleDeptChange = (newDeptVal) => {
    setSelectedDept(newDeptVal);
    if (!newDeptVal) {
      setSelectedSection('');
      return;
    }
    const deptObj = departments.find((d) =>
      String(d.departmentId) === String(newDeptVal) ||
      (d.departmentCode && d.departmentCode.toLowerCase() === newDeptVal.toLowerCase()) ||
      (d.departmentName && d.departmentName.toLowerCase() === newDeptVal.toLowerCase())
    );
    if (deptObj) {
      let matching = sections.filter((s) => s.departmentId === deptObj.departmentId);
      if (selectedYear) {
        matching = matching.filter((s) => {
          const yr = s.yearOfStudy || (s.semesterNumber ? Math.ceil(s.semesterNumber / 2) : null);
          return yr && String(yr) === String(selectedYear);
        });
      }
      if (matching.length > 0) {
        setSelectedSection(matching[0].sectionName);
      } else {
        setSelectedSection('');
      }
    } else {
      setSelectedSection('');
    }
  };

  // Handle study year change (1st Year, 2nd Year, 3rd Year, 4th Year)
  const handleYearChange = (newYearVal) => {
    setSelectedYear(newYearVal);
    let list = sections;
    if (currentDeptObj) {
      list = list.filter((s) => s.departmentId === currentDeptObj.departmentId);
    }
    if (newYearVal) {
      list = list.filter((s) => {
        const yr = s.yearOfStudy || (s.semesterNumber ? Math.ceil(s.semesterNumber / 2) : null);
        return yr && String(yr) === String(newYearVal);
      });
    }
    if (list.length > 0) {
      setSelectedSection(list[0].sectionName);
    } else {
      setSelectedSection('');
    }
  };

  // Perspective Switcher Handler (View Schedule Separately)
  const handlePerspectiveChange = (mode) => {
    setViewPerspective(mode);
    if (mode === 'SECTION') {
      if (!selectedSection && availableSections.length > 0) {
        setSelectedSection(availableSections[0].sectionName);
      }
    } else if (mode === 'FACULTY') {
      setSelectedSection('');
      if (!selectedFaculty && faculties.length > 0) {
        setSelectedFaculty(String(faculties[0].facultyId));
      }
    } else if (mode === 'SUBJECT') {
      setSelectedSection('');
      if (!selectedSubject && subjects.length > 0) {
        setSelectedSubject(String(subjects[0].subjectId));
      }
    } else if (mode === 'ROOM') {
      setSelectedSection('');
      if (!selectedRoom && rooms.length > 0) {
        setSelectedRoom(String(rooms[0].roomId));
      }
    }
  };

  const handleSectionSelect = (secName) => {
    setSelectedSection(secName);
    if (secName) setViewPerspective('SECTION');
  };

  const handleFacultySelect = (facId) => {
    setSelectedFaculty(facId);
    if (facId) {
      setViewPerspective('FACULTY');
      setSelectedSection('');
    }
  };

  const handleSubjectSelect = (subId) => {
    setSelectedSubject(subId);
    if (subId) {
      setViewPerspective('SUBJECT');
      setSelectedSection('');
    }
  };

  const handleRoomSelect = (rmId) => {
    setSelectedRoom(rmId);
    if (rmId) {
      setViewPerspective('ROOM');
      setSelectedSection('');
    }
  };

  // Filter entries strictly by perspective, department, year, section, and slots
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (viewPerspective === 'FACULTY') {
        if (selectedFaculty && String(e.facultyId) !== String(selectedFaculty)) return false;
        if (currentDeptObj && e.departmentId && e.departmentId !== currentDeptObj.departmentId) return false;
        if (selectedSection && e.sectionName !== selectedSection) return false;
        if (selectedRoom && String(e.roomId) !== String(selectedRoom)) return false;
        if (selectedSubject && String(e.subjectId) !== String(selectedSubject)) return false;
      } else if (viewPerspective === 'ROOM') {
        if (selectedRoom && String(e.roomId) !== String(selectedRoom)) return false;
        if (currentDeptObj && e.departmentId && e.departmentId !== currentDeptObj.departmentId) return false;
        if (selectedSection && e.sectionName !== selectedSection) return false;
        if (selectedFaculty && String(e.facultyId) !== String(selectedFaculty)) return false;
        if (selectedSubject && String(e.subjectId) !== String(selectedSubject)) return false;
      } else if (viewPerspective === 'SUBJECT') {
        if (selectedSubject && String(e.subjectId) !== String(selectedSubject)) return false;
        if (currentDeptObj && e.departmentId && e.departmentId !== currentDeptObj.departmentId) return false;
        if (selectedSection && e.sectionName !== selectedSection) return false;
        if (selectedFaculty && String(e.facultyId) !== String(selectedFaculty)) return false;
        if (selectedRoom && String(e.roomId) !== String(selectedRoom)) return false;
      } else {
        // SECTION perspective
        if (currentDeptObj && e.departmentId && e.departmentId !== currentDeptObj.departmentId) return false;
        if (selectedYear) {
          const eYr = e.yearOfStudy || (e.semesterNumber ? Math.ceil(e.semesterNumber / 2) : null);
          if (eYr && String(eYr) !== String(selectedYear)) return false;
        }
        if (selectedSection && e.sectionName !== selectedSection) return false;
        if (selectedFaculty && String(e.facultyId) !== String(selectedFaculty)) return false;
        if (selectedRoom && String(e.roomId) !== String(selectedRoom)) return false;
        if (selectedSubject && String(e.subjectId) !== String(selectedSubject)) return false;
      }

      if (selectedAcademicYear && e.academicYear && e.academicYear !== selectedAcademicYear) return false;
      if (selectedSemester && e.semesterName !== selectedSemester) return false;
      if (selectedDay && e.dayOfWeek !== selectedDay) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          (e.subjectName && e.subjectName.toLowerCase().includes(q)) ||
          (e.subjectCode && e.subjectCode.toLowerCase().includes(q)) ||
          (e.facultyName && e.facultyName.toLowerCase().includes(q)) ||
          (e.roomNumber && e.roomNumber.toLowerCase().includes(q)) ||
          (e.sectionName && e.sectionName.toLowerCase().includes(q)) ||
          (e.departmentName && e.departmentName.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [
    entries,
    viewPerspective,
    currentDeptObj,
    selectedYear,
    selectedSection,
    selectedFaculty,
    selectedRoom,
    selectedSubject,
    selectedAcademicYear,
    selectedSemester,
    selectedDay,
    searchQuery
  ]);

  const clearFilters = () => {
    setSelectedAcademicYear('');
    setSelectedSemester('');
    setSelectedDept('');
    setSelectedYear('');
    setSelectedSection('');
    setSelectedFaculty('');
    setSelectedRoom('');
    setSelectedDay('');
    setSelectedSubject('');
    setSearchQuery('');
    setViewPerspective('SECTION');
  };

  // Active section details (for dynamic banner and metadata display)
  const activeSectionObj = useMemo(() => {
    if (!selectedSection) return null;
    return (
      availableSections.find((s) => s.sectionName === selectedSection) ||
      sections.find((s) => s.sectionName === selectedSection) ||
      null
    );
  }, [availableSections, sections, selectedSection]);

  // Active faculty details
  const activeFacultyObj = useMemo(() => {
    if (!selectedFaculty) return null;
    return faculties.find((f) => String(f.facultyId) === String(selectedFaculty)) || null;
  }, [faculties, selectedFaculty]);

  // Active room details
  const activeRoomObj = useMemo(() => {
    if (!selectedRoom) return null;
    return rooms.find((r) => String(r.roomId) === String(selectedRoom)) || null;
  }, [rooms, selectedRoom]);

  // Active subject details
  const activeSubjectObj = useMemo(() => {
    if (!selectedSubject) return null;
    return subjects.find((s) => String(s.subjectId) === String(selectedSubject)) || null;
  }, [subjects, selectedSubject]);

  const activeYearLabel = useMemo(() => {
    if (selectedYear) {
      if (selectedYear === '1') return '1st Year';
      if (selectedYear === '2') return '2nd Year';
      if (selectedYear === '3') return '3rd Year';
      if (selectedYear === '4') return '4th Year';
      return `Year ${selectedYear}`;
    }
    if (activeSectionObj?.yearName) return activeSectionObj.yearName;
    if (activeSectionObj?.yearOfStudy) {
      const y = activeSectionObj.yearOfStudy;
      return y === 1 ? '1st Year' : y === 2 ? '2nd Year' : y === 3 ? '3rd Year' : `${y}th Year`;
    }
    return null;
  }, [selectedYear, activeSectionObj]);

  const activeSemesterLabel = useMemo(() => {
    if (selectedSemester) return selectedSemester;
    if (activeSectionObj?.semesterNumber) return `Semester ${activeSectionObj.semesterNumber}`;
    return null;
  }, [selectedSemester, activeSectionObj]);

  // Conflict Auditor Scope state ('CURRENT' section or 'ALL' sections)
  const [conflictScope, setConflictScope] = useState('CURRENT');

  // Real-Time Timetable Conflict Auditor (Detects Faculty and Classroom/Room Conflicts)
  const conflictReport = useMemo(() => {
    const targetSection = conflictScope === 'CURRENT' ? selectedSection : null;
    const facultyConflicts = [];
    const roomConflicts = [];
    const activeEntries = entries.filter((e) => e.status === 'ACTIVE');

    for (let i = 0; i < activeEntries.length; i++) {
      for (let j = i + 1; j < activeEntries.length; j++) {
        const e1 = activeEntries[i];
        const e2 = activeEntries[j];

        // Must match day of week and timeSlotId (or periodNumber)
        const isSameTime =
          e1.dayOfWeek === e2.dayOfWeek &&
          (String(e1.timeSlotId) === String(e2.timeSlotId) ||
            (e1.periodNumber && e2.periodNumber && Number(e1.periodNumber) === Number(e2.periodNumber)));

        if (isSameTime) {
          // If checking for current section, at least one entry must belong to targetSection
          if (targetSection && e1.sectionName !== targetSection && e2.sectionName !== targetSection) {
            continue;
          }

          // 1. Faculty Conflict: same instructor double-booked at the same time
          if (e1.facultyId && e2.facultyId && String(e1.facultyId) === String(e2.facultyId)) {
            facultyConflicts.push({
              id: `fac-${e1.entryId}-${e2.entryId}`,
              type: 'FACULTY',
              dayOfWeek: e1.dayOfWeek,
              periodNumber: e1.periodNumber || e2.periodNumber,
              startTime: e1.startTime || e2.startTime,
              endTime: e1.endTime || e2.endTime,
              facultyName: e1.facultyName,
              facultyCode: e1.facultyCode,
              entry1: e1,
              entry2: e2,
              reason: `Instructor ${e1.facultyName} (${e1.facultyCode || 'N/A'}) is double-booked: assigned to both "${e1.subjectName}" [${e1.sectionName}] and "${e2.subjectName}" [${e2.sectionName}] during the same period.`
            });
          }

          // 2. Classroom / Room Conflict: same room double-booked at the same time
          if (e1.roomId && e2.roomId && String(e1.roomId) === String(e2.roomId)) {
            roomConflicts.push({
              id: `room-${e1.entryId}-${e2.entryId}`,
              type: 'ROOM',
              dayOfWeek: e1.dayOfWeek,
              periodNumber: e1.periodNumber || e2.periodNumber,
              startTime: e1.startTime || e2.startTime,
              endTime: e1.endTime || e2.endTime,
              roomNumber: e1.roomNumber,
              roomName: e1.roomName,
              entry1: e1,
              entry2: e2,
              reason: `Classroom ${e1.roomNumber} (${e1.roomName || 'Lecture Hall'}) is double-booked: occupied by "${e1.subjectName}" [${e1.sectionName}] and "${e2.subjectName}" [${e2.sectionName}] during the same period.`
            });
          }
        }
      }
    }

    return {
      facultyConflicts,
      roomConflicts,
      total: facultyConflicts.length + roomConflicts.length
    };
  }, [entries, selectedSection, conflictScope]);

  // Build grid periods from timeSlots
  const sortedSlots = [...timeSlots].sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0));

  // Get entries for a specific day and period
  const getCellEntries = (day, slot) => {
    return filteredEntries.filter(
      (e) =>
        e.dayOfWeek === day &&
        (e.timeSlotId === slot.timeSlotId ||
          (e.startTime === slot.startTime && e.periodNumber === slot.periodNumber))
    );
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setFormError(null);
    setIsEditing(false);
    setFormData({
      entryId: null,
      timetableId: timetables[0]?.timetableId || '',
      dayOfWeek: 'MONDAY',
      timeSlotId: sortedSlots[0]?.timeSlotId || '',
      subjectId: subjects[0]?.subjectId || '',
      facultyId: faculties[0]?.facultyId || '',
      roomId: rooms[0]?.roomId || '',
      status: 'ACTIVE'
    });
    setIsFormModalOpen(true);
  };

  // Open Edit modal from Detail view
  const handleOpenEdit = (entry) => {
    setIsDetailModalOpen(false);
    setFormError(null);
    setIsEditing(true);
    setFormData({
      entryId: entry.entryId,
      timetableId: entry.timetableId || timetables[0]?.timetableId || '',
      dayOfWeek: entry.dayOfWeek || 'MONDAY',
      timeSlotId: entry.timeSlotId || '',
      subjectId: entry.subjectId || '',
      facultyId: entry.facultyId || '',
      roomId: entry.roomId || '',
      status: entry.status || 'ACTIVE'
    });
    setIsFormModalOpen(true);
  };

  // Open Delete confirmation
  const handleOpenDelete = (entry) => {
    setIsDetailModalOpen(false);
    setEntryToDelete(entry);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await timetableService.deleteEntry(entryToDelete.entryId);
      setEntries((prev) => prev.filter((e) => e.entryId !== entryToDelete.entryId));
      setIsDeleteModalOpen(false);
      setEntryToDelete(null);
      setSuccessMessage('Timetable schedule entry deleted successfully.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to delete timetable entry.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Submit Add or Edit
  const handleSaveEntry = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        timetableId: Number(formData.timetableId),
        dayOfWeek: formData.dayOfWeek,
        timeSlotId: Number(formData.timeSlotId),
        subjectId: Number(formData.subjectId),
        facultyId: Number(formData.facultyId),
        roomId: Number(formData.roomId),
        status: formData.status
      };

      if (isEditing && formData.entryId) {
        await timetableService.updateEntry(formData.entryId, payload);
        setSuccessMessage('Timetable entry updated successfully.');
      } else {
        await timetableService.createEntry(payload);
        setSuccessMessage('New timetable entry scheduled successfully.');
      }

      setIsFormModalOpen(false);
      await loadData();
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get active section metadata
  const currentSectionMeta = sections.find((s) => s.sectionName === selectedSection);

  return (
    <div className="space-y-4">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Master Timetable Management</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Academic Schedule Matrix
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('WEEKLY')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xs transition-all ${
                viewMode === 'WEEKLY'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GridIcon className="w-3.5 h-3.5" />
              <span>Weekly View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xs transition-all ${
                viewMode === 'LIST'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/upload')}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Upload PDF</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* 2. Top Filter Bar with Perspective Modes & Dedicated Prominent Boxes */}
      <div className="card p-4 bg-white border border-slate-200 shadow-sm">
        {/* Row 1: Perspective Selector Buttons & Quick Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3.5 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mr-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span>View Timetable Separately:</span>
            </span>

            {/* View by Section */}
            <button
              type="button"
              onClick={() => handlePerspectiveChange('SECTION')}
              className={`btn-perspective ${viewPerspective === 'SECTION' ? 'active' : ''}`}
              title="View timetable for a selected student section"
            >
              <Users className="w-3.5 h-3.5" />
              <span>By Section</span>
              {selectedSection && <span className="pill-active">{selectedSection}</span>}
            </button>

            {/* View by Faculty */}
            <button
              type="button"
              onClick={() => handlePerspectiveChange('FACULTY')}
              className={`btn-perspective ${viewPerspective === 'FACULTY' ? 'active' : ''}`}
              title="View complete weekly teaching schedule for a faculty member"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>By Faculty</span>
              {activeFacultyObj && (
                <span className="pill-active">{activeFacultyObj.facultyName}</span>
              )}
            </button>

            {/* View by Subject */}
            <button
              type="button"
              onClick={() => handlePerspectiveChange('SUBJECT')}
              className={`btn-perspective ${viewPerspective === 'SUBJECT' ? 'active' : ''}`}
              title="View all scheduled lectures for a specific course/subject"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>By Subject</span>
              {activeSubjectObj && (
                <span className="pill-active">
                  {activeSubjectObj.subjectCode || activeSubjectObj.subjectName}
                </span>
              )}
            </button>

            {/* View by Room */}
            <button
              type="button"
              onClick={() => handlePerspectiveChange('ROOM')}
              className={`btn-perspective ${viewPerspective === 'ROOM' ? 'active' : ''}`}
              title="View classroom/lab occupancy and utilization schedule"
            >
              <DoorOpen className="w-3.5 h-3.5" />
              <span>By Room</span>
              {activeRoomObj && (
                <span className="pill-active">Room {activeRoomObj.roomNumber}</span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="btn btn-secondary btn-sm text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5"
            title="Reset all filters to campus defaults"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>

        {/* Department Separation Quick Buttons */}
        <div className="flex flex-wrap items-center gap-2 pb-3 mb-3.5 border-b border-slate-100">
          <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mr-1 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-indigo-600" />
            <span>Separate Department:</span>
          </span>

          <button
            type="button"
            onClick={() => handleDeptChange('')}
            className={`btn-perspective ${!selectedDept ? 'active' : ''}`}
            title="Show all campus departments combined"
          >
            <span>All Departments</span>
            <span className="pill-active">{entries.length} slots</span>
          </button>

          {departments.map((d) => {
            const isSelected =
              selectedDept &&
              (String(d.departmentId) === String(selectedDept) ||
                (d.departmentCode && d.departmentCode.toLowerCase() === selectedDept.toLowerCase()) ||
                (d.departmentName && d.departmentName.toLowerCase() === selectedDept.toLowerCase()));
            const countInDept = entries.filter((e) => e.departmentId === d.departmentId).length;
            return (
              <button
                key={d.departmentId}
                type="button"
                onClick={() => handleDeptChange(isSelected ? '' : (d.departmentCode || d.departmentName))}
                className={`btn-perspective ${isSelected ? 'active' : ''}`}
                title={`Show only ${d.departmentName}`}
              >
                <span>{d.departmentName} ({d.departmentCode})</span>
                <span className="pill-active">{countInDept} slots</span>
              </button>
            );
          })}
        </div>

        {/* Row 2: 6 Dedicated Prominent Filter Boxes (Styled Exactly as Requested) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* 1. DEPARTMENT Box */}
          <div className="filter-field-box">
            <label className="filter-field-label">
              <span>Department</span>
              <span className="filter-badge">({departments.length})</span>
            </label>
            <select
              value={selectedDept}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="filter-field-select"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentCode || d.departmentName}>
                  {d.departmentName} ({d.departmentCode})
                </option>
              ))}
            </select>
          </div>

          {/* 2. STUDY YEAR Box */}
          <div className="filter-field-box">
            <label className="filter-field-label">
              <span>Study Year</span>
              <span className="filter-badge">
                {selectedYear
                  ? `${selectedYear === '1' ? '1st' : selectedYear === '2' ? '2nd' : selectedYear === '3' ? '3rd' : '4th'} Yr`
                  : 'All Years'}
              </span>
            </label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="filter-field-select"
            >
              <option value="">All Study Years</option>
              <option value="1">1st Year (I B.Tech / Sem 1-2)</option>
              <option value="2">2nd Year (II B.Tech / Sem 3-4)</option>
              <option value="3">3rd Year (III B.Tech / Sem 5-6)</option>
              <option value="4">4th Year (IV B.Tech / Sem 7-8)</option>
            </select>
          </div>

          {/* 3. SECTION Box */}
          <div
            className={`filter-field-box ${
              viewPerspective === 'SECTION' ? 'active-perspective' : ''
            }`}
          >
            <label className="filter-field-label">
              <span>Section</span>
              <span className="filter-badge">({availableSections.length})</span>
            </label>
            <select
              value={selectedSection}
              onChange={(e) => handleSectionSelect(e.target.value)}
              className="filter-field-select"
            >
              <option value="">All Sections {selectedDept ? `(${selectedDept})` : ''}</option>
              {availableSections.map((s) => (
                <option key={s.sectionId} value={s.sectionName}>
                  Section: {s.sectionName} {s.yearName ? `(${s.yearName})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 4. FACULTY Box */}
          <div
            className={`filter-field-box ${
              viewPerspective === 'FACULTY' ? 'active-perspective' : ''
            }`}
          >
            <label className="filter-field-label">
              <span>Faculty</span>
              <span className="filter-badge">({faculties.length})</span>
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => handleFacultySelect(e.target.value)}
              className="filter-field-select"
            >
              <option value="">All Faculty Members</option>
              {faculties.map((f) => (
                <option key={f.facultyId} value={f.facultyId}>
                  {f.facultyName} {f.facultyCode ? `(${f.facultyCode})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 5. SUBJECT Box */}
          <div
            className={`filter-field-box ${
              viewPerspective === 'SUBJECT' ? 'active-perspective' : ''
            }`}
          >
            <label className="filter-field-label">
              <span>Subject</span>
              <span className="filter-badge">({subjects.length})</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectSelect(e.target.value)}
              className="filter-field-select"
            >
              <option value="">All Course Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.subjectId} value={sub.subjectId}>
                  {sub.subjectName} {sub.subjectCode ? `(${sub.subjectCode})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 6. ROOMS Box */}
          <div
            className={`filter-field-box ${
              viewPerspective === 'ROOM' ? 'active-perspective' : ''
            }`}
          >
            <label className="filter-field-label">
              <span>Rooms</span>
              <span className="filter-badge">({rooms.length})</span>
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => handleRoomSelect(e.target.value)}
              className="filter-field-select"
            >
              <option value="">All Rooms & Labs</option>
              {rooms.map((r) => (
                <option key={r.roomId} value={r.roomId}>
                  Room {r.roomNumber} {r.roomType ? `(${r.roomType})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Secondary Refinements (Academic Year, Semester, Day, Search) */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
          <div className="w-32">
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="select text-xs h-8 py-1"
            >
              <option value="">All AYs</option>
              {academicYears.map((ay) => (
                <option key={ay.academicYearId} value={ay.academicYear}>
                  {ay.academicYear}
                </option>
              ))}
            </select>
          </div>

          <div className="w-32">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="select text-xs h-8 py-1"
            >
              <option value="">All Sems</option>
              {semesters.map((sem) => (
                <option key={sem.semesterId} value={sem.semesterName}>
                  {sem.semesterName}
                </option>
              ))}
            </select>
          </div>

          <div className="w-32">
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="select text-xs h-8 py-1"
            >
              <option value="">All Days</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Quick search by subject, faculty, room or section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-8 text-xs h-8"
            />
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="btn btn-secondary text-xs h-8 px-2"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
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

      {/* 3. Schedule Perspective Header Banner */}
      <div className="section-banner-card">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {/* Perspective Mode Badge */}
            <span className="badge badge-primary bg-indigo-500/25 text-indigo-200 border-indigo-400/40 text-[11px] font-bold">
              {viewPerspective === 'FACULTY'
                ? '👨‍🏫 FACULTY SCHEDULE'
                : viewPerspective === 'ROOM'
                ? '🏛️ ROOM SCHEDULE'
                : viewPerspective === 'SUBJECT'
                ? '📚 SUBJECT SCHEDULE'
                : '👥 SECTION SCHEDULE'}
            </span>

            {/* Target Entity Badge */}
            {viewPerspective === 'FACULTY' && activeFacultyObj && (
              <span className="badge badge-secondary bg-slate-800 text-slate-200 border-slate-700 text-[11px]">
                Faculty: {activeFacultyObj.facultyName} ({activeFacultyObj.facultyCode || 'FAC'})
              </span>
            )}
            {viewPerspective === 'ROOM' && activeRoomObj && (
              <span className="badge badge-secondary bg-slate-800 text-slate-200 border-slate-700 text-[11px]">
                Room {activeRoomObj.roomNumber} • {activeRoomObj.roomType || 'Lecture Hall'}
              </span>
            )}
            {viewPerspective === 'SUBJECT' && activeSubjectObj && (
              <span className="badge badge-secondary bg-slate-800 text-slate-200 border-slate-700 text-[11px]">
                {activeSubjectObj.subjectCode} • {activeSubjectObj.subjectName}
              </span>
            )}
            {viewPerspective === 'SECTION' && (
              <span className="badge badge-primary bg-indigo-500/20 text-indigo-200 border-indigo-400/30 text-[11px]">
                {selectedSection ? `Section: ${selectedSection}` : 'All Sections Overview'}
              </span>
            )}

            {/* Year Badge */}
            {activeYearLabel && (
              <span className="badge badge-secondary bg-indigo-900/60 text-indigo-200 border-indigo-600/50 text-[11px]">
                {activeYearLabel}
              </span>
            )}

            {/* Semester Badge */}
            {activeSemesterLabel && (
              <span className="badge badge-secondary bg-slate-800 text-slate-300 border-slate-700 text-[11px]">
                {activeSemesterLabel}
              </span>
            )}

            <span className="badge badge-secondary bg-slate-800 text-slate-300 border-slate-700 text-[11px]">
              {academicYears.find((ay) => ay.academicYearId === activeSectionObj?.academicYearId)?.yearCode || 'AY 2026–2027'}
            </span>
          </div>

          <h2 className="section-banner-title">
            {viewPerspective === 'FACULTY'
              ? activeFacultyObj
                ? `${activeFacultyObj.facultyName} — Weekly Teaching Timetable`
                : 'Faculty Master Schedule (All Faculty)'
              : viewPerspective === 'ROOM'
              ? activeRoomObj
                ? `Room ${activeRoomObj.roomNumber} — Classroom Utilization Timetable`
                : 'Campus Classroom Master Schedule'
              : viewPerspective === 'SUBJECT'
              ? activeSubjectObj
                ? `${activeSubjectObj.subjectName} — Course Lecture Timetable`
                : 'Subject Lecture Master Schedule'
              : selectedSection
              ? `${selectedSection}${activeYearLabel ? ` (${activeYearLabel})` : ''} — Weekly Timetable`
              : `${currentDeptObj ? currentDeptObj.departmentName : 'Master'} — Weekly Timetable`}
          </h2>

          <p className="section-banner-subtitle">
            {viewPerspective === 'FACULTY'
              ? `Instructor Weekly Lecture Load across Sections • ${activeFacultyObj?.departmentName || currentDeptObj?.departmentName || 'All Departments'} • Anurag University`
              : viewPerspective === 'ROOM'
              ? `Classroom Occupancy & Allocation • Capacity: ${activeRoomObj?.capacity || '60'} Seats • Anurag University`
              : viewPerspective === 'SUBJECT'
              ? `Course Lecture Delivery Schedule across Sections • Anurag University`
              : `${currentDeptObj ? currentDeptObj.departmentName : 'All Engineering Departments'} • School of Engineering • Anurag University`}
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-xs text-slate-400">Scheduled Periods</div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {filteredEntries.length}
          </div>
        </div>
      </div>

      {/* 4. Display Content: Weekly Matrix OR List View */}
      {viewMode === 'WEEKLY' ? (
        /* WEEKLY VIEW MATRIX */
        <div className="card overflow-hidden bg-white border border-slate-200">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>WEEKLY TIMETABLE (MONDAY – SATURDAY)</span>
            <span className="text-slate-500">
              Showing {filteredEntries.length} periods for{' '}
              {viewPerspective === 'FACULTY'
                ? activeFacultyObj
                  ? activeFacultyObj.facultyName
                  : 'All Faculty'
                : viewPerspective === 'ROOM'
                ? activeRoomObj
                  ? `Room ${activeRoomObj.roomNumber}`
                  : 'All Rooms'
                : viewPerspective === 'SUBJECT'
                ? activeSubjectObj
                  ? activeSubjectObj.subjectName
                  : 'All Subjects'
                : selectedSection || 'All Sections'}
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
                      Loading timetable grid...
                    </td>
                  </tr>
                ) : sortedSlots.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      No lecture time slots configured.
                    </td>
                  </tr>
                ) : (
                  sortedSlots.map((slot) => (
                    <tr key={slot.timeSlotId}>
                      {/* Period Header Column */}
                      <td className="timetable-period-th">
                        <div className="period-title font-bold text-slate-800">Period {slot.periodNumber}</div>
                        <div className="period-time-range font-mono text-[11px] text-slate-600 whitespace-nowrap font-semibold mt-0.5">
                          {format12HourRange(slot.startTime, slot.endTime)}
                        </div>
                      </td>

                      {/* Day Columns */}
                      {DAYS.map((day) => {
                        const cellEntries = getCellEntries(day, slot);
                        return (
                          <td key={day}>
                            {cellEntries.length === 0 ? (
                              <div
                                onClick={() => {
                                  setFormData({
                                    entryId: null,
                                    timetableId: '',
                                    dayOfWeek: day,
                                    timeSlotId: slot.timeSlotId,
                                    subjectId: viewPerspective === 'SUBJECT' ? (selectedSubject || '') : '',
                                    facultyId: viewPerspective === 'FACULTY' ? (selectedFaculty || '') : '',
                                    roomId: viewPerspective === 'ROOM' ? (selectedRoom || '') : '',
                                    status: 'ACTIVE'
                                  });
                                  setIsEditing(false);
                                  setIsFormModalOpen(true);
                                }}
                                className="timetable-cell-empty cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors group flex items-center justify-center p-2 rounded"
                                title={`Click to assign lecture on ${day} Period ${slot.periodNumber}`}
                              >
                                <span className="text-[11px] font-semibold text-slate-300 group-hover:text-indigo-600 transition-colors">
                                  {viewPerspective === 'FACULTY'
                                    ? 'Faculty Free'
                                    : viewPerspective === 'ROOM'
                                    ? 'Room Vacant'
                                    : 'Free Period'}
                                </span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {cellEntries.map((e) => (
                                  <div
                                    key={e.entryId}
                                    onClick={() => {
                                      setSelectedEntry(e);
                                      setIsDetailModalOpen(true);
                                    }}
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

                                    <div className="timetable-cell-faculty">
                                      <User className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                                      <span className="truncate">{e.facultyName}</span>
                                    </div>

                                    <div className="timetable-cell-footer">
                                      <span className="timetable-cell-room">
                                        <DoorOpen className="w-2.5 h-2.5 text-slate-400" />
                                        <span>Room {e.roomNumber}</span>
                                      </span>
                                      {/* Show section tag if viewing all sections or not in pure SECTION mode */}
                                      {(!selectedSection || viewPerspective !== 'SECTION') && (
                                        <span className="badge badge-primary text-[9px] py-0 px-1 font-mono font-bold bg-indigo-50 text-indigo-700 border-indigo-200">
                                          {e.sectionName}
                                        </span>
                                      )}
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          e.status === 'ACTIVE'
                                            ? 'bg-emerald-500'
                                            : e.status === 'CANCELLED'
                                            ? 'bg-rose-500'
                                            : 'bg-amber-500'
                                        }`}
                                        title={`Status: ${e.status}`}
                                      />
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
      ) : (
        /* LIST VIEW TABLE */
        <div className="card overflow-hidden bg-white border border-slate-200">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>TIMETABLE ROSTER (LIST VIEW)</span>
            <span className="text-slate-500">
              Total {filteredEntries.length} entries matching criteria
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time Period</th>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Faculty</th>
                  <th>Room</th>
                  <th>Section</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
                      Loading entries...
                    </td>
                  </tr>
                ) : filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No timetable entries found. Try changing the selected section or filters.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((e) => (
                    <tr key={e.entryId}>
                      <td className="font-semibold text-slate-800 text-xs">{e.dayOfWeek}</td>
                      <td className="font-mono text-xs text-slate-600 whitespace-nowrap">
                        {format12HourRange(e.startTime, e.endTime)} (P{e.periodNumber})
                      </td>
                      <td className="font-bold text-slate-900 text-xs">{e.subjectName}</td>
                      <td>
                        <span className="font-mono text-[11px] text-indigo-600 font-semibold">
                          {e.subjectCode || '—'}
                        </span>
                      </td>
                      <td className="text-xs text-slate-700">{e.facultyName}</td>
                      <td>
                        <span className="badge badge-secondary text-xs">Room {e.roomNumber}</span>
                      </td>
                      <td>
                        <span className="badge badge-primary text-xs">{e.sectionName}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            e.status === 'ACTIVE'
                              ? 'badge-success'
                              : e.status === 'CANCELLED'
                              ? 'badge-danger'
                              : 'badge-warning'
                          } text-xs`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEntry(e);
                              setIsDetailModalOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            title="View Details"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(e)}
                            className="btn btn-secondary btn-sm"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3 text-indigo-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(e)}
                            className="btn btn-secondary btn-sm text-rose-600 hover:text-rose-800"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4.5 Timetable Schedule Conflict & Integrity Auditor (At the end of timetable section) */}
      <div className="card overflow-hidden bg-white border border-slate-200 shadow-xs">
        {/* Section Header */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              {conflictReport.total === 0 ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              )}
              <h3 className="text-xs font-black tracking-wider text-slate-800 uppercase">
                Timetable Conflict & Schedule Integrity Auditor
              </h3>
              <span className={`badge text-[10px] font-bold ${
                conflictReport.total === 0 ? 'badge-success' : 'badge-danger'
              }`}>
                {conflictReport.total === 0 ? '✓ Verified Conflict-Free' : `⚠️ ${conflictReport.total} Conflicts Found`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Automated institutional verification of faculty double-booking and classroom / room occupancy constraints.
            </p>
          </div>

          {/* Scope Selector */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setConflictScope('CURRENT')}
              className={`px-3 py-1 rounded-md transition-all ${
                conflictScope === 'CURRENT'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Current Section ({selectedSection || 'All'})
            </button>
            <button
              type="button"
              onClick={() => setConflictScope('ALL')}
              className={`px-3 py-1 rounded-md transition-all ${
                conflictScope === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Sections Master Audit
            </button>
          </div>
        </div>

        <div className="p-4">
          {conflictReport.total === 0 ? (
            /* CASE 1: NO CONFLICTS OCCUR */
            <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-950">
                    ✓ No Conflicts Detected in Timetable Schedule
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Schedule audit verified for {conflictScope === 'CURRENT' && selectedSection ? `Section ${selectedSection}` : 'All Sections'}. All timetable entries are 100% collision-free.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/70">
                {/* Faculty Conflict Card */}
                <div className="p-3 bg-white rounded-md border border-emerald-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Faculty Conflict Status</span>
                    </span>
                    <span className="badge badge-success text-[10px] font-bold">✓ No Conflict Occurs</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    All instructors have mutually exclusive teaching schedules. No faculty member is scheduled to teach multiple classes simultaneously during any period.
                  </p>
                </div>

                {/* Classroom / Room Conflict Card */}
                <div className="p-3 bg-white rounded-md border border-emerald-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Classroom Conflict Status</span>
                    </span>
                    <span className="badge badge-success text-[10px] font-bold">✓ No Conflict Occurs</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    All lecture halls and classrooms have single-class occupancy. No room is assigned to multiple classes during the same time window.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* CASE 2: CONFLICTS OCCUR */
            <div className="rounded-lg bg-rose-50/60 border border-rose-300 p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-rose-950 flex items-center gap-2">
                      <span>⚠️ {conflictReport.total} Schedule Conflict{conflictReport.total > 1 ? 's' : ''} Detected!</span>
                      <span className="badge badge-danger text-[10px] font-mono">Action Required</span>
                    </h4>
                    <p className="text-xs text-rose-700 mt-0.5 font-medium">
                      {conflictReport.facultyConflicts.length} Faculty Conflict{conflictReport.facultyConflicts.length !== 1 ? 's' : ''} • {conflictReport.roomConflicts.length} Classroom Conflict{conflictReport.roomConflicts.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Prompt Admin to Modify */}
                <div className="bg-white px-3.5 py-2.5 rounded-md border border-rose-200 text-xs shadow-xs text-slate-800 max-w-md">
                  <span className="font-bold text-rose-700 block mb-0.5">Admin Decision Required:</span>
                  <span>Conflicts occurred in the schedule. Do you want me to modify or resolve these conflicting timetable entries? Select an entry below to modify or reassign.</span>
                </div>
              </div>

              {/* Conflict Items List */}
              <div className="space-y-3 pt-1">
                {/* Faculty Conflicts */}
                {conflictReport.facultyConflicts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 bg-white rounded-md border border-rose-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="badge badge-danger text-[10px] font-bold">🔴 Faculty Conflict</span>
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {c.dayOfWeek} • Period {c.periodNumber} ({format12HourRange(c.startTime, c.endTime)})
                        </span>
                      </div>
                      <div className="text-xs text-slate-900 font-semibold flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Conflicting Faculty: <strong>{c.facultyName}</strong> ({c.facultyCode || 'N/A'})</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {c.reason}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2 rounded border border-slate-100 text-[11px] font-mono">
                        <div>
                          <strong className="text-slate-700">Class 1:</strong> [{c.entry1.sectionName}] {c.entry1.subjectName} in Room {c.entry1.roomNumber}
                        </div>
                        <div>
                          <strong className="text-slate-700">Class 2:</strong> [{c.entry2.sectionName}] {c.entry2.subjectName} in Room {c.entry2.roomNumber}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c.entry1)}
                        className="btn btn-primary btn-sm text-xs flex items-center gap-1 shadow-xs"
                        title="Modify Class 1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Modify [{c.entry1.sectionName}]</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c.entry2)}
                        className="btn btn-secondary btn-sm text-xs flex items-center gap-1"
                        title="Modify Class 2"
                      >
                        <Edit className="w-3 h-3 text-indigo-600" />
                        <span>Modify [{c.entry2.sectionName}]</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(c.entry2)}
                        className="btn btn-secondary btn-sm text-rose-600 hover:text-rose-800 text-xs"
                        title="Delete Duplicate Entry"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Classroom / Room Conflicts */}
                {conflictReport.roomConflicts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 bg-white rounded-md border border-amber-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="badge badge-warning text-[10px] font-bold">🟡 Classroom Conflict</span>
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {c.dayOfWeek} • Period {c.periodNumber} ({format12HourRange(c.startTime, c.endTime)})
                        </span>
                      </div>
                      <div className="text-xs text-slate-900 font-semibold flex items-center gap-1.5">
                        <DoorOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Conflicting Classroom: <strong>Room {c.roomNumber}</strong> ({c.roomName || 'Lecture Hall'})</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {c.reason}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2 rounded border border-slate-100 text-[11px] font-mono">
                        <div>
                          <strong className="text-slate-700">Class 1:</strong> [{c.entry1.sectionName}] {c.entry1.subjectName} with {c.entry1.facultyName}
                        </div>
                        <div>
                          <strong className="text-slate-700">Class 2:</strong> [{c.entry2.sectionName}] {c.entry2.subjectName} with {c.entry2.facultyName}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c.entry1)}
                        className="btn btn-primary btn-sm text-xs flex items-center gap-1 shadow-xs"
                        title="Modify Class 1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Modify [{c.entry1.sectionName}]</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c.entry2)}
                        className="btn btn-secondary btn-sm text-xs flex items-center gap-1"
                        title="Modify Class 2"
                      >
                        <Edit className="w-3 h-3 text-indigo-600" />
                        <span>Modify [{c.entry2.sectionName}]</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(c.entry2)}
                        className="btn btn-secondary btn-sm text-rose-600 hover:text-rose-800 text-xs"
                        title="Delete Duplicate Entry"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Class Details Modal (Item 5 from prompt) */}
      {isDetailModalOpen && selectedEntry && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <span className="badge badge-primary text-xs">{selectedEntry.dayOfWeek}</span>
                <span className="badge badge-secondary text-xs">Period {selectedEntry.periodNumber}</span>
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
                <h3 className="text-base font-bold text-slate-900">{selectedEntry.subjectName}</h3>
                <span className="font-mono text-xs text-indigo-600 font-bold">
                  Course Code: {selectedEntry.subjectCode || '—'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-md border border-slate-200">
                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Faculty Member</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedEntry.facultyName}</div>
                  <div className="text-slate-500 font-mono text-[11px]">{selectedEntry.facultyCode || ''}</div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Location</div>
                  <div className="font-semibold text-slate-800 mt-0.5">Room {selectedEntry.roomNumber}</div>
                  <div className="text-slate-500 text-[11px]">{selectedEntry.roomName || 'Lecture Hall'}</div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Class / Section</div>
                  <div className="font-semibold text-indigo-700 mt-0.5">{selectedEntry.sectionName}</div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">Time Window</div>
                  <div className="font-mono font-semibold text-slate-800 mt-0.5">
                    {format12HourRange(selectedEntry.startTime, selectedEntry.endTime)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Record Status:</span>
                <span className="badge badge-success text-xs font-semibold">{selectedEntry.status}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => handleOpenDelete(selectedEntry)}
                className="btn btn-secondary text-rose-600 hover:text-rose-700 text-xs flex items-center gap-1.5 mr-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenEdit(selectedEntry)}
                className="btn btn-secondary text-xs flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5 text-indigo-600" />
                <span>Edit</span>
              </button>
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

      {/* 6. Add/Edit Entry Form Modal */}
      {isFormModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog max-w-md">
            <div className="modal-header">
              <h3 className="modal-title">
                {isEditing ? 'Edit Timetable Schedule Entry' : 'Schedule New Timetable Period'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="modal-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry}>
              <div className="modal-body space-y-3">
                {formError && (
                  <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Day of Week */}
                <div>
                  <label className="label">Day of Week</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="select text-xs"
                    required
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Time Slot */}
                <div>
                  <label className="label">Time Period Slot</label>
                  <select
                    value={formData.timeSlotId}
                    onChange={(e) => setFormData({ ...formData, timeSlotId: e.target.value })}
                    className="select text-xs"
                    required
                  >
                    <option value="">Select Period</option>
                    {sortedSlots.map((s) => (
                      <option key={s.timeSlotId} value={s.timeSlotId}>
                        Period {s.periodNumber} ({format12HourRange(s.startTime, s.endTime)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="label">Course / Subject</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="select text-xs"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub.subjectId} value={sub.subjectId}>
                        {sub.subjectName} ({sub.subjectCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Faculty */}
                <div>
                  <label className="label">Teaching Faculty</label>
                  <select
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
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

                {/* Room */}
                <div>
                  <label className="label">Classroom / Lab</label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="select text-xs"
                    required
                  >
                    <option value="">Select Room</option>
                    {rooms.map((r) => (
                      <option key={r.roomId} value={r.roomId}>
                        Room {r.roomNumber} ({r.roomType || 'Hall'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
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
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Entry' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      {isDeleteModalOpen && entryToDelete && (
        <div className="modal-backdrop">
          <div className="modal-dialog max-w-sm">
            <div className="modal-header">
              <h3 className="modal-title text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Confirm Deletion</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="modal-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body text-xs text-slate-600 space-y-2">
              <p>
                Are you sure you want to delete this scheduled class period for{' '}
                <strong className="text-slate-900">{entryToDelete.subjectName}</strong>?
              </p>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] font-mono">
                {entryToDelete.dayOfWeek} • Period {entryToDelete.periodNumber} • {entryToDelete.sectionName}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn btn-secondary text-xs"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn btn-danger text-xs"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
