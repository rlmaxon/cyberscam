import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

export function LoadingBlock({ text = 'Loading…' }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4" role="status">
      <p className="text-xl text-slate-600 flex items-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin" /> {text}
      </p>
    </div>
  );
}

export function ErrorBlock({ text = "We couldn't load the training. Please check your internet connection and refresh the page." }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <p role="alert" className="max-w-lg text-xl text-red-800 bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex gap-3">
        <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" /> {text}
      </p>
    </div>
  );
}

export function BigButton({ as: Tag = 'button', className = '', tone = 'blue', children, ...rest }) {
  const tones = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    orange: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white',
    green: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white',
    white: 'bg-white border-2 border-slate-300 hover:bg-slate-50 text-slate-800',
  };
  return (
    <Tag
      className={`w-full py-4 px-6 min-h-[56px] text-lg font-bold rounded-xl shadow flex items-center justify-center gap-2 text-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${tones[tone]} ${className}`}
      {...(Tag === 'button' && !rest.type ? { type: 'button' } : {})}
      {...rest}
    >
      {children}
    </Tag>
  );
}
