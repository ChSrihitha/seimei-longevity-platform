import { useMemo, useState } from 'react';
import { Activity, ClipboardCheck, Users, HeartPulse, Search, ShieldAlert, Target } from 'lucide-react';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  DEMO_EMPLOYEES,
  DEMO_MONTHS,
  ENERGY_DISTRIBUTION,
  getCheckCompletion,
  getDistributionTotal,
  getTrendForPeriod,
  getWorkforceMetrics,
  MIN_GROUP_SIZE,
  MONTH_WINDOWS,
  MOOD_DISTRIBUTION,
  STRESS_DISTRIBUTION,
  type MonthWindow,
  type Period,
} from './data/analytics';
import { DemoBadge, panelClass, PrivacyStatement, SectionTitle, StatCard } from './components/AdminUi';
import { OverviewSection } from './sections/OverviewSection';
import { ProgrammesSection } from './sections/ProgrammesSection';
import { RoiCalculator } from './sections/RoiCalculator';

export type AdminSection = 'overview' | 'workforce' | 'assessments' | 'outcomes' | 'programs' | 'roi' | 'employees';

const sectionContent: Record<AdminSection, { title: string; subtitle: string }> = {
  overview: { title: 'Company wellbeing overview', subtitle: 'Participation, wellbeing signals and programme reach across the organisation, in aggregate.' },
  workforce: { title: 'Workforce Wellbeing', subtitle: 'Aggregated wellbeing indicators across the illustrative demo cohort.' },
  assessments: { title: 'Assessment Engagement', subtitle: 'Starts and completions for the assessments implemented in this prototype.' },
  outcomes: { title: 'Outcomes & Recovery', subtitle: 'Illustrative trend views, with limits made explicit where baseline data is unavailable.' },
  programs: { title: 'Programmes', subtitle: 'Reach and completion for SEIMEI programmes and check-ins: usage, not outcomes.' },
  roi: { title: 'ROI Calculator', subtitle: 'Estimate the cost of attrition and how it compares with a SEIMEI subscription.' },
  employees: { title: 'Employees', subtitle: 'A privacy-conscious view of registration and participation status.' },
};

