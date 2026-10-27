# ReguLens AI
## Evidence-Led Regulatory Review and Document Verification Platform
### Smart India Hackathon (SIH) Prototype Submission

> **Core Principle:** AI assists the human reviewer; it does not replace expert judgment or make automated rejections.

---

## 1. Problem Statement & Overview

Regulatory bodies (e.g. AICTE, UGC, PCI, NMC, State Education Directorates) must process extensive institutional approval dossiers containing dozens of deeds, municipal sanctions, structural stability reports, and safety certifications. Manual inspection is prone to:
- Overlooking subtle coordinate or cadastral mismatches across documents (e.g., Survey Number `142/3B` vs `142/8A`).
- Failing to detect unsubmitted or missing statutory prerequisites (e.g., Missing Fire Safety NOC).
- Difficulty tracking slight institutional name variants or discrepancies between trust titles and municipal approvals.
- Time-consuming reconciliation between engineering inspection dates and foundation approvals.

**ReguLens AI** solves this by organizing institutional evidence, automatically normalizing document parameters, running deterministic cross-document consistency checks, highlighting exact discrepancies with side-by-side evidence links, drafting statutory clarification notices (RFEs), and generating audit-ready PDF/JSON reports.

---

## 2. Key Implemented Features

### 1. Overview Dashboard
- **6 Key KPI Metrics**: Total Cases, Documents Ingested, Pending Reviews, Open Findings, Missing-Document Alerts, Completed Determinations.
- **Visual Analytics**: Interactive Recharts donut chart for case status distribution and bar chart for findings by severity.
- **Recent Cases Table**: Live search, category filters, and 1-click navigation into case workspaces.
- **Live Regulatory Audit Timeline**: Chronological log of recent verification events.
- **Prominent SIH Quick Actions**: "Load Demo Case" and "Create New Review" buttons.

### 2. Multi-Step Case Creation Wizard (`New Review`)
- **Step 1: Institutional Particulars**: Capture institution name, type, application/reference ID, location, review category, and assigned inspector.
- **Step 2: Configurable Required Documents**: Select statutory checklist items applicable to the review category (AICTE, NBC, Fire Safety).
- **Step 3: Evidence Upload & Ingestion**: Drag-and-drop file upload with category tagging, hash computation, and format validation (TXT, CSV, JSON, PDF).
- **Step 4: Docket Verification Confirmation**: Summary review and 1-click launch of the verification engine.

### 3. Testable Cross-Document Verification Engine
- **Exact Mismatch Detection**: Flags mismatched Survey Numbers, Plot Identifiers, Land Acreage, and Sanctioned Intake across files.
- **Institution Name Variation**: Fuzzy token-similarity matching detects name variants (e.g., `"North Valley Institute of Technology"` vs `"North Valley Inst. of Tech. & Research"`).
- **Missing Required Document Checks**: Evaluates uploaded files against the selected checklist (e.g., flags missing Fire Safety Certificate `CHK-03`).
- **Duplicate Document Detection**: Compares SHA-256 cryptographic hashes and text digests to prevent redundant submissions.
- **Date Consistency & Chronology**: Identifies reverse chronological ordering (e.g., structural inspection dated before foundation approval) and expired certificates.
- **Extraction Advisories**: Transparently flags scanned/rasterized PDFs requiring manual reviewer confirmation.

### 4. Evidence-Linked Findings & Triage
- Side-by-side comparison of **Source Exhibit A** vs **Source Exhibit B / Statutory Requirement**.
- Full audit explanation citing the specific regulatory rule (AICTE Handbook, NBC 2016, Fire Safety Act).
- Inspector triage controls: Mark Under Review, Verify Discrepancy, Mark Resolved, Dismiss with recorded rationale.
- Inspector notes & automated **Notice of Defect (RFE Form 4B)** letter generator.

### 5. Document Viewer & Text Inspector
- Full text stream viewer with in-document keyword search and instant yellow highlighting.
- Normalized parameters card (Survey No, Plot No, Acreage, Reference No, Dates, Authority).
- SHA-256 fingerprint display with 1-click clipboard copy.

### 6. Regulatory Checklist Configuration
- Configurable rule repository supporting AICTE, NBC, UGC, and Fire Safety standards.
- Add new regulatory rules with expected evidence types and validation methods.

### 7. Statutory Reports & Exports
- **Official PDF Report Generator**: Generates clean, multi-page regulatory dossiers formatted for committee meetings with letterhead, evidence tables, findings breakdown, human determination, and signature blocks.
- **JSON Export**: Full structured schema for integration with government portal APIs.
- **CSV Export**: Tabular export of all case findings for spreadsheet analysis.

