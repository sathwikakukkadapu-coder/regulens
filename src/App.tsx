import React, { useState, useEffect } from 'react';
import { Sidebar, NavSection } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OverviewView } from './views/OverviewView';
import { NewReviewView } from './views/NewReviewView';
import { CaseManagementView } from './views/CaseManagementView';
import { DocumentVerificationView } from './views/DocumentVerificationView';
import { FindingsView } from './views/FindingsView';
import { ChecklistConfigView } from './views/ChecklistConfigView';
import { ReportsView } from './views/ReportsView';
import { AuditTrailView } from './views/AuditTrailView';
import { SettingsView } from './views/SettingsView';
import { EvidenceRequestModal } from './components/EvidenceRequestModal';
import { StorageService } from './services/storage';
import { runVerificationEngine } from './services/verificationEngine';
import { ReviewCase, Finding, DocumentEvidence, ChecklistItem, AuditEvent, SystemSettings, CaseStatus } from './types';

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Core state from persistence
  const [cases, setCases] = useState<ReviewCase[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string>('RL-2026-001');
  const [findings, setFindings] = useState<Finding[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(StorageService.getSettings());

  // Modal state
  const [evidenceRequestFinding, setEvidenceRequestFinding] = useState<Finding | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    StorageService.initialize();
    loadFromStorage();
  }, []);

  const loadFromStorage = () => {
    const loadedCases = StorageService.getCases();
    const loadedFindings = StorageService.getFindings();
    const loadedChecklist = StorageService.getChecklist();
    const loadedAudit = StorageService.getAuditTrail();
    const loadedSettings = StorageService.getSettings();

    setCases(loadedCases);
    setFindings(loadedFindings);
    setChecklist(loadedChecklist);
    setAuditTrail(loadedAudit);
    setSettings(loadedSettings);

    if (loadedCases.length > 0 && !loadedCases.some(c => c.id === activeCaseId)) {
      setActiveCaseId(loadedCases[0].id);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeCase = cases.find(c => c.id === activeCaseId) || cases[0] || null;

  // Handler: Select Case
  const handleSelectCase = (caseId: string) => {
    setActiveCaseId(caseId);
    showToast(`Switched active regulatory docket to ${caseId}`);
  };

  // Handler: Load Demo Case
  const handleLoadDemoCase = () => {
    setActiveCaseId('RL-2026-001');
    setActiveSection('verification');
    showToast('Loaded benchmark demonstration case: North Valley Institute of Technology');
  };

  // Handler: Create Case
  const handleCaseCreated = (newCase: ReviewCase) => {
    // Save to storage
    StorageService.saveCase(newCase);

    // Log audit event
    StorageService.logAuditEvent({
      action: 'Case Created',
      caseId: newCase.id,
      institutionName: newCase.institutionName,
      actor: settings.reviewerName,
      category: 'Case',
      details: `Created new review docket for ${newCase.institutionName} (${newCase.referenceNumber}) with ${newCase.documentsCount} documents.`,
      severity: 'info'
    });

    // Run verification automatically
    const verResult = runVerificationEngine(
      newCase,
      newCase.documents,
      checklist,
      settings.fuzzyThreshold
    );

    newCase.openFindingsCount = verResult.findings.length;
    StorageService.saveCase(newCase);
    StorageService.saveFindings(verResult.findings);

    StorageService.logAuditEvent({
      action: 'Verification Engine Executed',
      caseId: newCase.id,
      institutionName: newCase.institutionName,
      actor: 'ReguLens Deterministic Engine v2.4',
      category: 'Verification',
      details: `Verification finished: ${verResult.findings.length} findings surfaced across ${verResult.checksRunCount} automated checks.`,
      severity: verResult.findings.some(f => f.severity === 'High') ? 'warn' : 'info'
    });

    loadFromStorage();
    setActiveCaseId(newCase.id);
    setActiveSection('verification');
    showToast(`Case ${newCase.id} created and verified! ${verResult.findings.length} findings detected.`);
  };

  // Handler: Run Cross-Document Verification manually
  const handleRunVerification = (caseId: string) => {
    const c = cases.find(x => x.id === caseId);
    if (!c) return;

    const verResult = runVerificationEngine(
      c,
      c.documents || [],
      checklist,
      settings.fuzzyThreshold
    );

    StorageService.saveFindings(verResult.findings);
    c.openFindingsCount = verResult.findings.filter(f => f.status !== 'Resolved' && f.status !== 'Dismissed').length;
    StorageService.saveCase(c);

    StorageService.logAuditEvent({
      action: 'Manual Verification Triggered',
      caseId: c.id,
      institutionName: c.institutionName,
      actor: settings.reviewerName,
      category: 'Verification',
      details: `Executed verification engine on ${c.documents?.length || 0} documents. ${verResult.findings.length} findings surfaced.`,
      severity: verResult.findings.some(f => f.severity === 'High') ? 'alert' : 'info'
    });

    loadFromStorage();
    showToast(`Verification complete: ${verResult.findings.length} flags generated (${verResult.mismatchesCount} mismatches, ${verResult.missingDocsCount} missing).`);
  };

  // Handler: Add document to active case
  const handleAddDocument = (caseId: string, doc: DocumentEvidence) => {
    const c = cases.find(x => x.id === caseId);
    if (!c) return;

    const updatedDocs = [...(c.documents || []), doc];
    const updatedCase = {
      ...c,
      documents: updatedDocs,
      documentsCount: updatedDocs.length
    };

    StorageService.saveCase(updatedCase);
    StorageService.logAuditEvent({
      action: 'Document Uploaded',
      caseId: c.id,
      institutionName: c.institutionName,
      actor: settings.reviewerName,
      category: 'Document',
      details: `Added evidentiary file "${doc.name}" under category "${doc.category}".`,
      severity: 'info'
    });

    // Auto-run verification
    handleRunVerification(caseId);
  };

  // Handler: Update Finding
  const handleUpdateFinding = (updated: Finding) => {
    StorageService.updateFinding(updated);

    StorageService.logAuditEvent({
      action: 'Finding Triage Action',
      caseId: updated.caseId,
      actor: settings.reviewerName,
      category: 'Finding',
      details: `Finding "${updated.title}" status transitioned to "${updated.status}".`,
      severity: updated.status === 'Resolved' ? 'success' : 'warn'
    });

    loadFromStorage();
    showToast(`Finding updated to ${updated.status}`);
  };

  // Handler: Update Case Status
  const handleUpdateCaseStatus = (caseId: string, newStatus: CaseStatus, note?: string) => {
    const c = cases.find(x => x.id === caseId);
    if (!c) return;

    const updated = {
      ...c,
      status: newStatus,
      reviewerSummaryNote: note || c.reviewerSummaryNote
    };

    StorageService.saveCase(updated);
    StorageService.logAuditEvent({
      action: 'Case Status Changed',
      caseId: c.id,
      institutionName: c.institutionName,
      actor: settings.reviewerName,
      category: 'Case',
      details: `Status changed to "${newStatus}". Inspector note: ${note || 'None'}.`,
      severity: newStatus === 'Completed' ? 'success' : 'info'
    });

    loadFromStorage();
    showToast(`Case status updated to ${newStatus}`);
  };

  // Handler: Save Final Disposition
  const handleSaveDisposition = (caseId: string, disposition: string, note: string) => {
    const c = cases.find(x => x.id === caseId);
    if (!c) return;

    const updated = {
      ...c,
      finalDisposition: disposition,
      reviewerSummaryNote: note,
      dispositionDate: new Date().toISOString().substring(0, 10)
    };

    StorageService.saveCase(updated);
    StorageService.logAuditEvent({
      action: 'Final Disposition Recorded',
      caseId: c.id,
      institutionName: c.institutionName,
      actor: settings.reviewerName,
      category: 'Report',
      details: `Inspector recorded official disposition: "${disposition}".`,
      severity: 'success'
    });

    loadFromStorage();
    showToast(`Recorded official regulatory determination`);
  };

  // Handler: Archive Case
  const handleArchiveCase = (caseId: string) => {
    handleUpdateCaseStatus(caseId, 'Archived', 'Archived by lead inspector.');
  };

  // Handler: Reset All Data
  const handleResetAllData = () => {
    StorageService.resetAll();
    loadFromStorage();
    setActiveCaseId('RL-2026-001');
    setActiveSection('overview');
    showToast('Reset all data to clean default SIH benchmark state.');
  };

  const openFindingsCount = findings.filter(f => f.status !== 'Resolved' && f.status !== 'Dismissed').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Persistent Left Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        openFindingsCount={openFindingsCount}
        totalCasesCount={cases.length}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <Navbar
          onToggleMobile={() => setIsMobileNavOpen(!isMobileNavOpen)}
          activeCase={activeCase}
          cases={cases}
          findings={findings}
          onSelectCase={handleSelectCase}
          onLoadDemoCase={handleLoadDemoCase}
          onResetData={handleResetAllData}
          onNavigateToFindings={() => setActiveSection('findings')}
        />

        {/* View Content Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeSection === 'overview' && (
            <OverviewView
              cases={cases}
              findings={findings}
              auditTrail={auditTrail}
              onOpenCase={caseId => {
                setActiveCaseId(caseId);
                setActiveSection('verification');
              }}
              onCreateReview={() => setActiveSection('new-review')}
              onLoadDemoCase={handleLoadDemoCase}
            />
          )}

          {activeSection === 'new-review' && (
            <NewReviewView
              checklist={checklist}
              onCaseCreated={handleCaseCreated}
              onCancel={() => setActiveSection('cases')}
            />
          )}

          {activeSection === 'cases' && (
            <CaseManagementView
              cases={cases}
              onOpenCase={caseId => {
                setActiveCaseId(caseId);
                setActiveSection('verification');
              }}
              onCreateNew={() => setActiveSection('new-review')}
              onUpdateCaseStatus={handleUpdateCaseStatus}
              onArchiveCase={handleArchiveCase}
              onLoadDemoCase={handleLoadDemoCase}
            />
          )}

          {activeSection === 'verification' && (
            <DocumentVerificationView
              reviewCase={activeCase}
              documents={activeCase?.documents || []}
              checklist={checklist}
              findings={findings}
              onRunVerification={handleRunVerification}
              onAddDocument={handleAddDocument}
              onSelectFinding={findingId => {
                setActiveSection('findings');
              }}
            />
          )}

          {activeSection === 'findings' && (
            <FindingsView
              findings={findings}
              onUpdateFinding={handleUpdateFinding}
              onRequestEvidence={finding => setEvidenceRequestFinding(finding)}
            />
          )}

          {activeSection === 'checklist' && (
            <ChecklistConfigView
              checklist={checklist}
              onUpdateItem={item => {
                StorageService.updateChecklistItem(item);
                loadFromStorage();
              }}
              onResetChecklist={() => {
                StorageService.saveChecklist(checklist);
                loadFromStorage();
              }}
            />
          )}

          {activeSection === 'reports' && (
            <ReportsView
              cases={cases}
              activeCase={activeCase}
              onSelectCase={setActiveCaseId}
              findings={findings}
              checklist={checklist}
              settings={settings}
              onSaveDisposition={handleSaveDisposition}
            />
          )}

          {activeSection === 'audit' && (
            <AuditTrailView auditTrail={auditTrail} />
          )}

          {activeSection === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={s => {
                StorageService.saveSettings(s);
                setSettings(s);
              }}
              onResetAllData={handleResetAllData}
            />
          )}
        </main>
      </div>

      {/* Modal: Request for Evidence Notice */}
      {evidenceRequestFinding && (
        <EvidenceRequestModal
          finding={evidenceRequestFinding}
          reviewCase={activeCase}
          onClose={() => setEvidenceRequestFinding(null)}
        />
      )}
    </div>
  );
};

export default App;
