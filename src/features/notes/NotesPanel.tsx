import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
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
  ChevronDown,
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
        `## Focus Plan (${selectedDate})\n- [ ] Top priority outcome\n- [ ] Key blockers\n\n### Reflection\n`
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden relative">
      {/* Slim Header: Note Switcher Drawer Button + Daily Note Quick Button + New Note */}
      <div className="px-3.5 py-2.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={() => setShowNotesListDrawer((v) => !v)}
            data-testid="notes-switcher-btn"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-blue-400 transition-colors truncate cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate max-w-[140px]">
              {activeNote ? activeNote.title : 'All Notes'}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
              {notes.length}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={handleOpenDailyNote}
            title={`Jump to ${selectedDate} Daily Note`}
            className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
              previewMode
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {previewMode ? (
              <>
                <Edit3 className="w-3 h-3" />
                Edit
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                Preview
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCreateNewNote}
            title="Create New Note"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            New
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
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Browse Notes ({filteredNotes.length})
              </span>
              <button
                type="button"
                onClick={() => setShowNotesListDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes by title, content, or tag..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {folders.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFolderFilter(f)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    folderFilter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredNotes.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
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
                        ? 'bg-blue-50/90 dark:bg-blue-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {note.pinned && (
                          <Pin className="w-3 h-3 text-amber-500 shrink-0 fill-amber-500" />
                        )}
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {note.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>{note.folder}</span>
                        <span>•</span>
                        <span className="font-mono">
                          {note.linkedDate || note.updatedAt.slice(0, 10)}
                        </span>
                        {note.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="truncate">#{note.tags[0]}</span>
                          </>
                        )}
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
                        className="p-1 text-slate-400 hover:text-amber-500 cursor-pointer"
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
      <div className="flex-1 flex flex-col p-3.5 space-y-2.5 overflow-y-auto">
        <input
          type="text"
          value={title}
          onFocus={() => setIsEditorFocused(true)}
          onChange={(e) => {
            setTitle(e.target.value);
            handleSaveCurrent(e.target.value);
          }}
          placeholder="Note title..."
          className="w-full text-sm font-bold bg-transparent text-slate-900 dark:text-slate-100 border-b border-transparent focus:border-slate-200 dark:focus:border-slate-700 pb-1 focus:outline-none"
        />

        {/* Compact Formatting & Metadata Toolbar (Shown when editor is focused or in Write mode on hover) */}
        {!previewMode && (
          <div
            className={`flex flex-wrap items-center justify-between gap-1.5 py-1 border-b border-slate-100 dark:border-slate-800 transition-opacity ${
              isEditorFocused ? 'opacity-100' : 'opacity-75 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => insertSnippet('## Section Heading\n')}
                title="Insert Heading"
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('**bold text**')}
                title="Insert Bold"
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('*italic text*')}
                title="Insert Italic"
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('- Bullet item')}
                title="Insert Bullet List"
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('- [ ] Action item')}
                title="Insert Checklist"
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('> Key takeaway')}
                title="Insert Quote"
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('```\ncode block\n```')}
                title="Insert Code Block"
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Subtle Folder & Task Link selectors */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-700">
                <Folder className="w-3 h-3 text-slate-400" />
                <input
                  type="text"
                  value={folder}
                  onChange={(e) => {
                    setFolder(e.target.value);
                    handleSaveCurrent(undefined, undefined, e.target.value);
                  }}
                  placeholder="Folder"
                  className="w-14 bg-transparent text-[10px] text-slate-700 dark:text-slate-300 focus:outline-none"
                />
              </div>

              <select
                value={linkedTaskId}
                onChange={(e) => {
                  setLinkedTaskId(e.target.value);
                  handleSaveCurrent(undefined, undefined, undefined, undefined, e.target.value);
                }}
                aria-label="Link note to task"
                className="max-w-[120px] bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 focus:outline-none truncate"
              >
                <option value="">Link Task...</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.date})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Editor or Markdown Preview */}
        {previewMode ? (
          <div className="prose prose-sm dark:prose-invert max-w-none flex-1 overflow-y-auto p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs leading-relaxed space-y-1.5">
            {(markdown || '*No markdown content yet.*').split('\n').map((line, idx) => {
              if (line.startsWith('### ')) {
                return (
                  <h4 key={idx} className="text-xs font-bold text-slate-900 dark:text-white pt-1">
                    {line.slice(4)}
                  </h4>
                );
              }
              if (line.startsWith('## ')) {
                return (
                  <h3 key={idx} className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                    {line.slice(3)}
                  </h3>
                );
              }
              if (line.startsWith('# ')) {
                return (
                  <h2 key={idx} className="text-base font-bold text-slate-900 dark:text-white pt-1">
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
                    className="pl-2.5 border-l-2 border-blue-500 italic text-slate-600 dark:text-slate-300"
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
            placeholder="Write markdown notes, meeting takeaways, or daily thoughts..."
            className="w-full flex-1 min-h-[220px] p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-transparent focus:border-slate-200 dark:focus:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
          />
        )}
      </div>
    </div>
  );
};
