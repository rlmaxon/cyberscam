import React, { useId, useState } from 'react';
import { Save, Bell, MessageSquare } from 'lucide-react';
import { ROLES } from '../../member/profileApi.js';
import { TextField, Notice, SubmitButton } from './FormParts.jsx';

// Used by both the first-time Welcome step and the Profile page.
export default function ProfileForm({ initial, onSave, submitLabel }) {
  const [displayName, setDisplayName] = useState(initial?.displayName ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [notifyScamAlerts, setScam] = useState(initial?.notifyScamAlerts ?? true);
  const [notifyNewTraining, setTraining] = useState(initial?.notifyNewTraining ?? false);
  const [notifyNewVideos, setVideos] = useState(initial?.notifyNewVideos ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const roleGroup = useId();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    if (!displayName.trim()) return setError('Please tell us what to call you.');
    if (!role) return setError('Please choose the option that describes you best.');
    setLoading(true);
    try {
      await onSave({ displayName: displayName.trim(), role, notifyScamAlerts, notifyNewTraining, notifyNewVideos });
      setSaved(true);
    } catch (err) {
      setError('We couldn\'t save your settings. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <TextField
        label="What should we call you?"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        autoComplete="given-name"
        placeholder="For example, Mary"
        maxLength={60}
      />

      <fieldset>
        <legend id={roleGroup} className="block text-base font-semibold text-slate-700 mb-3">
          Which describes you best?
        </legend>
        <div className="space-y-3">
          {ROLES.map((r) => (
            <label
              key={r.value}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                role === r.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={r.value}
                checked={role === r.value}
                onChange={() => setRole(r.value)}
                className="mt-1 w-6 h-6 accent-blue-600 flex-shrink-0"
              />
              <span>
                <span className="block text-lg font-semibold text-slate-800">{r.label}</span>
                <span className="block text-base text-slate-600">{r.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="block text-base font-semibold text-slate-700 mb-1 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" /> Email me when…
        </legend>
        <p className="text-base text-slate-500 mb-3">You can change these any time. We never share your email.</p>
        <div className="space-y-3">
          <Checkbox checked={notifyScamAlerts} onChange={setScam} label="A new scam is going around" hint="Recommended. Short warnings about scams targeting seniors right now." />
          <Checkbox checked={notifyNewTraining} onChange={setTraining} label="New training lessons are added" />
          <Checkbox checked={notifyNewVideos} onChange={setVideos} label="New training videos are posted" />
          <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-500">
            <MessageSquare className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <span>
              <span className="block text-lg font-semibold">Text message alerts</span>
              <span className="block text-base">Coming soon</span>
            </span>
          </div>
        </div>
      </fieldset>

      {error && <Notice>{error}</Notice>}
      {saved && <Notice tone="success">Your settings are saved.</Notice>}

      <SubmitButton loading={loading} loadingText="Saving…">
        <Save className="w-5 h-5" /> {submitLabel}
      </SubmitButton>
    </form>
  );
}

function Checkbox({ checked, onChange, label, hint }) {
  return (
    <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${checked ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 w-6 h-6 accent-blue-600 flex-shrink-0" />
      <span>
        <span className="block text-lg font-semibold text-slate-800">{label}</span>
        {hint && <span className="block text-base text-slate-600">{hint}</span>}
      </span>
    </label>
  );
}
