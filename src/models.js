// ── models.js ─────────────────────────────────────────────
// Pure application logic: no DOM, no side-effects.

let _nextId = 1;
function uid() { return `id_${Date.now()}_${_nextId++}`; }

// ── Todo ──────────────────────────────────────────────────
export class Todo {
  constructor({
    id,
    title = 'Untitled task',
    description = '',
    dueDate = '',
    priority = 'medium',   // 'low' | 'medium' | 'high'
    notes = '',
    checklist = [],        // [{ id, text, done }]
    completed = false,
    projectId,
    createdAt,
  } = {}) {
    this.id          = id          ?? uid();
    this.title       = title;
    this.description = description;
    this.dueDate     = dueDate;
    this.priority    = priority;
    this.notes       = notes;
    this.checklist   = checklist.map(item => ({ ...item }));
    this.completed   = completed;
    this.projectId   = projectId;
    this.createdAt   = createdAt   ?? new Date().toISOString();
  }

  // ── Mutations (return new Todo for immutability) ────────
  update(fields) {
    return new Todo({ ...this, ...fields, checklist: fields.checklist ?? this.checklist });
  }

  toggleComplete() {
    return this.update({ completed: !this.completed });
  }

  addChecklistItem(text) {
    const item = { id: uid(), text, done: false };
    return this.update({ checklist: [...this.checklist, item] });
  }

  toggleChecklistItem(itemId) {
    const checklist = this.checklist.map(i =>
      i.id === itemId ? { ...i, done: !i.done } : i
    );
    return this.update({ checklist });
  }

  removeChecklistItem(itemId) {
    return this.update({ checklist: this.checklist.filter(i => i.id !== itemId) });
  }

  get checklistProgress() {
    if (!this.checklist.length) return null;
    const done = this.checklist.filter(i => i.done).length;
    return { done, total: this.checklist.length };
  }

  // Restore plain object → Todo instance (after JSON.parse)
  static fromJSON(obj) {
    return new Todo(obj);
  }
}

// ── Project ───────────────────────────────────────────────
const PROJECT_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#22c55e',
  '#06b6d4', '#f97316', '#8b5cf6', '#14b8a6',
];

export class Project {
  constructor({ id, name = 'New Project', color, createdAt } = {}) {
    this.id        = id        ?? uid();
    this.name      = name;
    this.color     = color     ?? PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
    this.createdAt = createdAt ?? new Date().toISOString();
  }

  update(fields) { return new Project({ ...this, ...fields }); }

  static fromJSON(obj) { return new Project(obj); }
}

export { PROJECT_COLORS };

// ── AppState ──────────────────────────────────────────────
// Single source of truth. Immutable-style updates (replace maps).
export class AppState {
  constructor({ projects = [], todos = [], activeProjectId = null } = {}) {
    // Store as Maps for O(1) lookup
    this._projects = new Map(projects.map(p => [p.id, p instanceof Project ? p : Project.fromJSON(p)]));
    this._todos    = new Map(todos.map(t => [t.id, t instanceof Todo ? t : Todo.fromJSON(t)]));
    this.activeProjectId = activeProjectId;
  }

  // ── Getters ────────────────────────────────────────────
  get projects()  { return [...this._projects.values()].sort((a,b) => a.createdAt.localeCompare(b.createdAt)); }
  get todos()     { return [...this._todos.values()]; }
  get activeProject() { return this._projects.get(this.activeProjectId) ?? null; }

  todosForProject(projectId) {
    return this.todos
      .filter(t => t.projectId === projectId)
      .sort((a,b) => {
        // Sort: incomplete first, then by priority weight, then createdAt
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const w = { high: 0, medium: 1, low: 2 };
        if (w[a.priority] !== w[b.priority]) return w[a.priority] - w[b.priority];
        return a.createdAt.localeCompare(b.createdAt);
      });
  }

  // ── Project mutations ──────────────────────────────────
  addProject(project) {
    const map = new Map(this._projects);
    map.set(project.id, project);
    return new AppState({ projects: [...map.values()], todos: this.todos, activeProjectId: this.activeProjectId });
  }

  updateProject(project) { return this.addProject(project); }

  deleteProject(projectId) {
    const map = new Map(this._projects);
    map.delete(projectId);
    // Remove all todos belonging to this project
    const todos = this.todos.filter(t => t.projectId !== projectId);
    const nextActive = map.size > 0 ? [...map.keys()][0] : null;
    return new AppState({
      projects: [...map.values()],
      todos,
      activeProjectId: this.activeProjectId === projectId ? nextActive : this.activeProjectId,
    });
  }

  setActiveProject(projectId) {
    return new AppState({ projects: this.projects, todos: this.todos, activeProjectId: projectId });
  }

  // ── Todo mutations ─────────────────────────────────────
  addTodo(todo) {
    const map = new Map(this._todos);
    map.set(todo.id, todo);
    return new AppState({ projects: this.projects, todos: [...map.values()], activeProjectId: this.activeProjectId });
  }

  updateTodo(todo) { return this.addTodo(todo); }

  deleteTodo(todoId) {
    const map = new Map(this._todos);
    map.delete(todoId);
    return new AppState({ projects: this.projects, todos: [...map.values()], activeProjectId: this.activeProjectId });
  }

  // ── Serialization ──────────────────────────────────────
  toJSON() {
    return {
      projects: this.projects,
      todos: this.todos,
      activeProjectId: this.activeProjectId,
    };
  }

  static fromJSON(obj) { return new AppState(obj); }
}