import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, Search, ListChecks, ClipboardCheck, CheckCircle, Lock, Lightbulb, Printer,
  ShieldAlert, ShieldCheck, XCircle, Award, UserPlus,
} from 'lucide-react';
import config from '../../config.json';
import { PATHS } from '../../routes.js';
import { useMember } from '../../member/MemberContext.jsx';
import { useProgress } from '../../member/useProgressState.js';
import { useTrainingData } from '../../training/content.js';
import { ExampleMessage, ModuleIcon } from '../../training/exampleTypes.jsx';
import {
  STEPS, isStepDone, isUnlocked, moduleProgress, nextStep, recordModuleScore, recordStep,
} from '../../training/progress.js';
import QuizRunner from '../../components/learn/QuizRunner.jsx';
import { BigButton, ErrorBlock, LoadingBlock } from '../../components/learn/LearnParts.jsx';

const STEP_INFO = {
  learn: { label: 'Learn', Icon: BookOpen },
  practice: { label: 'Spot the Red Flags', Icon: Search },
  actions: { label: 'What To Do', Icon: ListChecks },
  check: { label: 'Quick Check', Icon: ClipboardCheck },
};

export default function ModulePage() {
  const { moduleKey, step: stepParam } = useParams();
  const navigate = useNavigate();
  const { progress, update } = useProgress();
  const { modules, quiz, examples, loading, error } = useTrainingData({ quiz: true, examplesFor: moduleKey });

  const index = modules.findIndex((m) => m.key === moduleKey);
  const module = modules[index];
  const mp = moduleProgress(progress, moduleKey);

  if (loading) return <LoadingBlock text="Loading lesson…" />;
  if (error) return <ErrorBlock />;
  if (!module) return <Navigate to={PATHS.learn} replace />;

  if (!isUnlocked(progress, modules, index)) {
    const prev = modules[index - 1];
    return (
      <Shell>
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-3">Lesson {module.number} isn't open yet</h1>
          <p className="text-lg text-slate-600 mb-6">Lessons open one at a time. Finish Lesson {prev.number}, {prev.title}, to unlock this one.</p>
          <BigButton as={Link} to={`${PATHS.learn}/${prev.key}`} tone="orange">Go to Lesson {prev.number} <ArrowRight className="w-5 h-5" /></BigButton>
        </div>
      </Shell>
    );
  }

  // A step can be opened once every step before it is done.
  const firstOpen = nextStep(mp);
  const canOpen = (s) => STEPS.indexOf(s) <= STEPS.indexOf(firstOpen) || isStepDone(mp, s);
  if (!stepParam || !STEP_INFO[stepParam] || !canOpen(stepParam)) {
    return <Navigate to={`${PATHS.learn}/${moduleKey}/${firstOpen}`} replace />;
  }
  const step = stepParam;

  const go = (s) => navigate(`${PATHS.learn}/${moduleKey}/${s}`);
  const completeStep = (s, then) => {
    update((p) => recordStep(p, moduleKey, s));
    go(then);
  };

  const questions = quiz.filter((q) => q.category === moduleKey);
  const nextModule = modules[index + 1];

  return (
    <Shell>
      <Link to={PATHS.learn} className="inline-flex items-center gap-2 text-lg text-slate-700 hover:text-blue-700 mb-4 font-medium">
        <ArrowLeft className="w-5 h-5" /> All lessons
      </Link>

      <header className="bg-white rounded-2xl shadow border border-slate-200 p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
            <ModuleIcon iconKey={module.iconKey} className="w-7 h-7" />
          </div>
          <div>
            <p className="text-base font-semibold text-blue-700">Lesson {module.number} of {modules.length}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{module.title}</h1>
          </div>
        </div>
        <nav aria-label="Lesson steps">
          <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STEPS.map((s, i) => {
              const { label, Icon } = STEP_INFO[s];
              const done = isStepDone(mp, s);
              const active = s === step;
              const open = canOpen(s);
              const cls = active
                ? 'bg-blue-600 text-white border-blue-600'
                : done
                  ? 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100'
                  : open
                    ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    : 'bg-slate-100 text-slate-400 border-slate-200';
              return (
                <li key={s}>
                  <button
                    type="button"
                    disabled={!open}
                    onClick={() => go(s)}
                    aria-current={active ? 'step' : undefined}
                    className={`w-full min-h-[56px] px-3 py-2 rounded-xl border-2 text-base font-semibold flex items-center gap-2 ${cls}`}
                  >
                    {done && !active ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <Icon className="w-5 h-5 flex-shrink-0" />}
                    <span className="text-left leading-tight">{i + 1}. {label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </header>

      {step === 'learn' && <LessonStep module={module} onDone={() => completeStep('learn', 'practice')} />}
      {step === 'practice' && (
        <PracticeStep
          key={moduleKey}
          items={module.practice.map((id) => (examples[moduleKey] || []).find((e) => e.id === id)).filter(Boolean)}
          onDone={() => completeStep('practice', 'actions')}
        />
      )}
      {step === 'actions' && <ActionsStep module={module} onDone={() => completeStep('actions', 'check')} />}
      {step === 'check' && (
        <CheckStep
          key={moduleKey}
          module={module}
          questions={questions}
          nextModule={nextModule}
          onFinish={(score) => update((p) => recordModuleScore(p, moduleKey, score, config.training.passMark))}
        />
      )}
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">{children}</div>
    </div>
  );
}

function Card({ children }) {
  return <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">{children}</div>;
}

// ---- Step 1: Learn ----
function LessonStep({ module, onDone }) {
  const { lesson } = module;
  return (
    <Card>
      <h2 className="sr-only">Learn</h2>
      <p className="text-xl text-slate-800 leading-relaxed mb-6">{lesson.intro}</p>
      {lesson.sections.map((s) => (
        <section key={s.heading} className="mb-6">
          <h3 className="text-2xl font-bold text-slate-800 mb-3">{s.heading}</h3>
          {s.paragraphs?.map((p, i) => <p key={i} className="text-lg text-slate-700 leading-relaxed mb-3">{p}</p>)}
          {s.bullets?.length > 0 && (
            <ul className="space-y-2 mt-2">
              {s.bullets.map((b) => (
                <li key={b} className="flex gap-3 text-lg text-slate-700">
                  <span className="mt-2 w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 mb-8 flex gap-3">
        <Lightbulb className="w-7 h-7 text-amber-600 flex-shrink-0" />
        <p className="text-xl font-semibold text-amber-900"><span className="sr-only">Remember: </span>{lesson.keyPoint}</p>
      </div>
      <BigButton tone="orange" onClick={onDone}>Next: Spot the Red Flags <ArrowRight className="w-5 h-5" /></BigButton>
    </Card>
  );
}

// ---- Step 2: Spot the Red Flags ("Scam or Safe?") ----
function PracticeStep({ items, onDone }) {
  const [i, setI] = useState(0);
  const [guess, setGuess] = useState(null); // 'scam' | 'safe'
  const [right, setRight] = useState(0);
  const ex = items[i];

  useEffect(() => { window.scrollTo(0, 0); }, [i]);

  if (!ex) return <Card><p className="text-lg">No practice examples for this lesson yet.</p><div className="mt-6"><BigButton tone="orange" onClick={onDone}>Next: What To Do <ArrowRight className="w-5 h-5" /></BigButton></div></Card>;

  const answered = guess !== null;
  const correct = answered && (guess === 'scam') === ex.isScam;
  const last = i === items.length - 1;

  const choose = (g) => {
    if (answered) return;
    setGuess(g);
    if ((g === 'scam') === ex.isScam) setRight((r) => r + 1);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-2xl font-bold text-slate-800">Scam or Safe?</h2>
        <p className="text-lg text-slate-600">Example {i + 1} of {items.length}</p>
      </div>
      <p className="text-lg text-slate-700 mb-4">Read this message carefully. Is it a scam, or is it safe?</p>

      <ExampleMessage example={ex} />

      {!answered ? (
        <div className="grid sm:grid-cols-2 gap-3 mt-6" role="group" aria-label="Your answer">
          <BigButton tone="white" onClick={() => choose('scam')} className="border-red-300 text-red-800 hover:bg-red-50">
            <ShieldAlert className="w-6 h-6" /> It's a Scam
          </BigButton>
          <BigButton tone="white" onClick={() => choose('safe')} className="border-green-300 text-green-800 hover:bg-green-50">
            <ShieldCheck className="w-6 h-6" /> It's Safe
          </BigButton>
        </div>
      ) : (
        <div className="mt-6 space-y-4" role="status">
          <div className={`p-5 rounded-xl border-2 ${correct ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'}`}>
            <p className={`text-xl font-bold mb-1 ${correct ? 'text-green-800' : 'text-amber-900'}`}>
              {correct ? 'You got it!' : 'Good try.'} {ex.isScam ? 'This is a scam.' : 'This one is safe.'}
            </p>
            <p className="text-lg text-slate-800">{ex.explanation}</p>
          </div>
          {ex.redFlags?.length > 0 && (
            <div className="p-5 rounded-xl bg-red-50 border-2 border-red-200">
              <p className="text-lg font-bold text-red-800 mb-2">Red flags</p>
              <ul className="space-y-2">
                {ex.redFlags.map((f) => (
                  <li key={f} className="flex gap-2 text-lg text-red-900"><XCircle className="w-5 h-5 flex-shrink-0 mt-1" /> {f}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="p-5 rounded-xl bg-blue-50 border-2 border-blue-200">
            <p className="text-lg font-bold text-blue-800 mb-1">How to protect yourself</p>
            <p className="text-lg text-blue-900">{ex.howToSpot}</p>
          </div>
          {last ? (
            <>
              <p className="text-xl text-center text-slate-800 pt-2">You spotted <strong>{right} of {items.length}</strong> correctly.</p>
              <BigButton tone="orange" onClick={onDone}>Next: What To Do <ArrowRight className="w-5 h-5" /></BigButton>
            </>
          ) : (
            <BigButton onClick={() => { setI(i + 1); setGuess(null); }}>Next Example <ArrowRight className="w-5 h-5" /></BigButton>
          )}
        </div>
      )}
    </Card>
  );
}

// ---- Step 3: What To Do ----
function ActionsStep({ module, onDone }) {
  const [checked, setChecked] = useState({});
  return (
    <Card>
      <div className="print-card">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">What To Do: {module.title}</h2>
        <p className="text-lg text-slate-700 mb-5">If this ever happens to you, follow these steps. Tick each one as you read it.</p>
        <ul className="space-y-3 mb-6">
          {module.actions.map((a, i) => (
            <li key={a}>
              <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer ${checked[i] ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="checkbox" checked={!!checked[i]} onChange={(e) => setChecked({ ...checked, [i]: e.target.checked })} className="mt-1 w-6 h-6 accent-green-600 flex-shrink-0" />
                <span className="text-lg text-slate-800">{a}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-lg text-slate-700">
          Need help now? See the <Link to={PATHS.emergency} className="text-blue-700 font-semibold underline">Emergency Directory</Link> for
          numbers to call, including the AARP Fraud Watch Helpline (877-908-3360).
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <BigButton tone="white" onClick={() => window.print()} className="no-print sm:w-auto"><Printer className="w-5 h-5" /> Print this list</BigButton>
        <BigButton tone="orange" onClick={onDone} className="no-print">Next: Quick Check <ArrowRight className="w-5 h-5" /></BigButton>
      </div>
    </Card>
  );
}

// ---- Step 4: Quick Check ----
function CheckStep({ module, questions, nextModule, onFinish }) {
  const { isLoggedIn } = useMember();
  const passedAction = nextModule ? (
    <BigButton as={Link} to={`${PATHS.learn}/${nextModule.key}`} tone="orange">
      Start Lesson {nextModule.number}: {nextModule.title} <ArrowRight className="w-5 h-5" />
    </BigButton>
  ) : isLoggedIn ? (
    <BigButton as={Link} to={PATHS.finalExam} tone="green"><Award className="w-6 h-6" /> Take the Final Exam</BigButton>
  ) : (
    <div className="w-full space-y-3">
      <p className="text-lg text-slate-700 text-center">You've finished all 8 lessons! Create a free account to take the final exam and get your certificate. Your progress comes with you.</p>
      <BigButton as={Link} to={PATHS.signup} tone="green"><UserPlus className="w-6 h-6" /> Create a Free Account</BigButton>
    </div>
  );
  const intro = useMemo(() => `${questions.length} questions. You need ${config.training.passMark}% to pass, and you can retake it as often as you like.`, [questions.length]);
  return (
    <div>
      <p className="text-lg text-slate-700 mb-4">{intro}</p>
      <QuizRunner questions={questions} passMark={config.training.passMark} title={`Quick Check: ${module.title}`} onFinish={onFinish} passedAction={passedAction} />
    </div>
  );
}
