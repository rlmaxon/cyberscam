import React, { useState } from 'react';
import { Shield, AlertTriangle, Mail, MessageSquare, ChevronDown, XCircle, BookOpen, Monitor, Printer, ArrowLeft, ShoppingCart, ChevronUp } from 'lucide-react';

// ---- Example Detail View ----
export default function TrainingLabDetail({ example, navigateTo, categoryKey }) {
  const [showRedFlags, setShowRedFlags] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const typeConfig = {
    email: { icon: <Mail className="w-5 h-5" />, label: 'EMAIL', bg: 'bg-blue-100 text-blue-700', headerBg: 'bg-blue-50' },
    text: { icon: <MessageSquare className="w-5 h-5" />, label: 'TEXT MESSAGE', bg: 'bg-green-100 text-green-700', headerBg: 'bg-green-50' },
    marketplace: { icon: <ShoppingCart className="w-5 h-5" />, label: 'MARKETPLACE', bg: 'bg-purple-100 text-purple-700', headerBg: 'bg-purple-50' },
    popup: { icon: <Monitor className="w-5 h-5" />, label: 'POP-UP', bg: 'bg-red-100 text-red-700', headerBg: 'bg-red-50' }
  };
  const tc = typeConfig[example.type] || typeConfig.email;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Back Navigation */}
      <div className="flex items-center justify-between mb-6 no-print">
        <button
          onClick={() => navigateTo('category', categoryKey)}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to {categoryKey ? categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1) + ' Examples' : 'Category'}
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors"
        >
          <Printer className="w-4 h-4" /> Print This Example
        </button>
      </div>

      {/* Example Card (print-friendly) */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden print-card">
        {/* Status Banner */}
        <div className={`px-6 py-4 border-b-2 flex items-center justify-between ${example.isScam ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${tc.bg} flex items-center gap-1`}>
              {tc.icon} {tc.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              example.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
              example.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {example.difficulty}
            </span>
          </div>
          <span className={`text-lg font-bold ${example.isScam ? 'text-red-600' : 'text-green-600'}`}>
            {example.isScam ? 'THIS IS A SCAM' : 'LEGITIMATE'}
          </span>
        </div>

        {/* Title */}
        <div className="px-6 py-5 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800">{example.title}</h1>
        </div>

        {/* Simulated Message */}
        <div className="p-6">
          <div className={`rounded-xl border-2 overflow-hidden mb-6 ${example.isScam ? 'border-red-200' : 'border-slate-200'}`}>
            <div className={`px-5 py-3 border-b ${example.isScam ? 'bg-red-50 border-red-200' : 'bg-slate-100 border-slate-200'}`}>
              <p className="text-sm text-slate-600 mb-1"><strong>From:</strong> <span className="font-mono text-slate-800">{example.sender}</span></p>
              {example.subject && example.subject !== 'Text Message' && (
                <p className="text-sm text-slate-600"><strong>Subject:</strong> <span className="text-slate-800">{example.subject}</span></p>
              )}
            </div>
            <div className="p-5 bg-white">
              <pre className="whitespace-pre-wrap text-slate-700 font-sans text-base leading-relaxed">
                {example.body}
              </pre>
            </div>
          </div>

          {/* Red Flags Section (expandable on screen, always shown in print) */}
          {example.redFlags && example.redFlags.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setShowRedFlags(!showRedFlags)}
                className="w-full flex items-center justify-between p-4 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors no-print"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <span className="font-bold text-red-800 text-lg">Red Flags ({example.redFlags.length})</span>
                </div>
                {showRedFlags ? <ChevronUp className="w-5 h-5 text-red-600" /> : <ChevronDown className="w-5 h-5 text-red-600" />}
              </button>
              <div className={`${showRedFlags ? 'block' : 'hidden'} print-always-show mt-3 space-y-3`}>
                {example.redFlags.map((flag, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-red-800">{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation Section (expandable on screen, always shown in print) */}
          <div className="mb-6">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-colors no-print"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-blue-800 text-lg">Why This Is {example.isScam ? 'a Scam' : 'Legitimate'}</span>
              </div>
              {showExplanation ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-blue-600" />}
            </button>
            <div className={`${showExplanation ? 'block' : 'hidden'} print-always-show mt-3`}>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-blue-900 leading-relaxed">{example.explanation}</p>
              </div>
            </div>
          </div>

          {/* How to Spot Section */}
          {example.howToSpot && (
            <div className="p-5 bg-green-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-green-600" />
                <span className="font-bold text-green-800 text-lg">How to Protect Yourself</span>
              </div>
              <p className="text-green-800 leading-relaxed">{example.howToSpot}</p>
            </div>
          )}
        </div>
      </div>

      {/* Print Header (only visible when printing) */}
      <div className="print-header hidden">
        <p>Senior Cyber Secure — Scam Spotter Training Lab</p>
      </div>
    </>
  );
}
