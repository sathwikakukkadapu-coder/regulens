import jsPDF from 'jspdf';
import { ReviewCase, Finding, DocumentEvidence, ChecklistItem, SystemSettings } from '../types';

export function exportCaseJSON(reviewCase: ReviewCase, findings: Finding[], documents: DocumentEvidence[], checklist: ChecklistItem[]) {
  const exportData = {
    exportMetadata: {
      generatedBy: 'ReguLens AI - Evidence-Led Regulatory Review Platform',
      version: '2.4.0',
      exportedAt: new Date().toISOString(),
      disclaimer: 'ReguLens AI assists human reviewers. Machine-detected findings require human validation.'
    },
    caseSummary: {
      id: reviewCase.id,
      institutionName: reviewCase.institutionName,
      institutionType: reviewCase.institutionType,
      referenceNumber: reviewCase.referenceNumber,
      location: reviewCase.location,
      academicYear: reviewCase.academicYear,
      reviewCategory: reviewCase.reviewCategory,
      assignedReviewer: reviewCase.assignedReviewer,
      submissionDate: reviewCase.submissionDate,
      status: reviewCase.status,
      finalDisposition: reviewCase.finalDisposition || 'Pending Formal Determination',
      reviewerSummaryNote: reviewCase.reviewerSummaryNote || 'None recorded'
    },
    documentsReceived: documents.map(d => ({
      id: d.id,
      name: d.name,
      category: d.category,
      fileType: d.fileType,
      sizeBytes: d.size,
      uploadDate: d.uploadDate,
      hashSHA256: d.hash,
      structuredFields: d.structuredFields,
      warnings: d.warnings
    })),
    regulatoryChecklistEvaluated: checklist
      .filter(c => reviewCase.checklistIds.includes(c.id))
      .map(c => ({
        id: c.id,
        requirement: c.requirementName,
        status: c.currentStatus,
        ruleSource: c.ruleSource,
        isRequired: c.isRequired
      })),
    findings: findings.map(f => ({
      id: f.id,
      title: f.title,
      severity: f.severity,
      category: f.category,
      status: f.status,
      comparedField: f.comparedField,
      sourceDocuments: f.sourceDocuments,
      extractedValueA: f.extractedValueA,
      extractedValueB: f.extractedValueB,
      reason: f.reason,
      recommendedAction: f.recommendedAction,
      ruleReference: f.ruleReference,
      reviewerNotes: f.reviewerNotes,
      dateDetected: f.dateDetected
    }))
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ReguLens_CaseReport_${reviewCase.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportFindingsCSV(reviewCase: ReviewCase, findings: Finding[]) {
  const headers = [
    'Finding ID',
    'Case ID',
    'Title',
    'Severity',
    'Category',
    'Status',
    'Compared Field',
    'Value A',
    'Value B',
    'Reason',
    'Recommended Action',
    'Reviewer Notes',
    'Rule Reference',
    'Date Detected'
  ];

  const escapeCSV = (str: string = '') => `"${str.replace(/"/g, '""')}"`;

  const rows = findings.map(f => [
    escapeCSV(f.id),
    escapeCSV(f.caseId),
    escapeCSV(f.title),
    escapeCSV(f.severity),
    escapeCSV(f.category),
    escapeCSV(f.status),
    escapeCSV(f.comparedField),
    escapeCSV(f.extractedValueA || ''),
    escapeCSV(f.extractedValueB || ''),
    escapeCSV(f.reason),
    escapeCSV(f.recommendedAction),
    escapeCSV(f.reviewerNotes || ''),
    escapeCSV(f.ruleReference || ''),
    escapeCSV(f.dateDetected)
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ReguLens_Findings_${reviewCase.id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateCasePDFReport(
  reviewCase: ReviewCase,
  findings: Finding[],
  documents: DocumentEvidence[],
  checklist: ChecklistItem[],
  settings: SystemSettings
) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 50) {
      doc.addPage();
      y = margin;
      drawHeader();
    }
  };

  const drawHeader = () => {
    doc.setFillColor(15, 23, 42); // Navy 900
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ReguLens AI • Evidence-Led Regulatory Review Dossier', margin, 32);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(`CONFIDENTIAL REGULATORY AUDIT REPORT | CASE ID: ${reviewCase.id}`, pageWidth - margin, 32, { align: 'right' });
    y = 70;
  };

  drawHeader();

  // Report Title Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 65, 4, 4, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUTORY VERIFICATION & EVIDENCE AUDIT REPORT', margin + 14, y + 24);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Regulatory Authority: ${settings.regulatoryBody}`, margin + 14, y + 42);
  doc.text(`Generated: ${new Date().toLocaleString()} | Lead Reviewer: ${reviewCase.assignedReviewer}`, margin + 14, y + 54);

  y += 80;

  // Institution Metadata Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. Institution Particulars & Review Scope', margin, y);
  y += 14;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 75, 4, 4, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('INSTITUTION NAME', margin + 12, y + 16);
  doc.text('APPLICATION / REF ID', margin + 260, y + 16);
  doc.text('STATUS', margin + 420, y + 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(reviewCase.institutionName, margin + 12, y + 30);
  doc.text(reviewCase.referenceNumber, margin + 260, y + 30);

  // Status badge text
  doc.setTextColor(reviewCase.status === 'Needs Review' ? 194 : 16, reviewCase.status === 'Needs Review' ? 65 : 185, reviewCase.status === 'Needs Review' ? 12 : 129);
  doc.text(reviewCase.status.toUpperCase(), margin + 420, y + 30);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CATEGORY & PERIOD', margin + 12, y + 48);
  doc.text('CAMPUS LOCATION', margin + 260, y + 48);
  doc.text('SUBMITTED DATE', margin + 420, y + 48);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`${reviewCase.reviewCategory} (${reviewCase.academicYear})`, margin + 12, y + 62);
  doc.text(reviewCase.location, margin + 260, y + 62);
  doc.text(reviewCase.submissionDate, margin + 420, y + 62);

  y += 90;

  // Documents Received & Checklist Summary
  checkPageBreak(80);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. Submitted Evidence Bundle & Integrity Verification', margin, y);
  y += 14;

  documents.forEach((d, idx) => {
    checkPageBreak(32);
    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 26, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 1}. ${d.name}`, margin + 8, y + 16);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`[${d.category}]`, margin + 220, y + 16);

    const hashSnippet = d.hash ? `SHA: ${d.hash.substring(0, 10)}...` : 'No hash';
    doc.text(hashSnippet, margin + 370, y + 16);

    const statColor = d.status === 'Processed' ? [16, 185, 129] : [239, 68, 68];
    doc.setTextColor(statColor[0], statColor[1], statColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(d.status, pageWidth - margin - 8, y + 16, { align: 'right' });

    y += 26;
  });

  y += 15;

  // Findings & Discrepancies Section
  checkPageBreak(100);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`3. Detailed Discrepancy Findings & Cross-Document Flags (${findings.length})`, margin, y);
  y += 14;

  if (findings.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(22, 101, 52);
    doc.text('No cross-document discrepancies or missing mandatory requirements detected.', margin + 10, y + 14);
    y += 30;
  } else {
    findings.forEach(f => {
      checkPageBreak(110);
      const isHigh = f.severity === 'High';
      const isMed = f.severity === 'Medium';

      doc.setFillColor(isHigh ? 254 : isMed ? 255 : 241, isHigh ? 242 : isMed ? 251 : 245, isHigh ? 242 : isMed ? 235 : 249);
      doc.setDrawColor(isHigh ? 254 : isMed ? 253 : 203, isHigh ? 202 : isMed ? 230 : 213, isHigh ? 202 : isMed ? 138 : 225);
      doc.roundedRect(margin, y, contentWidth, 90, 4, 4, 'FD');

      // Severity tag
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(isHigh ? 185 : isMed ? 180 : 71, isHigh ? 28 : isMed ? 83 : 85, isHigh ? 28 : isMed ? 9 : 105);
      doc.text(`[${f.severity.toUpperCase()} • ${f.category.toUpperCase()}]`, margin + 10, y + 15);

      // Title
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(f.title, margin + 110, y + 15);

      // Evidence Values
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Compared Field: ${f.comparedField}`, margin + 10, y + 30);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      if (f.extractedValueA) doc.text(`Value A: ${f.extractedValueA}`, margin + 10, y + 43);
      if (f.extractedValueB) doc.text(`Value B: ${f.extractedValueB}`, margin + 260, y + 43);

      // Reason & Recommended Action
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const splitReason = doc.splitTextToSize(`Reason: ${f.reason}`, contentWidth - 20);
      doc.text(splitReason.slice(0, 2), margin + 10, y + 57);

      const splitAction = doc.splitTextToSize(`Recommendation: ${f.recommendedAction}`, contentWidth - 20);
      doc.text(splitAction.slice(0, 2), margin + 10, y + 76);

      y += 100;
    });
  }

  // Human Reviewer Disposition & Sign-off Block
  checkPageBreak(120);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('4. Human Reviewer Final Determination & Statutory Action', margin, y);
  y += 14;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(148, 163, 184);
  doc.roundedRect(margin, y, contentWidth, 95, 4, 4, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Official Determination: ${reviewCase.finalDisposition || 'Pending Formal Review Board Hearing'}`, margin + 12, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const noteLines = doc.splitTextToSize(`Reviewer Remarks: ${reviewCase.reviewerSummaryNote || 'No summary remarks entered.'}`, contentWidth - 24);
  doc.text(noteLines, margin + 12, y + 32);

  // Signature line
  doc.line(margin + 340, y + 75, margin + 490, y + 75);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${reviewCase.assignedReviewer}`, margin + 340, y + 85);
  doc.text('Authorized Regulatory Signatory', margin + 340, y + 93);

  y += 105;

  // Footer Disclaimer
  checkPageBreak(50);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  const disclaimer = 'ReguLens AI is an evidence-led assistance system designed to highlight discrepancies and missing documentation. It does not replace human regulatory judgment. Generated under SIH 2024-2026 Evaluation Protocol.';
  doc.text(doc.splitTextToSize(disclaimer, contentWidth), margin, pageHeight - 30);

  doc.save(`ReguLens_OfficialReport_${reviewCase.id}.pdf`);
}
