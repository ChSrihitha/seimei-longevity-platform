import type { StressMappingResult, WellbeingCheckIn, WellbeingSnapshot } from '../../../types';
import { SEIMEI_PROGRAMS, type SeimeiProgramId } from '../../../data/programCatalog';
import { demoAssessmentConfigs } from '../../../data/assessmentConfigs';

/*
 * DEMO DATA ONLY.
 * Everything below is a deterministic, seeded synthetic cohort generated in the browser.
 * It is not connected to any employee's real activity, and HR views only ever read the
 * aggregate helpers exported from this module (never the per-employee monthly records).
 */

/** Minimum number of people behind any reported figure. Smaller groups are suppressed. */
export const MIN_GROUP_SIZE = 10;

export type DemoEmployee = {
  id: string;
  name: string;
  department: string;
  participation: 'Active' | 'Registered' | 'Not started';
  assessment: 'Completed' | 'In progress' | 'Not started';
  plan: 'Completed' | 'In progress' | 'Not started';
};

export type Period = '7 days' | '30 days' | '90 days';
export type MonthWindow = 3 | 6 | 12;
export const MONTH_WINDOWS: MonthWindow[] = [3, 6, 12];

/** Assessments and check-ins with working interactive flows in the employee app. */
export const IMPLEMENTED_CHECKS = [
  { id: 'daily-check-in', name: 'Daily Wellbeing Check-in' },
  { id: 'stress-mapping', name: 'Stress Mapping' },
  { id: 'mental-wellness', name: demoAssessmentConfigs['mental-wellness'].title },
  { id: 'burnout-risk', name: demoAssessmentConfigs['burnout-risk'].title },
  { id: 'sentiment', name: demoAssessmentConfigs.sentiment.title },
  { id: 'engagement', name: demoAssessmentConfigs.engagement.title },
] as const;
type CheckId = typeof IMPLEMENTED_CHECKS[number]['id'];

const DEPARTMENTS = [
  { name: 'Engineering', headcount: 52, stressBase: 0.3 },
  { name: 'Customer Experience', headcount: 41, stressBase: 0.37 },
  { name: 'Product', headcount: 38, stressBase: 0.27 },
  { name: 'Operations', headcount: 34, stressBase: 0.32 },
  { name: 'People & Culture', headcount: 22, stressBase: 0.22 },
  { name: 'Finance', headcount: 16, stressBase: 0.29 },
  { name: 'Legal', headcount: 7, stressBase: 0.25 },
] as const;

/** Twelve demo reporting months (oldest first). Fixed, so the demo never looks "live". */
export const DEMO_MONTHS = ['Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026'];
const SEASONAL_STRESS = [0, 0.03, 0.04, 0.08, 0.03, 0, -0.03, -0.01, 0.03, 0.05, 0.07, 0.04];

const PROGRAM_UPTAKE: Partial<Record<SeimeiProgramId, { enrol: number; maxSessions: number }>> = {
  reset: { enrol: 0.5, maxSessions: 4 },
  unwind: { enrol: 0.22, maxSessions: 4 },
  sleep: { enrol: 0.18, maxSessions: 3 },
  burnout: { enrol: 0.24, maxSessions: 1 },
  coaching: { enrol: 0.12, maxSessions: 1 },
};

type MonthRecord = {
  active: boolean;
  checkedIn: boolean;
  stressed: boolean;
  wellbeingScore: number | null;
  started: Partial<Record<CheckId, boolean>>;
  completed: Partial<Record<CheckId, boolean>>;
  burnoutHighRisk: boolean;
  sessions: Partial<Record<SeimeiProgramId, number>>;
};

type CohortMember = {
  id: string;
  department: string;
  propensity: number;
  stressCategory: StressMappingResult['category'];
  energy: WellbeingSnapshot['energyLevel'];
  mood: WellbeingCheckIn['mood'];
  months: MonthRecord[];
};

/** Small deterministic PRNG so the demo cohort is identical on every load. */
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STRESS_PERSISTENCE = 0.55;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Fixed seed: the demo cohort is identical on every load. */
const DEMO_SEED = 143;

