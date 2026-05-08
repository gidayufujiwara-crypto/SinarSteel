import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useUiStore = create()(persist((set) => ({
    sidebarCollapsed: false,
    theme: 'neon',
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}), {
    name: 'sinarsteel-ui',
    partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
    }),
}));
