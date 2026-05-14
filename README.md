# ⚔ Questboard

A fantasy-themed todo app where your tasks become quests. 

🔗 **Live Demo:** [guilhermop.github.io/Quest-Giver](https://guilhermop.github.io/Quest-Giver/)

---

## Features

- **Quest Management** — Create, edit, and delete todos with a title, description, due date, and priority
- **Projects** — Organize quests into separate boards; create and delete custom projects
- **Priority Levels** — Low, Medium, and High priority with color-coded indicators
- **Checklist** — Add sub-tasks to any quest and track their completion
- **Detail Panel** — Expand any quest to view and edit its full details
- **Persistent Storage** — All data is saved to `localStorage` so your quests survive page refreshes
- **Stats** — Track total and completed quests at a glance

---

## Built With

- **HTML5**
- **CSS3** — Custom properties, CSS Grid, Flexbox
- **JavaScript (ES6 Modules)** — No frameworks, no bundler
- **Google Fonts** — Cinzel & Crimson Text for the fantasy aesthetic
- **localStorage** — For data persistence

---

## Project Structure

```
Quest-Giver/
├── index.html
├── src/
│   ├── index.js          # Entry point
│   ├── models.js         # Todo & Project classes
│   ├── storage.js        # localStorage logic
│   ├── todolist.js       # Todo list logic
│   ├── sidebar.js        # Sidebar rendering
│   ├── modal.js          # Modal logic
│   ├── detailPanel.js    # Detail panel rendering
│   └── utils.js          # Utility functions
└── styles/
    ├── main.css
    └── extra.css
```

---

## Running Locally

No build step required — just open the project in your browser:

```bash
git clone https://github.com/guilhermop/Quest-Giver.git
cd Quest-Giver
# Open index.html in your browser
# Or use VS Code Live Server extension
```

---

## What I Learned

- Separating application logic from DOM manipulation using ES6 modules
- Using `localStorage` to persist data across sessions
- Reconstructing class instances from plain JSON objects retrieved from storage
- Building a responsive layout with CSS Grid
- Managing UI state (selected project, open panels, modals) without a framework

---

## Acknowledgements

- Project idea from [The Odin Project — Todo List](https://www.theodinproject.com/lessons/node-path-javascript-todo-list)
- Design inspired by [Todoist](https://todoist.com) and [Things](https://culturedcode.com/things/)
