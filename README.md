# DayForge — Own Your Time. Build Your Future.

DayForge is a local-first daily time-blocking, recurring task, habit tracking, markdown notes, and real-time analytics workspace.

---

## Phase 4.0: UI/UX Clean-Up Audit & Feature Map

### 1. Phase 4.0 UI Clutter Audit (Top 10 Crowded Areas Identified & Resolved)
1. **Desktop Sidebar Navigation**: Previously listed 12 top-level buttons at once plus uncollapsed Saved Views, Categories, and a multi-line streak card. **Resolved**: Shows **5 main pinned items** (`Today`, `Calendar`, `Tasks`, `Notes`, `Analytics`) by default, a collapsible **"More"** group (`Habits`, `Goals & Templates`, `Eisenhower Matrix`, `Reviews`, `Achievements`, `Reports & CSV`), collapsible **Pinned Views** & **Categories**, **Where is everything?** + **Settings** pinned at the bottom, and a **one-line footer** (`Score X/100 · 🔥 Yd`).
2. **Top Header Bar & Demo Banner**: Previously stacked a multi-button demo banner and numerous action pills. **Resolved**: Demo banner is a **single dismissible line** (`Clear demo data` · `×`), and the top bar has a tidy right-hand cluster (`+ New Task`, `Search / ⌘K`, `Notifications` bell, `Sync status` local-only slot, Dark Mode toggle, Notes toggle, and `Account` avatar).
3. **Active Focus Bar**: Previously rendered a tall multi-row banner when a timer ran. **Resolved**: Slim ~40px (`h-10`) top strip showing task title, Pomodoro/Stopwatch badge, live clock, Pause/Resume (`P`), Save, and Zen (`F`).
4. **Today Page Above the Fold**: Previously stacked a 4-card KPI grid, Focus Target progress bars, Daily Goal input, Mood & Energy buttons, Today's Habits card, Carry-Forward banner, and Quote banner all above the task list. **Resolved**: Above the fold shows only **Greeting + Date**, **one summary line** (SVG progress ring + `X of Y done · Zh planned · Wh focused (Rh left)` + load badge + `Actions ⋯` menu for *Wrap up day*, *Replan my day*, and *AI Schedule Architect*), the **List / Timeline** switch, and the slim **Quick-Add** input. All secondary widgets now live in the **"Today's extras"** interactive chip row (`Habits X/Y`, `Mood & Energy`, `Daily Goal`, `Focus Target`, `Motivation`, `Unfinished`) where clicking any chip opens its full widget.
5. **Task Cards (`TaskListView` & `AllTasksWorkspacePage`)**: Previously showed 6–8 badges and 4 action buttons on every card at all times. **Resolved**: Compact cards show checkbox, category color dot, title, time range, and at most **2 metadata items + `+N`**; action buttons (`Focus`, `Pomodoro`, `Note`, `More ⋯`) appear on hover/focus on desktop and remain accessible on touch screens.
6. **Task Detail Drawer (`TaskDetailModal`)**: Previously displayed a long ungrouped form with recurrence, reminders, subtasks, goals, Google sync, and time logs all expanded at once. **Resolved**: Right-side drawer shows essentials at the top (**Title**, **Date**, **Category**, **Status**, **Start/End Time**, **Free Slots**, **Start Timer**) and organizes everything else into a **"More options" accordion** (*Priority, Matrix & Tags*, *Repeat*, *Reminders*, *Subtasks*, *Goal Link*, *Google Calendar & .ICS*, *Notes & Description*, *Time Log*) that remembers open/closed state.
7. **Notes Pane (`NotesPanel`)**: Previously stacked a full note list above the editor at all times. **Resolved**: Uses a compact `All Notes (N) ▾` switcher button that opens a slide-over **Notes List Drawer** (housing search, folder filter, pinned notes, and delete/pin actions) and a compact formatting bar so the writing area is calm and spacious.
8. **Calendar Page (`CalendarPage`)**: Previously showed multiple `.ICS` buttons in the header and a large always-expanded Google Calendar setup card below the grid. **Resolved**: Slim single-row toolbar with `Prev / Today / Next`, `Day / Week / Month` switch, a **Google Calendar status chip** (toggling the two-way sync & setup panel), and a **.ICS / Export** popover.
9. **All Tasks Page (`AllTasksWorkspacePage`)**: Previously displayed two rows of 8 filter dropdowns and an always-visible Bulk Action bar. **Resolved**: Slim toolbar with Search, `Group` & `Sort` selectors, a **Filters** popover (with active filter chips below when active), and a **conditional Bulk Action bar** that appears **only when tasks are selected**.
10. **Analytics & Settings Pages (`AnalyticsDashboard` & `SettingsPanel`)**: Analytics previously rendered 9 charts on a single scrolling page; Settings rendered all cards open at once. **Resolved**: Analytics shows **4 key stat cards + 1 main Score Trend chart** above the fold with **6 clean tabs** (`Overview`, `Time`, `Tasks`, `Habits`, `Consistency`, `Mood`) below. Settings features a **Search settings** box and **10 single-expand accordion sections** (including new **Appearance** controls for *Comfortable/Compact density*, *Sidebar mode*, *Notes default*, *Today's extras toggle*, *Reduce motion*, and *Pinned sidebar items*).

---

### 2. Where Everything Lives Now (Complete Feature Map)

| Feature (Phases 1–3) | New Location in Phase 4.0 | Shortcut |
| :--- | :--- | :--- |
| **Today Plan (List & Timeline)** | Sidebar → **Today** (segmented `List / Timeline` switch) | `G` then `T` |
| **Quick-Add Task & Full Task Drawer** | Today top input, Top bar `+ New Task`, or Mobile `+` button | `Q` or `N` |
| **Task Detail "More Options" (Repeat, Reminders, Subtasks, Goal, Google, Time Log)** | Click any task card → Right-side **Task Detail Drawer** → **More Options** accordion | — |
| **Wrap Up Day Ritual (4-Step Wizard)** | Today header → **Actions (⋯)** menu → *Wrap up day ritual* | `W` |
| **Smart Replan ("Replan my day")** | Today header → **Actions (⋯)** menu → *Replan my day* (or Load badge) | — |
| **AI Schedule Architect** | Today header → **Actions (⋯)** menu → *AI Schedule Architect* (or Settings → AI Assistant) | — |
| **Today's Habits, Mood & Energy, Daily Goal, Focus Target, Motivation, Yesterday Unfinished** | Today page → **"Today's extras"** chip row (click any chip to open its interactive panel) | — |
| **Live Focus Stopwatch & Pomodoro Timer** | Hover any task card → **Focus** / **Pomodoro**; slim 40px bar appears at top while running | `P` (Pause/Resume) |
| **Focus / Zen Mode** | Slim Active Focus Bar → **Zen** button (or Command Palette) | `F` |
| **Calendar (Day / Week / Month)** | Sidebar → **Calendar** | `G` then `C` |
| **Google Calendar Two-Way Sync & Setup** | Calendar toolbar → **Setup Google Sync / Google Connected** chip (or Settings → Calendar & Integrations) | — |
| **.ICS Import, Export & Feed Preview** | Calendar toolbar → **.ICS / Export** popover | — |
| **All Tasks (List & Kanban, Saved Views, Filters, Bulk Actions, Tag Manager)** | Sidebar → **Tasks** (`Filters` popover, `Views` bar, `Tag Manager` button; Bulk bar appears when tasks are checked) | — |
| **Notes Pane & Markdown Workspace** | Right side pane (`>=1280px`), Top bar Notes drawer button (`<1280px`), or Sidebar → **Notes** (`All Notes ▾` switcher opens folders/search/pinned drawer) | `]` |
| **Analytics (4 Key Cards + 6 Tabs)** | Sidebar → **Analytics** (`Overview`, `Time`, `Tasks`, `Habits`, `Consistency`, `Mood` tabs + `Scoring Formula` popover) | `G` then `A` |
| **Habits Tracker & 90-Day Heatmap** | Sidebar → **More** → **Habits** | `G` then `H` |
| **Goals & Templates** | Sidebar → **More** → **Goals & Templates** | — |
| **Eisenhower Matrix (4 Quadrants)** | Sidebar → **More** → **Eisenhower Matrix** | — |
| **Daily & Weekly Reviews** | Sidebar → **More** → **Reviews** | — |
| **Achievements & Milestones** | Sidebar → **More** → **Achievements** | — |
| **CSV Exports & Printable Reports** | Sidebar → **More** → **Reports & CSV** (also in Settings → Data & Backup) | — |
| **Where is everything? (Searchable Feature Map)** | Sidebar bottom → **Where is everything?** | `Ctrl/Cmd + K` |
| **Settings (Searchable Accordion)** | Sidebar bottom → **Settings** (*Profile*, *Account & Cloud Sync*, *Planning*, *Timer*, *Notifications*, *Integrations*, *AI Assistant*, *Appearance*, *Data & Backup*, *Shortcuts*) | — |
