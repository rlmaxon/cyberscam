import React, { useState } from 'react';
import { AlertTriangle, Mail, MessageSquare, CheckCircle, XCircle, BookOpen, Play, Monitor, Printer, ArrowLeft, ShoppingCart, Award, RotateCcw } from 'lucide-react';

// ---- Quiz / Test View ----
export default function TrainingLabQuiz({ questions, navigateTo }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  const filteredQuestions = categoryFilter === 'all'
    ? questions
    : questions.filter(q => q.category === categoryFilter);

  const activeQuestions = filteredQuestions;

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setAnswered(false);
    setAnswers([]);
    setReviewMode(false);
  };

  const handleAnswer = (answerIndex) => {
    if (answered) return;
    setSelectedAnswer(answerIndex);
    setAnswered(true);
    const isCorrect = answerIndex === activeQuestions[currentQuestion].correctAnswer;
    if (isCorrect) setScore(score + 1);
    setAnswers([...answers, { questionIndex: currentQuestion, selected: answerIndex, correct: isCorrect }]);
  };

  const nextQuestion = () => {
    if (currentQuestion < activeQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setAnswered(false);
    setAnswers([]);
    setReviewMode(false);
  };

  const handlePrintResults = () => {
    window.print();
  };

  // Quiz Start / Category Selection
  if (!quizStarted) {
    return (
      <>
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Training Lab
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Scam Spotter Quiz</h1>
            <p className="text-orange-100">Test your knowledge with real-world multiple choice questions</p>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Choose Your Quiz</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { key: 'all', label: 'All Categories', count: questions.length, icon: <BookOpen className="w-5 h-5" />, color: 'border-blue-300 bg-blue-50' },
                { key: 'email', label: 'Email Scams', count: questions.filter(q => q.category === 'email').length, icon: <Mail className="w-5 h-5" />, color: 'border-blue-300 bg-blue-50' },
                { key: 'text', label: 'Text Scams', count: questions.filter(q => q.category === 'text').length, icon: <MessageSquare className="w-5 h-5" />, color: 'border-green-300 bg-green-50' },
                { key: 'popup', label: 'Pop-up Scams', count: questions.filter(q => q.category === 'popup').length, icon: <Monitor className="w-5 h-5" />, color: 'border-red-300 bg-red-50' },
                { key: 'marketplace', label: 'Marketplace Scams', count: questions.filter(q => q.category === 'marketplace').length, icon: <ShoppingCart className="w-5 h-5" />, color: 'border-purple-300 bg-purple-50' }
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setCategoryFilter(opt.key)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    categoryFilter === opt.key
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600">{opt.icon}</span>
                    <div>
                      <p className="font-bold text-slate-800">{opt.label}</p>
                      <p className="text-sm text-slate-500">{opt.count} questions</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredQuestions.length > 0 ? (
              <button
                onClick={handleStartQuiz}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg text-lg flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" /> Start Quiz ({filteredQuestions.length} Questions)
              </button>
            ) : (
              <p className="text-center text-slate-500 py-4">No questions available for this category yet.</p>
            )}
          </div>
        </div>
      </>
    );
  }

  // Review Mode
  if (reviewMode) {
    const reviewQ = activeQuestions[reviewIndex];
    const reviewA = answers[reviewIndex];

    return (
      <>
        <button
          onClick={() => setReviewMode(false)}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 font-medium transition-colors no-print"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Results
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-100 px-6 py-4 border-b flex justify-between items-center">
            <span className="font-medium text-slate-700">Review: Question {reviewIndex + 1} of {activeQuestions.length}</span>
            <span className={`font-bold ${reviewA.correct ? 'text-green-600' : 'text-red-600'}`}>
              {reviewA.correct ? 'Correct' : 'Incorrect'}
            </span>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">{reviewQ.question}</h3>

            <div className="space-y-3 mb-6">
              {reviewQ.options.map((option, idx) => {
                const isCorrect = idx === reviewQ.correctAnswer;
                const wasSelected = idx === reviewA.selected;
                let style = 'border-slate-200 bg-white';
                if (isCorrect) style = 'border-green-500 bg-green-50';
                else if (wasSelected && !isCorrect) style = 'border-red-500 bg-red-50';

                return (
                  <div key={idx} className={`p-4 rounded-xl border-2 ${style} flex items-start gap-3`}>
                    <span className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-slate-800 pt-1">{option}</span>
                    {isCorrect && <CheckCircle className="w-5 h-5 text-green-600 ml-auto flex-shrink-0 mt-1" />}
                    {wasSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 ml-auto flex-shrink-0 mt-1" />}
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="font-bold text-blue-800 mb-1">Explanation:</p>
              <p className="text-blue-700">{reviewQ.explanation}</p>
            </div>

            <div className="flex gap-3 mt-6 no-print">
              <button
                onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
                disabled={reviewIndex === 0}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setReviewIndex(Math.min(activeQuestions.length - 1, reviewIndex + 1))}
                disabled={reviewIndex === activeQuestions.length - 1}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Results View
  if (showResult) {
    const percentage = Math.round((score / activeQuestions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="print-card">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-orange-100'}`}>
            {passed ? (
              <Award className="w-12 h-12 text-green-600" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-orange-600" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {passed ? 'Great Job!' : 'Keep Practicing!'}
          </h2>
          <p className="text-5xl font-bold mb-2">
            <span className={passed ? 'text-green-600' : 'text-orange-600'}>{percentage}%</span>
          </p>
          <p className="text-slate-600 mb-2">
            You scored <strong className="text-blue-600">{score}</strong> out of <strong>{activeQuestions.length}</strong>
          </p>
          <p className="text-sm text-slate-500 mb-8">
            {passed
              ? "You have strong scam-detection skills. Stay vigilant and keep learning!"
              : "Don't worry — recognizing scams is a skill that improves with practice. Review the answers below and try again!"}
          </p>

          {/* Answer Summary */}
          <div className="text-left mb-8">
            <h3 className="font-bold text-slate-800 mb-4 text-lg">Answer Summary</h3>
            <div className="space-y-2">
              {answers.map((a, idx) => (
                <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${a.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                  {a.correct ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <span className="text-sm text-slate-700 flex-1">
                    Q{idx + 1}: {activeQuestions[idx].question.substring(0, 80)}...
                  </span>
                  <button
                    onClick={() => { setReviewMode(true); setReviewIndex(idx); }}
                    className="text-blue-600 text-sm font-medium hover:underline no-print"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 no-print">
            <button
              onClick={resetQuiz}
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> Try Again
            </button>
            <button
              onClick={handlePrintResults}
              className="flex-1 py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" /> Print Results
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="flex-1 py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> Training Lab
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz Question
  const q = activeQuestions[currentQuestion];

  return (
    <>
      <button
        onClick={() => { if (confirm('Are you sure? Your progress will be lost.')) resetQuiz(); }}
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 font-medium transition-colors no-print"
      >
        <ArrowLeft className="w-5 h-5" /> Exit Quiz
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Progress Header */}
        <div className="bg-slate-100 px-6 py-4 border-b">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-slate-700">Question {currentQuestion + 1} of {activeQuestions.length}</span>
            <span className="text-blue-600 font-bold">Score: {score}/{activeQuestions.length}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / activeQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-6">
          {/* Category Badge */}
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              q.category === 'email' ? 'bg-blue-100 text-blue-700' :
              q.category === 'text' ? 'bg-green-100 text-green-700' :
              q.category === 'popup' ? 'bg-red-100 text-red-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {q.category.toUpperCase()}
            </span>
          </div>

          {/* Question */}
          <h3 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">{q.question}</h3>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {q.options.map((option, idx) => {
              let style = 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer';
              if (answered) {
                const isCorrect = idx === q.correctAnswer;
                const wasSelected = idx === selectedAnswer;
                if (isCorrect) style = 'border-green-500 bg-green-50';
                else if (wasSelected && !isCorrect) style = 'border-red-500 bg-red-50';
                else style = 'border-slate-200 bg-slate-50 opacity-60';
              } else if (selectedAnswer === idx) {
                style = 'border-blue-500 bg-blue-50';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered}
                  className={`w-full p-4 rounded-xl border-2 ${style} flex items-start gap-3 text-left transition-all`}
                >
                  <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    answered && idx === q.correctAnswer ? 'border-green-500 text-green-600 bg-green-100' :
                    answered && idx === selectedAnswer ? 'border-red-500 text-red-600 bg-red-100' :
                    'border-slate-300 text-slate-600'
                  }`}>
                    {answered && idx === q.correctAnswer ? <CheckCircle className="w-5 h-5" /> :
                     answered && idx === selectedAnswer && idx !== q.correctAnswer ? <XCircle className="w-5 h-5" /> :
                     String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-slate-800 pt-1">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div className={`p-5 rounded-xl mb-4 ${selectedAnswer === q.correctAnswer ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
              <div className="flex items-start gap-3">
                {selectedAnswer === q.correctAnswer ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`font-bold mb-2 ${selectedAnswer === q.correctAnswer ? 'text-green-800' : 'text-red-800'}`}>
                    {selectedAnswer === q.correctAnswer ? 'Correct!' : 'Not quite right'}
                  </h4>
                  <p className={selectedAnswer === q.correctAnswer ? 'text-green-700' : 'text-red-700'}>
                    {q.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Button */}
          {answered && (
            <button
              onClick={nextQuestion}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-lg"
            >
              {currentQuestion < activeQuestions.length - 1 ? 'Next Question' : 'See My Results'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
