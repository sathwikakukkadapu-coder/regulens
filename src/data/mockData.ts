import { ReviewCase, ChecklistItem, AuditEvent, SystemSettings, Finding } from '../types';

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: 'CHK-01',
    category: 'Land & Infrastructure',
    requirementName: 'Registered Land Title / Lease Deed',
    description: 'Minimum 5.0 acres in rural or 2.5 acres in metro area contiguous land registered for a minimum of 30 years.',
    isRequired: true,
    expectedEvidenceType: 'Registered Land Title / Lease Agreement',
    validationMethod: 'Survey Number, Plot ID, and Contiguity cross-check against application',
    ruleSource: 'AICTE Approval Handbook 2024-27, Clause 4.1',
    effectiveDate: '2024-04-01',
    currentStatus: 'Verified',
  },
  {
    id: 'CHK-02',
    category: 'Safety & Compliance',
    requirementName: 'Structural Safety & Stability Certificate',
    description: 'Certified structural engineer stability report for all academic and laboratory building blocks.',
    isRequired: true,
    expectedEvidenceType: 'Structural Engineer Audit Report & Inspection Cert',
    validationMethod: 'Survey number consistency and engineering certification date sequence',
    ruleSource: 'National Building Code of India (NBC 2016), Part 6',
    effectiveDate: '2023-01-15',
    currentStatus: 'Flagged',
  },
  {
    id: 'CHK-03',
    category: 'Safety & Compliance',
    requirementName: 'Fire Safety Certificate / NOC',
    description: 'Valid Fire Safety No-Objection Certificate from State/Municipal Fire Services Department.',
    isRequired: true,
    expectedEvidenceType: 'Government Fire Services Clearance NOC',
    validationMethod: 'Document presence, issuing authority seal, and validity period check',
    ruleSource: 'State Fire Prevention & Life Safety Measures Act',
    effectiveDate: '2024-01-01',
    currentStatus: 'Missing',
  },
  {
    id: 'CHK-04',
    category: 'Land & Infrastructure',
    requirementName: 'Municipal / Town Planning Approved Building Plan',
    description: 'Building sanction plan approved by the Competent Town Planning Authority / Municipal Corporation.',
    isRequired: true,
    expectedEvidenceType: 'Sanctioned Blueprint & Planning Clearance',
    validationMethod: 'Institution name match and plot/survey coordinate alignment',
    ruleSource: 'State Town & Country Planning Act, Sec 14',
    effectiveDate: '2022-08-10',
    currentStatus: 'Verified',
  },
  {
    id: 'CHK-05',
    category: 'Financial & Governance',
    requirementName: 'Audited Financial Statements (Last 3 Years)',
    description: 'Audited balance sheet and income-expenditure statement certified by a registered Chartered Accountant.',
    isRequired: false,
    expectedEvidenceType: 'CA Certified Audit Balance Sheets',
    validationMethod: 'UDIN verification and reserve fund threshold compliance',
    ruleSource: 'AICTE Financial Norms Handbook, Clause 7.3',
    effectiveDate: '2024-04-01',
    currentStatus: 'Pending',
  },
  {
    id: 'CHK-06',
    category: 'Academic Administration',
    requirementName: 'University Affiliation Order / Letter of Intent',
    description: 'Formal affiliation letter from the affiliating State / Central University.',
    isRequired: true,
    expectedEvidenceType: 'University Registrar Affiliation Order',
    validationMethod: 'Institution name match and academic session alignment',
    ruleSource: 'UGC Affiliation Guidelines 2023',
    effectiveDate: '2023-06-01',
    currentStatus: 'Pending',
  }
];

