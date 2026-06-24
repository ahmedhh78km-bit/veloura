import { apiFetch, formatCurrency, showToast } from './utils.js';

let orders = [];
let menuItems = [];

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupListeners();
});

async function checkAuth() {
  const token = localStorage.getItem('adminToken');
  const overlay = document.getElementById('login-overlay');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const mainConsole = document.getElementById('admin-main');

  if (!token) {
    showOverlay(true);
    return;
  }

  try {
    // Handshake check
    await apiFetch('/api/auth/verify');
    showOverlay(false);
    loadDashboardData();
  } catch (error) {
    console.error('Auth verification failed:', error);
    localStorage.removeItem('adminToken');
    showOverlay(true);
  }
}

function showOverlay(shouldShow) {
  const overlay = document.getElementById('login-overlay');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const mainConsole = document.getElementById('admin-main');

  if (shouldShow) {
    overlay.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    mainConsole.classList.add('hidden');
  } else {
    overlay.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    mainConsole.classList.remove('hidden');
  }
}

async function loadDashboardData() {
  fetchStats();
  fetchOrders();
  fetchInventory();
}

// Fetch KPI Metrics
async function fetchStats() {
  try {
    const stats = await apiFetch('/api/orders/stats');
    
    document.getElementById('stat-revenue').textContent = formatCurrency(stats.totalRevenue);
    document.getElementById('stat-active').textContent = stats.activeOrders;
    document.getElementById('stat-aov').textContent = formatCurrency(stats.averageOrderValue);
    
    const popularContainer = document.getElementById('stat-popular');
    if (stats.popularItems && stats.popularItems.length > 0) {
      popularContainer.innerHTML = `
        <span class="text-gold-400 font-bold">${stats.popularItems[0]._id}</span>
        <span class="text-xs text-zinc-500 block mt-0.5">${stats.popularItems[0].totalQty} units ordered</span>
      `;
    } else {
      popularContainer.textContent = 'No orders yet';
    }
  } catch (error) {
    console.error('Fetch Stats Error:', error);
  }
}

// Fetch and Draw Orders Table
async function fetchOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  try {
    orders = await apiFetch('/api/orders');
    
    if (orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="py-8 text-center text-zinc-500 font-light">No orders placed yet</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = orders.map(order => {
      const itemsList = order.items.map(item => {
        const customizations = item.selectedCustomizations.length > 0 
          ? ` (${item.selectedCustomizations.map(c => c.selected).join(', ')})`
          : '';
        return `<div>${item.name} x${item.quantity}<span class="text-zinc-500 text-xs">${customizations}</span></div>`;
      }).join('');

      const createdDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Status selector choices
      const statuses = [
        { val: 'placed', label: 'Placed' },
        { val: 'preparing', label: 'Preparing' },
        { val: 'ready_for_pickup', label: 'Ready (Pickup)' },
        { val: 'out_for_delivery', label: 'In Transit' },
        { val: 'completed', label: 'Completed' },
        { val: 'cancelled', label: 'Cancelled' }
      ];

      const statusOptions = statuses.map(s => {
        const selected = order.orderStatus === s.val ? 'selected' : '';
        return `<option value="${s.val}" ${selected}>${s.label}</option>`;
      }).join('');

      const typeBadge = order.orderType === 'delivery' 
        ? '<span class="bg-amber-950/60 border border-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Delivery</span>'
        : '<span class="bg-blue-950/60 border border-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Pickup</span>';

      return `
        <tr class="hover:bg-zinc-900/40 transition-colors">
          <td class="py-4 px-4 font-mono text-zinc-300">
            <span class="font-bold text-zinc-100 block">${order.orderNumber}</span>
            <span class="text-[10px] text-zinc-500 block mt-0.5">${createdDate}</span>
          </td>
          <td class="py-4 px-4">
            <div class="font-semibold text-zinc-200">${order.customerName}</div>
            <div class="text-xs text-zinc-500 mt-0.5">${order.customerPhone}</div>
            ${order.orderType === 'delivery' ? `<div class="text-xs text-zinc-500 font-light mt-0.5">${order.deliveryAddress.street}, ${order.deliveryAddress.city}</div>` : ''}
          </td>
          <td class="py-4 px-4 text-xs font-medium text-zinc-300 leading-relaxed">
            ${itemsList}
          </td>
          <td class="py-4 px-4">
            <div class="font-bold text-zinc-200">${formatCurrency(order.total)}</div>
            <div class="mt-1">${typeBadge}</div>
          </td>
          <td class="py-4 px-4">
            <select class="order-status-select bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-2 text-xs font-semibold focus:outline-none focus:border-gold-500/30 cursor-pointer" data-id="${order._id}">
              ${statusOptions}
            </select>
          </td>
        </tr>
      `;
    }).join('');

    // Bind Status Selection Action Changes
    tbody.querySelectorAll('.order-status-select').forEach(select => {
      select.onchange = async (e) => {
        const orderId = select.dataset.id;
        const newStatus = e.target.value;
        
        try {
          await apiFetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ orderStatus: newStatus })
          });
          showToast(`Order status updated successfully!`, 'success');
          fetchStats(); // Update counters
        } catch (error) {
          console.error('Update Status Error:', error);
          showToast('Failed to update status', 'danger');
        }
      };
    });

  } catch (error) {
    console.error('Fetch Orders Error:', error);
    showToast('Failed to load orders', 'danger');
  }
}

