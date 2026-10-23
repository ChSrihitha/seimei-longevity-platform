import { useMemo, useState } from 'react';
import { Activity, ClipboardCheck, Users, HeartPulse, Search, ShieldAlert, Target } from 'lucide-react';
import {
  Bar,
  BarChart,
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
  ENERGY_DISTRIBUTION,
  getAssessmentRows,
  getDistributionTotal,
  getTrendForPeriod,
  getWorkforceMetrics,
  MOOD_DISTRIBUTION,
  STRESS_DISTRIBUTION,
  type Period,
} from './data/analytics';

type AdminSection = 'overview' | 'workforce' | 'assessments' | 'outcomes' | 'programs' | 'employees';

const sectionContent: Record<AdminSection, { title: string; subtitle: string }> = {
  overview: { title: 'Workforce Overview', subtitle: 'A considered snapshot of wellbeing participation and program activity.' },
  workforce: { title: 'Workforce Wellbeing', subtitle: 'Aggregated wellbeing indicators across the illustrative demo cohort.' },
  assessments: { title: 'Assessment Engagement', subtitle: 'Starts and completions for the assessments implemented in this prototype.' },
  outcomes: { title: 'Outcomes & Recovery', subtitle: 'Illustrative trend views, with limits made explicit where baseline data is unavailable.' },
  programs: { title: 'Program Engagement', subtitle: 'Participation and plan activity across the illustrative demo cohort.' },
  employees: { title: 'Employees', subtitle: 'A privacy-conscious view of registration and participation status.' },
};

const panelClass = 'rounded-lg border border-[#e4e9e0] bg-white shadow-[0_2px_12px_rgba(42,64,38,0.035)]';

function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#252d26]">{title}</h2>
      {detail && <p className="mt-1 text-xs leading-5 text-[#70796f]">{detail}</p>}
    </div>
  );
}

