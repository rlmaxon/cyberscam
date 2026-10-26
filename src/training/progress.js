// Pure helpers for training progress. Shape:
// {
//   modules: { [moduleKey]: { learn, practice, actions, bestScore, passed, passedAt } },
//   finalExam: { bestScore, passed, passedAt } | null,
//   lastModuleKey: string | null,
//   certificateId: string | null,
// }

export const STEPS = ['learn', 'practice', 'actions', 'check'];

export const emptyProgress = () => ({ modules: {}, finalExam: null, lastModuleKey: null, certificateId: null });

export const moduleProgress = (progress, key) => progress?.modules?.[key] ?? {};

export const isStepDone = (mp, step) => (step === 'check' ? !!mp.passed : !!mp[step]);

export const stepsDone = (mp) => STEPS.filter((s) => isStepDone(mp, s)).length;

// Modules unlock in order: each opens once the one before it is passed.
export function isUnlocked(progress, modules, index) {
  if (index <= 0) return true;
  return !!moduleProgress(progress, modules[index - 1]?.key).passed;
}

export function moduleStatus(progress, modules, index) {
  const mp = moduleProgress(progress, modules[index].key);
  if (mp.passed) return 'completed';
  if (!isUnlocked(progress, modules, index)) return 'locked';
  return stepsDone(mp) > 0 ? 'in-progress' : 'ready';
}

export const passedCount = (progress, modules) => modules.filter((m) => moduleProgress(progress, m.key).passed).length;

export const allModulesPassed = (progress, modules) => modules.length > 0 && passedCount(progress, modules) === modules.length;

// The module to continue: the first one not yet passed (or null if all are done).
export function currentModuleIndex(progress, modules) {
  const i = modules.findIndex((m) => !moduleProgress(progress, m.key).passed);
  return i === -1 ? null : i;
}

// The first step in a module that isn't done yet.
export function nextStep(mp) {
  return STEPS.find((s) => !isStepDone(mp, s)) ?? 'check';
}

export function hasAnyProgress(progress) {
  return Object.keys(progress?.modules ?? {}).length > 0 || !!progress?.finalExam;
}

// Combine two progress records (e.g. this device and the member's account),
// keeping the furthest progress for every module.
export function mergeProgress(a, b) {
  const out = emptyProgress();
  const keys = new Set([...Object.keys(a?.modules ?? {}), ...Object.keys(b?.modules ?? {})]);
  for (const k of keys) {
    const x = a?.modules?.[k] ?? {};
    const y = b?.modules?.[k] ?? {};
    const passedAt = [x.passedAt, y.passedAt].filter(Boolean).sort()[0];
    out.modules[k] = {
      learn: !!(x.learn || y.learn),
      practice: !!(x.practice || y.practice),
      actions: !!(x.actions || y.actions),
      bestScore: Math.max(x.bestScore ?? 0, y.bestScore ?? 0),
      passed: !!(x.passed || y.passed),
      ...(passedAt ? { passedAt } : {}),
    };
  }
  const fa = a?.finalExam, fb = b?.finalExam;
  if (fa || fb) {
    const passedAt = [fa?.passedAt, fb?.passedAt].filter(Boolean).sort()[0];
    out.finalExam = {
      bestScore: Math.max(fa?.bestScore ?? 0, fb?.bestScore ?? 0),
      passed: !!(fa?.passed || fb?.passed),
      ...(passedAt ? { passedAt } : {}),
    };
  }
  out.lastModuleKey = b?.lastModuleKey ?? a?.lastModuleKey ?? null;
  out.certificateId = b?.certificateId ?? a?.certificateId ?? null;
  return out;
}

// Record a finished quiz attempt, keeping the best score.
export function recordModuleScore(progress, key, score, passMark) {
  const mp = moduleProgress(progress, key);
  const passed = mp.passed || score >= passMark;
  return {
    ...progress,
    lastModuleKey: key,
    modules: {
      ...progress.modules,
      [key]: {
        ...mp,
        bestScore: Math.max(mp.bestScore ?? 0, score),
        passed,
        ...(passed && !mp.passedAt ? { passedAt: new Date().toISOString() } : {}),
      },
    },
  };
}

export function recordStep(progress, key, step) {
  const mp = moduleProgress(progress, key);
  return { ...progress, lastModuleKey: key, modules: { ...progress.modules, [key]: { ...mp, [step]: true } } };
}

export function recordFinalScore(progress, score, passMark) {
  const fe = progress.finalExam ?? {};
  const passed = fe.passed || score >= passMark;
  return {
    ...progress,
    finalExam: {
      bestScore: Math.max(fe.bestScore ?? 0, score),
      passed,
      ...(passed && !fe.passedAt ? { passedAt: new Date().toISOString() } : fe.passedAt ? { passedAt: fe.passedAt } : {}),
    },
  };
}
