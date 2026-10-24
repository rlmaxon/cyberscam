import React from 'react';
import { Phone, Globe, ExternalLink } from 'lucide-react';

export default function ResourceCard({ name, description, phone, url, urgent, badge }) {
  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 ${urgent ? 'border-red-200' : 'border-slate-200'} p-5 hover:shadow-xl transition-shadow`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-slate-800">{name}</h3>
        {badge && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">{badge}</span>
        )}
        {urgent && !badge && (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">URGENT</span>
        )}
      </div>
      <p className="text-slate-600 text-sm mb-4">{description}</p>
      <div className="flex flex-col gap-2">
        {phone && (
          <a 
            href={`tel:${phone.replace(/[^0-9]/g, '')}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
          >
            <Phone className="w-4 h-4" />
            {phone}
          </a>
        )}
        {url && (
          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            <Globe className="w-4 h-4" />
            Visit Website
            <ExternalLink className="w-4 h-4 ml-auto" />
          </a>
        )}
      </div>
    </div>
  );
}
