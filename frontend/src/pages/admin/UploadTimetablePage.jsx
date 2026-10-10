import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadService, metadataService } from '../../services/api';
import { format12HourRange } from '../../utils/formatters';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Clock,
  Layers,
  Calendar,
  RefreshCw,
  FileUp,
  X,
  Eye,
  Building2,
  Sparkles,
  Plus
} from 'lucide-react';

const STEPS = [
  'Uploading',
  'Reading PDF',
  'Detecting Department & Sections',
  'Extracting Timetable',
  'Checking Conflicts',
  'Registering in Database',
  'Completed'
];

export default function UploadTimetablePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Department configuration mode ('AUTO', 'EXISTING', 'NEW')
  const [departments, setDepartments] = useState([]);
  const [deptMode, setDeptMode] = useState('AUTO');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [selectedYearOfStudy, setSelectedYearOfStudy] = useState('');

  useEffect(() => {
    metadataService.getDepartments()
      .then((res) => setDepartments(res.data || []))
      .catch((err) => console.warn('Could not load departments:', err));
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Only PDF documents (.pdf) are permitted.');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setErrorMessage(null);
    setUploadResult(null);
    setCurrentStepIndex(-1);
  };

  const handleCancelSelection = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    setUploadResult(null);
    setCurrentStepIndex(-1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setUploadResult(null);

    // Simulate progressive UX steps while sending real multipart payload
    setCurrentStepIndex(0); // Uploading
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 450);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      if (deptMode === 'EXISTING' && selectedDeptId) {
        formData.append('departmentId', selectedDeptId);
      } else if (deptMode === 'NEW' && newDeptName && newDeptCode) {
        formData.append('departmentName', newDeptName.trim());
        formData.append('departmentCode', newDeptCode.trim().toUpperCase());
      }

      if (selectedYearOfStudy) {
        formData.append('yearOfStudy', selectedYearOfStudy);
      }

      const response = await uploadService.uploadPdf(formData);

      clearInterval(stepInterval);
      setCurrentStepIndex(5); // Saving
      setTimeout(() => {
        setCurrentStepIndex(6); // Completed
        setUploadResult(response.data);
        setIsProcessing(false);
        // Refresh departments list in case a new department was auto-created
        metadataService.getDepartments()
          .then((res) => setDepartments(res.data || []))
          .catch(() => {});
      }, 500);

    } catch (err) {
      clearInterval(stepInterval);
      setIsProcessing(false);
      setCurrentStepIndex(-1);
      const msg = err.response?.data?.message || err.message || 'Failed to upload and parse timetable PDF.';
      setErrorMessage(msg);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Multi-Department PDF Ingestion Engine</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Timetable PDF Upload & Extraction
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Upload timetable files for any department (AIML, CSE, ECE, Civil, Mech, IT, etc.) for automated parsing, section discovery, and registration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/upload-history')}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>View Audit History</span>
          </button>
        </div>
      </div>

      {/* Upload Zone Card */}
      <div className="card p-5 bg-white border border-slate-200">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
          <span>Select Timetable Document (.pdf)</span>
          <span className="text-[11px] text-slate-500 font-normal">Accepts all departmental schedule layouts</span>
        </h2>

        {/* Drag and Drop Container */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50'
              : selectedFile
              ? 'border-emerald-400 bg-emerald-50/20'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            disabled={isProcessing}
          />

          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              selectedFile
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-indigo-100 text-indigo-600'
            }`}>
              {selectedFile ? <FileText className="w-6 h-6" /> : <FileUp className="w-6 h-6" />}
            </div>

            {selectedFile ? (
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  File Size: {formatFileSize(selectedFile.size)} • Ready for automated Apache PDFBox parsing
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Drag and drop timetable PDF here, or <span className="text-indigo-600 underline">browse file</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload PDF schedules for AIML, CSE, ECE, Civil, Mechanical, IT, etc. Department and sections are auto-detected!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Department Association Settings */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Department Configuration Mode</span>
            </div>
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-md text-xs">
              <button
                type="button"
                onClick={() => setDeptMode('AUTO')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  deptMode === 'AUTO' ? 'bg-white text-indigo-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                🤖 Auto-Detect (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setDeptMode('EXISTING')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  deptMode === 'EXISTING' ? 'bg-white text-indigo-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Select Existing
              </button>
              <button
                type="button"
                onClick={() => setDeptMode('NEW')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  deptMode === 'NEW' ? 'bg-white text-indigo-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                ➕ New Department
              </button>
            </div>
          </div>

          {deptMode === 'AUTO' && (
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong>Smart Auto-Discovery:</strong> The system will read the uploaded PDF text, automatically detect the department name and code (e.g. Computer Science, Civil, AIML, etc.), and discover all sections involved.
            </p>
          )}

          {deptMode === 'EXISTING' && (
            <div className="pt-1">
              <label className="label text-[11px] font-semibold text-slate-700">Choose Department</label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="select text-xs bg-white"
              >
                <option value="">Select from registered departments...</option>
                {departments.map((d) => (
                  <option key={d.departmentId} value={d.departmentId}>
                    {d.departmentName} ({d.departmentCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          {deptMode === 'NEW' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="label text-[11px] font-semibold text-slate-700">New Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science and Engineering"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="input text-xs bg-white"
                />
              </div>
              <div>
                <label className="label text-[11px] font-semibold text-slate-700">Department Code / Acronym</label>
                <input
                  type="text"
                  placeholder="e.g. CSE"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  className="input text-xs bg-white uppercase"
                />
              </div>
            </div>
          )}
        </div>

        {/* Study Year Differentiation Settings */}
        <div className="mt-3.5 p-3.5 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Study Year Differentiation (1st, 2nd, 3rd, 4th Year)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="label text-[11px] font-semibold text-slate-700">Target Year of Study</label>
              <select
                value={selectedYearOfStudy}
                onChange={(e) => setSelectedYearOfStudy(e.target.value)}
                className="select text-xs bg-white border-indigo-200"
              >
                <option value="">🤖 Auto-Detect Year from PDF (e.g. I B.Tech, 1st Year, III-I)</option>
                <option value="1">1st Year (I B.Tech / Semesters 1 & 2)</option>
                <option value="2">2nd Year (II B.Tech / Semesters 3 & 4)</option>
                <option value="3">3rd Year (III B.Tech / Semesters 5 & 6)</option>
                <option value="4">4th Year (IV B.Tech / Semesters 7 & 8)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Distinguishes uploaded sections and periods per year so that 1st Year Section A is strictly isolated from 3rd Year Section A without cross-talk.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        {selectedFile && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Selected File:</span> {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelSelection}
                disabled={isProcessing}
                className="btn btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isProcessing}
                className="btn btn-primary text-xs flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 spin" />
                    <span>Processing Document...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload & Ingest Timetable</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Pipeline Stepper */}
      {(isProcessing || currentStepIndex >= 0) && (
        <div className="card p-4 bg-white border border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Ingestion Pipeline Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            {STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={step}
                  className={`flex flex-col items-center p-2.5 rounded-md border text-center transition-all ${
                    isPast
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : isCurrent
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-300'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  <div className="mb-1">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-indigo-600 spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-bold">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold">{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-md border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <div>
            <div className="font-bold">Extraction Failed</div>
            <div className="mt-0.5">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Extraction Result Summary */}
      {uploadResult && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card p-3 border-l-4 border-l-indigo-600 bg-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Document Status</span>
              <div className="mt-1">
                <span className={`badge ${
                  uploadResult.uploadStatus === 'SUCCESS' ? 'badge-success' :
                  uploadResult.uploadStatus === 'PARTIAL' ? 'badge-warning' : 'badge-danger'
                } text-xs font-semibold`}>
                  {uploadResult.uploadStatus}
                </span>
              </div>
            </div>

            <div className="card p-3 border-l-4 border-l-emerald-500 bg-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Extracted & Saved</span>
              <div className="mt-1 text-2xl font-extrabold text-emerald-600 font-mono">
                {uploadResult.extractedCount} <span className="text-xs font-normal text-slate-500">records</span>
              </div>
            </div>

            <div className="card p-3 border-l-4 border-l-amber-500 bg-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Conflicts Detected</span>
              <div className="mt-1 text-2xl font-extrabold text-amber-600 font-mono">
                {uploadResult.conflictCount} <span className="text-xs font-normal text-slate-500">conflicts</span>
              </div>
            </div>

            <div className="card p-3 border-l-4 border-l-sky-500 bg-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Rows Processed</span>
              <div className="mt-1 text-2xl font-extrabold text-slate-900 font-mono">
                {uploadResult.totalParsed} <span className="text-xs font-normal text-slate-500">rows</span>
              </div>
            </div>
          </div>

          {/* New Department & Sections Detected Card */}
          <div className="card p-4 border border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {uploadResult.departmentCode || 'DEPT'}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {uploadResult.departmentName || 'Department'}
                    </h3>
                    <span className="badge badge-primary text-[10px] font-mono font-bold">
                      {uploadResult.departmentCode || 'N/A'}
                    </span>
                    <span className="badge bg-indigo-100 text-indigo-800 border-indigo-300 text-[10px] font-bold">
                      📅 {uploadResult.yearName || (uploadResult.yearOfStudy ? `${uploadResult.yearOfStudy} Year` : '1st Year')}
                    </span>
                    <span className="badge bg-purple-100 text-purple-800 border-purple-300 text-[10px] font-bold">
                      {uploadResult.semesterName || 'Semester 1'}
                    </span>
                    {uploadResult.academicYear && (
                      <span className="badge bg-slate-100 text-slate-700 border-slate-300 text-[10px]">
                        AY {uploadResult.academicYear}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Curriculum timetable successfully processed and cataloged under {uploadResult.departmentName} for {uploadResult.yearName || '1st Year'}.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/admin/timetable?dept=${encodeURIComponent(uploadResult.departmentCode || '')}&year=${encodeURIComponent(uploadResult.yearOfStudy || '')}&section=${encodeURIComponent(uploadResult.sectionsInvolved?.[0] || '')}`)}
                className="btn btn-primary text-xs flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View {uploadResult.departmentCode || 'Department'} Timetable Grid</span>
              </button>
            </div>

            <div className="pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Sections Involved ({uploadResult.sectionsInvolved?.length || 0}):</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Click any section to inspect in Timetable
                </span>
              </div>

              {uploadResult.sectionsInvolved && uploadResult.sectionsInvolved.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {uploadResult.sectionsInvolved.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => navigate(`/admin/timetable?dept=${encodeURIComponent(uploadResult.departmentCode || '')}&year=${encodeURIComponent(uploadResult.yearOfStudy || '')}&section=${encodeURIComponent(sec)}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-white border border-indigo-200 text-indigo-900 hover:bg-indigo-50 hover:border-indigo-400 hover:shadow-xs transition-all"
                    >
                      <span className="text-slate-500 font-normal text-[11px]">Section:</span>
                      <span className="font-mono text-indigo-700">{sec}</span>
                      <ArrowRight className="w-3 h-3 text-indigo-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No specific sections registered.</p>
              )}
            </div>
          </div>

          {/* Conflicts List */}
          {uploadResult.conflicts && uploadResult.conflicts.length > 0 && (
            <div className="card p-4 border-l-4 border-l-amber-500 bg-white border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Schedule Conflicts Cataloged ({uploadResult.conflicts.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mb-2">
                The multi-dimensional conflict detection engine prevented these overlapping classes from corrupting the institutional timetable:
              </p>
              <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                {uploadResult.conflicts.map((conf, index) => (
                  <li
                    key={index}
                    className="p-2 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                    <span>{conf}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Saved Timetable Entries Preview */}
          {uploadResult.savedEntries && uploadResult.savedEntries.length > 0 && (
            <div className="card overflow-hidden bg-white border border-slate-200">
              <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>SUCCESSFULLY INGESTED TIMETABLE ENTRIES ({uploadResult.savedEntries.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/timetable?dept=${encodeURIComponent(uploadResult.departmentCode || '')}&section=${encodeURIComponent(uploadResult.sectionsInvolved?.[0] || '')}`)}
                  className="btn btn-primary text-xs flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open in Timetable Matrix</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Period</th>
                      <th>Timing</th>
                      <th>Subject</th>
                      <th>Faculty</th>
                      <th>Room</th>
                      <th>Section</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadResult.savedEntries.map((entry) => (
                      <tr key={entry.entryId} className="hover:bg-slate-50">
                        <td className="font-semibold text-indigo-600 text-xs">{entry.dayOfWeek}</td>
                        <td className="text-xs">Period {entry.periodNumber}</td>
                        <td className="font-mono text-xs">{format12HourRange(entry.startTime, entry.endTime)}</td>
                        <td>
                          <div className="font-bold text-slate-900 text-xs">{entry.subjectName}</div>
                          <span className="font-mono text-[10px] text-slate-400">{entry.subjectCode}</span>
                        </td>
                        <td className="text-xs text-slate-700">{entry.facultyName}</td>
                        <td className="text-xs">
                          <span className="badge badge-secondary text-xs">Room {entry.roomNumber}</span>
                        </td>
                        <td>
                          <span className="badge badge-primary text-xs font-semibold">{entry.sectionName}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
