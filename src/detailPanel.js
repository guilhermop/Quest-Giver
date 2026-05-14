import { PROJECT_COLORS } from './models.js';
 
export function renderDetailPanel(todo, state, { onSave, onClose, onDelete }) {
  const panel = document.getElementById('detail-panel');
 
  if (!todo) {
    panel.classList.remove('open');
    panel.innerHTML = '';
    return;
  }
 
  panel.classList.add('open');
 
  const priorityColor = getComputedStyle(document.documentElement)
    .getPropertyValue(todo.priority === 'high' ? '--high' : todo.priority === 'medium' ? '--medium' : '--low').trim();
 
  panel.innerHTML = `
    <div class="detail-header">
      <div class="detail-priority-bar" style="background:${priorityColor}"></div>
      <div class="detail-actions">
        <button class="btn-icon" id="detail-delete" title="Abandon quest">🗑</button>
        <button class="detail-close" id="detail-close" title="Close">×</button>
      </div>
    </div>
 
    <div class="detail-body">
 
      <div class="detail-field">
        <label>Quest Name</label>
        <input class="detail-title-input" id="d-title" type="text" value="${escHtml(todo.title)}" placeholder="Name this quest…" />
      </div>
 
      <div class="detail-row">
        <div class="detail-field">
          <label>Urgency</label>
          <select class="detail-select" id="d-priority">
            <option value="low"    ${todo.priority==='low'    ?'selected':''}>⚔ Minor</option>
            <option value="medium" ${todo.priority==='medium' ?'selected':''}>🗡 Perilous</option>
            <option value="high"   ${todo.priority==='high'   ?'selected':''}>💀 Dire</option>
          </select>
        </div>
        <div class="detail-field">
          <label>Complete By</label>
          <input class="detail-input" id="d-due" type="date" value="${todo.dueDate}" />
        </div>
      </div>
 
      <div class="detail-field">
        <label>Guild</label>
        <select class="detail-select" id="d-project">
          ${state.projects.map(p => `
            <option value="${p.id}" ${p.id === todo.projectId ? 'selected' : ''}>${escHtml(p.name)}</option>
          `).join('')}
        </select>
      </div>
 
      <div class="detail-field">
        <label>Quest Details</label>
        <textarea class="detail-textarea" id="d-desc" rows="3" placeholder="Describe the nature of this quest…">${escHtml(todo.description)}</textarea>
      </div>
 
      <div class="detail-field">
        <label>Adventurer's Notes</label>
        <textarea class="detail-textarea" id="d-notes" rows="2" placeholder="Whisper your secrets here…">${escHtml(todo.notes)}</textarea>
      </div>
 
      <div class="detail-field">
        <label>Objectives ${todo.checklistProgress ? `(${todo.checklistProgress.done}/${todo.checklistProgress.total})` : ''}</label>
        <div class="checklist" id="d-checklist">
          ${todo.checklist.map(item => buildChecklistItem(item)).join('')}
        </div>
        <div class="checklist-add">
          <input class="detail-input" id="d-check-input" type="text" placeholder="Add an objective…" />
          <button class="btn-add-check" id="d-check-add" title="Add objective">+</button>
        </div>
      </div>
 
      <button class="btn-save" id="d-save">Seal the Scroll</button>
    </div>
  `;
 
  panel.querySelector('#detail-close').addEventListener('click', onClose);
  panel.querySelector('#detail-delete').addEventListener('click', () => onDelete(todo.id));
 
  panel.querySelector('#d-checklist').addEventListener('click', e => {
    const btn = e.target.closest('.check-btn');
    const rm  = e.target.closest('.remove-checklist-item');
    if (btn)  _checkToggle(btn.dataset.id);
    if (rm)   _checkRemove(rm.dataset.id);
  });
 
  const checkInput = panel.querySelector('#d-check-input');
  panel.querySelector('#d-check-add').addEventListener('click', () => addCheckItem(checkInput));
  checkInput.addEventListener('keydown', e => { if (e.key === 'Enter') addCheckItem(checkInput); });
 
  panel.querySelector('#d-save').addEventListener('click', () => {
    const updated = todo.update({
      title:       panel.querySelector('#d-title').value.trim() || 'Unnamed Quest',
      priority:    panel.querySelector('#d-priority').value,
      dueDate:     panel.querySelector('#d-due').value,
      projectId:   panel.querySelector('#d-project').value,
      description: panel.querySelector('#d-desc').value,
      notes:       panel.querySelector('#d-notes').value,
    });
    onSave(updated);
  });
 
  function _checkToggle(itemId) {
    const patched = todo.toggleChecklistItem(itemId);
    todo = patched;
    rerenderChecklist(todo);
    onSave(patched, { silent: true });
  }
 
  function _checkRemove(itemId) {
    const patched = todo.removeChecklistItem(itemId);
    todo = patched;
    rerenderChecklist(todo);
    onSave(patched, { silent: true });
  }
 
  function addCheckItem(input) {
    const text = input.value.trim();
    if (!text) return;
    const patched = todo.addChecklistItem(text);
    todo = patched;
    input.value = '';
    rerenderChecklist(todo);
    onSave(patched, { silent: true });
  }
}
 
function rerenderChecklist(todo) {
  const cl = document.getElementById('d-checklist');
  if (!cl) return;
  cl.innerHTML = todo.checklist.map(buildChecklistItem).join('');
}
 
function buildChecklistItem(item) {
  return `
    <div class="checklist-item ${item.done ? 'done' : ''}">
      <button class="check-btn ${item.done ? 'checked' : ''}" data-id="${item.id}">✓</button>
      <span class="check-text">${escHtml(item.text)}</span>
      <button class="remove-checklist-item" data-id="${item.id}" title="Remove objective">×</button>
    </div>
  `;
}
 
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
 