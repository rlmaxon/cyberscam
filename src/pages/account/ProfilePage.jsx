import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { useMember } from '../../member/MemberContext.jsx';
import { saveMyProfile } from '../../member/profileApi.js';
import { AccountCard, Notice } from '../../components/account/FormParts.jsx';
import ProfileForm from '../../components/account/ProfileForm.jsx';

export default function ProfilePage() {
  const { email, profile, profileStatus, setProfile } = useMember();

  const handleSave = async (fields) => {
    const saved = await saveMyProfile(profile, fields);
    setProfile(saved);
  };

  let body;
  if (profileStatus === 'loading' || profileStatus === 'idle') {
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
    body = <ProfileForm initial={profile} onSave={handleSave} submitLabel="Save Changes" />;
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