function buildCohort(): CohortMember[] {
  const random = mulberry32(DEMO_SEED);
  const members: CohortMember[] = [];
  let index = 0;
  for (const department of DEPARTMENTS) {
    for (let i = 0; i < department.headcount; i += 1) {
      index += 1;
      const propensity = 0.3 + random() * 0.65;
      const enrolled = SEIMEI_PROGRAMS.flatMap((program) => {
        const uptake = PROGRAM_UPTAKE[program.id];
        if (!uptake) return [];
        return random() < uptake.enrol * (0.6 + propensity * 0.7) ? [program.id] : [];
      });
      // Stress persists month to month for a person (same mean rate, less artificial volatility).
      let underStress = random() < department.stressBase;
      const months: MonthRecord[] = DEMO_MONTHS.map((_, monthIndex) => {
        const active = random() < propensity * (0.85 + monthIndex * 0.012);
        const checkedIn = active && random() < 0.92;
        const stressRate = department.stressBase + SEASONAL_STRESS[monthIndex] + (random() - 0.5) * 0.08;
        underStress = random() < stressRate * (1 - STRESS_PERSISTENCE) + (underStress ? STRESS_PERSISTENCE : 0);
        const stressed = checkedIn && underStress;
        const started: MonthRecord['started'] = {};
        const completed: MonthRecord['completed'] = {};
        const tryCheck = (id: CheckId, startChance: number, completeChance: number) => {
          if (active && random() < startChance) {
            started[id] = true;
            completed[id] = random() < completeChance;
          }
        };
        if (checkedIn) { started['daily-check-in'] = true; completed['daily-check-in'] = true; }
        else if (active && random() < 0.2) started['daily-check-in'] = true;
        tryCheck('stress-mapping', 0.22, 0.84);
        tryCheck('mental-wellness', 0.3 * propensity + 0.08, 0.81);
        tryCheck('burnout-risk', 0.42 * propensity + 0.1, 0.86);
        tryCheck('sentiment', 0.14, 0.78);
        tryCheck('engagement', 0.1, 0.72);
        const wellbeingScore = completed['mental-wellness']
          ? Math.round(clamp(76 - department.stressBase * 40 - (stressed ? 12 : 0) + (random() - 0.5) * 26, 12, 98))
          : null;
        const burnoutHighRisk = Boolean(completed['burnout-risk']) && random() < (stressed ? 0.42 : 0.1) + department.stressBase * 0.1;
        const sessions: MonthRecord['sessions'] = {};
        if (active) {
          for (const programId of enrolled) {
            const uptake = PROGRAM_UPTAKE[programId];
            if (!uptake) continue;
            const count = Math.floor(random() * (uptake.maxSessions + 1));
            if (count > 0) sessions[programId] = count;
          }
        }
        return { active, checkedIn, stressed, wellbeingScore, started, completed, burnoutHighRisk, sessions };
      });
      const stressRoll = random() + department.stressBase * 0.4;
      members.push({
        id: `demo-${String(index).padStart(3, '0')}`,
        department: department.name,
        propensity,
        stressCategory: stressRoll < 0.3 ? 'low' : stressRoll < 0.62 ? 'manageable' : stressRoll < 0.92 ? 'elevated' : 'high',
        energy: random() < 0.26 ? 'low' : random() < 0.62 ? 'moderate' : 'high',
        mood: (['great', 'good', 'okay', 'okay', 'okay', 'struggling', 'exhausted'] as const)[Math.floor(random() * 7)],
        months,
      });
    }
  }
  return members;
}

const COHORT = buildCohort();
const LATEST = DEMO_MONTHS.length - 1;

/* ------------------------------------------------------------------ */
/* Existing employee directory + distribution exports (now cohort-driven) */
/* ------------------------------------------------------------------ */

export const DEMO_EMPLOYEES: DemoEmployee[] = COHORT.map((member, index) => {
  const latest = member.months[LATEST];
  // Assessment status covers the five questionnaires; the daily check-in is tracked separately.
  const isAssessment = ([id]: [string, unknown]) => id !== 'daily-check-in';
  const everCompleted = member.months.some((month) => Object.entries(month.completed).filter(isAssessment).some(([, done]) => done));
  const everStarted = member.months.some((month) => Object.entries(month.started).filter(isAssessment).some(([, begun]) => begun));
  const recentlyActive = member.months.slice(-3).some((month) => month.active);
  return {
    id: member.id,
    name: `Demo colleague ${String(index + 1).padStart(3, '0')}`,
    department: member.department,
    participation: latest.active ? 'Active' : recentlyActive ? 'Registered' : 'Not started',
    assessment: everCompleted ? 'Completed' : everStarted ? 'In progress' : 'Not started',
    plan: member.propensity > 0.72 ? 'Completed' : member.propensity > 0.52 ? 'In progress' : 'Not started',
  };
});

