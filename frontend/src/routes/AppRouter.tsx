import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute, AdminRoute } from './RouteGuards';

// Public pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { OnboardingPage } from '../pages/OnboardingPage';

// Authenticated app pages
import { DashboardPage } from '../pages/DashboardPage';
import { FootprintPage } from '../pages/FootprintPage';
import { RecommendationsPage } from '../pages/RecommendationsPage';
import { ChallengesPage } from '../pages/ChallengesPage';
import { SolarCalculatorPage } from '../pages/SolarCalculatorPage';
import { CommunityPage } from '../pages/CommunityPage';
import { AssistantPage } from '../pages/AssistantPage';
import { WeatherEnergyPage } from '../pages/WeatherEnergyPage';
import { ResourcesPage } from '../pages/ResourcesPage';
import { ResourceDetailPage } from '../pages/ResourceDetailPage';
import { ProgressImpactPage } from '../pages/ProgressImpactPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AdminPage } from '../pages/AdminPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public standalone pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* App Layout wrapped pages */}
        <Route element={<AppLayout />}>
          {/* Protected citizen routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/footprint" element={<FootprintPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/solar" element={<SolarCalculatorPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/weather" element={<WeatherEnergyPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/resources/:slug" element={<ResourceDetailPage />} />
            <Route path="/progress" element={<ProgressImpactPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Protected administrator routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