function StatCard({ label, value, context, icon: Icon }: { label: string; value: string; context: string; icon: typeof Users }) {
  return (
    <article className={`${panelClass} min-w-0 p-4 sm:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium leading-5 text-[#687168]">{label}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#f1f5ee] text-[#4a7047]"><Icon size={16} strokeWidth={1.8} /></span>
      </div>
      <p className="mt-3 text-[27px] font-semibold leading-none tracking-[-0.04em] text-[#20251f]">{value}</p>
      <p className="mt-2 text-[11px] leading-4 text-[#758075]">{context}</p>
    </article>
  );
}

function DistributionCard({ title, description, distribution }: {
  title: string;
  description: string;
  distribution: { name: string; value: number; color: string }[];
}) {
  const total = getDistributionTotal(distribution);
  return (
    <section className={`${panelClass} p-4 sm:p-5`}>
      <SectionTitle title={title} detail={description} />
      {total === 0 ? (
        <div className="flex h-[190px] items-center justify-center rounded bg-[#fafbf9] text-sm text-[#70796f]">Not enough data to display.</div>
      ) : (
        <div className="grid min-w-0 grid-cols-[minmax(0,104px)_minmax(0,1fr)] items-center gap-3">
          <div className="relative h-[130px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={35} outerRadius={48} paddingAngle={2} stroke="none">
                  {distribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-semibold text-[#283129]">{total}</span>
              <span className="text-[9px] uppercase tracking-[0.1em] text-[#7b847a]">demo n</span>
            </div>
          </div>
          <div className="min-w-0 space-y-2.5">
            {distribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="min-w-0 flex-1 truncate text-[10px] text-[#505950]">{item.name}</span>
                <span className="text-[10px] font-semibold text-[#303930]">{item.value}</span>
                <span className="w-8 text-right text-[9px] tabular-nums text-[#828a81]">{Math.round(item.value / total * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mt-3 border-t border-[#eef0ec] pt-2.5 text-[10px] text-[#818a80]">Denominator: {total} illustrative demo responses</p>
    </section>
  );
}

function WorkforceSection() {
  return (
    <section>
      <SectionTitle title="Workforce wellbeing" detail="Distributions use the supported Stress Mapping, energy, and check-in mood categories. Values are illustrative demo data, not employee measurements." />
      <div className="grid gap-4 lg:grid-cols-3">
        <DistributionCard title="Stress distribution" description="Stress Mapping bands" distribution={STRESS_DISTRIBUTION} />
        <DistributionCard title="Energy distribution" description="Low, moderate, and high energy" distribution={ENERGY_DISTRIBUTION} />
        <DistributionCard title="Mood distribution" description="great + good · okay · struggling + exhausted" distribution={MOOD_DISTRIBUTION} />
      </div>
      <div className={`${panelClass} mt-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-center`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5f1e8] text-[#9c7131]"><HeartPulse size={19} /></span>
        <div>
          <h3 className="text-sm font-semibold text-[#323a32]">Recovery patterns</h3>
          <p className="mt-1 text-xs leading-5 text-[#70796f]">Baseline data needed. The prototype does not collect comparable longitudinal recovery observations across employees.</p>
        </div>
        <span className="sm:ml-auto sm:whitespace-nowrap rounded-full border border-[#e7e4da] bg-[#fbfaf7] px-3 py-1 text-[10px] font-medium text-[#777365]">Not enough data</span>
      </div>
    </section>
  );
}

function AssessmentSection() {
  const rows = useMemo(() => getAssessmentRows(), []);
  return (
    <section className={`${panelClass} p-4 sm:p-5`}>
      <SectionTitle title="Assessment engagement" detail="Prototype-only sample counts. Eligible population is the 24-record illustrative cohort; completion rate is completed / started." />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#e9ece6] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7b847a]">
              <th className="px-3 py-3">Assessment</th><th className="px-3 py-3 text-right">Eligible</th><th className="px-3 py-3 text-right">Started</th><th className="px-3 py-3 text-right">Completed</th><th className="px-3 py-3 text-right">Not started</th><th className="px-3 py-3 text-right">Completion</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-b border-[#f0f2ee] last:border-0">
                <td className="px-3 py-3 text-xs font-medium text-[#353d35]">{row.name}</td>
                <td className="px-3 py-3 text-right text-xs tabular-nums text-[#586158]">{row.eligible}</td>
                <td className="px-3 py-3 text-right text-xs tabular-nums text-[#586158]">{row.started}</td>
                <td className="px-3 py-3 text-right text-xs tabular-nums text-[#586158]">{row.completed}</td>
                <td className="px-3 py-3 text-right text-xs tabular-nums text-[#586158]">{row.notStarted}</td>
                <td className="px-3 py-3 text-right text-xs font-semibold tabular-nums text-[#31552b]">{row.completionRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-md bg-[#f7f8f4] px-3 py-2.5 text-[10px] leading-4 text-[#70796f]">
        <ClipboardCheck size={14} className="mt-0.5 shrink-0 text-[#61795c]" />
        <p>All five listed tools have working prototype flows: Stress Mapping uses its dedicated assessment flow; the other four are interactive demo questionnaires. Counts are illustrative, not tracked across users.</p>
      </div>
    </section>
  );
}

function OutcomesSection({ period }: { period: Period }) {
  const data = getTrendForPeriod(period);
  const metrics = getWorkforceMetrics();
  return (
    <section>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(250px,0.8fr)]">
        <div className={`${panelClass} p-4 sm:p-5`}>
          <SectionTitle title="Stress and energy trend" detail={`Illustrative weekly demo series shown for the selected ${period.toLowerCase()} window. It is not measured employee history.`} />
          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 16, bottom: 2, left: -18 }}>
                <CartesianGrid stroke="#edf0eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: '#747d73', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#747d73', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Line type="monotone" dataKey="stress" name="Stress score (demo)" stroke="#c78135" strokeWidth={2.5} dot={{ r: 3, fill: '#c78135' }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="energy" name="Energy score (demo)" stroke="#4d7851" strokeWidth={2.5} dot={{ r: 3, fill: '#4d7851' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[10px] text-[#818a80]">Score scale: 0–100 · Sample size: synthetic weekly series · No causal interpretation</p>
        </div>
        <div className="space-y-4">
          <div className={`${panelClass} p-5`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f5f1e8] text-[#9c7131]"><Activity size={18} /></span>
            <h3 className="mt-3 text-sm font-semibold">Before-and-after comparison</h3>
            <p className="mt-2 text-xs leading-5 text-[#70796f]">Baseline data needed. No comparable observations are available to classify people as improved, stable, or worsened.</p>
          </div>
          <div className={`${panelClass} p-5`}>
            <h3 className="text-sm font-semibold">Wellness Plan completion</h3>
            <p className="mt-1 text-[10px] text-[#818a80]">Illustrative demo records</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div><p className="text-2xl font-semibold">{metrics.plansCompleted}</p><p className="mt-1 text-[10px] text-[#70796f]">of {metrics.plansStarted} started plans completed</p></div>
              <span className="rounded bg-[#edf3e9] px-2.5 py-1.5 text-sm font-semibold text-[#31552b]">{metrics.planCompletionRate}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#edf0eb]"><div className="h-full rounded-full bg-[#62845d]" style={{ width: `${metrics.planCompletionRate}%` }} /></div>
          </div>
        </div>
      </div>
      <div className={`${panelClass} mt-4 p-5`}>
        <SectionTitle title="Productivity and program impact" detail="Wellbeing outcomes and productivity outcomes are kept separate." />
        <div className="flex items-start gap-3 rounded-md border border-dashed border-[#d9dfd6] bg-[#fafbf9] p-4">
          <Target size={18} className="mt-0.5 shrink-0 text-[#64725f]" />
          <div><p className="text-xs font-semibold text-[#424a42]">Measurement opportunity</p><p className="mt-1 text-xs leading-5 text-[#70796f]">Focus, employee-reported productivity, and engagement-linked outcome measures are not collected in the current prototype. No productivity impact is claimed.</p></div>
        </div>
      </div>
    </section>
  );
}

function ProgramsSection() {
  const metrics = getWorkforceMetrics();
  const participation = [
    { name: 'Active', value: DEMO_EMPLOYEES.filter((employee) => employee.participation === 'Active').length, color: '#356951' },
    { name: 'Registered', value: DEMO_EMPLOYEES.filter((employee) => employee.participation === 'Registered').length, color: '#8ba987' },
    { name: 'Not started', value: DEMO_EMPLOYEES.filter((employee) => employee.participation === 'Not started').length, color: '#d5d9d1' },
  ];
  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active program participants" value={`${metrics.active}`} context="Of the 24 illustrative demo profiles" icon={Users} />
        <StatCard label="Started a Wellness Plan" value={`${metrics.plansStarted}`} context="Illustrative demo records" icon={Activity} />
        <StatCard label="Completed plan activities" value={`${metrics.plansCompleted}`} context={`${metrics.planCompletionRate}% of started demo plans`} icon={ClipboardCheck} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className={`${panelClass} p-5`}>
          <SectionTitle title="Program participation status" detail="Counts from the synthetic cohort; no live program roster is connected." />
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participation} layout="vertical" margin={{ top: 5, right: 18, bottom: 5, left: 15 }}>
                <CartesianGrid stroke="#edf0eb" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: '#747d73', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={78} tick={{ fill: '#596259', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" name="Demo profiles" barSize={24} radius={[0, 4, 4, 0]}>
                  {participation.map((item) => <Cell key={item.name} fill={item.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={`${panelClass} flex flex-col justify-center p-6`}>
          <h3 className="text-sm font-semibold">Engagement is not an outcome</h3>
          <p className="mt-2 text-xs leading-5 text-[#70796f]">These sample statuses describe participation only. They do not demonstrate changes in wellbeing, recovery, or productivity and should not be interpreted as causal impact.</p>
          <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.1em] text-[#838b82]">Prototype sample · not organization-wide</p>
        </div>
      </div>
      <div className="mt-4"><AssessmentSection /></div>
    </section>
  );
}

function EmployeesSection() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All departments');
  const departments = useMemo(() => ['All departments', ...Array.from(new Set(DEMO_EMPLOYEES.map((employee) => employee.department)))], []);
  const filteredEmployees = useMemo(() => DEMO_EMPLOYEES.filter((employee) => {
    const matchesSearch = `${employee.name} ${employee.id}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesSearch && (department === 'All departments' || employee.department === department);
  }), [department, search]);

  return (
    <section>
      <div className={`${panelClass} mb-4 flex items-start gap-3 border-[#e8dfce] bg-[#fffdf8] p-4`}>
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-[#9b783c]" />
        <div><p className="text-xs font-semibold text-[#4a4335]">Privacy and prototype limitation</p><p className="mt-1 text-xs leading-5 text-[#746e5f]">This directory contains synthetic demo profiles only. No personal reflections, individual scores, or sensitive assessment answers are shown. Client-side filtering is not an organization-wide privacy control.</p></div>
      </div>
      <div className={`${panelClass} overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b border-[#edf0eb] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-sm font-semibold">Demo employee directory</h2><p className="mt-1 text-[11px] text-[#7b847a]">{filteredEmployees.length} of {DEMO_EMPLOYEES.length} synthetic profiles</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#899188]" />
              <input aria-label="Search demo employees" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search demo profiles" className="h-9 w-full rounded border border-[#dfe4dc] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#6c8a65] sm:w-[205px]" />
            </label>
            <select aria-label="Filter by department" value={department} onChange={(event) => setDepartment(event.target.value)} className="h-9 rounded border border-[#dfe4dc] bg-white px-3 text-xs text-[#505950] outline-none focus:border-[#6c8a65]">
              {departments.map((name) => <option key={name}>{name}</option>)}
            </select>
          </div>
        </div>
        {filteredEmployees.length === 0 ? (
          <div className="p-10 text-center"><p className="text-sm font-medium text-[#4f594f]">No matching demo profiles</p><p className="mt-1 text-xs text-[#818a80]">Try a different name or department.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead><tr className="bg-[#fafbf9] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7b847a]"><th className="px-4 py-3">Demo profile</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">Registration</th><th className="px-4 py-3">Program participation</th><th className="px-4 py-3">Assessment engagement</th></tr></thead>
              <tbody>{filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-t border-[#f0f2ee] text-xs">
                  <td className="px-4 py-3.5"><span className="font-medium text-[#384038]">{employee.name}</span><span className="ml-2 rounded bg-[#f2f3f0] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#737c73]">Demo</span></td>
                  <td className="px-4 py-3.5 text-[#586158]">{employee.department}</td>
                  <td className="px-4 py-3.5 text-[#586158]">Registered</td>
                  <td className="px-4 py-3.5"><StatusLabel value={employee.participation} /></td>
                  <td className="px-4 py-3.5"><StatusLabel value={employee.assessment} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function StatusLabel({ value }: { value: string }) {
  const active = value === 'Active' || value === 'Completed';
  return <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${active ? 'bg-[#edf3e9] text-[#456b42]' : value === 'In progress' || value === 'Registered' ? 'bg-[#f7f1e6] text-[#896b36]' : 'bg-[#f1f2ef] text-[#6f776e]'}`}>{value}</span>;
}

export function AdminDashboardPage({ section }: { section: AdminSection }) {
  const [period, setPeriod] = useState<Period>('30 days');
  const content = sectionContent[section];
  const metrics = getWorkforceMetrics();

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 pt-6 sm:px-6 lg:px-9 lg:pt-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full border border-[#dce5d8] bg-[#f1f5ee] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#456b42]">Illustrative demo data</span>
            <span className="text-[10px] text-[#858d83]">Local prototype · not live organization data</span>
          </div>
          <h1 className="text-[26px] font-semibold tracking-[-0.035em] text-[#20251f] sm:text-[30px]">{content.title}</h1>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#687168] sm:text-sm">{content.subtitle}</p>
        </div>
        <label className="flex items-center gap-2 self-start text-[11px] font-medium text-[#687168] sm:self-auto">
          <span>Reporting window</span>
          <select value={period} onChange={(event) => {
            const value = event.target.value;
            setPeriod(value === '7 days' || value === '90 days' ? value : '30 days');
          }} className="h-9 rounded border border-[#dfe4dc] bg-white px-3 text-xs text-[#3b443b] outline-none focus:border-[#6c8a65]">
            <option>7 days</option><option>30 days</option><option>90 days</option>
          </select>
        </label>
      </div>

      {section === 'overview' && <>
        <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Registered employees" value={`${metrics.registered}`} context="Synthetic demo profiles in this browser" icon={Users} />
          <StatCard label="Active program participants" value={`${metrics.active}`} context={`Of ${metrics.registered} illustrative profiles`} icon={Activity} />
          <StatCard label="Assessment completion rate" value={`${metrics.completionRate}%`} context={`${metrics.assessed} completed of ${metrics.registered} demo profiles`} icon={ClipboardCheck} />
          <StatCard label="Overall wellbeing index" value={`${metrics.wellbeingIndex}`} context="Illustrative index · scale 0–100" icon={HeartPulse} />
        </div>
        <div className="space-y-7">
          <WorkforceSection />
          <AssessmentSection />
          <OutcomesSection period={period} />
        </div>
      </>}
      {section === 'workforce' && <WorkforceSection />}
      {section === 'assessments' && <AssessmentSection />}
      {section === 'outcomes' && <OutcomesSection period={period} />}
      {section === 'programs' && <ProgramsSection />}
      {section === 'employees' && <EmployeesSection />}
      <footer className="mt-8 border-t border-[#e5e9e3] pt-4 text-[10px] leading-4 text-[#858d83]">
        Demo statistics are seeded locally and are not representative of a real workforce. Reporting window: {period}. No employee-level wellbeing detail is shown.
      </footer>
    </div>
  );
}
