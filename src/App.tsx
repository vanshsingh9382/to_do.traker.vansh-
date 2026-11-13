import React, { useState, useEffect, useMemo, useRef } from 'react';
import { addDays, format, parseISO, subDays } from 'date-fns';
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
  ChevronLeft,
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

  // UI Preferences (Phase 4.0 / 4.1)
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

  // Hidden date picker ref for the compact top-bar date label
  const datePickerRef = useRef<HTMLInputElement | null>(null);

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
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
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

  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const isSelectedDateToday = selectedDate === todayIso;

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
  const focusTargetPct = Math.min(
    100,
    Math.round(
      (todayScore.actualMinutes / Math.max(1, settings.dailyFocusTargetMinutes)) * 100
    )
  );

  // Sync attention indicator (shown on avatar only when offline or sync needs attention)
  const syncNeedsAttention = !pwaState.isOnline;

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Slim ~40px Floating Live Timer Bar (shown only when a timer runs) */}
      <ActiveFocusBar />

      {/* Single-Line Dismissible Demo Data Banner */}
      {isDemoData && !dismissedDemoBanner && (
        <div
          className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 py-1.5 flex items-center justify-between gap-3 text-xs shrink-0"
          data-testid="demo-data-banner"
        >
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 truncate">
            <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              <strong>Sample data active</strong> — Exploring 3 weeks of realistic sample tasks, habits &amp; logs.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={clearDemoData}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Clear demo data
            </button>
            <button
              type="button"
              onClick={() => setDismissedDemoBanner(true)}
              aria-label="Dismiss demo data banner"
              className="p-0.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Layout Shell */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* LEFT SIDEBAR (4.1f: Fixed Header, Scrollable Middle, Fixed Footer) */}
        <aside
          className={`hidden md:flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-3 shrink-0 transition-all ${
            isSidebarCollapsed ? 'w-16' : 'w-60'
          }`}
          data-testid="desktop-sidebar"
        >
          {/* 1. Fixed Sidebar Header */}
          <div className="flex items-center justify-between px-1.5 py-1 shrink-0">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              {!isSidebarCollapsed && (
                <div className="truncate">
                  <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                    DayForge
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar to icon rail'}
              title="Toggle sidebar ([)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* 2. Scrollable Middle Navigation */}
          <div className="flex-1 min-h-0 overflow-y-auto py-3 space-y-3 pr-0.5">
            {/* Primary 5 Pinned Navigation Items */}
            <nav className="space-y-0.5" aria-label="Primary navigation">
              {mainSidebarItems.map((item) => {
                const Icon = item.icon;
                const active = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveNav(item.id)}
                    title={item.label}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-blue-50/90 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border-l-2 border-blue-600 rounded-r-xl'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 rounded-xl'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      moreSidebarItems.some((i) => i.id === activeNav)
                        ? 'text-blue-700 dark:text-blue-300 bg-blue-50/60 dark:bg-blue-950/30 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <MoreHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
                      {!isSidebarCollapsed && <span>More</span>}
                    </span>
                    {!isSidebarCollapsed &&
                      (moreNavExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      ))}
                  </button>

                  {moreNavExpanded && (
                    <div className="mt-0.5 space-y-0.5 pl-2 border-l border-slate-100 dark:border-slate-800 ml-3">
                      {moreSidebarItems.map((item) => {
                        const Icon = item.icon;
                        const active = activeNav === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveNav(item.id)}
                            title={item.label}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                              active
                                ? 'bg-blue-50/90 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border-l-2 border-blue-600 rounded-r-lg'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 rounded-lg'
                            }`}
                          >
                            <Icon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                              }`}
                            />
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

            {/* Collapsible Pinned views (sentence-case heading, collapsed by default) */}
            {!isSidebarCollapsed && pinnedSavedViews.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPinnedViewsExpanded(!pinnedViewsExpanded)}
                  className="w-full flex items-center justify-between px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  <span>Pinned views</span>
                  {pinnedViewsExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
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
                        <Bookmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{sv.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Collapsible Categories (sentence-case heading, collapsed by default) */}
            {!isSidebarCollapsed && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                  className="w-full flex items-center justify-between px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer tabular-nums"
                >
                  <span>Categories ({categories.length})</span>
                  {categoriesExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
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

          {/* 3. Fixed Sidebar Footer: Settings + small "?" icon button + one-line "Score 47 · streak 21d" */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 shrink-0">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveNav('settings')}
                data-testid="sidebar-settings-btn"
                title="Settings"
                className={`flex-1 flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  activeNav === 'settings'
                    ? 'bg-blue-50/90 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border-l-2 border-blue-600 rounded-r-xl'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl'
                }`}
              >
                <SettingsIcon
                  className={`w-4 h-4 shrink-0 ${
                    activeNav === 'settings' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                  }`}
                />
                {!isSidebarCollapsed && <span className="truncate">Settings</span>}
              </button>

              <button
                type="button"
                onClick={() => setActiveNav('help')}
                data-testid="sidebar-help-btn"
                aria-label="Where is everything?"
                title="Where is everything? (Feature guide)"
                className={`p-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                  activeNav === 'help'
                    ? 'bg-blue-50/90 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* One-line Score & Streak */}
            {!isSidebarCollapsed ? (
              <button
                type="button"
                onClick={() => setActiveNav('analytics')}
                className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer tabular-nums flex items-center justify-between"
              >
                <span>
                  Score{' '}
                  <strong className="font-semibold text-slate-800 dark:text-slate-200">
                    {todayScore.productivityScore ?? '—'}
                  </strong>{' '}
                  · streak{' '}
                  <strong className="font-semibold text-slate-800 dark:text-slate-200">
                    {streaksSummary.currentStreak}d
                  </strong>
                </span>
                <Flame className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveNav('analytics')}
                title={`Score ${todayScore.productivityScore ?? 0} · streak ${streaksSummary.currentStreak}d`}
                className="w-full py-1 rounded-lg text-xs tabular-nums font-medium text-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {streaksSummary.currentStreak}d
              </button>
            )}
          </div>
        </aside>

        {/* CENTER CONTENT WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-20 md:pb-6">
          {/* 4.1a Top Bar: [date control] ... [New Task] [Search] [Bell] [Notes toggle] [Avatar] */}
          <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
            {/* Left: Compact Date Control (< Fri, 13 Nov > [Today]) */}
            <div className="flex items-center gap-1 min-w-0">
              <div className="inline-flex items-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-0.5">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))
                  }
                  aria-label="Previous day"
                  title="Previous day"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      const el = datePickerRef.current;
                      if (el) {
                        if (typeof el.showPicker === 'function') {
                          try {
                            el.showPicker();
                          } catch {
                            el.focus();
                          }
                        } else {
                          el.focus();
                          el.click();
                        }
                      }
                    }}
                    data-testid="topbar-date-label"
                    title="Click to pick a date"
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap tabular-nums"
                  >
                    {format(parseISO(selectedDate), 'EEE, d MMM')}
                  </button>
                  <input
                    ref={datePickerRef}
                    type="date"
                    aria-label="Selected planner date"
                    value={selectedDate}
                    onChange={(e) => {
                      if (e.target.value) setSelectedDate(e.target.value);
                    }}
                    className="sr-only"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))
                  }
                  aria-label="Next day"
                  title="Next day"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {!isSelectedDateToday && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayIso)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
                >
                  Today
                </button>
              )}
            </div>

            {/* Right: [New Task] [Search] [Bell] [Notes toggle] [Avatar] */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Primary Solid-Blue Button: New Task (on mobile, shows compact + button) */}
              <button
                type="button"
                onClick={() => openNewTaskModalWithDefaults({ date: selectedDate })}
                data-testid="topbar-new-task-btn"
                aria-label="New task (N)"
                title="New task (N)"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New task</span>
              </button>

              {/* Search (icon-only, shortcut in tooltip) */}
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                aria-label="Search and commands (Ctrl+K)"
                title="Search & commands (Ctrl+K)"
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Notification Bell (hidden on 360px mobile to keep top bar clean; reachable in Avatar menu) */}
              <div className="hidden sm:block">
                <NotificationCenterBell />
              </div>

              {/* PWA Install Button when applicable on desktop */}
              {pwaState.isInstallable && (
                <div className="hidden lg:block">
                  <PWAInstallButton
                    compact
                    isInstalled={pwaState.isInstalled}
                    onTriggerInstall={pwaState.triggerInstallPrompt}
                  />
                </div>
              )}

              {/* Notes Toggle (hidden on 360px mobile; reachable in bottom nav & Avatar menu) */}
              <button
                type="button"
                onClick={() => {
                  if (window.innerWidth < 1280) {
                    setShowMobileNotesDrawer((v) => !v);
                  } else {
                    toggleRightPane();
                  }
                }}
                aria-label={isRightPaneOpen ? 'Hide notes panel' : 'Show notes panel'}
                title="Toggle notes panel (])"
                className={`hidden sm:inline-flex p-2 rounded-xl transition-colors cursor-pointer ${
                  isRightPaneOpen || showMobileNotesDrawer
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {isRightPaneOpen ? (
                  <PanelRightClose className="w-4 h-4" />
                ) : (
                  <PanelRightOpen className="w-4 h-4" />
                )}
              </button>

              {/* Avatar Menu (holds Theme toggle, Sync status "Local", Account settings & mobile quick actions) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAvatarMenu((v) => !v)}
                  data-testid="avatar-menu-btn"
                  aria-label="Account, theme and sync menu"
                  title={`${settings.name || 'User'} · Theme & sync`}
                  className="relative w-7 h-7 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-700 transition-all cursor-pointer shrink-0"
                >
                  {(settings.name || 'U').slice(0, 1).toUpperCase()}
                  {syncNeedsAttention && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900"
                      title="Offline — changes saved on device"
                    />
                  )}
                </button>

                {showAvatarMenu && (
                  <div
                    className="absolute right-0 mt-2 z-40 w-64 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-3"
                    data-testid="avatar-popover-menu"
                  >
                    {/* User & Sync status */}
                    <div className="pb-2.5 border-b border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {settings.name || 'Builder'}
                        </span>
                        <span
                          data-testid="sync-status-chip"
                          className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400"
                        >
                          <Cloud className="w-3.5 h-3.5 text-slate-400" />
                          <span>Local</span>
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">
                        {syncNeedsAttention
                          ? 'Offline — changes saved on this device.'
                          : 'Saved locally on this device.'}
                      </p>
                    </div>

                    {/* Theme selector (Light / Dark / System) */}
                    <div className="space-y-1.5">
                      <div className="text-slate-500 dark:text-slate-400 font-medium">
                        Theme
                      </div>
                      <div className="grid grid-cols-3 gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                        {(['light', 'dark', 'system'] as const).map((mode) => {
                          const active = settings.theme === mode;
                          return (
                            <button
                              key={mode}
                              type="button"
                              aria-label={mode === 'dark' ? 'Toggle dark mode' : `Set ${mode} theme`}
                              onClick={() => updateSettings({ theme: mode })}
                              className={`py-1 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                                active
                                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                              }`}
                            >
                              {mode}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAvatarMenu(false);
                          setShowMobileNotesDrawer(true);
                        }}
                        className="sm:hidden w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        <span>Open notes drawer</span>
                        <PanelRightOpen className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowAvatarMenu(false);
                          setActiveSettingsSection('account');
                          setActiveNav('settings');
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        <span>Account &amp; backup</span>
                        <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowAvatarMenu(false);
                          setActiveNav('help');
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        <span>Where is everything?</span>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Workspace Grid (Center View + Right Notes Pane on Today) */}
          <div className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
            {activeNav === 'today' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left/Main Column: Calm Today Plan */}
                <div
                  className={`${
                    isRightPaneOpen ? 'xl:col-span-8' : 'xl:col-span-12'
                  } space-y-4`}
                >
                  {/* 4.1b GREETING CARD (No boxes inside boxes; spacing + thin dividers) */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
                    {/* Top Row: Greeting (no duplicate date) + List/Timeline Switch + Actions (...) */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                        {greetingText}, {settings.name || 'Builder'}
                      </h1>

                      <div className="flex items-center gap-2">
                        {/* Segmented List / Timeline Switch */}
                        <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                          <button
                            type="button"
                            onClick={() => setTodaySubView('list')}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              todaySubView === 'list'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <List className="w-3.5 h-3.5 text-slate-400" />
                            List
                          </button>
                          <button
                            type="button"
                            onClick={() => setTodaySubView('timeline')}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              todaySubView === 'timeline'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Timeline
                          </button>
                        </div>

                        {/* Secondary Actions "..." Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowTodayMoreMenu((v) => !v)}
                            data-testid="today-more-actions-btn"
                            aria-label="More actions for today"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            <span className="hidden sm:inline">Actions</span>
                          </button>

                          {showTodayMoreMenu && (
                            <div className="absolute right-0 mt-2 z-30 w-56 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-0.5 text-xs">
                              <button
                                type="button"
                                data-testid="wrap-up-day-btn"
                                onClick={() => {
                                  setShowTodayMoreMenu(false);
                                  setWrapUpModalOpen(true);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <Moon className="w-3.5 h-3.5 text-slate-400" />
                                  Wrap up day ritual
                                </span>
                                <span className="text-slate-400 tabular-nums">W</span>
                              </button>

                              <button
                                type="button"
                                data-testid="smart-replan-btn"
                                onClick={() => {
                                  setShowTodayMoreMenu(false);
                                  setReplanModalOpen(true);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <Wand2 className="w-3.5 h-3.5 text-slate-400" />
                                  Replan my day
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setShowTodayMoreMenu(false);
                                  setIsAIModalOpen(true);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                                  AI schedule architect
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Summary Line (no nested box; just spacing + thin divider) */}
                    <div
                      className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300 tabular-nums"
                      data-testid="today-summary-line"
                    >
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Progress Ring */}
                        <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span>
                            <strong className="font-semibold text-slate-900 dark:text-white">
                              {todayScore.completedCount}
                            </strong>{' '}
                            of{' '}
                            <strong className="font-semibold text-slate-900 dark:text-white">
                              {todayScore.plannedCount}
                            </strong>{' '}
                            done
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <span>
                            <strong className="font-semibold text-slate-900 dark:text-white">
                              {plannedHours}h
                            </strong>{' '}
                            planned
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <span>
                            <strong className="font-semibold text-slate-900 dark:text-white">
                              {actualHours}h
                            </strong>{' '}
                            focused
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <SmartLoadHeaderBadge dateStr={selectedDate} compact />
                        </div>
                      </div>
                    </div>

                    {/* Quick-Add Input (no nested box; separated by thin divider; Add button appears only while typing) */}
                    <form
                      onSubmit={handleQuickAddSubmit}
                      className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          data-testid="quick-add-task-input"
                          value={quickTitle}
                          onFocus={() => setShowQuickAddPopover(true)}
                          onChange={(e) => setQuickTitle(e.target.value)}
                          placeholder="Add a task... (N for full form)"
                          className="flex-1 py-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                        />
                        {quickTitle.trim().length > 0 && (
                          <button
                            type="submit"
                            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer shrink-0"
                          >
                            Add
                          </button>
                        )}
                      </div>

                      {/* Optional inline quick options shown only when typing */}
                      {(showQuickAddPopover && quickTitle.trim().length > 0) && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs tabular-nums">
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
                              <option value="High">High priority</option>
                              <option value="Med">Medium</option>
                              <option value="Low">Low</option>
                            </select>

                            <input
                              type="time"
                              aria-label="Quick task start time"
                              value={quickStart}
                              onChange={(e) => setQuickStart(e.target.value)}
                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                            />

                            <select
                              aria-label="Quick task duration"
                              value={quickDuration}
                              onChange={(e) => setQuickDuration(Number(e.target.value))}
                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
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

                  {/* 4.1c TODAY'S EXTRAS ROW (Smaller neutral grey chips; merged "Daily goal" chip) */}
                  {showTodaysExtras && (
                    <div className="space-y-2" data-testid="todays-extras-section">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* 1. Habits X/Y Chip */}
                        <button
                          type="button"
                          data-testid="extra-chip-habits"
                          onClick={() =>
                            setActiveExtraChip((prev) =>
                              prev === 'habits' ? null : 'habits'
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer tabular-nums ${
                            activeExtraChip === 'habits'
                              ? 'border-blue-500 bg-blue-50/70 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <Repeat className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Habits {habitsProgressToday.completedCount}/{habitsProgressToday.dueCount}
                          </span>
                        </button>

                        {/* 2. Mood & energy Chip */}
                        <button
                          type="button"
                          data-testid="extra-chip-mood"
                          onClick={() =>
                            setActiveExtraChip((prev) =>
                              prev === 'mood' ? null : 'mood'
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer tabular-nums ${
                            activeExtraChip === 'mood'
                              ? 'border-blue-500 bg-blue-50/70 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <Smile className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {currentMoodLog
                              ? `Mood ${currentMoodLog.mood}/5 · Energy ${currentMoodLog.energy}/5`
                              : 'Mood & energy'}
                          </span>
                        </button>

                        {/* 3. Merged "Daily goal" Chip (holds both daily goal and focus target) */}
                        <button
                          type="button"
                          data-testid="extra-chip-goal"
                          onClick={() =>
                            setActiveExtraChip((prev) =>
                              prev === 'goal' ? null : 'goal'
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer max-w-xs truncate tabular-nums ${
                            activeExtraChip === 'goal'
                              ? 'border-blue-500 bg-blue-50/70 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <Target className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {currentReview?.dailyGoal
                              ? `Daily goal: ${currentReview.dailyGoal} (${focusTargetPct}%)`
                              : `Daily goal · ${focusTargetPct}%`}
                          </span>
                        </button>

                        {/* 4. Motivation Chip */}
                        <button
                          type="button"
                          data-testid="extra-chip-quote"
                          onClick={() =>
                            setActiveExtraChip((prev) =>
                              prev === 'quote' ? null : 'quote'
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                            activeExtraChip === 'quote'
                              ? 'border-blue-500 bg-blue-50/70 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <Quote className="w-3.5 h-3.5 text-slate-400" />
                          <span>Motivation</span>
                        </button>

                        {/* 5. Unfinished from yesterday Chip (if any) */}
                        {yesterdayUnfinished.length > 0 && (
                          <button
                            type="button"
                            data-testid="extra-chip-unfinished"
                            onClick={() =>
                              setActiveExtraChip((prev) =>
                                prev === 'unfinished' ? null : 'unfinished'
                              )
                            }
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer tabular-nums ${
                              activeExtraChip === 'unfinished'
                                ? 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'
                                : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                            <span>{yesterdayUnfinished.length} unfinished from yesterday</span>
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
                              <Smile className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
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
                                          ? 'bg-blue-50 dark:bg-blue-950/70 ring-2 ring-blue-500 scale-105'
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
                              <BatteryCharging className="w-4 h-4 text-slate-400" />
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
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
                                      className={`px-2 py-1 rounded-md text-xs tabular-nums font-medium transition-colors cursor-pointer ${
                                        active
                                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                      }`}
                                    >
                                      {en}/5
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

                      {/* Merged Daily goal + Focus target popover */}
                      {activeExtraChip === 'goal' && (
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3.5 text-xs">
                          <div className="flex items-center gap-2.5">
                            <Target className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              aria-label="Daily goal highlight"
                              value={currentReview?.dailyGoal || ''}
                              onChange={(e) => setDailyGoal(selectedDate, e.target.value)}
                              placeholder="Set your main outcome for today..."
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

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 tabular-nums">
                            <div className="space-y-1.5">
                              <div className="flex justify-between font-medium">
                                <span className="text-slate-600 dark:text-slate-400">
                                  Daily focus target
                                </span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {todayScore.actualMinutes}m / {settings.dailyFocusTargetMinutes}m
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full transition-all"
                                  style={{ width: `${focusTargetPct}%` }}
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex justify-between font-medium">
                                <span className="text-slate-600 dark:text-slate-400">
                                  Weekly focus target
                                </span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {Math.round(weeklyFocusMins / 60)}h /{' '}
                                  {Math.round((settings.weeklyFocusTargetMinutes || 1200) / 60)}h
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full transition-all"
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
                        </div>
                      )}

                      {activeExtraChip === 'quote' && (
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300 italic">
                            <Quote className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
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
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                              {yesterdayUnfinished.length} unfinished task(s) from {yesterdayStr}
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
                              className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer"
                            >
                              Move all to today
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            {yesterdayUnfinished.map((ut) => (
                              <div
                                key={ut.id}
                                className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-xl text-xs"
                              >
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                  {ut.title}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => carryForwardTasks([ut.id], selectedDate)}
                                  className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 font-medium cursor-pointer shrink-0"
                                >
                                  Move to today
                                </button>
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
                      onOpenNewTaskModal={() =>
                        openNewTaskModalWithDefaults({ date: selectedDate })
                      }
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
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Notes drawer
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
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-medium cursor-pointer ${
            activeNav === 'today'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
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
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-medium cursor-pointer ${
            activeNav === 'calendar'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
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
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-medium cursor-pointer ${
            activeNav === 'notes'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
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
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-medium cursor-pointer ${
            showMobileMoreSheet
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
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
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                All workspaces
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
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-medium text-left border transition-colors ${
                      active
                        ? 'bg-blue-50/90 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-500 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-400 shrink-0" />
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
