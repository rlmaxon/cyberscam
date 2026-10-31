import { allBadges, earnedBadgeIds } from '../training/badges.js';
import { currentModuleIndex, moduleProgress, stepsDone, STEPS } from '../training/progress.js';

// The short progress summary a learner shares with family. Only what's listed here is
// ever shared: no quiz answers, no email address, and no Family Safety Plan details
// beyond how many steps are ticked.
export function buildSummary(progress, modules, planTotal) {
  const idx = currentModuleIndex(progress, modules);
  const current = idx === null ? null : modules[idx];
  return {
    passed: modules.filter((m) => moduleProgress(progress, m.key).passed).map((m) => m.key),
    lessonsTotal: modules.length,
    working: current ? { key: current.key, steps: stepsDone(moduleProgress(progress, current.key)), of: STEPS.length } : null,
    badges: earnedBadgeIds(allBadges(progress, modules, planTotal)),
    certified: !!progress.finalExam?.passed,
    certificateId: progress.finalExam?.passed ? progress.certificateId ?? null : null,
    weekly: Object.keys(progress.weekly ?? {}).length,
    planDone: Object.values(progress.familyPlan ?? {}).filter(Boolean).length,
    planTotal,
  };
}

// True when the summary has changed in a way family would notice.
export function summaryChanged(oldSummary, next) {
  const { updatedOn, ...rest } = oldSummary ?? {};
  return JSON.stringify(rest) !== JSON.stringify(next);
}

// Rebuild just enough "progress" from a shared summary to draw the Scam Shield and badges.
export function progressFromSummary(summary) {
  const modules = {};
  for (const key of summary?.passed ?? []) modules[key] = { passed: true };
  if (summary?.working) modules[summary.working.key] = { ...(modules[summary.working.key] ?? {}) };
  return { modules, finalExam: summary?.certified ? { passed: true } : null, weekly: {}, familyPlan: {} };
}
