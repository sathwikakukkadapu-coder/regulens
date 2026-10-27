import React, { useState } from 'react';
import {
  Building2,
  FileCheck2,
  UploadCloud,
  CheckCircle2,
  Trash2,
  FileText,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  ShieldAlert
} from 'lucide-react';
import { ChecklistItem, DocumentEvidence, ReviewCase } from '../types';
import { parseUploadedFile } from '../services/documentParser';

interface NewReviewViewProps {
  checklist: ChecklistItem[];
  onCaseCreated: (newCase: ReviewCase) => void;
  onCancel: () => void;
}

export const NewReviewView: React.FC<NewReviewViewProps> = ({
  checklist,
  onCaseCreated,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionType: 'Engineering & Technology (Self-Financing)',
    referenceNumber: `REG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    location: '',
    academicYear: '2026-2027',
    reviewCategory: 'New Institute Approval & Land Compliance',
    assignedReviewer: 'Dr. Aris Thorne (Lead Inspector)',
  });

  const [selectedChecklistIds, setSelectedChecklistIds] = useState<string[]>(
    checklist.map(c => c.id)
  );

  const [uploadedFiles, setUploadedFiles] = useState<DocumentEvidence[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Validation
  const isStep1Valid =
    formData.institutionName.trim().length > 3 &&
    formData.referenceNumber.trim().length > 3 &&
    formData.location.trim().length > 2;

  const isStep2Valid = selectedChecklistIds.length > 0;

  const handleChecklistToggle = (id: string) => {
    setSelectedChecklistIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessingFile(true);
    setUploadError(null);

    const tempCaseId = `RL-NEW-${Date.now()}`;
    const newDocs: DocumentEvidence[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Size check (max 15MB)
        if (file.size > 15 * 1024 * 1024) {
          setUploadError(`File ${file.name} exceeds 15MB size limit.`);
          continue;
        }

        // Infer likely category based on filename
        let defaultCategory = 'General Institutional Evidence';
        const nameLower = file.name.toLowerCase();
        if (nameLower.includes('land') || nameLower.includes('deed') || nameLower.includes('title')) {
          defaultCategory = 'Land Ownership Deed / Title';
        } else if (nameLower.includes('structural') || nameLower.includes('safety') || nameLower.includes('stability')) {
          defaultCategory = 'Building / Structural Safety Report';
        } else if (nameLower.includes('fire') || nameLower.includes('noc')) {
          defaultCategory = 'Fire Safety Certificate / NOC';
        } else if (nameLower.includes('plan') || nameLower.includes('mdda') || nameLower.includes('municipal')) {
          defaultCategory = 'Approved Building Plan / Town Planning NOC';
        } else if (nameLower.includes('form') || nameLower.includes('app')) {
          defaultCategory = 'Institution Application Form';
        }

        const parsed = await parseUploadedFile(file, tempCaseId, defaultCategory);
        newDocs.push(parsed);
      }

      setUploadedFiles(prev => [...prev, ...newDocs]);
    } catch (err: any) {
      setUploadError(`Error parsing upload: ${err.message || 'Unknown'}`);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpdateCategory = (id: string, newCat: string) => {
    setUploadedFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, category: newCat } : f))
    );
  };

  // Prefill synthetic sample to assist SIH tester
  const handlePrefillSample = () => {
    setFormData({
      institutionName: 'Greenwood Institute of Advanced Technology',
      institutionType: 'Engineering & Technology (Self-Financing)',
      referenceNumber: `SIH-DEMO-2026-902`,
      location: 'Kalyan, Maharashtra',
      academicYear: '2026-2027',
      reviewCategory: 'New Institute Approval & Land Compliance',
      assignedReviewer: 'Dr. Aris Thorne (Lead Inspector)',
    });
  };

  const handleFinalSubmit = () => {
    const caseId = `RL-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newCase: ReviewCase = {
      id: caseId,
      institutionName: formData.institutionName.trim(),
      institutionType: formData.institutionType,
      referenceNumber: formData.referenceNumber.trim(),
      location: formData.location.trim(),
      academicYear: formData.academicYear,
      reviewCategory: formData.reviewCategory,
      assignedReviewer: formData.assignedReviewer,
      submissionDate: new Date().toISOString().substring(0, 10),
      status: 'Needs Review',
      openFindingsCount: 0,
      documentsCount: uploadedFiles.length,
      documents: uploadedFiles.map(d => ({ ...d, caseId })),
      checklistIds: selectedChecklistIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onCaseCreated(newCase);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Create Regulatory Review Docket</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step intake wizard for institutional compliance verification
          </p>
        </div>

        <button
          onClick={handlePrefillSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Auto-fill Sample Data</span>
        </button>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { step: 1, label: 'Institution Details', icon: Building2 },
            { step: 2, label: 'Required Documents', icon: FileCheck2 },
            { step: 3, label: 'Upload Evidence', icon: UploadCloud },
            { step: 4, label: 'Review Summary', icon: CheckCircle2 },
          ].map(s => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <div
                key={s.step}
                className={`p-2.5 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-blue-50 border border-blue-200 text-blue-700 font-bold'
                    : isCompleted
                    ? 'text-emerald-700 bg-emerald-50/60 font-medium'
                    : 'text-slate-400 bg-slate-50 font-normal'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? '✓' : s.step}
                  </div>
                  <span className="text-xs hidden sm:inline">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Institution Details */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5 animate-in fade-in-50">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Step 1: Institutional Particulars</h2>
            <p className="text-xs text-slate-500">Enter primary regulatory reference and identifying metadata</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Institution Name *
              </label>
              <input
                type="text"
                placeholder="e.g. North Valley Institute of Technology"
                value={formData.institutionName}
                onChange={e => setFormData({ ...formData, institutionName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Application / Reference ID *
              </label>
              <input
                type="text"
                placeholder="e.g. SIH-DEMO-2026-014"
                value={formData.referenceNumber}
                onChange={e => setFormData({ ...formData, referenceNumber: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Institution Type
              </label>
              <select
                value={formData.institutionType}
                onChange={e => setFormData({ ...formData, institutionType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option>Engineering & Technology (Self-Financing)</option>
                <option>University / Deemed-to-be University</option>
                <option>Polytechnic Diploma Institute</option>
                <option>Pharmacy & Allied Sciences</option>
                <option>Management & MCA Institution</option>
                <option>Medical & Health Sciences Campus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Campus Location (City, State) *
              </label>
              <input
                type="text"
                placeholder="e.g. Dehradun, Uttarakhand"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Academic Year / Cycle
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Review Category
              </label>
              <select
                value={formData.reviewCategory}
                onChange={e => setFormData({ ...formData, reviewCategory: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option>New Institute Approval & Land Compliance</option>
                <option>Annual Extension of Approval (EoA)</option>
                <option>New Program Accreditation & Intake Expansion</option>
                <option>Infrastructure Safety Re-inspection</option>
                <option>Change of Site / Land Conversion</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assigned Reviewer / Inspector
              </label>
              <input
                type="text"
                value={formData.assignedReviewer}
                onChange={e => setFormData({ ...formData, assignedReviewer: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              Cancel
            </button>
            <button
              disabled={!isStep1Valid}
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md shadow-blue-600/20"
            >
              <span>Next: Required Documents</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Required Documents Checklist */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5 animate-in fade-in-50">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 2: Configurable Required Documents</h2>
              <p className="text-xs text-slate-500">
                Select statutory prerequisites applicable to this review category
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {selectedChecklistIds.length} Selected
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Demonstration Notice:</strong> Requirements shown here are representative examples from AICTE & NBC regulations. ReguLens AI compares submitted files against these selected requirements without assuming universal mandates.
            </span>
          </div>

          <div className="space-y-3">
            {checklist.map(item => {
              const isChecked = selectedChecklistIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => handleChecklistToggle(item.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by parent div
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{item.requirementName}</span>
                        {item.isRequired && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                            Mandatory
                          </span>
                        )}
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        Rule: {item.ruleSource}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              disabled={!isStep2Valid}
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20"
            >
              <span>Next: Upload Documents</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Upload Documents */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5 animate-in fade-in-50">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 3: Upload Institutional Evidence</h2>
              <p className="text-xs text-slate-500">
                Attach evidentiary files (PDF, TXT, CSV, JSON, DOCX). Text extraction is performed locally.
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              {uploadedFiles.length} Attached
            </span>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              handleFileUpload(e.dataTransfer.files);
            }}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-2xl p-8 text-center transition-all cursor-pointer relative"
          >
            <input
              type="file"
              multiple
              accept=".txt,.json,.csv,.pdf,.docx"
              onChange={e => handleFileUpload(e.target.files)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Drag & drop document files here, or <span className="text-blue-600 underline">browse</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Supported formats: TXT, JSON, CSV, PDF (Digital). Maximum file size: 15 MB.
            </p>
          </div>

          {isProcessingFile && (
            <div className="p-3 bg-blue-50 rounded-xl flex items-center gap-3 text-xs text-blue-700 animate-pulse">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Ingesting and extracting structured evidentiary parameters...</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-red-50 rounded-xl flex items-center gap-2 text-xs text-red-700 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Uploaded Files Table */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Attached Files & Category Mapping
              </span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {(file.size / 1024).toFixed(1)} KB • Hash: {file.hash.slice(0, 10)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={file.category}
                        onChange={e => handleUpdateCategory(file.id, e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white font-medium text-slate-700 focus:outline-none"
                      >
                        <option>Institution Application Form</option>
                        <option>Land Ownership Deed / Title</option>
                        <option>Building / Structural Safety Report</option>
                        <option>Fire Safety Certificate / NOC</option>
                        <option>Approved Building Plan / Town Planning NOC</option>
                        <option>Audited Financial Statements</option>
                        <option>General Supporting Record</option>
                      </select>

                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"
            >
              <span>Next: Review Summary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review Summary & Start Verification */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in-50">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Step 4: Docket Verification Confirmation</h2>
            <p className="text-xs text-slate-500">
              Verify submitted parameters before launching the deterministic verification engine
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Institution Information</span>
              <div>
                <p className="font-bold text-slate-900 text-sm">{formData.institutionName}</p>
                <p className="text-slate-500">{formData.referenceNumber} • {formData.institutionType}</p>
                <p className="text-slate-600 mt-1">{formData.location} • Cycle: {formData.academicYear}</p>
                <p className="text-blue-600 font-medium mt-1">Reviewer: {formData.assignedReviewer}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Evidence Coverage</span>
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">
                  {selectedChecklistIds.length} Regulatory Checklist Items Configured
                </p>
                <p className="font-semibold text-slate-800">
                  {uploadedFiles.length} Evidence Documents Ingested
                </p>
                <p className="text-slate-500 text-[11px] mt-2">
                  Engine will run cross-document consistency checks on Survey Numbers, Institution Names, Dates, Plot Identifiers, and Missing Document gaps.
                </p>
              </div>
            </div>
          </div>

          {uploadedFiles.length === 0 && (
            <div className="p-3 bg-amber-50 rounded-xl flex items-center gap-2 text-xs text-amber-800 border border-amber-200">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>Note:</strong> You have not attached any files. The verification engine will immediately flag all mandatory checklist items as missing.
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleFinalSubmit}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Start Verification & Open Docket</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
