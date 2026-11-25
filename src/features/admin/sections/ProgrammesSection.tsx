import { useMemo } from 'react';
import { BadgeCheck, BriefcaseBusiness, ClipboardCheck, Scale, type LucideIcon } from 'lucide-react';
import { SEIMEI_PROGRAMS, type SeimeiProgramId } from '../../../data/programCatalog';
import {
  getCheckCompletion,
  getLatestBurnoutCheck,
  getProgramEnrolment,
  MIN_GROUP_SIZE,
  type CheckCompletionRow,
  type MonthWindow,
} from '../data/analytics';
import { panelClass, SectionTitle } from '../components/AdminUi';

type Metric = { label: string; value: string };

type ProgrammeCardModel = {
  key: string;
  name: string;
  category: string;
  description: string;
  icon: LucideIcon;
  metrics: Metric[];
  outcome: string;
};

function ProgrammeCard({ card }: { card: ProgrammeCardModel }) {
  const Icon = card.icon;
  return (
    <article className={`${panelClass} flex min-w-0 flex-col p-5 sm:p-6`}>
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"><Icon size={19} strokeWidth={1.8} /></span>
        <span className="rounded-full bg-[var(--color-brand-50)] px-3 py-1 text-xs font-medium text-[var(--color-brand-800)]">{card.category}</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold leading-6 tracking-tight text-[var(--color-text-primary)]">{card.name}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{card.description}</p>
      <dl className={`mt-5 grid ${card.metrics.length === 1 ? 'grid-cols-1' : 'grid-cols-3'} gap-3 border-t border-[var(--color-border)] pt-4`}>
        {card.metrics.map((metric) => (
          <div key={metric.label} className="min-w-0">
            <dt className="text-xs font-medium leading-5 text-[var(--color-text-secondary)]" title={metric.label}>{metric.label}</dt>
            <dd className="mt-1 break-words text-base font-semibold tabular-nums text-[var(--color-text-primary)]">{metric.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-auto pt-4 text-xs leading-5 text-[var(--color-text-secondary)]"><span className="font-semibold text-[var(--color-text-primary)]">Outcome: </span>{card.outcome}</p>
    </article>
  );
}

function CheckCompletionTable({ rows, monthWindow }: { rows: CheckCompletionRow[]; monthWindow: MonthWindow }) {
  return (
    <section className={`${panelClass} p-5 sm:p-6`}>
      <SectionTitle
        title="Check-in completion"
        detail={`Unique employees who started and completed each implemented SEIMEI check in the last ${monthWindow} months. Completion rate = completed ÷ started. Only checks with a working interactive flow are listed.`}
      />
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)]">
              <th scope="col" className="py-3 pr-3">Assessment / check-in</th>
              <th scope="col" className="px-3 py-3 text-right">Started</th>
              <th scope="col" className="px-3 py-3 text-right">Completed</th>
              <th scope="col" className="py-3 pl-3 text-right">Completion rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-[var(--color-border)] last:border-0">
                <th scope="row" className="py-4 pr-3 text-sm font-medium text-[var(--color-text-primary)]">{row.name}</th>
                <td className="px-3 py-4 text-right text-sm tabular-nums text-[var(--color-text-secondary)]">{row.started}</td>
                <td className="px-3 py-4 text-right text-sm tabular-nums text-[var(--color-text-secondary)]">{row.started >= MIN_GROUP_SIZE ? row.completed : `<${MIN_GROUP_SIZE}`}</td>
                <td className="py-4 pl-3 text-right">
                  {row.completionRate === null ? (
                    <span className="text-xs text-[var(--color-text-secondary)]">Suppressed</span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <span className="hidden h-2 w-16 overflow-hidden rounded-full bg-[var(--color-brand-100)] sm:inline-block"><span className="block h-full rounded-full bg-[var(--color-brand-600)]" style={{ width: `${row.completionRate}%` }} /></span>
                      <span className="w-10 text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">{row.completionRate}%</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const HONEST_PRINCIPLES = [
  { icon: Scale, title: 'Usage is not an outcome', text: 'Sessions and completions show reach. They do not show that anyone’s wellbeing changed.' },
  { icon: ClipboardCheck, title: 'Outcomes need a baseline', text: 'An improvement claim requires the same measure taken before and after, for the same group.' },
  { icon: BriefcaseBusiness, title: 'Business results come from HR data', text: 'Retention, absence and productivity must be measured in your own HR systems, not inferred here.' },
  { icon: BadgeCheck, title: 'Answers stay with the employee', text: `HR never sees individual answers. Groups under ${MIN_GROUP_SIZE} people are suppressed.` },
];

export function ProgrammesSection({ monthWindow }: { monthWindow: MonthWindow }) {
  const enrolment = useMemo(() => getProgramEnrolment(monthWindow), [monthWindow]);
  const checks = useMemo(() => getCheckCompletion(monthWindow), [monthWindow]);
  const burnoutCheck = checks.find((row) => row.id === 'burnout-risk');
  const latestBurnout = getLatestBurnoutCheck();

  const programCards: ProgrammeCardModel[] = SEIMEI_PROGRAMS.map((program) => {
    const stats = enrolment.find((item) => item.id === program.id);
    return {
      key: program.id,
      name: program.title,
      category: program.category,
      description: program.description,
      icon: program.icon,
      metrics: !stats
        ? [{ label: 'Programme analytics', value: 'Not measured yet' }]
        : stats.suppressed
          ? [{ label: 'Participants', value: `<${MIN_GROUP_SIZE}` }, { label: 'Sessions', value: '—' }, { label: 'Per person', value: '—' }]
          : [
            { label: 'Participants', value: stats.participants.toLocaleString('en-IN') },
            { label: 'Sessions', value: stats.sessions.toLocaleString('en-IN') },
            { label: 'Per person', value: (stats.sessions / stats.participants).toLocaleString('en-IN', { maximumFractionDigits: 1 }) },
          ],
      outcome: stats
        ? 'Not measured yet — no baseline and follow-up data or participant feedback is collected for this programme.'
        : 'Not measured yet — programme participation and outcome data have not been collected.',
    } satisfies ProgrammeCardModel;
  });

  // Keep the burnout check visible alongside programmes as an assessment card.
  const burnoutCard: ProgrammeCardModel = {
    key: 'monthly-burnout-check',
    name: 'Monthly Burnout Check',
    category: 'Assessment',
    description: 'A recurring short check employees can take to notice early signs of professional fatigue.',
    icon: ClipboardCheck,
    metrics: burnoutCheck ? [
      { label: 'Started', value: burnoutCheck.started.toLocaleString('en-IN') },
      { label: 'Completion', value: burnoutCheck.completionRate === null ? '—' : `${burnoutCheck.completionRate}%` },
      { label: 'High risk now', value: latestBurnout.value === null ? '—' : `${latestBurnout.value}%` },
    ] : [],
    outcome: '“High risk now” is a point-in-time screening signal for the latest month, not a measured change.',
  };

  const resetIndex = programCards.findIndex((card) => card.key === ('reset' satisfies SeimeiProgramId));
  const ordered = [...programCards.slice(0, resetIndex + 1), burnoutCard, ...programCards.slice(resetIndex + 1)];

  return (
    <div className="space-y-6">
      <section>
        <SectionTitle title="SEIMEI programmes" detail={`Programmes and checks available to employees today. Figures cover the last ${monthWindow} months of the demo cohort; programmes without analytics are marked “Not measured yet”.`} />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {ordered.map((card) => <ProgrammeCard key={card.key} card={card} />)}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <CheckCompletionTable rows={checks} monthWindow={monthWindow} />
        <section className={`${panelClass} border-[var(--color-brand-100)] bg-[var(--color-brand-50)] p-5 sm:p-6`}>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-brand-900)]">How we measure honestly</h2>
          <ul className="mt-4 space-y-3.5">
            {HONEST_PRINCIPLES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <Icon size={17} className="mt-0.5 shrink-0 text-[var(--color-brand-700)]" aria-hidden="true" />
                <div><p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p><p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{text}</p></div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
