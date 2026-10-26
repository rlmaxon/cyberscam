import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShieldCheck, ShieldQuestion } from 'lucide-react';
import { PATHS } from '../routes.js';
import { formatDate, verifyCertificate } from '../member/certificateApi.js';
import { LoadingBlock } from '../components/learn/LearnParts.jsx';

// Public page: anyone with a certificate link can confirm it's real.
export default function VerifyCertificatePage() {
  const { certId } = useParams();
  const [state, setState] = useState({ status: 'loading', cert: null });

  useEffect(() => {
    let cancelled = false;
    verifyCertificate(certId)
      .then((cert) => !cancelled && setState({ status: cert ? 'found' : 'missing', cert }))
      .catch(() => !cancelled && setState({ status: 'missing', cert: null }));
    return () => { cancelled = true; };
  }, [certId]);

  if (state.status === 'loading') return <LoadingBlock text="Checking this certificate…" />;

  return (
    <div className="min-h-[70vh] bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
        {state.status === 'found' ? (
          <>
            <ShieldCheck className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Verified Certificate</h1>
            <p className="text-xl text-slate-700 mb-2"><strong>{state.cert.displayName}</strong></p>
            <p className="text-lg text-slate-700 mb-2">completed the Senior Cyber Secure scam-safety training</p>
            <p className="text-lg text-slate-700 mb-6">on <strong>{formatDate(state.cert.completedOn)}</strong>, passing the final exam with <strong>{state.cert.finalScore}%</strong>.</p>
            <p className="text-sm text-slate-500 break-all mb-6">Certificate ID: {state.cert.id}</p>
          </>
        ) : (
          <>
            <ShieldQuestion className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-800 mb-4">We couldn't find that certificate</h1>
            <p className="text-lg text-slate-700 mb-6">Please check that the link was copied completely. Certificate links are long, and the end can get cut off.</p>
          </>
        )}
        <Link to={PATHS.learn} className="inline-block text-lg text-blue-700 font-semibold hover:underline">
          Take the free scam-safety training yourself →
        </Link>
      </div>
    </div>
  );
}
