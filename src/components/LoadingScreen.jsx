import React from 'react';
import { Shield } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <p className="text-slate-600 text-lg font-medium">Securing your connection…</p>
      </div>
    </div>
  );
}
