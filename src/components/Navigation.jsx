import React from 'react';
import { Shield, Lock, Phone, Menu, X, Home, BookOpen, ShoppingBag, Settings, LogOut } from 'lucide-react';
import config from '../config.json';
import { useGo, usePageKey } from '../routes.js';

export default function Navigation({ isLoggedIn, handleLogout, mobileMenuOpen, setMobileMenuOpen }) {
  const go = useGo();
  const currentPage = usePageKey();
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <button onClick={() => go('landing')} className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Senior Cyber Secure</h1>
              <p className="text-xs text-blue-600 font-medium -mt-1">{config.site.shortTagline}</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <NavButton active={currentPage === 'landing'} onClick={() => go('landing')}>
              <Home className="w-4 h-4" /> Home
            </NavButton>
            <NavButton active={currentPage === 'resources'} onClick={() => go('resources')}>
              <Settings className="w-4 h-4" /> Lock It Down
            </NavButton>
            <NavButton active={currentPage === 'marketplace'} onClick={() => go('marketplace')}>
              <ShoppingBag className="w-4 h-4" /> Security Toolbox
            </NavButton>
            <NavButton active={currentPage === 'emergency'} onClick={() => go('emergency')}>
              <Phone className="w-4 h-4" /> Emergency Hotline
            </NavButton>
            <NavButton active={currentPage === 'training'} onClick={() => go('training')}>
              <BookOpen className="w-4 h-4" /> Training Lab
            </NavButton>

            {isLoggedIn ? (
              <>
                <NavButton active={currentPage === 'dashboard'} onClick={() => go('dashboard')} highlight>
                  <BookOpen className="w-4 h-4" /> Member Area
                </NavButton>
                <button onClick={handleLogout} className="ml-2 px-4 py-2 text-sm text-slate-600 hover:text-red-600 transition-colors flex items-center gap-1">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <button 
                onClick={() => go('login')}
                className="ml-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Lock className="w-4 h-4" /> Member Sign In
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
            <MobileNavButton onClick={() => { go('landing'); setMobileMenuOpen(false); }}>Home</MobileNavButton>
            <MobileNavButton onClick={() => { go('resources'); setMobileMenuOpen(false); }}>Lock It Down</MobileNavButton>
            <MobileNavButton onClick={() => { go('marketplace'); setMobileMenuOpen(false); }}>Security Toolbox</MobileNavButton>
            <MobileNavButton onClick={() => { go('emergency'); setMobileMenuOpen(false); }}>Emergency Hotline</MobileNavButton>
            <MobileNavButton onClick={() => { go('training'); setMobileMenuOpen(false); }}>Training Lab</MobileNavButton>
            {isLoggedIn ? (
              <>
                <MobileNavButton onClick={() => { go('dashboard'); setMobileMenuOpen(false); }} highlight>Member Area</MobileNavButton>
                <MobileNavButton onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Logout</MobileNavButton>
              </>
            ) : (
              <MobileNavButton onClick={() => { go('login'); setMobileMenuOpen(false); }} highlight>Member Sign In</MobileNavButton>
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
