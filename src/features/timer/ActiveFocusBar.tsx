import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Square,
  Flame,
  Maximize2,
  X,
  CheckSquare,
  Square as SquareIcon,
} from 'lucide-react';
import { useDayForgeStore } from '../../store/useDayForgeStore';

export const ActiveFocusBar: React.FC = () => {
  const activeTimer = useDayForgeStore((s) => s.activeTimer);
  const tasks = useDayForgeStore((s) => s.tasks);
  const notes = useDayForgeStore((s) => s.notes);
  const settings = useDayForgeStore((s) => s.settings);
  const selectedDate = useDayForgeStore((s) => s.selectedDate);
  const pauseTimer = useDayForgeStore((s) => s.pauseTimer);
  const resumeTimer = useDayForgeStore((s) => s.resumeTimer);
  const stopTimerAndLog = useDayForgeStore((s) => s.stopTimerAndLog);
  const checkPomodoroCompletion = useDayForgeStore((s) => s.checkPomodoroCompletion);
  const requestStartTimer = useDayForgeStore((s) => s.requestStartTimer);
  const toggleSubtask = useDayForgeStore((s) => s.toggleSubtask);
  const getOrCreateTaskNote = useDayForgeStore((s) => s.getOrCreateTaskNote);
  const updateNote = useDayForgeStore((s) => s.updateNote);
  const isZenMode = useDayForgeStore((s) => s.isZenMode);
  const setZenMode = useDayForgeStore((s) => s.setZenMode);

  const [nowMs, setNowMs] = useState(() => Date.now());
  const [zenScratchpad, setZenScratchpad] = useState('');

  useEffect(() => {
    if (!activeTimer?.isRunning) return;
    const interval = setInterval(() => {
      setNowMs(Date.now());
      checkPomodoroCompletion();
    }, 500);
    return () => clearInterval(interval);
  }, [activeTimer?.isRunning, checkPomodoroCompletion]);

  const task = activeTimer ? tasks.find((t) => t.id === activeTimer.taskId) : undefined;
  const fallbackTask =
    task ||
    tasks.find(
      (t) =>
        t.date === selectedDate &&
        (t.status === 'In Progress' || t.status === 'To Do')
    ) ||
    tasks[0];

  const linkedNote = fallbackTask?.linkedNoteId
    ? notes.find((n) => n.id === fallbackTask.linkedNoteId)
    : notes.find((n) => n.linkedTaskId === fallbackTask?.id);

  useEffect(() => {
    if (linkedNote) {
      setZenScratchpad(linkedNote.markdown);
    } else {
      setZenScratchpad('');
    }
  }, [linkedNote?.id]);

  if (!activeTimer && !isZenMode) return null;

  let elapsedSeconds = 0;
  if (activeTimer) {
    const runningDeltaSeconds =
      activeTimer.isRunning && activeTimer.startedAtTimestamp
        ? Math.max(0, Math.floor((nowMs - activeTimer.startedAtTimestamp) / 1000))
        : 0;
    elapsedSeconds = activeTimer.accumulatedSeconds + runningDeltaSeconds;
  }

  let displaySeconds = elapsedSeconds;
  if (activeTimer?.mode === 'pomodoro') {
    const phaseMinutes =
      activeTimer.pomodoroPhase === 'work'
        ? settings.pomodoroWorkMinutes
        : activeTimer.pomodoroPhase === 'shortBreak'
        ? settings.pomodoroShortBreakMinutes
        : settings.pomodoroLongBreakMinutes;
    const remaining = phaseMinutes * 60 - elapsedSeconds;
    displaySeconds = Math.max(0, remaining);
  }

  const hrs = Math.floor(displaySeconds / 3600);
  const mins = Math.floor((displaySeconds % 3600) / 60);
  const secs = displaySeconds % 60;

  const formattedClock =
    hrs > 0
      ? `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const handleSaveZenNote = (val: string) => {
    setZenScratchpad(val);
    if (!fallbackTask) return;
    const noteObj = linkedNote || getOrCreateTaskNote(fallbackTask.id);
    updateNote(noteObj.id, { markdown: val });
  };

  return (
    <>
      {/* Slim ~40px Active Focus Bar (shown only while a timer runs) */}
      {activeTimer && (
        <div
          className="bg-slate-900 dark:bg-blue-950 text-white border-b border-slate-800 px-4 h-10 flex items-center justify-between gap-3 shadow-xs transition-all"
          data-testid="active-focus-bar"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              {activeTimer.isRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  activeTimer.isRunning ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-300 shrink-0">
              {activeTimer.mode === 'pomodoro'
                ? `Pomodoro · ${activeTimer.pomodoroPhase}`
                : 'Focus'}
            </span>
            <span className="text-xs font-medium truncate text-slate-100">
              {task?.title || 'Focused Session'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className="font-mono text-sm font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-emerald-400 tabular-nums"
              aria-live="polite"
            >
              {formattedClock}
            </div>

            {activeTimer.isRunning ? (
              <button
                type="button"
                onClick={pauseTimer}
                title="Pause Timer (P)"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors cursor-pointer"
              >
                <Pause className="w-3 h-3" />
                <span className="hidden sm:inline">Pause</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={resumeTimer}
                title="Resume Timer (P)"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-medium transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3" />
                <span className="hidden sm:inline">Resume</span>
              </button>
            )}

            <button
              type="button"
              onClick={stopTimerAndLog}
              title="Stop & Log Focus Time"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
              Save
            </button>

            <button
              type="button"
              onClick={() => setZenMode(true)}
              title="Open Focus / Zen Mode (F)"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="hidden md:inline">Zen</span>
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Focus / Zen Mode Overlay */}
      {isZenMode && (
        <div
          className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Distraction-Free Focus Zen Mode"
          data-testid="zen-mode-overlay"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  DayForge Zen Focus Mode
                </div>
                <div className="text-[11px] text-slate-400">
                  Distractions hidden · Press F or Esc to exit
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setZenMode(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
              Exit Zen Mode (Esc)
            </button>
          </div>

          <div className="max-w-4xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 mb-2">
                  {activeTimer?.mode === 'pomodoro'
                    ? `Pomodoro · ${activeTimer.pomodoroPhase}`
                    : 'Deep Work Session'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {fallbackTask?.title || 'Deep Work Session'}
                </h1>
                {fallbackTask && (
                  <p className="text-xs text-slate-400 mt-1">
                    {fallbackTask.category} · {fallbackTask.start || 'Flex'} –{' '}
                    {fallbackTask.end || ''} ({fallbackTask.estimatedMinutes}m est.)
                  </p>
                )}
              </div>

              <div className="font-mono text-6xl sm:text-7xl font-black tracking-tight text-emerald-400 tabular-nums">
                {formattedClock}
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {activeTimer ? (
                  <>
                    {activeTimer.isRunning ? (
                      <button
                        type="button"
                        onClick={pauseTimer}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm cursor-pointer"
                      >
                        <Pause className="w-4 h-4" />
                        Pause (P)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={resumeTimer}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm cursor-pointer"
                      >
                        <Play className="w-4 h-4" />
                        Resume (P)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={stopTimerAndLog}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      Stop &amp; Save Log
                    </button>
                  </>
                ) : (
                  fallbackTask && (
                    <button
                      type="button"
                      onClick={() => requestStartTimer(fallbackTask.id, 'stopwatch')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                      Start Focus Timer
                    </button>
                  )
                )}
              </div>

              {fallbackTask && fallbackTask.subtasks.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-left">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Subtasks ({fallbackTask.subtasks.filter((s) => s.completed).length}/
                    {fallbackTask.subtasks.length})
                  </div>
                  <div className="space-y-1.5">
                    {fallbackTask.subtasks.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => toggleSubtask(fallbackTask.id, st.id)}
                        className="w-full flex items-center gap-2.5 text-left text-xs py-1 text-slate-200 hover:text-white cursor-pointer"
                      >
                        {st.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <SquareIcon className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className={st.completed ? 'line-through text-slate-500' : ''}>
                          {st.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Focus Scratchpad Note
                </span>
                <span className="text-[11px] text-emerald-400">Auto-saved to Notes</span>
              </div>
              <textarea
                rows={10}
                value={zenScratchpad}
                onChange={(e) => handleSaveZenNote(e.target.value)}
                placeholder="Jot down thoughts, blockers, or distractions here without leaving Focus Mode..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-500">
            Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300">P</kbd>{' '}
            Pause/Resume ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300">F</kbd> Exit Zen
          </div>
        </div>
      )}
    </>
  );
};
