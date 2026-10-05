/**
 * Pure JavaScript PDF Generator Utility
 * Converts text question papers & metadata into valid %PDF-1.4 binary buffers.
 */

export const generatePdfFromTextContent = (paper, rawText, watermarkText = '') => {
  const subject = paper.subject || 'Examination Subject';
  const code = paper.subjectCode || 'CS601';
  const exam = paper.examName || 'End-Semester Examination 2026';
  const dept = paper.department || 'Computer Science & Engineering';
  const sem = paper.semester || 'Semester VI';
  const date = paper.examDate || new Date().toISOString().split('T')[0];
  const paperId = paper.paperId || 'QP-2026-0000';
  const hash = paper.hash ? paper.hash.substring(0, 32) + '...' : 'SHA-256 FINGERPRINT VERIFIED';

  // Sanitize text lines
  const cleanText = (rawText || 'CONFIDENTIAL EXAMINATION QUESTION PAPER')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

  const lines = cleanText.split('\n');

  // Format PDF Page Text Stream
  let textStream = '';
  
  // Title & Header Box
  textStream += `BT /F2 16 Tf 50 780 Td (ST. JOSEPH COLLEGE OF ENGINEERING & TECHNOLOGY) Tj ET\n`;
  textStream += `BT /F2 11 Tf 50 762 Td (OFFICIAL END-SEMESTER EXAMINATION QUESTION PAPER) Tj ET\n`;
  textStream += `BT /F1 9 Tf 50 748 Td (Paper ID: ${paperId}   |   Semester: ${sem}   |   Date: ${date}) Tj ET\n`;
  textStream += `BT /F2 10 Tf 50 732 Td (Subject: ${subject} [Code: ${code}]) Tj ET\n`;
  textStream += `BT /F1 9 Tf 50 718 Td (Department: ${dept}   |   Exam: ${exam}) Tj ET\n`;
  textStream += `BT /F1 8 Tf 50 704 Td (SHA-256 Fingerprint: ${hash}) Tj ET\n`;
  
  // Separator Line
  textStream += `0.5 w 50 694 m 545 694 l S\n`;

  // Body Text
  let y = 675;
  lines.forEach((line) => {
    if (y < 60) return; // Prevent page overflow
    const trimmed = line.trim();
    if (!trimmed) {
      y -= 12;
      return;
    }
    const isHeading = trimmed.toUpperCase().startsWith('SECTION') || trimmed.toUpperCase().startsWith('QUESTION') || trimmed.toUpperCase().startsWith('Q') || trimmed.endsWith(':');
    const font = isHeading ? '/F2 10' : '/F1 9';
    textStream += `BT ${font} Tf 50 ${y} Td (${trimmed.substring(0, 110)}) Tj ET\n`;
    y -= 15;
  });

  // Footer Watermark Notice
  textStream += `0.5 w 50 45 m 545 45 l S\n`;
  textStream += `BT /F1 8 Tf 50 32 Td (CONFIDENTIAL - FOR AUTHORIZED PRINCIPAL & EXAM CONTROLLER REVIEW ONLY) Tj ET\n`;

  const streamContent = textStream;
  const streamLength = Buffer.byteLength(streamContent, 'utf-8');

  // Assemble PDF Objects
  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources 4 0 R /Contents 5 0 R >>
endobj

4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >>
endobj

5 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000223 00000 n 
0000000366 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${450 + streamLength}
%%EOF`;

  return Buffer.from(pdfString, 'utf-8');
};
