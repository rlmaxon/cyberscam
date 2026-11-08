import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { useMember } from '../../member/MemberContext.jsx';
import { saveMyProfile } from '../../member/profileApi.js';
import { hasEmailBackend } from '../../amplifyConfig.js';
import { getMyPreferences, updateMyPreferences } from '../../alerts/emailApi.js';
import { AccountCard, Notice } from '../../components/account/FormParts.jsx';
import ProfileForm from '../../components/account/ProfileForm.jsx';

export default function ProfilePage() {
  const { email, profile, profileStatus, setProfile } = useMember();

  // The email choices that count are kept by the email system (they may have been changed
  // from a link in an email), so load them before showing the form.
  const [emailPrefs, setEmailPrefs] = useState(hasEmailBackend ? undefined : null);
  useEffect(() => {
    if (!hasEmailBackend) return;
    let cancelled = false;
    getMyPreferences().then((r) => !cancelled && setEmailPrefs(r.ok ? r.prefs : null));
    return () => { cancelled = true; };
  }, []);

  const handleSave = async (fields, email) => {
    const saved = await saveMyProfile(profile, fields);
    setProfile(saved);
    if (hasEmailBackend) {
      const r = await updateMyPreferences(email.topics, email.family);
      if (!r.ok) {
        const err = new Error(r.error);
        err.userMessage = `Your name and role were saved, but your email choices were not. ${r.error}`;
        throw err;
      }
      setEmailPrefs(r.prefs);
    }
  };

  let body;
  if (profileStatus === 'loading' || profileStatus === 'idle' || emailPrefs === undefined) {
    body = (
      <p className="text-lg text-slate-600 flex items-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" /> Loading your settings…
      </p>
    );
  } else if (profileStatus === 'unavailable') {
    body = <Notice tone="info">Profile settings are being set up and will be available here soon.</Notice>;
  } else if (profileStatus === 'error') {
    body = <Notice>We couldn't load your settings. Please refresh the page to try again.</Notice>;
  } else {
    body = <ProfileForm initial={profile} initialEmail={emailPrefs} onSave={handleSave} submitLabel="Save Changes" showFamily />;
  }

  return (
    <AccountCard
      icon={<UserCircle className="w-10 h-10" />}
      title="Your Profile"
      subtitle={email ? `Signed in as ${email}` : undefined}
      footer={
        <Link to={PATHS.dashboard} className="mt-6 text-lg text-slate-600 hover:text-slate-800 flex items-center justify-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back to My Dashboard
        </Link>
      }
    >
      {body}
      <div className="mt-8 pt-6 border-t border-slate-200 text-base text-slate-600 space-y-2">
        <p>
          <strong>Change your password:</strong> sign out, then use "Forgot password?" on the sign-in page.
        </p>
        <p>
          <strong>Delete your account:</strong> email us and we'll remove it and everything saved with it.
        </p>
      </div>
    </AccountCard>
  );
}
