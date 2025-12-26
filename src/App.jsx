import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import useStore from './stores/useStore';
import BottomNav from './components/BottomNav';
import ParticleBackground from './components/ParticleBackground';

// Onboarding Pages
import Welcome from './pages/Onboarding/Welcome';
import GoalSelect from './pages/Onboarding/GoalSelect';
import ProfileSetup from './pages/Onboarding/ProfileSetup';
import ApiSetup from './pages/Onboarding/ApiSetup';

// Main Pages
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Water from './pages/Water';
import Workout from './pages/Workout';
import Coach from './pages/Coach';
import Progress from './pages/Progress';

import './index.css';

function AppContent() {
  const { hasOnboarded } = useStore();

  if (!hasOnboarded) {
    return (
      <>
        <ParticleBackground />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/onboarding" element={<Welcome />} />
            <Route path="/onboarding/goal" element={<GoalSelect />} />
            <Route path="/onboarding/profile" element={<ProfileSetup />} />
            <Route path="/onboarding/api" element={<ApiSetup />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </Routes>
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <ParticleBackground />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/water" element={<Water />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