function DistributionCard({ title, description, distribution }: {
  title: string;
  description: string;
  distribution: { name: string; value: number; color: string }[];
}) {
  const total = getDistributionTotal(distribution);
  return (
    <section className={`${panelClass} p-5 sm:p-6`}>
      <SectionTitle title={title} detail={description} />
      {total === 0 ? (
        <div className="flex h-[190px] items-center justify-center rounded bg-[#fafbf9] text-sm text-[#70796f]">Not enough data to display.</div>
      ) : (
        <div className="grid min-w-0 grid-cols-[minmax(0,120px)_minmax(0,1fr)] items-center gap-4">
          <div className="relative h-[148px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={35} outerRadius={48} paddingAngle={2} stroke="none">
                  {distribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-semibold text-[#283129]">{total}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">demo sample</span>
            </div>
          </div>
          <div className="min-w-0 space-y-3">
            {distribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-text-secondary)]">{item.name}</span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">{item.value}</span>
                <span className="w-10 text-right text-xs tabular-nums text-[var(--color-text-secondary)]">{Math.round(item.value / total * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mt-4 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-secondary)]">Denominator: {total} illustrative demo responses</p>
    </section>
  );
}

function WorkforceSection() {
  return (
    <section>
      <SectionTitle title="Workforce wellbeing" detail="Distributions use the supported Stress Mapping, energy, and check-in mood categories. Values are illustrative demo data, not employee measurements." />
      <div className="grid gap-5 lg:grid-cols-3">
        <DistributionCard title="Stress distribution" description="Stress Mapping bands" distribution={STRESS_DISTRIBUTION} />
        <DistributionCard title="Energy distribution" description="Low, moderate, and high energy" distribution={ENERGY_DISTRIBUTION} />
        <DistributionCard title="Mood distribution" description="great + good · okay · struggling + exhausted" distribution={MOOD_DISTRIBUTION} />
      </div>
      <div className={`${panelClass} mt-5 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"><HeartPulse size={19} /></span>
        <div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Recovery patterns</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">Baseline data needed. The prototype does not collect comparable longitudinal recovery observations across employees.</p>
        </div>
        <span className="rounded-full bg-[var(--color-brand-50)] px-3 py-1.5 text-xs font-medium text-[var(--color-brand-800)] sm:ml-auto sm:whitespace-nowrap">Not enough data</span>
      </div>
    </section>
  );
}

function AssessmentSection({ monthWindow }: { monthWindow: MonthWindow }) {
  const rows = useMemo(() => getCheckCompletion(monthWindow), [monthWindow]);
  return (
    <section className={`${panelClass} p-5 sm:p-6`}>
      <SectionTitle title="Assessment engagement" detail={`Unique employees in the last ${monthWindow} months. Eligible population is the ${DEMO_EMPLOYEES.length}-record demo cohort; completion rate is completed ÷ started, suppressed below ${MIN_GROUP_SIZE} starts.`} />
      <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)]">
              <th className="px-3 py-3.5">Assessment</th><th className="px-3 py-3.5 text-right">Eligible</th><th className="px-3 py-3.5 text-right">Started</th><th className="px-3 py-3.5 text-right">Completed</th><th className="px-3 py-3.5 text-right">Not started</th><th className="px-3 py-3.5 text-right">Completion</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-b border-[#f0f2ee] last:border-0">
                <td className="px-3 py-3.5 text-sm font-medium text-[var(--color-text-primary)]">{row.name}</td>
                <td className="px-3 py-3.5 text-right text-sm tabular-nums text-[var(--color-text-secondary)]">{row.eligible}</td>
                <td className="px-3 py-3.5 text-right text-sm tabular-nums text-[var(--color-text-secondary)]">{row.started}</td>
                <td className="px-3 py-3.5 text-right text-sm tabular-nums text-[var(--color-text-secondary)]">{row.completed}</td>
                <td className="px-3 py-3.5 text-right text-sm tabular-nums text-[var(--color-text-secondary)]">{row.notStarted}</td>
                <td className="px-3 py-3.5 text-right text-sm font-semibold tabular-nums text-[var(--color-brand-800)]">{row.completionRate === null ? 'Suppressed' : `${row.completionRate}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex items-start gap-3 rounded-xl bg-[var(--color-brand-50)] p-4 text-sm leading-6 text-[var(--color-text-secondary)]">
        <ClipboardCheck size={17} className="mt-0.5 shrink-0 text-[var(--color-brand-700)]" />
        <p>Every listed check has a working flow in the employee app: the Daily Wellbeing Check-in, Stress Mapping (dedicated flow) and four interactive questionnaires. Catalogue-only items are excluded. Counts come from the synthetic demo cohort, not tracked users.</p>
      </div>
    </section>
  );
}

function OutcomesSection({ period }: { period: Period }) {
  const data = getTrendForPeriod(period);
  const metrics = getWorkforceMetrics();
  return (
    <section>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(250px,0.8fr)]">
        <div className={`${panelClass} p-5 sm:p-6`}>
          <SectionTitle title="Stress and energy trend" detail={`Illustrative weekly demo series shown for the selected ${period.toLowerCase()} window. It is not measured employee history.`} />
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 16, bottom: 2, left: -18 }}>
                <CartesianGrid stroke="#edf0eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: '#747d73', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#747d73', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Line type="monotone" dataKey="stress" name="Stress score (demo)" stroke="#bd8a58" strokeWidth={2} dot={{ r: 3, fill: '#bd8a58' }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="energy" name="Energy score (demo)" stroke="#6e9171" strokeWidth={2} dot={{ r: 3, fill: '#6e9171' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--color-text-secondary)]">Score scale: 0–100 · Sample size: synthetic weekly series · No causal interpretation</p>
        </div>
        <div className="space-y-4">
          <div className={`${panelClass} p-5 sm:p-6`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"><Activity size={18} /></span>
            <h3 className="mt-4 text-base font-semibold">Before-and-after comparison</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">Baseline data needed. No comparable observations are available to classify people as improved, stable, or worsened.</p>
          </div>
          <div className={`${panelClass} p-5 sm:p-6`}>
            <h3 className="text-base font-semibold">Wellness Plan completion</h3>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Illustrative demo records</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div><p className="text-3xl font-semibold tracking-tight">{metrics.plansCompleted}</p><p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">of {metrics.plansStarted} started plans completed</p></div>
              <span className="rounded-full bg-[var(--color-brand-50)] px-3 py-1.5 text-sm font-semibold text-[var(--color-brand-800)]">{metrics.planCompletionRate}%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-brand-100)]"><div className="h-full rounded-full bg-[var(--color-brand-600)]" style={{ width: `${metrics.planCompletionRate}%` }} /></div>
          </div>
        </div>
      </div>
      <div className={`${panelClass} mt-5 p-5 sm:p-6`}>
        <SectionTitle title="Productivity and program impact" detail="Wellbeing outcomes and productivity outcomes are kept separate." />
        <div className="flex items-start gap-3 rounded-xl bg-[#fbfcf9] p-4 sm:p-5">
          <Target size={18} className="mt-0.5 shrink-0 text-[var(--color-brand-700)]" />
          <div><p className="text-sm font-semibold text-[var(--color-text-primary)]">Measurement opportunity</p><p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">Focus, employee-reported productivity, and engagement-linked outcome measures are not collected in the current prototype. No productivity impact is claimed.</p></div>
        </div>
      </div>
    </section>
  );
}

