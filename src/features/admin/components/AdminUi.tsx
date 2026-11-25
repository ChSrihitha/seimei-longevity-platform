import type { ReactNode } from 'react';
import { ShieldCheck, type LucideIcon } from 'lucide-react';
import { MIN_GROUP_SIZE } from '../data/analytics';

export const panelClass = 'rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_4px_20px_rgba(42,64,38,0.04)]';

export function SectionTitle({ title, detail, action }: { title: string; detail?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">{title}</h2>
        {detail && <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">{detail}</p>}
      </div>
      {action}
    </div>
  );
}

export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border border-[var(--color-brand-100)] bg-[var(--color-brand-50)] px-3 py-1 text-[10px] font-semibold tracking-[0.04em] text-[var(--color-brand-800)] ${className}`}>
      DEMO DATA
    </span>
  );
}

export function StatCard({ label, value, context, icon: Icon }: { label: string; value: string; context: string; icon: LucideIcon }) {
  return (
    <article className={`${panelClass} min-w-0 p-5 sm:p-6`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-5 text-[var(--color-text-secondary)]">{label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"><Icon size={17} strokeWidth={1.8} /></span>
      </div>
      <p className="mt-4 text-3xl font-semibold leading-none tracking-tight text-[var(--color-text-primary)]">{value}</p>
      <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">{context}</p>
    </article>
  );
}

export function PrivacyStatement({ compact = false }: { compact?: boolean }) {
  return (
    <aside aria-label="Privacy statement" className={`${panelClass} flex items-start gap-3 border-[var(--color-brand-100)] bg-[var(--color-brand-50)] ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-brand-700)]"><ShieldCheck size={17} /></span>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-5 text-[var(--color-brand-900)]">Private for the employee. Actionable for the organisation.</p>
        <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
          HR sees anonymised, aggregated figures only — never individual answers, personal wellbeing records or identifiable health information.
          Any group with fewer than {MIN_GROUP_SIZE} people is suppressed.
        </p>
      </div>
    </aside>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[#fbfcf9] p-8 text-center">
      <p className="text-base font-medium text-[var(--color-text-primary)]">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-secondary)]">{detail}</p>
    </div>
  );
}
