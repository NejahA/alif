let shipments = [];

// Load data on startup
document.addEventListener('DOMContentLoaded', async () => {
  const data = await window.api.getShipments();
  shipments = data.shipments || [];
  renderDashboard();
  renderShipments();
});

// View switching
function showView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(viewName).classList.add('active');
  event.target.classList.add('active');

  if (viewName === 'dashboard') renderDashboard();
  if (viewName === 'shipments') renderShipments();
}

// Dashboard
function renderDashboard() {
  const total = shipments.length;
  const inTransit = shipments.filter(s => s.status === 'In Transit').length;
  const delivered = shipments.filter(s => s.status === 'Delivered').length;
  const pending = shipments.filter(s => s.status === 'Pending').length;

  document.getElementById('total-shipments').textContent = total;
  document.getElementById('in-transit').textContent = inTransit;
  document.getElementById('delivered').textContent = delivered;
  document.getElementById('pending').textContent = pending;

  // Recent 5 shipments
  const recent = shipments.slice(-5).reverse();
  const tbody = document.getElementById('recent-body');
  tbody.innerHTML = recent.map(s => `
    <tr>
      <td>#${s.id}</td>
      <td>${escapeHtml(s.itemName)}</td>
      <td>${escapeHtml(s.origin)}</td>
      <td>${escapeHtml(s.destination)}</td>
      <td><span class="status-badge status-${s.status.replace(/\s+/g, '')}">${escapeHtml(s.status)}</span></td>
    </tr>
  `).join('');
}

// Shipments list
function renderShipments() {
  const search = (document.getElementById('search-input')?.value || '').toLowerCase();
  let filtered = shipments;
  if (search) {
    filtered = shipments.filter(s =>
      s.itemName?.toLowerCase().includes(search) ||
      s.origin?.toLowerCase().includes(search) ||
      s.destination?.toLowerCase().includes(search) ||
      s.status?.toLowerCase().includes(search)
    );
  }

  const tbody = document.getElementById('shipments-body');
  const empty = document.getElementById('no-shipments');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = filtered.map(s => `
    <tr>
      <td>#${s.id}</td>
      <td>${escapeHtml(s.itemName)}</td>
      <td>${escapeHtml(s.origin)}</td>
      <td>${escapeHtml(s.destination)}</td>
      <td>${s.quantity || '-'}</td>
      <td>${s.weight ? s.weight + ' kg' : '-'}</td>
      <td><span class="status-badge status-${s.status.replace(/\s+/g, '')}">${escapeHtml(s.status)}</span></td>
      <td>${s.eta || '-'}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editShipment(${s.id})">✏️ Edit</button>
        <button class="action-btn delete-btn" onclick="deleteShipment(${s.id})">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

// Add / Edit
function saveShipment(event) {
  event.preventDefault();
  const editId = document.getElementById('edit-id').value;

  const shipment = {
    itemName: document.getElementById('itemName').value,
    origin: document.getElementById('origin').value,
    destination: document.getElementById('destination').value,
    quantity: parseInt(document.getElementById('quantity').value) || null,
    weight: parseFloat(document.getElementById('weight').value) || null,
    status: document.getElementById('status').value,
    eta: document.getElementById('eta').value || null,
    notes: document.getElementById('notes').value || null,
  };

  if (editId) {
    shipment.id = parseInt(editId);
  }

  (editId ? window.api.updateShipment(shipment) : window.api.addShipment(shipment)).then(data => {
    shipments = data.shipments || [];
    resetForm();
    renderDashboard();
    renderShipments();
    showViewDirect('shipments');
  });
}

function editShipment(id) {
  const s = shipments.find(s => s.id === id);
  if (!s) return;

  document.getElementById('edit-id').value = s.id;
  document.getElementById('itemName').value = s.itemName || '';
  document.getElementById('origin').value = s.origin || '';
  document.getElementById('destination').value = s.destination || '';
  document.getElementById('quantity').value = s.quantity || '';
  document.getElementById('weight').value = s.weight || '';
  document.getElementById('status').value = s.status || 'Pending';
  document.getElementById('eta').value = s.eta || '';
  document.getElementById('notes').value = s.notes || '';

  document.getElementById('form-title').textContent = 'Edit Shipment';
  showViewDirect('add');
}

function resetForm() {
  document.getElementById('shipment-form').reset();
  document.getElementById('edit-id').value = '';
  document.getElementById('form-title').textContent = 'New Shipment';
}

function deleteShipment(id) {
  if (!confirm('Are you sure you want to delete this shipment?')) return;

  window.api.deleteShipment(id).then(data => {
    shipments = data.shipments || [];
    renderDashboard();
    renderShipments();
  });
}

// Export
function exportCSV() {
  window.api.exportCsv().then(success => {
    if (success) alert('CSV exported successfully!');
  });
}

// Helpers
function showViewDirect(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(viewName).classList.add('active');
  // Highlight the correct nav button
  const navMap = { dashboard: 0, shipments: 1, add: 2 };
  const btns = document.querySelectorAll('.nav-btn');
  if (navMap[viewName] !== undefined) btns[navMap[viewName]].classList.add('active');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}