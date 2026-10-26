import React from 'react';
import { AlertTriangle, Mail, MessageSquare, ChevronRight, Monitor, ArrowLeft, ShoppingCart } from 'lucide-react';
import { exampleType } from '../../training/exampleTypes.jsx';

// ---- Category Browse View ----
export default function TrainingLabCategory({ category, examples, navigateTo, difficultyFilter, setDifficultyFilter }) {
  const filtered = difficultyFilter === 'all'
    ? examples
    : examples.filter(e => e.difficulty === difficultyFilter);

  return (
    <>
      {/* Back Navigation */}
      <button
        onClick={() => navigateTo('home')}
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Training Lab
      </button>

      {/* Category Header */}
      <div className={`bg-gradient-to-r ${category.color} rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-lg`}>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            {category.icon}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{category.label}</h1>
            <p className="text-white/80">{examples.length} real-world examples to study</p>
          </div>
        </div>
        <p className="text-white/90">{category.description}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <span className="text-slate-600 font-medium py-2">Difficulty:</span>
        {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
          <button
            key={level}
            onClick={() => setDifficultyFilter(level)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              difficultyFilter === level
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
            }`}
          >
            {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      {/* Examples Grid */}
      {filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((example) => (
            <ExampleListCard
              key={example.id}
              example={example}
              onClick={() => navigateTo('detail', category.key, example)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-500">No examples found for this difficulty level.</p>
        </div>
      )}
    </>
  );
}

// ---- Example List Card (larger for browse) ----
function ExampleListCard({ example, onClick }) {
  const t = exampleType(example.type);
  const tc = { icon: <t.Icon className="w-5 h-5" />, label: t.label, bg: t.bg, headerBg: t.headerBg };

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all text-left w-full"
    >
      <div className={`px-5 py-3 border-b flex items-center justify-between ${example.isScam ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${tc.bg} flex items-center gap-1`}>
            {tc.icon} {tc.label}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            example.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
            example.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {example.difficulty}
          </span>
        </div>
        <span className={`text-xs font-bold ${example.isScam ? 'text-red-600' : 'text-green-600'}`}>
          {example.isScam ? 'SCAM' : 'LEGITIMATE'}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-slate-800 text-lg mb-2">{example.title}</h3>
        <p className="text-sm text-slate-500 font-mono mb-3 truncate">From: {example.sender}</p>
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{example.body.substring(0, 120)}...</p>
        {example.redFlags && example.redFlags.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span>{example.redFlags.length} red flags identified</span>
          </div>
        )}
        <span className="text-blue-600 font-medium flex items-center gap-1 mt-3 text-sm">
          View Full Example <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </button>
  );
}
