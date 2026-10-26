import React, { useState } from 'react';
import { CheckCircle, XCircle, Award, RotateCcw, ArrowRight } from 'lucide-react';

// One question at a time, an explanation after every answer, no timer, unlimited retakes.
// Used for each module's Quick Check and for the final exam.
export default function QuizRunner({ questions, passMark, title, onFinish, passedAction, retryLabel = 'Try Again' }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const q = questions[index];
  const answered = selected !== null;

  const choose = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswers([...answers, i === q.correctAnswer]);
  };

  const next = async () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setSelected(null);
      return;
    }
    const correct = answers.filter(Boolean).length;
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= passMark;
    setResult({ correct, score, passed });
    await onFinish?.(score, passed);
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setResult(null);
  };

  if (result) {
    const missed = questions.map((qq, i) => ({ qq, ok: answers[i] })).filter((x) => !x.ok);
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8" role="status">
        <div className="text-center mb-6">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${result.passed ? 'bg-green-100' : 'bg-amber-100'}`}>
            {result.passed ? <Award className="w-10 h-10 text-green-700" /> : <RotateCcw className="w-10 h-10 text-amber-700" />}
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">{result.passed ? 'You passed!' : 'Almost there!'}</h2>
          <p className="text-xl text-slate-700">
            You got <strong>{result.correct} of {questions.length}</strong> right ({result.score}%).
          </p>
          <p className="text-lg text-slate-600 mt-2">
            {result.passed
              ? 'Great job spotting the scams.'
              : `You need ${passMark}% to pass. Review the answers below and try again. You can retake it as many times as you like.`}
          </p>
        </div>

        {missed.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-3">Questions to review</h3>
            <div className="space-y-3">
              {missed.map(({ qq }) => (
                <div key={qq.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-lg font-semibold text-slate-800 mb-2">{qq.question}</p>
                  <p className="text-base text-green-800 mb-1"><strong>Answer:</strong> {qq.options[qq.correctAnswer]}</p>
                  <p className="text-base text-slate-700">{qq.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {result.passed ? (
            passedAction
          ) : (
            <button type="button" onClick={restart} className="flex-1 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" /> {retryLabel}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-slate-100 px-6 py-4 border-b">
        <div className="flex justify-between items-center mb-2 gap-4">
          <span className="text-lg font-semibold text-slate-700">{title}</span>
          <span className="text-lg text-slate-700">Question {index + 1} of {questions.length}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3" aria-hidden="true">
          <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 leading-relaxed">{q.question}</h3>
        <div className="space-y-3 mb-6" role="group" aria-label="Answer choices">
          {q.options.map((option, i) => {
            const isCorrect = i === q.correctAnswer;
            const isChosen = i === selected;
            let style = 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50';
            if (answered) {
              style = isCorrect ? 'border-green-600 bg-green-50' : isChosen ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50 opacity-70';
            }
            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                disabled={answered}
                className={`w-full p-4 min-h-[56px] rounded-xl border-2 ${style} flex items-start gap-3 text-left transition-colors`}
              >
                <span className="w-8 h-8 rounded-full border-2 border-slate-400 flex items-center justify-center text-base font-bold text-slate-700 flex-shrink-0">
                  {answered && isCorrect ? <CheckCircle className="w-6 h-6 text-green-700" /> : answered && isChosen ? <XCircle className="w-6 h-6 text-red-600" /> : String.fromCharCode(65 + i)}
                </span>
                <span className="text-lg text-slate-800 pt-0.5">{option}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div role="status" className={`p-5 rounded-xl mb-4 border-2 ${selected === q.correctAnswer ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <p className={`text-lg font-bold mb-1 ${selected === q.correctAnswer ? 'text-green-800' : 'text-amber-900'}`}>
              {selected === q.correctAnswer ? 'Correct!' : 'Not quite.'}
            </p>
            <p className="text-lg text-slate-800">{q.explanation}</p>
          </div>
        )}

        {answered && (
          <button type="button" onClick={next} className="w-full py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">
            {index < questions.length - 1 ? 'Next Question' : 'See My Score'} <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
