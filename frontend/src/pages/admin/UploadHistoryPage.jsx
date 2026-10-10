import React, { useState, useEffect } from 'react';
import { uploadService } from '../../services/api';
import {
  History,
  FileText,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  X
} from 'lucide-react';

export default function UploadHistoryPage() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // View entries modal state
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [uploadEntries, setUploadEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete modal state
  const [deleteUploadId, setDeleteUploadId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await uploadService.getAll();
      setHistoryList(response.data || []);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to fetch upload history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleViewEntries = async (upload) => {
    setSelectedUpload(upload);
    setIsModalOpen(true);
    setLoadingEntries(true);
    try {
      const res = await uploadService.getEntries(upload.uploadId);
      setUploadEntries(res.data || []);
    } catch (err) {
      console.error('Failed to load entries:', err);
      setUploadEntries([]);
    } finally {
      setLoadingEntries(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteUploadId) return;
    setIsDeleting(true);
    try {
      await uploadService.delete(deleteUploadId);
      setHistoryList((prev) => prev.filter((item) => item.uploadId !== deleteUploadId));
      setDeleteUploadId(null);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to delete upload record.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredHistory = historyList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.fileName && item.fileName.toLowerCase().includes(q)) ||
      (item.uploadedByName && item.uploadedByName.toLowerCase().includes(q)) ||
      (item.uploadStatus && item.uploadStatus.toLowerCase().includes(q)) ||
      (item.remarks && item.remarks.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span>Document Ingestion Ledger</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Timetable Upload Audit History
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Historical records of PDF timetable documents processed by Apache PDFBox with relational rollback
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchHistory}
            disabled={loading}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-3 bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by file name, uploader, or remarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-8 text-xs h-8 w-full"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-900">{filteredHistory.length}</span> of {historyList.length} uploads
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-md border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Table Card */}
      <div className="card overflow-hidden bg-white border border-slate-200">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Upload ID</th>
                <th>File Name</th>
                <th>Uploaded By</th>
                <th>Upload Date</th>
                <th>Status</th>
                <th>Extracted</th>
                <th>Conflicts</th>
                <th>Remarks</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400">
                    <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
                    Loading historical uploads from database...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400">
                    <FileText className="w-7 h-7 mx-auto mb-2 opacity-30 text-indigo-600" />
                    No upload records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.uploadId} className="hover:bg-slate-50">
                    <td className="font-mono text-xs text-slate-400">#{item.uploadId}</td>
                    <td>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate max-w-[200px]" title={item.fileName}>{item.fileName}</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-700">{item.uploadedByName || 'System Administrator'}</td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {item.uploadedAt ? new Date(item.uploadedAt).toLocaleString() : 'N/A'}
                    </td>
                    <td>
                      <span className={`badge ${
                        item.uploadStatus === 'SUCCESS' ? 'badge-success' :
                        item.uploadStatus === 'PARTIAL' ? 'badge-warning' :
                        item.uploadStatus === 'PROCESSING' ? 'badge-info' : 'badge-danger'
                      } text-xs font-semibold`}>
                        {item.uploadStatus}
                      </span>
                    </td>
                    <td className="font-mono font-bold text-emerald-600 text-xs">
                      {item.extractedCount ?? 0}
                    </td>
                    <td className="font-mono font-bold text-amber-600 text-xs">
                      {item.conflictCount ?? 0}
                    </td>
                    <td className="text-xs text-slate-500 max-w-xs truncate" title={item.remarks}>
                      {item.remarks || '—'}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleViewEntries(item)}
                          title="View Ingested Timetable Entries"
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye className="w-3 h-3 text-indigo-600" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteUploadId(item.uploadId)}
                          title="Delete Upload & Associated Entries"
                          className="btn btn-secondary btn-sm text-rose-600 hover:text-rose-800"
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

      {/* Modal: View Extracted Entries */}
      {isModalOpen && selectedUpload && (
        <div className="modal-backdrop">
          <div className="modal-dialog max-w-4xl">
            <div className="modal-header">
              <div>
                <h3 className="modal-title flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Ingested Entries: {selectedUpload.fileName}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Uploaded by {selectedUpload.uploadedByName} on {new Date(selectedUpload.uploadedAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="modal-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body max-h-[60vh] overflow-y-auto">
              {loadingEntries ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 spin mx-auto mb-2 text-indigo-600" />
                  Retrieving timetable entries from database...
                </div>
              ) : uploadEntries.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  No persisted entries associated with this upload session.
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Time Slot</th>
                      <th>Subject Name</th>
                      <th>Code</th>
                      <th>Faculty</th>
                      <th>Room</th>
                      <th>Section</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadEntries.map((e) => (
                      <tr key={e.entryId} className="hover:bg-slate-50">
                        <td className="font-semibold text-slate-800 text-xs">{e.dayOfWeek}</td>
                        <td className="font-mono text-xs font-bold text-slate-700">
                          {e.startTime?.slice(0, 5)} – {e.endTime?.slice(0, 5)} (P{e.periodNumber})
                        </td>
                        <td className="font-bold text-slate-900 text-xs">{e.subjectName}</td>
                        <td className="font-mono text-[11px] text-indigo-600 font-semibold">{e.subjectCode}</td>
                        <td className="text-xs text-slate-700">{e.facultyName}</td>
                        <td>
                          <span className="badge badge-secondary text-xs">Room {e.roomNumber}</span>
                        </td>
                        <td>
                          <span className="badge badge-primary text-xs">{e.sectionName}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-footer">
              <span className="text-xs text-slate-500 mr-auto">
                Total persistent classes: <strong className="text-slate-900">{uploadEntries.length}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-primary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUploadId && (
        <div className="modal-backdrop">
          <div className="modal-dialog max-w-sm">
            <div className="modal-header">
              <h3 className="modal-title text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Confirm Upload Deletion</span>
              </h3>
              <button
                type="button"
                onClick={() => setDeleteUploadId(null)}
                className="modal-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body text-xs text-slate-600 space-y-2">
              <p>
                Deleting upload <strong className="text-slate-900">#{deleteUploadId}</strong> will initiate a cascading rollback, removing all linked timetable entries and resolving associated conflicts.
              </p>
              <p className="text-rose-600 font-semibold">
                This operation cannot be reversed.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setDeleteUploadId(null)}
                className="btn btn-secondary text-xs"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="btn btn-danger text-xs"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Rollback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
