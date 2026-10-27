import assert from 'node:assert';
import { runVerificationEngine } from '../src/services/verificationEngine.ts';

console.log('--- RUNNING REGULENS AI VERIFICATION ENGINE TESTS ---');

// Test Case 1: Survey Number Mismatch
{
  const mockCase = {
    id: 'TEST-001',
    institutionName: 'North Valley Institute of Technology',
    referenceNumber: 'SIH-DEMO-2026-014',
    assignedReviewer: 'Dr. Aris Thorne',
    checklistIds: ['CHK-01', 'CHK-02', 'CHK-03']
  };

  const mockDocs = [
    {
      id: 'D1',
      name: 'Land_Deed.txt',
      category: 'Land Ownership Deed / Title',
      status: 'Processed',
      structuredFields: { surveyNumber: '142/3B', plotNumber: '44' },
      hash: 'hash-aaa',
      warnings: []
    },
    {
      id: 'D2',
      name: 'Structural_Safety.txt',
      category: 'Building / Structural Safety Report',
      status: 'Processed',
      structuredFields: { surveyNumber: '142/8A', plotNumber: '44' },
      hash: 'hash-bbb',
      warnings: []
    }
  ];

  const mockChecklist = [
    {
      id: 'CHK-01',
      requirementName: 'Registered Land Title / Lease Deed',
      expectedEvidenceType: 'Land Title',
      ruleSource: 'AICTE Handbook Clause 4.1',
      isRequired: true
    },
    {
      id: 'CHK-02',
      requirementName: 'Structural Safety & Stability Certificate',
      expectedEvidenceType: 'Structural Safety Report',
      ruleSource: 'NBC 2016 Part 6',
      isRequired: true
    },
    {
      id: 'CHK-03',
      requirementName: 'Fire Safety Certificate / NOC',
      expectedEvidenceType: 'Fire Safety Certificate',
      ruleSource: 'Fire Prevention Act',
      isRequired: true
    }
  ];

  const result = runVerificationEngine(mockCase, mockDocs, mockChecklist, 0.85);

  // Check: Exactly 1 Survey Mismatch and 1 Missing Document (Fire NOC)
  const surveyMismatch = result.findings.find(f => f.category === 'Exact Mismatch' && f.comparedField.includes('Survey Number'));
  assert.ok(surveyMismatch, 'Should detect Survey Number Mismatch');
  assert.strictEqual(surveyMismatch.severity, 'High');
  assert.ok(surveyMismatch.extractedValueA.includes('142/3B'));
  assert.ok(surveyMismatch.extractedValueB.includes('142/8A'));
  console.log('✔ Test 1 Passed: Exact Survey Number Mismatch correctly flagged (142/3B vs 142/8A)');

  const missingFire = result.findings.find(f => f.category === 'Missing Document' && f.title.includes('Fire Safety'));
  assert.ok(missingFire, 'Should detect missing Fire Safety certificate');
  assert.strictEqual(missingFire.severity, 'High');
  console.log('✔ Test 2 Passed: Missing Mandatory Certificate correctly identified (CHK-03)');
}

// Test Case 2: Institution Name Variation
{
  const mockCase = {
    id: 'TEST-002',
    institutionName: 'North Valley Institute of Technology',
    assignedReviewer: 'Dr. Aris Thorne',
    checklistIds: []
  };

  const mockDocs = [
    {
      id: 'D1',
      name: 'Town_Planning.txt',
      category: 'Approved Building Plan',
      status: 'Processed',
      structuredFields: { institutionName: 'North Valley Inst. of Tech. & Research' },
      hash: 'hash-ccc',
      warnings: []
    }
  ];

  const result = runVerificationEngine(mockCase, mockDocs, [], 0.85);
  const nameVar = result.findings.find(f => f.category === 'Name Variation');
  assert.ok(nameVar, 'Should detect fuzzy institution name variation');
  assert.strictEqual(nameVar.severity, 'Medium');
  assert.ok(nameVar.reason.includes('Similarity'));
  console.log('✔ Test 3 Passed: Fuzzy Institution Name Variation identified with similarity score');
}

// Test Case 3: Chronological Date Anomaly
{
  const mockCase = {
    id: 'TEST-003',
    institutionName: 'Apex Institute',
    assignedReviewer: 'Dr. Aris Thorne',
    checklistIds: []
  };

  const mockDocs = [
    {
      id: 'D1',
      name: 'Audit_Report.txt',
      category: 'Structural Report',
      status: 'Processed',
      structuredFields: {},
      extractedText: 'Site Inspection Date: 2025-11-10\nFoundation Approval Date: 2025-12-04\nBuilding verified.',
      hash: 'hash-ddd',
      warnings: []
    }
  ];

  const result = runVerificationEngine(mockCase, mockDocs, [], 0.85);
  const dateAnomaly = result.findings.find(f => f.category === 'Date Inconsistency');
  assert.ok(dateAnomaly, 'Should detect inspection date occurring before foundation approval date');
  console.log('✔ Test 4 Passed: Chronological Date Inconsistency correctly flagged (2025-11-10 vs 2025-12-04)');
}

// Test Case 4: Duplicate Submission Detection
{
  const mockCase = {
    id: 'TEST-004',
    institutionName: 'Apex Institute',
    assignedReviewer: 'Dr. Aris Thorne',
    checklistIds: []
  };

  const mockDocs = [
    {
      id: 'D1',
      name: 'Deed_Copy_1.txt',
      category: 'Land Title',
      status: 'Processed',
      structuredFields: {},
      hash: 'identical-sha-256-hash-value',
      warnings: []
    },
    {
      id: 'D2',
      name: 'Deed_Copy_2.txt',
      category: 'Land Title',
      status: 'Processed',
      structuredFields: {},
      hash: 'identical-sha-256-hash-value',
      warnings: []
    }
  ];

  const result = runVerificationEngine(mockCase, mockDocs, [], 0.85);
  const dup = result.findings.find(f => f.category === 'Duplicate Document');
  assert.ok(dup, 'Should detect duplicate document hash');
  console.log('✔ Test 5 Passed: Duplicate File Hash correctly identified');
}

console.log('--- ALL 5 REGULENS AI VERIFICATION ENGINE TESTS PASSED! ---');