// Fetch and Draw Menu Inventory Table
async function fetchInventory() {
  const tbody = document.getElementById('inventory-tbody');
  if (!tbody) return;

  try {
    menuItems = await apiFetch('/api/menu');

    tbody.innerHTML = menuItems.map(item => {
      const isChecked = item.isAvailable ? 'checked' : '';

      return `
        <tr class="hover:bg-zinc-900/40 transition-colors">
          <td class="py-4 px-4 flex items-center gap-3">
            <img src="${item.image}" alt="${item.name}" class="w-10 h-10 rounded-lg object-cover border border-zinc-800">
            <div>
              <span class="font-semibold text-zinc-200 block text-sm">${item.name}</span>
              <span class="text-xs text-zinc-500 block leading-tight font-light line-clamp-1">${item.description}</span>
            </div>
          </td>
          <td class="py-4 px-4 text-xs font-bold text-zinc-400 capitalize">${item.category}</td>
          <td class="py-4 px-4 font-bold text-zinc-300">${formatCurrency(item.price)}</td>
          <td class="py-4 px-4">
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="inventory-stock-toggle sr-only peer" data-id="${item._id}" ${isChecked}>
              <div class="w-9 h-5 bg-zinc-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500/20 peer-checked:after:bg-emerald-400 peer-checked:after:border-emerald-500"></div>
            </label>
          </td>
          <td class="py-4 px-4 text-right">
            <button class="btn-delete-menu-item p-2 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 rounded-xl border border-transparent hover:border-rose-500/20 transition-all focus:outline-none" data-id="${item._id}">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Bind Stock availability toggles
    tbody.querySelectorAll('.inventory-stock-toggle').forEach(checkbox => {
      checkbox.onchange = async (e) => {
        const itemId = checkbox.dataset.id;
        const isAvailable = e.target.checked;
        
        try {
          await apiFetch(`/api/menu/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ isAvailable })
          });
          showToast(`Stock state updated successfully!`, 'success');
        } catch (error) {
          console.error('Stock Change Error:', error);
          showToast('Failed to toggle stock availability', 'danger');
          checkbox.checked = !isAvailable; // revert check
        }
      };
    });

    // Bind Delete buttons
    tbody.querySelectorAll('.btn-delete-menu-item').forEach(btn => {
      btn.onclick = async () => {
        const itemId = btn.dataset.id;
        if (!confirm('Are you sure you want to delete this menu dish?')) return;

        try {
          await apiFetch(`/api/menu/${itemId}`, { method: 'DELETE' });
          showToast('Menu item removed', 'success');
          fetchInventory();
        } catch (error) {
          console.error('Delete Item Error:', error);
          showToast('Failed to delete item', 'danger');
        }
      };
    });

  } catch (error) {
    console.error('Fetch Inventory Error:', error);
  }
}

function setupListeners() {
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const refreshBtn = document.getElementById('btn-refresh-orders');

  // Submit Credentials Login Form
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;

      try {
        const response = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password })
        });

        localStorage.setItem('adminToken', response.token);
        showToast('Console authentication successful!', 'success');
        showOverlay(false);
        loadDashboardData();
      } catch (error) {
        console.error('Login Error:', error);
        showToast(error.message || 'Invalid credentials, try again.', 'danger');
      }
    };
  }

  // Logout Click Action
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem('adminToken');
      showToast('Logged out of admin panel', 'info');
      showOverlay(true);
    };
  }

  // Refresh console buttons
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      fetchOrders();
      fetchStats();
      showToast('Orders lists refreshed', 'success');
    };
  }

  // Add Menu Item Modal Open / Close
  const addModalOverlay = document.getElementById('add-menu-modal-overlay');
  const openModalBtn = document.getElementById('btn-open-add-menu-modal');
  const closeModalBtn = document.getElementById('add-menu-modal-close');
  const addForm = document.getElementById('add-menu-form');

  if (openModalBtn && addModalOverlay) {
    openModalBtn.onclick = () => {
      addModalOverlay.classList.remove('hidden');
      setTimeout(() => {
        addModalOverlay.classList.add('opacity-100');
      }, 10);
    };
  }

  const closeMenuModal = () => {
    if (addModalOverlay) {
      addModalOverlay.classList.remove('opacity-100');
      setTimeout(() => addModalOverlay.classList.add('hidden'), 300);
    }
  };

  if (closeModalBtn) closeModalBtn.onclick = closeMenuModal;
  if (addModalOverlay) {
    addModalOverlay.onclick = (e) => {
      if (e.target === addModalOverlay) closeMenuModal();
    };
  }

  // Submit Add Menu Item Form
  if (addForm) {
    addForm.onsubmit = async (e) => {
      e.preventDefault();

      const payload = {
        name: document.getElementById('menuName').value,
        category: document.getElementById('menuCategory').value,
        price: parseFloat(document.getElementById('menuPrice').value),
        image: document.getElementById('menuImage').value,
        description: document.getElementById('menuDescription').value,
        isAvailable: true,
        tags: [],
        allergens: []
      };

      try {
        await apiFetch('/api/menu', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        showToast('New menu dish published successfully!', 'success');
        addForm.reset();
        closeMenuModal();
        fetchInventory();
      } catch (error) {
        console.error('Add Menu Dish Error:', error);
        showToast(error.message || 'Failed to create menu item', 'danger');
      }
    };
  }
}
