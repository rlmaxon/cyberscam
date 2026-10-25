import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { useMember } from '../../member/MemberContext.jsx';
import { saveMyProfile } from '../../member/profileApi.js';
import { AccountCard } from '../../components/account/FormParts.jsx';
import ProfileForm from '../../components/account/ProfileForm.jsx';

// First-time step after creating an account: name, role, and email alert choices.
export default function WelcomePage() {
  const navigate = useNavigate();
  const { profile, profileStatus, setProfile } = useMember();

  // Already set up, or profiles aren't switched on yet: go straight to the dashboard
  if (profile || profileStatus === 'unavailable') return <Navigate to={PATHS.dashboard} replace />;

  const handleSave = async (fields) => {
    const saved = await saveMyProfile(null, fields);
    setProfile(saved);
    navigate(PATHS.dashboard, { replace: true });
  };

  return (
    <AccountCard
      icon={<Sparkles className="w-10 h-10" />}
      title="Welcome! Let's Get You Set Up"
      subtitle="Three quick questions, then you're ready to start."
    >
      <ProfileForm onSave={handleSave} submitLabel="Save and Continue" />
    </AccountCard>
  );
}
