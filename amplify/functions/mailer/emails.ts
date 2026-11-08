/**
 * The emails the site sends. Written for older readers: large text, one clear button,
 * plain words, and a footer that says why the email came and how to stop it.
 *
 * Every email also tells people how to check it's really from us, since we're teaching
 * them to be wary of emails with links.
 */

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export interface EmailSpec {
  subject: string;
  preheader: string;
  heading: string;
  // Each paragraph is plain text. Lines starting with "• " become a bulleted list.
  paragraphs: string[];
  button?: { label: string; url: string };
  afterButton?: string[];
  reason: string;
  siteUrl: string;
  manageUrl?: string;
  unsubscribeUrl?: string;
  unsubscribeLabel?: string;
  mailingAddress?: string;
  tone?: 'info' | 'warning' | 'urgent';
}

const esc = (s: string) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const TONE_COLOR = { info: '#1d4ed8', warning: '#b45309', urgent: '#b91c1c' } as const;

function paragraphsHtml(paragraphs: string[]) {
  const out: string[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      out.push(`<ul style="margin:0 0 20px 0;padding-left:24px;font-size:19px;line-height:1.6;color:#1e293b">${list.map((l) => `<li style="margin-bottom:8px">${esc(l)}</li>`).join('')}</ul>`);
      list = [];
    }
  };
  for (const p of paragraphs) {
    if (p.startsWith('• ')) { list.push(p.slice(2)); continue; }
    flush();
    out.push(`<p style="margin:0 0 20px 0;font-size:19px;line-height:1.6;color:#1e293b">${esc(p)}</p>`);
  }
  flush();
  return out.join('\n');
}

