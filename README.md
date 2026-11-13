# DayForge — Own Your Time. Build Your Future.

DayForge is a local-first daily time-blocking, recurring task, habit tracking, markdown notes, and real-time analytics workspace.

---

## Phase 4.0 & 4.1: Calm UI / UX Clean-Up & Clarity Pass

### 1. UI Clutter Audit & Clarity Pass Improvements
1. **Desktop Sidebar Navigation (4.0 & 4.1f)**: Fixed header, scrollable middle, and fixed footer so the bottom controls never clip at 700px height. Shows **5 main pinned items** (`Today`, `Calendar`, `Tasks`, `Notes`, `Analytics`) with a soft tinted background and left accent bar (`border-l-2 border-blue-600`) for the active item, a collapsible **More** group, sentence-case **Pinned views** & **Categories** (collapsed by default), and a compact footer with **Settings**, a **?** icon button for *Where is everything?*, and a one-line `Score X · streak Yd`.
2. **Top Header Bar (4.1a)**: Compact date control (`< Fri, 13 Nov >` + `Today` button when off-today; clicking the label opens the date picker), a single solid-blue **New task** primary button, icon-only **Search** (shortcut in tooltip), **Bell**, **Notes toggle**, and **Avatar menu** (housing the **Theme toggle** *Light / Dark / System*, **Local** sync status, and *Account & backup* link).
3. **Greeting Card (4.1b)**: Shows the greeting, `List / Timeline` segmented switch, and `Actions` (`...`) menu without repeating the date. Uses spacing and thin dividers instead of nested boxes for the summary line (`X of Y done · Zh planned · Wh focused · 12h free`) and plain quick-add input (`Add a task... (N for full form)`), where the ghost `Add` button appears only while typing.
4. **Today's Extras Row (4.1c)**: Compact neutral-grey chips with neutral icons (`Habits X/Y`, `Mood & energy`, merged `Daily goal` holding both the daily goal and focus target progress, `Motivation`, and `Unfinished from yesterday`).
5. **Task List, Filter Row & Empty States (4.1d–e)**: Search and `Filters & Sort` are hidden when there are no tasks to act on. When tasks exist, a single slim row shows an icon-only search button (expanding on click) and `Filters & Sort`. Contextual empty states distinguish between an empty day (*"Nothing planned for today"* with *"Add a task"* and *"Use a template"*) and empty filter results (*"No tasks match these filters"* with *"Clear filters"*).
6. **Notes Panel (4.1g)**: Header uses a segmented `Today | All notes (N)` switch on the left and icon-only `Preview` and `New` (`+`) buttons on the right. Under the note title is a quiet meta line (`Folder: Daily · Link task`) with small popovers, followed by an icon-only formatting toolbar dimmed until the editor is focused, and normal UI font (`tabular-nums`) for writing.
7. **Task Detail Drawer, Calendar, All Tasks, Analytics & Settings**: All Settings sections start collapsed by default with neutral-grey icons; Task Detail "More options" opens only *Notes & description* by default; Analytics uses 4 key stat cards + 6 clean tabs.

---

### 2. Where Everything Lives Now (Complete Feature Map)

| Feature (Phases 1–3) | Location in Phase 4.1 | Shortcut |
| :--- | :--- | :--- |
| **Today Plan (List & Timeline)** | Sidebar → **Today** (segmented `List / Timeline` switch) | `G` then `T` |
| **Compact Date Picker & Today Jump** | Top bar left (`< Fri, 13 Nov >`; click date label to open picker) | — |
| **Quick-Add Task & Full Task Drawer** | Today greeting card input, Top bar `New task`, or Mobile `+` button | `Q` or `N` |
| **Theme Toggle (Light / Dark / System) & Sync Status** | Top bar right → **Avatar menu** (also in Settings → Appearance / Account) | — |
| **Task Detail "More Options" (Repeat, Reminders, Subtasks, Goal, Google, Time Log)** | Click any task card → Right-side **Task Detail Drawer** → **More options** accordion | — |
| **Wrap Up Day Ritual (4-Step Wizard)** | Today greeting card → **Actions (⋯)** menu → *Wrap up day ritual* | `W` |
| **Smart Replan ("Replan my day")** | Today greeting card → **Actions (⋯)** menu → *Replan my day* (or click `Xh free` in summary line) | — |
| **AI Schedule Architect** | Today greeting card → **Actions (⋯)** menu → *AI schedule architect* (or Settings → AI Assistant) | — |
| **Daily Goal & Focus Target Progress** | Today page → **"Today's extras"** chip row → **Daily goal** chip popover | — |
| **Today's Habits, Mood & Energy, Motivation, Unfinished** | Today page → **"Today's extras"** chip row (click any chip to open its popover) | — |
| **Live Focus Stopwatch & Pomodoro Timer** | Hover any task card → **Focus** / **Pomodoro**; slim 40px bar appears at top while running | `P` (Pause/Resume) |
| **Focus / Zen Mode** | Slim Active Focus Bar → **Zen** button (or Command Palette) | `F` |
| **Calendar (Day / Week / Month)** | Sidebar → **Calendar** | `G` then `C` |
| **Google Calendar Two-Way Sync & Setup** | Calendar toolbar → **Setup Google Sync / Google Connected** chip (or Settings → Integrations) | — |
| **.ICS Import, Export & Feed Preview** | Calendar toolbar → **.ICS / Export** popover | — |
| **All Tasks (List & Kanban, Saved Views, Filters, Bulk Actions, Tag Manager)** | Sidebar → **Tasks** (`Filters` popover, `Views` bar, `Tag manager` button; Bulk bar appears when tasks are checked) | — |
| **Notes Pane & Markdown Workspace** | Right side pane (`>=1280px`), Top bar Notes button (`<1280px`), or Sidebar → **Notes** (`Today \| All notes (N)` switch) | `]` |
| **Analytics (4 Key Cards + 6 Tabs)** | Sidebar → **Analytics** (`Overview`, `Time`, `Tasks`, `Habits`, `Consistency`, `Mood` tabs + `Scoring Formula` popover) | `G` then `A` |
| **Habits Tracker & 90-Day Heatmap** | Sidebar → **More** → **Habits** | `G` then `H` |
| **Goals & Templates** | Sidebar → **More** → **Goals & Templates** (also linked in Today empty state) | — |
| **Eisenhower Matrix (4 Quadrants)** | Sidebar → **More** → **Eisenhower Matrix** | — |
| **Daily & Weekly Reviews** | Sidebar → **More** → **Reviews** | — |
| **Achievements & Milestones** | Sidebar → **More** → **Achievements** | — |
| **CSV Exports & Printable Reports** | Sidebar → **More** → **Reports & CSV** (also in Settings → Data & Backup) | — |
| **Where is everything? (Searchable Feature Map)** | Sidebar footer → **?** icon button next to Settings (or Avatar menu) | `Ctrl/Cmd + K` |
| **Settings (Searchable Accordion)** | Sidebar footer → **Settings** (all 10 sections start collapsed for easy scanning) | — |
