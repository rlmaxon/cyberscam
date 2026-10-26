import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Lock, ArrowRight, Award, BookOpen, Clock, PlayCircle, Info } from 'lucide-react';
import { PATHS } from '../../routes.js';
import { useMember } from '../../member/MemberContext.jsx';
import { useProgress } from '../../member/useProgressState.js';
import { useTrainingData } from '../../training/content.js';
import { ModuleIcon } from '../../training/exampleTypes.jsx';
import {
  moduleProgress, moduleStatus, passedCount, currentModuleIndex, stepsDone, nextStep, hasAnyProgress, allModulesPassed,
} from '../../training/progress.js';
import { LoadingBlock, ErrorBlock } from '../../components/learn/LearnParts.jsx';

export default function LearningPath() {
  const { modules, loading, error } = useTrainingData();
  const { progress } = useProgress();
  const { isLoggedIn, profile } = useMember();

  if (loading) return <LoadingBlock text="Loading your training…" />;
  if (error) return <ErrorBlock />;

  const done = passedCount(progress, modules);
  const currentIdx = currentModuleIndex(progress, modules);
  const current = currentIdx !== null ? modules[currentIdx] : null;
  const currentMp = current ? moduleProgress(progress, current.key) : {};
  const started = hasAnyProgress(progress);
  const allDone = allModulesPassed(progress, modules);
  const finalPassed = !!progress.finalExam?.passed;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Your Scam-Safety Training</h1>
          <p className="text-xl text-slate-600">
            {modules.length} short lessons, about 10 minutes each. Go at your own pace. There are no time limits.
          </p>
        </header>

        {/* Progress summary + the one big next step */}
        <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 mb-6" aria-labelledby="progress-heading">
          <h2 id="progress-heading" className="sr-only">Your progress</h2>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xl font-bold text-slate-800">
              {allDone ? `All ${modules.length} lessons complete!` : current ? `Your Training: Step ${current.number} of ${modules.length}` : ''}
            </p>
            <p className="text-lg text-slate-600">{done} of {modules.length} done</p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4 mb-6" role="progressbar" aria-valuemin={0} aria-valuemax={modules.length} aria-valuenow={done} aria-label="Lessons completed">
            <div className="bg-green-600 h-4 rounded-full transition-all" style={{ width: `${(done / modules.length) * 100}%` }} />
          </div>

          {current && (
            <>
              {started && (
                <p className="text-lg text-slate-700 mb-3">
                  Welcome back{profile?.displayName ? `, ${profile.displayName}` : ''}! Pick up where you left off.
                </p>
              )}
              <Link
                to={`${PATHS.learn}/${current.key}/${nextStep(currentMp)}`}
                className="w-full py-5 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xl font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg flex items-center justify-center gap-3 text-center"
              >
                <PlayCircle className="w-7 h-7 flex-shrink-0" />
                {started ? 'Continue' : 'Start'}: Lesson {current.number}, {current.title}
              </Link>
            </>
          )}
          {allDone && (
            <Link
              to={finalPassed ? PATHS.certificate : PATHS.finalExam}
              className="w-full py-5 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg flex items-center justify-center gap-3"
            >
              <Award className="w-7 h-7" /> {finalPassed ? 'View My Certificate' : 'Take the Final Exam'}
            </Link>
          )}
        </section>

        {!isLoggedIn && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mb-6 flex gap-3" role="note">
            <Info className="w-6 h-6 text-blue-700 flex-shrink-0 mt-0.5" />
            <div className="text-lg text-blue-900">
              <p className="mb-2">You're learning as a guest, so your progress is saved on this device only.</p>
              <p>
                <Link to={PATHS.signup} className="font-bold underline">Create a free account</Link> to save your progress everywhere and earn a
                certificate when you finish. Already have one? <Link to={PATHS.login} state={{ from: PATHS.learn }} className="font-bold underline">Sign in</Link>.
              </p>
            </div>
          </div>
        )}

        {/* All lessons */}
        <section aria-labelledby="lessons-heading">
          <h2 id="lessons-heading" className="text-2xl font-bold text-slate-800 mb-4">All Lessons</h2>
          <ol className="space-y-3">
            {modules.map((m, i) => {
              const status = moduleStatus(progress, modules, i);
              const mp = moduleProgress(progress, m.key);
              return (
                <li key={m.key}>
                  <ModuleRow module={m} status={status} steps={stepsDone(mp)} score={mp.bestScore} total={modules.length} />
                </li>
              );
            })}
            <li>
              <FinalExamRow allDone={allDone} passed={finalPassed} score={progress.finalExam?.bestScore} />
            </li>
          </ol>
        </section>

        <div className="mt-8 text-center">
          <Link to={PATHS.training} className="inline-flex items-center gap-2 text-lg text-blue-700 font-semibold hover:underline">
            <BookOpen className="w-5 h-5" /> Browse every scam example in the Example Library
          </Link>
        </div>
      </div>
    </div>
  );
}

