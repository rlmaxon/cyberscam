import React from 'react';
import { AlertTriangle, Mail, MessageSquare, XCircle } from 'lucide-react';

export function StatCard({ icon, value, label, change, color }) {
  const colors = {
    red: 'from-red-500 to-rose-600',
    orange: 'from-orange-500 to-amber-600',
    purple: 'from-purple-500 to-violet-600',
    blue: 'from-blue-500 to-cyan-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
      <p className="text-slate-600 text-sm mb-2">{label}</p>
      <p className={`text-xs font-medium ${color === 'blue' ? 'text-blue-600' : 'text-red-600'}`}>{change}</p>
    </div>
  );
}

export function ScamExample({ type, title, from, content, redFlags }) {
  const icons = {
    email: <Mail className="w-5 h-5" />,
    text: <MessageSquare className="w-5 h-5" />,
    popup: <AlertTriangle className="w-5 h-5" />
  };

  const typeColors = {
    email: 'bg-blue-100 text-blue-700',
    text: 'bg-green-100 text-green-700',
    popup: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 overflow-hidden hover:shadow-xl transition-shadow">
      <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[type]} flex items-center gap-1`}>
            {icons[type]} {type.toUpperCase()}
          </span>
        </div>
        <span className="text-red-600 text-xs font-bold">⚠️ SCAM</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-xs text-slate-500 mb-2 font-mono truncate">From: {from}</p>
        <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 mb-4">{content}</p>
        <div className="space-y-2">
          <p className="text-xs font-bold text-red-700 uppercase">🚩 Red Flags:</p>
          {redFlags.map((flag, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-red-600">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{flag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
