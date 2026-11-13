import React, { useState, useEffect, useMemo } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import {
  CheckSquare,
  Calendar,
  FileText,
  BarChart3,
  Settings as SettingsIcon,
  Plus,
  Flame,
  Sun,
  Moon,
  Sparkles,
  RotateCcw,
  List,
  Clock,
  Quote,
  Repeat,
  Grid,
  Target,
  BookOpen,
  Award,
  FileSpreadsheet,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Search,
  Wand2,
  Bookmark,
  Smile,
  BatteryCharging,
  HelpCircle,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Cloud,
  X,
} from 'lucide-react';
import { NavSection, useDayForgeStore } from './store/useDayForgeStore';
import { useUIPreferencesStore } from './store/useUIPreferencesStore';
import { Task, Priority } from './types';
import {
  computeDayScore,
  computeStreaksAndSummary,
} from './lib/analyticsEngine';
import { getMotivationalLineForDate } from './lib/phase3Engine';
import { expandTasksForDate } from './lib/recurrenceEngine';
import {
  isHabitCompletedOnDate,
  isHabitRestDayOnDate,
  isHabitScheduledOnDate,
} from './lib/habitEngine';
import { ActiveFocusBar } from './features/timer/ActiveFocusBar';
import { TaskListView } from './features/tasks/TaskListView';
import { HourlyTimelineView } from './features/tasks/HourlyTimelineView';
import { TaskDetailModal } from './features/tasks/TaskDetailModal';
import { NotesPanel } from './features/notes/NotesPanel';
import { AnalyticsDashboard } from './features/analytics/AnalyticsDashboard';
import {
  SettingsPanel,
  DeepThinkingPlannerModal,
} from './features/calendar/CalendarAndSettingsViews';
import { CalendarPage } from './features/calendar/CalendarPage';
import {
  SmartLoadHeaderBadge,
  ReplanDayModal,
  UndoToastBanner,
} from './features/tasks/SmartPlanningModals';
import {
  HabitsWorkspaceView,
  TodayHabitsCard,
} from './features/habits/HabitsSection';
import {
  usePWAAndReminders,
  PWAInstallButton,
  NotificationCenterBell,
  FloatingAlertsAndBanners,
} from './components/ui/PWAInstallAndNotifications';
import { EisenhowerMatrixPage } from './features/tasks/EisenhowerMatrixPage';
import { AllTasksWorkspacePage } from './features/tasks/AllTasksWorkspacePage';
import {
  DailyWrapUpModal,
  ReviewsWorkspacePage,
} from './features/reviews/ReviewsAndWrapUpSection';
import { GoalsAndTemplatesPage } from './features/goals/GoalsAndTemplatesPage';
import {
  AchievementsWorkspacePage,
  ReportsAndExportPage,
} from './features/achievements/MoodAchievementsAndReports';
import {
  CommandPaletteModal,
  ShortcutsCheatSheetModal,
  useGlobalKeyboardShortcuts,
} from './components/ui/CommandPaletteAndShortcuts';
import { WhereIsEverythingPage } from './features/help/WhereIsEverythingPage';

type TodayExtraChipId =
  | 'habits'
  | 'mood'
  | 'goal'
  | 'focus'
  | 'quote'
  | 'unfinished';

