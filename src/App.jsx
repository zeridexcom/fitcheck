import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import useStore from './stores/useStore';
import Link from 'react-router-dom';
import BottomNav from './components/BottomNav';
import ParticleBackground from './components/ParticleBackground';
import FitBuddyAgent from './components/FitBuddyAgent';
import fitBuddy from './services/fitbuddy';

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
import Fasting from './pages/Fasting';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import Supplements from './pages/Supplements';
import MealPlanner from './pages/MealPlanner';

import './index.css';

// Apply saved theme on load
const THEMES = {
  default: { accent: '#00FF87', secondary: '#00D4FF' },
  purple: { accent: '#A855F7', secondary: '#EC4899' },
  orange: { accent: '#FF9F43', secondary: '#FF5E5E' },
  blue: { accent: '#00D4FF', secondary: '#6366F1' },
  pink: { accent: '#FF6B9D', secondary: '#A855F7' },
};

function AppContent() {
  const { hasOnboarded } = useStore();

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('fitcheck-theme');
    if (savedTheme && THEMES[savedTheme]) {
      document.documentElement.style.setProperty('--accent-primary', THEMES[savedTheme].accent);
      document.documentElement.style.setProperty('--accent-secondary', THEMES[savedTheme].secondary);
    }
  }, []);

  const handleManualVoiceTrigger = () => {
    fitBuddy.wakeUp();
  };

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
          <Route path="/" element={<Dashboard onVoiceClick={handleManualVoiceTrigger} />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/water" element={<Water />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/fasting" element={<Fasting />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/supplements" element={<Supplements />} />
          <Route path="/meal-planner" element={<MealPlanner />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <BottomNav />
      <FitBuddyAgent alwaysListening={true} />
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
