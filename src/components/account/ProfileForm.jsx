import React, { useId, useState } from 'react';
import { Save, Bell, Users } from 'lucide-react';
import { ROLES } from '../../member/profileApi.js';
import { DEFAULT_FAMILY } from '../../alerts/emailApi.js';
import { TextField, Notice, SubmitButton } from './FormParts.jsx';
import { NewsChoices, FamilyChoices, TextAlertsComingSoon } from '../alerts/EmailChoices.jsx';

// Used by both the first-time Welcome step and the Profile page.
// initialEmail: { topics, family } from the email system, when known. Otherwise the
// choices saved on the profile are used.
export default function ProfileForm({ initial, initialEmail, onSave, submitLabel, showFamily = false }) {
  const [displayName, setDisplayName] = useState(initial?.displayName ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [topics, setTopics] = useState(() => initialEmail?.topics ?? {
    scamAlerts: initial?.notifyScamAlerts ?? true,
    newTraining: initial?.notifyNewTraining ?? false,
    newVideos: initial?.notifyNewVideos ?? false,
  });
  const [family, setFamily] = useState(() => initialEmail?.family ?? DEFAULT_FAMILY);
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
      await onSave(
        {
          displayName: displayName.trim(),
          role,
          notifyScamAlerts: !!topics.scamAlerts,
          notifyNewTraining: !!topics.newTraining,
          notifyNewVideos: !!topics.newVideos,
        },
        { topics, family },
      );
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
          <Bell className="w-5 h-5 text-blue-600" /> Email me about…
        </legend>
        <p className="text-base text-slate-500 mb-3">You can change these any time. We never share your email.</p>
        <div className="space-y-3">
          <NewsChoices topics={topics} onChange={setTopics} />
          <TextAlertsComingSoon />
        </div>
      </fieldset>

      {showFamily && (
        <fieldset>
          <legend className="block text-base font-semibold text-slate-700 mb-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Family Circle emails
          </legend>
          <p className="text-base text-slate-500 mb-3">Only sent if you use the Family Circle.</p>
          <FamilyChoices family={family} onChange={setFamily} />
        </fieldset>
      )}

      {error && <Notice>{error}</Notice>}
      {saved && <Notice tone="success">Your settings are saved.</Notice>}

      <SubmitButton loading={loading} loadingText="Saving…">
        <Save className="w-5 h-5" /> {submitLabel}
      </SubmitButton>
    </form>
  );
}