export function renderEmail(spec: EmailSpec): EmailContent {
  const site = spec.siteUrl.replace(/\/$/, '');
  const host = site.replace(/^https?:\/\//, '');
  const color = TONE_COLOR[spec.tone ?? 'info'];
  const button = spec.button
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 28px 0"><tr><td style="background:${color};border-radius:10px">
<a href="${esc(spec.button.url)}" style="display:inline-block;padding:16px 28px;font-size:20px;font-weight:bold;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif">${esc(spec.button.label)}</a>
</td></tr></table>`
    : '';
  const footerLinks = [
    spec.manageUrl ? `<a href="${esc(spec.manageUrl)}" style="color:#334155">Change which emails you get</a>` : '',
    spec.unsubscribeUrl ? `<a href="${esc(spec.unsubscribeUrl)}" style="color:#334155">${esc(spec.unsubscribeLabel ?? 'Unsubscribe')}</a>` : '',
  ].filter(Boolean).join(' &nbsp;·&nbsp; ');

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(spec.subject)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(spec.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;border:1px solid #e2e8f0">
<tr><td style="padding:20px 28px;border-bottom:4px solid ${color}">
<span style="font-size:22px;font-weight:bold;color:#1e3a8a">&#128737; Senior Cyber Secure</span>
</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 20px 0;font-size:28px;line-height:1.3;color:#0f172a">${esc(spec.heading)}</h1>
${paragraphsHtml(spec.paragraphs)}
${button}
${spec.afterButton ? paragraphsHtml(spec.afterButton) : ''}
<p style="margin:24px 0 0 0;padding:16px;background:#f8fafc;border-radius:10px;font-size:17px;line-height:1.5;color:#334155">
<strong>Is this email really from us?</strong> We will never ask for a password, money, or your bank details by email. If you're unsure, don't tap the button. Type <strong>${esc(host)}</strong> into your web browser instead.
</p>
</td></tr>
<tr><td style="padding:20px 28px;border-top:1px solid #e2e8f0;font-size:16px;line-height:1.5;color:#475569">
<p style="margin:0 0 8px 0">${esc(spec.reason)}</p>
${footerLinks ? `<p style="margin:0 0 8px 0">${footerLinks}</p>` : ''}
<p style="margin:0">Senior Cyber Secure · <a href="${esc(site)}" style="color:#334155">${esc(host)}</a>${spec.mailingAddress ? ` · ${esc(spec.mailingAddress)}` : ''}</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

  const text = [
    spec.heading,
    '',
    ...spec.paragraphs.flatMap((p) => [p, '']),
    ...(spec.button ? [`${spec.button.label}: ${spec.button.url}`, ''] : []),
    ...(spec.afterButton ?? []).flatMap((p) => [p, '']),
    `Is this email really from us? We will never ask for a password, money, or your bank details by email. If you're unsure, don't use the link. Type ${host} into your web browser instead.`,
    '',
    '---',
    spec.reason,
    ...(spec.manageUrl ? [`Change which emails you get: ${spec.manageUrl}`] : []),
    ...(spec.unsubscribeUrl ? [`${spec.unsubscribeLabel ?? 'Unsubscribe'}: ${spec.unsubscribeUrl}`] : []),
    `Senior Cyber Secure · ${host}${spec.mailingAddress ? ` · ${spec.mailingAddress}` : ''}`,
  ].join('\n');

  return { subject: spec.subject, html, text };
}

const TOPIC_LABELS: Record<string, string> = {
  scamAlerts: 'Scam alerts: short warnings about scams going around right now',
  newTraining: 'New training lessons',
  newVideos: 'New training videos',
};

interface Common {
  siteUrl: string;
  manageUrl?: string;
  unsubscribeUrl?: string;
  mailingAddress?: string;
}

export function confirmEmail(o: { confirmUrl: string; topics: Partial<Record<string, boolean>>; siteUrl: string; mailingAddress?: string }): EmailSpec {
  const chosen = Object.keys(TOPIC_LABELS).filter((t) => o.topics[t]).map((t) => `• ${TOPIC_LABELS[t]}`);
  return {
    subject: 'Please confirm your email for Senior Cyber Secure',
    preheader: 'One tap to start getting free scam alerts.',
    heading: 'Please confirm your email',
    paragraphs: [
      'Someone (we hope it was you!) asked to get these free emails from Senior Cyber Secure:',
      ...chosen,
      'To start getting them, tap the button below.',
    ],
    button: { label: 'Yes, send me these emails', url: o.confirmUrl },
    afterButton: ["Didn't ask for this? Just ignore this email. You won't hear from us again."],
    reason: 'You got this email because this address was entered on our sign-up form. This link works for 7 days.',
    siteUrl: o.siteUrl,
    mailingAddress: o.mailingAddress,
  };
}

const SEVERITY_WORD = { info: 'Heads up', warning: 'Warning', urgent: 'Urgent' } as const;

export function alertEmail(o: Common & {
  alert: { title: string; summary: string; details?: string | null; severity: 'info' | 'warning' | 'urgent'; sourceName?: string | null };
  alertUrl: string;
}): EmailSpec {
  const word = SEVERITY_WORD[o.alert.severity] ?? 'Heads up';
  const details = (o.alert.details ?? '').split(/\n+/).map((s) => s.trim()).filter(Boolean)
    .map((line) => (/^[-*•]\s+/.test(line) ? `• ${line.replace(/^[-*•]\s+/, '')}` : line));
  return {
    subject: `${word}: ${o.alert.title}`,
    preheader: o.alert.summary,
    heading: o.alert.title,
    paragraphs: [o.alert.summary, ...details, ...(o.alert.sourceName ? [`Source: ${o.alert.sourceName}`] : [])],
    button: { label: 'Read the full alert', url: o.alertUrl },
    afterButton: ['If you already sent money or shared a password, call your bank right away using the number on the back of your card.'],
    reason: 'You get these emails because you signed up for Scam Alerts from Senior Cyber Secure.',
    unsubscribeLabel: 'Stop scam alert emails',
    tone: o.alert.severity,
    siteUrl: o.siteUrl,
    manageUrl: o.manageUrl,
    unsubscribeUrl: o.unsubscribeUrl,
    mailingAddress: o.mailingAddress,
  };
}

export function announcementEmail(o: Common & { topic: 'newTraining' | 'newVideos'; title: string; summary: string; url: string }): EmailSpec {
  const isVideo = o.topic === 'newVideos';
  return {
    subject: `${isVideo ? 'New video' : 'New lesson'}: ${o.title}`,
    preheader: o.summary,
    heading: o.title,
    paragraphs: o.summary.split(/\n+/).map((s) => s.trim()).filter(Boolean),
    button: { label: isVideo ? 'Watch it now' : 'Take a look', url: o.url },
    reason: `You get these emails because you asked to hear about new ${isVideo ? 'training videos' : 'training lessons'} from Senior Cyber Secure.`,
    unsubscribeLabel: `Stop ${isVideo ? 'new video' : 'new lesson'} emails`,
    siteUrl: o.siteUrl,
    manageUrl: o.manageUrl,
    unsubscribeUrl: o.unsubscribeUrl,
    mailingAddress: o.mailingAddress,
  };
}

export function cheerEmail(o: Common & { fromName: string; relationship?: string; message: string; dashboardUrl: string }): EmailSpec {
  const who = o.relationship ? `${o.fromName} (${o.relationship.toLowerCase()})` : o.fromName;
  return {
    subject: `${o.fromName} sent you a cheer`,
    preheader: o.message,
    heading: `${o.fromName} sent you a cheer!`,
    paragraphs: [`${who} is following your scam-safety training and sent you this note:`, `“${o.message}”`, 'Keep up the great work. You can see your cheers on your dashboard.'],
    button: { label: 'Go to my dashboard', url: o.dashboardUrl },
    reason: 'You get these emails because you let family follow your progress in your Family Circle.',
    unsubscribeLabel: 'Stop cheer emails',
    siteUrl: o.siteUrl,
    manageUrl: o.manageUrl,
    unsubscribeUrl: o.unsubscribeUrl,
    mailingAddress: o.mailingAddress,
  };
}

export function familyProgressEmail(o: Common & {
  learner: string;
  badges: string[];
  certified: boolean;
  certificateUrl: string | null;
  followUrl: string;
}): EmailSpec {
  const subject = o.certified
    ? `${o.learner} earned their Scam Buster certificate!`
    : o.badges.length === 1
      ? `${o.learner} earned the ${o.badges[0]} badge`
      : `${o.learner} earned ${o.badges.length} new badges`;
  const paragraphs: string[] = [];
  if (o.certified) paragraphs.push(`${o.learner} passed the final exam and earned the Senior Cyber Secure certificate. That's a big deal!`);
  if (o.badges.length) {
    paragraphs.push(o.badges.length === 1 ? `${o.learner} just earned a new badge:` : `${o.learner} just earned these badges:`);
    paragraphs.push(...o.badges.map((b) => `• ${b}`));
  }
  paragraphs.push('A quick cheer goes a long way. Tap below to see their progress and send one.');
  return {
    subject,
    preheader: o.certified ? 'They finished the training!' : 'Send them a cheer.',
    heading: o.certified ? `${o.learner} finished the training!` : `Good news about ${o.learner}`,
    paragraphs,
    button: { label: 'See progress and send a cheer', url: o.followUrl },
    afterButton: o.certificateUrl ? [`Anyone can check the certificate here: ${o.certificateUrl}`] : undefined,
    reason: `You get these emails because ${o.learner} lets you follow their progress in their Family Circle.`,
    unsubscribeLabel: 'Stop progress emails',
    siteUrl: o.siteUrl,
    manageUrl: o.manageUrl,
    unsubscribeUrl: o.unsubscribeUrl,
    mailingAddress: o.mailingAddress,
  };
}
