import React from 'react';
import { useUserStore } from '../store/userStore';
import { Button } from './ui/Button';
import {
  Settings,
  Sun,
  Moon,
  Bell,
  Eye,
  Layout,
  Calendar,
  Clock,
  Volume2,
  VolumeX,
  Palette,
  Languages,
  Mail,
  Smartphone,
  Shield,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function UserPreferences() {
  const { preferences, updatePreferences, darkMode, toggleDarkMode } = useUserStore();

  const handleViewChange = (view: 'list' | 'kanban' | 'calendar') => {
    updatePreferences({ defaultView: view });
    toast.success('Default view updated');
  };

  const handleNotificationToggle = () => {
    updatePreferences({ enableNotifications: !preferences.enableNotifications });
    toast.success(`Notifications ${preferences.enableNotifications ? 'disabled' : 'enabled'}`);
  };

  const handleSoundToggle = () => {
    updatePreferences({ enableSounds: !preferences.enableSounds });
    toast.success(`Sound effects ${preferences.enableSounds ? 'disabled' : 'enabled'}`);
  };

  const handleLanguageChange = (language: string) => {
    updatePreferences({ language });
    toast.success(`Language changed to ${language}`);
  };

  const handleTimeFormatChange = (format: '12h' | '24h') => {
    updatePreferences({ timeFormat: format });
    toast.success(`Time format updated to ${format}`);
  };

  const handleDateFormatChange = (format: string) => {
    updatePreferences({ dateFormat: format });
    toast.success('Date format updated');
  };

  const handleColorThemeChange = (theme: string) => {
    updatePreferences({ colorTheme: theme });
    toast.success('Color theme updated');
  };

  return (
    <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold dark:text-white flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          Settings
        </h2>
        <Button onClick={() => toast.success('Settings saved!')} variant="primary">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Appearance */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium dark:text-white flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Appearance
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-2">Theme</label>
            <div className="flex space-x-2">
              <Button
                variant={darkMode ? 'outline' : 'primary'}
                onClick={toggleDarkMode}
                className="flex-1"
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
              </Button>
              <Button
                variant={darkMode ? 'primary' : 'outline'}
                onClick={toggleDarkMode}
                className="flex-1"
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-2">Color Theme</label>
            <select
              value={preferences.colorTheme}
              onChange={(e) => handleColorThemeChange(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="red">Red</option>
            </select>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium dark:text-white flex items-center">
          <Layout className="w-5 h-5 mr-2" />
          Layout
        </h3>
        <div>
          <label className="block text-sm font-medium dark:text-gray-300 mb-2">Default View</label>
          <div className="flex space-x-2">
            <Button
              variant={preferences.defaultView === 'list' ? 'primary' : 'outline'}
              onClick={() => handleViewChange('list')}
              className="flex-1"
            >
              List
            </Button>
            <Button
              variant={preferences.defaultView === 'kanban' ? 'primary' : 'outline'}
              onClick={() => handleViewChange('kanban')}
              className="flex-1"
            >
              Kanban
            </Button>
            <Button
              variant={preferences.defaultView === 'calendar' ? 'primary' : 'outline'}
              onClick={() => handleViewChange('calendar')}
              className="flex-1"
            >
              Calendar
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium dark:text-white flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">Push Notifications</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive task reminders and updates</p>
            </div>
            <Button
              variant={preferences.enableNotifications ? 'primary' : 'outline'}
              onClick={handleNotificationToggle}
            >
              {preferences.enableNotifications ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">Sound Effects</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Play sounds for notifications</p>
            </div>
            <Button
              variant={preferences.enableSounds ? 'primary' : 'outline'}
              onClick={handleSoundToggle}
            >
              {preferences.enableSounds ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-2">Email Notifications</label>
            <select
              value={preferences.emailNotifications}
              onChange={(e) => updatePreferences({ emailNotifications: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="none">None</option>
              <option value="important">Important Only</option>
              <option value="all">All Updates</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Summary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium dark:text-white flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Date & Time
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-2">Time Format</label>
            <div className="flex space-x-2">
              <Button
                variant={preferences.timeFormat === '12h' ? 'primary' : 'outline'}
                onClick={() => handleTimeFormatChange('12h')}
                className="flex-1"
              >
                12-hour
              </Button>
              <Button
                variant={preferences.timeFormat === '24h' ? 'primary' : 'outline'}
                onClick={() => handleTimeFormatChange('24h')}
                className="flex-1"
              >
                24-hour
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-2">Date Format</label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => handleDateFormatChange(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium dark:text-white flex items-center">
          <Languages className="w-5 h-5 mr-2" />
          Language
        </h3>
        <select
          value={preferences.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="it">Italiano</option>
          <option value="pt">Português</option>
          <option value="ru">Русский</option>
          <option value="ja">日本語</option>
          <option value="zh">中文</option>
        </select>
      </div>

      {/* Privacy & Security */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium dark:text-white flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Privacy & Security
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">Task Encryption</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enable end-to-end encryption for sensitive tasks</p>
            </div>
            <Button
              variant={preferences.enableEncryption ? 'primary' : 'outline'}
              onClick={() => updatePreferences({ enableEncryption: !preferences.enableEncryption })}
            >
              {preferences.enableEncryption ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300">Activity Tracking</label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track task completion and productivity metrics</p>
            </div>
            <Button
              variant={preferences.enableTracking ? 'primary' : 'outline'}
              onClick={() => updatePreferences({ enableTracking: !preferences.enableTracking })}
            >
              {preferences.enableTracking ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}