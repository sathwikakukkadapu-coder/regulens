import React, { useState } from 'react';
import {
  FileSearch,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  Upload,
  Info,
  ShieldCheck,
  Calendar,
  MapPin,
  ExternalLink,
  ChevronRight,
  Hash,
  Copy
} from 'lucide-react';
import { ReviewCase, DocumentEvidence, ChecklistItem, Finding } from '../types';
import { parseUploadedFile } from '../services/documentParser';

interface DocumentVerificationViewProps {
  reviewCase: ReviewCase | null;
  documents: DocumentEvidence[];
  checklist: ChecklistItem[];
  findings: Finding[];
  onRunVerification: (caseId: string) => void;
  onAddDocument: (caseId: string, doc: DocumentEvidence) => void;
  onSelectFinding: (findingId: string) => void;
}

export const DocumentVerificationView: React.FC<DocumentVerificationViewProps> = ({
  reviewCase,
  documents,
  checklist,
  findings,
  onRunVerification,
  onAddDocument,
  onSelectFinding
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    documents.length > 0 ? documents[0].id : null
  );
  const [textSearchQuery, setTextSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!reviewCase) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
        <FileSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">No Regulatory Case Selected</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Please select an active review case from the top navigation bar or Case Management view to inspect evidence.
        </p>
      </div>
    );
  }

  const selectedDoc = documents.find(d => d.id === selectedDocId) || documents[0];
  const caseFindings = findings.filter(f => f.caseId === reviewCase.id);

  // Quick file upload to existing case
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let defaultCat = 'Supplementary Evidentiary Document';
        if (file.name.toLowerCase().includes('fire')) defaultCat = 'Fire Safety Certificate / NOC';
        else if (file.name.toLowerCase().includes('land')) defaultCat = 'Land Ownership Deed / Title';

        const parsed = await parseUploadedFile(file, reviewCase.id, defaultCat);
        onAddDocument(reviewCase.id, parsed);
        setSelectedDocId(parsed.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Highlight search text in text preview
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-slate-900 font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Verification Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {reviewCase.id}
            </span>
            <h1 className="text-xl font-bold text-slate-900">{reviewCase.institutionName}</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Application Ref: <span className="font-mono text-slate-700 font-semibold">{reviewCase.referenceNumber}</span> • {reviewCase.reviewCategory} • {documents.length} Evidence Files Ingested
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-all border border-slate-200">
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Upload Document</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={e => handleFileUpload(e.target.files)}
            />
          </label>

          <button
            onClick={() => onRunVerification(reviewCase.id)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Cross-Document Verification</span>
          </button>
        </div>
      </div>

      {/* Discrepancy Alert Strip if findings exist */}
      {caseFindings.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">
                {caseFindings.length} Discrepancy Flags Active on this Case ({caseFindings.filter(f => f.severity === 'High').length} High Severity)
              </p>
              <p className="text-[11px] text-amber-700">
                E.g. Survey number discrepancy (142/3B vs 142/8A), missing Fire Safety NOC, and name variations detected.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectFinding(caseFindings[0].id)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors shadow-xs"
            >
              Inspect First Finding
            </button>
          </div>
        </div>
      )}

      {/* Main Split-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Evidence Files Ingestion List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Submitted Exhibits ({documents.length})
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Click to inspect</span>
            </div>

            {documents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No documents uploaded yet for this case docket.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {documents.map(doc => {
                  const isSelected = selectedDoc?.id === doc.id;
                  const hasWarning = doc.warnings.length > 0;

                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span className="font-semibold text-slate-900 truncate block">{doc.name}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">{doc.category}</span>
                        </div>

                        {hasWarning ? (
                          <span className="shrink-0 p-1 rounded-full bg-amber-100 text-amber-700" title="Parsing advisory recorded">
                            <AlertTriangle className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="shrink-0 p-1 rounded-full bg-emerald-100 text-emerald-700" title="Parsed successfully">
                            <CheckCircle2 className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{(doc.size / 1024).toFixed(1)} KB</span>
                        <span>{doc.uploadDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Document Text Inspector & Field Matrix (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedDoc ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              {/* Document Inspector Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{selectedDoc.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {selectedDoc.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-mono">
                    <span>Uploaded: {selectedDoc.uploadDate}</span>
                    <span>•</span>
                    <button
                      onClick={() => handleCopyHash(selectedDoc.hash)}
                      className="hover:text-blue-600 flex items-center gap-1"
                      title="Click to copy SHA-256 hash"
                    >
                      <Hash className="w-3 h-3" />
                      <span>{selectedDoc.hash.slice(0, 14)}...</span>
                      {copiedHash ? <span className="text-emerald-600 font-bold">Copied!</span> : <Copy className="w-2.5 h-2.5" />}
                    </button>
                  </div>
                </div>

                {/* Text In-Document Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search in text (e.g. 142/3B)..."
                    value={textSearchQuery}
                    onChange={e => setTextSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
                  />
                </div>
              </div>

              {/* Extraction Warnings if any */}
              {selectedDoc.warnings.length > 0 && (
                <div className="p-3 bg-amber-50/80 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Extraction Advisory: </span>
                    {selectedDoc.warnings.map((w, idx) => (
                      <span key={idx}>{w} </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Structured Parameters Table */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/30">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Normalized Cadastral & Statutory Parameters
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Survey Number</span>
                    <span className={`font-mono font-bold mt-0.5 block ${
                      selectedDoc.structuredFields.surveyNumber === '142/8A' ? 'text-red-600 font-extrabold' : 'text-slate-900'
                    }`}>
                      {selectedDoc.structuredFields.surveyNumber || 'Not Detected'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Plot Number</span>
                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                      {selectedDoc.structuredFields.plotNumber || 'Not Detected'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Acreage / Area</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {selectedDoc.structuredFields.landAreaAcres || 'Not Detected'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Reference / Deed No</span>
                    <span className="font-mono text-slate-800 mt-0.5 block truncate">
                      {selectedDoc.structuredFields.applicationRef || 'Not Detected'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Date of Grant/Inspection</span>
                    <span className="font-mono text-slate-800 mt-0.5 block">
                      {selectedDoc.structuredFields.issuanceDate || 'Not Detected'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Issuing Authority</span>
                    <span className="text-slate-800 mt-0.5 block truncate" title={selectedDoc.structuredFields.issuingAuthority}>
                      {selectedDoc.structuredFields.issuingAuthority || 'Not Detected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Extracted Text Stream Viewer */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Extracted Text Record
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {selectedDoc.extractedText.length} characters
                  </span>
                </div>

                <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs leading-relaxed max-h-[360px] overflow-y-auto whitespace-pre-wrap select-text border border-slate-800">
                  {renderHighlightedText(selectedDoc.extractedText, textSearchQuery)}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
              <p className="text-xs text-slate-500">Select an evidence file from the left to view parsed data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
