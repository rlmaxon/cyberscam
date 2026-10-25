import React from 'react';
import { Shield, Mail, ExternalLink, ArrowRight } from 'lucide-react';
import config from '../config.json';
import { useGo } from '../routes.js';

export default function Footer() {
  const go = useGo();
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">Senior Cyber Secure</h3>
                <p className="text-slate-400 text-sm">{config.site.shortTagline}</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-4 max-w-sm">
              Empowering seniors and their families with the knowledge and tools to stay safe from online scams and fraud.
            </p>
            <button
              onClick={() => go('training')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              Start Free Training <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><button onClick={() => go('landing')} className="hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => go('training')} className="hover:text-white transition-colors">Training Lab</button></li>
              <li><button onClick={() => go('resources')} className="hover:text-white transition-colors">Privacy Settings</button></li>
              <li><button onClick={() => go('marketplace')} className="hover:text-white transition-colors">Security Tools</button></li>
              <li><button onClick={() => go('emergency')} className="hover:text-white transition-colors">Emergency Hotline</button></li>
              <li><button onClick={() => go('signup')} className="hover:text-white transition-colors">Create Free Account</button></li>
              <li><button onClick={() => go('login')} className="hover:text-white transition-colors">Member Sign In</button></li>
              <li className="pt-2">
                <a href={`mailto:${config.contact.email}`} className="hover:text-white transition-colors flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Contact Us
                </a>
                <span className="text-slate-500 text-xs break-all">{config.contact.email}</span>
              </li>
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h4 className="font-bold mb-4">Emergency Resources</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href={config.emergency.reporting[0].url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">FBI IC3 <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href={config.emergency.reporting[1].url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">FTC Fraud Report <ExternalLink className="w-3 h-3" /></a></li>
              <li><span className="text-white">AARP Helpline:</span> {config.emergency.reporting[2].phone}</li>
              <li><a href={config.emergency.credit[0].url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">Free Credit Report <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              {config.site.copyright}
            </p>
            <div className="flex gap-6 text-slate-500 text-sm">
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Affiliate Disclosure</button>
              <button className="hover:text-white transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
