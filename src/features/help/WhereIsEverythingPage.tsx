import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Keyboard,
  Search,
} from 'lucide-react';
import { useDayForgeStore } from '../../store/useDayForgeStore';
import {
  AnalyticsTabId,
  useUIPreferencesStore,
} from '../../store/useUIPreferencesStore';

export interface FeatureMapEntry {
  id: string;
  phase: 'Phase 1' | 'Phase 2' | 'Phase 3' | 'Phase 4.0' | 'Phase 4.1';
  category:
    | 'Planning & Tasks'
    | 'Time & Focus'
    | 'Calendar & Sync'
    | 'Habits, Goals & Rituals'
    | 'Notes & Reviews'
    | 'Analytics & Reports'
    | 'Settings & System';
  feature: string;
  whereItLivesNow: string;
  shortcut?: string;
  actionLabel: string;
  onNavigate: () => void;
}

export const WhereIsEverythingPage: React.FC<{
  onOpenNewTaskModal: () => void;
  onOpenAIScheduleModal: () => void;
}> = ({ onOpenNewTaskModal, onOpenAIScheduleModal }) => {
  const setActiveNav = useDayForgeStore((s) => s.setActiveNav);
  const setWrapUpModalOpen = useDayForgeStore((s) => s.setWrapUpModalOpen);
  const setReplanModalOpen = useDayForgeStore((s) => s.setReplanModalOpen);
  const setShortcutsHelpOpen = useDayForgeStore((s) => s.setShortcutsHelpOpen);
  const setCommandPaletteOpen = useDayForgeStore((s) => s.setCommandPaletteOpen);
  const setZenMode = useDayForgeStore((s) => s.setZenMode);
  const isRightPaneOpen = useDayForgeStore((s) => s.isRightPaneOpen);
  const toggleRightPane = useDayForgeStore((s) => s.toggleRightPane);

  const setActiveSettingsSection = useUIPreferencesStore(
    (s) => s.setActiveSettingsSection
  );
  const setAnalyticsActiveTab = useUIPreferencesStore(
    (s) => s.setAnalyticsActiveTab
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const goToSettings = (sectionId: string) => {
    setActiveSettingsSection(sectionId);
    setActiveNav('settings');
  };

  const goToAnalytics = (tabId: AnalyticsTabId) => {
    setAnalyticsActiveTab(tabId);
    setActiveNav('analytics');
  };

  const featureEntries = useMemo<FeatureMapEntry[]>(
    () => [
      // Planning & Tasks
      {
        id: 'feat-today-plan',
        phase: 'Phase 1',
        category: 'Planning & Tasks',
        feature: 'Today plan (List & Timeline time-blocking)',
        whereItLivesNow: 'Sidebar → Today (segmented List / Timeline switch in greeting card)',
        shortcut: 'G then T',
        actionLabel: 'Open Today',
        onNavigate: () => setActiveNav('today'),
      },
      {
        id: 'feat-quick-add',
        phase: 'Phase 1',
        category: 'Planning & Tasks',
        feature: 'Quick-add task input & full task modal',
        whereItLivesNow: 'Today greeting card input ("Add a task..."), Top bar "New task" button, or Mobile bottom bar "+"',
        shortcut: 'N or Q',
        actionLabel: 'New task',
        onNavigate: () => onOpenNewTaskModal(),
      },
      {
        id: 'feat-task-drawer',
        phase: 'Phase 4.0',
        category: 'Planning & Tasks',
        feature: 'Task detail drawer & "More options" accordion (Repeat, Reminders, Subtasks, Goal, Google, Time log)',
        whereItLivesNow: 'Click any task card title or "Edit" action in Today / All Tasks / Calendar',
        actionLabel: 'View tasks',
        onNavigate: () => setActiveNav('tasks'),
      },
      {
        id: 'feat-all-tasks',
        phase: 'Phase 3',
        category: 'Planning & Tasks',
        feature: 'All tasks (List & Kanban board, Saved views, Filters popover, Bulk select, Tag manager)',
        whereItLivesNow: 'Sidebar → Tasks (Views bar, Filters popover, Bulk bar when tasks are checked)',
        actionLabel: 'Open All tasks',
        onNavigate: () => setActiveNav('tasks'),
      },
      {
        id: 'feat-eisenhower',
        phase: 'Phase 3',
        category: 'Planning & Tasks',
        feature: 'Eisenhower Matrix (4 quadrants: Do first, Schedule, Quick tasks, Eliminate)',
        whereItLivesNow: 'Sidebar → More → Eisenhower Matrix (pin to main sidebar in Settings > Appearance)',
        actionLabel: 'Open Matrix',
        onNavigate: () => setActiveNav('matrix'),
      },
      {
        id: 'feat-smart-replan',
        phase: 'Phase 3',
        category: 'Planning & Tasks',
        feature: 'Smart Replan ("Replan my day" conflict & overdue solver with preview & Undo)',
        whereItLivesNow: 'Today greeting card → "Actions" (...) menu → Replan my day (or click "Xh free" capacity indicator)',
        actionLabel: 'Open Smart Replan',
        onNavigate: () => setReplanModalOpen(true),
      },
      {
        id: 'feat-carry-forward',
        phase: 'Phase 1',
        category: 'Planning & Tasks',
        feature: 'Yesterday unfinished tasks carry-forward',
        whereItLivesNow: 'Today page → "Today’s extras" chip row → Unfinished from yesterday chip popover',
        actionLabel: 'Go to Today',
        onNavigate: () => setActiveNav('today'),
      },

      // Time & Focus
      {
        id: 'feat-live-timer',
        phase: 'Phase 1',
        category: 'Time & Focus',
        feature: 'Live task stopwatch & Pomodoro timer (slim Active Focus Bar)',
        whereItLivesNow: 'Hover any task card → Focus / Pomodoro button; slim bar appears at top while running',
        shortcut: 'P (Pause/Resume)',
        actionLabel: 'Go to Today',
        onNavigate: () => setActiveNav('today'),
      },
      {
        id: 'feat-zen-mode',
        phase: 'Phase 3',
        category: 'Time & Focus',
        feature: 'Distraction-free Focus / Zen mode (full-screen timer + subtasks + scratchpad)',
        whereItLivesNow: 'Slim Active Focus Bar → "Zen" button, or Command Palette / keyboard shortcut',
        shortcut: 'F',
        actionLabel: 'Enter Zen mode',
        onNavigate: () => setZenMode(true),
      },
      {
        id: 'feat-focus-targets',
        phase: 'Phase 4.1',
        category: 'Time & Focus',
        feature: 'Daily goal & Daily/Weekly focus target progress',
        whereItLivesNow: 'Today page → "Today’s extras" chip row → "Daily goal" chip popover (holds both daily goal and focus targets)',
        actionLabel: 'Go to Today',
        onNavigate: () => setActiveNav('today'),
      },

      // Calendar & Sync
      {
        id: 'feat-calendar-views',
        phase: 'Phase 2',
        category: 'Calendar & Sync',
        feature: 'Calendar page (Day, Week & Month views, drag-to-reschedule, resize duration)',
        whereItLivesNow: 'Sidebar → Calendar',
        shortcut: 'G then C',
        actionLabel: 'Open Calendar',
        onNavigate: () => setActiveNav('calendar'),
      },
      {
        id: 'feat-recurring-tasks',
        phase: 'Phase 2',
        category: 'Calendar & Sync',
        feature: 'Recurring tasks engine (Daily, Weekdays, Weekly, Every N days/weeks, per-occurrence overrides)',
        whereItLivesNow: 'Task detail drawer → "More options" → Repeat section',
        actionLabel: 'Create recurring task',
        onNavigate: () => onOpenNewTaskModal(),
      },
      {
        id: 'feat-google-calendar',
        phase: 'Phase 2',
        category: 'Calendar & Sync',
        feature: 'Google Calendar two-way OAuth sync & setup wizard',
        whereItLivesNow: 'Calendar toolbar → Google Calendar status chip (or Settings → Calendar & Integrations)',
        actionLabel: 'Open Calendar',
        onNavigate: () => setActiveNav('calendar'),
      },
      {
        id: 'feat-ics-import-export',
        phase: 'Phase 2',
        category: 'Calendar & Sync',
        feature: '.ICS calendar export, import & preview external feed',
        whereItLivesNow: 'Calendar toolbar → ".ICS / Export" popover',
        actionLabel: 'Open Calendar',
        onNavigate: () => setActiveNav('calendar'),
      },

      // Habits, Goals & Rituals
      {
        id: 'feat-habits-tracker',
        phase: 'Phase 2',
        category: 'Habits, Goals & Rituals',
        feature: 'Habits page (7-day check-in grid, 90-day heatmap, streaks, numeric/timer habits) & Today Habits chip',
        whereItLivesNow: 'Sidebar → More → Habits (and Today page → "Habits X/Y" chip popover)',
        shortcut: 'G then H',
        actionLabel: 'Open Habits',
        onNavigate: () => setActiveNav('habits'),
      },
      {
        id: 'feat-goals-templates',
        phase: 'Phase 3',
        category: 'Habits, Goals & Rituals',
        feature: 'Goals & Templates (long-term goals linked to tasks/habits + reusable Task & Day templates)',
        whereItLivesNow: 'Sidebar → More → Goals & Templates (also linked from empty Today state)',
        actionLabel: 'Open Goals & Templates',
        onNavigate: () => setActiveNav('goals'),
      },
      {
        id: 'feat-daily-wrapup',
        phase: 'Phase 3',
        category: 'Habits, Goals & Rituals',
        feature: 'Daily wrap-up ritual (4-step wizard: Summary, Reflection, Unfinished tasks, Tomorrow)',
        whereItLivesNow: 'Today greeting card → "Actions" (...) menu → Wrap up day ritual (or Command Palette)',
        shortcut: 'W',
        actionLabel: 'Start wrap-up',
        onNavigate: () => setWrapUpModalOpen(true),
      },
      {
        id: 'feat-mood-goal-quote',
        phase: 'Phase 4.1',
        category: 'Habits, Goals & Rituals',
        feature: 'Mood & energy check-in, Daily goal + Focus target, and Daily motivation quote',
        whereItLivesNow: 'Today page → "Today’s extras" chip row (Mood & energy, Daily goal, Motivation chips)',
        actionLabel: 'Go to Today',
        onNavigate: () => setActiveNav('today'),
      },
      {
        id: 'feat-achievements',
        phase: 'Phase 3',
        category: 'Habits, Goals & Rituals',
        feature: 'Achievements & milestones (real-data-only badges & progress)',
        whereItLivesNow: 'Sidebar → More → Achievements',
        actionLabel: 'Open Achievements',
        onNavigate: () => setActiveNav('achievements'),
      },

      // Notes & Reviews
      {
        id: 'feat-notes-pane',
        phase: 'Phase 4.1',
        category: 'Notes & Reviews',
        feature: 'Markdown notes workspace & side-by-side note pane (Today | All notes switch, folders & task links)',
        whereItLivesNow: 'Right side pane on wide screens ("Today | All notes (N)" switch), Top bar Notes icon drawer, or Sidebar → Notes',
        shortcut: ']',
        actionLabel: 'Open Notes',
        onNavigate: () => {
          if (!isRightPaneOpen) toggleRightPane();
          setActiveNav('notes');
        },
      },
      {
        id: 'feat-reviews',
        phase: 'Phase 3',
        category: 'Notes & Reviews',
        feature: 'Daily reflection journal & Weekly review generator (Markdown export & save to Notes)',
        whereItLivesNow: 'Sidebar → More → Reviews',
        actionLabel: 'Open Reviews',
        onNavigate: () => setActiveNav('reviews'),
      },

      // Analytics & Reports
      {
        id: 'feat-analytics-overview',
        phase: 'Phase 1',
        category: 'Analytics & Reports',
        feature: 'Analytics overview (4 key KPIs, Productivity score trend, Planned vs actual hours, Scoring formula)',
        whereItLivesNow: 'Sidebar → Analytics → Overview tab',
        shortcut: 'G then A',
        actionLabel: 'Open Analytics',
        onNavigate: () => goToAnalytics('overview'),
      },
      {
        id: 'feat-analytics-tabs',
        phase: 'Phase 3',
        category: 'Analytics & Reports',
        feature: 'Analytics deep-dive tabs (Time by category/quadrant/hour, Tasks, Habits, 90-day consistency, Mood vs score)',
        whereItLivesNow: 'Sidebar → Analytics → Time / Tasks / Habits / Consistency / Mood tabs',
        actionLabel: 'Explore charts',
        onNavigate: () => goToAnalytics('time'),
      },
      {
        id: 'feat-reports-csv',
        phase: 'Phase 3',
        category: 'Analytics & Reports',
        feature: 'CSV exports (Tasks, Time logs, Habits, Daily summary) & Printable report view',
        whereItLivesNow: 'Sidebar → More → Reports & CSV (also linked in Settings > Data & Backup)',
        actionLabel: 'Open Reports',
        onNavigate: () => setActiveNav('reports'),
      },

      // Settings & System
      {
        id: 'feat-theme-sync-avatar',
        phase: 'Phase 4.1',
        category: 'Settings & System',
        feature: 'Theme toggle (Light / Dark / System) & Local/Sync status indicator',
        whereItLivesNow: 'Top bar right → Avatar menu (and Settings → Appearance / Account & Cloud Sync)',
        actionLabel: 'Appearance settings',
        onNavigate: () => goToSettings('appearance'),
      },
      {
        id: 'feat-appearance-density',
        phase: 'Phase 4.0',
        category: 'Settings & System',
        feature: 'Appearance, Theme presets, Density (Comfortable/Compact), Sidebar pinned items & Today’s extras toggle',
        whereItLivesNow: 'Sidebar bottom → Settings → Appearance accordion section',
        actionLabel: 'Appearance settings',
        onNavigate: () => goToSettings('appearance'),
      },
      {
        id: 'feat-notifications',
        phase: 'Phase 2',
        category: 'Settings & System',
        feature: 'Notifications & reminders (In-app bell center, Browser Push permission, Quiet hours, Morning/Evening prompts)',
        whereItLivesNow: 'Top bar Bell icon & Settings → Notifications & Background Push accordion section',
        actionLabel: 'Notification settings',
        onNavigate: () => goToSettings('notifications'),
      },
      {
        id: 'feat-account-cloud-reserved',
        phase: 'Phase 4.0',
        category: 'Settings & System',
        feature: 'Account & Cloud Sync status (Local mode in Avatar menu now; Firebase Auth & Cloud Sync in Phase 4A)',
        whereItLivesNow: 'Top bar Avatar menu & Settings → Account & Cloud Sync section',
        actionLabel: 'Account settings',
        onNavigate: () => goToSettings('account'),
      },
      {
        id: 'feat-ai-schedule',
        phase: 'Phase 1',
        category: 'Settings & System',
        feature: 'AI Schedule Architect & Gemini Assistant slot (Phase 4C)',
        whereItLivesNow: 'Today greeting card → "Actions" (...) menu → AI schedule architect (and Settings → AI Assistant)',
        actionLabel: 'Open AI architect',
        onNavigate: () => onOpenAIScheduleModal(),
      },
      {
        id: 'feat-backup-json',
        phase: 'Phase 1',
        category: 'Settings & System',
        feature: 'Full JSON backup export, import restore & demo data reset/clear',
        whereItLivesNow: 'Settings → Data & Backup accordion section (and top bar sample data banner)',
        actionLabel: 'Data & backup',
        onNavigate: () => goToSettings('data'),
      },
      {
        id: 'feat-command-palette',
        phase: 'Phase 3',
        category: 'Settings & System',
        feature: 'Global Command Palette, Search & Keyboard shortcuts cheat sheet',
        whereItLivesNow: 'Top bar Search icon button (Ctrl+K), or press ? for keyboard shortcuts',
        shortcut: 'Ctrl+K or ?',
        actionLabel: 'Open Command Palette',
        onNavigate: () => setCommandPaletteOpen(true),
      },
    ],
    [
      setActiveNav,
      onOpenNewTaskModal,
      setReplanModalOpen,
      setZenMode,
      setWrapUpModalOpen,
      isRightPaneOpen,
      toggleRightPane,
      onOpenAIScheduleModal,
      setCommandPaletteOpen,
    ]
  );

  const categories = [
    'All',
    'Planning & Tasks',
    'Time & Focus',
    'Calendar & Sync',
    'Habits, Goals & Rituals',
    'Notes & Reviews',
    'Analytics & Reports',
    'Settings & System',
  ];

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return featureEntries.filter((entry) => {
      if (selectedCategory !== 'All' && entry.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        entry.feature.toLowerCase().includes(q) ||
        entry.whereItLivesNow.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q) ||
        (entry.shortcut && entry.shortcut.toLowerCase().includes(q))
      );
    });
  }, [featureEntries, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6" data-testid="where-is-everything-page">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Compass className="w-4 h-4 text-slate-400" />
            Feature directory
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Where is everything?
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Every feature from Phases 1–3 is preserved intact and reachable within two clicks. Search any tool below or jump straight to it.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShortcutsHelpOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5 text-slate-400" />
            Shortcuts (?)
          </button>
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            Command palette (Ctrl+K)
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            data-testid="help-feature-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any feature, chart, ritual, integration, or shortcut..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Map Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              Complete feature map ({filteredEntries.length} of {featureEntries.length} shown)
            </span>
          </div>
          <span className="text-xs text-slate-500">
            All Phase 1–3 features verified &amp; reachable
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredEntries.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {item.feature}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {item.category}
                  </span>
                  {item.shortcut && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tabular-nums">
                      {item.shortcut}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Location:{' '}
                  </span>
                  {item.whereItLivesNow}
                </p>
              </div>

              <button
                type="button"
                onClick={item.onNavigate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors shrink-0 self-start sm:self-center cursor-pointer"
              >
                {item.actionLabel}
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
