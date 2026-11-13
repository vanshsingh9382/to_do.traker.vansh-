import React, { useMemo, useState } from 'react';
import {
  Play,
  Timer,
  CheckCircle2,
  Circle,
  SkipForward,
  FileText,
  Search,
  AlertCircle,
  Lock,
  Repeat,
  Calendar,
  SlidersHorizontal,
  MoreHorizontal,
  Plus,
  LayoutTemplate,
  X,
} from 'lucide-react';
import { Priority, Task, TaskStatus } from '../../types';
import { useDayForgeStore } from '../../store/useDayForgeStore';
import {
  expandTasksForDate,
  getEffectiveRecurrenceRule,
  parseTaskIdentity,
} from '../../lib/recurrenceEngine';
import { detectOverlappingTaskIds } from '../../lib/analyticsEngine';
import { useUIPreferencesStore } from '../../store/useUIPreferencesStore';

interface TaskListViewProps {
  date: string;
  onEditTask: (taskId: string) => void;
  onOpenNoteForTask: (task: Task) => void;
  onOpenNewTaskModal?: () => void;
}

const PRIORITY_DOT: Record<Priority, string> = {
  High: 'bg-rose-500',
  Med: 'bg-amber-500',
  Low: 'bg-slate-400',
};

export const TaskListView: React.FC<TaskListViewProps> = ({
  date,
  onEditTask,
  onOpenNoteForTask,
  onOpenNewTaskModal,
}) => {
  const tasks = useDayForgeStore((s) => s.tasks);
  const timeLogs = useDayForgeStore((s) => s.timeLogs);
  const categories = useDayForgeStore((s) => s.categories);
  const setTaskStatus = useDayForgeStore((s) => s.setTaskStatus);
  const requestStartTimer = useDayForgeStore((s) => s.requestStartTimer);
  const setActiveNav = useDayForgeStore((s) => s.setActiveNav);
  const activeTimer = useDayForgeStore((s) => s.activeTimer);
  const density = useUIPreferencesStore((s) => s.density);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'duration'>('time');
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);

  const dayTasks = useMemo(() => expandTasksForDate(tasks, date), [tasks, date]);
  const overlappingIds = useMemo(() => detectOverlappingTaskIds(dayTasks), [dayTasks]);

  const actualByOccurrenceKey = useMemo(() => {
    const map = new Map<string, number>();
    for (const log of timeLogs) {
      const key = `${log.taskId}::${log.occurrenceDate || date}`;
      map.set(key, (map.get(key) || 0) + log.durationMinutes);
    }
    return map;
  }, [timeLogs, date]);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return dayTasks
      .filter((t) => {
        if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
        if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
        if (statusFilter !== 'All' && t.status !== statusFilter) return false;
        if (q) {
          const inTitle = t.title.toLowerCase().includes(q);
          const inDesc = t.description.toLowerCase().includes(q);
          const inTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
          if (!inTitle && !inDesc && !inTags) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'time') return (a.start || '23:59').localeCompare(b.start || '23:59');
        if (sortBy === 'priority') {
          const order: Record<Priority, number> = { High: 0, Med: 1, Low: 2 };
          return order[a.priority] - order[b.priority];
        }
        return b.estimatedMinutes - a.estimatedMinutes;
      });
  }, [dayTasks, searchQuery, categoryFilter, priorityFilter, statusFilter, sortBy]);

  const getCategoryColor = (catName: string) =>
    categories.find((c) => c.name === catName)?.color || '#2563EB';

  const cycleStatus = (task: Task) => {
    const nextMap: Record<TaskStatus, TaskStatus> = {
      'To Do': 'Completed',
      'In Progress': 'Completed',
      Completed: 'To Do',
      Skipped: 'To Do',
    };
    setTaskStatus(task.id, nextMap[task.status], task.date);
  };

  const hasActiveFilters =
    categoryFilter !== 'All' ||
    priorityFilter !== 'All' ||
    statusFilter !== 'All' ||
    sortBy !== 'time' ||
    searchQuery.trim().length > 0;

  const clearAllFilters = () => {
    setCategoryFilter('All');
    setPriorityFilter('All');
    setStatusFilter('All');
    setSortBy('time');
    setSearchQuery('');
    setSearchExpanded(false);
  };

  return (
    <div className="space-y-2.5">
      {/* Slim row above list — hidden when list is empty and no filters are active */}
      {(dayTasks.length > 0 || hasActiveFilters) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {searchExpanded || searchQuery.trim().length > 0 ? (
              <div className="relative w-56 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    if (!searchQuery.trim()) setSearchExpanded(false);
                  }}
                  placeholder="Search today's tasks..."
                  className="w-full pl-8 pr-7 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  aria-label="Close task search"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchExpanded(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchExpanded(true)}
                aria-label="Search today's tasks"
                title="Search today's tasks"
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            )}

            {categoryFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                {categoryFilter}
                <button
                  type="button"
                  onClick={() => setCategoryFilter('All')}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {priorityFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                {priorityFilter}
                <button
                  type="button"
                  onClick={() => setPriorityFilter('All')}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                {statusFilter}
                <button
                  type="button"
                  onClick={() => setStatusFilter('All')}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {/* Filters & Sort Popover Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFiltersPopover((v) => !v)}
              data-testid="today-filters-popover-btn"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                hasActiveFilters
                  ? 'border-blue-300 bg-blue-50/70 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              Filters &amp; Sort
            </button>

            {showFiltersPopover && (
              <div className="absolute right-0 mt-2 z-30 w-64 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Filter &amp; sort tasks
                  </span>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-xs text-blue-600 hover:underline cursor-pointer"
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    aria-label="Filter by category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="All">All categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    aria-label="Filter by priority"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="All">All priorities</option>
                    <option value="High">High</option>
                    <option value="Med">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Status
                  </label>
                  <select
                    aria-label="Filter by status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="All">All statuses</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Skipped">Skipped</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Sort order
                  </label>
                  <select
                    aria-label="Sort tasks by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="time">Start time</option>
                    <option value="priority">Priority</option>
                    <option value="duration">Duration</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Cards List or Contextual Empty State */}
      {filteredTasks.length === 0 ? (
        dayTasks.length === 0 && !hasActiveFilters ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-2.5">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Nothing planned for today
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add a task above, press N, or start from a template
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onOpenNewTaskModal?.()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-400" />
                Add a task
              </button>
              <button
                type="button"
                onClick={() => setActiveNav('goals')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-slate-400" />
                Use a template
              </button>
            </div>
          </div>
        ) : (
          <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No tasks match these filters
            </div>
            <div>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const { masterId } = parseTaskIdentity(task);
            const actualMins = actualByOccurrenceKey.get(`${masterId}::${task.date}`) || 0;
            const catColor = getCategoryColor(task.category);
            const isOverlapping = overlappingIds.has(task.id);
            const isRunningThisTask = activeTimer?.taskId === masterId;
            const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
            const rule = getEffectiveRecurrenceRule(task);

            const metadataChips: React.ReactNode[] = [];
            if (task.priority === 'High') {
              metadataChips.push(
                <span
                  key="prio"
                  className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
                  High
                </span>
              );
            }
            if (task.subtasks.length > 0) {
              metadataChips.push(
                <span key="sub" className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  ☑ {completedSubtasks}/{task.subtasks.length}
                </span>
              );
            }
            if (rule) {
              metadataChips.push(
                <span
                  key="rec"
                  title="Recurring task"
                  className="inline-flex items-center gap-0.5 text-xs text-slate-400 dark:text-slate-500"
                >
                  <Repeat className="w-3 h-3" />
                </span>
              );
            }
            if (actualMins > 0) {
              metadataChips.push(
                <span key="actual" className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {actualMins}m logged
                </span>
              );
            }
            if (task.tags.length > 0) {
              metadataChips.push(
                <span key="tag" className="text-xs text-slate-500 dark:text-slate-400">
                  #{task.tags[0]}
                </span>
              );
            }
            if (task.googleEventId || task.googleSyncState === 'synced') {
              metadataChips.push(
                <span
                  key="gcal"
                  title="Synced with Google Calendar"
                  className="inline-flex items-center text-xs text-slate-400 dark:text-slate-500"
                >
                  <Calendar className="w-3 h-3" />
                </span>
              );
            }
            if (task.fixedTime) {
              metadataChips.push(
                <span key="fixed" title="Fixed appointment" className="text-xs text-slate-400">
                  <Lock className="w-3 h-3" />
                </span>
              );
            }

            const visibleMetadata = metadataChips.slice(0, 2);
            const hiddenCount = Math.max(0, metadataChips.length - 2);

            return (
              <div
                key={task.id}
                data-testid={`task-card-${task.id}`}
                className={`group relative rounded-xl bg-white dark:bg-slate-900 border transition-all ${
                  density === 'compact' ? 'px-3.5 py-2' : 'px-4 py-3'
                } ${
                  isRunningThisTask
                    ? 'border-blue-500 ring-1 ring-blue-500/20'
                    : isOverlapping
                    ? 'border-amber-300 dark:border-amber-700/80'
                    : 'border-slate-200/80 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700'
                } ${task.status === 'Completed' ? 'opacity-65' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Checkbox + Category Dot + Title + Time Range */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => cycleStatus(task)}
                      aria-label={`Mark "${task.title}" as ${
                        task.status === 'Completed' ? 'To Do' : 'Completed'
                      }`}
                      className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer shrink-0"
                    >
                      {task.status === 'Completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : task.status === 'Skipped' ? (
                        <SkipForward className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: catColor }}
                      title={`Category: ${task.category}`}
                    />

                    <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <button
                        type="button"
                        onClick={() => onEditTask(task.id)}
                        className={`text-left text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate cursor-pointer ${
                          task.status === 'Completed'
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </button>

                      <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                        {task.start ? `${task.start}–${task.end || ''}` : `${task.estimatedMinutes}m`}
                      </span>

                      {isOverlapping && (
                        <span
                          className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
                          title="Overlaps with another scheduled task"
                        >
                          <AlertCircle className="w-3 h-3" />
                          Overlap
                        </span>
                      )}

                      {visibleMetadata.length > 0 && (
                        <div className="inline-flex items-center gap-2">
                          {visibleMetadata}
                          {hiddenCount > 0 && (
                            <button
                              type="button"
                              onClick={() => onEditTask(task.id)}
                              className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 tabular-nums cursor-pointer"
                              title="Click to view all task details"
                            >
                              +{hiddenCount}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Action Buttons (hover/focus on desktop, compact on mobile) */}
                  <div className="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    {task.status !== 'Completed' && task.status !== 'Skipped' && (
                      <>
                        <button
                          type="button"
                          onClick={() => requestStartTimer(masterId, 'stopwatch')}
                          title="Start Live Focus Stopwatch"
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isRunningThisTask && activeTimer?.mode === 'stopwatch'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span className="hidden sm:inline">Focus</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => requestStartTimer(masterId, 'pomodoro')}
                          title="Start 25m Pomodoro Timer"
                          className={`hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isRunningThisTask && activeTimer?.mode === 'pomodoro'
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <Timer className="w-3 h-3" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenNoteForTask(task)}
                      title="Open Linked Note"
                      className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditTask(task.id)}
                      title="More task options & details"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
