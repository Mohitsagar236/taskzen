import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { generateId } from '../lib/utils';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isDarkMode: boolean;
  login: (email: string, name: string) => void;
  logout: () => void;
  toggleDarkMode: () => void;
  upgradeAccount: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isDarkMode: false,
      
      login: (email, name) => {
        const user: User = {
          id: generateId(),
          email,
          name,
          isPremium: false,
        };
        
        set({
          user,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },
      
      toggleDarkMode: () => {
        set((state) => ({
          isDarkMode: !state.isDarkMode,
        }));
      },
      
      upgradeAccount: () => {
        set((state) => ({
          user: state.user ? { ...state.user, isPremium: true } : null,
        }));
      },
    }),
    {
      name: 'user-storage',
    }
  )
);