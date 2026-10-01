import logo from "../../assets/LOGO_img.jpeg";
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  LineChart,
  MessageSquare,
  Map,
  Compass,
  BookOpen,
  Sparkles,
  Bell,
  Menu,
  X,
  ChevronUp,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { clearAuthentication, getAuthenticatedUser } from '../../features/auth/auth';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Insights', href: '/insights', icon: LineChart },
    ]
  },
  {
    title: 'Wellbeing',
    items: [
      { name: 'Assessments', href: '/assessments', icon: ClipboardList },
      { name: 'AI Companion', href: '/ai-companion', icon: MessageSquare },
      { name: 'Recommendations', href: '/recommendations', icon: Sparkles },
      { name: 'Smart Alerts', href: '/smart-alerts', icon: Bell },
      { name: 'Wellness Plan', href: '/wellness-plan', icon: Map },
    ]
  },
  {
    title: 'Explore',
    items: [
      { name: 'Programs', href: '/programs', icon: Compass },
      { name: 'Resources', href: '/resources', icon: BookOpen },
    ]
  }
];

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = getAuthenticatedUser();

  function handleSignOut() {
    clearAuthentication();
    navigate('/sign-in', { replace: true });
  }

  return (
    <div className="flex h-screen bg-[var(--color-surface-primary)] overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[248px] transform bg-[#fbfcf9] border-r border-[var(--color-border)] transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-[92px] px-6 border-b border-[var(--color-border)]/60">
          <Link to="/dashboard" aria-label="SEIMEI dashboard" className="flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]">
            <span className="relative h-[52px] w-20 shrink-0 overflow-hidden" aria-hidden="true">
              <img src={logo} alt="" className="absolute left-[-47px] top-[-43px] h-[184px] w-[184px] max-w-none" />
            </span>
            <div className="leading-none">
              <span className="text-[23px] font-semibold tracking-[-0.04em] text-[var(--color-brand-950)]">SEIMEI</span>
              <span className="block text-[9px] text-[var(--color-brand-700)] mt-1 tracking-tight">Corporate Longevity Hive</span>
            </div>
          </Link>
          <button
            className="md:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]/65 mb-3">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-[var(--color-accent)] text-white shadow-sm"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-text-primary)]"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
                        )}
                        <item.icon
                          size={18}
                          className={cn(
                            "transition-colors",
                            isActive ? "text-white" : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]"
                          )}
                        />
                        {item.name}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-4 pb-5 pt-4 border-t border-[var(--color-border)]/60">
          <div className="rounded-xl bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] p-3.5 mb-4">
            <p className="text-[11px] leading-relaxed text-[var(--color-brand-800)]">Small steps today.<br />Big changes tomorrow.</p>
          </div>
          <div className="relative">
            <button type="button" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="flex w-full items-center gap-3 rounded-lg p-1 text-left hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-accent)]/10 bg-[var(--color-brand-100)] text-xs font-semibold text-[var(--color-accent)]">{user?.fullName.split(' ').map((part) => part[0]).join('') ?? 'JS'}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[var(--color-text-primary)]">{user?.fullName ?? 'Sarah Johnson'}</p>
                <p className="truncate text-[10px] text-[var(--color-text-secondary)]">{user?.role ?? 'Employee account'}</p>
              </div>
              <ChevronUp size={15} className={cn('text-[var(--color-text-secondary)] transition-transform', profileMenuOpen && 'rotate-180')} />
            </button>
            {profileMenuOpen && <div className="absolute bottom-full left-0 z-20 mb-2 w-full rounded-lg border border-[var(--color-border)] bg-white p-2 shadow-[0_8px_24px_rgba(34,54,37,0.12)]">
              <p className="truncate px-2 py-1.5 text-[10px] text-[var(--color-text-secondary)]">{user?.email}</p>
              <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-brand-50)]">
                <LogOut size={15} /> Sign Out
              </button>
            </div>}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[var(--color-surface-primary)]">
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between h-16 px-4 bg-[var(--color-surface-secondary)] border-b border-[var(--color-border)] shadow-sm">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Menu size={24} />
          </button>
          <Link to="/dashboard" aria-label="SEIMEI dashboard" className="flex items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]">
            <span className="relative h-[34px] w-10 overflow-hidden" aria-hidden="true">
              <img src={logo} alt="" className="absolute left-[-18px] top-[-17px] h-[75px] w-[75px] max-w-none" />
            </span>
            <span className="text-base font-semibold tracking-[-0.03em] text-[var(--color-brand-950)]">SEIMEI</span>
          </Link>
          <div className="w-8" /> {/* spacer for alignment */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto w-full h-full p-4 md:p-8 lg:px-10 lg:py-7">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