const EMPLOYEE_PAGE_SIZE = 25;

function EmployeesSection() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All departments');
  const [visibleCount, setVisibleCount] = useState(EMPLOYEE_PAGE_SIZE);
  const departments = useMemo(() => ['All departments', ...Array.from(new Set(DEMO_EMPLOYEES.map((employee) => employee.department)))], []);
  const filteredEmployees = useMemo(() => DEMO_EMPLOYEES.filter((employee) => {
    const matchesSearch = `${employee.name} ${employee.id}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesSearch && (department === 'All departments' || employee.department === department);
  }), [department, search]);

  return (
    <section>
      <div className={`${panelClass} mb-5 flex items-start gap-3 border-[var(--color-brand-100)] bg-[var(--color-brand-50)] p-4 sm:p-5`}>
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-[var(--color-brand-700)]" />
        <div><p className="text-sm font-semibold text-[var(--color-brand-900)]">Privacy and prototype limitation</p><p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">This directory contains synthetic demo profiles only. No personal reflections, individual scores, or sensitive assessment answers are shown. Client-side filtering is not an organization-wide privacy control.</p></div>
      </div>
      <div className={`${panelClass} overflow-hidden`}>
        <div className="flex flex-col gap-4 border-b border-[var(--color-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-base font-semibold">Demo employee directory</h2><p className="mt-1 text-xs text-[var(--color-text-secondary)]">{filteredEmployees.length} of {DEMO_EMPLOYEES.length} synthetic profiles</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
              <input aria-label="Search demo employees" value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(EMPLOYEE_PAGE_SIZE); }} placeholder="Search demo profiles" className="h-10 w-full rounded-xl border border-[var(--color-border)] bg-white pl-9 pr-3 text-sm outline-none focus:border-[var(--color-accent)] sm:w-[220px]" />
            </label>
            <select aria-label="Filter by department" value={department} onChange={(event) => { setDepartment(event.target.value); setVisibleCount(EMPLOYEE_PAGE_SIZE); }} className="h-10 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)]">
              {departments.map((name) => <option key={name}>{name}</option>)}
            </select>
          </div>
        </div>
        {filteredEmployees.length === 0 ? (
          <div className="p-10 text-center"><p className="text-base font-medium text-[var(--color-text-primary)]">No matching demo profiles</p><p className="mt-2 text-sm text-[var(--color-text-secondary)]">Try a different name or department.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead><tr className="bg-[#fbfcf9] text-xs font-semibold text-[var(--color-text-secondary)]"><th className="px-4 py-3.5">Demo profile</th><th className="px-4 py-3.5">Department</th><th className="px-4 py-3.5">Registration</th><th className="px-4 py-3.5">Program participation</th><th className="px-4 py-3.5">Assessment engagement</th></tr></thead>
              <tbody>{filteredEmployees.slice(0, visibleCount).map((employee) => (
                <tr key={employee.id} className="border-t border-[var(--color-border)] text-sm">
                  <td className="px-4 py-4"><span className="font-medium text-[var(--color-text-primary)]">{employee.name}</span><span className="ml-2 rounded-full bg-[var(--color-brand-50)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-brand-800)]">Demo</span></td>
                  <td className="px-4 py-4 text-[var(--color-text-secondary)]">{employee.department}</td>
                  <td className="px-4 py-4 text-[var(--color-text-secondary)]">Registered</td>
                  <td className="px-4 py-4"><StatusLabel value={employee.participation} /></td>
                  <td className="px-4 py-4"><StatusLabel value={employee.assessment} /></td>
                </tr>
              ))}</tbody>
            </table>
            {filteredEmployees.length > visibleCount && (
              <div className="flex items-center justify-between gap-3 border-t border-[#f0f2ee] px-4 py-3">
                <p className="text-xs text-[var(--color-text-secondary)]">Showing {visibleCount} of {filteredEmployees.length}</p>
                <button type="button" onClick={() => setVisibleCount((count) => count + EMPLOYEE_PAGE_SIZE)} className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-brand-50)]">Show more</button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function StatusLabel({ value }: { value: string }) {
  const active = value === 'Active' || value === 'Completed';
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-800)]' : value === 'In progress' || value === 'Registered' ? 'bg-[#f7f1e6] text-[#896b36]' : 'bg-[#f1f2ef] text-[#6f776e]'}`}>{value}</span>;
}

const PERIOD_OPTIONS: Period[] = ['7 days', '30 days', '90 days'];

export function AdminDashboardPage({ section }: { section: AdminSection }) {
  const [period, setPeriod] = useState<Period>('30 days');
  const [monthWindow, setMonthWindow] = useState<MonthWindow>(6);
  const content = sectionContent[section];
  const metrics = getWorkforceMetrics();
  const usesMonthWindow = section === 'overview' || section === 'programs' || section === 'assessments';
  const firstMonth = DEMO_MONTHS[DEMO_MONTHS.length - monthWindow];
  const lastMonth = DEMO_MONTHS[DEMO_MONTHS.length - 1];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            {section === 'roi' ? (
              <span className="rounded-full border border-[var(--color-brand-100)] bg-[var(--color-brand-50)] px-3 py-1 text-xs font-medium text-[var(--color-brand-800)]">Estimate · uses your inputs</span>
            ) : (
              <>
                <DemoBadge />
                <span className="text-xs text-[var(--color-text-secondary)]">Synthetic prototype cohort · not live company analytics</span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl">{content.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">{content.subtitle}</p>
        </div>
        {usesMonthWindow && (
          <label className="flex items-center gap-3 self-start text-sm font-medium text-[var(--color-text-secondary)] sm:self-auto">
            <span>Reporting period</span>
            <select value={monthWindow} onChange={(event) => {
              const value = Number(event.target.value);
              setMonthWindow(MONTH_WINDOWS.find((option) => option === value) ?? 6);
            }} className="h-10 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]">
              {MONTH_WINDOWS.map((option) => <option key={option} value={option}>Last {option} months</option>)}
            </select>
          </label>
        )}
        {section === 'outcomes' && (
          <label className="flex items-center gap-3 self-start text-sm font-medium text-[var(--color-text-secondary)] sm:self-auto">
            <span>Reporting window</span>
            <select value={period} onChange={(event) => {
              setPeriod(PERIOD_OPTIONS.find((option) => option === event.target.value) ?? '30 days');
            }} className="h-10 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]">
              {PERIOD_OPTIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        )}
      </div>

      {section !== 'overview' && section !== 'roi' && <PrivacyStatement compact />}

      {section === 'overview' && <OverviewSection monthWindow={monthWindow} />}
      {section === 'workforce' && <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Registered employees" value={`${metrics.registered}`} context="Synthetic demo cohort" icon={Users} />
          <StatCard label="Active this month" value={`${metrics.active}`} context={`Of ${metrics.registered} demo profiles`} icon={Activity} />
          <StatCard label="Completed an assessment" value={`${metrics.completionRate}%`} context={`${metrics.assessed} of ${metrics.registered} demo profiles`} icon={ClipboardCheck} />
          <StatCard label="Wellbeing index" value={`${metrics.wellbeingIndex}`} context="Mean Mental Wellness Check score, last 3 months · 0–100" icon={HeartPulse} />
        </div>
        <WorkforceSection />
      </>}
      {section === 'assessments' && <AssessmentSection monthWindow={monthWindow} />}
      {section === 'outcomes' && <OutcomesSection period={period} />}
      {section === 'programs' && <ProgrammesSection monthWindow={monthWindow} />}
      {section === 'roi' && <RoiCalculator />}
      {section === 'employees' && <EmployeesSection />}
      <footer className="border-t border-[var(--color-border)] pt-5 text-xs leading-5 text-[var(--color-text-secondary)]">
        {section === 'roi'
          ? 'Calculator results are estimates derived only from the inputs above; they are not measured SEIMEI outcomes.'
          : 'DEMO DATA: figures come from a seeded synthetic cohort generated in this browser and do not represent a real workforce or measured SEIMEI outcomes.'}
        {usesMonthWindow && ` Reporting period: ${firstMonth} – ${lastMonth}.`}
        {section === 'outcomes' && ` Reporting window: ${period}.`}
        {' '}No employee-level wellbeing detail is shown; groups under {MIN_GROUP_SIZE} people are suppressed.
      </footer>
    </div>
  );
}
