import React from 'react';
import { Shield, AlertTriangle, Lock, Phone, ChevronRight, ExternalLink, CheckCircle, FileText, CreditCard, BookOpen, ShoppingBag, Settings, Play, ArrowRight, UserCircle } from 'lucide-react';
import config from '../config.json';
import { useGo } from '../routes.js';
import { useMember } from '../member/MemberContext.jsx';
import { useProgress } from '../member/useProgressState.js';
import { useTrainingData } from '../training/content.js';
import { moduleStatus, passedCount, currentModuleIndex, moduleProgress, nextStep, allModulesPassed } from '../training/progress.js';

export default function MemberDashboard() {
  const go = useGo();
  const { profile } = useMember();
  const { progress } = useProgress();
  const { modules } = useTrainingData();
  const done = passedCount(progress, modules);
  const currentIdx = currentModuleIndex(progress, modules);
  const current = currentIdx !== null ? modules[currentIdx] : null;
  const finalPassed = !!progress.finalExam?.passed;
  const continueTarget = current
    ? `/learn/${current.key}/${nextStep(moduleProgress(progress, current.key))}`
    : finalPassed ? '/certificate' : '/learn/final-exam';
  const continueLabel = current
    ? `${done > 0 || Object.keys(progress.modules).length ? 'Continue' : 'Start'} Lesson ${current.number}: ${current.title}`
    : finalPassed ? 'View My Certificate' : 'Take the Final Exam';
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
              <h1 className="text-2xl sm:text-3xl font-bold">Welcome back{profile?.displayName ? `, ${profile.displayName}` : ''}!</h1>
              <p className="text-green-100">Your scam-safety home base</p>
            </div>
          </div>
          <p className="text-green-50">
            Work through the lessons at your own pace, and keep emergency numbers close by.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            icon={<Play className="w-8 h-8" />}
            title="My Training"
            description={modules.length ? `${done} of ${modules.length} lessons complete${finalPassed ? ', certificate earned!' : ''}` : 'Eight short lessons with a certificate at the end'}
            buttonText={current ? 'Continue' : finalPassed ? 'View Certificate' : 'Final Exam'}
            onClick={() => go(continueTarget)}
            color="blue"
          />
          <DashboardCard
            icon={<FileText className="w-8 h-8" />}
            title="Downloadable Materials"
            description="Print reference cards, checklists, and action plan worksheets"
            buttonText="Coming Soon"
            disabled
            color="purple"
          />
          <DashboardCard
            icon={<AlertTriangle className="w-8 h-8" />}
            title="Latest Scam Alerts"
            description="Stay informed about new scam tactics targeting seniors"
            buttonText="Coming Soon"
            disabled
            color="red"
          />
        </div>

        {/* Module Progress */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              My Lessons
            </h2>
            <span className="text-lg text-slate-600">{done} of {modules.length} complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 mb-6" aria-hidden="true">
            <div className="bg-green-600 h-3 rounded-full" style={{ width: `${modules.length ? (done / modules.length) * 100 : 0}%` }} />
          </div>
          <button
            type="button"
            onClick={() => go(continueTarget)}
            className="w-full mb-6 py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 shadow flex items-center justify-center gap-2"
          >
            {continueLabel} <ArrowRight className="w-5 h-5" />
          </button>
          <div className="space-y-3">
            {modules.map((m, i) => {
              const st = moduleStatus(progress, modules, i);
              const status = st === 'completed' ? 'completed' : st === 'locked' ? 'locked' : 'in-progress';
              return (
                <ModuleItem
                  key={m.key}
                  number={m.number}
                  title={m.title}
                  status={status}
                  onClick={st === 'locked' ? undefined : () => go(`/learn/${m.key}`)}
                />
              );
            })}
            <ModuleItem
              number="★"
              title="Final Exam & Certificate"
              status={finalPassed ? 'completed' : allModulesPassed(progress, modules) ? 'in-progress' : 'locked'}
              onClick={allModulesPassed(progress, modules) ? () => go(finalPassed ? '/certificate' : '/learn/final-exam') : undefined}
            />
          </div>
        </div>

        {/* Resources Quick Links */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Quick Resources
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickLink icon={<UserCircle />} label="My Profile & Alerts" onClick={() => go('profile')} />
            <QuickLink icon={<Phone />} label="Emergency Hotline" onClick={() => go('emergency')} />
            <QuickLink icon={<Settings />} label="Privacy Settings" onClick={() => go('resources')} />
            <QuickLink icon={<ShoppingBag />} label="Security Tools" onClick={() => go('marketplace')} />
            <QuickLink icon={<CreditCard />} label="Free Credit Report" href={config.emergency.credit[0].url} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ icon, title, description, buttonText, onClick, color, disabled }) {
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
        disabled={disabled}
        className="w-full py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-slate-100"
      >
        {buttonText} {!disabled && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
}

function ModuleItem({ number, title, status, onClick }) {
  const statusConfig = {
    available: { icon: <ChevronRight className="w-5 h-5 text-blue-500" />, bg: 'bg-white hover:bg-blue-50', text: 'text-blue-700', label: 'Open' },
    completed: { icon: <CheckCircle className="w-5 h-5 text-green-500" />, bg: 'bg-green-50', text: 'text-green-700', label: 'Completed' },
    'in-progress': { icon: <Play className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50 hover:bg-blue-100', text: 'text-blue-700', label: 'Open' },
    locked: { icon: <Lock className="w-5 h-5 text-slate-400" />, bg: 'bg-slate-50', text: 'text-slate-500', label: 'Locked' }
  };

  const config = statusConfig[status];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`w-full text-left flex items-center justify-between p-4 rounded-xl ${config.bg} border border-slate-200 transition-colors`}
    >
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
    </button>
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
