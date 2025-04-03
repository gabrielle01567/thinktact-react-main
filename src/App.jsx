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
import React from 'react';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="analyzer" element={<Analyzer />} />
          <Route path="about" element={<About />} />
          <Route path="blog" element={<Blog />} />
          <Route path="founder" element={<Founder />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="research" element={<Research />} />
          <Route path="research/clarity-infrastructure" element={<ClarityInfrastructure />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