export const INITIAL_FINDINGS: Finding[] = [
  {
    id: 'FND-2026-001',
    caseId: 'RL-2026-001',
    title: 'Survey Number Mismatch across Land & Structural Records',
    severity: 'High',
    category: 'Exact Mismatch',
    sourceDocuments: ['Land_Deed_Registry_2022.txt', 'Structural_Safety_Report_2025.txt'],
    comparedField: 'Survey Number',
    extractedValueA: '142/3B (Land Deed)',
    extractedValueB: '142/8A (Structural Safety Report)',
    reason: 'The survey number specified in the registered land deed (142/3B) differs from the survey number certified in the structural safety audit (142/8A). This indicates either an erroneous survey partition or inspection conducted on an unverified parcel.',
    recommendedAction: 'Ask reviewer to compare original revenue records, request municipal demarcation certificate, and confirm correct land parcel identifier before proceeding with approval.',
    status: 'Open',
    assignedReviewer: 'Dr. Aris Thorne (Lead Inspector)',
    dateDetected: '2026-10-24 14:32',
    ruleReference: 'AICTE Approval Handbook 2024-27, Clause 4.1.2 (Land Contiguity & Title Verification)',
    reviewerNotes: 'Survey partition 142/8A may be an adjacent parcel not covered under the original lease. Clarification memo issued.',
  },
  {
    id: 'FND-2026-002',
    caseId: 'RL-2026-001',
    title: 'Mandatory Fire Safety Certificate Not Detected',
    severity: 'High',
    category: 'Missing Document',
    sourceDocuments: ['Required: Fire Safety Certificate / NOC'],
    comparedField: 'Document Presence (CHK-03)',
    extractedValueA: 'Required: Fire Safety Certificate',
    extractedValueB: 'Status: Not Uploaded in submitted dossier',
    reason: 'The mandatory Fire Safety Certificate / NOC from the Competent Fire Authority was selected in the required regulatory checklist but was not detected in the uploaded evidence bundle.',
    recommendedAction: 'Issue formal Notice of Defect (Form 4B) requesting the applicant institution to furnish the valid Fire Safety NOC within 14 calendar days.',
    status: 'Open',
    assignedReviewer: 'Dr. Aris Thorne (Lead Inspector)',
    dateDetected: '2026-10-24 14:32',
    ruleReference: 'State Fire Prevention & Life Safety Measures Act Sec 19',
    reviewerNotes: 'Statutory prerequisite. Approval cannot proceed without valid fire NOC.',
  },
  {
    id: 'FND-2026-003',
    caseId: 'RL-2026-001',
    title: 'Institution Name Variation across Town Planning NOC',
    severity: 'Medium',
    category: 'Name Variation',
    sourceDocuments: ['NVIT_Form_A_Approval.txt', 'Town_Planning_NOC_2024.txt'],
    comparedField: 'Institution Name',
    extractedValueA: 'North Valley Institute of Technology (Application)',
    extractedValueB: 'North Valley Inst. of Tech. & Research (Town Planning NOC)',
    reason: 'Slight title discrepancy detected. The town planning approval includes "& Research" in the formal title. Similarity score: 86%.',
    recommendedAction: 'Verify whether the trust passed a board resolution modifying the registered name or if a name correction certificate was issued by the registrar of societies.',
    status: 'Under Review',
    assignedReviewer: 'Dr. Aris Thorne (Lead Inspector)',
    dateDetected: '2026-10-24 14:33',
    ruleReference: 'AICTE Approval Handbook Clause 2.4 (Legal Name Consistency)',
    reviewerNotes: 'Likely an abbreviated legal trade name. Request trust resolution copy.',
  },
  {
    id: 'FND-2026-004',
    caseId: 'RL-2026-001',
    title: 'Inconsistent Chronological Sequence: Inspection vs Foundation',
    severity: 'Medium',
    category: 'Date Inconsistency',
    sourceDocuments: ['Structural_Safety_Report_2025.txt'],
    comparedField: 'Inspection Date vs Foundation Approval Date',
    extractedValueA: 'Inspection Date: 2025-11-10',
    extractedValueB: 'Foundation Approval Date: 2025-12-04',
    reason: 'The building structural safety inspection is recorded as having taken place on 2025-11-10, which precedes the recorded foundation approval date of 2025-12-04.',
    recommendedAction: 'Request chartered engineer to verify inspection log and submit corrected chronological affidavit.',
    status: 'Open',
    assignedReviewer: 'Dr. Aris Thorne (Lead Inspector)',
    dateDetected: '2026-10-24 14:33',
    ruleReference: 'NBC 2016 Part 6 Engineering Validation Order',
  },
  {
    id: 'FND-2026-005',
    caseId: 'RL-2026-002',
    title: 'Sanctioned Intake Discrepancy between Proposal and State NOC',
    severity: 'Medium',
    category: 'Exact Mismatch',
    sourceDocuments: ['CityTech_Proposal.txt', 'State_HigherEd_NOC.txt'],
    comparedField: 'Sanctioned Computer Science Intake',
    extractedValueA: '180 Seats (Proposal)',
    extractedValueB: '120 Seats (State Higher Ed NOC)',
    reason: 'The proposed intake exceeds the capacity endorsed in the State Higher Education Department approval by 60 seats.',
    recommendedAction: 'Restrict intake to 120 seats pending revised state council endorsement.',
    status: 'Verified Discrepancy',
    assignedReviewer: 'Kavita Menon (Senior Officer)',
    dateDetected: '2026-10-22 11:15',
    ruleReference: 'AICTE Intake Norms 2024 Clause 3.2',
  },
  {
    id: 'FND-2026-006',
    caseId: 'RL-2026-005',
    title: 'Hospital Bed Affiliation Minimum Standard Not Met',
    severity: 'High',
    category: 'Incomplete Data',
    sourceDocuments: ['Medical_Council_MOU.txt'],
    comparedField: 'Active Bed Strength',
    extractedValueA: '240 Functional Beds',
    extractedValueB: 'Required Standard: 300 Functional Beds',
    reason: 'MOU with District Hospital lists 240 functional teaching beds, failing to meet the statutory threshold of 300 beds for 100 MBBS annual admissions.',
    recommendedAction: 'Notify medical institute board to expand teaching hospital wing or present supplementary clinical tie-up agreement.',
    status: 'Open',
    assignedReviewer: 'Dr. Aris Thorne (Lead Inspector)',
    dateDetected: '2026-10-25 09:40',
    ruleReference: 'National Medical Commission Minimum Standard Requirements 2023',
  }
];

