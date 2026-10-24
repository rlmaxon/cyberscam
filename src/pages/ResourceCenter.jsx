import React, { useState } from 'react';
import { Lock, Globe, ChevronDown, ExternalLink, Monitor, Smartphone, Chrome, Apple } from 'lucide-react';
import config from '../config.json';

export default function ResourceCenter() {
  const [expandedSection, setExpandedSection] = useState('windows');

  // Links live in config.json (privacyGuides) so they can be updated without touching code.
  const sectionIcons = {
    monitor: <Monitor className="w-6 h-6" />,
    apple: <Apple className="w-6 h-6" />,
    smartphone: <Smartphone className="w-6 h-6" />,
    chrome: <Chrome className="w-6 h-6" />,
    globe: <Globe className="w-6 h-6" />,
  };
  const resources = Object.fromEntries(
    config.privacyGuides.map((g) => [g.key, { ...g, icon: sectionIcons[g.iconKey] }])
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 rounded-full px-4 py-2 mb-4">
            <Lock className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-sm font-medium">Lock It Down</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Privacy & Security Settings</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Direct links to manufacturer "How-To" pages for enabling automatic updates and security settings on all your devices.
          </p>
        </div>

        <div className="space-y-4">
          {Object.entries(resources).map(([key, section]) => (
            <div key={key} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === key ? null : key)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    {section.icon}
                  </div>
                  <span className="text-xl font-bold text-slate-800">{section.title}</span>
                </div>
                <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform ${expandedSection === key ? 'rotate-180' : ''}`} />
              </button>
              
              {expandedSection === key && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {section.items.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all group"
                      >
                        <ExternalLink className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />
                        <span className="text-slate-700 group-hover:text-blue-700 font-medium">{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
