import React from 'react';
import { Mail, MessageSquare, BookOpen, Play, ArrowRight, Monitor, Printer, ArrowLeft, ShoppingCart, Award } from 'lucide-react';
import { useGo } from '../../routes.js';

// ---- Training Lab Home ----
export default function TrainingLabHome({ categories, examples, quizQuestions, navigateTo }) {
  const go = useGo();
  const totalExamples = Object.values(examples).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <>
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 rounded-full px-4 py-2 mb-4">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span className="text-blue-700 text-sm font-medium">Free Training</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Scam Spotter Training Lab</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Study real-world scam examples, learn how to spot the red flags, and test your knowledge with interactive quizzes.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalExamples}</p>
          <p className="text-sm text-slate-600">Real Examples</p>
        </div>
        <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">4</p>
          <p className="text-sm text-slate-600">Scam Categories</p>
        </div>
        <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{quizQuestions.length}</p>
          <p className="text-sm text-slate-600">Quiz Questions</p>
        </div>
        <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-orange-600"><Printer className="w-6 h-6 inline" /></p>
          <p className="text-sm text-slate-600">Print-Friendly</p>
        </div>
      </div>

      {/* Take the Test CTA */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 sm:p-8 text-white mb-10 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Award className="w-8 h-8" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold mb-2">Test Your Scam-Spotting Skills</h2>
            <p className="text-orange-100">
              Think you can spot a scam? Take our interactive quiz with {quizQuestions.length} real-world questions across all categories.
            </p>
          </div>
          <button
            onClick={() => navigateTo('quiz')}
            className="px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all shadow-lg flex items-center gap-2 flex-shrink-0"
          >
            <Play className="w-5 h-5" /> Start Quiz
          </button>
        </div>
      </div>

      {/* Category Cards */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Browse by Category</h2>
      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => navigateTo('category', cat.key)}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all text-left group"
          >
            <div className={`bg-gradient-to-r ${cat.color} p-5 text-white`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{cat.label}</h3>
                  <p className="text-white/80 text-sm">{examples[cat.key]?.length || 0} examples</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-slate-600 mb-3">{cat.description}</p>
              <span className="text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore Examples <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Access - Recent Examples */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Examples</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {Object.entries(examples).flatMap(([catKey, items]) =>
          items.slice(0, 2).map(item => ({ ...item, catKey }))
        ).slice(0, 6).map((item) => (
          <ExampleCard
            key={item.id}
            example={item}
            onClick={() => navigateTo('detail', item.catKey, item)}
          />
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => go('landing')}
          className="text-slate-500 hover:text-slate-700 flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>
    </>
  );
}

// ---- Example Card (compact) ----
function ExampleCard({ example, onClick }) {
  const typeConfig = {
    email: { icon: <Mail className="w-4 h-4" />, bg: 'bg-blue-100 text-blue-700' },
    text: { icon: <MessageSquare className="w-4 h-4" />, bg: 'bg-green-100 text-green-700' },
    marketplace: { icon: <ShoppingCart className="w-4 h-4" />, bg: 'bg-purple-100 text-purple-700' },
    popup: { icon: <Monitor className="w-4 h-4" />, bg: 'bg-red-100 text-red-700' }
  };
  const tc = typeConfig[example.type] || typeConfig.email;
  const diffColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700'
  };

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow border border-slate-200 p-4 hover:shadow-lg hover:border-blue-300 transition-all text-left w-full"
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tc.bg} flex items-center gap-1`}>
          {tc.icon} {example.type}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${diffColors[example.difficulty] || ''}`}>
          {example.difficulty}
        </span>
        {example.isScam ? (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">SCAM</span>
        ) : (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">LEGIT</span>
        )}
      </div>
      <h3 className="font-bold text-slate-800 mb-1 text-sm">{example.title}</h3>
      <p className="text-xs text-slate-500 font-mono truncate">From: {example.sender}</p>
    </button>
  );
}