### 8. Immutable Audit Trail
- Traceable log of case creation, file ingestion, verification execution, finding triage, and final determinations.

### 9. System Settings & Governance
- Adjustable fuzzy similarity threshold (60% to 95%).
- Configurable reviewer identity, designation, and agency name.
- 1-Click database restore to the benchmark North Valley Institute demonstration state.

---

## 3. Technology Stack

- **Frontend Framework**: React 18 with TypeScript.
- **Build Tool**: Vite 6.
- **Styling**: Tailwind CSS with custom government navy palette (`#0F172A`, `#0B132B`, `#1E293B`, `#0D9488`).
- **Icons**: Lucide React.
- **Charts & Visualizations**: Recharts.
- **PDF Generation**: jsPDF with custom tabular formatting.
- **Data Persistence**: LocalStorage with automatic schema initialization and sample data seeding.
- **Automated Testing**: Node.js test runner verifying verification engine algorithms.

---

## 4. Quick Start & Run Instructions

### Prerequisites
- Node.js (v18 or higher recommended, tested on Node v24)
- npm (v9 or higher)

### Installation & Execution
```bash
# 1. Install dependencies (already installed in workspace)
npm install

# 2. Run automated verification engine tests
npm test

# 3. Start local development server
npm run dev
```

The application will be available at:
`http://localhost:5173`

To build the production bundle:
```bash
npm run build
```

---

## 5. Suggested SIH Demo Walkthrough

1. **Dashboard Overview**:
   - Open the web application at `http://localhost:5173`.
   - Point out the 6 KPI metric cards, the case distribution chart, and the live activity log.
2. **Load Benchmark Demo Case**:
   - Click the **"Load Demo Case"** button in the top navigation bar.
   - The system opens **North Valley Institute of Technology** (`RL-2026-001`).
3. **Inspect Document Evidence**:
   - Navigate to **Document Verification** in the sidebar.
   - Select `Land_Deed_Registry_2022.txt` and note Survey Number `142/3B`.
   - Select `Structural_Safety_Report_2025.txt` and note Survey Number `142/8A`.
   - Use the text search box to search for `142/` and demonstrate real-time text highlighting.
4. **Inspect Cross-Document Findings**:
   - Navigate to **Findings & Alerts**.
   - Open the **HIGH: Survey Number Mismatch** finding.
   - Show judges the side-by-side comparison: `142/3B (Land Deed)` vs `142/8A (Structural Safety Report)`.
   - Open the **HIGH: Mandatory Document Missing** finding showing that the **Fire Safety Certificate** was omitted from the submission.
5. **Take Reviewer Action & Draft Notice**:
   - Click **"Draft Formal Evidence Request (RFE)"** to generate an official statutory Notice of Defect (Form 4B) demanding revenue clarification.
   - Mark the finding as **"Verified Discrepancy"** or add an inspector note.
6. **Record Human Determination & Export Report**:
   - Navigate to **Reports**.
   - Review the generated on-screen regulatory dossier.
   - Select the reviewer determination (e.g. *"Notice of Defect (Form 4B) Issued"*).
   - Click **"Generate Official PDF Report"** to download the signed PDF dossier.

---

## 6. Current Prototype vs Planned Capabilities

| Capability | Status in Current Prototype | Notes for Judges |
| :--- | :--- | :--- |
| **Cross-Document Mismatch Engine** | ✅ **Fully Implemented** | Detects survey numbers, plot IDs, land area, and date sequences |
| **Missing Document Verification** | ✅ **Fully Implemented** | Compares submitted files against configured regulatory checklist |
| **Fuzzy Name Variation Matching** | ✅ **Fully Implemented** | Identifies legal name abbreviations with similarity scoring |
| **PDF, TXT, CSV, JSON Ingestion** | ✅ **Fully Implemented** | Ingests, hashes, and normalizes structured parameters |
| **Official PDF & JSON Dossier Export**| ✅ **Fully Implemented** | Generates auditable government PDF reports with sign-offs |
| **Interactive Reviewer Triage** | ✅ **Fully Implemented** | Allows reviewers to verify, resolve, dismiss, and draft RFEs |
| **OCR for Scanned/Rasterized PDFs** | ⏳ **Advisory Handled** | Scans flagged with clear transparency notice for reviewer check |
| **Official AICTE / National Portal Sync** | ⏳ **Planned Enhancement** | Architecture ready for REST API integration with national portal |
| **Digital Signature Cryptographic Audit** | ⏳ **Planned Phase 2** | Digital certificate chain verification planned for next sprint |
