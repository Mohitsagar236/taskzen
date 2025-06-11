import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, CheckSquare, BarChart2, Users, Settings, CreditCard } from 'lucide-react';
import { Button } from './ui/Button';
import { useUserStore } from '../store/userStore';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { subscription } = useUserStore();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/team', icon: Users, label: 'Team' },
    { path: '/pricing', icon: CreditCard, label: 'Subscription' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      <Button
        variant="outline"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          w-64 bg-white dark:bg-gray-800 shadow-md
          overflow-y-auto
        `}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            TaskMaster
          </h1>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                  ${location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
                {item.path === '/pricing' && subscription?.plan !== 'team' && (
                  <span className="ml-auto text-xs font-medium px-2 py-1 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900 dark:text-blue-200">
                    {subscription?.plan || 'Free'}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;