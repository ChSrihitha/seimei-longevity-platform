import { useState } from 'react';
import { Activity, BarChart3, BriefcaseBusiness, Calculator, ClipboardCheck, LayoutDashboard, Menu, Users, X, LogOut } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearAuthentication, getAuthenticatedUser } from '../auth/auth';
import { cn } from '../../lib/utils';
import logo from '../../assets/LOGO_img.jpeg';

const adminNavigation = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Workforce Wellbeing', path: '/admin/workforce', icon: Activity },
  { label: 'Assessments', path: '/admin/assessments', icon: ClipboardCheck },
  { label: 'Programmes', path: '/admin/programs', icon: BriefcaseBusiness },
  { label: 'Outcomes & Recovery', path: '/admin/outcomes', icon: BarChart3 },
  { label: 'ROI Calculator', path: '/admin/roi', icon: Calculator },
  { label: 'Employees', path: '/admin/employees', icon: Users },
];

export function AdminLayout() {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const navigate = useNavigate();
  const user = getAuthenticatedUser();

  function signOut() {
    clearAuthentication();
    navigate('/sign-in', { replace: true });
  }

  return (
    <div className="flex h-screen min-h-[480px] overflow-hidden bg-[var(--color-surface-primary)] font-sans text-[var(--color-text-primary)]">
      {mobileNavigationOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-[#182119]/25 backdrop-blur-sm md:hidden"
          onClick={() => setMobileNavigationOpen(false)}
        />
      )}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-[var(--color-border)] bg-[#fbfcf9] transition-transform md:relative md:translate-x-0',
        mobileNavigationOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="flex h-[92px] items-center justify-between border-b border-[var(--color-border)]/60 px-6">
          <Link to="/admin" aria-label="SEIMEI Organization Intelligence" className="flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]">
            <span className="relative h-[52px] w-20 shrink-0 overflow-hidden" aria-hidden="true">
              <img src={logo} alt="" className="absolute left-[-47px] top-[-43px] h-[184px] w-[184px] max-w-none" />
            </span>
            <div className="leading-none">
              <span className="text-[23px] font-semibold tracking-[-0.04em] text-[var(--color-brand-950)]">SEIMEI</span>
              <span className="block text-[9px] text-[var(--color-brand-700)] mt-1 tracking-tight">Corporate Longevity Hive</span>
            </div>
          </Link>
          <button type="button" aria-label="Close navigation" onClick={() => setMobileNavigationOpen(false)} className="rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-brand-50)] md:hidden">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pb-1 pt-6">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Organization</p>
        </div>
        <nav aria-label="Organization navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {adminNavigation.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={() => setMobileNavigationOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-[var(--color-accent)] text-white shadow-sm' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-text-primary)]',
              )}
            >
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--color-border)] p-4">
          <div className="mb-4 rounded-xl bg-[var(--color-brand-50)] p-3.5">
            <p className="text-xs font-semibold text-[var(--color-brand-800)]">Prototype environment</p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">DEMO DATA. Synthetic summaries only, not live organisation analytics.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-xs font-semibold text-[var(--color-brand-800)]">KA</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{user?.fullName ?? 'Administrator'}</p>
              <p className="truncate text-[11px] text-[var(--color-text-secondary)]">{user?.email ?? 'Admin account'}</p>
            </div>
            <button type="button" onClick={signOut} title="Sign out" aria-label="Sign out" className="rounded-xl p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-800)]">
              <LogOut size={16} />
            </button>
          </div>
          <button type="button" onClick={signOut} className="mt-3 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm font-medium text-[var(--color-text-secondary)] hover:bg-white md:hidden">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-white px-4 md:hidden">
          <button type="button" aria-label="Open navigation" onClick={() => setMobileNavigationOpen(true)} className="rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-brand-50)]">
            <Menu size={20} />
          </button>
          <Link to="/admin" aria-label="SEIMEI Organization Intelligence" className="flex items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]">
            <span className="relative h-[34px] w-10 shrink-0 overflow-hidden" aria-hidden="true">
              <img src={logo} alt="" className="absolute left-[-18px] top-[-17px] h-[75px] w-[75px] max-w-none" />
            </span>
            <span className="text-base font-semibold tracking-[-0.03em] text-[var(--color-brand-950)]">SEIMEI</span>
          </Link>
          <button type="button" aria-label="Sign out" onClick={signOut} className="rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-brand-50)]">
            <LogOut size={17} />
          </button>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto bg-[var(--color-surface-primary)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
