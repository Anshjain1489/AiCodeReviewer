# UI Design — AI Code Reviewer & Bug Detection Platform

## 1. Design Direction
Create a modern developer-tool interface inspired by professional IDE and DevTools products.

Style:
- Clean
- Minimal
- Technical
- Professional
- Dark-first
- Responsive
- High information density without feeling crowded

## 2. Color System
Use CSS variables so the theme can be changed easily.

Suggested semantic colors:
- Background: near-black/slate
- Surface: dark slate
- Primary: indigo/blue
- Success: green
- Warning: amber
- Danger: red
- Info: blue
- Text: white/light gray
- Muted: gray

Do not hardcode colors throughout components.

## 3. Typography
Use a modern sans-serif for UI.
Use a monospace font for source code and code-related metadata.

Suggested:
- Inter for UI
- JetBrains Mono for code

## 4. Main Layout

```text
┌────────────────────────────────────────────────────────────┐
│ Logo       Search        Notifications      Avatar          │
├──────────────┬─────────────────────────────────────────────┤
│ Dashboard    │                                             │
│ Projects     │              Main Content                   │
│ Reviews      │                                             │
│ GitHub       │                                             │
│ Analytics    │                                             │
│ Settings     │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

Desktop:
- Sidebar 240px
- Topbar 64px
- Content with max-width and responsive behavior

Mobile:
- Sidebar becomes drawer
- Editor panels stack vertically

## 5. Dashboard
Cards:
- Reviews
- Issues
- Average Score
- Critical Issues

Charts:
- Quality trend
- Issue categories
- Severity distribution

Recent reviews table:
- Project
- Score
- Issues
- Status
- Date
- View action

## 6. Code Review Workspace

```text
┌─────────────────────────────────────────────────────────────┐
│ Project   Language   Branch                [Analyze Code]  │
├──────────────────────────────┬──────────────────────────────┤
│                              │                              │
│        Monaco Editor         │       Review Panel           │
│                              │                              │
│                              │  🔴 Critical                 │
│                              │  🟠 High                     │
│                              │  🟡 Medium                   │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘
```

Requirements:
- Line numbers
- Syntax highlighting
- Issue markers
- Selected issue highlighting
- Read-only result mode
- Loading state
- Error state

## 7. Review Result
Header:
- Project name
- Review status
- Overall score

Score card:
- Large score
- Grade
- Comparison with previous review

Issue filters:
- All
- Critical
- High
- Medium
- Low
- Security
- Bugs
- Performance

Issue list:
- Severity icon
- Title
- File
- Line
- Category

## 8. Issue Details Drawer
Show:
- Severity
- Category
- Source
- File
- Line
- Problem
- Why it matters
- Recommendation
- Original code
- Suggested code

Actions:
- Explain with AI
- Generate Fix
- Accept Fix
- Ignore
- Mark Fixed

## 9. GitHub Page
Show:
- Connected GitHub account
- Repository cards
- Search
- Private/public badge
- Default branch
- Analyze button

## 10. Pull Request Page
Show:
- PR title
- Repository
- Author
- Changed files
- AI score
- Findings
- Review status

Allow:
- Review PR
- View findings
- Publish approved comments

## 11. Components
Build reusable components:
- Button
- Input
- Select
- Modal
- Drawer
- Badge
- Card
- Tabs
- Dropdown
- Tooltip
- Toast
- Skeleton
- EmptyState
- ErrorState
- CodeBlock
- ScoreCard
- IssueCard
- SeverityBadge

## 12. Accessibility
- Keyboard navigation
- Visible focus states
- Semantic HTML
- Accessible dialogs
- Color must not be the only indicator of severity
- Screen-reader labels
- Adequate contrast

## 13. Responsive Breakpoints
Support:
- Mobile: 320px+
- Tablet: 768px+
- Desktop: 1024px+
- Large desktop: 1440px+

The code editor is desktop-first but must remain usable on smaller screens.