export function App() {
  const tasks = useDayForgeStore((s) => s.tasks);
  const timeLogs = useDayForgeStore((s) => s.timeLogs);
  const habits = useDayForgeStore((s) => s.habits);
  const habitChecks = useDayForgeStore((s) => s.habitChecks);
  const moodLogs = useDayForgeStore((s) => s.moodLogs);
  const dayReviews = useDayForgeStore((s) => s.dayReviews);
  const savedViews = useDayForgeStore((s) => s.savedViews);
  const categories = useDayForgeStore((s) => s.categories);
  const settings = useDayForgeStore((s) => s.settings);
  const selectedDate = useDayForgeStore((s) => s.selectedDate);
  const activeNav = useDayForgeStore((s) => s.activeNav);
  const todaySubView = useDayForgeStore((s) => s.centerViewMode);
  const isDemoData = useMemo(() => tasks.some((t) => t.isDemo), [tasks]);
  const isSidebarCollapsed = useDayForgeStore((s) => s.isSidebarCollapsed);
  const isRightPaneOpen = useDayForgeStore((s) => s.isRightPaneOpen);

  const setSelectedDate = useDayForgeStore((s) => s.setSelectedDate);
  const setActiveNav = useDayForgeStore((s) => s.setActiveNav);
  const setTodaySubView = useDayForgeStore((s) => s.setCenterViewMode);
  const toggleSidebar = useDayForgeStore((s) => s.toggleSidebar);
  const toggleRightPane = useDayForgeStore((s) => s.toggleRightPane);
  const setActiveSavedViewId = useDayForgeStore((s) => s.setActiveSavedViewId);
  const addTask = useDayForgeStore((s) => s.addTask);
  const carryForwardTasks = useDayForgeStore((s) => s.carryForwardTasks);
  const setDailyGoal = useDayForgeStore((s) => s.setDailyGoal);
  const logMoodAndEnergy = useDayForgeStore((s) => s.logMoodAndEnergy);
  const updateSettings = useDayForgeStore((s) => s.updateSettings);
  const clearDemoData = useDayForgeStore((s) => s.clearDemoData);
  const getOrCreateTaskNote = useDayForgeStore((s) => s.getOrCreateTaskNote);
  const setActiveNoteId = useDayForgeStore((s) => s.setActiveNoteId);
  const setWrapUpModalOpen = useDayForgeStore((s) => s.setWrapUpModalOpen);
  const setReplanModalOpen = useDayForgeStore((s) => s.setReplanModalOpen);
  const setCommandPaletteOpen = useDayForgeStore((s) => s.setCommandPaletteOpen);

  // UI Preferences (Phase 4.0)
  const pinnedNavItems = useUIPreferencesStore((s) => s.pinnedNavItems);
  const moreNavExpanded = useUIPreferencesStore((s) => s.moreNavExpanded);
  const setMoreNavExpanded = useUIPreferencesStore((s) => s.setMoreNavExpanded);
  const categoriesExpanded = useUIPreferencesStore((s) => s.categoriesExpanded);
  const setCategoriesExpanded = useUIPreferencesStore((s) => s.setCategoriesExpanded);
  const pinnedViewsExpanded = useUIPreferencesStore((s) => s.pinnedViewsExpanded);
  const setPinnedViewsExpanded = useUIPreferencesStore((s) => s.setPinnedViewsExpanded);
  const dismissedDemoBanner = useUIPreferencesStore((s) => s.dismissedDemoBanner);
  const setDismissedDemoBanner = useUIPreferencesStore((s) => s.setDismissedDemoBanner);
  const showTodaysExtras = useUIPreferencesStore((s) => s.showTodaysExtras);
  const reduceMotion = useUIPreferencesStore((s) => s.reduceMotion);
  const setActiveSettingsSection = useUIPreferencesStore((s) => s.setActiveSettingsSection);

  // Start background reminder scheduler & PWA install manager
  const pwaState = usePWAAndReminders();

  // Modal states
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>(undefined);
  const [modalInitialStartTime, setModalInitialStartTime] = useState<string | undefined>(undefined);
  const [modalInitialImportant, setModalInitialImportant] = useState<boolean | undefined>(undefined);
  const [modalInitialUrgent, setModalInitialUrgent] = useState<boolean | undefined>(undefined);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Today's menus & popovers
  const [showTodayMoreMenu, setShowTodayMoreMenu] = useState(false);
  const [activeExtraChip, setActiveExtraChip] = useState<TodayExtraChipId | null>(null);
  const [showSyncPopover, setShowSyncPopover] = useState(false);
  const [showMobileMoreSheet, setShowMobileMoreSheet] = useState(false);
  const [showMobileNotesDrawer, setShowMobileNotesDrawer] = useState(false);
  const [showQuickAddPopover, setShowQuickAddPopover] = useState(false);

  // Global keyboard shortcuts
  useGlobalKeyboardShortcuts(() => {
    setEditingTaskId(null);
    setModalInitialDate(selectedDate);
    setModalInitialStartTime(undefined);
    setModalInitialImportant(undefined);
    setModalInitialUrgent(undefined);
    setIsTaskModalOpen(true);
  });

  // Quick-add task state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState('Work');
  const [quickPriority, setQuickPriority] = useState<Priority>('Med');
  const [quickStart, setQuickStart] = useState('09:00');
  const [quickDuration, setQuickDuration] = useState(45);

  // Sync dark mode and motion preferences on root document
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (reduceMotion) {
      root.classList.add('motion-reduce');
    } else {
      root.classList.remove('motion-reduce');
    }
  }, [settings.theme, reduceMotion]);

  // Computed metrics for Today & Sidebar
  const todayTasksExpanded = useMemo(
    () => expandTasksForDate(tasks, selectedDate),
    [tasks, selectedDate]
  );

  const todayScore = useMemo(
    () => computeDayScore(selectedDate, tasks, timeLogs, settings, 'All', selectedDate),
    [selectedDate, tasks, timeLogs, settings]
  );

  const streaksSummary = useMemo(
    () => computeStreaksAndSummary(selectedDate, tasks, timeLogs, settings),
    [selectedDate, tasks, timeLogs, settings]
  );

  const weeklyFocusMins = useMemo(
    () =>
      streaksSummary.dayBreakdowns
        .slice(-7)
        .reduce((acc, d) => acc + d.actualMinutes, 0),
    [streaksSummary.dayBreakdowns]
  );

  const habitsProgressToday = useMemo(() => {
    const activeHabits = habits.filter(
      (h) => !h.archived && isHabitScheduledOnDate(h, selectedDate)
    );
    let completedCount = 0;
    let dueCount = 0;
    for (const h of activeHabits) {
      const done = isHabitCompletedOnDate(h, selectedDate, habitChecks);
      const rest = isHabitRestDayOnDate(h, selectedDate, habitChecks, settings.workingDays);
      if (done) {
        completedCount += 1;
        dueCount += 1;
      } else if (!rest) {
        dueCount += 1;
      }
    }
    return { completedCount, dueCount };
  }, [habits, habitChecks, selectedDate, settings.workingDays]);

  // Yesterday's unfinished tasks for Carry-Forward
  const yesterdayStr = useMemo(
    () => format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'),
    [selectedDate]
  );

  const yesterdayUnfinished = useMemo(
    () =>
      expandTasksForDate(tasks, yesterdayStr).filter(
        (t) => t.status === 'To Do' || t.status === 'In Progress'
      ),
    [tasks, yesterdayStr]
  );

  const currentReview = useMemo(
    () => dayReviews.find((r) => r.date === selectedDate),
    [dayReviews, selectedDate]
  );

  const currentMoodLog = useMemo(
    () => moodLogs.find((m) => m.date === selectedDate),
    [moodLogs, selectedDate]
  );

  const pinnedSavedViews = useMemo(
    () => savedViews.filter((sv) => sv.pinnedToSidebar),
    [savedViews]
  );

  const dailyQuote = useMemo(
    () => getMotivationalLineForDate(selectedDate),
    [selectedDate]
  );

  const greetingText = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    const [sh, sm] = quickStart.split(':').map(Number);
    const endTotal = Math.min(23 * 60 + 59, sh * 60 + sm + quickDuration);
    const eh = Math.floor(endTotal / 60);
    const em = endTotal % 60;
    const end = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

    addTask({
      title: quickTitle.trim(),
      description: '',
      category: quickCategory,
      tags: ['quick-add'],
      priority: quickPriority,
      important: quickPriority === 'High',
      urgent: false,
      date: selectedDate,
      start: quickStart,
      end,
      estimatedMinutes: quickDuration,
      status: 'To Do',
      fixedTime: false,
      recurrence: 'none',
      subtasks: [],
      reminders: [settings.defaultReminderMinutes ?? 10],
    });
    setQuickTitle('');
    setShowQuickAddPopover(false);
  };

  const handleOpenNoteForTask = (task: Task) => {
    const note = getOrCreateTaskNote(task.id);
    setActiveNoteId(note.id);
    if (window.innerWidth < 1280) {
      setShowMobileNotesDrawer(true);
    } else if (!isRightPaneOpen) {
      toggleRightPane();
    }
  };

  const openNewTaskModalWithDefaults = (opts?: {
    date?: string;
    startTime?: string;
    important?: boolean;
    urgent?: boolean;
  }) => {
    setEditingTaskId(null);
    setModalInitialDate(opts?.date || selectedDate);
    setModalInitialStartTime(opts?.startTime);
    setModalInitialImportant(opts?.important);
    setModalInitialUrgent(opts?.urgent);
    setIsTaskModalOpen(true);
  };

  const ALL_NAV_ITEMS: { id: NavSection; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'today', label: 'Today', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: List },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'habits', label: 'Habits', icon: Repeat },
    { id: 'goals', label: 'Goals & Templates', icon: Target },
    { id: 'matrix', label: 'Eisenhower Matrix', icon: Grid },
    { id: 'reviews', label: 'Reviews', icon: BookOpen },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'reports', label: 'Reports & CSV', icon: FileSpreadsheet },
  ];

  const mainSidebarItems = ALL_NAV_ITEMS.filter((item) =>
    pinnedNavItems.includes(item.id)
  );
  const moreSidebarItems = ALL_NAV_ITEMS.filter(
    (item) => !pinnedNavItems.includes(item.id)
  );

  // Summary line metrics for Today
  const plannedHours = Number((todayScore.plannedMinutes / 60).toFixed(1));
  const actualHours = Number((todayScore.actualMinutes / 60).toFixed(1));
  const remainingMinutes = Math.max(0, todayScore.plannedMinutes - todayScore.actualMinutes);
  const remainingHours = Number((remainingMinutes / 60).toFixed(1));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Slim ~40px Floating Live Timer Bar (shown only when a timer runs) */}
      <ActiveFocusBar />

      {/* Single-Line Dismissible Demo Data Banner */}
      {isDemoData && !dismissedDemoBanner && (
        <div
          className="bg-blue-50/90 dark:bg-blue-950/50 border-b border-blue-200/70 dark:border-blue-900/60 px-4 py-1.5 flex items-center justify-between gap-3 text-xs"
          data-testid="demo-data-banner"
        >
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 truncate">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">
              <strong>Demo Data Active</strong> — Exploring 3 weeks of realistic sample tasks, habits &amp; logs.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={clearDemoData}
              className="font-semibold text-blue-700 dark:text-blue-300 hover:underline cursor-pointer"
            >
              Clear demo data
            </button>
            <button
              type="button"
              onClick={() => setDismissedDemoBanner(true)}
              aria-label="Dismiss demo data banner"
              className="p-0.5 rounded hover:bg-blue-200/50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Layout Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR (Desktop: 5 Main Pinned Items + Collapsible "More" + Collapsible Categories + Footer) */}
        <aside
          className={`hidden md:flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-3 shrink-0 transition-all ${
            isSidebarCollapsed ? 'w-16' : 'w-60'
          }`}
          data-testid="desktop-sidebar"
        >
          <div className="space-y-4 overflow-y-auto pr-0.5">
            {/* Brand Logo + Collapse Rail Toggle */}
            <div className="flex items-center justify-between px-1.5 py-1">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                {!isSidebarCollapsed && (
                  <div className="truncate">
                    <div className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                      DayForge
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Own Your Time
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar to icon rail'}
                title="Toggle Sidebar ([)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Primary 5 Pinned Navigation Items */}
            <nav className="space-y-1" aria-label="Primary navigation">
              {mainSidebarItems.map((item) => {
                const Icon = item.icon;
                const active = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveNav(item.id)}
                    title={item.label}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}

              {/* Collapsible "More" Group */}
              {moreSidebarItems.length > 0 && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setMoreNavExpanded(!moreNavExpanded)}
                    data-testid="sidebar-more-toggle"
                    title="More pages"
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      moreSidebarItems.some((i) => i.id === activeNav)
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <MoreHorizontal className="w-4 h-4 shrink-0" />
                      {!isSidebarCollapsed && <span>More</span>}
                    </span>
                    {!isSidebarCollapsed &&
                      (moreNavExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      ))}
                  </button>

                  {moreNavExpanded && (
                    <div className="mt-1 space-y-0.5 pl-2 border-l border-slate-100 dark:border-slate-800 ml-3">
                      {moreSidebarItems.map((item) => {
                        const Icon = item.icon;
                        const active = activeNav === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveNav(item.id)}
                            title={item.label}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              active
                                ? 'bg-blue-600 text-white font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            {!isSidebarCollapsed && (
                              <span className="truncate">{item.label}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Collapsible Pinned Saved Views */}
            {!isSidebarCollapsed && pinnedSavedViews.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPinnedViewsExpanded(!pinnedViewsExpanded)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span>Pinned Views</span>
                  {pinnedViewsExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
                {pinnedViewsExpanded && (
                  <div className="mt-1 space-y-0.5">
                    {pinnedSavedViews.map((sv) => (
                      <button
                        key={sv.id}
                        type="button"
                        onClick={() => {
                          setActiveSavedViewId(sv.id);
                          setActiveNav('tasks');
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Bookmark className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">{sv.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Collapsible Categories List */}
            {!isSidebarCollapsed && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span>Categories ({categories.length})</span>
                  {categoriesExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
                {categoriesExpanded && (
                  <div className="mt-1 space-y-1 px-2">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center gap-2 py-1 text-xs text-slate-600 dark:text-slate-400"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="truncate">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Pinned Footer: Where is everything? + Settings + One-line Score & Streak */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <button
              type="button"
              onClick={() => setActiveNav('help')}
              data-testid="sidebar-help-btn"
              title="Where is everything? (Feature Map)"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeNav === 'help'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Where is everything?</span>}
            </button>

            <button
              type="button"
              onClick={() => setActiveNav('settings')}
              data-testid="sidebar-settings-btn"
              title="Settings"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeNav === 'settings'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <SettingsIcon className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Settings</span>}
            </button>

            {/* One-Line Score & Streak Footer */}
            {!isSidebarCollapsed ? (
              <button
                type="button"
                onClick={() => setActiveNav('analytics')}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-blue-400 transition-colors cursor-pointer"
              >
                <span>
                  Score{' '}
                  <strong className="font-mono text-slate-900 dark:text-white">
                    {todayScore.productivityScore ?? '—'}
                  </strong>
                  /100
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-amber-600 dark:text-amber-400 font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {streaksSummary.currentStreak}d
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveNav('analytics')}
                title={`Score ${todayScore.productivityScore ?? 0}/100 · Streak ${streaksSummary.currentStreak}d`}
                className="w-full py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-mono font-bold text-center text-amber-600 dark:text-amber-400 cursor-pointer"
              >
                🔥{streaksSummary.currentStreak}
              </button>
            )}
          </div>
        </aside>

        {/* CENTER CONTENT WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-20 md:pb-6">
          {/* Calm Top Bar */}
          <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
            {/* Left: Date Selector */}
            <div className="flex items-center gap-2.5 min-w-0">
              <input
                type="date"
                aria-label="Selected planner date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-mono font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
              />
              {selectedDate !== format(new Date(), 'yyyy-MM-dd') && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 cursor-pointer"
                >
                  Today
                </button>
              )}
            </div>

            {/* Right-Hand Cluster: Quick Add (+), Search / Ctrl+K, Notifications, Sync Status, Dark Mode, Notes Toggle, Account Avatar */}
            <div className="flex items-center gap-1.5">
              {/* Quick Add (+) Button (on mobile, bottom bar has center + button) */}
              <button
                type="button"
                onClick={() => openNewTaskModalWithDefaults({ date: selectedDate })}
                data-testid="topbar-new-task-btn"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>

              {/* Global Search / Command Palette (Ctrl+K) */}
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                aria-label="Open Command Palette (Ctrl+K)"
                title="Search & Commands (Ctrl+K)"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200/70 text-slate-600 dark:text-slate-300 text-xs font-medium cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <kbd className="hidden lg:inline text-[10px] font-mono text-slate-400">
                  ⌘K
                </kbd>
              </button>

              {/* Notification Bell */}
              <NotificationCenterBell />

              {/* Reserved Sync Status Slot (Local-only in 4.0, Cloud Sync in 4A) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSyncPopover((v) => !v)}
                  data-testid="sync-status-chip"
                  title="Storage & Cloud Sync Status"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200/70 text-slate-600 dark:text-slate-300 text-xs font-medium cursor-pointer"
                >
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden xl:inline text-[11px]">Local</span>
                </button>

                {showSyncPopover && (
                  <div className="absolute right-0 mt-2 z-40 w-72 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        Local-Only Mode Active
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                        Saved on device
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      All data is stored safely in this browser. Cloud account &amp; multi-device sync will plug into this slot in Phase 4A.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSyncPopover(false);
                        setActiveSettingsSection('account');
                        setActiveNav('settings');
                      }}
                      className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                    >
                      Account &amp; Backup Settings →
                    </button>
                  </div>
                )}
              </div>

              {/* PWA Install Button (when installable) */}
              {pwaState.isInstallable && (
                <PWAInstallButton
                  compact
                  isInstalled={pwaState.isInstalled}
                  onTriggerInstall={pwaState.triggerInstallPrompt}
                />
              )}

              {/* Dark / Light Mode Toggle */}
              <button
                type="button"
                aria-label="Toggle dark mode"
                onClick={() =>
                  updateSettings({
                    theme: settings.theme === 'dark' ? 'light' : 'dark',
                  })
                }
                title="Switch Light / Dark Mode"
                className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                {settings.theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                )}
              </button>

              {/* Right Notes Pane Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (window.innerWidth < 1280) {
                    setShowMobileNotesDrawer((v) => !v);
                  } else {
                    toggleRightPane();
                  }
                }}
                aria-label={isRightPaneOpen ? 'Collapse notes pane' : 'Expand notes pane'}
                title="Toggle Notes Pane (])"
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isRightPaneOpen || showMobileNotesDrawer
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                    : 'bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
                }`}
              >
                {isRightPaneOpen ? (
                  <PanelRightClose className="w-3.5 h-3.5" />
                ) : (
                  <PanelRightOpen className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Account Avatar Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveSettingsSection('account');
                  setActiveNav('settings');
                }}
                aria-label="Account and profile settings"
                title={`${settings.name || 'User'} · Local Mode`}
                className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer shrink-0"
              >
                {(settings.name || 'U').slice(0, 1).toUpperCase()}
              </button>
            </div>
          </header>

          {/* Main Workspace Grid (Center View + Right Notes Pane on Today/Tasks) */}
          <div className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
            {activeNav === 'today' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left/Main Column: Calm Today Plan */}
                <div
                  className={`${
                    isRightPaneOpen ? 'xl:col-span-8' : 'xl:col-span-12'
                  } space-y-5`}
                >
                  {/* ABOVE THE FOLD: Greeting + Date, ONE Summary Line, List/Timeline Switch, and Slim Quick-Add */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
                    {/* Top Row: Greeting & Date + List/Timeline Switch + More Actions Menu */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                          {greetingText}, {settings.name || 'Builder'}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Segmented List / Timeline Switch */}
                        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                          <button
                            type="button"
                            onClick={() => setTodaySubView('list')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              todaySubView === 'list'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <List className="w-3.5 h-3.5" />
                            List
                          </button>
                          <button
                            type="button"
                            onClick={() => setTodaySubView('timeline')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              todaySubView === 'timeline'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            Timeline
                          </button>
                        </div>

                        {/* Secondary Actions "..." Menu (Wrap up day, Replan my day, AI Schedule Architect) */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowTodayMoreMenu((v) => !v)}
                            data-testid="today-more-actions-btn"
                            aria-label="More actions for today"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                            <span className="hidden sm:inline">Actions</span>
                          </button>

                          {showTodayMoreMenu && (
                            <div className="absolute right-0 mt-2 z-30 w-60 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-1 text-xs">
                              <button
                                type="button"
                                data-testid="wrap-up-day-btn"
                                onClick={() => {
                                  setShowTodayMoreMenu(false);
                                  setWrapUpModalOpen(true);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                                  Wrap up day ritual
                                </span>
                                <kbd className="text-[10px] font-mono text-slate-400">W</kbd>
                              </button>

                              <button
                                type="button"
                                data-testid="smart-replan-btn"
                                onClick={() => {
                                  setShowTodayMoreMenu(false);
                                  setReplanModalOpen(true);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                                  Replan my day
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setShowTodayMoreMenu(false);
                                  setIsAIModalOpen(true);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                  AI Schedule Architect
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ONE Summary Line: Progress Ring + "X of Y done · Zh planned · Wh left" + Load Warning Badge */}
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800"
                      data-testid="today-summary-line"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Mini Progress Ring */}
                        <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
                          <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                            <circle
                              cx="18"
                              cy="18"
                              r="14"
                              fill="none"
                              className="stroke-slate-200 dark:stroke-slate-700"
                              strokeWidth="3.5"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="14"
                              fill="none"
                              className="stroke-blue-600 dark:stroke-blue-400 transition-all duration-500"
                              strokeWidth="3.5"
                              strokeDasharray={`${Math.round((todayScore.completionRate / 100) * 88)} 88`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute text-[9px] font-mono font-bold text-slate-700 dark:text-slate-200">
                            {Math.round(todayScore.completionRate)}%
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 dark:text-slate-200 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span>
                            <strong className="font-mono">{todayScore.completedCount}</strong> of{' '}
                            <strong className="font-mono">{todayScore.plannedCount}</strong> done
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <span>
                            <strong className="font-mono">{plannedHours}h</strong> planned
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <span>
                            <strong className="font-mono">{actualHours}h</strong> focused ({remainingHours}h left)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <SmartLoadHeaderBadge dateStr={selectedDate} compact />
                      </div>
                    </div>

                    {/* Slim Quick-Add Input ("Add a task... press N or Q") */}
                    <form onSubmit={handleQuickAddSubmit} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Plus className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            data-testid="quick-add-task-input"
                            value={quickTitle}
                            onFocus={() => setShowQuickAddPopover(true)}
                            onChange={(e) => setQuickTitle(e.target.value)}
                            placeholder="Add a task for today... (Press Q to focus or N for full form)"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                        >
                          Add
                        </button>
                      </div>

                      {/* Optional inline quick options shown when typing or focused */}
                      {(showQuickAddPopover || quickTitle.trim().length > 0) && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <select
                              aria-label="Quick task category"
                              value={quickCategory}
                              onChange={(e) => setQuickCategory(e.target.value)}
                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                            >
                              {categories.map((c) => (
                                <option key={c.id} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>

                            <select
                              aria-label="Quick task priority"
                              value={quickPriority}
                              onChange={(e) => setQuickPriority(e.target.value as Priority)}
                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                            >
                              <option value="High">High Priority</option>
                              <option value="Med">Med</option>
                              <option value="Low">Low</option>
                            </select>

                            <input
                              type="time"
                              aria-label="Quick task start time"
                              value={quickStart}
                              onChange={(e) => setQuickStart(e.target.value)}
                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-200"
                            />

                            <select
                              aria-label="Quick task duration"
                              value={quickDuration}
                              onChange={(e) => setQuickDuration(Number(e.target.value))}
                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-200"
                            >
                              <option value={15}>15m</option>
                              <option value={30}>30m</option>
                              <option value={45}>45m</option>
                              <option value={60}>1h</option>
                              <option value={90}>1.5h</option>
                              <option value={120}>2h</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowQuickAddPopover(false)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            Hide options
                          </button>
                        </div>
                      )}
                    </form>
                  </div>

                  {/* "TODAY'S EXTRAS" COMPACT CHIP ROW (Toggleable in Settings > Appearance) */}
                  {showTodaysExtras && (
                    <div className="space-y-2.5" data-testid="todays-extras-section">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1. Habits X/Y Chip */}
                        <button
                          type="button"
                          data-testid="extra-chip-habits"
                          onClick={() =>
                            setActiveExtraChip((prev) =>
                              prev === 'habits' ? null : 'habits'
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                            activeExtraChip === 'habits'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <Repeat className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            Habits{' '}
                            <strong className="font-mono">
                              {habitsProgressToday.completedCount}/{habitsProgressToday.dueCount}
                            </strong>
                          </span>
                        </button>

                        {/* 2. Mood & Energy Chip */}
                        <button
                          type="button"
                          data-testid="extra-chip-mood"
                          onClick={() =>
                            setActiveExtraChip((prev) =>
                              prev === 'mood' ? null : 'mood'
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                            activeExtraChip === 'mood'
                              ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200'
                              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <Smile className="w-3.5 h-3.5 text-emerald-500" />
                          <span>
                            {currentMoodLog
                              ? `Mood ${currentMoodLog.mood}/5 · Energy ${currentMoodLog.energy}/5`
                              : 'Mood & Energy'}
                          </span>
                        </button>

                        {/* 3. Daily Goal Chip */}
                        <button
                          type="button"
                          data-testid="extra-chip-goal"
                          onClick={() =>
                            setActiveExtraChip((prev) =>
                              prev === 'goal' ? null : 'goal'
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer max-w-xs truncate ${
                            activeExtraChip === 'goal'
                              ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200'
                              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <Target className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">
                            {currentReview?.dailyGoal
                              ? `Goal: ${currentReview.dailyGoal}`
                              : 'Set Daily Goal'}
                          </span>
                        </button>

                        {/* 4. Focus Target Chip */}
                        <button
                          type="button"
                          data-testid="extra-chip-focus"
                          onClick={() =>
                            setActiveExtraChip((prev) =>
                              prev === 'focus' ? null : 'focus'
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                            activeExtraChip === 'focus'
                              ? 'border-teal-500 bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-200'
                              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span>
                            Focus Target{' '}
                            <strong className="font-mono">
                              {Math.min(
                                100,
                                Math.round(
                                  (todayScore.actualMinutes /
                                    Math.max(1, settings.dailyFocusTargetMinutes)) *
                                    100
                                )
                              )}
                              %
                            </strong>
                          </span>
                        </button>

                        {/* 5. Motivation Quote Chip */}
                        <button
                          type="button"
                          data-testid="extra-chip-quote"
                          onClick={() =>
                            setActiveExtraChip((prev) =>
                              prev === 'quote' ? null : 'quote'
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                            activeExtraChip === 'quote'
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200'
                              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <Quote className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Motivation</span>
                        </button>

                        {/* 6. Yesterday Unfinished Carry-Forward Chip (if any) */}
                        {yesterdayUnfinished.length > 0 && (
                          <button
                            type="button"
                            data-testid="extra-chip-unfinished"
                            onClick={() =>
                              setActiveExtraChip((prev) =>
                                prev === 'unfinished' ? null : 'unfinished'
                              )
                            }
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                              activeExtraChip === 'unfinished'
                                ? 'border-amber-500 bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200'
                                : 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                            <span>{yesterdayUnfinished.length} Unfinished from Yesterday</span>
                          </button>
                        )}
                      </div>

                      {/* Expanded Popover Card for whichever "Today's extra" chip is selected */}
                      {activeExtraChip === 'habits' && (
                        <div className="relative">
                          <TodayHabitsCard />
                        </div>
                      )}

                      {activeExtraChip === 'mood' && (
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Smile className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Mood:
                              </span>
                              <div className="flex items-center gap-1">
                                {[
                                  { val: 1 as const, emoji: '😞' },
                                  { val: 2 as const, emoji: '😐' },
                                  { val: 3 as const, emoji: '🙂' },
                                  { val: 4 as const, emoji: '😊' },
                                  { val: 5 as const, emoji: '🤩' },
                                ].map((m) => {
                                  const active =
                                    (currentMoodLog?.mood || currentReview?.mood) === m.val;
                                  return (
                                    <button
                                      key={m.val}
                                      type="button"
                                      aria-label={`Set mood ${m.val}`}
                                      onClick={() =>
                                        logMoodAndEnergy(
                                          selectedDate,
                                          m.val,
                                          currentMoodLog?.energy || currentReview?.energy || 3
                                        )
                                      }
                                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-transform cursor-pointer ${
                                        active
                                          ? 'bg-emerald-100 dark:bg-emerald-950/70 ring-2 ring-emerald-500 scale-105'
                                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100'
                                      }`}
                                    >
                                      {m.emoji}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <BatteryCharging className="w-4 h-4 text-amber-500" />
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Energy:
                              </span>
                              <div className="flex items-center gap-1">
                                {([1, 2, 3, 4, 5] as const).map((en) => {
                                  const active =
                                    (currentMoodLog?.energy || currentReview?.energy) === en;
                                  return (
                                    <button
                                      key={en}
                                      type="button"
                                      aria-label={`Set energy ${en}`}
                                      onClick={() =>
                                        logMoodAndEnergy(
                                          selectedDate,
                                          currentMoodLog?.mood || currentReview?.mood || 4,
                                          en
                                        )
                                      }
                                      className={`px-2 py-1 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                                        active
                                          ? 'bg-amber-500 text-white'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                      }`}
                                    >
                                      {en}⚡
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setActiveExtraChip(null)}
                            className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            Done
                          </button>
                        </div>
                      )}

                      {activeExtraChip === 'goal' && (
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                          <Target className="w-4 h-4 text-blue-600 shrink-0" />
                          <input
                            type="text"
                            aria-label="Daily goal highlight"
                            value={currentReview?.dailyGoal || ''}
                            onChange={(e) => setDailyGoal(selectedDate, e.target.value)}
                            placeholder="Set your #1 non-negotiable outcome for today..."
                            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setActiveExtraChip(null)}
                            className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            Done
                          </button>
                        </div>
                      )}

                      {activeExtraChip === 'focus' && (
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1.5">
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-600 dark:text-slate-400">
                                Daily Focus Target
                              </span>
                              <span className="font-mono font-bold">
                                {todayScore.actualMinutes}m / {settings.dailyFocusTargetMinutes}m
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.round(
                                      (todayScore.actualMinutes /
                                        Math.max(1, settings.dailyFocusTargetMinutes)) *
                                        100
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-600 dark:text-slate-400">
                                Weekly Focus Target
                              </span>
                              <span className="font-mono font-bold">
                                {Math.round(weeklyFocusMins / 60)}h /{' '}
                                {Math.round((settings.weeklyFocusTargetMinutes || 1200) / 60)}h
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-teal-600 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.round(
                                      (weeklyFocusMins /
                                        Math.max(1, settings.weeklyFocusTargetMinutes || 1200)) *
                                        100
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {activeExtraChip === 'quote' && (
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300 italic">
                            <Quote className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                            <span>&ldquo;{dailyQuote}&rdquo;</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveExtraChip(null)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                          >
                            Close
                          </button>
                        </div>
                      )}

                      {activeExtraChip === 'unfinished' && yesterdayUnfinished.length > 0 && (
                        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                              {yesterdayUnfinished.length} Unfinished Task(s) from {yesterdayStr}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                carryForwardTasks(
                                  yesterdayUnfinished.map((t) => t.id),
                                  selectedDate
                                );
                                setActiveExtraChip(null);
                              }}
                              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer"
                            >
                              Move All to Today
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            {yesterdayUnfinished.map((ut) => (
                              <div
                                key={ut.id}
                                className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-amber-200/60 dark:border-slate-800 text-xs"
                              >
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                  {ut.title}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => carryForwardTasks([ut.id], selectedDate)}
                                    className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-medium cursor-pointer"
                                  >
                                    Move to Today
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active Today Sub-View: List vs Hourly Timeline */}
                  {todaySubView === 'list' ? (
                    <TaskListView
                      date={selectedDate}
                      onEditTask={(id) => {
                        setEditingTaskId(id);
                        setIsTaskModalOpen(true);
                      }}
                      onOpenNoteForTask={handleOpenNoteForTask}
                    />
                  ) : (
                    <HourlyTimelineView
                      tasks={todayTasksExpanded}
                      onInspectTask={(task) => {
                        setEditingTaskId(task.id);
                        setIsTaskModalOpen(true);
                      }}
                    />
                  )}
                </div>

                {/* Right Column (Desktop >= 1280px): Side-by-Side Notes Pane */}
                {isRightPaneOpen && (
                  <div className="hidden xl:block xl:col-span-4 h-[680px] sticky top-16">
                    <NotesPanel />
                  </div>
                )}
              </div>
            )}

            {/* Slide-Over Notes Drawer on screens < 1280px when Notes drawer is explicitly opened */}
            {showMobileNotesDrawer && activeNav !== 'notes' && (
              <div
                className="xl:hidden fixed inset-0 z-40 flex justify-end bg-slate-900/40 backdrop-blur-xs"
                onClick={() => setShowMobileNotesDrawer(false)}
              >
                <div
                  className="w-full max-w-md h-full bg-white dark:bg-slate-900 p-3 shadow-2xl flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Side-by-Side Notes Drawer
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMobileNotesDrawer(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 min-h-0">
                    <NotesPanel />
                  </div>
                </div>
              </div>
            )}

            {activeNav === 'matrix' && (
              <EisenhowerMatrixPage
                onInspectTask={(t) => {
                  setEditingTaskId(t.id);
                  setIsTaskModalOpen(true);
                }}
              />
            )}

            {activeNav === 'tasks' && (
              <AllTasksWorkspacePage
                onInspectTask={(t) => {
                  setEditingTaskId(t.id);
                  setIsTaskModalOpen(true);
                }}
                onOpenNewTaskModal={() =>
                  openNewTaskModalWithDefaults({ date: selectedDate })
                }
              />
            )}

            {activeNav === 'calendar' && (
              <CalendarPage
                onInspectTask={(task) => {
                  setEditingTaskId(task.id);
                  setIsTaskModalOpen(true);
                }}
              />
            )}

            {activeNav === 'habits' && <HabitsWorkspaceView />}

            {activeNav === 'goals' && <GoalsAndTemplatesPage />}

            {activeNav === 'notes' && (
              <div className="h-[calc(100vh-140px)] min-h-[540px]">
                <NotesPanel />
              </div>
            )}

            {activeNav === 'reviews' && <ReviewsWorkspacePage />}

            {activeNav === 'analytics' && <AnalyticsDashboard />}

            {activeNav === 'achievements' && <AchievementsWorkspacePage />}

            {activeNav === 'reports' && <ReportsAndExportPage />}

            {activeNav === 'settings' && (
              <SettingsPanel
                isInstalled={pwaState.isInstalled}
                onTriggerInstall={pwaState.triggerInstallPrompt}
                swNote={pwaState.swNote}
                onOpenAIScheduleModal={() => setIsAIModalOpen(true)}
              />
            )}

            {activeNav === 'help' && (
              <WhereIsEverythingPage
                onOpenNewTaskModal={() =>
                  openNewTaskModalWithDefaults({ date: selectedDate })
                }
                onOpenAIScheduleModal={() => setIsAIModalOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR: Today, Calendar, "+" Quick Add, Notes, More */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around"
        aria-label="Mobile navigation"
        data-testid="mobile-bottom-nav"
      >
        <button
          type="button"
          onClick={() => {
            setShowMobileMoreSheet(false);
            setActiveNav('today');
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-semibold cursor-pointer ${
            activeNav === 'today'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Today</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowMobileMoreSheet(false);
            setActiveNav('calendar');
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-semibold cursor-pointer ${
            activeNav === 'calendar'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendar</span>
        </button>

        {/* Center "+" Quick Add Button */}
        <button
          type="button"
          onClick={() => openNewTaskModalWithDefaults({ date: selectedDate })}
          aria-label="Quick add task"
          className="w-10 h-10 -mt-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => {
            setShowMobileMoreSheet(false);
            setActiveNav('notes');
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-semibold cursor-pointer ${
            activeNav === 'notes'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Notes</span>
        </button>

        <button
          type="button"
          data-testid="mobile-more-btn"
          onClick={() => setShowMobileMoreSheet((v) => !v)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-semibold cursor-pointer ${
            showMobileMoreSheet
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <MoreHorizontal className="w-4 h-4" />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile "More" Bottom Sheet */}
      {showMobileMoreSheet && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setShowMobileMoreSheet(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 pb-8 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                All DayForge Workspaces
              </span>
              <button
                type="button"
                onClick={() => setShowMobileMoreSheet(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                ...ALL_NAV_ITEMS,
                { id: 'help' as NavSection, label: 'Where is everything?', icon: HelpCircle },
                { id: 'settings' as NavSection, label: 'Settings', icon: SettingsIcon },
              ].map((item) => {
                const Icon = item.icon;
                const active = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveNav(item.id);
                      setShowMobileMoreSheet(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold text-left border transition-colors ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Task Create / Edit Right-Side Drawer */}
      <TaskDetailModal
        taskId={editingTaskId}
        isOpen={isTaskModalOpen}
        initialDate={modalInitialDate}
        initialStartTime={modalInitialStartTime}
        initialImportant={modalInitialImportant}
        initialUrgent={modalInitialUrgent}
        onClose={() => setIsTaskModalOpen(false)}
        onOpenNoteForTask={handleOpenNoteForTask}
      />

      {/* AI Schedule Architect Modal */}
      <DeepThinkingPlannerModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      {/* Phase 2 & 3 Modals: Daily Wrap-Up Ritual, Smart Replan Preview, Command Palette, Shortcuts Help, Undo Toast & Floating Alerts */}
      <DailyWrapUpModal />
      <ReplanDayModal />
      <CommandPaletteModal
        onOpenNewTaskModal={() => openNewTaskModalWithDefaults({ date: selectedDate })}
      />
      <ShortcutsCheatSheetModal />
      <UndoToastBanner />
      <FloatingAlertsAndBanners
        isOnline={pwaState.isOnline}
        updateAvailable={pwaState.updateAvailable}
        onApplyUpdate={pwaState.applyServiceWorkerUpdate}
      />
    </div>
  );
}

export default App;