function countBy<T extends string>(values: T[], order: readonly T[]) {
  return order.map((key) => ({ key, count: values.filter((value) => value === key).length }));
}
const title = (value: string) => value[0].toUpperCase() + value.slice(1);

export const STRESS_DISTRIBUTION = countBy(COHORT.map((member) => member.stressCategory), ['low', 'manageable', 'elevated', 'high'] as const).map(({ key, count }) => ({
  name: title(key),
  value: count,
  color: { low: '#356951', manageable: '#8ba987', elevated: '#d99a3d', high: '#c66c60' }[key],
}));

export const ENERGY_DISTRIBUTION = countBy(COHORT.map((member) => member.energy), ['low', 'moderate', 'high'] as const).map(({ key, count }) => ({
  name: title(key),
  value: count,
  color: { low: '#c66c60', moderate: '#8ba987', high: '#356951' }[key],
}));

const moods = COHORT.map((member) => member.mood);
export const MOOD_DISTRIBUTION = [
  { name: 'Positive', value: moods.filter((mood) => mood === 'great' || mood === 'good').length, color: '#356951' },
  { name: 'Neutral', value: moods.filter((mood) => mood === 'okay').length, color: '#8ba987' },
  { name: 'Struggling', value: moods.filter((mood) => mood === 'struggling' || mood === 'exhausted').length, color: '#d99a3d' },
];

export const ILLUSTRATIVE_TREND = [
  { period: 'Wk 1', stress: 64, energy: 48 },
  { period: 'Wk 2', stress: 61, energy: 50 },
  { period: 'Wk 3', stress: 63, energy: 49 },
  { period: 'Wk 4', stress: 58, energy: 53 },
  { period: 'Wk 5', stress: 60, energy: 51 },
  { period: 'Wk 6', stress: 57, energy: 54 },
  { period: 'Wk 7', stress: 59, energy: 52 },
  { period: 'Wk 8', stress: 54, energy: 56 },
  { period: 'Wk 9', stress: 56, energy: 55 },
  { period: 'Wk 10', stress: 52, energy: 58 },
  { period: 'Wk 11', stress: 54, energy: 57 },
  { period: 'Wk 12', stress: 51, energy: 60 },
];

