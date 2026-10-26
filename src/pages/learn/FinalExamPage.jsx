import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Lock, UserPlus } from 'lucide-react';
import config from '../../config.json';
import { PATHS } from '../../routes.js';
import { useMember } from '../../member/MemberContext.jsx';
import { useProgress } from '../../member/useProgressState.js';
import { useTrainingData } from '../../training/content.js';
import { allModulesPassed, passedCount, recordFinalScore } from '../../training/progress.js';
import QuizRunner from '../../components/learn/QuizRunner.jsx';
import { BigButton, ErrorBlock, LoadingBlock } from '../../components/learn/LearnParts.jsx';

export default function FinalExamPage() {
  const { isLoggedIn } = useMember();
  const { progress, update } = useProgress();
  const { modules, finalExam, loading, error } = useTrainingData({ finalExam: true });
  const [takingNow, setTakingNow] = useState(false); // so a fresh pass shows its score before moving on

  if (loading) return <LoadingBlock text="Loading the final exam…" />;
  if (error) return <ErrorBlock />;

  const ready = allModulesPassed(progress, modules);
  const passMark = config.training.finalExamPassMark;

  let body;
  if (!ready) {
    body = (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
        <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 mb-3">The final exam unlocks after all {modules.length} lessons</h1>
        <p className="text-lg text-slate-600 mb-6">You've finished {passedCount(progress, modules)} of {modules.length} so far. Keep going!</p>
        <BigButton as={Link} to={PATHS.learn} tone="orange">Back to My Lessons</BigButton>
      </div>
    );
  } else if (!isLoggedIn) {
    body = (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
        <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 mb-3">You're ready for the final exam!</h1>
        <p className="text-lg text-slate-600 mb-6">Create a free account (or sign in) so we can put your name on your certificate. Your lesson progress comes with you.</p>
        <div className="space-y-3">
          <BigButton as={Link} to={PATHS.signup} tone="green"><UserPlus className="w-6 h-6" /> Create a Free Account</BigButton>
          <BigButton as={Link} to={PATHS.login} state={{ from: PATHS.finalExam }} tone="white">I already have an account. Sign in.</BigButton>
        </div>
      </div>
    );
  } else if (progress.finalExam?.passed && !takingNow) {
    body = (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
        <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 mb-3">You've passed the final exam</h1>
        <p className="text-lg text-slate-600 mb-6">Your best score: {progress.finalExam.bestScore}%.</p>
        <BigButton as={Link} to={PATHS.certificate} tone="green"><Award className="w-6 h-6" /> View My Certificate</BigButton>
      </div>
    );
  } else {
    body = (
      <>
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Final Exam</h1>
          <p className="text-lg text-slate-700">
            {finalExam.length} questions covering all {modules.length} lessons. You need {passMark}% to earn your certificate.
            There's no timer, and you can retake it as many times as you like.
          </p>
        </header>
        <QuizRunner
          questions={finalExam}
          passMark={passMark}
          title="Final Exam"
          onFinish={(score) => { setTakingNow(true); return update((p) => recordFinalScore(p, score, passMark)); }}
          passedAction={<BigButton as={Link} to={PATHS.certificate} tone="green"><Award className="w-6 h-6" /> Get My Certificate</BigButton>}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to={PATHS.learn} className="inline-flex items-center gap-2 text-lg text-slate-700 hover:text-blue-700 mb-4 font-medium">
          <ArrowLeft className="w-5 h-5" /> All lessons
        </Link>
        {body}
      </div>
    </div>
  );
}
