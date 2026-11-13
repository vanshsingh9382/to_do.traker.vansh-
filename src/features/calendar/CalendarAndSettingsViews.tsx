import React, { useMemo, useState } from 'react';
import {
  addDays,
  eachDayOfInterval,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Upload,
  Plus,
  Sparkles,
  Brain,
  Bell,
  Moon,
  Volume2,
  Smartphone,
  CheckCircle2,
  Search,
  User,
  Cloud,
  Calendar,
  Timer,
  Palette,
  Database,
  Keyboard,
  Pin,
  FileSpreadsheet,
} from 'lucide-react';
import { NavSection, useDayForgeStore } from '../../store/useDayForgeStore';
import { PresetColorTheme, Priority, Task } from '../../types';
import { expandTasksForDate } from '../../lib/recurrenceEngine';
import { PWAInstallButton } from '../../components/ui/PWAInstallAndNotifications';
import { useUIPreferencesStore } from '../../store/useUIPreferencesStore';

function getBrowserNotificationPermission(): string {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

async function requestBrowserNotificationPermission(): Promise<string> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export const WeeklyOverview: React.FC<{
  onSelectDay: (dateStr: string) => void;
  onInspectTask: (task: Task) => void;
}> = ({ onSelectDay, onInspectTask }) => {
  const selectedDate = useDayForgeStore((s) => s.selectedDate);
  const tasks = useDayForgeStore((s) => s.tasks);
  const categories = useDayForgeStore((s) => s.categories);

  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 })
  );

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: weekStart,
        end: addDays(weekStart, 6),
      }),
    [weekStart]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Weekly Planner Overview
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any day header to open its Daily Timeline or inspect a task directly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekStart((d) => addDays(d, -7))}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-semibold px-2">
            {format(days[0], 'MMM d')} – {format(days[6], 'MMM d, yyyy')}
          </span>
          <button
            type="button"
            onClick={() => setWeekStart((d) => addDays(d, 7))}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {days.map((day) => {
          const dStr = format(day, 'yyyy-MM-dd');
          const dayTasks = expandTasksForDate(tasks, dStr);
          const isSelected = dStr === selectedDate;
          const completedCount = dayTasks.filter((t) => t.status === 'Completed').length;

          return (
            <div
              key={dStr}
              className={`rounded-xl border p-3 flex flex-col justify-between min-h-64 bg-white dark:bg-slate-900 ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <button
                  type="button"
                  onClick={() => onSelectDay(dStr)}
                  className="w-full text-left flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 cursor-pointer"
                >
                  <div>
                    <div className="text-[11px] font-semibold uppercase text-slate-400">
                      {format(day, 'EEE')}
                    </div>
                    <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                      {format(day, 'MMM d')}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {completedCount}/{dayTasks.length}
                  </span>
                </button>

                <div className="space-y-1.5">
                  {dayTasks.length === 0 ? (
                    <p className="text-[11px] text-slate-400 py-4 text-center">
                      No tasks planned
                    </p>
                  ) : (
                    dayTasks.map((t) => {
                      const cat = categories.find((c) => c.name === t.category);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => onInspectTask(t)}
                          style={{
                            borderLeftColor: cat?.color || '#2563EB',
                          }}
                          className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 border-l-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <div
                            className={`text-xs font-semibold truncate ${
                              t.status === 'Completed'
                                ? 'line-through text-slate-400'
                                : 'text-slate-800 dark:text-slate-100'
                            }`}
                          >
                            {t.title}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            {t.start || 'Flex'} · {t.estimatedMinutes}m
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MonthlyOverview: React.FC<{
  onSelectDay: (dateStr: string) => void;
}> = ({ onSelectDay }) => {
  const selectedDate = useDayForgeStore((s) => s.selectedDate);
  const tasks = useDayForgeStore((s) => s.tasks);
  const categories = useDayForgeStore((s) => s.categories);

  const [monthBase, setMonthBase] = useState(() => startOfMonth(parseISO(selectedDate)));

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthBase), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: addDays(start, 34) });
  }, [monthBase]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Monthly Calendar Grid
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Overview of scheduled blocks across the month. Click any cell to open that day.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonthBase((d) => addDays(d, -30))}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold font-mono px-2">
            {format(monthBase, 'MMMM yyyy')}
          </span>
          <button
            type="button"
            onClick={() => setMonthBase((d) => addDays(d, 30))}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-slate-500 py-1"
          >
            {d}
          </div>
        ))}

        {gridDays.map((day) => {
          const dStr = format(day, 'yyyy-MM-dd');
          const dayTasks = expandTasksForDate(tasks, dStr);
          const inCurrentMonth = isSameMonth(day, monthBase);
          const isSelected = dStr === selectedDate;

          return (
            <button
              key={dStr}
              type="button"
              onClick={() => onSelectDay(dStr)}
              className={`min-h-24 p-2 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                !inCurrentMonth
                  ? 'bg-slate-50/60 dark:bg-slate-900/40 text-slate-400 border-slate-100 dark:border-slate-800/50'
                  : isSelected
                  ? 'bg-blue-50/40 dark:bg-blue-950/30 border-blue-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-mono font-bold">{format(day, 'd')}</span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] font-mono px-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              <div className="space-y-1 mt-1 w-full overflow-hidden">
                {dayTasks.slice(0, 2).map((t) => {
                  const cat = categories.find((c) => c.name === t.category);
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-1 text-[10px] truncate text-slate-700 dark:text-slate-300"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat?.color || '#2563EB' }}
                      />
                      <span className="truncate">{t.title}</span>
                    </div>
                  );
                })}
                {dayTasks.length > 2 && (
                  <div className="text-[9px] text-slate-400">
                    +{dayTasks.length - 2} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface SettingsPanelProps {
  isInstalled?: boolean;
  onTriggerInstall?: () => Promise<'accepted' | 'guide'>;
  swNote?: string | null;
  onOpenAIScheduleModal?: () => void;
}

const PINNABLE_NAV_OPTIONS: { id: NavSection; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'tasks', label: 'Tasks (All Tasks)' },
  { id: 'notes', label: 'Notes' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'habits', label: 'Habits' },
  { id: 'goals', label: 'Goals & Templates' },
  { id: 'matrix', label: 'Eisenhower Matrix' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'reports', label: 'Reports & CSV' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isInstalled = false,
  onTriggerInstall,
  swNote,
  onOpenAIScheduleModal,
}) => {
  const settings = useDayForgeStore((s) => s.settings);
  const categories = useDayForgeStore((s) => s.categories);
  const updateSettings = useDayForgeStore((s) => s.updateSettings);
  const addCategory = useDayForgeStore((s) => s.addCategory);
  const exportBackupJson = useDayForgeStore((s) => s.exportBackupJson);
  const importBackupJson = useDayForgeStore((s) => s.importBackupJson);
  const resetDemoData = useDayForgeStore((s) => s.resetDemoData);
  const clearDemoData = useDayForgeStore((s) => s.clearDemoData);
  const triggerTestNotification = useDayForgeStore((s) => s.triggerTestNotification);
  const setActiveNav = useDayForgeStore((s) => s.setActiveNav);
  const setShortcutsHelpOpen = useDayForgeStore((s) => s.setShortcutsHelpOpen);
  const isSidebarCollapsed = useDayForgeStore((s) => s.isSidebarCollapsed);
  const toggleSidebar = useDayForgeStore((s) => s.toggleSidebar);
  const isRightPaneOpen = useDayForgeStore((s) => s.isRightPaneOpen);
  const toggleRightPane = useDayForgeStore((s) => s.toggleRightPane);

  // UI Preferences Store (Phase 4.0)
  const density = useUIPreferencesStore((s) => s.density);
  const setDensity = useUIPreferencesStore((s) => s.setDensity);
  const sidebarMode = useUIPreferencesStore((s) => s.sidebarMode);
  const setSidebarMode = useUIPreferencesStore((s) => s.setSidebarMode);
  const notesDefaultOpen = useUIPreferencesStore((s) => s.notesDefaultOpen);
  const setNotesDefaultOpen = useUIPreferencesStore((s) => s.setNotesDefaultOpen);
  const showTodaysExtras = useUIPreferencesStore((s) => s.showTodaysExtras);
  const setShowTodaysExtras = useUIPreferencesStore((s) => s.setShowTodaysExtras);
  const reduceMotion = useUIPreferencesStore((s) => s.reduceMotion);
  const setReduceMotion = useUIPreferencesStore((s) => s.setReduceMotion);
  const pinnedNavItems = useUIPreferencesStore((s) => s.pinnedNavItems);
  const togglePinnedNavItem = useUIPreferencesStore((s) => s.togglePinnedNavItem);
  const activeSection = useUIPreferencesStore((s) => s.activeSettingsSection);
  const setActiveSection = useUIPreferencesStore((s) => s.setActiveSettingsSection);

  const [settingsSearch, setSettingsSearch] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#2563EB');
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [notifPerm, setNotifPerm] = useState<string>(() =>
    getBrowserNotificationPermission()
  );

  const handleExport = () => {
    const json = exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dayforge-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMessage('Backup exported successfully.');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importBackupJson(String(reader.result || ''));
      setBackupMessage(
        result.ok
          ? 'Backup imported and migrated successfully!'
          : result.error || 'Import failed.'
      );
    };
    reader.readAsText(file);
  };

  const handleRequestNotifications = async () => {
    const res = await requestBrowserNotificationPermission();
    setNotifPerm(res);
  };

  const toggles = settings.reminderToggles || {
    taskReminders: true,
    morningSummary: true,
    eveningReview: true,
    habitReminders: true,
    focusSessionEnd: true,
  };

  const updateToggle = (key: keyof typeof toggles, val: boolean) => {
    updateSettings({
      reminderToggles: {
        ...toggles,
        [key]: val,
      },
    });
  };

  const toggleWorkingDay = (dayNum: number) => {
    const exists = settings.workingDays.includes(dayNum);
    const updated = exists
      ? settings.workingDays.filter((d) => d !== dayNum)
      : [...settings.workingDays, dayNum].sort();
    updateSettings({ workingDays: updated });
  };

  // Accordion section definitions with search keywords
  const sectionMeta = [
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Name, display greeting, and local timezone',
      icon: User,
      keywords: 'profile name user timezone clock greeting',
    },
    {
      id: 'account',
      title: 'Account & Cloud Sync',
      subtitle: 'Local-only mode status (Firebase Auth & Cloud Sync reserved for Phase 4A)',
      icon: Cloud,
      keywords: 'account cloud sync firebase login sign in google email local mode 4a',
    },
    {
      id: 'planning',
      title: 'Planning & Targets',
      subtitle: 'Working hours, working days, default task duration, Smart Replan buffer & focus targets',
      icon: Calendar,
      keywords: 'planning working hours days default duration buffer focus target goal score threshold',
    },
    {
      id: 'timer',
      title: 'Timer & Pomodoro',
      subtitle: 'Pomodoro work, short break, and long break durations',
      icon: Timer,
      keywords: 'timer pomodoro work break stopwatch focus minutes',
    },
    {
      id: 'notifications',
      title: 'Notifications & Background Push',
      subtitle: 'Browser permission, morning/evening nudges, quiet hours, chimes & 4B Push slot',
      icon: Bell,
      keywords: 'notifications reminders browser push permission quiet hours morning evening sound chime 4b',
    },
    {
      id: 'integrations',
      title: 'Calendar & Integrations',
      subtitle: 'Google Calendar OAuth Client ID and installable PWA offline app shell',
      icon: Smartphone,
      keywords: 'google calendar client id oauth pwa install offline ics',
    },
    {
      id: 'ai',
      title: 'AI Assistant',
      subtitle: 'AI Schedule Architect & reserved Gemini Assistant settings (Phase 4C)',
      icon: Brain,
      keywords: 'ai assistant gemini schedule architect thinking 4c',
    },
    {
      id: 'appearance',
      title: 'Appearance, Density & Navigation',
      subtitle: 'Theme presets, dark mode, Comfortable/Compact density, sidebar pinning & categories',
      icon: Palette,
      keywords: 'appearance theme dark light mode accent color density compact comfortable sidebar icons notes extras motion categories',
    },
    {
      id: 'data',
      title: 'Data, Backup & Demo Data',
      subtitle: 'JSON backup export/import, CSV reports, and demo data reset or clear',
      icon: Database,
      keywords: 'data backup export import json csv report demo reset clear',
    },
    {
      id: 'advanced',
      title: 'Shortcuts & Advanced',
      subtitle: 'Keyboard shortcuts toggle, cheat sheet, and Where is everything? guide',
      icon: Keyboard,
      keywords: 'shortcuts keyboard hotkeys advanced help where is everything',
    },
  ];

  const q = settingsSearch.trim().toLowerCase();
  const visibleSections = sectionMeta.filter(
    (sec) =>
      !q ||
      sec.title.toLowerCase().includes(q) ||
      sec.subtitle.toLowerCase().includes(q) ||
      sec.keywords.includes(q)
  );

  const isSectionOpen = (id: string) => {
    if (q) return true;
    return activeSection === id;
  };

  const handleToggleSection = (id: string) => {
    setActiveSection(activeSection === id ? '' : id);
  };

  return (
    <div className="space-y-4 max-w-4xl" data-testid="settings-panel">
      {/* Header + Search Settings Input */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Settings &amp; preferences
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sections start collapsed so you can scan the list. Click any section or search to jump straight to a setting.
          </p>
        </div>

        <div className="relative min-w-[240px] flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            data-testid="settings-search-input"
            value={settingsSearch}
            onChange={(e) => setSettingsSearch(e.target.value)}
            placeholder="Search settings (e.g. density, pomodoro, backup)..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Accordion Sections (All start collapsed; only one expanded at a time unless searching) */}
      <div className="space-y-2">
        {visibleSections.map((sec) => {
          const Icon = sec.icon;
          const open = isSectionOpen(sec.id);

          return (
            <div
              key={sec.id}
              data-testid={`settings-section-${sec.id}`}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => handleToggleSection(sec.id)}
                aria-expanded={open}
                className="w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {sec.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {sec.subtitle}
                    </div>
                  </div>
                </div>
                {open ? (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {open && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-4">
                  {/* 1. PROFILE */}
                  {sec.id === 'profile' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="space-y-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Your Name
                        </span>
                        <input
                          type="text"
                          value={settings.name || ''}
                          onChange={(e) => updateSettings({ name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Timezone
                        </span>
                        <input
                          type="text"
                          value={settings.timezone || 'UTC'}
                          onChange={(e) => updateSettings({ timezone: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100"
                        />
                      </label>
                    </div>
                  )}

                  {/* 2. ACCOUNT & CLOUD SYNC (Reserved for Phase 4A) */}
                  {sec.id === 'account' && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          Current Mode: Local-Only Storage (On This Device)
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                          Active &amp; Offline-Ready
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Your tasks, habits, notes, reviews, and timer logs are saved locally in versioned storage on this browser. When you proceed to <strong>Phase 4A</strong>, this section will unlock real Google &amp; Email/Password sign-in and multi-device Firestore cloud sync.
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={handleExport}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download Local JSON Backup Now
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. PLANNING & TARGETS */}
                  {sec.id === 'planning' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="space-y-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Working Hours Start
                          </span>
                          <input
                            type="time"
                            value={settings.workDayStart || '06:00'}
                            onChange={(e) =>
                              updateSettings({ workDayStart: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </label>

                        <label className="space-y-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Working Hours End
                          </span>
                          <input
                            type="time"
                            value={settings.workDayEnd || '23:00'}
                            onChange={(e) =>
                              updateSettings({ workDayEnd: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </label>

                        <label className="space-y-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Default Task Duration (m)
                          </span>
                          <input
                            type="number"
                            min={15}
                            max={240}
                            value={settings.defaultTaskDurationMinutes}
                            onChange={(e) =>
                              updateSettings({
                                defaultTaskDurationMinutes: Number(e.target.value) || 45,
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="space-y-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Daily Focus Target (m)
                          </span>
                          <input
                            type="number"
                            min={30}
                            max={720}
                            value={settings.dailyFocusTargetMinutes}
                            onChange={(e) =>
                              updateSettings({
                                dailyFocusTargetMinutes: Number(e.target.value) || 240,
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </label>

                        <label className="space-y-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Weekly Focus Target (m)
                          </span>
                          <input
                            type="number"
                            min={60}
                            max={3600}
                            value={settings.weeklyFocusTargetMinutes}
                            onChange={(e) =>
                              updateSettings({
                                weeklyFocusTargetMinutes: Number(e.target.value) || 1200,
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </label>

                        <label className="space-y-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Smart Replan Buffer (m)
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={60}
                            step={5}
                            value={settings.replanBufferMinutes ?? 10}
                            onChange={(e) =>
                              updateSettings({
                                replanBufferMinutes: Number(e.target.value) || 0,
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </label>
                      </div>

                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                          Working Days (Rest days never break your streak)
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { d: 1, l: 'Mon' },
                            { d: 2, l: 'Tue' },
                            { d: 3, l: 'Wed' },
                            { d: 4, l: 'Thu' },
                            { d: 5, l: 'Fri' },
                            { d: 6, l: 'Sat' },
                            { d: 0, l: 'Sun' },
                          ].map((item) => {
                            const active = settings.workingDays.includes(item.d);
                            return (
                              <button
                                key={item.d}
                                type="button"
                                onClick={() => toggleWorkingDay(item.d)}
                                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                                  active
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}
                              >
                                {item.l}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. TIMER & POMODORO */}
                  {sec.id === 'timer' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="space-y-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Pomodoro Work (mins)
                        </span>
                        <input
                          type="number"
                          min={5}
                          max={120}
                          value={settings.pomodoroWorkMinutes}
                          onChange={(e) =>
                            updateSettings({
                              pomodoroWorkMinutes: Number(e.target.value) || 25,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Short Break (mins)
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={settings.pomodoroShortBreakMinutes}
                          onChange={(e) =>
                            updateSettings({
                              pomodoroShortBreakMinutes: Number(e.target.value) || 5,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Long Break (mins)
                        </span>
                        <input
                          type="number"
                          min={5}
                          max={60}
                          value={settings.pomodoroLongBreakMinutes}
                          onChange={(e) =>
                            updateSettings({
                              pomodoroLongBreakMinutes: Number(e.target.value) || 15,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                        />
                      </label>
                    </div>
                  )}

                  {/* 5. NOTIFICATIONS & BACKGROUND PUSH */}
                  {sec.id === 'notifications' && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
                            Browser Permission: <strong>{notifPerm}</strong>
                          </span>
                          {notifPerm !== 'granted' && (
                            <button
                              type="button"
                              onClick={handleRequestNotifications}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer"
                            >
                              Enable Browser Notifications
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={triggerTestNotification}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold hover:bg-slate-100 cursor-pointer"
                        >
                          Send Test Notification
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="space-y-1">
                          <span className="font-medium text-slate-600 dark:text-slate-400">
                            Default Task Reminder
                          </span>
                          <select
                            value={settings.defaultReminderMinutes ?? 10}
                            onChange={(e) =>
                              updateSettings({
                                defaultReminderMinutes: Number(e.target.value),
                              })
                            }
                            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          >
                            <option value={0}>At start time (0m)</option>
                            <option value={5}>5 minutes before</option>
                            <option value={10}>10 minutes before</option>
                            <option value={15}>15 minutes before</option>
                            <option value={30}>30 minutes before</option>
                            <option value={60}>1 hour before</option>
                          </select>
                        </label>

                        <label className="space-y-1">
                          <span className="font-medium text-slate-600 dark:text-slate-400">
                            Morning Summary Time
                          </span>
                          <input
                            type="time"
                            value={settings.morningSummaryTime || '08:00'}
                            onChange={(e) =>
                              updateSettings({ morningSummaryTime: e.target.value })
                            }
                            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </label>

                        <label className="space-y-1">
                          <span className="font-medium text-slate-600 dark:text-slate-400">
                            Evening Review Time
                          </span>
                          <input
                            type="time"
                            value={settings.eveningReviewTime || '21:00'}
                            onChange={(e) =>
                              updateSettings({ eveningReviewTime: e.target.value })
                            }
                            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(settings.quietHoursEnabled)}
                              onChange={(e) =>
                                updateSettings({ quietHoursEnabled: e.target.checked })
                              }
                              className="rounded text-blue-600"
                            />
                            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Moon className="w-3.5 h-3.5 text-indigo-500" />
                              Quiet Hours:
                            </span>
                          </label>
                          <input
                            type="time"
                            aria-label="Quiet hours start"
                            value={settings.quietHoursStart || '22:30'}
                            onChange={(e) =>
                              updateSettings({ quietHoursStart: e.target.value })
                            }
                            className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                          <span>to</span>
                          <input
                            type="time"
                            aria-label="Quiet hours end"
                            value={settings.quietHoursEnd || '07:00'}
                            onChange={(e) =>
                              updateSettings({ quietHoursEnd: e.target.value })
                            }
                            className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </div>

                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.soundEnabled !== false}
                            onChange={(e) =>
                              updateSettings({ soundEnabled: e.target.checked })
                            }
                            className="rounded text-blue-600"
                          />
                          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                            Web Audio Chime
                          </span>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { key: 'taskReminders' as const, label: 'Task Start Reminders' },
                          { key: 'morningSummary' as const, label: 'Morning Plan Summary' },
                          { key: 'eveningReview' as const, label: 'Evening Review Nudge' },
                          { key: 'habitReminders' as const, label: 'Habit Check-In Reminders' },
                          { key: 'focusSessionEnd' as const, label: 'Focus / Pomodoro Bell' },
                        ].map((item) => (
                          <label
                            key={item.key}
                            className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={toggles[item.key]}
                              onChange={(e) => updateToggle(item.key, e.target.checked)}
                              className="rounded text-blue-600"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                        <strong>Background Web Push (Phase 4B slot):</strong> In-app and foreground browser reminders are active now. Closed-tab Web Push worker &amp; device subscription management will appear right here in Phase 4B.
                      </div>
                    </div>
                  )}

                  {/* 6. CALENDAR & INTEGRATIONS */}
                  {sec.id === 'integrations' && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                          Google OAuth Client ID (Public Web Client ID — never enter a client secret)
                        </span>
                        <input
                          type="text"
                          aria-label="Settings Google Client ID"
                          value={settings.googleClientId || ''}
                          onChange={(e) =>
                            updateSettings({ googleClientId: e.target.value })
                          }
                          placeholder="e.g. 1234567890-abcdefg.apps.googleusercontent.com"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            Progressive Web App (Offline Shell &amp; Home Screen Install)
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">
                            {swNote || 'Offline app shell caching ready.'}
                          </div>
                        </div>
                        {onTriggerInstall && (
                          <PWAInstallButton
                            isInstalled={isInstalled}
                            onTriggerInstall={onTriggerInstall}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* 7. AI ASSISTANT (Reserved for Phase 4C + AI Schedule Architect) */}
                  {sec.id === 'ai' && (
                    <div className="space-y-3">
                      <p className="text-slate-600 dark:text-slate-400">
                        DayForge includes the <strong>Deep-Thinking Schedule Architect</strong> (proposing conflict-free task blocks that only apply after your approval). In <strong>Phase 4C</strong>, the full conversational Gemini Assistant drawer will also be configured here.
                      </p>
                      {onOpenAIScheduleModal && (
                        <button
                          type="button"
                          onClick={onOpenAIScheduleModal}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Open AI Schedule Architect
                        </button>
                      )}
                    </div>
                  )}

                  {/* 8. APPEARANCE, DENSITY & NAVIGATION */}
                  {sec.id === 'appearance' && (
                    <div className="space-y-5">
                      {/* Theme Mode + Preset Themes */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="space-y-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Color Mode
                          </span>
                          <select
                            aria-label="Theme color mode"
                            value={settings.theme}
                            onChange={(e) =>
                              updateSettings({
                                theme: e.target.value as 'light' | 'dark' | 'system',
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="system">System</option>
                          </select>
                        </label>

                        <label className="space-y-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Theme Preset
                          </span>
                          <select
                            aria-label="Theme preset"
                            value={settings.presetTheme || 'classic-blue'}
                            onChange={(e) =>
                              updateSettings({
                                presetTheme: e.target.value as PresetColorTheme,
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          >
                            <option value="classic-blue">Classic Blue</option>
                            <option value="emerald-zen">Emerald Zen</option>
                            <option value="amber-craft">Amber Craft</option>
                            <option value="violet-focus">Violet Focus</option>
                          </select>
                        </label>

                        <label className="space-y-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Custom Accent Hex
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={settings.accentColor || '#2563EB'}
                              onChange={(e) =>
                                updateSettings({ accentColor: e.target.value })
                              }
                              className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={settings.accentColor || '#2563EB'}
                              onChange={(e) =>
                                updateSettings({ accentColor: e.target.value })
                              }
                              className="flex-1 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                            />
                          </div>
                        </label>
                      </div>

                      {/* Phase 4.0 Calm UI Controls: Density, Sidebar, Notes Pane, Today's Extras, Reduce Motion */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            UI Density
                          </span>
                          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-full">
                            {(['comfortable', 'compact'] as const).map((d) => (
                              <button
                                key={d}
                                type="button"
                                data-testid={`density-${d}-btn`}
                                onClick={() => setDensity(d)}
                                className={`flex-1 py-1.5 rounded-lg font-semibold capitalize transition-colors cursor-pointer ${
                                  density === d
                                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Desktop Sidebar Mode
                          </span>
                          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-full">
                            {(['full', 'icons'] as const).map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => {
                                  setSidebarMode(m);
                                  if ((m === 'icons') !== isSidebarCollapsed) {
                                    toggleSidebar();
                                  }
                                }}
                                className={`flex-1 py-1.5 rounded-lg font-semibold capitalize transition-colors cursor-pointer ${
                                  sidebarMode === m
                                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {m === 'full' ? 'Full Labels' : 'Icon Rail'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Notes Pane Default
                          </span>
                          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-full">
                            <button
                              type="button"
                              onClick={() => {
                                setNotesDefaultOpen(true);
                                if (!isRightPaneOpen) toggleRightPane();
                              }}
                              className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                                notesDefaultOpen
                                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs'
                                  : 'text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              Open
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setNotesDefaultOpen(false);
                                if (isRightPaneOpen) toggleRightPane();
                              }}
                              className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                                !notesDefaultOpen
                                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs'
                                  : 'text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              Collapsed
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 pt-2">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showTodaysExtras}
                            onChange={(e) => setShowTodaysExtras(e.target.checked)}
                            className="rounded text-blue-600"
                          />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Show &ldquo;Today&apos;s extras&rdquo; row (Habits, Mood, Daily Goal, Focus Target, Motivation)
                          </span>
                        </label>

                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={reduceMotion}
                            onChange={(e) => setReduceMotion(e.target.checked)}
                            className="rounded text-blue-600"
                          />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Reduce motion &amp; animations
                          </span>
                        </label>
                      </div>

                      {/* Pin / Unpin Sidebar Items */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                          <Pin className="w-3.5 h-3.5 text-blue-600" />
                          Pinned Main Sidebar Items (Unpinned items stay in &ldquo;More&rdquo;)
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {PINNABLE_NAV_OPTIONS.map((opt) => {
                            const pinned = pinnedNavItems.includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => togglePinnedNavItem(opt.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                                  pinned
                                    ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                                }`}
                              >
                                <Pin className="w-3 h-3" />
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Categories Manager */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          Task Categories &amp; Color Dots
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((cat) => (
                            <div
                              key={cat.id}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {cat.name}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="New category name..."
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          />
                          <input
                            type="color"
                            value={newCatColor}
                            onChange={(e) => setNewCatColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newCatName.trim()) return;
                              addCategory(newCatName.trim(), newCatColor);
                              setNewCatName('');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Category
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 9. DATA, BACKUP & DEMO DATA */}
                  {sec.id === 'data' && (
                    <div className="space-y-3">
                      <p className="text-slate-500 dark:text-slate-400">
                        Export a complete JSON snapshot of your workspace at any time, restore from a backup file, or open CSV &amp; Printable Reports.
                      </p>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={handleExport}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Export JSON Backup
                        </button>

                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-200 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          Import JSON Backup
                          <input
                            type="file"
                            accept=".json,application/json"
                            onChange={handleImportFile}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setActiveNav('reports')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          CSV &amp; Printable Reports
                        </button>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            resetDemoData();
                            setBackupMessage('3-week demo dataset restored.');
                          }}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 cursor-pointer"
                        >
                          Restore 3-Week Demo Dataset
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            clearDemoData();
                            setBackupMessage('Demo data cleared. Starting fresh!');
                          }}
                          className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                        >
                          Clear All Data (Start Fresh)
                        </button>
                      </div>

                      {backupMessage && (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          {backupMessage}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 10. SHORTCUTS & ADVANCED */}
                  {sec.id === 'advanced' && (
                    <div className="space-y-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.shortcutsEnabled !== false}
                          onChange={(e) =>
                            updateSettings({ shortcutsEnabled: e.target.checked })
                          }
                          className="rounded text-blue-600"
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Enable single-key keyboard shortcuts (N, Q, F, P, W, [, ], G+T, ?)
                        </span>
                      </label>

                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setShortcutsHelpOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
                        >
                          <Keyboard className="w-3.5 h-3.5 text-blue-600" />
                          View Keyboard Shortcuts (?)
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveNav('help')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 cursor-pointer"
                        >
                          Where is everything? (Feature Map)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface DeepThinkingPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeepThinkingPlannerModal: React.FC<DeepThinkingPlannerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const selectedDate = useDayForgeStore((s) => s.selectedDate);
  const tasks = useDayForgeStore((s) => s.tasks);
  const settings = useDayForgeStore((s) => s.settings);
  const addTask = useDayForgeStore((s) => s.addTask);

  const [prompt, setPrompt] = useState(
    'Plan a balanced 6-hour study and coding day for Distributed Systems, 2 LeetCode Graph problems, and a 45m evening workout.'
  );
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [proposals, setProposals] = useState<
    Array<{
      title: string;
      description?: string;
      category?: string;
      priority?: string;
      start?: string;
      end?: string;
      estimatedMinutes?: number;
      selected: boolean;
    }>
  >([]);

  if (!isOpen) return null;

  const handleRunThinking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsThinking(true);
    setError(null);
    try {
      const dayTasks = tasks.filter((t) => t.date === selectedDate);
      const summary = dayTasks
        .map((t) => `${t.title} (${t.start || 'unscheduled'}, ${t.estimatedMinutes}m)`)
        .join('; ');

      const res = await fetch('/api/ai/think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          currentDate: selectedDate,
          existingTasksSummary: summary,
          workHours: `${settings.workDayStart} to ${settings.workDayEnd}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Thinking request failed.');
      }
      setAnalysis(data.analysis || null);
      setProposals(
        (data.proposedTasks || []).map((p: Record<string, any>) => ({
          ...p,
          selected: true,
        }))
      );
    } catch (err: any) {
      setError(err?.message || 'Could not reach Gemini thinking endpoint.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleApproveSelected = () => {
    proposals
      .filter((p) => p.selected)
      .forEach((p) => {
        const prio: Priority =
          p.priority === 'High' || p.priority === 'Low' ? p.priority : 'Med';
        addTask({
          title: p.title || 'Planned Task',
          description: p.description || '',
          category: p.category || 'Study',
          tags: ['ai-planned'],
          priority: prio,
          important: prio === 'High',
          urgent: false,
          date: selectedDate,
          start: p.start || '09:00',
          end: p.end || '10:00',
          estimatedMinutes: Number(p.estimatedMinutes) || 60,
          status: 'To Do',
          fixedTime: false,
          recurrence: 'none',
          subtasks: [],
          reminders: [10],
        });
      });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Deep-Thinking Day Architect"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 max-h-[88vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Deep-Thinking Schedule Architect (High Thinking Mode)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Close
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Proposes a realistic task breakdown and schedule—nothing is added until you approve.
        </p>

        <form onSubmit={handleRunThinking} className="space-y-3">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 p-3 text-xs text-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={isThinking}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isThinking ? 'Thinking deeply...' : 'Generate Proposed Schedule'}
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
            {error}
          </div>
        )}

        {analysis && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {analysis}
          </div>
        )}

        {proposals.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Proposed Tasks (Uncheck any you don&apos;t want to add):
            </div>
            {proposals.map((p, idx) => (
              <label
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={p.selected}
                  onChange={(e) =>
                    setProposals((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, selected: e.target.checked } : item
                      )
                    )
                  }
                  className="mt-0.5 rounded text-blue-600"
                />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {p.title}
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    {p.category || 'Study'} · {p.start || '09:00'}–{p.end || '10:00'} ·{' '}
                    {p.estimatedMinutes || 60}m
                  </div>
                </div>
              </label>
            ))}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleApproveSelected}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
              >
                Approve &amp; Add Selected Tasks
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
