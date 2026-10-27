import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  FileSearch,
  AlertTriangle,
  ClipboardCheck,
  FileText,
  History,
  Settings,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export type NavSection =
  | 'overview'
  | 'new-review'
  | 'cases'
  | 'verification'
  | 'findings'
  | 'checklist'
  | 'reports'
  | 'audit'
  | 'settings';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  openFindingsCount: number;
  totalCasesCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  openFindingsCount,
  totalCasesCount,
  isMobileOpen,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'overview' as NavSection, label: 'Overview', icon: LayoutDashboard },
    { id: 'new-review' as NavSection, label: 'New Review', icon: PlusCircle, isHighlight: true },
    { id: 'cases' as NavSection, label: 'Case Management', icon: FolderKanban, badge: totalCasesCount },
    { id: 'verification' as NavSection, label: 'Document Verification', icon: FileSearch },
    { id: 'findings' as NavSection, label: 'Findings & Alerts', icon: AlertTriangle, badge: openFindingsCount, badgeColor: 'bg-red-500' },
    { id: 'checklist' as NavSection, label: 'Regulatory Checklist', icon: ClipboardCheck },
    { id: 'reports' as NavSection, label: 'Reports', icon: FileText },
    { id: 'audit' as NavSection, label: 'Audit Trail', icon: History },
    { id: 'settings' as NavSection, label: 'Settings', icon: Settings }
  ];

  const handleNavClick = (id: NavSection) => {
    onSelectSection(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0F172A] text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 bg-[#0B132B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-white tracking-tight">ReguLens</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">AI</span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 tracking-wide">Evidence-Led Regulatory Review</p>
            </div>
          </div>
        </div>

        {/* SIH Banner Pill */}
        <div className="px-4 pt-4">
          <div className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-200">SIH 2024-26 Edition</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Prototype</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : item.isHighlight ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor
                          ? `${item.badgeColor} text-white`
                          : isActive
                          ? 'bg-blue-700 text-blue-100'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Reviewer / Government Profile Card */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0B132B]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-400 text-xs">
              AT
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">Dr. Aris Thorne</p>
              <p className="text-[11px] text-slate-400 truncate">Lead Regulatory Inspector</p>
            </div>
            <div title="System Active" className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
            <span>Deterministic Engine v2.4</span>
            <span className="hover:text-slate-400">Offline Verified</span>
          </div>
        </div>
      </aside>
    </>
  );
};
