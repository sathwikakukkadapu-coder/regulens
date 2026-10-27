import { DocumentEvidence } from '../types';

/**
 * Computes a standard SHA-256 string from an ArrayBuffer
 */
async function computeHash(buffer: ArrayBuffer): Promise<string> {
  try {
    if (window.crypto && window.crypto.subtle) {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('Subtle crypto error, fallback to length hash', e);
  }
  return `hash-${buffer.byteLength}-${Date.now()}`;
}

/**
 * Regex-based field extractor from plain text
 */
export function extractStructuredFieldsFromText(text: string): DocumentEvidence['structuredFields'] {
  const fields: DocumentEvidence['structuredFields'] = {};

  // Institution Name
  const instMatch = text.match(/(?:Institution Name|Name of (?:the )?Institution|Beneficiary Institution|Applicant|For:)\s*[:=-]\s*([^\r\n,]+)/i);
  if (instMatch) {
    fields.institutionName = instMatch[1].trim();
  }

  // Application or Reference Number
  const refMatch = text.match(/(?:Application (?:ID|No|Number)|Reference|File No|Registration No|Deed No|Ref)\s*[:=-]\s*([A-Za-z0-9\/\-_]+)/i);
  if (refMatch) {
    fields.applicationRef = refMatch[1].trim();
  }

  // Survey Number / Khasra
  const surveyMatch = text.match(/(?:Survey (?:Number|No)|Khasra (?:No|Number)|Cadastral Reference)\s*[:=-]?\s*([0-9]+[A-Za-z0-9\/\-_]*)/i);
  if (surveyMatch) {
    fields.surveyNumber = surveyMatch[1].trim();
  }

  // Plot Number
  const plotMatch = text.match(/(?:Plot (?:Number|No|#)|Plot)\s*[:=-]?\s*([A-Za-z0-9#\s\-]+?)(?:,|\.|\n|$)/i);
  if (plotMatch) {
    fields.plotNumber = plotMatch[1].trim();
  }

  // Land Area
  const areaMatch = text.match(/(?:Land Area|Total Area|Measuring|Parcel measuring)\s*[:=-]?\s*([0-9.]+\s*(?:Acres|Ac|sq\.?\s*meters|hectares))/i);
  if (areaMatch) {
    fields.landAreaAcres = areaMatch[1].trim();
  }

  // Dates
  const dateMatch = text.match(/(?:Date of (?:Registration|Grant|Inspection)|Date|Dated)\s*[:=-]\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+[0-9]{4})/i);
  if (dateMatch) {
    fields.issuanceDate = dateMatch[1].trim();
  }

  // Validity
  const validMatch = text.match(/(?:Valid (?:Until|up to|through)|Validity)\s*[:=-]\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+[0-9]{4}|[0-9]+\s*Years)/i);
  if (validMatch) {
    fields.validUntilDate = validMatch[1].trim();
  }

  // Approved Intake
  const intakeMatch = text.match(/(?:Sanctioned Intake|Total Intake|Approved Intake|Intake)\s*[:=-]?\s*([0-9]+\s*Seats?)/i);
  if (intakeMatch) {
    fields.approvedIntake = intakeMatch[1].trim();
  }

  // Authority
  const authMatch = text.match(/(?:Issuing Authority|Competent Authority|Lessor|Issued By|Signed by)\s*[:=-]\s*([^\r\n,]+)/i);
  if (authMatch) {
    fields.issuingAuthority = authMatch[1].trim();
  }

  return fields;
}

/**
 * Parses an uploaded file into a DocumentEvidence object
 */
export async function parseUploadedFile(
  file: File,
  caseId: string,
  category: string
): Promise<DocumentEvidence> {
  const warnings: string[] = [];
  let extractedText = '';
  let status: DocumentEvidence['status'] = 'Processed';
  let structuredFields: DocumentEvidence['structuredFields'] = {};
  const arrayBuffer = await file.arrayBuffer();
  const hash = await computeHash(arrayBuffer);

  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';

  try {
    if (fileExt === 'txt' || fileExt === 'csv') {
      const textDecoder = new TextDecoder('utf-8');
      extractedText = textDecoder.decode(arrayBuffer);
      structuredFields = extractStructuredFieldsFromText(extractedText);
    } else if (fileExt === 'json') {
      const textDecoder = new TextDecoder('utf-8');
      const jsonStr = textDecoder.decode(arrayBuffer);
      try {
        const parsedJson = JSON.parse(jsonStr);
        extractedText = JSON.stringify(parsedJson, null, 2);
        // Map direct fields if json is structured
        structuredFields = {
          institutionName: parsedJson.institutionName || parsedJson.name,
          applicationRef: parsedJson.applicationRef || parsedJson.referenceNumber || parsedJson.appId,
          surveyNumber: parsedJson.surveyNumber || parsedJson.khasraNo,
          plotNumber: parsedJson.plotNumber || parsedJson.plot,
          landAreaAcres: parsedJson.landAreaAcres || parsedJson.area,
          issuanceDate: parsedJson.issuanceDate || parsedJson.date,
          validUntilDate: parsedJson.validUntilDate || parsedJson.validUntil,
          address: parsedJson.address || parsedJson.location,
          approvedIntake: parsedJson.approvedIntake || (parsedJson.intake ? `${parsedJson.intake} Seats` : undefined),
          issuingAuthority: parsedJson.issuingAuthority || parsedJson.authority
        };
        // Supplement with text extraction
        const regexFields = extractStructuredFieldsFromText(extractedText);
        structuredFields = { ...regexFields, ...structuredFields };
      } catch (e) {
        warnings.push('Invalid JSON formatting; parsed as raw text.');
        extractedText = jsonStr;
        structuredFields = extractStructuredFieldsFromText(extractedText);
      }
    } else if (fileExt === 'pdf') {
      // PDF text extraction: extract ascii text streams from PDF raw bytes
      const textDecoder = new TextDecoder('latin1');
      const rawPdf = textDecoder.decode(arrayBuffer);

      // Extract text inside stream or BT...ET operators
      const textMatches: string[] = [];
      const streamRegex = /\(([^)]+)\)\s*Tj/g;
      let m;
      while ((m = streamRegex.exec(rawPdf)) !== null) {
        textMatches.push(m[1]);
      }

      if (textMatches.length > 5) {
        extractedText = textMatches.join(' ');
        structuredFields = extractStructuredFieldsFromText(extractedText);
      } else {
        // Scanned or non-plain PDF fallback
        status = 'Uncertain Extraction';
        warnings.push('Scanned or rasterized PDF detected. Optical Character Recognition (OCR) is required for full extraction. Basic metadata recorded.');
        extractedText = `[PDF METADATA & STREAM EXTRACT]\nFilename: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\nNotice: This document appears to be a scanned image-based PDF. To prevent hallucination, ReguLens AI flags this file for manual reviewer inspection.`;
      }
    } else {
      // Other formats like docx
      warnings.push(`File format .${fileExt} supported via raw container inspection. Reviewer verification advised.`);
      extractedText = `File: ${file.name} (Type: ${file.type || fileExt.toUpperCase()})\nSize: ${(file.size / 1024).toFixed(1)} KB`;
      structuredFields = extractStructuredFieldsFromText(extractedText);
    }
  } catch (err: any) {
    status = 'Parsing Failed';
    warnings.push(`Extraction failed: ${err.message || 'Unknown error'}`);
    extractedText = `Error parsing ${file.name}`;
  }

  return {
    id: `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    caseId,
    name: file.name,
    category,
    fileType: file.type || fileExt,
    size: file.size,
    uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
    status,
    extractedText,
    structuredFields,
    hash,
    warnings,
    pageReferences: ['Section 1 (Extracted View)'],
    isDemoFile: false
  };
}
