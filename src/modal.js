
import { PROJECT_COLORS } from './models.js';

const modalEl = document.getElementById('modal');

function openModal(html, onSubmit) {
  modalEl.innerHTML = `
    <div class="modal-overlay" id="modal-overlay"></div>
    <div class="modal-box">${html}</div>
  `;
  modalEl.classList.add('open');

  modalEl.querySelector('#modal-overlay').addEventListener('click', closeModal);

  const form = modalEl.querySelector('form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      onSubmit(form);
    });
  }

  // Focus first input
  requestAnimationFrame(() => {
    const first = modalEl.querySelector('input, textarea, select');
    if (first) first.focus();
  });
}

export function closeModal() {
  modalEl.classList.remove('open');
  modalEl.innerHTML = '';
}

// ── Add Todo Modal ────────────────────────────────────────
export function openAddTodoModal(state, onConfirm) {
  const today = new Date().toISOString().split('T')[0];

  const html = `
    <h2>Post a New Quest</h2>
    <form id="todo-form">
      <div class="modal-field">
        <label for="m-title">Quest Name</label>
        <input class="detail-input" id="m-title" name="title" type="text" placeholder="What must be done, adventurer?" required />
      </div>

      <div class="modal-row">
        <div class="modal-field">
          <label for="m-priority">Urgency</label>
          <select class="detail-select" id="m-priority" name="priority">
            <option value="low">⚔ Minor</option>
            <option value="medium" selected>🗡 Perilous</option>
            <option value="high">💀 Dire</option>
          </select>
        </div>
        <div class="modal-field">
          <label for="m-due">Complete By</label>
          <input class="detail-input" id="m-due" name="dueDate" type="date" value="${today}" />
        </div>
      </div>

      <div class="modal-field">
        <label for="m-project">Guild</label>
        <select class="detail-select" id="m-project" name="projectId">
          ${state.projects.map(p => `
            <option value="${p.id}" ${p.id === state.activeProjectId ? 'selected' : ''}>${escHtml(p.name)}</option>
          `).join('')}
        </select>
      </div>

      <div class="modal-field">
        <label for="m-desc">Quest Details <span style="color:var(--text3)">(optional)</span></label>
        <textarea class="detail-textarea" id="m-desc" name="description" rows="2" placeholder="Describe the nature of this quest…"></textarea>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-cancel" id="m-cancel">Turn Back</button>
        <button type="submit" class="btn-primary">Post Quest</button>
      </div>
    </form>
  `;

  openModal(html, form => {
    const data = Object.fromEntries(new FormData(form));
    onConfirm(data);
    closeModal();
  });

  modalEl.querySelector('#m-cancel').addEventListener('click', closeModal);
}

// ── Add Project Modal ─────────────────────────────────────
export function openAddProjectModal(onConfirm) {
  let selectedColor = PROJECT_COLORS[0];

  const swatches = PROJECT_COLORS.map((c, i) => `
    <button type="button" class="color-swatch ${i === 0 ? 'selected' : ''}" data-color="${c}" style="background:${c}" aria-label="${c}"></button>
  `).join('');

  const html = `
    <h2>Establish a Guild</h2>
    <form id="project-form">
      <div class="modal-field">
        <label for="p-name">Guild Name</label>
        <input class="detail-input" id="p-name" name="name" type="text" placeholder="Name your guild…" required />
      </div>
      <div class="modal-field">
        <label>Guild Sigil Color</label>
        <div class="color-picker" id="color-picker">${swatches}</div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-cancel" id="p-cancel">Turn Back</button>
        <button type="submit" class="btn-primary">Found Guild</button>
      </div>
    </form>
  `;

  openModal(html, form => {
    const name = form.querySelector('#p-name').value.trim();
    if (!name) return;
    onConfirm({ name, color: selectedColor });
    closeModal();
  });

  modalEl.querySelector('#p-cancel').addEventListener('click', closeModal);

  // Color swatch selection
  modalEl.querySelector('#color-picker').addEventListener('click', e => {
    const swatch = e.target.closest('.color-swatch');
    if (!swatch) return;
    modalEl.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
    swatch.classList.add('selected');
    selectedColor = swatch.dataset.color;
  });
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}