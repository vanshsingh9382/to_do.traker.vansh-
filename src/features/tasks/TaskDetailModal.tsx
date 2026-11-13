import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Play,
  Timer,
  Clock,
  CheckSquare,
  Square,
  ExternalLink,
  FileText,
  Sparkles,
  Repeat,
  Bell,
  Calendar,
  Download,
  Target,
  ChevronDown,
  ChevronRight,
  Flag,
} from 'lucide-react';
import {
  Priority,
  RecurrenceEndType,
  RecurrenceRule,
  Task,
  TaskStatus,
} from '../../types';
import { useDayForgeStore } from '../../store/useDayForgeStore';
import {
  expandTasksForDate,
  getEffectiveRecurrenceRule,
  parseTaskIdentity,
} from '../../lib/recurrenceEngine';
import { findNearestFreeSlots } from '../../lib/phase3Engine';
import {
  buildGoogleCalendarTemplateUrl,
  exportTasksToICS,
} from '../../lib/googleCalendar';
import { useUIPreferencesStore } from '../../store/useUIPreferencesStore';

interface TaskDetailModalProps {
  taskId: string | null;
  isOpen: boolean;
  initialDate?: string;
  initialStartTime?: string;
  initialImportant?: boolean;
  initialUrgent?: boolean;
  onClose: () => void;
  onOpenNoteForTask: (task: Task) => void;
}

const WEEKDAY_LABELS = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
];

const REMINDER_PRESETS = [
  { value: 0, label: 'At start time' },
  { value: 5, label: '5 min before' },
  { value: 10, label: '10 min before' },
  { value: 15, label: '15 min before' },
  { value: 30, label: '30 min before' },
  { value: 60, label: '1 hr before' },
];

