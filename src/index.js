import { AppState, Project, Todo } from './models.js';
import { saveState, loadState }     from './storage.js';
import { renderSidebar }            from './sidebar.js';
import { renderTodoList }           from './todolist.js';
import { renderDetailPanel }        from './detailPanel.js';
import { openAddTodoModal, openAddProjectModal, closeModal } from './modal.js';
 
let state = loadState() ?? createDefaultState();
let selectedTodoId = null;
 
function createDefaultState() {
  const inbox = new Project({ name: 'Unclaimed Quests', color: '#6366f1' });
  return new AppState({
    projects: [inbox],
    todos: [],
    activeProjectId: inbox.id,
  });
}
 
function render() {
  renderSidebar(state, {
    onSelectProject: selectProject,
    onDeleteProject: deleteProject,
    onAddProject:    openAddProjectModal.bind(null, handleAddProject),
  });
 
  renderTodoList(state, {
    onToggle:    toggleTodo,
    onSelect:    selectTodo,
    onDelete:    deleteTodo,
    selectedId:  selectedTodoId,
  });
 
  const selectedTodo = state.todos.find(t => t.id === selectedTodoId) ?? null;
  renderDetailPanel(selectedTodo, state, {
    onSave:   saveDetail,
    onClose:  () => { selectedTodoId = null; render(); },
    onDelete: deleteTodo,
  });
}
 
function commit(newState) {
  state = newState;
  saveState(state);
  render();
}
 
function selectProject(id) {
  selectedTodoId = null;
  commit(state.setActiveProject(id));
}
 
function deleteProject(id) {
  selectedTodoId = null;
  commit(state.deleteProject(id));
}
 
function handleAddProject({ name, color }) {
  const project = new Project({ name, color });
  commit(state.addProject(project).setActiveProject(project.id));
}
 
// ── Todo handlers ─────────────────────────────────────────
function toggleTodo(id) {
  const todo = state.todos.find(t => t.id === id);
  if (!todo) return;
  commit(state.updateTodo(todo.toggleComplete()));
}
 
function selectTodo(id) {
  selectedTodoId = selectedTodoId === id ? null : id;
  render();
}
 
function deleteTodo(id) {
  if (selectedTodoId === id) selectedTodoId = null;
  commit(state.deleteTodo(id));
}
 
// Detail panel save — silent means don't re-render full panel (checklist live edit)
function saveDetail(updatedTodo, opts = {}) {
  const nextState = state.updateTodo(updatedTodo);
  state = nextState;
  saveState(state);
 
  if (!opts.silent) {
    render();
  } else {
    renderSidebar(state, {
      onSelectProject: selectProject,
      onDeleteProject: deleteProject,
      onAddProject:    openAddProjectModal.bind(null, handleAddProject),
    });
    renderTodoList(state, {
      onToggle:   toggleTodo,
      onSelect:   selectTodo,
      onDelete:   deleteTodo,
      selectedId: selectedTodoId,
    });
  }
}
 
function handleAddTodo(data) {
  const todo = new Todo({
    title:       data.title,
    description: data.description ?? '',
    dueDate:     data.dueDate ?? '',
    priority:    data.priority ?? 'medium',
    projectId:   data.projectId ?? state.activeProjectId,
  });
  commit(state.addTodo(todo));
}
 
document.getElementById('btn-add-todo').addEventListener('click', () => {
  openAddTodoModal(state, handleAddTodo);
});
 
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    if (selectedTodoId) { selectedTodoId = null; render(); }
  }
  if (e.key === 'n' && !isInputFocused()) {
    e.preventDefault();
    openAddTodoModal(state, handleAddTodo);
  }
});
 
function isInputFocused() {
  const tag = document.activeElement?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}
 
// ── Go ────────────────────────────────────────────────────
render();