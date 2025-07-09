import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Analyzer from './pages/Analyzer';
import About from './pages/About';
import Blog from './pages/Blog';
import Founder from './pages/Founder';
import Dashboard from './pages/Dashboard';
import ErrorPage from './pages/ErrorPage';
import Research from './pages/Research';
import ClarityInfrastructure from './pages/ClarityInfrastructure';
import PatentAudit from './pages/PatentAudit';
import PatentAuditThanks from './pages/PatentAuditThanks';
import PatentApplications from './pages/PatentApplications';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import React from 'react';
import VerifyEmail from './pages/VerifyEmail';
import Verify from './pages/Verify';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import VerifyEmailChange from './pages/VerifyEmailChange';
import AnalysisDetail from './pages/AnalysisDetail';
import PatentBuddy from './pages/PatentBuddy';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="analyzer" element={<Analyzer />} />
            <Route path="about" element={<About />} />
            <Route path="blog" element={<Blog />} />
            <Route path="founder" element={<Founder />} />
            <Route path="research" element={<Research />} />
            <Route path="research/clarity-infrastructure" element={<ClarityInfrastructure />} />
            <Route path="patent-applications" element={<PatentApplications />} />
            <Route path="patent-audit-thanks" element={<PatentAuditThanks />} />
            <Route path="patent-buddy/*" element={<PatentBuddy />} />
            <Route path="*" element={<ErrorPage />} />
          </Route>
          
          {/* Authentication routes (outside Layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected Dashboard route */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Protected Profile route */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/verify-email-change" element={<VerifyEmailChange />} />
          <Route path="/analysis/:analysisId" element={<AnalysisDetail />} />

          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
