import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Filter,
  PlusCircle,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Archive,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ArrowUpDown,
  Sparkles,
  Edit3,
  X
} from 'lucide-react';
import { ReviewCase, CaseStatus } from '../types';

interface CaseManagementViewProps {
  cases: ReviewCase[];
  onOpenCase: (caseId: string) => void;
  onCreateNew: () => void;
  onUpdateCaseStatus: (caseId: string, newStatus: CaseStatus, note?: string) => void;
  onArchiveCase: (caseId: string) => void;
  onLoadDemoCase: () => void;
}

export const CaseManagementView: React.FC<CaseManagementViewProps> = ({
  cases,
  onOpenCase,
  onCreateNew,
  onUpdateCaseStatus,
  onArchiveCase,
  onLoadDemoCase
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'date' | 'findings'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Status edit modal
  const [editingCase, setEditingCase] = useState<ReviewCase | null>(null);
  const [newStatus, setNewStatus] = useState<CaseStatus>('Needs Review');
  const [reviewerRationale, setReviewerRationale] = useState('');

  // Filtering
  const filteredCases = cases.filter(c => {
    const matchesSearch =
      c.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.reviewCategory === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sorting
  const sortedCases = [...filteredCases].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'id') cmp = a.id.localeCompare(b.id);
    else if (sortBy === 'name') cmp = a.institutionName.localeCompare(b.institutionName);
    else if (sortBy === 'date') cmp = (a.submissionDate || '').localeCompare(b.submissionDate || '');
    else if (sortBy === 'findings') cmp = (a.openFindingsCount || 0) - (b.openFindingsCount || 0);
    return sortAsc ? cmp : -cmp;
  });

  // Pagination
  const totalPages = Math.ceil(sortedCases.length / itemsPerPage) || 1;
  const paginatedCases = sortedCases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenEditStatus = (c: ReviewCase) => {
    setEditingCase(c);
    setNewStatus(c.status);
    setReviewerRationale(c.reviewerSummaryNote || '');
  };

  const handleSaveStatus = () => {
    if (editingCase) {
      onUpdateCaseStatus(editingCase.id, newStatus, reviewerRationale);
      setEditingCase(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Regulatory Case Management</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {cases.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track and triage all institutional verification dossiers, inspection histories, and determinations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onLoadDemoCase}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Load Demo Case</span>
          </button>

          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Review Docket</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Institution, ID, or Location..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Needs Review">Needs Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Awaiting Evidence">Awaiting Evidence</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none max-w-[200px] truncate"
          >
            <option value="all">All Review Categories</option>
            <option value="New Institute Approval & Land Compliance">New Institute Approval</option>
            <option value="Annual Extension of Approval (EoA)">Annual EoA</option>
            <option value="New Program Accreditation & Intake Expansion">New Program / Expansion</option>
            <option value="Infrastructure Safety Re-inspection">Safety Re-inspection</option>
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-slate-400 font-medium">Sort by:</span>
          <button
            onClick={() => {
              setSortAsc(!sortAsc);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium text-slate-700"
          >
            <span>{sortBy.toUpperCase()}</span>
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Cases Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Application Ref</th>
                <th className="py-3 px-4">Review Category</th>
                <th className="py-3 px-4">Assigned Inspector</th>
                <th className="py-3 px-4 text-center">Evidence Docs</th>
                <th className="py-3 px-4 text-center">Open Flags</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedCases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600">No regulatory review dockets match criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing filters or search parameters</p>
                  </td>
                </tr>
              ) : (
                paginatedCases.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600 whitespace-nowrap">
                      {c.id}
                      {c.isDemoCase && (
                        <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                          DEMO
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {c.institutionName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{c.location}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {c.referenceNumber}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-[170px] truncate" title={c.reviewCategory}>
                      {c.reviewCategory}
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {c.assignedReviewer}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {c.documentsCount} files
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {c.openFindingsCount > 0 ? (
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {c.openFindingsCount}
                        </span>
                      ) : (
                        <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          0
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        c.status === 'Needs Review' ? 'bg-amber-100 text-amber-800' :
                        c.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        c.status === 'Awaiting Evidence' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenCase(c.id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition-colors flex items-center gap-1"
                          title="Open Case Workspace"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Open</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditStatus(c)}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          title="Update Status"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Archive case ${c.id}?`)) {
                              onArchiveCase(c.id);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50"
                          title="Archive Case"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, sortedCases.length)} of {sortedCases.length} cases
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Status Modal */}
      {editingCase && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Update Regulatory Case Status</h3>
                <p className="text-xs text-slate-500">{editingCase.institutionName} ({editingCase.id})</p>
              </div>
              <button
                onClick={() => setEditingCase(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Review Status
              </label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as CaseStatus)}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 font-medium"
              >
                <option value="Draft">Draft</option>
                <option value="In Progress">In Progress</option>
                <option value="Needs Review">Needs Review</option>
                <option value="Awaiting Evidence">Awaiting Evidence</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reviewer Rationale & Audit Note
              </label>
              <textarea
                rows={3}
                placeholder="Enter justification for status transition..."
                value={reviewerRationale}
                onChange={e => setReviewerRationale(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingCase(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20"
              >
                Confirm & Record in Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
