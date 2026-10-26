import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, Printer, Share2, Mail, Copy, ArrowLeft, ShieldCheck } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { hasDataBackend } from '../../amplifyConfig.js';
import { useMember } from '../../member/MemberContext.jsx';
import { useProgress } from '../../member/useProgressState.js';
import { createCertificate, formatDate, getMyCertificate, verifyUrl } from '../../member/certificateApi.js';
import { useTrainingData } from '../../training/content.js';
import { downloadCertificatePdf } from '../../training/certificatePdf.js';
import { BigButton, ErrorBlock, LoadingBlock } from '../../components/learn/LearnParts.jsx';
import { TextField, Notice } from '../../components/account/FormParts.jsx';

export default function CertificatePage() {
  const { profile } = useMember();
  const { progress, update, saving } = useProgress();
  const { modules, loading, error } = useTrainingData();
  const [cert, setCert] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState('');

  const passed = !!progress.finalExam?.passed;
  const certId = progress.certificateId;

  useEffect(() => { if (profile?.displayName && !name) setName(profile.displayName); }, [profile]);

  useEffect(() => {
    if (!certId || cert?.id === certId) return;
    setStatus('loading');
    getMyCertificate(certId)
      .then((c) => { setCert(c); setStatus(c ? 'ready' : 'error'); })
      .catch(() => setStatus('error'));
  }, [certId]);

  if (loading || saving === 'loading' || status === 'loading') return <LoadingBlock text="Loading your certificate…" />;
  if (error) return <ErrorBlock />;

  const back = (
    <Link to={PATHS.learn} className="inline-flex items-center gap-2 text-lg text-slate-700 hover:text-blue-700 mb-4 font-medium no-print">
      <ArrowLeft className="w-5 h-5" /> All lessons
    </Link>
  );

  if (!passed) {
    return (
      <Page>
        {back}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <Award className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-3">Your certificate is waiting for you</h1>
          <p className="text-lg text-slate-600 mb-6">Finish all the lessons and pass the final exam to earn it.</p>
          <BigButton as={Link} to={PATHS.learn} tone="orange">Go to My Lessons</BigButton>
        </div>
      </Page>
    );
  }

  if (!hasDataBackend) {
    return <Page>{back}<Notice tone="info">Certificates are being set up and will be available here soon. Your exam result is saved.</Notice></Page>;
  }

  if (!cert) {
    const create = async (e) => {
      e.preventDefault();
      if (!name.trim()) return setNotice('Please enter the name to print on your certificate.');
      setCreating(true);
      setNotice('');
      try {
        const c = await createCertificate({ displayName: name.trim(), finalScore: progress.finalExam.bestScore });
        setCert(c);
        setStatus('ready');
        await update((p) => ({ ...p, certificateId: c.id }));
      } catch {
        setNotice("We couldn't create your certificate. Please check your internet connection and try again.");
      } finally {
        setCreating(false);
      }
    };
    return (
      <Page>
        {back}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <div className="text-center mb-6">
            <Award className="w-14 h-14 text-green-600 mx-auto mb-3" />
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Congratulations!</h1>
            <p className="text-xl text-slate-700">You passed the final exam with {progress.finalExam.bestScore}%. Let's make your certificate.</p>
          </div>
          {status === 'error' && <div className="mb-4"><Notice>We couldn't load your earlier certificate, so you can create it again below.</Notice></div>}
          <form onSubmit={create} className="space-y-6" noValidate>
            <TextField
              label="Name to print on your certificate"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              autoComplete="name"
              hint="Use your full name if you'd like. This is shown to anyone you share the certificate with."
            />
            {notice && <Notice>{notice}</Notice>}
            <BigButton type="submit" tone="green" disabled={creating}>
              <Award className="w-6 h-6" /> {creating ? 'Creating your certificate…' : 'Create My Certificate'}
            </BigButton>
          </form>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {back}
      <CertificateView cert={cert} modules={modules} />
      <ShareTools cert={cert} modules={modules} />
    </Page>
  );
}

function Page({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">{children}</div>
    </div>
  );
}

export function CertificateView({ cert, modules }) {
  return (
    <div className="print-card bg-white rounded-2xl shadow-xl border-[6px] border-blue-800 p-2 mb-6">
      <div className="border-2 border-blue-800 rounded-xl px-5 py-8 sm:px-12 sm:py-12 text-center">
        <p className="text-base sm:text-lg font-bold tracking-widest text-blue-800 mb-4">SENIOR CYBER SECURE</p>
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Georgia, serif' }}>Certificate of Completion</h1>
        <p className="text-lg text-slate-600 mb-2">This certifies that</p>
        <p className="text-3xl sm:text-5xl italic font-bold text-slate-900 border-b-2 border-slate-300 inline-block px-6 pb-2 mb-6 break-words max-w-full" style={{ fontFamily: 'Georgia, serif' }}>
          {cert.displayName}
        </p>
        <p className="text-lg sm:text-xl text-slate-700 mb-2">has completed the Senior Cyber Secure scam-safety training,</p>
        <p className="text-lg sm:text-xl text-slate-700 mb-6">including all {modules.length} lessons and the final exam (score: {cert.finalScore}%).</p>
        <p className="text-base text-slate-500 mb-6">{modules.map((m) => m.title).join(' · ')}</p>
        <p className="text-xl font-bold text-slate-900 mb-6">Completed on {formatDate(cert.completedOn)}</p>
        <p className="text-sm text-slate-500 break-all">Certificate ID: {cert.id}</p>
        <p className="text-sm text-slate-500 break-all">Verify at {verifyUrl(cert.id)}</p>
      </div>
    </div>
  );
}

function ShareTools({ cert, modules }) {
  const [msg, setMsg] = useState('');
  const url = verifyUrl(cert.id);
  const text = `I completed the Senior Cyber Secure scam-safety training! You can see my certificate here:`;

  const share = async () => {
    setMsg('');
    if (navigator.share) {
      try { await navigator.share({ title: 'My scam-safety certificate', text, url }); return; } catch { /* closed or unsupported */ }
    }
    copy();
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setMsg('Link copied. You can paste it into an email or text message.'); }
    catch { setMsg(`Copy this link to share: ${url}`); }
  };
  const download = async () => {
    setMsg('');
    try { await downloadCertificatePdf(cert, modules.map((m) => m.title)); }
    catch { setMsg("We couldn't create the PDF. Try the Print button instead, and choose \"Save as PDF.\""); }
  };

  return (
    <div className="no-print bg-white rounded-2xl shadow border border-slate-200 p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Save and share your certificate</h2>
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <BigButton tone="green" onClick={download}><Download className="w-5 h-5" /> Download PDF</BigButton>
        <BigButton tone="white" onClick={() => window.print()}><Printer className="w-5 h-5" /> Print</BigButton>
        <BigButton tone="orange" onClick={share}><Share2 className="w-5 h-5" /> Share with Family</BigButton>
        <BigButton
          as="a"
          tone="white"
          href={`mailto:?subject=${encodeURIComponent('I finished my scam-safety training!')}&body=${encodeURIComponent(`${text}\n${url}`)}`}
        >
          <Mail className="w-5 h-5" /> Send by Email
        </BigButton>
      </div>
      <button type="button" onClick={copy} className="text-lg text-blue-700 font-semibold hover:underline inline-flex items-center gap-2 min-h-[44px]">
        <Copy className="w-5 h-5" /> Copy the verification link
      </button>
      {msg && <p role="status" className="mt-3 text-lg text-green-800 break-all">{msg}</p>}
      <p className="mt-4 text-base text-slate-600 flex gap-2">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 text-green-700" />
        Anyone with the link can confirm your certificate is real. It shows only the name you chose, the date, and your score.
      </p>
    </div>
  );
}