function summarizeRecurrence(rule?: RecurrenceRule): string {
  if (!rule) return 'Does not repeat';
  if (rule.frequency === 'daily') return 'Every day';
  if (rule.frequency === 'weekdays') return 'Weekdays (Mon–Fri)';
  if (rule.frequency === 'weekly') return 'Weekly on chosen days';
  if (rule.frequency === 'every_n_days') return `Every ${rule.interval || 2} days`;
  if (rule.frequency === 'every_n_weeks') return `Every ${rule.interval || 2} weeks`;
  return 'Recurring';
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  isOpen,
  initialDate,
  initialStartTime,
  initialImportant,
  initialUrgent,
  onClose,
  onOpenNoteForTask,
}) => {
  const tasks = useDayForgeStore((s) => s.tasks);
  const goals = useDayForgeStore((s) => s.goals);
  const timeLogs = useDayForgeStore((s) => s.timeLogs);
  const googleEvents = useDayForgeStore((s) => s.googleEvents);
  const externalEvents = useDayForgeStore((s) => s.externalEvents);
  const categories = useDayForgeStore((s) => s.categories);
  const settings = useDayForgeStore((s) => s.settings);
  const selectedDate = useDayForgeStore((s) => s.selectedDate);

  const addTask = useDayForgeStore((s) => s.addTask);
  const updateTask = useDayForgeStore((s) => s.updateTask);
  const deleteTask = useDayForgeStore((s) => s.deleteTask);
  const addSubtask = useDayForgeStore((s) => s.addSubtask);
  const toggleSubtask = useDayForgeStore((s) => s.toggleSubtask);
  const deleteSubtask = useDayForgeStore((s) => s.deleteSubtask);
  const addManualTimeLog = useDayForgeStore((s) => s.addManualTimeLog);
  const requestStartTimer = useDayForgeStore((s) => s.requestStartTimer);

  const openSections = useUIPreferencesStore((s) => s.taskDetailOpenSections);
  const toggleSection = useUIPreferencesStore((s) => s.toggleTaskDetailSection);

  const parsedIdentity = useMemo(
    () =>
      taskId
        ? parseTaskIdentity(taskId)
        : { masterId: '', occurrenceDate: initialDate || selectedDate },
    [taskId, initialDate, selectedDate]
  );

  const baseTask = useMemo(
    () =>
      parsedIdentity.masterId
        ? tasks.find((t) => t.id === parsedIdentity.masterId)
        : undefined,
    [tasks, parsedIdentity.masterId]
  );

  const targetOccurrenceDate =
    parsedIdentity.occurrenceDate || initialDate || selectedDate;

  const existingTask = useMemo(() => {
    if (!baseTask) return undefined;
    const occs = expandTasksForDate([baseTask], targetOccurrenceDate);
    return occs[0] || baseTask;
  }, [baseTask, targetOccurrenceDate]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');
  const [tagsInput, setTagsInput] = useState('');
  const [priority, setPriority] = useState<Priority>('Med');
  const [date, setDate] = useState(initialDate || selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [fixedTime, setFixedTime] = useState(false);
  const [important, setImportant] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [goalId, setGoalId] = useState<string>('');

  // Recurrence state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recFrequency, setRecFrequency] = useState<RecurrenceRule['frequency']>('daily');
  const [recInterval, setRecInterval] = useState<number>(1);
  const [recDaysOfWeek, setRecDaysOfWeek] = useState<number[]>([1, 3, 5]);
  const [recEndType, setRecEndType] = useState<RecurrenceEndType>('never');
  const [recEndDate, setRecEndDate] = useState<string>('');
  const [recEndCount, setRecEndCount] = useState<number>(10);

  // Reminders state
  const [reminders, setReminders] = useState<number[]>([10]);
  const [customReminderMinutes, setCustomReminderMinutes] = useState('');

  // Recurring scope choice ('this' | 'all')
  const [editScope, setEditScope] = useState<'this' | 'all'>('this');
  const [showDeleteConfirmScope, setShowDeleteConfirmScope] = useState(false);

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [manualMinutesInput, setManualMinutesInput] = useState('');

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description);
      setCategory(existingTask.category);
      setTagsInput(existingTask.tags.join(', '));
      setPriority(existingTask.priority);
      setDate(existingTask.date);
      setStartTime(existingTask.start || '09:00');
      setEndTime(existingTask.end || '10:00');
      setEstimatedMinutes(existingTask.estimatedMinutes);
      setStatus(existingTask.status);
      setFixedTime(Boolean(existingTask.fixedTime));
      setImportant(Boolean(existingTask.important));
      setUrgent(Boolean(existingTask.urgent));
      setGoalId(existingTask.goalId || '');
      setReminders(existingTask.reminders ?? [10]);

      const rule = getEffectiveRecurrenceRule(baseTask || existingTask);
      if (rule) {
        setIsRecurring(true);
        setRecFrequency(rule.frequency);
        setRecInterval(rule.interval || 1);
        setRecDaysOfWeek(rule.daysOfWeek || [1, 3, 5]);
        setRecEndType(rule.endType || 'never');
        setRecEndDate(rule.endDate || '');
        setRecEndCount(rule.endCount || 10);
      } else {
        setIsRecurring(false);
      }
      setEditScope('this');
      setShowDeleteConfirmScope(false);
    } else {
      const targetD = initialDate || selectedDate;
      const startT = initialStartTime || '09:00';
      const [h, m] = startT.split(':').map(Number);
      const endTotal = Math.min(
        23 * 60 + 45,
        (h || 9) * 60 + (m || 0) + settings.defaultTaskDurationMinutes
      );
      const endT = `${String(Math.floor(endTotal / 60)).padStart(2, '0')}:${String(
        endTotal % 60
      ).padStart(2, '0')}`;

      setTitle('');
      setDescription('');
      setCategory(categories[0]?.name || 'Work');
      setTagsInput('');
      setPriority('Med');
      setDate(targetD);
      setStartTime(startT);
      setEndTime(endT);
      setEstimatedMinutes(settings.defaultTaskDurationMinutes);
      setStatus('To Do');
      setFixedTime(false);
      setImportant(Boolean(initialImportant));
      setUrgent(Boolean(initialUrgent));
      setGoalId('');
      setIsRecurring(false);
      setRecFrequency('daily');
      setRecInterval(1);
      setRecDaysOfWeek([1, 3, 5]);
      setRecEndType('never');
      setRecEndDate('');
      setRecEndCount(10);
      setReminders([settings.defaultReminderMinutes ?? 10]);
    }
  }, [
    existingTask,
    baseTask,
    isOpen,
    initialDate,
    initialStartTime,
    initialImportant,
    initialUrgent,
    selectedDate,
    categories,
    settings,
  ]);

  const handleStartEndChange = (newStart: string, newEnd: string) => {
    setStartTime(newStart);
    setEndTime(newEnd);
    const [sh, sm] = newStart.split(':').map(Number);
    const [eh, em] = newEnd.split(':').map(Number);
    const diff = eh * 60 + em - (sh * 60 + sm);
    if (diff > 0) {
      setEstimatedMinutes(diff);
    }
  };

  const freeSlots = useMemo(
    () =>
      findNearestFreeSlots(
        date,
        estimatedMinutes || 30,
        tasks,
        [...googleEvents, ...externalEvents],
        settings,
        baseTask?.id
      ),
    [date, estimatedMinutes, tasks, googleEvents, externalEvents, settings, baseTask?.id]
  );

  const taskLogs = useMemo(
    () =>
      baseTask
        ? timeLogs.filter(
            (l) =>
              l.taskId === baseTask.id &&
              (!l.occurrenceDate || l.occurrenceDate === date)
          )
        : [],
    [timeLogs, baseTask, date]
  );

  const actualTotalMinutes = useMemo(
    () => taskLogs.reduce((acc, l) => acc + l.durationMinutes, 0),
    [taskLogs]
  );

  if (!isOpen) return null;

  const buildRecurrenceRule = (): RecurrenceRule | undefined => {
    if (!isRecurring) return undefined;
    return {
      frequency: recFrequency,
      interval: Math.max(1, recInterval || 1),
      daysOfWeek: recFrequency === 'weekly' ? recDaysOfWeek : undefined,
      endType: recEndType,
      endDate: recEndType === 'on_date' ? recEndDate || undefined : undefined,
      endCount: recEndType === 'after_count' ? Math.max(1, recEndCount || 1) : undefined,
    };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const builtRule = buildRecurrenceRule();
    const isExistingRecurring = Boolean(baseTask && getEffectiveRecurrenceRule(baseTask));

    if (baseTask && existingTask) {
      updateTask(
        baseTask.id,
        {
          title: title.trim(),
          description,
          category,
          tags,
          priority,
          date,
          start: startTime,
          end: endTime,
          estimatedMinutes: Number(estimatedMinutes) || 30,
          status,
          fixedTime,
          important,
          urgent,
          goalId: goalId || undefined,
          recurrenceRule: builtRule,
          recurrence: builtRule ? builtRule.frequency : 'none',
          reminders,
        },
        isExistingRecurring ? editScope : undefined,
        existingTask.date
      );
      onClose();
    } else {
      addTask({
        title: title.trim(),
        description,
        category,
        tags,
        priority,
        date,
        start: startTime,
        end: endTime,
        estimatedMinutes: Number(estimatedMinutes) || 30,
        status,
        subtasks: [],
        fixedTime,
        important,
        urgent,
        goalId: goalId || undefined,
        recurrenceRule: builtRule,
        recurrence: builtRule ? builtRule.frequency : 'none',
        reminders,
      });
      onClose();
    }
  };

  const handleAddSubtask = () => {
    if (!baseTask || !newSubtaskTitle.trim()) return;
    addSubtask(baseTask.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleLogManualTime = () => {
    if (!baseTask) return;
    const mins = Number(manualMinutesInput);
    if (!mins || mins <= 0) return;
    addManualTimeLog(baseTask.id, mins, date, 'manual');
    setManualMinutesInput('');
  };

  const toggleReminderOffset = (mins: number) => {
    if (reminders.includes(mins)) {
      setReminders(reminders.filter((m) => m !== mins));
    } else {
      setReminders([...reminders, mins].sort((a, b) => a - b));
    }
  };

  const handleAddCustomReminder = () => {
    const mins = Number(customReminderMinutes);
    if (Number.isNaN(mins) || mins < 0) return;
    if (!reminders.includes(mins)) {
      setReminders([...reminders, mins].sort((a, b) => a - b));
    }
    setCustomReminderMinutes('');
  };

  const toggleWeekday = (day: number) => {
    if (recDaysOfWeek.includes(day)) {
      if (recDaysOfWeek.length > 1) {
        setRecDaysOfWeek(recDaysOfWeek.filter((d) => d !== day));
      }
    } else {
      setRecDaysOfWeek([...recDaysOfWeek, day]);
    }
  };

  const handleDownloadTaskICS = () => {
    if (!baseTask) return;
    const content = exportTasksToICS([baseTask], settings.timezone);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseTask.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'task'}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isExistingRecurring = Boolean(baseTask && getEffectiveRecurrenceRule(baseTask));

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={existingTask ? 'Edit Task Drawer' : 'Create New Task Drawer'}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl h-full flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drawer Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {existingTask ? 'Task Details' : 'New Task'}
            </h2>
            {isExistingRecurring && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                <Repeat className="w-3 h-3" />
                Recurring
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* ESSENTIALS AT TOP */}
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Deep Work: System Architecture Review"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Skipped">Skipped</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => handleStartEndChange(e.target.value, endTime)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => handleStartEndChange(startTime, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Est. Mins
                </label>
                <input
                  type="number"
                  min={5}
                  max={720}
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {freeSlots.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  <Sparkles className="w-3 h-3" />
                  Free slots:
                </span>
                {freeSlots.map((slot) => (
                  <button
                    key={`${slot.start}-${slot.end}`}
                    type="button"
                    onClick={() => handleStartEndChange(slot.start, slot.end)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-[11px] font-mono transition-colors cursor-pointer"
                  >
                    {slot.start}–{slot.end}
                  </button>
                ))}
              </div>
            )}

            {baseTask && existingTask && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    requestStartTimer(baseTask.id, 'stopwatch');
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Start Focus Stopwatch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    requestStartTimer(baseTask.id, 'pomodoro');
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer"
                >
                  <Timer className="w-3.5 h-3.5" />
                  Start 25m Pomodoro
                </button>
              </div>
            )}
          </div>

          {/* MORE OPTIONS ACCORDION */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              More Options
            </div>

            {/* 1. Priority, Matrix & Tags */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('priority')}
                className="w-full px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Flag className="w-3.5 h-3.5 text-blue-600" />
                  Priority, Matrix &amp; Tags
                </span>
                <span className="flex items-center gap-2 text-[11px] font-normal text-slate-500">
                  {priority}
                  {important ? ' · Imp' : ''}
                  {urgent ? ' · Urg' : ''}
                  {openSections.priority ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>
              {openSections.priority && (
                <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Priority)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <option value="High">High</option>
                        <option value="Med">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="deep-work, client"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={important}
                        onChange={(e) => setImportant(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      Important (Matrix)
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={urgent}
                        onChange={(e) => setUrgent(e.target.checked)}
                        className="rounded border-slate-300 text-rose-600"
                      />
                      Urgent (Matrix)
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fixedTime}
                        onChange={(e) => setFixedTime(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      Fixed Time Appointment
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Repeat (Recurrence Rule) */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('repeat')}
                className="w-full px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Repeat className="w-3.5 h-3.5 text-indigo-600" />
                  Repeat
                </span>
                <span className="flex items-center gap-2 text-[11px] font-normal text-slate-500">
                  {isRecurring ? summarizeRecurrence(buildRecurrenceRule()) : 'Does not repeat'}
                  {openSections.repeat ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>
              {openSections.repeat && (
                <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    Repeat this task
                  </label>

                  {isRecurring && (
                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            Repeat Pattern
                          </label>
                          <select
                            value={recFrequency}
                            onChange={(e) =>
                              setRecFrequency(e.target.value as RecurrenceRule['frequency'])
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekdays">Weekdays (Mon–Fri)</option>
                            <option value="weekly">Weekly on chosen days</option>
                            <option value="every_n_days">Every N days</option>
                            <option value="every_n_weeks">Every N weeks</option>
                          </select>
                        </div>

                        {(recFrequency === 'every_n_days' || recFrequency === 'every_n_weeks') && (
                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">
                              Every N {recFrequency === 'every_n_days' ? 'days' : 'weeks'}
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={90}
                              value={recInterval}
                              onChange={(e) => setRecInterval(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                            />
                          </div>
                        )}
                      </div>

                      {recFrequency === 'weekly' && (
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            Days of Week
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {WEEKDAY_LABELS.map((w) => {
                              const active = recDaysOfWeek.includes(w.day);
                              return (
                                <button
                                  key={w.day}
                                  type="button"
                                  onClick={() => toggleWeekday(w.day)}
                                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                                    active
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {w.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            Ends
                          </label>
                          <select
                            value={recEndType}
                            onChange={(e) => setRecEndType(e.target.value as RecurrenceEndType)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                          >
                            <option value="never">Never</option>
                            <option value="on_date">On specific date</option>
                            <option value="after_count">After N occurrences</option>
                          </select>
                        </div>

                        {recEndType === 'on_date' && (
                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={recEndDate}
                              onChange={(e) => setRecEndDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                            />
                          </div>
                        )}

                        {recEndType === 'after_count' && (
                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">
                              Occurrences
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={365}
                              value={recEndCount}
                              onChange={(e) => setRecEndCount(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                            />
                          </div>
                        )}
                      </div>

                      {isExistingRecurring && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
                          <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                            Apply edits to:
                          </span>
                          <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                            <input
                              type="radio"
                              name="editScope"
                              checked={editScope === 'this'}
                              onChange={() => setEditScope('this')}
                            />
                            This occurrence ({date})
                          </label>
                          <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                            <input
                              type="radio"
                              name="editScope"
                              checked={editScope === 'all'}
                              onChange={() => setEditScope('all')}
                            />
                            This &amp; all future
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Reminders */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('reminders')}
                className="w-full px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  Reminders
                </span>
                <span className="flex items-center gap-2 text-[11px] font-normal text-slate-500">
                  {reminders.length > 0 ? `${reminders.length} active` : 'None'}
                  {openSections.reminders ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>
              {openSections.reminders && (
                <div className="p-4 space-y-2.5 bg-white dark:bg-slate-900">
                  <div className="flex flex-wrap gap-1.5">
                    {REMINDER_PRESETS.map((preset) => {
                      const active = reminders.includes(preset.value);
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => toggleReminderOffset(preset.value)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                            active
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      value={customReminderMinutes}
                      onChange={(e) => setCustomReminderMinutes(e.target.value)}
                      placeholder="Custom mins before..."
                      className="w-44 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomReminder}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-medium cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Subtasks */}
            {baseTask && existingTask && (
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('subtasks')}
                  className="w-full px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Subtasks
                  </span>
                  <span className="flex items-center gap-2 text-[11px] font-normal text-slate-500">
                    {existingTask.subtasks.filter((s) => s.completed).length}/
                    {existingTask.subtasks.length}
                    {openSections.subtasks ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </span>
                </button>
                {openSections.subtasks && (
                  <div className="p-4 space-y-2.5 bg-white dark:bg-slate-900">
                    <div className="space-y-1.5">
                      {existingTask.subtasks.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60"
                        >
                          <button
                            type="button"
                            onClick={() => toggleSubtask(baseTask.id, st.id)}
                            className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 text-left flex-1 cursor-pointer"
                          >
                            {st.completed ? (
                              <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className={st.completed ? 'line-through text-slate-400' : ''}>
                              {st.title}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSubtask(baseTask.id, st.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubtask();
                          }
                        }}
                        placeholder="Add a subtask..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddSubtask}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-medium cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. Linked Goal */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('goal')}
                className="w-full px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-purple-600" />
                  Goal Link
                </span>
                <span className="flex items-center gap-2 text-[11px] font-normal text-slate-500">
                  {goals.find((g) => g.id === goalId)?.title || 'None'}
                  {openSections.goal ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>
              {openSections.goal && (
                <div className="p-4 bg-white dark:bg-slate-900">
                  <select
                    value={goalId}
                    onChange={(e) => setGoalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="">No Linked Goal</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        🎯 {g.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 6. Google Calendar & .ICS */}
            {baseTask && existingTask && (
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('google')}
                  className="w-full px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Google Calendar &amp; .ICS
                  </span>
                  <span className="flex items-center gap-2 text-[11px] font-normal text-slate-500">
                    {existingTask.googleEventId ? 'Synced' : 'Export / Link'}
                    {openSections.google ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </span>
                </button>
                {openSections.google && (
                  <div className="p-4 space-y-2.5 bg-white dark:bg-slate-900">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={buildGoogleCalendarTemplateUrl(existingTask, settings.timezone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open in Google Calendar
                      </a>
                      <button
                        type="button"
                        onClick={handleDownloadTaskICS}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export .ICS
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. Notes & Description */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('notes')}
                className="w-full px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Notes &amp; Description
                </span>
                <span className="flex items-center gap-2 text-[11px] font-normal text-slate-500">
                  {description ? 'Has description' : 'Empty'}
                  {openSections.notes ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>
              {openSections.notes && (
                <div className="p-4 space-y-2.5 bg-white dark:bg-slate-900">
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Key deliverables, links, or acceptance criteria..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                  />
                  {baseTask && existingTask && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenNoteForTask(existingTask);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-medium cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Open Side-by-Side Note
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 8. Time Log */}
            {baseTask && existingTask && (
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('timelog')}
                  className="w-full px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    Time Log
                  </span>
                  <span className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                    {actualTotalMinutes}m / {estimatedMinutes}m
                    {openSections.timelog ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </span>
                </button>
                {openSections.timelog && (
                  <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (actualTotalMinutes / Math.max(1, estimatedMinutes)) * 100
                            )
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <input
                        type="number"
                        min={1}
                        max={600}
                        value={manualMinutesInput}
                        onChange={(e) => setManualMinutesInput(e.target.value)}
                        placeholder="+ Manual mins"
                        className="w-36 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleLogManualTime}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer"
                      >
                        Log Time
                      </button>
                    </div>

                    {taskLogs.length > 0 && (
                      <div className="space-y-1 max-h-28 overflow-y-auto pt-1">
                        {taskLogs.map((l) => (
                          <div
                            key={l.id}
                            className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 py-1 px-2 rounded bg-slate-50 dark:bg-slate-800"
                          >
                            <span>
                              <strong className="font-mono">{l.durationMinutes}m</strong> ({l.type}) —{' '}
                              {l.startedAt.slice(0, 10)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            {baseTask && existingTask ? (
              isExistingRecurring ? (
                showDeleteConfirmScope ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        deleteTask(baseTask.id, 'this', existingTask.date);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold cursor-pointer"
                    >
                      This Occurrence
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteTask(baseTask.id, 'all', existingTask.date);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      All Occurrences
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirmScope(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete...
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    deleteTask(baseTask.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Task
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                {existingTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
