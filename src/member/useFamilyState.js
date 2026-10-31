import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { hasDataBackend } from '../amplifyConfig.js';
import { loadFamily, updateShare } from './familyApi.js';
import { buildSummary, summaryChanged } from './familySummary.js';
import { loadFamilyPlan, loadModules } from '../training/content.js';

// status: 'idle' (signed out) | 'loading' | 'ready' | 'error' | 'unavailable'
export const FamilyContext = createContext({ status: 'idle', family: null, refresh: () => {}, setFamily: () => {} });
export const useFamily = () => useContext(FamilyContext);

// Loads the member's Family Circle once they sign in, and keeps their shared progress
// summary up to date as they learn (only if they've chosen to share).
export function useFamilyState({ isLoggedIn, profile, progress, saving }) {
  const [family, setFamily] = useState(null);
  const [status, setStatus] = useState('idle');
  const loadId = useRef(0);

  const refresh = useCallback(async ({ quiet = false } = {}) => {
    if (!isLoggedIn) return;
    if (!hasDataBackend) { setStatus('unavailable'); return; }
    const id = ++loadId.current;
    if (!quiet) setStatus((s) => (s === 'ready' ? s : 'loading'));
    try {
      const data = await loadFamily();
      if (id === loadId.current) { setFamily(data); setStatus('ready'); }
    } catch {
      if (id === loadId.current) setStatus((s) => (s === 'ready' ? s : 'error'));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) { loadId.current++; setFamily(null); setStatus('idle'); return; }
    refresh();
  }, [isLoggedIn, refresh]);

  // Keep the shared summary fresh. Waits a moment so a burst of answers is one update.
  const myShare = family?.myShare;
  const displayName = profile?.displayName;
  useEffect(() => {
    if (!myShare || saving === 'loading') return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const [modules, plan] = await Promise.all([loadModules(), loadFamilyPlan()]);
        const next = buildSummary(progress, modules, plan.length);
        const fields = {};
        if (summaryChanged(myShare.summary, next)) fields.summary = { ...next, updatedOn: new Date().toISOString() };
        if (displayName && displayName !== myShare.displayName) fields.displayName = displayName;
        if (!Object.keys(fields).length || cancelled) return;
        const updated = await updateShare(myShare, fields);
        if (!cancelled) setFamily((f) => (f && f.myShare?.id === updated.id ? { ...f, myShare: updated } : f));
      } catch {
        // Not critical: the summary catches up the next time progress changes.
      }
    }, 1500);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [myShare, progress, saving, displayName]);

  return { family, status, refresh, setFamily };
}
