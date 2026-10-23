import React from 'react';
import { AlertTriangle, Phone, FileText, CreditCard } from 'lucide-react';
import config from '../config.json';
import ResourceCard from '../components/ResourceCard.jsx';

export default function EmergencyDirectory() {
  const reportingResources = config.emergency.reporting;
  const creditResources = config.emergency.credit;
  const governmentResources = config.emergency.government;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 rounded-full px-4 py-2 mb-4">
            <Phone className="w-4 h-4 text-red-600" />
            <span className="text-red-700 text-sm font-medium">Emergency Hotline</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Emergency Directory</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            One-click access to report fraud and get help. Save these numbers in your phone!
          </p>
        </div>

        {/* Fraud Reporting */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Report Fraud Now
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {reportingResources.map((resource, idx) => (
              <ResourceCard key={idx} {...resource} />
            ))}
          </div>
        </div>

        {/* Credit Protection */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-500" />
            Credit Protection
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-blue-800 text-sm">
              <strong>💡 Tip:</strong> You only need to call ONE credit bureau to place a fraud alert — they are required by law to notify the other two.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {creditResources.map((resource, idx) => (
              <ResourceCard key={idx} {...resource} />
            ))}
          </div>
        </div>

        {/* Government Agencies */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-green-500" />
            Government Agencies (Official Numbers)
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {governmentResources.map((resource, idx) => (
              <ResourceCard key={idx} {...resource} />
            ))}
          </div>
        </div>

        {/* Quick Action Box */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">If You Think You've Been Scammed:</h3>
          <ol className="space-y-3 text-lg">
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 font-bold">1</span>
              <span>STOP all communication with the scammer immediately</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 font-bold">2</span>
              <span>CALL your bank/credit card company if you shared financial info</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 font-bold">3</span>
              <span>CHANGE passwords on any compromised accounts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 font-bold">4</span>
              <span>REPORT to IC3.gov and the FTC</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 font-bold">5</span>
              <span>TELL a trusted family member or friend — don't be embarrassed!</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
