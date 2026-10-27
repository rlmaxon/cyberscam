import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Users, CheckCircle, LogIn, UserPlus } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { useMember } from '../../member/MemberContext.jsx';
import { useFamily } from '../../member/useFamilyState.js';
import { getInvite, sendJoinRequest, isExpired, isMe } from '../../member/familyApi.js';
import { RELATIONSHIPS } from '../../member/cheers.js';
import { BigButton, LoadingBlock } from '../../components/learn/LearnParts.jsx';
import { Notice, setPendingInvite, clearPendingInvite } from '../../components/family/FamilyParts.jsx';

function Card({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8" /></div>
        {children}
      </div>
    </div>
  );
}

export default function JoinFamilyPage() {
  const { inviteId } = useParams();
  const { isLoggedIn } = useMember();
  const location = useLocation();

  // Remember the invite so we can bring them back here after they sign up.
  useEffect(() => { if (!isLoggedIn && inviteId) setPendingInvite(inviteId); }, [isLoggedIn, inviteId]);

  if (!isLoggedIn) {
    return (
      <Card>
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-3">You've been invited to a Family Circle</h1>
        <p className="text-xl text-slate-700 text-center mb-6">
          Someone you know is learning to spot scams and would like you to follow their progress. Sign in or create a free account to accept.
        </p>
        <div className="space-y-3">
          <BigButton as={Link} to={PATHS.login} state={{ from: location.pathname }} tone="blue"><LogIn className="w-5 h-5" /> I have an account: Sign in</BigButton>
          <BigButton as={Link} to={PATHS.signup} tone="orange"><UserPlus className="w-5 h-5" /> Create a free account</BigButton>
        </div>
        <p className="mt-6 text-base text-slate-600 text-center">After you create your account, you'll see a reminder on your home page to finish accepting.</p>
      </Card>
    );
  }
  return <JoinSignedIn inviteId={inviteId} />;
}

function JoinSignedIn({ inviteId }) {
  const { profile } = useMember();
  const { family, refresh } = useFamily();
  const [invite, setInvite] = useState(undefined); // undefined = loading, null = not found
  const [name, setName] = useState(profile?.displayName ?? '');
  const [relationship, setRelationship] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // They've made it back to the invite, so the home-page reminder isn't needed any more.
  useEffect(() => { clearPendingInvite(); }, []);
  useEffect(() => {
    let cancelled = false;
    getInvite(inviteId).then((i) => !cancelled && setInvite(i)).catch(() => !cancelled && setInvite(null));
    return () => { cancelled = true; };
  }, [inviteId]);
  useEffect(() => { if (!name && profile?.displayName) setName(profile.displayName); }, [profile?.displayName]); // eslint-disable-line react-hooks/exhaustive-deps

  if (invite === undefined || !family) return <LoadingBlock text="Opening your invite…" />;

  const done = (title, text) => (
      <Card>
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-3">{title}</h1>
        <p className="text-xl text-slate-700 text-center mb-6">{text}</p>
        <BigButton as={Link} to={PATHS.family} tone="blue">Go to my Family Circle</BigButton>
      </Card>
  );

  if (!invite || isExpired(invite)) {
    return done('This invite link has expired', 'Invite links work for 7 days. Ask them to open their Family Circle page and send you a new one.');
  }
  if (isMe(invite.owner, family.sub)) {
    return done('This is your own invite link', 'Send it to a family member, and they can use it to ask to follow your progress.');
  }
  const already = family.following.find((s) => s.owner === invite.owner);
  if (already) return done(`You already follow ${already.displayName}`, 'You can see their progress and send cheers from your Family Circle.');
  if (sent || family.pendingJoins.some((r) => r.inviteId === invite.id)) {
    return done('Request sent!', `${invite.inviterName} will see your request the next time they visit and can tap “Yes, allow.” Then their progress will show up in your Family Circle.`);
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name so they know who you are.'); return; }
    setSending(true); setError('');
    try {
      await sendJoinRequest(invite, { requesterName: name.trim().slice(0, 60), relationship });
      setSent(true);
      refresh({ quiet: true });
    } catch {
      setError("We couldn't send your request. Please check your internet connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <h1 className="text-3xl font-bold text-slate-800 text-center mb-3">{invite.inviterName} invited you</h1>
      <p className="text-xl text-slate-700 text-center mb-6">
        {invite.inviterName} is learning to spot scams and would like you to follow their progress and cheer them on.
      </p>
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="join-name" className="block text-lg font-semibold text-slate-800 mb-2">Your name, as they know you</label>
          <input id="join-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name"
            className="w-full px-4 py-3 text-lg rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="join-rel" className="block text-lg font-semibold text-slate-800 mb-2">How are you related? (optional)</label>
          <select id="join-rel" value={relationship} onChange={(e) => setRelationship(e.target.value)}
            className="w-full px-4 py-3 text-lg rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:outline-none bg-white">
            <option value="">Choose one</option>
            {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        {error && <Notice>{error}</Notice>}
        <BigButton type="submit" tone="green" disabled={sending}>
          <CheckCircle className="w-5 h-5" /> {sending ? 'Sending…' : 'Ask to follow their progress'}
        </BigButton>
        <p className="text-base text-slate-600 text-center">They'll need to say yes before you can see anything.</p>
      </form>
    </Card>
  );
}
