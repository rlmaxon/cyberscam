import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { signIn, signOut, getCurrentUser, confirmSignIn, resetPassword, confirmResetPassword, fetchUserAttributes, resendSignUpCode } from 'aws-amplify/auth';
import { PATHS } from './routes.js';
import { hasDataBackend } from './amplifyConfig.js';
import { MemberContext } from './member/MemberContext.jsx';
import { loadMyProfile } from './member/profileApi.js';

import LoadingScreen from './components/LoadingScreen.jsx';
import Navigation from './components/Navigation.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ForcePasswordChange from './pages/ForcePasswordChange.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import MemberDashboard from './pages/MemberDashboard.jsx';
import TrainingLab from './pages/training/TrainingLab.jsx';
import ResourceCenter from './pages/ResourceCenter.jsx';
import AffiliateMarketplace from './pages/AffiliateMarketplace.jsx';
import EmergencyDirectory from './pages/EmergencyDirectory.jsx';
import NotFound from './pages/NotFound.jsx';
import LearningPath from './pages/learn/LearningPath.jsx';
import ModulePage from './pages/learn/ModulePage.jsx';
import FinalExamPage from './pages/learn/FinalExamPage.jsx';
import CertificatePage from './pages/learn/CertificatePage.jsx';
import VerifyCertificatePage from './pages/VerifyCertificatePage.jsx';
import BadgesPage from './pages/learn/BadgesPage.jsx';
import ScamOfTheWeekPage from './pages/learn/ScamOfTheWeekPage.jsx';
import FamilyPlanPage from './pages/learn/FamilyPlanPage.jsx';
import BadgeCelebration from './components/learn/BadgeCelebration.jsx';
import { ProgressContext, useProgressState } from './member/useProgressState.js';
import SignUpPage from './pages/account/SignUpPage.jsx';
import VerifyEmailPage from './pages/account/VerifyEmailPage.jsx';
import WelcomePage from './pages/account/WelcomePage.jsx';
import ProfilePage from './pages/account/ProfilePage.jsx';

