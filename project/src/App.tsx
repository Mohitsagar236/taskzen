import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useUserStore } from './store/userStore';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import AllTasks from './pages/AllTasks';
import CategoryTasks from './pages/CategoryTasks';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';

function App() {
  const { isDarkMode } = useUserStore();

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<AllTasks />} />
            <Route path="category/:category" element={<CategoryTasks />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: isDarkMode ? '#1F2937' : '#FFFFFF',
            color: isDarkMode ? '#F9FAFB' : '#1F2937',
            border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
          },
        }}
      />
    </div>
  );
}

export default App;