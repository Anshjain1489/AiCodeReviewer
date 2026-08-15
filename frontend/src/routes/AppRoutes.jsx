import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import Skeleton from '../components/Skeleton';

// Route-level Code Splitting with React.lazy
const Landing = lazy(() => import('../pages/Landing'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Projects = lazy(() => import('../pages/Projects'));
const ProjectDetails = lazy(() => import('../pages/ProjectDetails'));
const NewReview = lazy(() => import('../pages/NewReview'));
const ReviewResult = lazy(() => import('../pages/ReviewResult'));
const ReviewHistory = lazy(() => import('../pages/ReviewHistory'));
const GitHub = lazy(() => import('../pages/GitHub'));
const PullRequests = lazy(() => import('../pages/PullRequests'));
const PRReview = lazy(() => import('../pages/PRReview'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Settings = lazy(() => import('../pages/Settings'));
const NotFound = lazy(() => import('../pages/NotFound'));

const PageLoader = () => (
  <div className="py-20 max-w-4xl mx-auto space-y-6">
    <Skeleton variant="title" className="h-10" />
    <Skeleton variant="card" count={2} />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Authentication Pages */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Protected Application Workspace Pages */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/reviews/new" element={<NewReview />} />
          <Route path="/reviews/:reviewId" element={<ReviewResult />} />
          <Route path="/reviews" element={<ReviewHistory />} />
          <Route path="/github" element={<GitHub />} />
          <Route path="/github/repositories/:repositoryId/pulls" element={<PullRequests />} />
          <Route path="/github/pulls/:pullRequestId" element={<PRReview />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