const average = (values: number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
const percent = (part: number, whole: number) => whole ? Math.round((part / whole) * 100) : 0;

export function getWorkforceMetrics(employees: DemoEmployee[] = DEMO_EMPLOYEES) {
  const registered = employees.length;
  const active = employees.filter((employee) => employee.participation === 'Active').length;
  const assessed = employees.filter((employee) => employee.assessment === 'Completed').length;
  const plansStarted = employees.filter((employee) => employee.plan !== 'Not started').length;
  const plansCompleted = employees.filter((employee) => employee.plan === 'Completed').length;
  const scores = COHORT.flatMap((member) => member.months.slice(-3).map((month) => month.wellbeingScore)).filter((score): score is number => score !== null);

  return {
    registered,
    active,
    assessed,
    completionRate: percent(assessed, registered),
    wellbeingIndex: average(scores) ?? 0,
    plansStarted,
    plansCompleted,
    planCompletionRate: percent(plansCompleted, plansStarted),
  };
}

export function getDistributionTotal(distribution: { value: number }[]) {
  return distribution.reduce((total, item) => total + item.value, 0);
}

export function getTrendForPeriod(period: Period) {
  const periods = period === '7 days' ? 1 : period === '30 days' ? 4 : 12;
  return ILLUSTRATIVE_TREND.slice(-periods);
}

/* ------------------------------------------------------------------ */
/* HR analytics aggregates (k-anonymised)                              */
/* ------------------------------------------------------------------ */

/** A reported figure, or `null` with the reason when the underlying group is too small. */
export type Suppressible = { value: number; n: number } | { value: null; n: number };
const suppressible = (value: number, n: number): Suppressible => (n >= MIN_GROUP_SIZE ? { value, n } : { value: null, n });

function monthRange(window: MonthWindow) {
  const start = DEMO_MONTHS.length - window;
  return { start, months: DEMO_MONTHS.slice(start), indexes: DEMO_MONTHS.map((_, i) => i).slice(start) };
}

function monthKpis(monthIndex: number) {
  const records = COHORT.map((member) => member.months[monthIndex]);
  const scores = records.map((record) => record.wellbeingScore).filter((score): score is number => score !== null);
  const burnoutCompleted = records.filter((record) => record.completed['burnout-risk']);
  return {
    participation: suppressible(percent(records.filter((record) => record.active).length, records.length), records.length),
    wellbeing: suppressible(average(scores) ?? 0, scores.length),
    highBurnout: suppressible(percent(burnoutCompleted.filter((record) => record.burnoutHighRisk).length, burnoutCompleted.length), burnoutCompleted.length),
  };
}

const sumVisits = (indexes: number[]) => COHORT.reduce((total, member) => total + indexes.reduce((monthTotal, i) => monthTotal + Object.values(member.months[i].sessions).reduce<number>((a, b) => a + (b ?? 0), 0), 0), 0);

export function getMonthlyVisits(window: MonthWindow) {
  const { months, indexes } = monthRange(window);
  return indexes.map((i, column) => ({ month: months[column], visits: sumVisits([i]) }));
}

export type Kpi = { current: Suppressible; previous: Suppressible | null; unit: '%' | 'score' | 'count'; comparisonLabel: string };

export function getOverviewKpis(window: MonthWindow) {
  const { indexes } = monthRange(window);
  const latest = monthKpis(LATEST);
  const previous = monthKpis(LATEST - 1);
  const previousIndexes = indexes.map((i) => i - window).filter((i) => i >= 0);
  const visits = sumVisits(indexes);
  const latestMonth = DEMO_MONTHS[LATEST];
  const priorMonth = DEMO_MONTHS[LATEST - 1];
  return {
    latestMonth,
    headcount: COHORT.length,
    participation: { current: latest.participation, previous: previous.participation, unit: '%', comparisonLabel: `vs ${priorMonth}` } satisfies Kpi,
    wellbeing: { current: latest.wellbeing, previous: previous.wellbeing, unit: 'score', comparisonLabel: `vs ${priorMonth}` } satisfies Kpi,
    highBurnout: { current: latest.highBurnout, previous: previous.highBurnout, unit: '%', comparisonLabel: `vs ${priorMonth}` } satisfies Kpi,
    visits: {
      current: { value: visits, n: COHORT.length },
      previous: previousIndexes.length === indexes.length ? { value: sumVisits(previousIndexes), n: COHORT.length } : null,
      unit: 'count',
      comparisonLabel: previousIndexes.length === indexes.length ? `vs previous ${window} months` : 'No earlier period in demo dataset',
    } satisfies Kpi,
  };
}

export type HeatmapCell = { month: string; stressedPct: number | null; responses: number };
export type HeatmapRow = { department: string; headcount: number; cells: HeatmapCell[] };

/** % of employees who checked in that month and reported feeling stressed or overwhelmed. */
export function getStressHeatmap(window: MonthWindow) {
  const { months, indexes } = monthRange(window);
  const rows: HeatmapRow[] = [];
  const hiddenDepartments: string[] = [];
  for (const department of DEPARTMENTS) {
    const members = COHORT.filter((member) => member.department === department.name);
    if (members.length < MIN_GROUP_SIZE) { hiddenDepartments.push(department.name); continue; }
    rows.push({
      department: department.name,
      headcount: members.length,
      cells: indexes.map((i, column) => {
        const checkIns = members.filter((member) => member.months[i].checkedIn);
        const stressed = checkIns.filter((member) => member.months[i].stressed).length;
        return { month: months[column], responses: checkIns.length, stressedPct: checkIns.length >= MIN_GROUP_SIZE ? percent(stressed, checkIns.length) : null };
      }),
    });
  }
  return { months, rows, hiddenDepartments };
}

export type ProgramEnrolment = { id: SeimeiProgramId; title: string; category: string; participants: number; sessions: number; enrolledPct: number; suppressed: boolean };

export function getProgramEnrolment(window: MonthWindow): ProgramEnrolment[] {
  const { indexes } = monthRange(window);
  return SEIMEI_PROGRAMS.flatMap((program) => {
    if (!PROGRAM_UPTAKE[program.id]) return [];
    let participants = 0;
    let sessions = 0;
    for (const member of COHORT) {
      const count = indexes.reduce((total, i) => total + (member.months[i].sessions[program.id] ?? 0), 0);
      if (count > 0) participants += 1;
      sessions += count;
    }
    return [{
      id: program.id,
      title: program.title,
      category: program.category,
      participants,
      sessions,
      enrolledPct: percent(participants, COHORT.length),
      suppressed: participants < MIN_GROUP_SIZE,
    }];
  });
}

export type CheckCompletionRow = { id: CheckId; name: string; eligible: number; started: number; completed: number; notStarted: number; completionRate: number | null };

/** Unique employees who started / completed each implemented check in the window. */
export function getCheckCompletion(window: MonthWindow = 3): CheckCompletionRow[] {
  const { indexes } = monthRange(window);
  return IMPLEMENTED_CHECKS.map(({ id, name }) => {
    const started = COHORT.filter((member) => indexes.some((i) => member.months[i].started[id])).length;
    const completed = COHORT.filter((member) => indexes.some((i) => member.months[i].completed[id])).length;
    return {
      id,
      name,
      eligible: COHORT.length,
      started,
      completed,
      notStarted: COHORT.length - started,
      completionRate: started >= MIN_GROUP_SIZE ? percent(completed, started) : null,
    };
  });
}

/** Kept for the existing Assessments section. */
export function getAssessmentRows() {
  return getCheckCompletion(3);
}

export function getLatestBurnoutCheck() {
  return monthKpis(LATEST).highBurnout;
}

/* ------------------------------------------------------------------ */
/* Leadership report export                                            */
/* ------------------------------------------------------------------ */

const csvCell = (value: string | number) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const formatSuppressible = (figure: Suppressible, suffix = '') => (figure.value === null ? `Suppressed (n<${MIN_GROUP_SIZE})` : `${figure.value}${suffix}`);

/** Builds a CSV of the aggregated figures shown on the Overview. Contains no employee-level rows. */
export function buildLeadershipReportCsv(window: MonthWindow, generatedAt = new Date()) {
  const kpis = getOverviewKpis(window);
  const heatmap = getStressHeatmap(window);
  const programs = getProgramEnrolment(window);
  const rows: (string | number)[][] = [
    ['SEIMEI Leadership Wellbeing Report'],
    ['Data status', 'DEMO DATA - synthetic prototype cohort, not live company analytics'],
    ['Generated', generatedAt.toISOString()],
    ['Reporting window', `${heatmap.months[0]} to ${heatmap.months[heatmap.months.length - 1]} (${window} months)`],
    ['Minimum reporting group size', MIN_GROUP_SIZE],
    ['Privacy', 'Aggregated and anonymised. No individual answers or employee-level records included.'],
    [],
    ['Section', 'Metric', 'Value', 'Base (n)', 'Note'],
    ['KPI', `Active monthly participation (${kpis.latestMonth})`, formatSuppressible(kpis.participation.current, '%'), kpis.participation.current.n, 'Employees with any SEIMEI activity in the month'],
    ['KPI', `Average wellbeing score (${kpis.latestMonth})`, formatSuppressible(kpis.wellbeing.current), kpis.wellbeing.current.n, 'Mental Wellness Check, 0-100'],
    ['KPI', `High burnout risk (${kpis.latestMonth})`, formatSuppressible(kpis.highBurnout.current, '%'), kpis.highBurnout.current.n, 'Share of completed Burnout Risk Index checks scoring high'],
    ['KPI', 'Total programme / wellness visits', formatSuppressible(kpis.visits.current), kpis.visits.current.n, `Sessions across SEIMEI programmes, ${window} months`],
    [],
    ['Section', 'Department', 'Month', '% stressed or overwhelmed', 'Check-in responses (n)'],
    ...heatmap.rows.flatMap((row) => row.cells.map((cell) => ['Stress by department', row.department, cell.month, cell.stressedPct === null ? `Suppressed (n<${MIN_GROUP_SIZE})` : `${cell.stressedPct}%`, cell.responses >= MIN_GROUP_SIZE ? cell.responses : `<${MIN_GROUP_SIZE}`])),
    ...(heatmap.hiddenDepartments.length ? [['Stress by department', `${heatmap.hiddenDepartments.length} department(s) hidden`, '', `Fewer than ${MIN_GROUP_SIZE} employees`, '']] : []),
    [],
    ['Section', 'Programme', 'Category', 'Participants', 'Sessions', '% of workforce'],
    ...programs.map((program) => ['Programme enrolment', program.title, program.category, program.suppressed ? `<${MIN_GROUP_SIZE}` : program.participants, program.suppressed ? 'Suppressed' : program.sessions, program.suppressed ? 'Suppressed' : `${program.enrolledPct}%`]),
  ];
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}
