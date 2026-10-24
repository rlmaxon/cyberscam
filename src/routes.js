import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// One place to map page keys to URLs. Components call go('emergency')
// instead of hard-coding paths, so URLs can change without hunting through pages.
export const PATHS = {
  landing: '/',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
  training: '/training',
  resources: '/lock-it-down',
  marketplace: '/security-toolbox',
  emergency: '/emergency',
};

// Pages that need a signed-in member. Everything else is public —
// emergency help and safety information must never sit behind a login.
export const PROTECTED_PAGES = ['dashboard'];

export function useGo() {
  const navigate = useNavigate();
  return useCallback((page) => navigate(PATHS[page] ?? page), [navigate]);
}

// The page key for the current URL, used to highlight the active nav item.
export function usePageKey() {
  const { pathname } = useLocation();
  if (pathname === '/') return 'landing';
  const match = Object.entries(PATHS).find(([, path]) => path !== '/' && (pathname === path || pathname.startsWith(path + '/')));
  return match ? match[0] : null;
}
