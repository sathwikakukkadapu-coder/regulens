import { ReviewCase, Finding, ChecklistItem, AuditEvent, SystemSettings } from '../types';
import {
  INITIAL_CASES,
  INITIAL_FINDINGS,
  INITIAL_CHECKLIST,
  INITIAL_AUDIT_TRAIL,
  INITIAL_SETTINGS
} from '../data/mockData';

const STORAGE_KEYS = {
  CASES: 'regulens_cases',
  FINDINGS: 'regulens_findings',
  CHECKLIST: 'regulens_checklist',
  AUDIT: 'regulens_audit_trail',
  SETTINGS: 'regulens_settings',
  INITIALIZED: 'regulens_initialized_v2'
};

export const StorageService = {
  initialize() {
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInit) {
      this.resetAll();
    }
  },

  resetAll() {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
    localStorage.setItem(STORAGE_KEYS.FINDINGS, JSON.stringify(INITIAL_FINDINGS));
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(INITIAL_CHECKLIST));
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(INITIAL_AUDIT_TRAIL));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  },

  // Cases
  getCases(): ReviewCase[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CASES);
      return data ? JSON.parse(data) : INITIAL_CASES;
    } catch {
      return INITIAL_CASES;
    }
  },

  getCaseById(id: string): ReviewCase | undefined {
    return this.getCases().find(c => c.id === id);
  },

  saveCase(reviewCase: ReviewCase) {
    const cases = this.getCases();
    const index = cases.findIndex(c => c.id === reviewCase.id);
    if (index >= 0) {
      cases[index] = { ...reviewCase, updatedAt: new Date().toISOString() };
    } else {
      cases.unshift({ ...reviewCase, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  },

  deleteCase(id: string) {
    const cases = this.getCases().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    // also remove findings
    const findings = this.getFindings().filter(f => f.caseId !== id);
    localStorage.setItem(STORAGE_KEYS.FINDINGS, JSON.stringify(findings));
  },

  // Findings
  getFindings(caseId?: string): Finding[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FINDINGS);
      const all: Finding[] = data ? JSON.parse(data) : INITIAL_FINDINGS;
      if (caseId) {
        return all.filter(f => f.caseId === caseId);
      }
      return all;
    } catch {
      return INITIAL_FINDINGS;
    }
  },

  saveFindings(newFindings: Finding[]) {
    const all = this.getFindings();
    const existingMap = new Map(all.map(f => [f.id, f]));
    newFindings.forEach(f => existingMap.set(f.id, f));
    localStorage.setItem(STORAGE_KEYS.FINDINGS, JSON.stringify(Array.from(existingMap.values())));
  },

  updateFinding(updated: Finding) {
    const all = this.getFindings();
    const index = all.findIndex(f => f.id === updated.id);
    if (index >= 0) {
      all[index] = updated;
    } else {
      all.unshift(updated);
    }
    localStorage.setItem(STORAGE_KEYS.FINDINGS, JSON.stringify(all));

    // Update case finding count
    const cases = this.getCases();
    const caseIndex = cases.findIndex(c => c.id === updated.caseId);
    if (caseIndex >= 0) {
      const openCount = all.filter(f => f.caseId === updated.caseId && f.status !== 'Resolved' && f.status !== 'Dismissed').length;
      cases[caseIndex].openFindingsCount = openCount;
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    }
  },

  // Checklists
  getChecklist(): ChecklistItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
      return data ? JSON.parse(data) : INITIAL_CHECKLIST;
    } catch {
      return INITIAL_CHECKLIST;
    }
  },

  saveChecklist(items: ChecklistItem[]) {
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(items));
  },

  updateChecklistItem(item: ChecklistItem) {
    const list = this.getChecklist();
    const index = list.findIndex(c => c.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.push(item);
    }
    this.saveChecklist(list);
  },

  // Audit
  getAuditTrail(): AuditEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT);
      return data ? JSON.parse(data) : INITIAL_AUDIT_TRAIL;
    } catch {
      return INITIAL_AUDIT_TRAIL;
    }
  },

  logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
    const events = this.getAuditTrail();
    const newEvent: AuditEvent = {
      ...event,
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    events.unshift(newEvent);
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(events));
  },

  // Settings
  getSettings(): SystemSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings: SystemSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
};
