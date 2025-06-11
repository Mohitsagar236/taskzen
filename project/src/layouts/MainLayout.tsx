import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isDarkMode } = useUserStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className={`fixed inset-y-0 left-0 z-50 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 transition duration-200 ease-in-out`}>
          <Sidebar />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;