export const INITIAL_CASES: ReviewCase[] = [
  {
    id: 'RL-2026-001',
    institutionName: 'North Valley Institute of Technology',
    institutionType: 'Engineering & Technology (Self-Financing)',
    referenceNumber: 'SIH-DEMO-2026-014',
    location: 'Dehradun, Uttarakhand',
    academicYear: '2026-2027',
    reviewCategory: 'New Institute Approval & Land Compliance',
    assignedReviewer: 'Dr. Aris Thorne (Lead Inspector)',
    submissionDate: '2026-10-24',
    status: 'Needs Review',
    openFindingsCount: 4,
    documentsCount: 4,
    checklistIds: ['CHK-01', 'CHK-02', 'CHK-03', 'CHK-04', 'CHK-05', 'CHK-06'],
    isDemoCase: true,
    reviewerSummaryNote: 'Critical discrepancies flagged: Survey number discrepancy between Land Deed and Structural Report (142/3B vs 142/8A), and Fire NOC is missing from upload bundle. Clarification required before final board sitting.',
    createdAt: '2026-10-24T14:30:00Z',
    updatedAt: '2026-10-24T15:10:00Z',
    documents: [
      {
        id: 'DOC-NVIT-01',
        caseId: 'RL-2026-001',
        name: 'NVIT_Form_A_Approval.txt',
        category: 'Institution Application Form',
        fileType: 'text/plain',
        size: 14280,
        uploadDate: '2026-10-24 14:31',
        status: 'Processed',
        extractedText: `REGULATORY APPROVAL APPLICATION FORM - PART A
=====================================================
Application ID: SIH-DEMO-2026-014
Legal Entity / Trust: Himalayan Educational & Research Foundation
Institution Name: North Valley Institute of Technology
Campus Location: Survey No. 142/3B, Plot #44, Sector 9, IT Park Road, Dehradun - 248001
State: Uttarakhand | District: Dehradun
Academic Year: 2026-2027
Proposed Programs:
  - B.Tech Computer Science & Engineering (Intake: 180)
  - B.Tech Electronics & Communication (Intake: 120)
  - B.Tech Artificial Intelligence & Data Science (Intake: 120)
  - B.Tech Mechanical Engineering (Intake: 60)
Total Sanctioned Intake: 480 Seats
Total Land Area Claimed: 12.50 Acres (Contiguous, Institutional Use)
Primary Survey Parcel: 142/3B
Building Carpet Area: 22,400 sq. meters
Head of Institution: Dr. Rajeshwar Sharma, Director
Contact: director@northvalley.edu.in | +91-135-2981001
Declaration: The applicant affirms that all details provided in this dossier correspond to registered title deeds and statutory certifications.`,
        structuredFields: {
          institutionName: 'North Valley Institute of Technology',
          applicationRef: 'SIH-DEMO-2026-014',
          surveyNumber: '142/3B',
          plotNumber: 'Plot #44, Sector 9',
          landAreaAcres: '12.50 Acres',
          address: 'Sector 9, IT Park Road, Dehradun - 248001',
          approvedIntake: '480 Seats',
          issuingAuthority: 'Self-Declaration / Trust Board',
          issuanceDate: '2026-10-15',
        },
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        warnings: [],
        pageReferences: ['Section 1: General Info', 'Section 3: Land Particulars', 'Section 5: Academic Program Details'],
        isDemoFile: true,
      },
      {
        id: 'DOC-NVIT-02',
        caseId: 'RL-2026-001',
        name: 'Land_Deed_Registry_2022.txt',
        category: 'Land Ownership Deed / Title',
        fileType: 'text/plain',
        size: 28410,
        uploadDate: '2026-10-24 14:31',
        status: 'Processed',
        extractedText: `OFFICE OF THE SUB-REGISTRAR OF REVENUE & LAND RECORDS
GOVERNMENT OF UTTARAKHAND
=====================================================
Deed Registration No: REG-LRD-8839/2022
Book No: 1 | Volume: 412 | Pages: 88 to 114
Date of Registration: 15th March 2022

LESSOR: Uttarakhand State Industrial Infrastructure Development Corporation
LESSEE: Himalayan Educational & Research Foundation
BENEFICIARY INSTITUTION: North Valley Institute of Technology

SCHEDULE OF PROPERTY:
All that parcel of institutional land measuring 12.50 Acres (50,585 sq. meters)
situated at:
Revenue Village: Raipur, Tehsil Dehradun Sadar
Revenue Survey Number: 142/3B
Sub-division: Khasra 142/3B
Plot Identification: Plot #44, Sector 9
Boundaries:
  North: Public Green Corridor (60 ft Road)
  South: Sector 9 Internal Spine Road
  East: Survey 142/3A (Agricultural Buffer)
  West: Government Canal Reserve

Term of Lease: 99 Years commencing from 01-04-2022
Purpose: Establishment of Higher Technical & Research Education Campus
Zoning: Institutional / Education Category Approved.
Encumbrance Status: Nil. Free from all mortgages and judicial liens.`,
        structuredFields: {
          institutionName: 'North Valley Institute of Technology',
          applicationRef: 'REG-LRD-8839/2022',
          surveyNumber: '142/3B',
          plotNumber: 'Plot #44, Sector 9',
          landAreaAcres: '12.50 Acres',
          address: 'Revenue Village Raipur, Tehsil Dehradun Sadar, Uttarakhand',
          issuingAuthority: 'Sub-Registrar of Revenue, Dehradun',
          issuanceDate: '2022-03-15',
          validUntilDate: '2121-03-14',
        },
        hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
        warnings: [],
        pageReferences: ['Schedule of Property, Page 92', 'Term & Covenant, Page 96'],
        isDemoFile: true,
      },
      {
        id: 'DOC-NVIT-03',
        caseId: 'RL-2026-001',
        name: 'Structural_Safety_Report_2025.txt',
        category: 'Building / Structural Safety Report',
        fileType: 'text/plain',
        size: 19520,
        uploadDate: '2026-10-24 14:31',
        status: 'Processed',
        extractedText: `APEX STRUCTURAL & GEOTECHNICAL CONSULTANTS
(Empaneled Certified Structural Engineers - Reg No: CSE/UK/2018/092)
=====================================================
STRUCTURAL STABILITY & SAFETY AUDIT CERTIFICATE
Reference: ASSC/2025/AUD-4188
Client: Himalayan Educational & Research Foundation
Institution Examined: North Valley Institute of Technology

SITE LOCATION PARTICULARS:
Address: Sector 9, IT Park Road, Dehradun, Uttarakhand
Cadastral Reference: Survey Number 142/8A, Plot #44
[NOTICE: Structural engineer noted inspection conducted on Parcel 142/8A]

CHRONOLOGY & AUDIT DETAILS:
Site Inspection Date: 2025-11-10
Foundation Approval Date: 2025-12-04
Building Components Inspected:
  - Academic Block A (Ground + 4 Upper Floors) - Reinforced Concrete Frame
  - Academic Block B (Ground + 3 Upper Floors) - Steel Composite
  - Central Library & Auditorium Complex (Ground + 2 Floors)
  - Engineering Workshop Hangar

OBSERVATIONS & STRUCTURAL VERIFICATION:
1. Seismic Zone: Zone IV compliance verified with ductile detailing (IS 13920:2016).
2. Live load design criteria: 4.0 kN/m² for classrooms and 5.0 kN/m² for workshops.
3. No critical structural distress, settlement, or shear fissures detected.
4. Certificate validity: 5 Years from date of inspection.

Signed by: Er. B. K. Nautiyal, FIE, Chartered Structural Engineer`,
        structuredFields: {
          institutionName: 'North Valley Institute of Technology',
          applicationRef: 'ASSC/2025/AUD-4188',
          surveyNumber: '142/8A', // DISCREPANCY!
          plotNumber: 'Plot #44',
          issuingAuthority: 'Apex Structural Consultants (Reg CSE/UK/2018/092)',
          issuanceDate: '2025-11-10', // DATE ANOMALY!
          validUntilDate: '2030-11-09',
        },
        hash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
        warnings: [
          'Survey number 142/8A does not match land title deed 142/3B.',
          'Inspection date 2025-11-10 precedes foundation approval date 2025-12-04.'
        ],
        pageReferences: ['Site Location Particulars, Page 2', 'Chronology & Inspection Log, Page 4'],
        isDemoFile: true,
      },
      {
        id: 'DOC-NVIT-04',
        caseId: 'RL-2026-001',
        name: 'Town_Planning_NOC_2024.txt',
        category: 'Approved Building Plan / Town Planning NOC',
        fileType: 'text/plain',
        size: 16800,
        uploadDate: '2026-10-24 14:31',
        status: 'Processed',
        extractedText: `MUSSOORIE DEHRADUN DEVELOPMENT AUTHORITY (MDDA)
TOWN & COUNTRY PLANNING DEPARTMENT
=====================================================
File No: MDDA/TCP/2024/INST-0914
Date of Grant: 18th July 2024

SUBJECT: Sanction of Master Layout and Building Sanction Plan for Educational Complex

To,
The Chairman / Secretary,
Himalayan Educational & Research Foundation,
For: North Valley Inst. of Tech. & Research
Campus Site: Survey No. 142/3B, Plot #44, Sector 9, Raipur, Dehradun

With reference to your application dated 02-02-2024, sanction is hereby accorded
for institutional campus construction subject to following specifications:
- Sanctioned Built-up Area: 22,400 sq. meters
- Maximum Permissible Ground Coverage: 30% (Achieved: 24.8%)
- Maximum Permissible FAR: 1.50 (Achieved: 1.18)
- Setback Compliances: Front: 15.0m, Rear: 12.0m, Sides: 10.0m
- Access Road Width: 18.0 meters wide public sector road

SPECIAL CONDITIONS:
1. Fire clearance must be separately obtained from State Fire Directorate prior to building occupancy.
2. Rainwater harvesting system with 2,00,000 litre percolation capacity mandated.
3. This approval is valid for 3 years up to 17-07-2027.`,
        structuredFields: {
          institutionName: 'North Valley Inst. of Tech. & Research', // NAME VARIATION!
          applicationRef: 'MDDA/TCP/2024/INST-0914',
          surveyNumber: '142/3B',
          plotNumber: 'Plot #44, Sector 9',
          issuingAuthority: 'Mussoorie Dehradun Development Authority (MDDA)',
          issuanceDate: '2024-07-18',
          validUntilDate: '2027-07-17',
        },
        hash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
        warnings: [
          'Applicant name recorded as "North Valley Inst. of Tech. & Research" (variant of registered name).'
        ],
        pageReferences: ['Order Clauses, Page 1', 'Setback and Coverage Schedule, Page 3'],
        isDemoFile: true,
      }
    ]
  },
  {
    id: 'RL-2026-002',
    institutionName: 'City Technical College of Engineering',
    institutionType: 'Engineering & Technology (Autonomous)',
    referenceNumber: 'AICTE-APP-88421',
    location: 'Pune, Maharashtra',
    academicYear: '2026-2027',
    reviewCategory: 'Annual Extension of Approval (EoA)',
    assignedReviewer: 'Kavita Menon (Senior Officer)',
    submissionDate: '2026-10-22',
    status: 'In Progress',
    openFindingsCount: 1,
    documentsCount: 6,
    checklistIds: ['CHK-01', 'CHK-02', 'CHK-03', 'CHK-04', 'CHK-05', 'CHK-06'],
    isDemoCase: false,
    createdAt: '2026-10-22T10:15:00Z',
    updatedAt: '2026-10-24T09:20:00Z',
    documents: []
  },
  {
    id: 'RL-2026-003',
    institutionName: 'Apex School of Pharmacy & Allied Health',
    institutionType: 'Pharmacy Education',
    referenceNumber: 'PHARMA-REG-2026-11',
    location: 'Bengaluru, Karnataka',
    academicYear: '2026-2027',
    reviewCategory: 'New Program Accreditation & Intake Expansion',
    assignedReviewer: 'Dr. Rajesh Pillai',
    submissionDate: '2026-10-20',
    status: 'Awaiting Evidence',
    openFindingsCount: 2,
    documentsCount: 3,
    checklistIds: ['CHK-01', 'CHK-02', 'CHK-03', 'CHK-04', 'CHK-05'],
    isDemoCase: false,
    createdAt: '2026-10-20T08:00:00Z',
    updatedAt: '2026-10-23T11:45:00Z',
    documents: []
  },
  {
    id: 'RL-2026-004',
    institutionName: 'Westfield Polytechnic Institute',
    institutionType: 'Diploma Engineering',
    referenceNumber: 'POLY-REV-552',
    location: 'Chandigarh, UT',
    academicYear: '2025-2026',
    reviewCategory: 'Infrastructure Safety Re-inspection',
    assignedReviewer: 'Dr. Aris Thorne (Lead Inspector)',
    submissionDate: '2026-10-15',
    status: 'Completed',
    openFindingsCount: 0,
    documentsCount: 5,
    checklistIds: ['CHK-01', 'CHK-02', 'CHK-03', 'CHK-04'],
    finalDisposition: 'Approved - Unconditional 3 Year Extension',
    reviewerSummaryNote: 'All land title, fire NOC, and building stability criteria fully satisfied after submission of supplementary structural affidavit on 21 Oct 2026.',
    dispositionDate: '2026-10-21',
    isDemoCase: false,
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-21T16:30:00Z',
    documents: []
  },
  {
    id: 'RL-2026-005',
    institutionName: 'Vanguard Global Institute of Medical Sciences',
    institutionType: 'Medical College & Research Hospital',
    referenceNumber: 'MED-REV-9014',
    location: 'Jaipur, Rajasthan',
    academicYear: '2026-2027',
    reviewCategory: 'New Medical College Approval',
    assignedReviewer: 'Dr. Aris Thorne (Lead Inspector)',
    submissionDate: '2026-10-25',
    status: 'Needs Review',
    openFindingsCount: 1,
    documentsCount: 8,
    checklistIds: ['CHK-01', 'CHK-02', 'CHK-03', 'CHK-04', 'CHK-05', 'CHK-06'],
    isDemoCase: false,
    createdAt: '2026-10-25T09:00:00Z',
    updatedAt: '2026-10-25T14:10:00Z',
    documents: []
  }
];

