import { useState } from 'react';
import { Activity, BarChart3, BriefcaseBusiness, ClipboardCheck, LayoutDashboard, Menu, Users, X, LogOut } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearAuthentication, getAuthenticatedUser } from '../auth/auth';
import { cn } from '../../lib/utils';

const adminNavigation = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Workforce Wellbeing', path: '/admin/workforce', icon: Activity },
  { label: 'Assessments', path: '/admin/assessments', icon: ClipboardCheck },
  { label: 'Outcomes & Recovery', path: '/admin/outcomes', icon: BarChart3 },
  { label: 'Program Engagement', path: '/admin/programs', icon: BriefcaseBusiness },
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
    <div className="flex h-screen min-h-[480px] overflow-hidden bg-[#f7f8f4] text-[#20251f]">
      {mobileNavigationOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-[#182119]/35 md:hidden"
          onClick={() => setMobileNavigationOpen(false)}
        />
      )}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#e4e9e0] bg-[#fbfcf9] transition-transform md:relative md:translate-x-0',
        mobileNavigationOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="flex h-[86px] items-center justify-between border-b border-[#e9ece6] px-5">
          <NavLink to="/admin" aria-label="SEIMEI Organization Intelligence" className="flex items-center gap-2">
            <span className="relative h-10 w-[52px] shrink-0 overflow-hidden" aria-hidden="true">
              <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="" className="absolute -left-[19px] -top-[5px] h-[90px] w-[90px] max-w-none" />
            </span>
            <span className="-ml-2 leading-none">
              <span className="text-[20px] font-semibold tracking-[-0.04em] text-[#1d321b]">SEIMEI</span>
              <span className="mt-1 block text-[9px] text-[#39632f]">Organization Intelligence</span>
            </span>
          </NavLink>
          <button type="button" aria-label="Close navigation" onClick={() => setMobileNavigationOpen(false)} className="rounded p-2 text-[#596259] hover:bg-[#f1f4ee] md:hidden">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pb-2 pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#899188]">Organization</p>
        </div>
        <nav aria-label="Organization navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {adminNavigation.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={() => setMobileNavigationOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors',
                isActive ? 'bg-[#eaf0e6] text-[#244b28]' : 'text-[#586158] hover:bg-[#f0f3ed] hover:text-[#27332a]',
              )}
            >
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#e9ece6] p-4">
          <div className="mb-4 rounded-md border border-[#e3e7df] bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#687168]">Prototype environment</p>
            <p className="mt-1 text-[11px] leading-4 text-[#687168]">Illustrative summaries only. Not shared or live organization data.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e2efdb] text-xs font-semibold text-[#31552b]">KA</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{user?.fullName ?? 'Administrator'}</p>
              <p className="truncate text-[10px] text-[#687168]">{user?.email ?? 'Admin account'}</p>
            </div>
            <button type="button" onClick={signOut} title="Sign out" aria-label="Sign out" className="rounded p-2 text-[#687168] transition-colors hover:bg-[#f1f4ee] hover:text-[#31552b]">
              <LogOut size={16} />
            </button>
          </div>
          <button type="button" onClick={signOut} className="mt-3 flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs font-medium text-[#586158] hover:bg-white md:hidden">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[62px] shrink-0 items-center justify-between border-b border-[#e4e9e0] bg-white px-4 md:hidden">
          <button type="button" aria-label="Open navigation" onClick={() => setMobileNavigationOpen(true)} className="rounded p-2 text-[#4f594f] hover:bg-[#f1f4ee]">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#31552b]"><Activity size={15} /> Organization Intelligence</div>
          <button type="button" aria-label="Sign out" onClick={signOut} className="rounded p-2 text-[#4f594f] hover:bg-[#f1f4ee]">
            <LogOut size={17} />
          </button>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
