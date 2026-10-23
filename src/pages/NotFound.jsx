import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Phone } from 'lucide-react';
import { PATHS } from '../routes.js';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] bg-slate-50 py-16 px-4">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">We couldn't find that page</h1>
        <p className="text-lg text-slate-600 mb-8">
          The link may be old or mistyped. Nothing is wrong with your computer.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={PATHS.landing}
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-lg"
          >
            <Home className="w-5 h-5" /> Go to the Home Page
          </Link>
          <Link
            to={PATHS.emergency}
            className="px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-lg"
          >
            <Phone className="w-5 h-5" /> Get Emergency Help
          </Link>
        </div>
      </div>
    </div>
  );
}
