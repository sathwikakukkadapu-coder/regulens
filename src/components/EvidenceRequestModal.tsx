import React, { useState } from 'react';
import { Finding, ReviewCase } from '../types';
import { X, Copy, Check, Download, Mail, ShieldAlert } from 'lucide-react';

interface EvidenceRequestModalProps {
  finding: Finding;
  reviewCase: ReviewCase | null;
  onClose: () => void;
}

export const EvidenceRequestModal: React.FC<EvidenceRequestModalProps> = ({
  finding,
  reviewCase,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const instName = reviewCase ? reviewCase.institutionName : 'Applicant Institution';
  const refNo = reviewCase ? reviewCase.referenceNumber : 'APPLICATION-REF';

  const letterText = `GOVERNMENT REGULATORY OVERSIGHT COMMISSION
DIRECTORATE OF INSTITUTIONAL ACCREDITATION & APPROVALS
================================================================================
MEMORANDUM / STATUTORY NOTICE OF DEFECT (FORM 4B)
Notice Ref: NTERC/DEF/${finding.caseId}/${Date.now().toString().slice(-4)}
Date of Issuance: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}

TO:
The Chairman / Head of Institution,
${instName}
Application Reference: ${refNo}

SUBJECT: MANDATORY CLARIFICATION & DEFICIENCY NOTICE REGARDING REGULATORY FILING

Dear Sir / Madam,

During the statutory cross-document verification audit conducted under the AICTE Approval
Process Handbook and National Building Code regulations, the following evidentiary discrepancy
was flagged by the inspection system for your docket:

DISCREPANCY TITLE: ${finding.title}
SEVERITY LEVEL: ${finding.severity.toUpperCase()}
COMPARED FIELD: ${finding.comparedField}

EVIDENTIARY FINDINGS:
- Record A: ${finding.extractedValueA || 'Refer to submitted documentation'}
- Record B: ${finding.extractedValueB || 'Statutory Requirement'}

REASON FOR INCONSISTENCY:
${finding.reason}

STATUTORY ACTION REQUIRED:
${finding.recommendedAction}

You are hereby requested to submit the requisite explanatory affidavit along with original
certified revenue / statutory clearance documents within fourteen (14) calendar days of the receipt
of this communication. Failure to furnish authentic evidence may result in the rejection of
the pending institutional approval.

Issued by Order of the Competent Authority,
Dr. Aris Thorne
Lead Regulatory Review Officer
Regulatory Verification Directorate
================================================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([letterText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Notice_of_Defect_${finding.caseId}_${finding.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Official Regulatory Notice of Defect (RFE)
              </h3>
              <p className="text-xs text-slate-500">
                Automated statutory letter drafted for {instName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-900 text-slate-200 font-mono text-xs rounded-xl p-4 max-h-[360px] overflow-y-auto whitespace-pre-wrap select-text leading-relaxed border border-slate-800">
          {letterText}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400">
            Form 4B Statutory Clarification Notice Template
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Notice'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Notice (.txt)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
