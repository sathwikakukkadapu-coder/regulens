export type FindingSeverity = 'High' | 'Medium' | 'Low' | 'Informational';

export type FindingStatus = 'Open' | 'Under Review' | 'Verified Discrepancy' | 'Resolved' | 'Dismissed';

export type FindingCategory =
  | 'Exact Mismatch'
  | 'Name Variation'
  | 'Missing Document'
  | 'Duplicate Document'
  | 'Incomplete Data'
  | 'Date Inconsistency'
  | 'Extraction Warning';

export type CaseStatus =
  | 'Draft'
  | 'In Progress'
  | 'Needs Review'
  | 'Awaiting Evidence'
  | 'Completed'
  | 'Archived';

export interface DocumentEvidence {
  id: string;
  caseId: string;
  name: string;
  category: string; // e.g., 'Land Ownership Deed', 'Fire Safety Certificate'
  fileType: string;
  size: number;
  uploadDate: string;
  status: 'Uploaded' | 'Processed' | 'Parsing Failed' | 'Uncertain Extraction';
  extractedText: string;
  structuredFields: {
    institutionName?: string;
    applicationRef?: string;
    surveyNumber?: string;
    plotNumber?: string;
    landAreaAcres?: string;
    issuanceDate?: string;
    validUntilDate?: string;
    address?: string;
    approvedIntake?: string;
    issuingAuthority?: string;
    [key: string]: string | undefined;
  };
  hash: string;
  warnings: string[];
  pageReferences?: string[];
  isDemoFile?: boolean;
}

export interface Finding {
  id: string;
  caseId: string;
  title: string;
  severity: FindingSeverity;
  category: FindingCategory;
  sourceDocuments: string[];
  comparedField: string;
  extractedValueA?: string;
  extractedValueB?: string;
  reason: string;
  recommendedAction: string;
  status: FindingStatus;
  assignedReviewer: string;
  dateDetected: string;
  reviewerNotes?: string;
  dismissalReason?: string;
  additionalEvidenceRequested?: string;
  ruleReference?: string;
}

export interface ReviewCase {
  id: string;
  institutionName: string;
  institutionType: string;
  referenceNumber: string;
  location: string;
  academicYear: string;
  reviewCategory: string;
  assignedReviewer: string;
  submissionDate: string;
  status: CaseStatus;
  openFindingsCount: number;
  documentsCount: number;
  documents: DocumentEvidence[];
  checklistIds: string[];
  finalDisposition?: string;
  reviewerSummaryNote?: string;
  dispositionDate?: string;
  isDemoCase?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  category: string;
  requirementName: string;
  description: string;
  isRequired: boolean;
  expectedEvidenceType: string;
  validationMethod: string;
  ruleSource: string;
  effectiveDate: string;
  currentStatus: 'Verified' | 'Pending' | 'Flagged' | 'Missing';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  caseId?: string;
  institutionName?: string;
  actor: string;
  details: string;
  category: 'Case' | 'Document' | 'Verification' | 'Finding' | 'Report' | 'Security';
  severity?: 'info' | 'warn' | 'success' | 'alert';
}

export interface SystemSettings {
  aiAssistantEnabled: boolean;
  demoMode: boolean;
  fuzzyThreshold: number; // 0 to 1
  reviewerName: string;
  reviewerDesignation: string;
  regulatoryBody: string;
  notifyOnHighSeverity: boolean;
}
