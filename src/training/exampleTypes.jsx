import React from 'react';
import { Mail, MessageSquare, ShoppingCart, Monitor, Phone, FileText, Users, Globe, Landmark, Heart, TrendingUp, ShieldCheck } from 'lucide-react';

// How each kind of scam example is labeled and colored, used everywhere examples appear.
export const EXAMPLE_TYPES = {
  email: { Icon: Mail, label: 'EMAIL', bg: 'bg-blue-100 text-blue-800', headerBg: 'bg-blue-50' },
  text: { Icon: MessageSquare, label: 'TEXT MESSAGE', bg: 'bg-green-100 text-green-800', headerBg: 'bg-green-50' },
  marketplace: { Icon: ShoppingCart, label: 'MARKETPLACE', bg: 'bg-purple-100 text-purple-800', headerBg: 'bg-purple-50' },
  popup: { Icon: Monitor, label: 'POP-UP', bg: 'bg-red-100 text-red-800', headerBg: 'bg-red-50' },
  phone: { Icon: Phone, label: 'PHONE CALL', bg: 'bg-amber-100 text-amber-900', headerBg: 'bg-amber-50' },
  letter: { Icon: FileText, label: 'LETTER', bg: 'bg-slate-200 text-slate-800', headerBg: 'bg-slate-50' },
  social: { Icon: Users, label: 'SOCIAL / DATING', bg: 'bg-pink-100 text-pink-800', headerBg: 'bg-pink-50' },
  website: { Icon: Globe, label: 'WEBSITE / APP', bg: 'bg-cyan-100 text-cyan-900', headerBg: 'bg-cyan-50' },
};

export const exampleType = (type) => EXAMPLE_TYPES[type] ?? EXAMPLE_TYPES.email;

export function TypeBadge({ type, size = 'sm' }) {
  const t = exampleType(type);
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${t.bg} inline-flex items-center gap-1`}>
      <t.Icon className={iconSize} aria-hidden="true" /> {t.label}
    </span>
  );
}

// Icons for each module (from modules.json "iconKey")
const MODULE_ICONS = {
  mail: Mail, message: MessageSquare, phone: Phone, monitor: Monitor,
  landmark: Landmark, cart: ShoppingCart, heart: Heart, trending: TrendingUp, shield: ShieldCheck,
};
export function ModuleIcon({ iconKey, className = 'w-6 h-6' }) {
  const Icon = MODULE_ICONS[iconKey] ?? Mail;
  return <Icon className={className} aria-hidden="true" />;
}

// Header colors for each module, used by the Training Lab library cards
export const MODULE_COLORS = {
  email: 'from-blue-500 to-blue-600',
  text: 'from-green-500 to-emerald-600',
  phone: 'from-amber-500 to-orange-600',
  popup: 'from-red-500 to-rose-600',
  government: 'from-slate-600 to-slate-700',
  marketplace: 'from-purple-500 to-violet-600',
  romance: 'from-pink-500 to-rose-500',
  investment: 'from-teal-500 to-cyan-600',
  mindset: 'from-indigo-500 to-blue-700',
};

// The message itself, shown the way it would look in real life (no answer shown).
export function ExampleMessage({ example }) {
  return (
    <div className="rounded-xl border-2 border-slate-300 overflow-hidden bg-white">
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-100 space-y-1">
        <div><TypeBadge type={example.type} /></div>
        <p className="text-base text-slate-700"><strong>From:</strong> <span className="font-mono text-slate-900 break-words">{example.sender}</span></p>
        {example.subject && !['Text Message', 'Phone call', 'Voicemail'].includes(example.subject) && (
          <p className="text-base text-slate-700"><strong>Subject:</strong> <span className="text-slate-900">{example.subject}</span></p>
        )}
      </div>
      <div className="p-5">
        <pre className="whitespace-pre-wrap text-slate-800 font-sans text-lg leading-relaxed">{example.body}</pre>
      </div>
    </div>
  );
}
