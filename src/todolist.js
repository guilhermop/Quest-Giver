import { formatDueDate, priorityLabel } from './utils.js';
 
export function renderTodoList(state, { onToggle, onSelect, onDelete, selectedId }) {
  const project = state.activeProject;
  const titleEl = document.getElementById('project-title');
  titleEl.textContent = project ? project.name : 'Unclaimed Quests';
 
  const list = document.getElementById('todo-list');
  list.innerHTML = '';
 
  if (!project) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✦</div>
        <p>No guild selected</p>
        <small>Establish a guild to begin your journey.</small>
      </div>`;
    return;
  }
 
  const todos = state.todosForProject(project.id);
 
  if (!todos.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">◎</div>
        <p>The board is bare, adventurer...</p>
        <small>Press <strong>+ Post a Quest</strong> to seek glory.</small>
      </div>`;
    return;
  }
 
  const ul = document.createElement('ul');
  ul.className = 'todo-ul';
 
  const active    = todos.filter(t => !t.completed);
  const completed = todos.filter(t =>  t.completed);
 
  active.forEach(t => ul.appendChild(buildItem(t, onToggle, onSelect, onDelete, selectedId)));
 
  if (completed.length) {
    const sep = document.createElement('li');
    sep.className = 'section-label';
    sep.textContent = `Quests Completed · ${completed.length}`;
    ul.appendChild(sep);
    completed.forEach(t => ul.appendChild(buildItem(t, onToggle, onSelect, onDelete, selectedId)));
  }
 
  list.appendChild(ul);
}
 
function buildItem(todo, onToggle, onSelect, onDelete, selectedId) {
  const li = document.createElement('li');
  li.className = [
    'todo-item',
    `priority-${todo.priority}`,
    todo.completed ? 'completed' : '',
    todo.id === selectedId ? 'selected' : '',
  ].filter(Boolean).join(' ');
  li.dataset.id = todo.id;
 
  const { text: dueTxt, overdue } = formatDueDate(todo.dueDate);
  const progress = todo.checklistProgress;
 
  li.innerHTML = `
    <button class="todo-check ${todo.completed ? 'checked' : ''}" title="Toggle complete">✓</button>
    <div class="todo-body">
      <div class="todo-main">
        <span class="todo-title">${escHtml(todo.title)}</span>
      </div>
      ${dueTxt ? `<div class="todo-meta">
        <span class="todo-due${overdue ? ' overdue' : ''}">${dueTxt}</span>
        ${progress ? `<span class="todo-checklist-progress">${progress.done}/${progress.total}</span>` : ''}
      </div>` : (progress ? `<div class="todo-meta"><span class="todo-checklist-progress">${progress.done}/${progress.total}</span></div>` : '')}
    </div>
    <span class="priority-badge priority-${todo.priority}">${priorityLabel(todo.priority)}</span>
    <button class="delete-todo" title="Abandon quest">×</button>
  `;
 
  li.querySelector('.todo-check').addEventListener('click', e => {
    e.stopPropagation();
    onToggle(todo.id);
  });
 
  li.querySelector('.delete-todo').addEventListener('click', e => {
    e.stopPropagation();
    onDelete(todo.id);
  });
 
  li.addEventListener('click', () => onSelect(todo.id));
 
  return li;
}
 
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}