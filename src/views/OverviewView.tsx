import React, { useState } from 'react';
import {
  FolderKanban,
  FileCheck2,
  Clock,
  AlertOctagon,
  FileQuestion,
  CheckCircle,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ReviewCase, Finding, AuditEvent } from '../types';

interface OverviewViewProps {
  cases: ReviewCase[];
  findings: Finding[];
  auditTrail: AuditEvent[];
  onOpenCase: (caseId: string) => void;
  onCreateReview: () => void;
  onLoadDemoCase: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  cases,
  findings,
  auditTrail,
  onOpenCase,
  onCreateReview,
  onLoadDemoCase
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Metrics
  const totalCases = cases.length;
  const totalDocuments = cases.reduce((acc, c) => acc + (c.documentsCount || 0), 0);
  const pendingReviews = cases.filter(c => c.status === 'In Progress' || c.status === 'Needs Review' || c.status === 'Awaiting Evidence').length;
  const openFindings = findings.filter(f => f.status !== 'Resolved' && f.status !== 'Dismissed').length;
  const missingDocAlerts = findings.filter(f => f.category === 'Missing Document' && f.status === 'Open').length;
  const completedReviews = cases.filter(c => c.status === 'Completed').length;

  // Chart data: Status distribution
  const statusCounts = {
    'Needs Review': cases.filter(c => c.status === 'Needs Review').length,
    'In Progress': cases.filter(c => c.status === 'In Progress').length,
    'Awaiting Evidence': cases.filter(c => c.status === 'Awaiting Evidence').length,
    'Completed': cases.filter(c => c.status === 'Completed').length,
  };

  const statusPieData = [
    { name: 'Needs Review', value: statusCounts['Needs Review'], color: '#EF4444' },
    { name: 'In Progress', value: statusCounts['In Progress'], color: '#3B82F6' },
    { name: 'Awaiting Evidence', value: statusCounts['Awaiting Evidence'], color: '#F59E0B' },
    { name: 'Completed', value: statusCounts['Completed'], color: '#10B981' },
  ].filter(d => d.value > 0);

  // Chart data: Findings by severity
  const severityData = [
    { name: 'High', count: findings.filter(f => f.severity === 'High').length, fill: '#EF4444' },
    { name: 'Medium', count: findings.filter(f => f.severity === 'Medium').length, fill: '#F59E0B' },
    { name: 'Low', count: findings.filter(f => f.severity === 'Low').length, fill: '#3B82F6' },
    { name: 'Info', count: findings.filter(f => f.severity === 'Informational').length, fill: '#64748B' },
  ];

  // Filtered cases for table
  const filteredCases = cases.filter(c => {
    const matchesSearch =
      c.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1E293B] to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-blue-600/10 via-teal-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-500/30">
              <ShieldAlert className="w-3.5 h-3.5 text-teal-300" />
              <span>Evidence-Led Regulatory Review & Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Institutional Compliance Dashboard
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Screen institutional approval dossiers, compare cadastral records against statutory certifications, and trace discrepancy flags directly to primary evidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onLoadDemoCase}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-sm font-semibold transition-all shadow-lg shadow-teal-500/10"
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>Load SIH Demo Case</span>
            </button>

            <button
              onClick={onCreateReview}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Cases */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Cases</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{totalCases}</span>
            <span className="text-[10px] text-blue-600 font-semibold">Active Cycle</span>
          </div>
        </div>

        {/* Documents Received */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Documents</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{totalDocuments}</span>
            <span className="text-[10px] text-teal-600 font-semibold">Ingested Files</span>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-700">{pendingReviews}</span>
            <span className="text-[10px] text-amber-700 font-semibold">In Queue</span>
          </div>
        </div>

        {/* Open Findings */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Open Findings</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-red-600">{openFindings}</span>
            <span className="text-[10px] text-red-600 font-semibold">Discrepancies</span>
          </div>
        </div>

        {/* Missing Doc Alerts */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Missing Docs</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-700">{missingDocAlerts}</span>
            <span className="text-[10px] text-purple-700 font-semibold">Gaps Detected</span>
          </div>
        </div>

        {/* Completed Reviews */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700">{completedReviews}</span>
            <span className="text-[10px] text-emerald-700 font-semibold">Determined</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Review Case Status Distribution</h2>
              <p className="text-xs text-slate-500">Live breakdown of institutional applications</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} Cases`, name]}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
            {statusPieData.map(item => (
              <div key={item.name} className="p-1.5 rounded-lg bg-slate-50">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="truncate">{item.name}</span>
                </div>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Findings by Severity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Regulatory Flags by Severity</h2>
              <p className="text-xs text-slate-500">Categorized discrepancies requiring reviewer resolution</p>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} Findings`, 'Count']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>High Severity flags must be resolved prior to granting approval.</span>
            <span className="font-semibold text-slate-700">{findings.length} Total Detected</span>
          </div>
        </div>
      </div>

      {/* Main Bottom Section: Recent Reviews & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reviews Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Review Cases</h2>
              <p className="text-xs text-slate-500">Click any row to open the active evidence workspace</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter cases..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 sm:w-48"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="Needs Review">Needs Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Awaiting Evidence">Awaiting Evidence</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Institution Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Open Flags</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredCases.slice(0, 5).map(c => (
                  <tr
                    key={c.id}
                    onClick={() => onOpenCase(c.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-600">
                      {c.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {c.institutionName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {c.referenceNumber} • {c.location}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[160px] truncate">
                      {c.reviewCategory}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.openFindingsCount > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-[11px]">
                          <AlertOctagon className="w-3 h-3" />
                          {c.openFindingsCount} Open
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                          <CheckCircle className="w-3 h-3" />
                          Clear
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        c.status === 'Needs Review' ? 'bg-amber-100 text-amber-800' :
                        c.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Timeline (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Activity Log</h2>
              <p className="text-xs text-slate-500">Live regulatory audit actions</p>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {auditTrail.slice(0, 6).map(evt => (
              <div key={evt.id} className="relative pl-5 border-l-2 border-slate-200 pb-3 last:pb-0">
                <span className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${
                  evt.severity === 'alert' ? 'bg-red-500 ring-2 ring-red-100' :
                  evt.severity === 'warn' ? 'bg-amber-500 ring-2 ring-amber-100' :
                  evt.severity === 'success' ? 'bg-emerald-500 ring-2 ring-emerald-100' :
                  'bg-blue-500 ring-2 ring-blue-100'
                }`} />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                  <span className="font-semibold text-slate-700">{evt.action}</span>
                  <span>{evt.timestamp.substring(11, 16)}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{evt.details}</p>
                <div className="mt-1 text-[10px] text-slate-400 font-mono">
                  {evt.caseId ? `${evt.caseId} • ` : ''}{evt.actor}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