function ModuleRow({ module: m, status, steps, score }) {
  const locked = status === 'locked';
  const statusText = {
    completed: `Completed${score ? `, score ${score}%` : ''}`,
    'in-progress': `In progress: ${steps} of 4 steps done`,
    ready: 'Ready to start',
    locked: 'Locked: finish the lesson before this one',
  }[status];
  const statusIcon = {
    completed: <CheckCircle className="w-7 h-7 text-green-600" />,
    'in-progress': <PlayCircle className="w-7 h-7 text-orange-500" />,
    ready: <PlayCircle className="w-7 h-7 text-blue-600" />,
    locked: <Lock className="w-7 h-7 text-slate-400" />,
  }[status];

  const body = (
    <div className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 ${locked ? 'bg-slate-100 border-slate-200' : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md transition-all'}`}>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${locked ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-700'}`}>
        <ModuleIcon iconKey={m.iconKey} className="w-7 h-7" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-lg sm:text-xl font-bold ${locked ? 'text-slate-500' : 'text-slate-800'}`}>{m.number}. {m.title}</p>
        <p className={`text-base ${locked ? 'text-slate-500' : 'text-slate-600'}`}>{m.summary}</p>
        <p className="text-base text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {m.minutes} min</span>
          <span aria-hidden="true">·</span>
          <span>{statusText}</span>
        </p>
      </div>
      <div className="flex-shrink-0">{statusIcon}</div>
    </div>
  );

  return locked ? <div aria-disabled="true">{body}</div> : <Link to={`${PATHS.learn}/${m.key}`} className="block">{body}</Link>;
}

function FinalExamRow({ allDone, passed, score }) {
  const body = (
    <div className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 ${allDone ? 'bg-green-50 border-green-300 hover:shadow-md' : 'bg-slate-100 border-slate-200'}`}>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${allDone ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
        <Award className="w-7 h-7" />
      </div>
      <div className="flex-1">
        <p className={`text-lg sm:text-xl font-bold ${allDone ? 'text-slate-800' : 'text-slate-500'}`}>Final Exam & Certificate</p>
        <p className="text-base text-slate-600">
          {passed ? `Passed${score ? ` with ${score}%` : ''}. Your certificate is ready.` : allDone ? '16 questions covering all lessons. Pass to earn your certificate.' : 'Unlocks after you finish all 8 lessons.'}
        </p>
      </div>
      <div className="flex-shrink-0">{passed ? <CheckCircle className="w-7 h-7 text-green-600" /> : allDone ? <ArrowRight className="w-7 h-7 text-green-700" /> : <Lock className="w-7 h-7 text-slate-400" />}</div>
    </div>
  );
  return allDone ? <Link to={passed ? PATHS.certificate : PATHS.finalExam} className="block">{body}</Link> : <div aria-disabled="true">{body}</div>;
}
