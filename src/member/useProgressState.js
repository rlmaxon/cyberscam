import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { hasDataBackend } from '../amplifyConfig.js';
import { emptyProgress, hasAnyProgress, mergeProgress } from '../training/progress.js';
import {
  loadLocalProgress, saveLocalProgress, clearLocalProgress, loadAccountProgress, saveAccountProgress,
} from './progressApi.js';

export const ProgressContext = createContext({
  progress: emptyProgress(),
  update: () => {},
  saving: 'local', // 'local' | 'loading' | 'saved' | 'saving' | 'error'
});
export const useProgress = () => useContext(ProgressContext);

// Keeps training progress in sync between this browser and the member's account.
export function useProgressState(isLoggedIn) {
  const [progress, setProgress] = useState(loadLocalProgress);
  const [saving, setSaving] = useState('local');
  const latest = useRef(progress);
  const record = useRef(null);
  const queue = useRef(Promise.resolve());
  const syncing = isLoggedIn && hasDataBackend;

  const persistToAccount = useCallback(() => {
    setSaving('saving');
    queue.current = queue.current
      .then(() => saveAccountProgress(record.current, latest.current))
      .then((saved) => { if (saved) record.current = saved; setSaving('saved'); })
      .catch(() => setSaving('error'));
    return queue.current;
  }, []);

  // On sign-in: load the account's progress and fold in anything done on this device.
  // On sign-out: clear this device, so the next person starts fresh.
  const wasLoggedIn = useRef(isLoggedIn);
  useEffect(() => {
    let cancelled = false;
    if (!isLoggedIn) {
      if (wasLoggedIn.current) {
        clearLocalProgress();
        record.current = null;
        latest.current = emptyProgress();
        setProgress(latest.current);
      }
      wasLoggedIn.current = false;
      setSaving('local');
      return;
    }
    wasLoggedIn.current = true;
    if (!hasDataBackend) { setSaving('local'); return; }

    setSaving('loading');
    loadAccountProgress()
      .then((result) => {
        if (cancelled) return;
        record.current = result?.record ?? null;
        const local = loadLocalProgress();
        const remote = result?.progress;
        const merged = remote ? mergeProgress(local, remote) : local;
        latest.current = merged;
        setProgress(merged);
        saveLocalProgress(merged);
        const changed = JSON.stringify(merged) !== JSON.stringify(remote ? mergeProgress(remote, remote) : null);
        if (hasAnyProgress(merged) && changed) persistToAccount();
        else setSaving('saved');
      })
      .catch(() => !cancelled && setSaving('error'));
    return () => { cancelled = true; };
  }, [isLoggedIn, persistToAccount]);

  const update = useCallback((fn) => {
    const next = fn(latest.current);
    latest.current = next;
    setProgress(next);
    saveLocalProgress(next);
    return syncing ? persistToAccount() : Promise.resolve();
  }, [syncing, persistToAccount]);

  return { progress, update, saving };
}
