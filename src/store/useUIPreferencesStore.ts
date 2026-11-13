import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { NavSection } from './useDayForgeStore';

export type UIDensity = 'comfortable' | 'compact';
export type SidebarDisplayMode = 'full' | 'icons';
export type AnalyticsTabId =
  | 'overview'
  | 'time'
  | 'tasks'
  | 'habits'
  | 'consistency'
  | 'mood';

export interface UIPreferencesState {
  density: UIDensity;
  sidebarMode: SidebarDisplayMode;
  notesDefaultOpen: boolean;
  showTodaysExtras: boolean;
  reduceMotion: boolean;
  pinnedNavItems: NavSection[];
  moreNavExpanded: boolean;
  categoriesExpanded: boolean;
  pinnedViewsExpanded: boolean;
  dismissedDemoBanner: boolean;
  activeSettingsSection: string;
  analyticsActiveTab: AnalyticsTabId;
  taskDetailOpenSections: Record<string, boolean>;

  setDensity: (density: UIDensity) => void;
  setSidebarMode: (mode: SidebarDisplayMode) => void;
  setNotesDefaultOpen: (open: boolean) => void;
  setShowTodaysExtras: (show: boolean) => void;
  setReduceMotion: (reduce: boolean) => void;
  togglePinnedNavItem: (item: NavSection) => void;
  setMoreNavExpanded: (expanded: boolean) => void;
  setCategoriesExpanded: (expanded: boolean) => void;
  setPinnedViewsExpanded: (expanded: boolean) => void;
  setDismissedDemoBanner: (dismissed: boolean) => void;
  setActiveSettingsSection: (section: string) => void;
  setAnalyticsActiveTab: (tab: AnalyticsTabId) => void;
  toggleTaskDetailSection: (sectionId: string) => void;
}

export const DEFAULT_PINNED_NAV_ITEMS: NavSection[] = [
  'today',
  'calendar',
  'tasks',
  'notes',
  'analytics',
];

export const useUIPreferencesStore = create<UIPreferencesState>()(
  persist(
    (set) => ({
      density: 'comfortable',
      sidebarMode: 'full',
      notesDefaultOpen: true,
      showTodaysExtras: true,
      reduceMotion: false,
      pinnedNavItems: DEFAULT_PINNED_NAV_ITEMS,
      moreNavExpanded: false,
      categoriesExpanded: false,
      pinnedViewsExpanded: false,
      dismissedDemoBanner: false,
      activeSettingsSection: '',
      analyticsActiveTab: 'overview',
      taskDetailOpenSections: {
        subtasks: false,
        notes: true,
      },

      setDensity: (density) => set({ density }),
      setSidebarMode: (sidebarMode) => set({ sidebarMode }),
      setNotesDefaultOpen: (notesDefaultOpen) => set({ notesDefaultOpen }),
      setShowTodaysExtras: (showTodaysExtras) => set({ showTodaysExtras }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      togglePinnedNavItem: (item) =>
        set((state) => {
          const exists = state.pinnedNavItems.includes(item);
          if (exists) {
            // Keep at least 1 pinned item
            if (state.pinnedNavItems.length <= 1) return state;
            return {
              pinnedNavItems: state.pinnedNavItems.filter((i) => i !== item),
            };
          }
          return {
            pinnedNavItems: [...state.pinnedNavItems, item],
          };
        }),
      setMoreNavExpanded: (moreNavExpanded) => set({ moreNavExpanded }),
      setCategoriesExpanded: (categoriesExpanded) => set({ categoriesExpanded }),
      setPinnedViewsExpanded: (pinnedViewsExpanded) =>
        set({ pinnedViewsExpanded }),
      setDismissedDemoBanner: (dismissedDemoBanner) =>
        set({ dismissedDemoBanner }),
      setActiveSettingsSection: (activeSettingsSection) =>
        set({ activeSettingsSection }),
      setAnalyticsActiveTab: (analyticsActiveTab) =>
        set({ analyticsActiveTab }),
      toggleTaskDetailSection: (sectionId) =>
        set((state) => ({
          taskDetailOpenSections: {
            ...state.taskDetailOpenSections,
            [sectionId]: !state.taskDetailOpenSections[sectionId],
          },
        })),
    }),
    {
      name: 'dayforge_ui_prefs_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
