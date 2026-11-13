import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Eye,
  Edit3,
  Folder,
  Bold,
  Italic,
  List,
  CheckSquare,
  Heading2,
  Code,
  Quote,
  Link2,
  X,
} from 'lucide-react';
import { useDayForgeStore } from '../../store/useDayForgeStore';

export const NotesPanel: React.FC = () => {
  const notes = useDayForgeStore((s) => s.notes);
  const tasks = useDayForgeStore((s) => s.tasks);
  const selectedDate = useDayForgeStore((s) => s.selectedDate);
  const activeNoteId = useDayForgeStore((s) => s.activeNoteId);
  const setActiveNoteId = useDayForgeStore((s) => s.setActiveNoteId);
  const createNote = useDayForgeStore((s) => s.createNote);
  const updateNote = useDayForgeStore((s) => s.updateNote);
  const deleteNote = useDayForgeStore((s) => s.deleteNote);
  const togglePinNote = useDayForgeStore((s) => s.togglePinNote);
  const getOrCreateDailyNote = useDayForgeStore((s) => s.getOrCreateDailyNote);

  const [searchQuery, setSearchQuery] = useState('');
  const [folderFilter, setFolderFilter] = useState<string>('All');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [showNotesListDrawer, setShowNotesListDrawer] = useState<boolean>(false);
  const [isEditorFocused, setIsEditorFocused] = useState<boolean>(false);
  const [showFolderPopover, setShowFolderPopover] = useState<boolean>(false);
  const [showTaskLinkPopover, setShowTaskLinkPopover] = useState<boolean>(false);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeNoteId) || notes[0] || null,
    [notes, activeNoteId]
  );

  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [folder, setFolder] = useState('Daily');
  const [tagsInput, setTagsInput] = useState('');
  const [linkedTaskId, setLinkedTaskId] = useState<string>('');

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setMarkdown(activeNote.markdown);
      setFolder(activeNote.folder);
      setTagsInput(activeNote.tags.join(', '));
      setLinkedTaskId(activeNote.linkedTaskId || '');
    } else {
      setTitle(`Daily Reflection — ${selectedDate}`);
      setMarkdown(
        `## Focus plan\n- [ ] Top priority outcome\n- [ ] Key blockers\n\n### Reflection\n`
      );
      setFolder('Daily');
      setTagsInput('daily');
      setLinkedTaskId('');
    }
  }, [activeNote, selectedDate]);

  const folders = useMemo(() => {
    const set = new Set<string>(['Daily', 'Projects', 'Ideas', 'Reviews']);
    notes.forEach((n) => {
      if (n.folder) set.add(n.folder);
    });
    return ['All', ...Array.from(set)];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notes
      .filter((n) => {
        if (folderFilter !== 'All' && n.folder !== folderFilter) return false;
        if (q) {
          const inTitle = n.title.toLowerCase().includes(q);
          const inMd = n.markdown.toLowerCase().includes(q);
          const inTags = n.tags.some((t) => t.toLowerCase().includes(q));
          if (!inTitle && !inMd && !inTags) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [notes, searchQuery, folderFilter]);

  const handleSaveCurrent = (
    overrideTitle?: string,
    overrideMd?: string,
    overrideFolder?: string,
    overrideTags?: string,
    overrideTask?: string
  ) => {
    const finalTitle = (overrideTitle ?? title).trim() || 'Untitled Note';
    const finalMd = overrideMd ?? markdown;
    const finalFolder = overrideFolder ?? folder;
    const finalTags = (overrideTags ?? tagsInput)
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const finalTaskId = overrideTask ?? linkedTaskId;

    if (activeNote) {
      updateNote(activeNote.id, {
        title: finalTitle,
        markdown: finalMd,
        folder: finalFolder,
        tags: finalTags,
        linkedDate: activeNote.linkedDate || selectedDate,
        linkedTaskId: finalTaskId || undefined,
      });
    } else {
      createNote({
        title: finalTitle,
        markdown: finalMd,
        folder: finalFolder,
        tags: finalTags,
        linkedDate: selectedDate,
        linkedTaskId: finalTaskId || undefined,
        pinned: false,
      });
    }
  };

  const handleCreateNewNote = () => {
    const created = createNote({
      title: `Note — ${selectedDate}`,
      markdown: `## Notes\n- `,
      folder: 'Daily',
      tags: ['daily'],
      linkedDate: selectedDate,
      pinned: false,
    });
    setActiveNoteId(created.id);
    setPreviewMode(false);
    setShowNotesListDrawer(false);
  };

  const handleOpenDailyNote = () => {
    const daily = getOrCreateDailyNote(selectedDate);
    setActiveNoteId(daily.id);
    setShowNotesListDrawer(false);
  };

  const insertSnippet = (snippet: string) => {
    const updated = `${markdown}${markdown.endsWith('\n') || !markdown ? '' : '\n'}${snippet}`;
    setMarkdown(updated);
    handleSaveCurrent(undefined, updated);
  };

  const isTodayNoteActive = Boolean(
    activeNote && activeNote.linkedDate === selectedDate && !showNotesListDrawer
  );

  const linkedTaskTitle = useMemo(() => {
    if (!linkedTaskId) return null;
    return tasks.find((t) => t.id === linkedTaskId)?.title || null;
  }, [tasks, linkedTaskId]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden relative">
      {/* 4.1g Header: Segmented switch "Today | All notes (N)" on left + Preview (eye) and New (+) icon buttons on right */}
      <div className="px-3.5 py-2.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-900/50">
        <div
          className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
          role="group"
          aria-label="Notes view switch"
        >
          <button
            type="button"
            onClick={handleOpenDailyNote}
            title={`Open ${selectedDate} daily note`}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isTodayNoteActive
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setShowNotesListDrawer((v) => !v)}
            data-testid="notes-switcher-btn"
            title="Browse all notes"
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer tabular-nums ${
              showNotesListDrawer || !isTodayNoteActive
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All notes ({notes.length})
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            aria-label={previewMode ? 'Edit note' : 'Preview note'}
            title={previewMode ? 'Switch to editor' : 'Preview markdown'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              previewMode
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700'
            }`}
          >
            {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleCreateNewNote}
            aria-label="New note"
            title="New note"
            className="p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Slide-Over / Popover Notes List Drawer (Folders, Tags, Search, Pinned Notes) */}
      {showNotesListDrawer && (
        <div
          className="absolute inset-x-0 top-12 bottom-0 z-30 bg-white dark:bg-slate-900 flex flex-col border-t border-slate-200 dark:border-slate-800 shadow-xl"
          data-testid="notes-list-drawer"
        >
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                All notes ({filteredNotes.length})
              </span>
              <button
                type="button"
                onClick={() => setShowNotesListDrawer(false)}
                aria-label="Close notes list"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {notes.length > 0 && (
              <>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search notes..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                  {folders.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFolderFilter(f)}
                      className={`px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        folderFilter === f
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredNotes.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No notes match your filter.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = activeNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      setActiveNoteId(note.id);
                      setShowNotesListDrawer(false);
                    }}
                    className={`px-3.5 py-2.5 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-2 border-blue-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {note.pinned && (
                          <Pin className="w-3 h-3 text-slate-500 shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {note.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                        <span>{note.folder}</span>
                        <span>·</span>
                        <span>{note.linkedDate || note.updatedAt.slice(0, 10)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinNote(note.id);
                        }}
                        title={note.pinned ? 'Unpin note' : 'Pin note'}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                        }}
                        title="Delete note"
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Active Note Editor / Preview */}
      <div className="flex-1 flex flex-col p-3.5 space-y-2 overflow-y-auto">
        <input
          type="text"
          value={title}
          onFocus={() => setIsEditorFocused(true)}
          onBlur={() => setIsEditorFocused(false)}
          onChange={(e) => {
            setTitle(e.target.value);
            handleSaveCurrent(e.target.value);
          }}
          placeholder="Note title..."
          className="w-full text-sm font-semibold bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none"
        />

        {/* Quiet meta line under the note title: "Folder: Daily · Link task" */}
        <div className="relative flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pb-1.5 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setShowFolderPopover((v) => !v);
              setShowTaskLinkPopover(false);
            }}
            className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <Folder className="w-3 h-3 text-slate-400" />
            <span>Folder: {folder || 'Daily'}</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700">·</span>

          <button
            type="button"
            onClick={() => {
              setShowTaskLinkPopover((v) => !v);
              setShowFolderPopover(false);
            }}
            className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer truncate max-w-[200px]"
          >
            <Link2 className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">
              {linkedTaskTitle ? `Task: ${linkedTaskTitle}` : 'Link task'}
            </span>
          </button>

          {/* Small popover for Folder */}
          {showFolderPopover && (
            <div className="absolute left-0 top-7 z-20 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center gap-1.5">
              <input
                type="text"
                value={folder}
                onChange={(e) => {
                  setFolder(e.target.value);
                  handleSaveCurrent(undefined, undefined, e.target.value);
                }}
                placeholder="Folder name"
                className="w-32 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowFolderPopover(false)}
                className="px-2 py-1 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {/* Small popover for Link task */}
          {showTaskLinkPopover && (
            <div className="absolute left-16 top-7 z-20 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center gap-1.5">
              <select
                value={linkedTaskId}
                onChange={(e) => {
                  setLinkedTaskId(e.target.value);
                  handleSaveCurrent(undefined, undefined, undefined, undefined, e.target.value);
                  setShowTaskLinkPopover(false);
                }}
                aria-label="Link note to task"
                className="max-w-[200px] px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none truncate"
              >
                <option value="">No linked task</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.date})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowTaskLinkPopover(false)}
                className="px-2 py-1 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Formatting toolbar: icons only, dimmed until editor is focused */}
        {!previewMode && (
          <div
            className={`flex items-center gap-0.5 py-0.5 transition-opacity ${
              isEditorFocused ? 'opacity-100' : 'opacity-40 hover:opacity-100'
            }`}
          >
            <button
              type="button"
              onClick={() => insertSnippet('## Section heading\n')}
              title="Heading"
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('**bold text**')}
              title="Bold"
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('*italic text*')}
              title="Italic"
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('- List item')}
              title="Bullet list"
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('- [ ] Action item')}
              title="Checklist"
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('> Key takeaway')}
              title="Quote"
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('```\ncode block\n```')}
              title="Code block"
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Editor or Markdown Preview (normal UI font with comfortable line height; font-mono only for code blocks) */}
        {previewMode ? (
          <div className="flex-1 overflow-y-auto py-1 text-xs leading-relaxed space-y-1.5 font-sans tabular-nums">
            {(markdown || '*No content yet.*').split('\n').map((line, idx) => {
              if (line.startsWith('```')) {
                return (
                  <div
                    key={idx}
                    className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    {line}
                  </div>
                );
              }
              if (line.startsWith('### ')) {
                return (
                  <h4 key={idx} className="text-xs font-semibold text-slate-900 dark:text-white pt-1">
                    {line.slice(4)}
                  </h4>
                );
              }
              if (line.startsWith('## ')) {
                return (
                  <h3 key={idx} className="text-sm font-semibold text-slate-900 dark:text-white pt-1">
                    {line.slice(3)}
                  </h3>
                );
              }
              if (line.startsWith('# ')) {
                return (
                  <h2 key={idx} className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                    {line.slice(2)}
                  </h2>
                );
              }
              if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
                return (
                  <div key={idx} className="flex items-center gap-2 text-slate-500 line-through">
                    <input type="checkbox" checked readOnly className="rounded text-blue-600" />
                    <span>{line.slice(6)}</span>
                  </div>
                );
              }
              if (line.startsWith('- [ ] ')) {
                return (
                  <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <input type="checkbox" checked={false} readOnly className="rounded" />
                    <span>{line.slice(6)}</span>
                  </div>
                );
              }
              if (line.startsWith('- ')) {
                return (
                  <div key={idx} className="flex items-start gap-2 pl-1 text-slate-700 dark:text-slate-200">
                    <span>•</span>
                    <span>{line.slice(2)}</span>
                  </div>
                );
              }
              if (line.startsWith('> ')) {
                return (
                  <blockquote
                    key={idx}
                    className="pl-2.5 border-l-2 border-slate-300 dark:border-slate-700 italic text-slate-600 dark:text-slate-300"
                  >
                    {line.slice(2)}
                  </blockquote>
                );
              }
              return (
                <p key={idx} className="text-slate-700 dark:text-slate-300 min-h-[1em]">
                  {line}
                </p>
              );
            })}
          </div>
        ) : (
          <textarea
            value={markdown}
            onFocus={() => setIsEditorFocused(true)}
            onBlur={() => setIsEditorFocused(false)}
            onChange={(e) => {
              setMarkdown(e.target.value);
              handleSaveCurrent(undefined, e.target.value);
            }}
            placeholder="Write notes, meeting takeaways, or daily thoughts..."
            className="w-full flex-1 min-h-[220px] py-1.5 bg-transparent text-xs font-sans tabular-nums text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
          />
        )}
      </div>
    </div>
  );
};
