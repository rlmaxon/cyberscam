// Printable PDFs for each lesson: a fold-over wallet card (with a large-print copy for by
// the phone) and a full-page "What To Do" checklist. Built in the browser with jsPDF, which
// is loaded only when someone clicks Download.
//
// Content comes from public/training-data/modules.json: card.redFlags, card.rule,
// actions, sayThis, and lesson.keyPoint.

const SITE = 'seniorcybersecurityedu.com';
const HELP = [
  'Call your bank right away, using the number on the back of your card.',
  'Report it to the FTC: reportfraud.ftc.gov or 1-877-382-4357.',
  'Report it to the FBI: ic3.gov.',
  'Free help for people 60 and older: DOJ Elder Fraud Hotline, 1-833-372-8311.',
  'Free, friendly support: AARP Fraud Watch Helpline, 877-908-3360.',
];

// jsPDF's built-in fonts can't draw curly quotes and dashes reliably.
const clean = (s) =>
  String(s ?? '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/ /g, ' ');

const unquote = (s) => clean(s).replace(/^"(.*)"$/, '$1');

// sayThis lines come in a few styles: already quoted, "(To family) "...", or plain.
// Only plain ones get quotation marks added.
const sayLine = (s) => (clean(s).includes('"') ? clean(s) : `"${clean(s)}"`);

// Short lesson names for the card ("Phone & Voice Scams" -> "Phone & Voice Scams";
// "Start Here: Why Scams Work" -> "Why Scams Work")
const shortTitle = (m) => clean(m.title.includes(':') ? m.title.split(':').pop().trim() : m.title);

async function newDoc() {
  const { jsPDF } = await import('jspdf');
  return new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
}

const BLUE = [30, 64, 175];
const RED = [185, 28, 28];
const INK = [15, 23, 42];
const GREY = [71, 85, 105];

function text(doc, str, x, y, { size = 12, bold = false, color = INK, width, lineGap = 1.25, align } = {}) {
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = width ? doc.splitTextToSize(clean(str), width) : [clean(str)];
  lines.forEach((line, i) => doc.text(line, x, y + i * size * lineGap, align ? { align } : undefined));
  return y + lines.length * size * lineGap;
}

// ---------------- Wallet card ----------------

// One fold-over card: two 3.5" x 2" panels side by side. Cut on the dashed line, fold on
// the solid line. Returns the y below it.
function drawWalletCard(doc, m, x, y) {
  const PW = 252; // 3.5 in
  const PH = 144; // 2 in
  const pad = 12;

  // Cut line (dashed) and fold line (solid, grey)
  doc.setLineDashPattern([4, 3], 0);
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.8);
  doc.rect(x, y, PW * 2, PH);
  doc.setLineDashPattern([], 0);
  doc.setDrawColor(203, 213, 225);
  doc.line(x + PW, y, x + PW, y + PH);

  // Front: red flags
  doc.setFillColor(...RED);
  doc.rect(x + 0.5, y + 0.5, PW - 1, 22, 'F');
  text(doc, `RED FLAGS: ${shortTitle(m).toUpperCase()}`, x + pad, y + 15, { size: 9.5, bold: true, color: [255, 255, 255], width: PW - pad * 2 });
  let fy = y + 39;
  for (const flag of m.card?.redFlags ?? []) {
    doc.setFillColor(...RED);
    doc.circle(x + pad + 2, fy - 3.5, 2, 'F');
    fy = text(doc, flag, x + pad + 10, fy, { size: 10, bold: true, width: PW - pad * 2 - 10, lineGap: 1.15 }) + 5;
  }

  // Back: the rule, a phrase to say, and where to get help
  const bx = x + PW;
  doc.setFillColor(...BLUE);
  doc.rect(bx + 0.5, y + 0.5, PW - 1, 22, 'F');
  text(doc, 'WHAT TO DO', bx + pad, y + 15, { size: 9.5, bold: true, color: [255, 255, 255] });
  let by = text(doc, m.card?.rule ?? '', bx + pad, y + 39, { size: 11, bold: true, width: PW - pad * 2, lineGap: 1.15 }) + 5;
  const say = m.card?.say;
  if (say) {
    by = text(doc, `Say: "${unquote(say)}"`, bx + pad, by, { size: 9, color: GREY, width: PW - pad * 2, lineGap: 1.2 }) + 4;
  }
  text(doc, 'Help: AARP Fraud Watch 877-908-3360', bx + pad, y + PH - 22, { size: 9, bold: true });
  text(doc, SITE, bx + pad, y + PH - 10, { size: 7.5, color: GREY });

  return y + PH;
}

// Large print version of the same card, for by the phone or on the fridge.
function drawLargeCard(doc, m, x, y, w) {
  const pad = 20;
  const top = y;
  doc.setFillColor(...RED);
  doc.rect(x, y, w, 36, 'F');
  text(doc, `Red flags: ${shortTitle(m)}`, x + pad, y + 25, { size: 18, bold: true, color: [255, 255, 255] });
  y += 62;
  for (const flag of m.card?.redFlags ?? []) {
    doc.setFillColor(...RED);
    doc.circle(x + pad + 4, y - 6, 3.5, 'F');
    y = text(doc, flag, x + pad + 16, y, { size: 16, width: w - pad * 2 - 16 }) + 6;
  }
  y += 6;
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(2);
  doc.line(x + pad, y - 12, x + w - pad, y - 12);
  y = text(doc, m.card?.rule ?? '', x + pad, y + 8, { size: 20, bold: true, color: BLUE, width: w - pad * 2 }) + 6;
  const say = m.card?.say;
  if (say) y = text(doc, `Say: "${unquote(say)}"`, x + pad, y + 4, { size: 15, color: GREY, width: w - pad * 2 }) + 8;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(1);
  doc.rect(x, top, w, y - top + 4);
  return y + 4;
}

