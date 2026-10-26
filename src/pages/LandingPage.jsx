import React from 'react';
import { Shield, AlertTriangle, Phone, Users, DollarSign, TrendingUp, AlertCircle, FileText, BookOpen, Play, ArrowRight } from 'lucide-react';
import config from '../config.json';
import { StatCard, ScamExample, FeatureCard } from '../components/LandingCards.jsx';
import { useGo } from '../routes.js';

export default function LandingPage() {
  const go = useGo();
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.15"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2 mb-6">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-300 text-sm font-medium">Seniors lost $4.9 BILLION to scams in 2024</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Protect Your Parents from
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Cyber Criminals</span>
              </h1>
              
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Free, friendly lessons that help your parents recognize and reject scams, with real examples
                and an emergency directory if something goes wrong. No cost, no account needed to start.
                Because everyone deserves to feel safe online.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => go('learn')}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
                >
                  Start Free Training <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => go('emergency')}
                  className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center gap-2 text-lg"
                >
                  <Phone className="w-5 h-5" /> Scammed? Get Help Now
                </button>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <img
                src={config.site.heroImage}
                alt={config.site.heroAlt}
                className="rounded-2xl shadow-2xl border border-white/10 w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Dashboard */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">The Threat By The Numbers</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Data from the FBI IC3 2024 Report, U.S. Treasury Department, and World Economic Forum
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard 
              icon={<DollarSign className="w-8 h-8" />}
              value="$16.6B"
              label="Total Cybercrime Losses (2024)"
              change="+33% from 2023"
              color="red"
            />
            <StatCard 
              icon={<Users className="w-8 h-8" />}
              value="$4.9B"
              label="Losses by Seniors (60+)"
              change="+43% from 2023"
              color="orange"
            />
            <StatCard 
              icon={<TrendingUp className="w-8 h-8" />}
              value="$10B+"
              label="Lost to SE Asia Scam Centers"
              change="+66% increase"
              color="purple"
            />
            <StatCard 
              icon={<AlertCircle className="w-8 h-8" />}
              value="147,127"
              label="Elder Fraud Complaints"
              change="FBI IC3 2024"
              color="blue"
            />
          </div>

          {/* Additional Stats */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-red-400 mb-2">$33,915</p>
                <p className="text-slate-300">Average loss per elderly victim</p>
              </div>
              <div className="text-center border-y md:border-y-0 md:border-x border-slate-700 py-6 md:py-0">
                <p className="text-4xl font-bold text-orange-400 mb-2">1 in 24</p>
                <p className="text-slate-300">Scams actually reported to authorities</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-cyan-400 mb-2">72%</p>
                <p className="text-slate-300">Organizations report increasing cyber risks</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wall of Deception */}
      <section className="py-16 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 rounded-full px-4 py-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-red-700 text-sm font-medium">Danger Zone</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">The Wall of Deception</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Real examples of scam emails, texts, and popups. Learn to recognize these tactics before they fool you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fake Amazon Email */}
            <ScamExample
              type="email"
              title="Fake Amazon Order"
              from="orders@amaz0n-ship.com"
              content="Your order #A7392-XK for $847.99 has been confirmed. If you didn't make this purchase, click here immediately to cancel."
              redFlags={["Misspelled domain (amaz0n)", "Creates urgency", "Suspicious link"]}
            />

            {/* Fake Bank Alert */}
            <ScamExample
              type="email"
              title="Fake Bank Security Alert"
              from="security@bankofamer1ca-alerts.net"
              content="⚠️ URGENT: Suspicious activity detected on your account. Your account will be LOCKED in 24 hours unless you verify your identity now."
              redFlags={["Fake domain", "Threats & urgency", "Generic greeting"]}
            />

            {/* Fake IRS Text */}
            <ScamExample
              type="text"
              title="Fake IRS Refund"
              from="+1 (555) 123-4567"
              content="IRS: You have a pending refund of $1,847. Claim now before it expires: https://irs-refund.claim-now.info"
              redFlags={["IRS doesn't text", "Suspicious URL", "Creates urgency"]}
            />

            {/* Fake Package Delivery */}
            <ScamExample
              type="text"
              title="Fake USPS Delivery"
              from="+1 (555) 987-6543"
              content="USPS: Package delivery failed. Redelivery fee $2.99 required. Pay here: usps-redeliver.com/pay"
              redFlags={["USPS doesn't charge fees", "Fake website", "Unsolicited message"]}
            />

            {/* Tech Support Popup */}
            <ScamExample
              type="popup"
              title="Fake Microsoft Warning"
              from="Pop-up window"
              content="🔴 CRITICAL ALERT! Your computer has been infected with 3 viruses! Call Microsoft Support NOW: 1-800-555-0199"
              redFlags={["Microsoft doesn't do this", "Scare tactics", "Fake phone number"]}
            />

            {/* Grandparent Scam */}
            <ScamExample
              type="text"
              title="Grandparent Scam"
              from="+1 (555) 246-8013"
              content="Grandma it's me! I'm in jail and need $5,000 bail money. Please don't tell mom & dad. Can you send gift cards? I'll pay you back."
              redFlags={["Requests gift cards", "Asks for secrecy", "Appeals to emotions"]}
            />
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">What You'll Find Here</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Free cyber safety lessons designed for seniors, with tools families can use together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              title="Training Modules"
              description="Short lessons on why scams work and how to say no, plus email, text, phone, pop-up, government, marketplace, romance, and investment scams, each with a quick check at the end."
            />
            <FeatureCard
              icon={<FileText className="w-8 h-8" />}
              title="Scam of the Week"
              description="A new 2-minute “scam or safe?” challenge every week, based on the scams going around right now. A great thing to do together."
            />
            <FeatureCard
              icon={<Play className="w-8 h-8" />}
              title="Certificate of Completion"
              description="Pass the final exam to earn a certificate you can download, print, and share with family. Free for everyone."
            />
            <FeatureCard
              icon={<Phone className="w-8 h-8" />}
              title="Emergency Contact Directory"
              description="One-click access to FBI, FTC, AARP helpline, credit bureaus, and local resources when you need them fast."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Privacy Settings Guides"
              description="Step-by-step instructions for locking down Facebook, Windows, Mac, phones, and all major browsers."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Family Safety Plan"
              description="Seven simple steps to do together with your parent: a family code word, trusted numbers, and a “call before you pay” rule."
            />
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => go('learn')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Start Free Training <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Don't Wait Until It's Too Late
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Every 39 seconds, someone becomes a victim of cybercrime. Protect your parents today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => go('learn')}
              className="px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Start Free Training <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => go('emergency')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" /> View Emergency Resources
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
