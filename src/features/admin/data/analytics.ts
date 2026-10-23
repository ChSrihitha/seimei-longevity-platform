import type { StressMappingResult, WellbeingCheckIn, WellbeingSnapshot } from '../../../types';

export type DemoEmployee = {
  id: string;
  name: string;
  department: string;
  participation: 'Active' | 'Registered' | 'Not started';
  assessment: 'Completed' | 'In progress' | 'Not started';
  plan: 'Completed' | 'In progress' | 'Not started';
};

export type Period = '7 days' | '30 days' | '90 days';

export const DEMO_EMPLOYEES: DemoEmployee[] = Array.from({ length: 24 }, (_, index) => ({
  id: `demo-${String(index + 1).padStart(2, '0')}`,
  name: `Demo colleague ${String(index + 1).padStart(2, '0')}`,
  department: ['Product', 'People & Culture', 'Operations', 'Customer Experience'][index % 4],
  participation: index < 16 ? 'Active' : index < 20 ? 'Registered' : 'Not started',
  assessment: index < 18 ? 'Completed' : index < 21 ? 'In progress' : 'Not started',
  plan: index < 10 ? 'Completed' : index < 15 ? 'In progress' : 'Not started',
}));

const demoStressCounts: { category: StressMappingResult['category']; count: number }[] = [
  { category: 'low', count: 5 },
  { category: 'manageable', count: 8 },
  { category: 'elevated', count: 7 },
  { category: 'high', count: 4 },
];

export const STRESS_DISTRIBUTION = demoStressCounts.map(({ category, count }) => ({
  name: category[0].toUpperCase() + category.slice(1),
  value: count,
  color: { low: '#356951', manageable: '#8ba987', elevated: '#d99a3d', high: '#c66c60' }[category],
}));

const demoEnergyCounts: { category: WellbeingSnapshot['energyLevel']; count: number }[] = [
  { category: 'low', count: 6 },
  { category: 'moderate', count: 11 },
  { category: 'high', count: 7 },
];

export const ENERGY_DISTRIBUTION = demoEnergyCounts.map(({ category, count }) => ({
  name: category[0].toUpperCase() + category.slice(1),
  value: count,
  color: { low: '#c66c60', moderate: '#8ba987', high: '#356951' }[category],
}));

const demoMoodCounts: { mood: WellbeingCheckIn['mood']; count: number }[] = [
  { mood: 'great', count: 3 },
  { mood: 'good', count: 5 },
  { mood: 'okay', count: 11 },
  { mood: 'struggling', count: 3 },
  { mood: 'exhausted', count: 2 },
];

export const MOOD_DISTRIBUTION = [
  { name: 'Positive', value: demoMoodCounts.filter(({ mood }) => mood === 'great' || mood === 'good').reduce((sum, item) => sum + item.count, 0), color: '#356951' },
  { name: 'Neutral', value: demoMoodCounts.filter(({ mood }) => mood === 'okay').reduce((sum, item) => sum + item.count, 0), color: '#8ba987' },
  { name: 'Struggling', value: demoMoodCounts.filter(({ mood }) => mood === 'struggling' || mood === 'exhausted').reduce((sum, item) => sum + item.count, 0), color: '#d99a3d' },
];

export const ASSESSMENT_ENGAGEMENT = [
  { name: 'Stress Mapping', started: 20, completed: 16 },
  { name: 'Mental Wellness Check', started: 18, completed: 15 },
  { name: 'Burnout Risk Index', started: 15, completed: 12 },
  { name: 'Sentiment Analysis', started: 14, completed: 11 },
  { name: 'Engagement Prediction', started: 12, completed: 9 },
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

export function getWorkforceMetrics(employees: DemoEmployee[] = DEMO_EMPLOYEES) {
  const registered = employees.length;
  const active = employees.filter((employee) => employee.participation === 'Active').length;
  const assessed = employees.filter((employee) => employee.assessment === 'Completed').length;
  const plansStarted = employees.filter((employee) => employee.plan !== 'Not started').length;
  const plansCompleted = employees.filter((employee) => employee.plan === 'Completed').length;

  return {
    registered,
    active,
    assessed,
    completionRate: registered ? Math.round((assessed / registered) * 100) : 0,
    wellbeingIndex: 68,
    plansStarted,
    plansCompleted,
    planCompletionRate: plansStarted ? Math.round((plansCompleted / plansStarted) * 100) : 0,
  };
}

export function getDistributionTotal(distribution: { value: number }[]) {
  return distribution.reduce((total, item) => total + item.value, 0);
}

export function getAssessmentRows() {
  const eligible = DEMO_EMPLOYEES.length;
  return ASSESSMENT_ENGAGEMENT.map((assessment) => ({
    ...assessment,
    eligible,
    notStarted: Math.max(eligible - assessment.started, 0),
    completionRate: assessment.started ? Math.round((assessment.completed / assessment.started) * 100) : 0,
  }));
}

export function getTrendForPeriod(period: Period) {
  const periods = period === '7 days' ? 1 : period === '30 days' ? 4 : 12;
  return ILLUSTRATIVE_TREND.slice(-periods);
}
