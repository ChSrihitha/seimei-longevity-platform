import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Download, Info, Minus } from 'lucide-react';
import {
  buildLeadershipReportCsv,
  getMonthlyVisits,
  getOverviewKpis,
  getProgramEnrolment,
  getStressHeatmap,
  MIN_GROUP_SIZE,
  type Kpi,
  type MonthWindow,
} from '../data/analytics';
import { EmptyState, panelClass, PrivacyStatement, SectionTitle } from '../components/AdminUi';

const HEAT_BINS = [
  { max: 15, label: '<15%', fill: '#f3f0e7', text: '#3d3a31' },
  { max: 25, label: '15–24%', fill: '#e9dfc9', text: '#3d3a31' },
  { max: 35, label: '25–34%', fill: '#ddcba9', text: '#393327' },
  { max: 45, label: '35–44%', fill: '#ceb48a', text: '#332b20' },
  { max: Infinity, label: '45%+', fill: '#b99a6e', text: '#2e281f' },
];
const heatBin = (value: number) => HEAT_BINS.find((bin) => value < bin.max) ?? HEAT_BINS[HEAT_BINS.length - 1];
const SUPPRESSED_FILL = 'repeating-linear-gradient(135deg, #f1efe9 0 4px, #e6e3da 4px 5px)';

function KpiCard({ label, kpi, format, higherIsBetter, detail, indicator }: {
  label: string;
  kpi: Kpi;
  format: (value: number) => string;
  higherIsBetter: boolean;
  detail: string;
  indicator: ReactNode;
}) {
  const current = kpi.current.value;
  const previous = kpi.previous?.value ?? null;
  const delta = current !== null && previous !== null ? current - previous : null;
  const deltaUnit = kpi.unit === '%' ? ' pts' : kpi.unit === 'score' ? ' pts' : '';
  const favourable = delta === null || delta === 0 ? null : (delta > 0) === higherIsBetter;
  const DeltaIcon = delta === null || delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <article className={`${panelClass} flex min-w-0 flex-col p-5 sm:p-6`}>
      <p className="text-sm font-medium leading-5 text-[var(--color-text-secondary)]">{label}</p>
      {current === null ? (
        <>
          <p className="mt-4 text-3xl font-semibold leading-none text-[var(--color-text-secondary)]">—</p>
          <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">Suppressed: fewer than {MIN_GROUP_SIZE} responses (n={kpi.current.n}).</p>
        </>
      ) : (
        <>
          <p className="mt-4 text-3xl font-semibold leading-none tracking-tight text-[var(--color-text-primary)]">{format(current)}</p>
          <p className="mt-2 flex flex-wrap items-center gap-1 text-xs leading-5 text-[var(--color-text-secondary)]">
            {delta !== null ? (
              <span className={`inline-flex items-center gap-0.5 font-semibold ${favourable === null ? 'text-[var(--color-text-secondary)]' : favourable ? 'text-[var(--color-brand-800)]' : 'text-[#8f5e3d]'}`}>
                <DeltaIcon size={13} aria-hidden="true" />
                {delta > 0 ? '+' : delta < 0 ? '−' : '±'}{Math.abs(delta).toLocaleString('en-IN')}{deltaUnit}
              </span>
            ) : null}
            <span>{kpi.comparisonLabel}</span>
          </p>
        </>
      )}
      <div className="mt-5">{indicator}</div>
      <p className="mt-4 border-t border-[var(--color-border)] pt-3 text-xs leading-5 text-[var(--color-text-secondary)]">{detail}</p>
    </article>
  );
}

function Meter({ value, label }: { value: number | null; label: string }) {
  return (
    <div role="img" aria-label={value === null ? `${label}: suppressed` : `${label}: ${value} of 100`}>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-brand-100)]">
        {value !== null && <div className="h-full rounded-full bg-[var(--color-brand-600)]" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />}
      </div>
      <div className="mt-1 flex justify-between text-[10px] tabular-nums text-[var(--color-text-secondary)]"><span>0</span><span>100</span></div>
    </div>
  );
}

