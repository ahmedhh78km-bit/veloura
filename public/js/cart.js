// Cart management utility using localStorage
import { formatCurrency, showToast } from './utils.js';

let cart = JSON.parse(localStorage.getItem('cartItems')) || [];

export function getCart() {
  return cart;
}

export function saveCart() {
  localStorage.setItem('cartItems', JSON.stringify(cart));
  updateCartBadges();
  renderCartDrawer();
}

/**
 * Generate a unique key for cart items based on selected customizations
 */
function generateCartKey(itemId, customizations) {
  const sortedCustomizations = (customizations || [])
    .map(c => `${c.name}:${c.selected}`)
    .sort()
    .join('|');
  return `${itemId}_${sortedCustomizations}`;
}

export function addToCart(menuItem, selectedCustomizations = [], quantity = 1) {
  const cartKey = generateCartKey(menuItem._id, selectedCustomizations);
  
  // Calculate price with customizations
  let extraCost = 0;
  selectedCustomizations.forEach(cust => {
    // Find the item customization in menu item metadata
    const config = menuItem.customizationOptions.find(c => c.name === cust.name);
    if (config) {
      const idx = config.options.indexOf(cust.selected);
      if (idx !== -1 && config.additionalPrice && config.additionalPrice[idx]) {
        extraCost += config.additionalPrice[idx];
      }
    }
  });

  const finalItemPrice = menuItem.price + extraCost;
  const existingItemIndex = cart.findIndex(item => item.cartKey === cartKey);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      cartKey,
      menuItemId: menuItem._id,
      name: menuItem.name,
      image: menuItem.image,
      price: finalItemPrice,
      quantity,
      selectedCustomizations
    });
  }

  saveCart();
  showToast(`Added ${menuItem.name} to cart!`);
  openCartDrawer();
}

export function updateQuantity(cartKey, delta) {
  const itemIndex = cart.findIndex(item => item.cartKey === cartKey);
  if (itemIndex > -1) {
    cart[itemIndex].quantity += delta;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
      showToast('Item removed from cart', 'info');
    }
    saveCart();
  }
}

export function removeFromCart(cartKey) {
  cart = cart.filter(item => item.cartKey !== cartKey);
  saveCart();
  showToast('Item removed from cart', 'info');
}

export function clearCart() {
  cart = [];
  saveCart();
}

export function getCartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.10; // 10% tax
  const total = subtotal + tax;

  return {
    subtotal,
    tax,
    total
  };
}

export function updateCartBadges() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(badge => {
    badge.textContent = totalCount;
    if (totalCount > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });
}

// Side Drawer Interactivity
export function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('translate-x-full');
    overlay.classList.remove('hidden', 'opacity-0');
    overlay.classList.add('opacity-100');
    renderCartDrawer();
  }
}

export function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.add('translate-x-full');
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');
    setTimeout(() => overlay.classList.add('hidden'), 300);
  }
}

export function renderCartDrawer() {
  const container = document.getElementById('cart-items-container');
  const summaryContainer = document.getElementById('cart-summary-container');
  if (!container || !summaryContainer) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-64 text-zinc-500">
        <svg class="w-16 h-16 stroke-1 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p class="font-medium text-lg">Your cart is empty</p>
        <a href="menu.html" class="mt-4 text-sm text-amber-500 hover:text-amber-400 font-semibold underline">Browse our menu</a>
      </div>
    `;
    summaryContainer.classList.add('hidden');
    return;
  }

  summaryContainer.classList.remove('hidden');
  
  // Render item rows
  container.innerHTML = cart.map(item => {
    const custDesc = item.selectedCustomizations.length > 0
      ? `<p class="text-xs text-zinc-400 mt-0.5">${item.selectedCustomizations.map(c => `${c.name}: ${c.selected}`).join(', ')}</p>`
      : '';

    return `
      <div class="flex items-center gap-4 py-4 border-b border-zinc-800/60 transition-all duration-300">
        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-xl object-cover border border-zinc-800">
        <div class="flex-1">
          <h4 class="font-medium text-zinc-200 text-sm leading-snug">${item.name}</h4>
          ${custDesc}
          <div class="flex items-center justify-between mt-2">
            <span class="text-amber-500 font-semibold text-sm">${formatCurrency(item.price)}</span>
            <div class="flex items-center gap-2 border border-zinc-700 rounded-lg p-1 bg-zinc-900/60">
              <button class="cart-minus px-2 py-0.5 text-xs text-zinc-400 hover:text-zinc-100 font-semibold" data-key="${item.cartKey}">-</button>
              <span class="text-xs font-semibold text-zinc-200 w-4 text-center">${item.quantity}</span>
              <button class="cart-plus px-2 py-0.5 text-xs text-zinc-400 hover:text-zinc-100 font-semibold" data-key="${item.cartKey}">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Update Summary numbers
  const { subtotal, tax, total } = getCartTotals();
  document.getElementById('cart-subtotal').textContent = formatCurrency(subtotal);
  document.getElementById('cart-tax').textContent = formatCurrency(tax);
  document.getElementById('cart-total').textContent = formatCurrency(total);

  // Bind Adjuster Event Listeners
  document.querySelectorAll('.cart-minus').forEach(btn => {
    btn.onclick = () => updateQuantity(btn.dataset.key, -1);
  });
  document.querySelectorAll('.cart-plus').forEach(btn => {
    btn.onclick = () => updateQuantity(btn.dataset.key, 1);
  });
}

// Attach globally for dynamic header button triggers
document.addEventListener('DOMContentLoaded', () => {
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartOverlay = document.getElementById('cart-overlay');

  if (cartToggleBtn) cartToggleBtn.onclick = openCartDrawer;
  if (cartCloseBtn) cartCloseBtn.onclick = closeCartDrawer;
  if (cartOverlay) cartOverlay.onclick = closeCartDrawer;

  updateCartBadges();
});
