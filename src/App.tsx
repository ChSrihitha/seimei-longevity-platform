import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { AssessmentsHub } from './features/assessments/AssessmentsHub';
import { StressMappingFlow } from './features/stress-mapping/StressMappingFlow';
import { StressMappingResults } from './features/stress-mapping/StressMappingResults';
import { InsightsPage } from './features/insights/InsightsPage';
import { AICompanionPage } from './features/ai-companion/AICompanionPage';

import { WellnessPlanPage } from './features/wellness-plan/WellnessPlanPage';
import { RecommendationsPage } from './features/recommendations/RecommendationsPage';
import { ProgramsPage } from './features/programs/ProgramsPage';
import { ResourcesPage } from './features/resources/ResourcesPage';
import { DemoAssessmentPage } from './features/assessments/DemoAssessmentPage';
import { SmartAlertsPage } from './features/alerts/SmartAlertsPage';
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sign-in" element={<LoginPage />} />
      <Route path="/create-account" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        
        <Route path="assessments" element={<AssessmentsHub />} />
        
        <Route path="assessments/stress-mapping" element={<StressMappingFlow />} />
        <Route path="assessments/:assessmentId" element={<DemoAssessmentPage />} />
        
        <Route path="results/stress-mapping" element={<StressMappingResults />} />
        
        <Route path="insights" element={<InsightsPage />} />
        
        <Route path="ai-companion" element={<AICompanionPage />} />

        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="smart-alerts" element={<SmartAlertsPage />} />
        
        <Route path="wellness-plan" element={<WellnessPlanPage />} />
        
        <Route path="programs" element={<ProgramsPage />} />
        <Route path="programs/:programId" element={<ProgramsPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="resources/:resourceId" element={<ResourcesPage />} />

        <Route path="*" element={
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] mb-2">404</h1>
            <p className="text-[var(--color-text-secondary)]">The requested page could not be found.</p>
          </div>
        } />
        </Route>
      </Route>
    </Routes>
  );
}