function VisitBars({ data }: { data: { month: string; visits: number }[] }) {
  const max = Math.max(1, ...data.map((item) => item.visits));
  return (
    <div className="flex h-10 items-end gap-1" role="img" aria-label={`Monthly visits: ${data.map((item) => `${item.month} ${item.visits}`).join(', ')}`}>
      {data.map((item, index) => (
        <span
          key={item.month}
          title={`${item.month}: ${item.visits.toLocaleString('en-IN')} visits`}
          className={`flex-1 rounded-t-sm ${index === data.length - 1 ? 'bg-[var(--color-brand-600)]' : 'bg-[var(--color-brand-200)]'}`}
          style={{ height: `${Math.max(8, (item.visits / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function StressHeatmap({ monthWindow }: { monthWindow: MonthWindow }) {
  const heatmap = useMemo(() => getStressHeatmap(monthWindow), [monthWindow]);
  return (
    <section className={`${panelClass} p-5 sm:p-6`}>
      <SectionTitle
        title="Stress by department"
        detail={<>Each cell is the share of employees who completed a Daily Wellbeing Check-in that month and reported feeling <strong className="font-semibold text-[var(--color-text-primary)]">stressed or overwhelmed</strong>. Cells based on fewer than {MIN_GROUP_SIZE} check-ins are suppressed.</>}
      />
      {heatmap.rows.length === 0 ? (
        <EmptyState title="No department meets the reporting threshold" detail={`Departments need at least ${MIN_GROUP_SIZE} employees before stress data can be shown.`} />
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[560px] border-separate border-spacing-[3px] text-left">
            <caption className="sr-only">Percentage of employees reporting stressed or overwhelmed, by department and month (demo data)</caption>
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 z-10 bg-white pb-2 pr-2 text-xs font-semibold text-[var(--color-text-secondary)]">Department</th>
                {heatmap.months.map((month) => (
                  <th key={month} scope="col" className="pb-2 text-center text-xs font-medium text-[var(--color-text-secondary)]">
                    {month.split(' ')[0]}<span className="block text-[10px] font-normal text-[var(--color-text-secondary)]">{month.split(' ')[1]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmap.rows.map((row) => (
                <tr key={row.department}>
                  <th scope="row" className="sticky left-0 z-10 whitespace-nowrap bg-white pr-3 text-sm font-medium text-[var(--color-text-primary)]">
                    {row.department}
                    <span className="block text-xs font-normal text-[var(--color-text-secondary)]">{row.headcount} people</span>
                  </th>
                  {row.cells.map((cell) => {
                    if (cell.stressedPct === null) {
                      return (
                        <td key={cell.month} title={`${row.department}, ${cell.month}: suppressed (fewer than ${MIN_GROUP_SIZE} check-ins)`} className="h-10 min-w-[44px] rounded-lg text-center text-xs text-[var(--color-text-secondary)]" style={{ background: SUPPRESSED_FILL }}>
                          <span aria-label="Suppressed">n&lt;{MIN_GROUP_SIZE}</span>
                        </td>
                      );
                    }
                    const bin = heatBin(cell.stressedPct);
                    return (
                      <td key={cell.month} title={`${row.department}, ${cell.month}: ${cell.stressedPct}% stressed or overwhelmed (n=${cell.responses} check-ins)`} className="h-10 min-w-[44px] rounded-lg text-center text-xs font-semibold tabular-nums" style={{ backgroundColor: bin.fill, color: bin.text }}>
                        {cell.stressedPct}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-5 flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 lg:flex-row lg:items-center lg:justify-between">
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5" aria-label="Heatmap legend">
          {HEAT_BINS.map((bin) => (
            <li key={bin.label} className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
              <span className="h-3 w-5 rounded-[3px] border border-black/5" style={{ backgroundColor: bin.fill }} />{bin.label}
            </li>
          ))}
          <li className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <span className="h-3 w-5 rounded-[3px] border border-black/5" style={{ background: SUPPRESSED_FILL }} />Suppressed (n&lt;{MIN_GROUP_SIZE})
          </li>
        </ul>
        {heatmap.hiddenDepartments.length > 0 && (
          <p className="text-xs text-[var(--color-text-secondary)]">{heatmap.hiddenDepartments.length} department{heatmap.hiddenDepartments.length > 1 ? 's' : ''} with fewer than {MIN_GROUP_SIZE} employees not shown.</p>
        )}
      </div>
    </section>
  );
}

function ProgramEnrolmentPanel({ monthWindow }: { monthWindow: MonthWindow }) {
  const programs = useMemo(() => getProgramEnrolment(monthWindow), [monthWindow]);
  const max = Math.max(1, ...programs.map((program) => program.enrolledPct));
  return (
    <section className={`${panelClass} flex flex-col p-5 sm:p-6`}>
      <SectionTitle title="Programme enrolment" detail={`Share of the workforce who attended at least one session in the last ${monthWindow} months.`} />
      <ul className="space-y-4">
        {programs.map((program) => (
          <li key={program.id}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-sm font-medium text-[var(--color-text-primary)]">{program.title}</span>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">{program.suppressed ? '—' : `${program.enrolledPct}%`}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-brand-100)]" role="img" aria-label={program.suppressed ? `${program.title}: suppressed` : `${program.title}: ${program.enrolledPct}% enrolled`}>
              {!program.suppressed && <div className="h-full rounded-full bg-[var(--color-brand-600)]" style={{ width: `${(program.enrolledPct / max) * 100}%` }} />}
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              {program.category} · {program.suppressed ? `fewer than ${MIN_GROUP_SIZE} participants` : `${program.participants} people · ${program.sessions.toLocaleString('en-IN')} sessions`}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-5">
        <div className="flex items-start gap-2 rounded-xl bg-[#fbfcf9] px-4 py-3 text-xs leading-5 text-[var(--color-text-secondary)]">
          <Info size={15} className="mt-0.5 shrink-0 text-[var(--color-brand-700)]" />
          <p>Programmes without available participation analytics are marked “Not measured yet” in the Programmes section.</p>
        </div>
      </div>
    </section>
  );
}

export function OverviewSection({ monthWindow }: { monthWindow: MonthWindow }) {
  const kpis = useMemo(() => getOverviewKpis(monthWindow), [monthWindow]);
  const visits = useMemo(() => getMonthlyVisits(monthWindow), [monthWindow]);
  const [exportStatus, setExportStatus] = useState<{ kind: 'ok' | 'error'; message: string } | null>(null);

  function exportReport() {
    try {
      const csv = buildLeadershipReportCsv(monthWindow);
      const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `seimei-leadership-report-demo-${monthWindow}m.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      setExportStatus({ kind: 'ok', message: 'Leadership report downloaded (aggregated demo figures only).' });
    } catch {
      setExportStatus({ kind: 'error', message: 'The report could not be generated in this browser. Please try again.' });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="flex-1"><PrivacyStatement compact /></div>
        <div className={`${panelClass} flex flex-col justify-center gap-3 p-4 lg:w-[280px]`}>
          <button type="button" onClick={exportReport} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--color-brand-800)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
            <Download size={15} /> Export leadership report
          </button>
          <p className="text-xs leading-5 text-[var(--color-text-secondary)]" aria-live="polite">
            {exportStatus ? <span className={exportStatus.kind === 'error' ? 'text-[#9a4f23]' : 'text-[#2f6236]'}>{exportStatus.message}</span> : 'CSV of the KPIs, department and programme figures on this page. No employee-level rows.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active monthly participation"
          kpi={kpis.participation}
          format={(value) => `${value}%`}
          higherIsBetter
          indicator={<Meter value={kpis.participation.current.value} label="Participation" />}
          detail={`${kpis.latestMonth} · employees with any SEIMEI activity, of ${kpis.headcount}`}
        />
        <KpiCard
          label="Average wellbeing score"
          kpi={kpis.wellbeing}
          format={(value) => `${value}`}
          higherIsBetter
          indicator={<Meter value={kpis.wellbeing.current.value} label="Wellbeing score" />}
          detail={`${kpis.latestMonth} · Mental Wellness Check, 0–100 · n=${kpis.wellbeing.current.n}`}
        />
        <KpiCard
          label="High burnout risk"
          kpi={kpis.highBurnout}
          format={(value) => `${value}%`}
          higherIsBetter={false}
          indicator={<Meter value={kpis.highBurnout.current.value} label="High burnout risk share" />}
          detail={`${kpis.latestMonth} · share of completed Burnout Risk Index checks scoring high · n=${kpis.highBurnout.current.n}`}
        />
        <KpiCard
          label="Programme / wellness visits"
          kpi={kpis.visits}
          format={(value) => value.toLocaleString('en-IN')}
          higherIsBetter
          indicator={<VisitBars data={visits} />}
          detail={`Total sessions across SEIMEI programmes, last ${monthWindow} months`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.85fr)_minmax(280px,1fr)]">
        <StressHeatmap monthWindow={monthWindow} />
        <ProgramEnrolmentPanel monthWindow={monthWindow} />
      </div>

      <p className="flex items-start gap-2 text-xs leading-5 text-[var(--color-text-secondary)]">
        <ArrowRight size={12} aria-hidden="true" />
        Changes between months describe the demo cohort only; they are not measured effects of SEIMEI programmes.
      </p>
    </div>
  );
}
