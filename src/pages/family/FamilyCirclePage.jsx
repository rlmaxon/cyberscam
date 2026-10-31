import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Heart, Eye, EyeOff, UserPlus, ArrowRight, Clock, CheckCircle, X } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { useMember } from '../../member/MemberContext.jsx';
import { useProgress } from '../../member/useProgressState.js';
import { useFamily } from '../../member/useFamilyState.js';
import {
  createShare, createInvite, approveRequest, deleteRequest, removeViewer, stopSharing, deleteCheer,
  cancelJoinRequest, inviteUrl, isExpired,
} from '../../member/familyApi.js';
import { buildSummary, progressFromSummary } from '../../member/familySummary.js';
import { cheerText } from '../../member/cheers.js';
import { loadFamilyPlan, useTrainingData } from '../../training/content.js';
import ScamShield from '../../components/learn/ScamShield.jsx';
import { BigButton, ErrorBlock, LoadingBlock } from '../../components/learn/LearnParts.jsx';
import { ShareMessage, ConfirmButton, Notice, formatDay } from '../../components/family/FamilyParts.jsx';

export default function FamilyCirclePage() {
  const { profile } = useMember();
  const { family, status, refresh } = useFamily();
  const { modules } = useTrainingData();

  useEffect(() => { refresh({ quiet: true }); }, [refresh]);

  if (status === 'unavailable') return <ErrorBlock text="Family Circle isn't available yet. Please check back soon." />;
  if (status === 'error' && !family) return <ErrorBlock text="We couldn't load your Family Circle. Please check your internet connection and refresh the page." />;
  if (!family) return <LoadingBlock text="Loading your Family Circle…" />;

  const helperFirst = profile?.role === 'family' || profile?.role === 'caregiver';
  const share = <ShareSection key="share" />;
  const follow = <FollowingSection key="follow" modules={modules} />;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8" /></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Family Circle</h1>
          <p className="text-xl text-slate-700">Learn together and cheer each other on. Families who talk about scams are much harder to fool.</p>
        </header>
        <div className="space-y-8">{helperFirst ? [follow, share] : [share, follow]}</div>
      </div>
    </div>
  );
}

// ---------- The learner's side: share my progress ----------

