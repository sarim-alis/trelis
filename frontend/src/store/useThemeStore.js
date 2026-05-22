import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((state) => {
        const newIsDark = !state.isDark;
        document.documentElement.classList.toggle('dark', newIsDark);
        return { isDark: newIsDark };
      }),
      setTheme: (isDark) => {
        document.documentElement.classList.toggle('dark', isDark);
        set({ isDark });
      }
    }),
    {
      name: 'theme-storage'
    }
  )
);