export const INITIAL_AUDIT_TRAIL: AuditEvent[] = [
  {
    id: 'AUD-901',
    timestamp: '2026-10-24 14:30:12',
    action: 'Case Created',
    caseId: 'RL-2026-001',
    institutionName: 'North Valley Institute of Technology',
    actor: 'Dr. Aris Thorne (Lead Inspector)',
    category: 'Case',
    details: 'Initial regulatory docket created with application ref SIH-DEMO-2026-014. Review category: New Institute Approval.',
    severity: 'info'
  },
  {
    id: 'AUD-902',
    timestamp: '2026-10-24 14:31:05',
    action: 'Evidence Ingestion',
    caseId: 'RL-2026-001',
    institutionName: 'North Valley Institute of Technology',
    actor: 'System / Ingestion Service',
    category: 'Document',
    details: 'Batch of 4 institutional documents uploaded: NVIT_Form_A_Approval.txt, Land_Deed_Registry_2022.txt, Structural_Safety_Report_2025.txt, Town_Planning_NOC_2024.txt.',
    severity: 'info'
  },
  {
    id: 'AUD-903',
    timestamp: '2026-10-24 14:32:44',
    action: 'Verification Engine Executed',
    caseId: 'RL-2026-001',
    institutionName: 'North Valley Institute of Technology',
    actor: 'ReguLens Deterministic Engine v2.4',
    category: 'Verification',
    details: 'Executed 14 cross-document checks against AICTE/NBC rules. 4 discrepancy flags generated (2 High, 2 Medium).',
    severity: 'warn'
  },
  {
    id: 'AUD-904',
    timestamp: '2026-10-24 14:35:10',
    action: 'Finding Triaged',
    caseId: 'RL-2026-001',
    institutionName: 'North Valley Institute of Technology',
    actor: 'Dr. Aris Thorne (Lead Inspector)',
    category: 'Finding',
    details: 'FND-2026-001 (Survey Number 142/3B vs 142/8A) marked as Open. Reviewer noted potential unverified parcel demarcation.',
    severity: 'warn'
  },
  {
    id: 'AUD-905',
    timestamp: '2026-10-24 14:38:22',
    action: 'Evidence Request Drafted',
    caseId: 'RL-2026-001',
    institutionName: 'North Valley Institute of Technology',
    actor: 'Dr. Aris Thorne (Lead Inspector)',
    category: 'Document',
    details: 'Drafted formal Notice of Defect for missing Fire Safety Certificate (CHK-03) with 14-day compliance window.',
    severity: 'info'
  },
  {
    id: 'AUD-906',
    timestamp: '2026-10-21 16:30:00',
    action: 'Final Case Disposition',
    caseId: 'RL-2026-004',
    institutionName: 'Westfield Polytechnic Institute',
    actor: 'Dr. Aris Thorne (Lead Inspector)',
    category: 'Case',
    details: 'Case marked Completed with outcome: Approved - Unconditional 3 Year Extension. Audited certificate bundle archived.',
    severity: 'success'
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  aiAssistantEnabled: true,
  demoMode: true,
  fuzzyThreshold: 0.82,
  reviewerName: 'Dr. Aris Thorne',
  reviewerDesignation: 'Lead Regulatory Review Officer',
  regulatoryBody: 'National Technical Education & Regulatory Commission (NTERC)',
  notifyOnHighSeverity: true
};