function ShareSection() {
  const { profile } = useMember();
  const { progress } = useProgress();
  const { family, setFamily, refresh } = useFamily();
  const { modules } = useTrainingData();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const myName = profile?.displayName || 'Your family member';
  const share = family.myShare;
  const invite = family.myInvites.find((i) => !isExpired(i));

  const run = async (fn) => {
    setBusy(true); setError('');
    try { await fn(); } catch { setError("Something went wrong. Please check your internet connection and try again."); }
    finally { setBusy(false); }
  };

  const makeInvite = () => run(async () => {
    let s = share;
    if (!s) {
      const plan = await loadFamilyPlan();
      s = await createShare(myName, { ...buildSummary(progress, modules, plan.length), updatedOn: new Date().toISOString() });
    }
    const inv = await createInvite(myName);
    setFamily((f) => ({ ...f, myShare: s, myInvites: [inv, ...f.myInvites] }));
  });

  const viewers = share?.viewers ?? [];

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8" aria-labelledby="share-heading">
      <h2 id="share-heading" className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2"><Heart className="w-6 h-6 text-rose-600" /> Let family cheer you on</h2>
      <p className="text-lg text-slate-700 mb-5">Invite a son, daughter, or someone you trust to follow your progress and send you cheers.</p>

      {error && <div className="mb-4"><Notice>{error}</Notice></div>}

      {family.joinRequests.length > 0 && share && (
        <div className="mb-6 space-y-3">
          {family.joinRequests.map((r) => (
            <div key={r.id} className="p-5 rounded-xl border-2 border-amber-300 bg-amber-50">
              <p className="text-xl font-bold text-slate-800 mb-1">
                {r.requesterName}{r.relationship ? ` (${r.relationship})` : ''} would like to follow your progress.
              </p>
              <p className="text-lg text-slate-700 mb-4">Only say yes if you know this person and sent them your invite link.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <BigButton tone="green" disabled={busy} onClick={() => run(async () => {
                  const updated = await approveRequest(share, r);
                  setFamily((f) => ({ ...f, myShare: updated, joinRequests: f.joinRequests.filter((x) => x.id !== r.id) }));
                })}>Yes, allow</BigButton>
                <BigButton tone="white" disabled={busy} onClick={() => run(async () => {
                  await deleteRequest(r.id);
                  setFamily((f) => ({ ...f, joinRequests: f.joinRequests.filter((x) => x.id !== r.id) }));
                })}>No thanks</BigButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
          <p className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2"><Eye className="w-5 h-5" /> What they'll see</p>
          <ul className="text-lg text-green-950 space-y-1 list-disc pl-5">
            <li>Lessons you've passed</li><li>Your badges and Scam Shield</li><li>When you last made progress</li>
          </ul>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2"><EyeOff className="w-5 h-5" /> What they won't see</p>
          <ul className="text-lg text-slate-700 space-y-1 list-disc pl-5">
            <li>Your quiz answers or scores</li><li>Your email address</li><li>Anything you type</li>
          </ul>
        </div>
      </div>

      {invite ? (
        <div className="mb-6">
          <ShareMessage
            label="Send this link to your family member:"
            message={`I'm learning to spot scams on Senior Cyber Secure. Here's a link so you can follow my progress and cheer me on:`}
            link={inviteUrl(invite.id)}
            subject="Follow my scam-safety progress"
          />
          <p className="mt-3 text-base text-slate-600">
            This link works until {formatDay(invite.expiresAt)}. You can send it to more than one person. Nobody sees anything until you say yes.
          </p>
        </div>
      ) : (
        <BigButton tone="blue" disabled={busy} onClick={makeInvite} className="mb-6">
          <UserPlus className="w-6 h-6" /> {busy ? 'One moment…' : share ? 'Make a new invite link' : 'Invite a family member'}
        </BigButton>
      )}

      {share && (
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-xl font-bold text-slate-800 mb-3">Who can see your progress</h3>
          {viewers.length === 0 ? (
            <p className="text-lg text-slate-700 mb-4">No one yet. When someone uses your link, you'll see their request here.</p>
          ) : (
            <ul className="space-y-3 mb-4">
              {viewers.map((v) => {
                const info = share.viewerNames[v] ?? {};
                return (
                  <li key={v} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <p className="text-lg font-semibold text-slate-800 mb-2">{info.name || 'Family member'}{info.relationship ? ` (${info.relationship})` : ''}</p>
                    <ConfirmButton
                      className="text-red-700 hover:bg-red-50 border-2 border-red-200 bg-white"
                      question={`Stop sharing with ${info.name || 'this person'}?`}
                      confirmLabel="Yes, remove"
                      onConfirm={() => run(async () => {
                        const updated = await removeViewer(share, v);
                        setFamily((f) => ({ ...f, myShare: updated }));
                      })}
                    >Remove</ConfirmButton>
                  </li>
                );
              })}
            </ul>
          )}
          <ConfirmButton
            className="text-slate-700 underline hover:text-red-700"
            question="Stop sharing with everyone and turn off your invite links?"
            confirmLabel="Yes, stop sharing"
            onConfirm={() => run(async () => {
              await stopSharing(share, family.myInvites);
              await refresh({ quiet: true });
            })}
          >Stop sharing with everyone</ConfirmButton>
        </div>
      )}

      {share && <CheersReceived />}
    </section>
  );
}

function CheersReceived() {
  const { family, setFamily } = useFamily();
  const cheers = family.cheers;
  return (
    <div className="border-t border-slate-200 pt-6 mt-6">
      <h3 className="text-xl font-bold text-slate-800 mb-3">Cheers from your family</h3>
      {cheers.length === 0 ? (
        <p className="text-lg text-slate-700">When family send you a cheer, it will show up here and on your home page.</p>
      ) : (
        <ul className="space-y-3">
          {cheers.map((c) => {
            const t = cheerText(c.message);
            return (
              <li key={c.id} className="flex items-start gap-4 p-4 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-4xl" aria-hidden="true">{t.emoji}</span>
                <div className="flex-1">
                  <p className="text-xl font-semibold text-slate-800">“{t.text}”</p>
                  <p className="text-base text-slate-600">From {c.fromName}{c.createdAt ? `, ${formatDay(c.createdAt)}` : ''}</p>
                </div>
                <button type="button" aria-label={`Remove cheer from ${c.fromName}`}
                  onClick={async () => { try { await deleteCheer(c.id); setFamily((f) => ({ ...f, cheers: f.cheers.filter((x) => x.id !== c.id) })); } catch { /* try again later */ } }}
                  className="w-11 h-11 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white">
                  <X className="w-5 h-5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ---------- The family side: people I follow ----------

function FollowingSection({ modules }) {
  const { family, setFamily } = useFamily();
  const total = modules.length;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8" aria-labelledby="follow-heading">
      <h2 id="follow-heading" className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2"><Users className="w-6 h-6 text-blue-600" /> People I'm following</h2>
      <p className="text-lg text-slate-700 mb-5">See how a parent or loved one is doing, and send them a cheer.</p>

      {family.following.length > 0 && (
        <ul className="space-y-4 mb-6">
          {family.following.map((s) => {
            const sum = s.summary ?? {};
            const working = sum.working && modules.find((m) => m.key === sum.working.key);
            return (
              <li key={s.id}>
                <Link to={`${PATHS.familyView}/${s.id}`} className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 bg-white">
                  <ScamShield progress={progressFromSummary(sum)} modules={modules} size={72} />
                  <span className="flex-1">
                    <span className="block text-xl font-bold text-slate-800">{s.displayName}</span>
                    <span className="block text-lg text-slate-700">
                      {sum.certified ? 'Certified! Passed the final exam.' : `${(sum.passed ?? []).length} of ${sum.lessonsTotal ?? total} lessons passed`}
                    </span>
                    {working && !sum.certified && <span className="block text-base text-slate-600">Working on: {working.title}</span>}
                  </span>
                  <ArrowRight className="w-6 h-6 text-blue-600 flex-shrink-0" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {family.pendingJoins.length > 0 && (
        <ul className="space-y-3 mb-6">
          {family.pendingJoins.map((r) => (
            <li key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-lg text-slate-800 flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-slate-500" /> Waiting for {r.inviterName || 'them'} to say yes (asked {formatDay(r.createdAt)}).
              </p>
              <ConfirmButton
                className="text-slate-700 underline"
                question="Cancel this request?"
                confirmLabel="Yes, cancel"
                onConfirm={async () => {
                  try { await cancelJoinRequest(r.id); setFamily((f) => ({ ...f, pendingJoins: f.pendingJoins.filter((x) => x.id !== r.id) })); } catch { /* ignore */ }
                }}
              >Cancel request</ConfirmButton>
            </li>
          ))}
        </ul>
      )}

      {family.following.length === 0 && family.pendingJoins.length === 0 && (
        <p className="text-lg text-slate-700 mb-4 flex gap-2"><CheckCircle className="w-6 h-6 text-slate-400 flex-shrink-0" /> You're not following anyone yet.</p>
      )}

      <h3 className="text-xl font-bold text-slate-800 mb-2">Want to follow a parent's progress?</h3>
      <p className="text-lg text-slate-700 mb-3">
        Ask them to create a free account and send you an invite from their Family Circle page. Here's a message you can send:
      </p>
      <ShareMessage
        message={`Hi! I found a free website that teaches how to spot scams, with short lessons and a certificate at the end: ${origin} Would you make a free account and send me an invite from the Family Circle page? Then I can cheer you on!`}
        subject="A free site to help us spot scams"
      />
    </section>
  );
}
