import { formatDate, verifyUrl } from '../member/certificateApi.js';

// Builds a one-page landscape certificate and downloads it. jsPDF is loaded only
// when someone clicks "Download", so it doesn't slow down the rest of the site.
export async function downloadCertificatePdf(cert, moduleTitles) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const center = (text, y) => doc.text(text, W / 2, y, { align: 'center' });

  // Borders
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(6);
  doc.rect(24, 24, W - 48, H - 48);
  doc.setLineWidth(1.5);
  doc.rect(38, 38, W - 76, H - 76);

  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  center('SENIOR CYBER SECURE', 92);

  doc.setTextColor(15, 23, 42);
  doc.setFont('times', 'bold');
  doc.setFontSize(40);
  center('Certificate of Completion', 145);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(71, 85, 105);
  center('This certifies that', 190);

  doc.setFont('times', 'bolditalic');
  doc.setFontSize(36);
  doc.setTextColor(15, 23, 42);
  center(cert.displayName, 240);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(1);
  doc.line(W / 2 - 200, 252, W / 2 + 200, 252);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(15);
  doc.setTextColor(51, 65, 85);
  center('has completed the Senior Cyber Secure scam-safety training,', 285);
  center(`including all ${moduleTitles.length} lessons and the final exam (score: ${cert.finalScore}%).`, 306);

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  const list = moduleTitles.join('  •  ');
  doc.text(doc.splitTextToSize(list, W - 200), W / 2, 340, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  center(`Completed on ${formatDate(cert.completedOn)}`, 410);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  center(`Certificate ID: ${cert.id}`, 520);
  center(`Verify at ${verifyUrl(cert.id)}`, 536);

  doc.save(`Senior-Cyber-Secure-Certificate-${cert.displayName.replace(/[^a-z0-9]+/gi, '-')}.pdf`);
}