// ==================== MAIN APP ====================
// authState: 'loading' | 'authenticated' | 'unauthenticated' | 'newPasswordRequired'
export default function SeniorCyberSecure() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authState, setAuthState] = useState('loading');
  const [resetEmail, setResetEmail] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState(null);
  const [profileStatus, setProfileStatus] = useState('idle');

  const isLoggedIn = authState === 'authenticated';
  const progressState = useProgressState(isLoggedIn);

  // Once signed in, load the member's email and profile
  useEffect(() => {
    if (!isLoggedIn) {
      setEmail('');
      setProfile(null);
      setProfileStatus('idle');
      return;
    }
    let cancelled = false;
    fetchUserAttributes()
      .then((attrs) => !cancelled && setEmail(attrs.email ?? ''))
      .catch(() => {});
    if (!hasDataBackend) {
      setProfileStatus('unavailable');
    } else {
      setProfileStatus('loading');
      loadMyProfile()
        .then((p) => { if (!cancelled) { setProfile(p); setProfileStatus('ready'); } })
        .catch(() => !cancelled && setProfileStatus('error'));
    }
    return () => { cancelled = true; };
  }, [isLoggedIn]);

  // Restore session from Cognito tokens on page load
  useEffect(() => {
    getCurrentUser()
      .then(() => setAuthState('authenticated'))
      .catch(() => setAuthState('unauthenticated'));
  }, []);

  // Close the mobile menu whenever the page changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // After signing in, return to the page the member was trying to reach
  const afterSignIn = () => navigate(location.state?.from || PATHS.dashboard, { replace: true });

  // Signed up but never entered the email code: send a fresh one and go to that step
  const sendToEmailConfirmation = async (email) => {
    try { await resendSignUpCode({ username: email }); } catch (_) {}
    navigate(PATHS.verifyEmail, {
      state: { email, notice: 'Please confirm your email first. We just sent you a new 6-digit code.' },
    });
  };

  const handleLogin = async (email, password, setLoading, setError) => {
    setLoading(true);
    setError('');
    try {
      const result = await signIn({ username: email, password });
      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setAuthState('newPasswordRequired');
      } else if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        await sendToEmailConfirmation(email);
      } else if (result.isSignedIn) {
        setAuthState('authenticated');
        afterSignIn();
      }
    } catch (err) {
      if (err?.name === 'UserNotConfirmedException') {
        await sendToEmailConfirmation(email);
        return;
      }
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForceNewPassword = async (newPassword, setLoading, setError) => {
    setLoading(true);
    setError('');
    try {
      const result = await confirmSignIn({ challengeResponse: newPassword });
      if (result.isSignedIn) {
        setAuthState('authenticated');
        afterSignIn();
      }
    } catch (err) {
      setError(err.message || 'Failed to set new password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await signOut(); } catch (_) {}
    setAuthState('unauthenticated');
    navigate(PATHS.landing);
  };

  const handleForgotPassword = async (email, setLoading, setError) => {
    setLoading(true);
    setError('');
    try {
      await resetPassword({ username: email });
      setResetEmail(email);
      navigate(PATHS.resetPassword);
    } catch (err) {
      setError('Could not send reset code. Please verify your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (code, newPassword, setLoading, setError) => {
    setLoading(true);
    setError('');
    try {
      await confirmResetPassword({ username: resetEmail, confirmationCode: code, newPassword });
      navigate(PATHS.login);
    } catch (err) {
      setError(err.message || 'Invalid code or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authState === 'loading') {
    return <LoadingScreen />;
  }

  // Members-only routes send signed-out visitors to the sign-in page, then back.
  const membersOnly = (element) =>
    isLoggedIn ? element : <Navigate to={PATHS.login} replace state={{ from: location.pathname }} />;

  // New members who haven't filled in the welcome step are sent there first
  const needsWelcome = isLoggedIn && profileStatus === 'ready' && !profile;
  const dashboardElement = needsWelcome ? <Navigate to={PATHS.welcome} replace /> : <MemberDashboard />;

  const member = { isLoggedIn, email, profile, profileStatus, setProfile };

  return (
    <MemberContext.Provider value={member}>
    <ProgressContext.Provider value={progressState}>
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Source Sans 3', 'Segoe UI', sans-serif" }}>
      <ScrollToTop />
      <Navigation
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main>
        {/* First-login forced password change — shown instead of any page */}
        {authState === 'newPasswordRequired' ? (
          <ForcePasswordChange onConfirm={handleForceNewPassword} />
        ) : (
          <Routes>
            <Route path={PATHS.landing} element={<LandingPage />} />

            {/* Public: safety information is open to everyone */}
            <Route path={PATHS.emergency} element={<EmergencyDirectory />} />
            <Route path={PATHS.resources} element={<ResourceCenter />} />
            <Route path={PATHS.marketplace} element={<AffiliateMarketplace />} />
            <Route path={PATHS.learn} element={<LearningPath />} />
            <Route path={PATHS.finalExam} element={<FinalExamPage />} />
            <Route path={`${PATHS.learn}/:moduleKey`} element={<ModulePage />} />
            <Route path={`${PATHS.learn}/:moduleKey/:step`} element={<ModulePage />} />
            <Route path={`${PATHS.verify}/:certId`} element={<VerifyCertificatePage />} />
            <Route path={PATHS.badges} element={<BadgesPage />} />
            <Route path={PATHS.scamOfTheWeek} element={<ScamOfTheWeekPage />} />
            <Route path={`${PATHS.scamOfTheWeek}/:weekId`} element={<ScamOfTheWeekPage />} />
            <Route path={PATHS.familyPlan} element={<FamilyPlanPage />} />
            <Route path={PATHS.training} element={<TrainingLab />} />
            <Route path={`${PATHS.training}/quiz`} element={<TrainingLab view="quiz" />} />
            <Route path={`${PATHS.training}/:categoryKey`} element={<TrainingLab />} />
            <Route path={`${PATHS.training}/:categoryKey/:exampleId`} element={<TrainingLab />} />

            {/* Account */}
            <Route
              path={PATHS.login}
              element={isLoggedIn ? <Navigate to={PATHS.dashboard} replace /> : <LoginPage handleLogin={handleLogin} handleForgotPassword={handleForgotPassword} />}
            />
            <Route path={PATHS.forgotPassword} element={<ForgotPasswordPage handleForgotPassword={handleForgotPassword} />} />
            <Route
              path={PATHS.resetPassword}
              element={resetEmail
                ? <ResetPasswordPage handleResetPassword={handleResetPassword} email={resetEmail} />
                : <Navigate to={PATHS.forgotPassword} replace />}
            />

            <Route
              path={PATHS.signup}
              element={isLoggedIn ? <Navigate to={PATHS.dashboard} replace /> : <SignUpPage />}
            />
            <Route
              path={PATHS.verifyEmail}
              element={isLoggedIn ? <Navigate to={PATHS.dashboard} replace /> : <VerifyEmailPage onSignedIn={() => { setAuthState('authenticated'); navigate(PATHS.welcome, { replace: true }); }} />}
            />

            {/* Members only */}
            <Route path={PATHS.dashboard} element={membersOnly(dashboardElement)} />
            <Route path={PATHS.certificate} element={membersOnly(<CertificatePage />)} />
            <Route path={PATHS.welcome} element={membersOnly(<WelcomePage />)} />
            <Route path={PATHS.profile} element={membersOnly(<ProfilePage />)} />

            {/* Old page names people may have bookmarked */}
            <Route path="/resources" element={<Navigate to={PATHS.resources} replace />} />
            <Route path="/marketplace" element={<Navigate to={PATHS.marketplace} replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </main>

      {authState !== 'newPasswordRequired' && <BadgeCelebration />}
      <Footer />
    </div>
    </ProgressContext.Provider>
    </MemberContext.Provider>
  );
}
