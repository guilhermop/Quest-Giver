export function renderSidebar(state, { onSelectProject, onDeleteProject, onAddProject }) {
  renderProjectList(state, { onSelectProject, onDeleteProject });
  renderStats(state);
  setupAddProject(onAddProject);
}
 
function renderProjectList(state, { onSelectProject, onDeleteProject }) {
  const list = document.getElementById('project-list');
  list.innerHTML = '';
 
  state.projects.forEach(project => {
    const count = state.todosForProject(project.id).filter(t => !t.completed).length;
    const li = document.createElement('li');
    li.className = 'project-item' + (project.id === state.activeProjectId ? ' active' : '');
    li.dataset.id = project.id;
 
    li.innerHTML = `
      <span class="project-dot" style="background:${project.color}"></span>
      <span class="project-name">${escHtml(project.name)}</span>
      ${count > 0 ? `<span class="project-count">${count}</span>` : ''}
      <button class="delete-project" title="Delete project" aria-label="Delete ${escHtml(project.name)}">×</button>
    `;
 
    li.addEventListener('click', e => {
      if (e.target.closest('.delete-project')) {
        e.stopPropagation();
        if (confirm(`Disband the guild "${project.name}" and abandon all its quests?`)) {
          onDeleteProject(project.id);
        }
        return;
      }
      onSelectProject(project.id);
    });
 
    list.appendChild(li);
  });
}
 
function renderStats(state) {
  const activeTodos = state.activeProjectId
    ? state.todosForProject(state.activeProjectId)
    : [];
 
  document.getElementById('stats-total').textContent = activeTodos.length;
  document.getElementById('stats-done').textContent  = activeTodos.filter(t => t.completed).length;
}
 
let _addProjectBound = false;
function setupAddProject(onAddProject) {
  if (_addProjectBound) return;
  _addProjectBound = true;
  document.getElementById('btn-add-project').addEventListener('click', onAddProject);
}
 
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}