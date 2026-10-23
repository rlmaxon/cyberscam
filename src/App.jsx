import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { signIn, signOut, getCurrentUser, confirmSignIn, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { PATHS } from './routes.js';

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

// ==================== MAIN APP ====================
// authState: 'loading' | 'authenticated' | 'unauthenticated' | 'newPasswordRequired'
export default function SeniorCyberSecure() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authState, setAuthState] = useState('loading');
  const [resetEmail, setResetEmail] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = authState === 'authenticated';

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

  const handleLogin = async (email, password, setLoading, setError) => {
    setLoading(true);
    setError('');
    try {
      const result = await signIn({ username: email, password });
      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setAuthState('newPasswordRequired');
      } else if (result.isSignedIn) {
        setAuthState('authenticated');
        afterSignIn();
      }
    } catch (err) {
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

  return (
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

            {/* Members only */}
            <Route path={PATHS.dashboard} element={membersOnly(<MemberDashboard />)} />

            {/* Old page names people may have bookmarked */}
            <Route path="/resources" element={<Navigate to={PATHS.resources} replace />} />
            <Route path="/marketplace" element={<Navigate to={PATHS.marketplace} replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </main>

      <Footer />
    </div>
  );
}
