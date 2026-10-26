import { moduleProgress, passedCount } from './progress.js';

// Badge names for each lesson (by lesson key)
const LESSON_BADGES = {
  mindset: { name: 'Ready to Hang Up', description: 'Finished Start Here: Why Scams Work' },
  email: { name: 'Phishing Spotter', description: 'Passed the Phishing Emails lesson' },
  text: { name: 'Text Detective', description: 'Passed the Text Message Scams lesson' },
  phone: { name: 'Phone Scam Stopper', description: 'Passed the Phone & Voice Scams lesson' },
  popup: { name: 'Pop-up Proof', description: 'Passed the Tech-Support Pop-ups lesson' },
  government: { name: 'Impostor Spotter', description: 'Passed the Government Impostor Scams lesson' },
  marketplace: { name: 'Smart Shopper', description: 'Passed the Online Marketplace Scams lesson' },
  romance: { name: 'Heart Guard', description: 'Passed the Romance Scams lesson' },
  investment: { name: 'Money Protector', description: 'Passed the Investment & Crypto Scams lesson' },
};

// Every badge, in display order, with how to earn it and whether it's earned.
// familyPlanTotal: number of steps in the Family Safety Plan.
export function allBadges(progress, modules, familyPlanTotal = 0) {
  const done = passedCount(progress, modules);
  const scores = [
    ...modules.map((m) => moduleProgress(progress, m.key).bestScore ?? 0),
    progress.finalExam?.bestScore ?? 0,
  ];
  const weeks = Object.keys(progress.weekly ?? {}).length;
  const planDone = familyPlanTotal > 0 && Object.values(progress.familyPlan ?? {}).filter(Boolean).length >= familyPlanTotal;
  const half = Math.ceil(modules.length / 2);

  return [
    { id: 'first-step', name: 'First Step', description: 'Passed your first lesson', how: 'Pass any lesson', icon: 'footprints', earned: done >= 1 },
    ...modules.map((m) => ({
      id: `lesson-${m.key}`,
      name: LESSON_BADGES[m.key]?.name ?? `${m.title} Badge`,
      description: LESSON_BADGES[m.key]?.description ?? `Passed ${m.title}`,
      how: `Pass "${m.title}"`,
      icon: m.iconKey,
      earned: !!moduleProgress(progress, m.key).passed,
    })),
    { id: 'halfway', name: 'Halfway There', description: `Passed ${half} lessons`, how: `Pass ${half} lessons`, icon: 'flag', earned: done >= half },
    { id: 'sharp-eye', name: 'Sharp Eye', description: 'Scored 100% on a quiz', how: 'Get every question right on any Quick Check or the final exam', icon: 'eye', earned: scores.some((s) => s === 100) },
    { id: 'weekly-watcher', name: 'Weekly Watcher', description: `Tried ${weeks} Scam of the Week challenge${weeks === 1 ? '' : 's'}`, how: 'Try a Scam of the Week challenge', icon: 'calendar', earned: weeks >= 1 },
    { id: 'family-safe', name: 'Family Safe', description: 'Finished the Family Safety Plan', how: 'Complete every step of the Family Safety Plan', icon: 'home', earned: planDone },
    { id: 'scam-buster', name: 'Scam Buster', description: 'Passed the final exam and earned the certificate', how: 'Pass the final exam', icon: 'award', earned: !!progress.finalExam?.passed },
  ];
}

export const earnedBadgeIds = (badges) => badges.filter((b) => b.earned).map((b) => b.id);
