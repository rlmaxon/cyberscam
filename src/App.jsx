import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Lock, Eye, EyeOff, Phone, Mail, MessageSquare, Globe, ChevronRight, ChevronDown, ExternalLink, CheckCircle, XCircle, Users, DollarSign, TrendingUp, AlertCircle, FileText, CreditCard, Search, Menu, X, Home, BookOpen, ShoppingBag, Headphones, Settings, LogOut, Play, ArrowRight, Star, Zap, Database, Key, Trash2, Monitor, Smartphone, Chrome, Apple, Bot, Printer, ArrowLeft, ShoppingCart, Tag, Award, RotateCcw, ChevronUp } from 'lucide-react';
import config from './config.json';

// ==================== MAIN APP ====================
export default function SeniorCyberSecure() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('landing');
  };

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Source Sans 3', 'Segoe UI', sans-serif" }}>
      {/* Navigation */}
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Page Content */}
      <main>
        {currentPage === 'landing' && <LandingPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'login' && <LoginPage handleLogin={handleLogin} setCurrentPage={setCurrentPage} />}
        {currentPage === 'dashboard' && isLoggedIn && <MemberDashboard setCurrentPage={setCurrentPage} />}
        {currentPage === 'training' && <TrainingLab setCurrentPage={setCurrentPage} />}
        {currentPage === 'resources' && <ResourceCenter />}
        {currentPage === 'marketplace' && <AffiliateMarketplace />}
        {currentPage === 'emergency' && <EmergencyDirectory />}
      </main>

      {/* Footer */}
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

