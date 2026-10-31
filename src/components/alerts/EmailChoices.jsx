import React from 'react';
import { MessageSquare } from 'lucide-react';
import { NEWS_TOPICS, FAMILY_TOPICS } from '../../alerts/emailApi.js';

// The checkboxes for "which emails do you want?", used on the sign-up form, the email
// preferences page, and the member profile. Text messages are shown but not offered yet.

export function ChoiceBox({ checked, onChange, label, hint, disabled }) {
  return (
    <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${checked ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-6 h-6 accent-blue-600 flex-shrink-0"
      />
      <span>
        <span className="block text-lg font-semibold text-slate-800">{label}</span>
        {hint && <span className="block text-base text-slate-600">{hint}</span>}
      </span>
    </label>
  );
}

export function TextAlertsComingSoon() {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-600" aria-disabled="true">
      <input type="checkbox" disabled className="mt-1 w-6 h-6 flex-shrink-0" aria-label="Text message alerts (coming soon)" />
      <span>
        <span className="flex items-center gap-2 text-lg font-semibold"><MessageSquare className="w-5 h-5" aria-hidden="true" /> Text message alerts</span>
        <span className="block text-base">Coming soon. We don't collect phone numbers yet.</span>
      </span>
    </div>
  );
}

export function NewsChoices({ topics, onChange, disabled }) {
  return (
    <div className="space-y-3">
      {NEWS_TOPICS.map((t) => (
        <ChoiceBox
          key={t.key}
          checked={!!topics[t.key]}
          disabled={disabled}
          onChange={(v) => onChange({ ...topics, [t.key]: v })}
          label={t.label}
          hint={t.hint}
        />
      ))}
    </div>
  );
}

export function FamilyChoices({ family, onChange, disabled }) {
  return (
    <div className="space-y-3">
      {FAMILY_TOPICS.map((t) => (
        <ChoiceBox
          key={t.key}
          checked={family[t.key] !== false}
          disabled={disabled}
          onChange={(v) => onChange({ ...family, [t.key]: v })}
          label={t.label}
          hint={t.hint}
        />
      ))}
    </div>
  );
}
