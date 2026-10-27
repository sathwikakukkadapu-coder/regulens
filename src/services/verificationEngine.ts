import type { DocumentEvidence, Finding, ChecklistItem, ReviewCase } from '../types/index.ts';

/**
 * String similarity using Dice's Bigram coefficient
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const s2 = str2.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0;

  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bg = str.substring(i, i + 2);
      bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
    }
    return bigrams;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);
  let intersection = 0;

  b1.forEach((count, key) => {
    if (b2.has(key)) {
      intersection += Math.min(count, b2.get(key)!);
    }
  });

  return (2.0 * intersection) / ((s1.length - 1) + (s2.length - 1));
}

/**
 * Standardizes common Indian revenue and institutional terms
 */
function normalizeSurveyNumber(val?: string): string {
  if (!val) return '';
  return val
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/SURVEY(NO|NUM|NUMBER)?:?/i, '')
    .replace(/KHASRA(NO)?:?/i, '')
    .trim();
}

export interface VerificationResult {
  findings: Finding[];
  checksRunCount: number;
  missingDocsCount: number;
  mismatchesCount: number;
  warningsCount: number;
}

export function runVerificationEngine(
  reviewCase: ReviewCase,
  documents: DocumentEvidence[],
  checklist: ChecklistItem[],
  fuzzyThreshold: number = 0.85
): VerificationResult {
  const findings: Finding[] = [];
  let checksRunCount = 0;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  // -------------------------------------------------------------
  // Check 1: Missing Required Document Checks (Against selected checklist)
  // -------------------------------------------------------------
  const activeChecklistItems = checklist.filter(
    item => reviewCase.checklistIds.includes(item.id) && item.isRequired
  );

  activeChecklistItems.forEach(checkItem => {
    checksRunCount++;
    const matchedDoc = documents.find(doc => {
      const catLower = doc.category.toLowerCase();
      const reqLower = checkItem.requirementName.toLowerCase();
      const expLower = checkItem.expectedEvidenceType.toLowerCase();

      // Check category match or title keyword match
      if (catLower.includes('fire') && (reqLower.includes('fire') || expLower.includes('fire'))) return true;
      if (catLower.includes('land') && (reqLower.includes('land') || expLower.includes('land'))) return true;
      if (catLower.includes('structural') && (reqLower.includes('structural') || expLower.includes('structural'))) return true;
      if (catLower.includes('building') && (reqLower.includes('building') || expLower.includes('building'))) return true;
      if (catLower.includes('financial') && (reqLower.includes('financial') || expLower.includes('financial'))) return true;
      if (catLower.includes('affiliation') && (reqLower.includes('affiliation') || expLower.includes('affiliation'))) return true;
      if (catLower.includes('application') && (reqLower.includes('application') || expLower.includes('application'))) return true;

      return catLower.includes(reqLower) || reqLower.includes(catLower);
    });

    if (!matchedDoc) {
      findings.push({
        id: `FND-${Date.now()}-${findings.length + 1}`,
        caseId: reviewCase.id,
        title: `Mandatory Document Missing: ${checkItem.requirementName}`,
        severity: 'High',
        category: 'Missing Document',
        sourceDocuments: [`Required Checklist: ${checkItem.requirementName}`],
        comparedField: `Document Category (${checkItem.id})`,
        extractedValueA: `Mandatory: ${checkItem.expectedEvidenceType}`,
        extractedValueB: 'Status: Not present in uploaded case dossier',
        reason: `The regulatory checklist item "${checkItem.requirementName}" is mandatory under ${checkItem.ruleSource}, but no matching evidentiary document was uploaded.`,
        recommendedAction: `Issue a formal Request for Evidence (RFE) to the applicant institution. Review cannot be finalized without this statutory record.`,
        status: 'Open',
        assignedReviewer: reviewCase.assignedReviewer,
        dateDetected: now,
        ruleReference: checkItem.ruleSource
      });
    }
  });

  // -------------------------------------------------------------
  // Check 2: Duplicate Document Checks (File Hash / Identical content)
  // -------------------------------------------------------------
  for (let i = 0; i < documents.length; i++) {
    for (let j = i + 1; j < documents.length; j++) {
      checksRunCount++;
      const docA = documents[i];
      const docB = documents[j];

      if (docA.hash && docB.hash && docA.hash === docB.hash) {
        findings.push({
          id: `FND-${Date.now()}-${findings.length + 1}`,
          caseId: reviewCase.id,
          title: `Duplicate Document Detected: ${docA.name} and ${docB.name}`,
          severity: 'Low',
          category: 'Duplicate Document',
          sourceDocuments: [docA.name, docB.name],
          comparedField: 'SHA-256 Hash Digest',
          extractedValueA: `${docA.name} (${docA.hash.slice(0, 12)}...)`,
          extractedValueB: `${docB.name} (${docB.hash.slice(0, 12)}...)`,
          reason: `Both uploaded files share identical cryptographic fingerprints, indicating duplicate submissions of the same underlying file.`,
          recommendedAction: `Verify whether one of the duplicate entries was submitted in lieu of another distinct document and remove redundant copy.`,
          status: 'Open',
          assignedReviewer: reviewCase.assignedReviewer,
          dateDetected: now,
          ruleReference: 'Dossier Hygiene & Data Integrity Guidelines'
        });
      }
    }
  }

  // -------------------------------------------------------------
  // Check 3: Cross-Document Exact Mismatch on Survey Numbers
  // -------------------------------------------------------------
  const docsWithSurvey = documents.filter(d => d.structuredFields?.surveyNumber);
  if (docsWithSurvey.length >= 2) {
    for (let i = 0; i < docsWithSurvey.length; i++) {
      for (let j = i + 1; j < docsWithSurvey.length; j++) {
        checksRunCount++;
        const sA = normalizeSurveyNumber(docsWithSurvey[i].structuredFields.surveyNumber);
        const sB = normalizeSurveyNumber(docsWithSurvey[j].structuredFields.surveyNumber);

        if (sA && sB && sA !== sB) {
          findings.push({
            id: `FND-${Date.now()}-${findings.length + 1}`,
            caseId: reviewCase.id,
            title: `Survey Number Mismatch: ${docsWithSurvey[i].name} vs ${docsWithSurvey[j].name}`,
            severity: 'High',
            category: 'Exact Mismatch',
            sourceDocuments: [docsWithSurvey[i].name, docsWithSurvey[j].name],
            comparedField: 'Survey Number / Cadastral Identifier',
            extractedValueA: `${docsWithSurvey[i].structuredFields.surveyNumber} (${docsWithSurvey[i].name})`,
            extractedValueB: `${docsWithSurvey[j].structuredFields.surveyNumber} (${docsWithSurvey[j].name})`,
            reason: `The survey numbers differ between ${docsWithSurvey[i].category} and ${docsWithSurvey[j].category}. This discrepancy suggests potential inspection on an incorrect land parcel or subdivision dispute.`,
            recommendedAction: `Ask reviewer to compare original revenue records, request municipal demarcation certificate, and confirm correct land parcel identifier before proceeding with approval.`,
            status: 'Open',
            assignedReviewer: reviewCase.assignedReviewer,
            dateDetected: now,
            ruleReference: 'AICTE Approval Handbook 2024-27, Clause 4.1.2 (Land Contiguity & Title Verification)'
          });
        }
      }
    }
  }

  // -------------------------------------------------------------
  // Check 4: Cross-Document Exact Mismatch on Plot Numbers
  // -------------------------------------------------------------
  const docsWithPlot = documents.filter(d => d.structuredFields?.plotNumber);
  if (docsWithPlot.length >= 2) {
    for (let i = 0; i < docsWithPlot.length; i++) {
      for (let j = i + 1; j < docsWithPlot.length; j++) {
        checksRunCount++;
        const pA = docsWithPlot[i].structuredFields.plotNumber!.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const pB = docsWithPlot[j].structuredFields.plotNumber!.toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (pA && pB && pA !== pB) {
          findings.push({
            id: `FND-${Date.now()}-${findings.length + 1}`,
            caseId: reviewCase.id,
            title: `Plot Number Discrepancy: ${docsWithPlot[i].name} vs ${docsWithPlot[j].name}`,
            severity: 'Medium',
            category: 'Exact Mismatch',
            sourceDocuments: [docsWithPlot[i].name, docsWithPlot[j].name],
            comparedField: 'Plot Number',
            extractedValueA: `${docsWithPlot[i].structuredFields.plotNumber} (${docsWithPlot[i].name})`,
            extractedValueB: `${docsWithPlot[j].structuredFields.plotNumber} (${docsWithPlot[j].name})`,
            reason: `Plot identifier differs between submitted exhibits (${docsWithPlot[i].structuredFields.plotNumber} vs ${docsWithPlot[j].structuredFields.plotNumber}).`,
            recommendedAction: `Inspect municipal site layout plan to check if multiple contiguous plots comprise the proposed campus.`,
            status: 'Open',
            assignedReviewer: reviewCase.assignedReviewer,
            dateDetected: now,
            ruleReference: 'Municipal Town Planning Regulations, Clause 8.2'
          });
        }
      }
    }
  }

  // -------------------------------------------------------------
  // Check 5: Institution Name Variation (Fuzzy Similarity)
  // -------------------------------------------------------------
  const baseName = reviewCase.institutionName;
  documents.forEach(doc => {
    if (doc.structuredFields?.institutionName) {
      checksRunCount++;
      const docName = doc.structuredFields.institutionName;
      const sim = calculateSimilarity(baseName, docName);

      // If not identical, check if it's a variation (e.g. 0.50 to 0.99) or severe mismatch (< 0.50)
      if (baseName.toLowerCase().trim() !== docName.toLowerCase().trim()) {
        if (sim >= 0.50 && sim < 0.99) {
          findings.push({
            id: `FND-${Date.now()}-${findings.length + 1}`,
            caseId: reviewCase.id,
            title: `Institution Name Variation in ${doc.name}`,
            severity: 'Medium',
            category: 'Name Variation',
            sourceDocuments: ['Application Case Details', doc.name],
            comparedField: 'Institution Name',
            extractedValueA: `${baseName} (Primary Case)`,
            extractedValueB: `${docName} (${doc.name})`,
            reason: `Name variation detected (Similarity: ${Math.round(sim * 100)}%). Document contains abbreviated or extended name phrasing. This is a possible variant, not automatic proof of an error.`,
            recommendedAction: `Confirm whether the parent trust registered a subsidiary name amendment or if an explanatory affidavit is on file.`,
            status: 'Open',
            assignedReviewer: reviewCase.assignedReviewer,
            dateDetected: now,
            ruleReference: 'AICTE Approval Handbook Clause 2.4 (Legal Name Consistency)'
          });
        } else if (sim < 0.50) {
          findings.push({
            id: `FND-${Date.now()}-${findings.length + 1}`,
            caseId: reviewCase.id,
            title: `Substantial Name Divergence in ${doc.name}`,
            severity: 'High',
            category: 'Exact Mismatch',
            sourceDocuments: ['Application Case Details', doc.name],
            comparedField: 'Institution Name',
            extractedValueA: `${baseName} (Primary Case)`,
            extractedValueB: `${docName} (${doc.name})`,
            reason: `Severe name divergence detected (Similarity: ${Math.round(sim * 100)}%). The name in this document appears to belong to an entirely different entity.`,
            recommendedAction: `Verify if a document from an unrelated institution was erroneously uploaded to this case file.`,
            status: 'Open',
            assignedReviewer: reviewCase.assignedReviewer,
            dateDetected: now,
            ruleReference: 'Statutory Identity & Applicant Verification Guidelines'
          });
        }
      }
    }
  });

  // -------------------------------------------------------------
  // Check 6: Date Chronology & Consistency Checks
  // -------------------------------------------------------------
  documents.forEach(doc => {
    // Check if inspection date is before foundation approval date
    if (doc.extractedText) {
      checksRunCount++;
      const text = doc.extractedText;
      const inspectMatch = text.match(/Inspection Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
      const foundationMatch = text.match(/Foundation Approval Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);

      if (inspectMatch && foundationMatch) {
        const inspectDate = new Date(inspectMatch[1]);
        const foundationDate = new Date(foundationMatch[1]);

        if (inspectDate < foundationDate) {
          findings.push({
            id: `FND-${Date.now()}-${findings.length + 1}`,
            caseId: reviewCase.id,
            title: `Chronological Inconsistency in ${doc.name}`,
            severity: 'Medium',
            category: 'Date Inconsistency',
            sourceDocuments: [doc.name],
            comparedField: 'Inspection Date vs Foundation Approval Date',
            extractedValueA: `Inspection: ${inspectMatch[1]}`,
            extractedValueB: `Foundation: ${foundationMatch[1]}`,
            reason: `The structural safety inspection date (${inspectMatch[1]}) is recorded as occurring prior to the foundation approval date (${foundationMatch[1]}). This sequence is chronologically contradictory.`,
            recommendedAction: `Request the certified structural engineer to provide the chronological site log and a clarifying affidavit.`,
            status: 'Open',
            assignedReviewer: reviewCase.assignedReviewer,
            dateDetected: now,
            ruleReference: 'National Building Code 2016 Part 6 Quality Assurance'
          });
        }
      }

      // Check if document validity is expired
      if (doc.structuredFields?.validUntilDate) {
        const validUntil = new Date(doc.structuredFields.validUntilDate);
        if (validUntil < new Date()) {
          findings.push({
            id: `FND-${Date.now()}-${findings.length + 1}`,
            caseId: reviewCase.id,
            title: `Expired Document Validity: ${doc.name}`,
            severity: 'High',
            category: 'Date Inconsistency',
            sourceDocuments: [doc.name],
            comparedField: 'Validity Expiration Date',
            extractedValueA: `Expiry Date: ${doc.structuredFields.validUntilDate}`,
            extractedValueB: `Current System Date: ${now.substring(0, 10)}`,
            reason: `This clearance document expired on ${doc.structuredFields.validUntilDate} and is no longer legally active for the 2026-2027 academic cycle.`,
            recommendedAction: `Request institution to present current renewal endorsement from the issuing authority.`,
            status: 'Open',
            assignedReviewer: reviewCase.assignedReviewer,
            dateDetected: now,
            ruleReference: 'Regulatory Clearance Currency Regulations'
          });
        }
      }
    }
  });

  // -------------------------------------------------------------
  // Check 7: Incomplete Data & Extraction Warnings
  // -------------------------------------------------------------
  documents.forEach(doc => {
    checksRunCount++;
    if (doc.status === 'Parsing Failed' || doc.warnings.length > 0) {
      doc.warnings.forEach(w => {
        findings.push({
          id: `FND-${Date.now()}-${findings.length + 1}`,
          caseId: reviewCase.id,
          title: `Extraction Advisory: ${doc.name}`,
          severity: 'Low',
          category: 'Extraction Warning',
          sourceDocuments: [doc.name],
          comparedField: 'Document Parse & OCR Quality',
          extractedValueA: `Document: ${doc.name}`,
          extractedValueB: `Advisory: ${w}`,
          reason: `Automated extraction noted a field parsing alert: ${w}`,
          recommendedAction: `Reviewer should manually inspect the original document text or uploaded scan to verify values.`,
          status: 'Open',
          assignedReviewer: reviewCase.assignedReviewer,
          dateDetected: now,
          ruleReference: 'Verification Engine Transparency Notice'
        });
      });
    }

    // Incomplete critical fields
    if (doc.category.includes('Land') && !doc.structuredFields?.landAreaAcres && !doc.structuredFields?.surveyNumber) {
      findings.push({
        id: `FND-${Date.now()}-${findings.length + 1}`,
        caseId: reviewCase.id,
        title: `Incomplete Land Record Fields in ${doc.name}`,
        severity: 'Medium',
        category: 'Incomplete Data',
        sourceDocuments: [doc.name],
        comparedField: 'Land Area & Survey Identifier',
        extractedValueA: 'Required: Survey Number & Acreage',
        extractedValueB: 'Status: Could not be automatically detected in text',
        reason: `Key property parameters could not be parsed from this land record.`,
        recommendedAction: `Open Document Viewer to locate the land schedule section manually.`,
        status: 'Open',
        assignedReviewer: reviewCase.assignedReviewer,
        dateDetected: now,
        ruleReference: 'AICTE Land Verification Protocol'
      });
    }
  });

  return {
    findings,
    checksRunCount,
    missingDocsCount: findings.filter(f => f.category === 'Missing Document').length,
    mismatchesCount: findings.filter(f => f.category === 'Exact Mismatch').length,
    warningsCount: findings.filter(f => f.category === 'Extraction Warning').length
  };
}