function walletPage(doc, m) {
  const W = doc.internal.pageSize.getWidth();
  const left = 54;
  let y = text(doc, 'Senior Cyber Secure', left, 60, { size: 12, bold: true, color: BLUE });
  y = text(doc, `Wallet card: ${shortTitle(m)}`, left, y + 6, { size: 22, bold: true });
  y = text(doc, 'Cut along the dashed line, fold on the middle line, and keep it in your wallet.', left, y + 6, { size: 12, color: GREY, width: W - left * 2 });
  y = drawWalletCard(doc, m, left, y + 16);
  y = text(doc, 'Large-print copy: keep this one by the phone or on the fridge.', left, y + 36, { size: 12, color: GREY, width: W - left * 2 });
  drawLargeCard(doc, m, left, y + 10, W - left * 2);
  footer(doc);
}

// ---------------- Checklist ----------------

function checklistPage(doc, m) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const left = 54;
  const width = W - left * 2;
  const room = (y, need) => {
    if (y + need > H - 60) {
      footer(doc);
      doc.addPage();
      return 60;
    }
    return y;
  };

  let y = text(doc, 'Senior Cyber Secure', left, 60, { size: 12, bold: true, color: BLUE });
  y = text(doc, `What To Do: ${shortTitle(m)}`, left, y + 8, { size: 24, bold: true, width });

  // Key point box
  if (m.lesson?.keyPoint) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    const lines = doc.splitTextToSize(clean(m.lesson.keyPoint), width - 32);
    const h = lines.length * 15 * 1.3 + 24;
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(1.5);
    doc.roundedRect(left, y + 8, width, h, 8, 8, 'FD');
    text(doc, m.lesson.keyPoint, left + 16, y + 30, { size: 15, bold: true, color: BLUE, width: width - 32, lineGap: 1.3 });
    y += h + 24;
  }

  y = room(y, 60);
  y = text(doc, 'If this happens to you:', left, y + 8, { size: 17, bold: true }) + 6;
  for (const action of m.actions ?? []) {
    y = room(y, 40);
    doc.setDrawColor(...INK);
    doc.setLineWidth(1.2);
    doc.rect(left, y - 12, 14, 14);
    y = text(doc, action, left + 26, y, { size: 14, width: width - 26, lineGap: 1.3 }) + 8;
  }

  if (m.sayThis?.length) {
    y = room(y + 6, 80);
    y = text(doc, 'What to say:', left, y + 10, { size: 17, bold: true }) + 4;
    for (const line of m.sayThis) {
      y = room(y, 36);
      y = text(doc, sayLine(line), left + 12, y, { size: 14, color: [55, 48, 163], width: width - 12, lineGap: 1.3 }) + 6;
    }
  }

  y = room(y + 6, 140);
  y = text(doc, 'Already sent money or shared information?', left, y + 12, { size: 17, bold: true, color: RED }) + 4;
  HELP.forEach((line, i) => {
    y = room(y, 36);
    y = text(doc, `${i + 1}. ${line}`, left + 4, y, { size: 13, width: width - 4, lineGap: 1.3 }) + 4;
  });
  text(doc, "It's not your fault. Scammers are professionals, and acting quickly helps.", left, y + 10, { size: 12, color: GREY, width });
  footer(doc);
}

function footer(doc) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  text(doc, `Free scam-safety training at ${SITE}. Free to print and share.`, W / 2, H - 30, { size: 10, color: GREY, align: 'center' });
}

// ---------------- Downloads ----------------

export async function downloadWalletCard(m) {
  const doc = await newDoc();
  walletPage(doc, m);
  doc.save(`scam-wallet-card-${m.key}.pdf`);
}

export async function downloadChecklist(m) {
  const doc = await newDoc();
  checklistPage(doc, m);
  doc.save(`scam-checklist-${m.key}.pdf`);
}

// Every wallet card: three to a page, to save paper.
export async function downloadAllWalletCards(modules) {
  const doc = await newDoc();
  const left = 54;
  modules.forEach((m, i) => {
    if (i > 0 && i % 3 === 0) {
      footer(doc);
      doc.addPage();
    }
    if (i % 3 === 0) {
      text(doc, 'Senior Cyber Secure wallet cards', left, 54, { size: 18, bold: true });
      text(doc, 'Cut along the dashed lines and fold each card in half.', left, 74, { size: 12, color: GREY });
    }
    const y = 100 + (i % 3) * 200;
    text(doc, clean(m.title), left, y, { size: 12, bold: true, color: BLUE });
    drawWalletCard(doc, m, left, y + 10);
  });
  footer(doc);
  doc.save('scam-wallet-cards-all.pdf');
}

export async function downloadAllChecklists(modules) {
  const doc = await newDoc();
  modules.forEach((m, i) => {
    if (i > 0) doc.addPage();
    checklistPage(doc, m);
  });
  doc.save('scam-checklists-all.pdf');
}
