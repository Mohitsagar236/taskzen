import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  category: 'productivity' | 'wellness' | 'integration' | 'utility';
  features: string[];
  premium: boolean;
}

interface PluginStore {
  plugins: Plugin[];
  enabledPlugins: string[];
  togglePlugin: (id: string) => void;
  isPluginEnabled: (id: string) => boolean;
}

const defaultPlugins: Plugin[] = [
  {
    id: 'time-tracking',
    name: 'Time Tracking',
    description: 'Track time spent on tasks with Pomodoro technique support',
    icon: '⏱️',
    enabled: true,
    category: 'productivity',
    features: ['Pomodoro timer', 'Time reports', 'Task time estimates'],
    premium: false,
  },
  {
    id: 'daily-affirmation',
    name: 'Daily Affirmation',
    description: 'Start your day with positive affirmations and motivation',
    icon: '🌟',
    enabled: false,
    category: 'wellness',
    features: ['Daily quotes', 'Custom affirmations', 'Mood tracking'],
    premium: false,
  },
  {
    id: 'weather-planner',
    name: 'Weather + Task Planning',
    description: 'Plan your tasks based on weather conditions',
    icon: '🌤️',
    enabled: false,
    category: 'integration',
    features: ['Weather forecast', 'Smart task scheduling', 'Weather alerts'],
    premium: true,
  },
  {
    id: 'habit-journal',
    name: 'Habit & Mood Journal',
    description: 'Track your habits and daily mood',
    icon: '📔',
    enabled: false,
    category: 'wellness',
    features: ['Habit tracking', 'Mood logging', 'Progress insights'],
    premium: true,
  },
];

export const usePluginStore = create<PluginStore>()(
  persist(
    (set, get) => ({
      plugins: defaultPlugins,
      enabledPlugins: defaultPlugins.filter(p => p.enabled).map(p => p.id),

      togglePlugin: (id: string) => {
        set(state => {
          const plugin = state.plugins.find(p => p.id === id);
          if (!plugin) return state;

          return {
            plugins: state.plugins.map(p =>
              p.id === id ? { ...p, enabled: !p.enabled } : p
            ),
            enabledPlugins: plugin.enabled
              ? state.enabledPlugins.filter(pid => pid !== id)
              : [...state.enabledPlugins, id],
          };
        });
      },

      isPluginEnabled: (id: string) => {
        return get().enabledPlugins.includes(id);
      },
    }),
    {
      name: 'plugin-store',
    }
  )
);