// ==================== NAVIGATION ====================
function Navigation({ currentPage, setCurrentPage, isLoggedIn, handleLogout, mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <button onClick={() => setCurrentPage('landing')} className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Senior Cyber Secure</h1>
              <p className="text-xs text-blue-600 font-medium -mt-1">Parent Protection Kit</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <NavButton active={currentPage === 'landing'} onClick={() => setCurrentPage('landing')}>
              <Home className="w-4 h-4" /> Home
            </NavButton>
            <NavButton active={currentPage === 'resources'} onClick={() => setCurrentPage('resources')}>
              <Settings className="w-4 h-4" /> Lock It Down
            </NavButton>
            <NavButton active={currentPage === 'marketplace'} onClick={() => setCurrentPage('marketplace')}>
              <ShoppingBag className="w-4 h-4" /> Security Toolbox
            </NavButton>
            <NavButton active={currentPage === 'emergency'} onClick={() => setCurrentPage('emergency')}>
              <Phone className="w-4 h-4" /> Emergency Hotline
            </NavButton>
            <NavButton active={currentPage === 'training'} onClick={() => setCurrentPage('training')}>
              <BookOpen className="w-4 h-4" /> Training Lab
            </NavButton>

            {isLoggedIn ? (
              <>
                <NavButton active={currentPage === 'dashboard' || currentPage === 'training'} onClick={() => setCurrentPage('dashboard')} highlight>
                  <BookOpen className="w-4 h-4" /> Member Area
                </NavButton>
                <button onClick={handleLogout} className="ml-2 px-4 py-2 text-sm text-slate-600 hover:text-red-600 transition-colors flex items-center gap-1">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <button 
                onClick={() => setCurrentPage('login')}
                className="ml-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Lock className="w-4 h-4" /> Member Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 space-y-2">
            <MobileNavButton onClick={() => { setCurrentPage('landing'); setMobileMenuOpen(false); }}>Home</MobileNavButton>
            <MobileNavButton onClick={() => { setCurrentPage('resources'); setMobileMenuOpen(false); }}>Lock It Down</MobileNavButton>
            <MobileNavButton onClick={() => { setCurrentPage('marketplace'); setMobileMenuOpen(false); }}>Security Toolbox</MobileNavButton>
            <MobileNavButton onClick={() => { setCurrentPage('emergency'); setMobileMenuOpen(false); }}>Emergency Hotline</MobileNavButton>
            <MobileNavButton onClick={() => { setCurrentPage('training'); setMobileMenuOpen(false); }}>Training Lab</MobileNavButton>
            {isLoggedIn ? (
              <>
                <MobileNavButton onClick={() => { setCurrentPage('dashboard'); setMobileMenuOpen(false); }} highlight>Member Area</MobileNavButton>
                <MobileNavButton onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Logout</MobileNavButton>
              </>
            ) : (
              <MobileNavButton onClick={() => { setCurrentPage('login'); setMobileMenuOpen(false); }} highlight>Member Login</MobileNavButton>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavButton({ children, active, onClick, highlight }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
        highlight 
          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
          : active 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

function MobileNavButton({ children, onClick, highlight }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
        highlight ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

// ==================== LANDING PAGE ====================
function LandingPage({ setCurrentPage }) {
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
                The Parent Protection Kit gives your loved ones the knowledge and confidence to recognize and reject scams. 
                Because everyone deserves to feel safe online.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href={config.store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
                >
                  Get the Kit on {config.store.name} <ExternalLink className="w-5 h-5" />
                </a>
                <button 
                  onClick={() => setCurrentPage('login')}
                  className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" /> Already a Member?
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
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">What's In The Parent Protection Kit?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A complete cyber safety curriculum designed specifically for seniors, with both physical and digital resources.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              title="Training Modules"
              description="Comprehensive lessons covering phishing, smishing, vishing, social media scams, marketplace fraud, and creating your personal safety plan."
            />
            <FeatureCard
              icon={<FileText className="w-8 h-8" />}
              title="Printable Reference Cards"
              description="Wallet-sized cards with red flags, safety checklists, and emergency contacts. Laminate and keep by your computer or phone."
            />
            <FeatureCard
              icon={<Play className="w-8 h-8" />}
              title="Interactive Training Lab"
              description="Practice identifying scam emails and texts in a safe environment. Members-only access to hands-on simulations."
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
              title="Family Action Plan"
              description="Worksheets to establish verification contacts, trusted numbers, and a communication plan with loved ones."
            />
          </div>

          <div className="text-center mt-12">
            <a
              href={config.store.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Get Your Kit on {config.store.name} <ExternalLink className="w-5 h-5" />
            </a>
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
            <a
              href={config.store.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Purchase on {config.store.name} <ExternalLink className="w-5 h-5" />
            </a>
            <button 
              onClick={() => setCurrentPage('emergency')}
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

// ==================== COMPONENT HELPERS ====================
function StatCard({ icon, value, label, change, color }) {
  const colors = {
    red: 'from-red-500 to-rose-600',
    orange: 'from-orange-500 to-amber-600',
    purple: 'from-purple-500 to-violet-600',
    blue: 'from-blue-500 to-cyan-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
      <p className="text-slate-600 text-sm mb-2">{label}</p>
      <p className={`text-xs font-medium ${color === 'blue' ? 'text-blue-600' : 'text-red-600'}`}>{change}</p>
    </div>
  );
}

function ScamExample({ type, title, from, content, redFlags }) {
  const icons = {
    email: <Mail className="w-5 h-5" />,
    text: <MessageSquare className="w-5 h-5" />,
    popup: <AlertTriangle className="w-5 h-5" />
  };

  const typeColors = {
    email: 'bg-blue-100 text-blue-700',
    text: 'bg-green-100 text-green-700',
    popup: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 overflow-hidden hover:shadow-xl transition-shadow">
      <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[type]} flex items-center gap-1`}>
            {icons[type]} {type.toUpperCase()}
          </span>
        </div>
        <span className="text-red-600 text-xs font-bold">⚠️ SCAM</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-xs text-slate-500 mb-2 font-mono truncate">From: {from}</p>
        <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 mb-4">{content}</p>
        <div className="space-y-2">
          <p className="text-xs font-bold text-red-700 uppercase">🚩 Red Flags:</p>
          {redFlags.map((flag, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-red-600">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{flag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

// ==================== LOGIN PAGE ====================
function LoginPage({ handleLogin, setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && orderNumber) {
      handleLogin();
    } else {
      setError('Please enter your email and Etsy order number');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Member Login</h1>
          <p className="text-slate-600">Access your Kit Companion training materials</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Etsy Order Number
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter your Etsy order #"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Find this in your Etsy purchase confirmation email</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg text-lg"
            >
              Access Member Area
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-slate-600 text-sm">
              Don't have the kit yet?{' '}
              <a href={config.store.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">
                Purchase on {config.store.name} →
              </a>
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentPage('landing')}
          className="mt-6 text-slate-500 hover:text-slate-700 flex items-center justify-center gap-2 mx-auto"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

// ==================== MEMBER DASHBOARD ====================
function MemberDashboard({ setCurrentPage }) {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Welcome to The Kit Companion</h1>
              <p className="text-green-100">Your exclusive member training portal</p>
            </div>
          </div>
          <p className="text-green-50">
            Access interactive training labs, downloadable resources, and stay protected with the latest scam alerts.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            icon={<Play className="w-8 h-8" />}
            title="Training Lab"
            description="Practice spotting scams with interactive email, text, and popup simulations"
            buttonText="Start Training"
            onClick={() => setCurrentPage('training')}
            color="blue"
          />
          <DashboardCard
            icon={<FileText className="w-8 h-8" />}
            title="Downloadable Materials"
            description="Print reference cards, checklists, and action plan worksheets"
            buttonText="View Downloads"
            onClick={() => {}}
            color="purple"
          />
          <DashboardCard
            icon={<AlertTriangle className="w-8 h-8" />}
            title="Latest Scam Alerts"
            description="Stay informed about new scam tactics targeting seniors"
            buttonText="View Alerts"
            onClick={() => {}}
            color="red"
          />
        </div>

        {/* Module Progress */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Training Modules
          </h2>
          <div className="space-y-4">
            <ModuleItem number={1} title="Understanding the Landscape" status="completed" />
            <ModuleItem number={2} title="Email Phishing Deep Dive" status="completed" />
            <ModuleItem number={3} title="Smishing: Text Message Scams" status="in-progress" />
            <ModuleItem number={4} title="Vishing: Phone Call Scams" status="locked" />
            <ModuleItem number={5} title="Social Media & Marketplace Safety" status="locked" />
            <ModuleItem number={6} title="Your Personal Safety Action Plan" status="locked" />
          </div>
        </div>

        {/* Resources Quick Links */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Quick Resources
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickLink icon={<Phone />} label="Emergency Hotline" onClick={() => setCurrentPage('emergency')} />
            <QuickLink icon={<Settings />} label="Privacy Settings" onClick={() => setCurrentPage('resources')} />
            <QuickLink icon={<ShoppingBag />} label="Security Tools" onClick={() => setCurrentPage('marketplace')} />
            <QuickLink icon={<CreditCard />} label="Free Credit Report" href={config.emergency.credit[0].url} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ icon, title, description, buttonText, onClick, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-violet-600',
    red: 'from-red-500 to-rose-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm mb-4">{description}</p>
      <button
        onClick={onClick}
        className="w-full py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
      >
        {buttonText} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function ModuleItem({ number, title, status }) {
  const statusConfig = {
    completed: { icon: <CheckCircle className="w-5 h-5 text-green-500" />, bg: 'bg-green-50', text: 'text-green-700', label: 'Completed' },
    'in-progress': { icon: <Play className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50', text: 'text-blue-700', label: 'In Progress' },
    locked: { icon: <Lock className="w-5 h-5 text-slate-400" />, bg: 'bg-slate-50', text: 'text-slate-500', label: 'Locked' }
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl ${config.bg} border border-slate-200`}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center font-bold text-slate-600">
          {number}
        </div>
        <span className={`font-medium ${status === 'locked' ? 'text-slate-500' : 'text-slate-800'}`}>{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {config.icon}
        <span className={`text-sm font-medium ${config.text}`}>{config.label}</span>
      </div>
    </div>
  );
}

function QuickLink({ icon, label, onClick, href }) {
  const content = (
    <>
      <span className="text-blue-600">{icon}</span>
      <span className="text-slate-700 font-medium">{label}</span>
    </>
  );

  if (href) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
      >
        {content}
        <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
      </a>
    );
  }

  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-left"
    >
      {content}
      <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
    </button>
  );
}

// ==================== TRAINING LAB ====================
function TrainingLab({ setCurrentPage }) {
  const [view, setView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedExample, setSelectedExample] = useState(null);
  const [examples, setExamples] = useState({ email: [], text: [], marketplace: [], popup: [] });
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const categories = [
    { key: 'email', label: 'Email Scams', icon: <Mail className="w-8 h-8" />, color: 'from-blue-500 to-blue-600', description: 'Phishing emails that try to steal your personal information', file: 'email-scams.json' },
    { key: 'text', label: 'Text Message Scams', icon: <MessageSquare className="w-8 h-8" />, color: 'from-green-500 to-emerald-600', description: 'Smishing attacks that arrive as text messages on your phone', file: 'text-scams.json' },
    { key: 'marketplace', label: 'Marketplace Scams', icon: <ShoppingCart className="w-8 h-8" />, color: 'from-purple-500 to-violet-600', description: 'Fraud on Facebook Marketplace, Craigslist, and online stores', file: 'marketplace-scams.json' },
    { key: 'popup', label: 'Pop-up Scams', icon: <Monitor className="w-8 h-8" />, color: 'from-red-500 to-rose-600', description: 'Fake warnings and alerts that appear in your browser', file: 'popup-scams.json' }
  ];

  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      try {
        const [emailRes, textRes, marketRes, popupRes, quizRes] = await Promise.all([
          fetch('/training-data/email-scams.json').then(r => r.json()).catch(() => []),
          fetch('/training-data/text-scams.json').then(r => r.json()).catch(() => []),
          fetch('/training-data/marketplace-scams.json').then(r => r.json()).catch(() => []),
          fetch('/training-data/popup-scams.json').then(r => r.json()).catch(() => []),
          fetch('/training-data/quiz.json').then(r => r.json()).catch(() => [])
        ]);
        setExamples({ email: emailRes, text: textRes, marketplace: marketRes, popup: popupRes });
        setQuizQuestions(quizRes);
      } catch (err) {
        console.error('Failed to load training data:', err);
      }
      setLoading(false);
    }
    loadContent();
  }, []);

  const navigateTo = (newView, category = null, example = null) => {
    setView(newView);
    if (category !== undefined) setSelectedCategory(category);
    if (example !== undefined) setSelectedExample(example);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Training Lab...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {view === 'home' && (
          <TrainingLabHome
            categories={categories}
            examples={examples}
            quizQuestions={quizQuestions}
            navigateTo={navigateTo}
            setCurrentPage={setCurrentPage}
          />
        )}
        {view === 'category' && selectedCategory && (
          <TrainingLabCategory
            category={categories.find(c => c.key === selectedCategory)}
            examples={examples[selectedCategory] || []}
            navigateTo={navigateTo}
            difficultyFilter={difficultyFilter}
            setDifficultyFilter={setDifficultyFilter}
          />
        )}
        {view === 'detail' && selectedExample && (
          <TrainingLabDetail
            example={selectedExample}
            navigateTo={navigateTo}
            categoryKey={selectedCategory}
          />
        )}
        {view === 'quiz' && (
          <TrainingLabQuiz
            questions={quizQuestions}
            navigateTo={navigateTo}
          />
        )}
      </div>
    </div>
  );
}

// ---- Training Lab Home ----
function TrainingLabHome({ categories, examples, quizQuestions, navigateTo, setCurrentPage }) {
  const totalExamples = Object.values(examples).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <>
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 rounded-full px-4 py-2 mb-4">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span className="text-blue-700 text-sm font-medium">Members-Only Training</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Scam Spotter Training Lab</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Study real-world scam examples, learn how to spot the red flags, and test your knowledge with interactive quizzes.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalExamples}</p>
          <p className="text-sm text-slate-600">Real Examples</p>
        </div>
        <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">4</p>
          <p className="text-sm text-slate-600">Scam Categories</p>
        </div>
        <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{quizQuestions.length}</p>
          <p className="text-sm text-slate-600">Quiz Questions</p>
        </div>
        <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-orange-600"><Printer className="w-6 h-6 inline" /></p>
          <p className="text-sm text-slate-600">Print-Friendly</p>
        </div>
      </div>

      {/* Take the Test CTA */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 sm:p-8 text-white mb-10 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Award className="w-8 h-8" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold mb-2">Test Your Scam-Spotting Skills</h2>
            <p className="text-orange-100">
              Think you can spot a scam? Take our interactive quiz with {quizQuestions.length} real-world questions across all categories.
            </p>
          </div>
          <button
            onClick={() => navigateTo('quiz')}
            className="px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all shadow-lg flex items-center gap-2 flex-shrink-0"
          >
            <Play className="w-5 h-5" /> Start Quiz
          </button>
        </div>
      </div>

      {/* Category Cards */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Browse by Category</h2>
      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => navigateTo('category', cat.key)}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all text-left group"
          >
            <div className={`bg-gradient-to-r ${cat.color} p-5 text-white`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{cat.label}</h3>
                  <p className="text-white/80 text-sm">{examples[cat.key]?.length || 0} examples</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-slate-600 mb-3">{cat.description}</p>
              <span className="text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore Examples <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Access - Recent Examples */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Examples</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {Object.entries(examples).flatMap(([catKey, items]) =>
          items.slice(0, 2).map(item => ({ ...item, catKey }))
        ).slice(0, 6).map((item) => (
          <ExampleCard
            key={item.id}
            example={item}
            onClick={() => navigateTo('detail', item.catKey, item)}
          />
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="text-slate-500 hover:text-slate-700 flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    </>
  );
}

// ---- Example Card (compact) ----
function ExampleCard({ example, onClick }) {
  const typeConfig = {
    email: { icon: <Mail className="w-4 h-4" />, bg: 'bg-blue-100 text-blue-700' },
    text: { icon: <MessageSquare className="w-4 h-4" />, bg: 'bg-green-100 text-green-700' },
    marketplace: { icon: <ShoppingCart className="w-4 h-4" />, bg: 'bg-purple-100 text-purple-700' },
    popup: { icon: <Monitor className="w-4 h-4" />, bg: 'bg-red-100 text-red-700' }
  };
  const tc = typeConfig[example.type] || typeConfig.email;
  const diffColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700'
  };

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow border border-slate-200 p-4 hover:shadow-lg hover:border-blue-300 transition-all text-left w-full"
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tc.bg} flex items-center gap-1`}>
          {tc.icon} {example.type}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${diffColors[example.difficulty] || ''}`}>
          {example.difficulty}
        </span>
        {example.isScam ? (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">SCAM</span>
        ) : (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">LEGIT</span>
        )}
      </div>
      <h3 className="font-bold text-slate-800 mb-1 text-sm">{example.title}</h3>
      <p className="text-xs text-slate-500 font-mono truncate">From: {example.sender}</p>
    </button>
  );
}

// ---- Category Browse View ----
function TrainingLabCategory({ category, examples, navigateTo, difficultyFilter, setDifficultyFilter }) {
  const filtered = difficultyFilter === 'all'
    ? examples
    : examples.filter(e => e.difficulty === difficultyFilter);

  return (
    <>
      {/* Back Navigation */}
      <button
        onClick={() => navigateTo('home')}
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Training Lab
      </button>

      {/* Category Header */}
      <div className={`bg-gradient-to-r ${category.color} rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-lg`}>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            {category.icon}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{category.label}</h1>
            <p className="text-white/80">{examples.length} real-world examples to study</p>
          </div>
        </div>
        <p className="text-white/90">{category.description}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <span className="text-slate-600 font-medium py-2">Difficulty:</span>
        {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
          <button
            key={level}
            onClick={() => setDifficultyFilter(level)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              difficultyFilter === level
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
            }`}
          >
            {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      {/* Examples Grid */}
      {filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((example) => (
            <ExampleListCard
              key={example.id}
              example={example}
              onClick={() => navigateTo('detail', category.key, example)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-500">No examples found for this difficulty level.</p>
        </div>
      )}
    </>
  );
}

// ---- Example List Card (larger for browse) ----
function ExampleListCard({ example, onClick }) {
  const typeConfig = {
    email: { icon: <Mail className="w-5 h-5" />, label: 'EMAIL', bg: 'bg-blue-100 text-blue-700' },
    text: { icon: <MessageSquare className="w-5 h-5" />, label: 'TEXT', bg: 'bg-green-100 text-green-700' },
    marketplace: { icon: <ShoppingCart className="w-5 h-5" />, label: 'MARKETPLACE', bg: 'bg-purple-100 text-purple-700' },
    popup: { icon: <Monitor className="w-5 h-5" />, label: 'POP-UP', bg: 'bg-red-100 text-red-700' }
  };
  const tc = typeConfig[example.type] || typeConfig.email;

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all text-left w-full"
    >
      <div className={`px-5 py-3 border-b flex items-center justify-between ${example.isScam ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${tc.bg} flex items-center gap-1`}>
            {tc.icon} {tc.label}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            example.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
            example.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {example.difficulty}
          </span>
        </div>
        <span className={`text-xs font-bold ${example.isScam ? 'text-red-600' : 'text-green-600'}`}>
          {example.isScam ? 'SCAM' : 'LEGITIMATE'}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-slate-800 text-lg mb-2">{example.title}</h3>
        <p className="text-sm text-slate-500 font-mono mb-3 truncate">From: {example.sender}</p>
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{example.body.substring(0, 120)}...</p>
        {example.redFlags && example.redFlags.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span>{example.redFlags.length} red flags identified</span>
          </div>
        )}
        <span className="text-blue-600 font-medium flex items-center gap-1 mt-3 text-sm">
          View Full Example <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </button>
  );
}

// ---- Example Detail View ----
function TrainingLabDetail({ example, navigateTo, categoryKey }) {
  const [showRedFlags, setShowRedFlags] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const typeConfig = {
    email: { icon: <Mail className="w-5 h-5" />, label: 'EMAIL', bg: 'bg-blue-100 text-blue-700', headerBg: 'bg-blue-50' },
    text: { icon: <MessageSquare className="w-5 h-5" />, label: 'TEXT MESSAGE', bg: 'bg-green-100 text-green-700', headerBg: 'bg-green-50' },
    marketplace: { icon: <ShoppingCart className="w-5 h-5" />, label: 'MARKETPLACE', bg: 'bg-purple-100 text-purple-700', headerBg: 'bg-purple-50' },
    popup: { icon: <Monitor className="w-5 h-5" />, label: 'POP-UP', bg: 'bg-red-100 text-red-700', headerBg: 'bg-red-50' }
  };
  const tc = typeConfig[example.type] || typeConfig.email;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Back Navigation */}
      <div className="flex items-center justify-between mb-6 no-print">
        <button
          onClick={() => navigateTo('category', categoryKey)}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to {categoryKey ? categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1) + ' Examples' : 'Category'}
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors"
        >
          <Printer className="w-4 h-4" /> Print This Example
        </button>
      </div>

      {/* Example Card (print-friendly) */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden print-card">
        {/* Status Banner */}
        <div className={`px-6 py-4 border-b-2 flex items-center justify-between ${example.isScam ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${tc.bg} flex items-center gap-1`}>
              {tc.icon} {tc.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              example.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
              example.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {example.difficulty}
            </span>
          </div>
          <span className={`text-lg font-bold ${example.isScam ? 'text-red-600' : 'text-green-600'}`}>
            {example.isScam ? 'THIS IS A SCAM' : 'LEGITIMATE'}
          </span>
        </div>

        {/* Title */}
        <div className="px-6 py-5 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800">{example.title}</h1>
        </div>

        {/* Simulated Message */}
        <div className="p-6">
          <div className={`rounded-xl border-2 overflow-hidden mb-6 ${example.isScam ? 'border-red-200' : 'border-slate-200'}`}>
            <div className={`px-5 py-3 border-b ${example.isScam ? 'bg-red-50 border-red-200' : 'bg-slate-100 border-slate-200'}`}>
              <p className="text-sm text-slate-600 mb-1"><strong>From:</strong> <span className="font-mono text-slate-800">{example.sender}</span></p>
              {example.subject && example.subject !== 'Text Message' && (
                <p className="text-sm text-slate-600"><strong>Subject:</strong> <span className="text-slate-800">{example.subject}</span></p>
              )}
            </div>
            <div className="p-5 bg-white">
              <pre className="whitespace-pre-wrap text-slate-700 font-sans text-base leading-relaxed">
                {example.body}
              </pre>
            </div>
          </div>

          {/* Red Flags Section (expandable on screen, always shown in print) */}
          {example.redFlags && example.redFlags.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setShowRedFlags(!showRedFlags)}
                className="w-full flex items-center justify-between p-4 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors no-print"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <span className="font-bold text-red-800 text-lg">Red Flags ({example.redFlags.length})</span>
                </div>
                {showRedFlags ? <ChevronUp className="w-5 h-5 text-red-600" /> : <ChevronDown className="w-5 h-5 text-red-600" />}
              </button>
              <div className={`${showRedFlags ? 'block' : 'hidden'} print-always-show mt-3 space-y-3`}>
                {example.redFlags.map((flag, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-red-800">{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation Section (expandable on screen, always shown in print) */}
          <div className="mb-6">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-colors no-print"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-blue-800 text-lg">Why This Is {example.isScam ? 'a Scam' : 'Legitimate'}</span>
              </div>
              {showExplanation ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-blue-600" />}
            </button>
            <div className={`${showExplanation ? 'block' : 'hidden'} print-always-show mt-3`}>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-blue-900 leading-relaxed">{example.explanation}</p>
              </div>
            </div>
          </div>

          {/* How to Spot Section */}
          {example.howToSpot && (
            <div className="p-5 bg-green-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-green-600" />
                <span className="font-bold text-green-800 text-lg">How to Protect Yourself</span>
              </div>
              <p className="text-green-800 leading-relaxed">{example.howToSpot}</p>
            </div>
          )}
        </div>
      </div>

      {/* Print Header (only visible when printing) */}
      <div className="print-header hidden">
        <p>Senior Cyber Secure — Scam Spotter Training Lab</p>
      </div>
    </>
  );
}

// ---- Quiz / Test View ----
function TrainingLabQuiz({ questions, navigateTo }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  const filteredQuestions = categoryFilter === 'all'
    ? questions
    : questions.filter(q => q.category === categoryFilter);

  const activeQuestions = filteredQuestions;

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setAnswered(false);
    setAnswers([]);
    setReviewMode(false);
  };

  const handleAnswer = (answerIndex) => {
    if (answered) return;
    setSelectedAnswer(answerIndex);
    setAnswered(true);
    const isCorrect = answerIndex === activeQuestions[currentQuestion].correctAnswer;
    if (isCorrect) setScore(score + 1);
    setAnswers([...answers, { questionIndex: currentQuestion, selected: answerIndex, correct: isCorrect }]);
  };

  const nextQuestion = () => {
    if (currentQuestion < activeQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setAnswered(false);
    setAnswers([]);
    setReviewMode(false);
  };

  const handlePrintResults = () => {
    window.print();
  };

  // Quiz Start / Category Selection
  if (!quizStarted) {
    return (
      <>
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Training Lab
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Scam Spotter Quiz</h1>
            <p className="text-orange-100">Test your knowledge with real-world multiple choice questions</p>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Choose Your Quiz</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { key: 'all', label: 'All Categories', count: questions.length, icon: <BookOpen className="w-5 h-5" />, color: 'border-blue-300 bg-blue-50' },
                { key: 'email', label: 'Email Scams', count: questions.filter(q => q.category === 'email').length, icon: <Mail className="w-5 h-5" />, color: 'border-blue-300 bg-blue-50' },
                { key: 'text', label: 'Text Scams', count: questions.filter(q => q.category === 'text').length, icon: <MessageSquare className="w-5 h-5" />, color: 'border-green-300 bg-green-50' },
                { key: 'popup', label: 'Pop-up Scams', count: questions.filter(q => q.category === 'popup').length, icon: <Monitor className="w-5 h-5" />, color: 'border-red-300 bg-red-50' },
                { key: 'marketplace', label: 'Marketplace Scams', count: questions.filter(q => q.category === 'marketplace').length, icon: <ShoppingCart className="w-5 h-5" />, color: 'border-purple-300 bg-purple-50' }
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setCategoryFilter(opt.key)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    categoryFilter === opt.key
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600">{opt.icon}</span>
                    <div>
                      <p className="font-bold text-slate-800">{opt.label}</p>
                      <p className="text-sm text-slate-500">{opt.count} questions</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredQuestions.length > 0 ? (
              <button
                onClick={handleStartQuiz}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg text-lg flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" /> Start Quiz ({filteredQuestions.length} Questions)
              </button>
            ) : (
              <p className="text-center text-slate-500 py-4">No questions available for this category yet.</p>
            )}
          </div>
        </div>
      </>
    );
  }

  // Review Mode
  if (reviewMode) {
    const reviewQ = activeQuestions[reviewIndex];
    const reviewA = answers[reviewIndex];

    return (
      <>
        <button
          onClick={() => setReviewMode(false)}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 font-medium transition-colors no-print"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Results
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-100 px-6 py-4 border-b flex justify-between items-center">
            <span className="font-medium text-slate-700">Review: Question {reviewIndex + 1} of {activeQuestions.length}</span>
            <span className={`font-bold ${reviewA.correct ? 'text-green-600' : 'text-red-600'}`}>
              {reviewA.correct ? 'Correct' : 'Incorrect'}
            </span>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">{reviewQ.question}</h3>

            <div className="space-y-3 mb-6">
              {reviewQ.options.map((option, idx) => {
                const isCorrect = idx === reviewQ.correctAnswer;
                const wasSelected = idx === reviewA.selected;
                let style = 'border-slate-200 bg-white';
                if (isCorrect) style = 'border-green-500 bg-green-50';
                else if (wasSelected && !isCorrect) style = 'border-red-500 bg-red-50';

                return (
                  <div key={idx} className={`p-4 rounded-xl border-2 ${style} flex items-start gap-3`}>
                    <span className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-slate-800 pt-1">{option}</span>
                    {isCorrect && <CheckCircle className="w-5 h-5 text-green-600 ml-auto flex-shrink-0 mt-1" />}
                    {wasSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 ml-auto flex-shrink-0 mt-1" />}
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="font-bold text-blue-800 mb-1">Explanation:</p>
              <p className="text-blue-700">{reviewQ.explanation}</p>
            </div>

            <div className="flex gap-3 mt-6 no-print">
              <button
                onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
                disabled={reviewIndex === 0}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setReviewIndex(Math.min(activeQuestions.length - 1, reviewIndex + 1))}
                disabled={reviewIndex === activeQuestions.length - 1}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Results View
  if (showResult) {
    const percentage = Math.round((score / activeQuestions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="print-card">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-orange-100'}`}>
            {passed ? (
              <Award className="w-12 h-12 text-green-600" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-orange-600" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {passed ? 'Great Job!' : 'Keep Practicing!'}
          </h2>
          <p className="text-5xl font-bold mb-2">
            <span className={passed ? 'text-green-600' : 'text-orange-600'}>{percentage}%</span>
          </p>
          <p className="text-slate-600 mb-2">
            You scored <strong className="text-blue-600">{score}</strong> out of <strong>{activeQuestions.length}</strong>
          </p>
          <p className="text-sm text-slate-500 mb-8">
            {passed
              ? "You have strong scam-detection skills. Stay vigilant and keep learning!"
              : "Don't worry — recognizing scams is a skill that improves with practice. Review the answers below and try again!"}
          </p>

          {/* Answer Summary */}
          <div className="text-left mb-8">
            <h3 className="font-bold text-slate-800 mb-4 text-lg">Answer Summary</h3>
            <div className="space-y-2">
              {answers.map((a, idx) => (
                <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${a.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                  {a.correct ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <span className="text-sm text-slate-700 flex-1">
                    Q{idx + 1}: {activeQuestions[idx].question.substring(0, 80)}...
                  </span>
                  <button
                    onClick={() => { setReviewMode(true); setReviewIndex(idx); }}
                    className="text-blue-600 text-sm font-medium hover:underline no-print"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 no-print">
            <button
              onClick={resetQuiz}
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> Try Again
            </button>
            <button
              onClick={handlePrintResults}
              className="flex-1 py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" /> Print Results
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="flex-1 py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> Training Lab
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz Question
  const q = activeQuestions[currentQuestion];

  return (
    <>
      <button
        onClick={() => { if (confirm('Are you sure? Your progress will be lost.')) resetQuiz(); }}
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 font-medium transition-colors no-print"
      >
        <ArrowLeft className="w-5 h-5" /> Exit Quiz
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Progress Header */}
        <div className="bg-slate-100 px-6 py-4 border-b">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-slate-700">Question {currentQuestion + 1} of {activeQuestions.length}</span>
            <span className="text-blue-600 font-bold">Score: {score}/{activeQuestions.length}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / activeQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-6">
          {/* Category Badge */}
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              q.category === 'email' ? 'bg-blue-100 text-blue-700' :
              q.category === 'text' ? 'bg-green-100 text-green-700' :
              q.category === 'popup' ? 'bg-red-100 text-red-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {q.category.toUpperCase()}
            </span>
          </div>

          {/* Question */}
          <h3 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">{q.question}</h3>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {q.options.map((option, idx) => {
              let style = 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer';
              if (answered) {
                const isCorrect = idx === q.correctAnswer;
                const wasSelected = idx === selectedAnswer;
                if (isCorrect) style = 'border-green-500 bg-green-50';
                else if (wasSelected && !isCorrect) style = 'border-red-500 bg-red-50';
                else style = 'border-slate-200 bg-slate-50 opacity-60';
              } else if (selectedAnswer === idx) {
                style = 'border-blue-500 bg-blue-50';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered}
                  className={`w-full p-4 rounded-xl border-2 ${style} flex items-start gap-3 text-left transition-all`}
                >
                  <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    answered && idx === q.correctAnswer ? 'border-green-500 text-green-600 bg-green-100' :
                    answered && idx === selectedAnswer ? 'border-red-500 text-red-600 bg-red-100' :
                    'border-slate-300 text-slate-600'
                  }`}>
                    {answered && idx === q.correctAnswer ? <CheckCircle className="w-5 h-5" /> :
                     answered && idx === selectedAnswer && idx !== q.correctAnswer ? <XCircle className="w-5 h-5" /> :
                     String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-slate-800 pt-1">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div className={`p-5 rounded-xl mb-4 ${selectedAnswer === q.correctAnswer ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
              <div className="flex items-start gap-3">
                {selectedAnswer === q.correctAnswer ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`font-bold mb-2 ${selectedAnswer === q.correctAnswer ? 'text-green-800' : 'text-red-800'}`}>
                    {selectedAnswer === q.correctAnswer ? 'Correct!' : 'Not quite right'}
                  </h4>
                  <p className={selectedAnswer === q.correctAnswer ? 'text-green-700' : 'text-red-700'}>
                    {q.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Button */}
          {answered && (
            <button
              onClick={nextQuestion}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-lg"
            >
              {currentQuestion < activeQuestions.length - 1 ? 'Next Question' : 'See My Results'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function LabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
      }`}
    >
      {icon} {label}
    </button>
  );
}

// ==================== RESOURCE CENTER ====================
function ResourceCenter() {
  const [expandedSection, setExpandedSection] = useState('windows');

  const resources = {
    windows: {
      title: 'Windows PC',
      icon: <Monitor className="w-6 h-6" />,
      items: [
        { label: 'Enable Automatic Updates', url: 'https://support.microsoft.com/en-us/windows/keep-your-pc-up-to-date' },
        { label: 'Windows Security Settings', url: 'https://support.microsoft.com/en-us/windows/stay-protected-with-windows-security' },
        { label: 'Privacy Dashboard', url: 'https://account.microsoft.com/privacy' },
        { label: 'Set Up Two-Factor Auth', url: 'https://support.microsoft.com/en-us/account-billing/how-to-use-two-step-verification' }
      ]
    },
    mac: {
      title: 'Mac',
      icon: <Apple className="w-6 h-6" />,
      items: [
        { label: 'Enable Automatic Updates', url: 'https://support.apple.com/en-us/HT201541' },
        { label: 'Mac Security & Privacy', url: 'https://support.apple.com/en-us/HT201220' },
        { label: 'iCloud Privacy', url: 'https://support.apple.com/en-us/HT208650' },
        { label: 'Set Up Two-Factor Auth', url: 'https://support.apple.com/en-us/HT204915' }
      ]
    },
    iphone: {
      title: 'iPhone / iPad',
      icon: <Smartphone className="w-6 h-6" />,
      items: [
        { label: 'iOS Security Settings', url: 'https://support.apple.com/en-us/HT201303' },
        { label: 'Privacy Controls', url: 'https://support.apple.com/en-us/HT210393' },
        { label: 'App Tracking Controls', url: 'https://support.apple.com/en-us/HT212025' },
        { label: 'Face ID & Passcode', url: 'https://support.apple.com/en-us/HT208108' }
      ]
    },
    android: {
      title: 'Android Phone',
      icon: <Smartphone className="w-6 h-6" />,
      items: [
        { label: 'Android Security Settings', url: 'https://support.google.com/android/answer/9079631' },
        { label: 'Privacy Dashboard', url: 'https://support.google.com/accounts/answer/7028918' },
        { label: 'App Permissions', url: 'https://support.google.com/googleplay/answer/6270602' },
        { label: 'Google Account Security', url: 'https://myaccount.google.com/security' }
      ]
    },
    chrome: {
      title: 'Chrome Browser',
      icon: <Chrome className="w-6 h-6" />,
      items: [
        { label: 'Privacy & Security Settings', url: 'https://support.google.com/chrome/answer/114836' },
        { label: 'Clear Browsing Data', url: 'https://support.google.com/chrome/answer/2392709' },
        { label: 'Manage Passwords', url: 'https://support.google.com/chrome/answer/95606' },
        { label: 'Block Pop-ups', url: 'https://support.google.com/chrome/answer/95472' }
      ]
    },
    safari: {
      title: 'Safari Browser',
      icon: <Globe className="w-6 h-6" />,
      items: [
        { label: 'Privacy Settings', url: 'https://support.apple.com/guide/safari/privacy-sfri35610/mac' },
        { label: 'Manage Cookies', url: 'https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac' },
        { label: 'Prevent Tracking', url: 'https://support.apple.com/guide/safari/prevent-cross-site-tracking-sfri40732/mac' },
        { label: 'Password Management', url: 'https://support.apple.com/guide/safari/autofill-credit-card-info-ibrw1103/mac' }
      ]
    },
    firefox: {
      title: 'Firefox Browser',
      icon: <Globe className="w-6 h-6" />,
      items: [
        { label: 'Enhanced Tracking Protection', url: 'https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop' },
        { label: 'Privacy Settings', url: 'https://support.mozilla.org/en-US/kb/privacy-settings' },
        { label: 'Manage Passwords', url: 'https://support.mozilla.org/en-US/kb/password-manager-remember-delete-edit-logins' },
        { label: 'Block Pop-ups', url: 'https://support.mozilla.org/en-US/kb/pop-blocker-settings-exceptions-troubleshooting' }
      ]
    }
  };

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

// ==================== AFFILIATE MARKETPLACE ====================
function AffiliateMarketplace() {
  const productIcons = {
    shield: <Shield className="w-8 h-8" />,
    eye: <Eye className="w-8 h-8" />,
    key: <Key className="w-8 h-8" />,
    trash2: <Trash2 className="w-8 h-8" />
  };

  const products = config.products;

  const colors = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-violet-600',
    green: 'from-green-500 to-emerald-600',
    orange: 'from-orange-500 to-amber-600'
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 rounded-full px-4 py-2 mb-4">
            <ShoppingBag className="w-4 h-4 text-green-600" />
            <span className="text-green-700 text-sm font-medium">Security Toolbox</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Your Security Toolbox</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Recommended security products explained in plain language. These tools provide extra layers of protection for your digital life.
          </p>
        </div>

        <div className="space-y-8">
          {products.map((category, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              {/* Category Header */}
              <div className={`bg-gradient-to-r ${colors[category.color]} p-6 text-white`}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    {productIcons[category.iconKey]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{category.category}</h2>
                    <p className="text-white/80 text-sm">"{category.tagline}"</p>
                  </div>
                </div>
                <p className="text-white/90">{category.description}</p>
              </div>

              {/* Products */}
              <div className="p-6 grid sm:grid-cols-3 gap-4">
                {category.items.map((item, itemIdx) => (
                  <a
                    key={itemIdx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 group-hover:text-blue-600">{item.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-slate-600">{item.rating}</span>
                      </div>
                    </div>
                    <p className="text-blue-600 font-medium mb-3">{item.price}</p>
                    <div className="flex items-center gap-1 text-sm text-slate-500 group-hover:text-blue-500">
                      Learn More <ExternalLink className="w-4 h-4" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Affiliate Disclosure */}
        <div className="mt-8 p-4 bg-slate-100 rounded-xl text-center">
          <p className="text-sm text-slate-600">
            <strong>Affiliate Disclosure:</strong> We may earn a commission when you purchase through these links at no extra cost to you. 
            This helps support our educational mission.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================== EMERGENCY DIRECTORY ====================
function EmergencyDirectory() {
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

function ResourceCard({ name, description, phone, url, urgent, badge }) {
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

// ==================== FOOTER ====================
function Footer({ setCurrentPage }) {
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
                <p className="text-slate-400 text-sm">Parent Protection Kit</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-4 max-w-sm">
              Empowering seniors and their families with the knowledge and tools to stay safe from online scams and fraud.
            </p>
            <a
              href={config.store.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              Get the Kit on {config.store.name} <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><button onClick={() => setCurrentPage('landing')} className="hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => setCurrentPage('resources')} className="hover:text-white transition-colors">Privacy Settings</button></li>
              <li><button onClick={() => setCurrentPage('marketplace')} className="hover:text-white transition-colors">Security Tools</button></li>
              <li><button onClick={() => setCurrentPage('emergency')} className="hover:text-white transition-colors">Emergency Hotline</button></li>
              <li><button onClick={() => setCurrentPage('login')} className="hover:text-white transition-colors">Member Login</button></li>
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
