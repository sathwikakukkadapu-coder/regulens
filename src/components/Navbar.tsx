import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  RotateCcw,
  Bell,
  Building2,
  ChevronDown,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ReviewCase, Finding } from '../types';

interface NavbarProps {
  onToggleMobile: () => void;
  activeCase: ReviewCase | null;
  cases: ReviewCase[];
  findings: Finding[];
  onSelectCase: (caseId: string) => void;
  onLoadDemoCase: () => void;
  onResetData: () => void;
  onNavigateToFindings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobile,
  activeCase,
  cases,
  findings,
  onSelectCase,
  onLoadDemoCase,
  onResetData,
  onNavigateToFindings
}) => {
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const highFindings = findings.filter(f => f.severity === 'High' && f.status === 'Open');

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hamburger & Case Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobile}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Active Case Picker */}
          <div className="relative">
            <button
              onClick={() => setShowCaseDropdown(!showCaseDropdown)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100/80 transition-colors text-left"
            >
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="max-w-[200px] sm:max-w-[280px] truncate">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Regulatory Case</p>
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {activeCase ? activeCase.institutionName : 'Select an Institution'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {showCaseDropdown && (
              <div
                className="absolute left-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-sm animate-in fade-in-50"
                onClick={() => setShowCaseDropdown(false)}
              >
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Active Case
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {cases.map(c => (
                    <button
                      key={c.id}
                      onClick={() => onSelectCase(c.id)}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between ${
                        activeCase?.id === c.id ? 'bg-blue-50/70 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="font-medium text-slate-900 truncate">{c.institutionName}</p>
                        <p className="text-xs text-slate-500">{c.referenceNumber} • {c.location}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        c.status === 'Needs Review' ? 'bg-amber-100 text-amber-800' :
                        c.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {c.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Demo Actions & Indicators */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Case Button */}
          <button
            onClick={onLoadDemoCase}
            title="Load North Valley Institute Demo Case"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Load Demo Case</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all cases, uploaded documents, and findings to clean initial state?')) {
                onResetData();
              }
            }}
            title="Reset All Case Data"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Notifications / Alerts Menu */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {highFindings.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                  {highFindings.length}
                </span>
              )}
            </button>

            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in-50">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase">Regulatory Alerts</span>
                  <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                    {highFindings.length} Critical
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto p-1">
                  {highFindings.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      No critical unresolved regulatory flags.
                    </div>
                  ) : (
                    highFindings.map(f => (
                      <div
                        key={f.id}
                        onClick={() => {
                          setShowNotificationMenu(false);
                          onNavigateToFindings();
                        }}
                        className="p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer border-b border-slate-100 last:border-0"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="truncate">{f.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{f.reason}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Demonstration Watermark */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>SIH Synthetic Mode</span>
          </div>
        </div>
      </div>
    </header>
  );
};
