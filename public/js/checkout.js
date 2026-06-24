import { apiFetch, formatCurrency, showToast } from './utils.js';
import { getCart, getCartTotals, clearCart } from './cart.js';

let orderType = 'delivery';
let isSubmitting = false;

document.addEventListener('DOMContentLoaded', () => {
  renderCheckoutSummary();
  setupListeners();
});

function renderCheckoutSummary() {
  const cartItems = getCart();
  const container = document.getElementById('checkout-summary-list');

  if (!container) return;

  if (cartItems.length === 0) {
    container.innerHTML = `<p class="text-center text-zinc-500 py-10">No items in cart. <a href="menu.html" class="text-gold-400 underline">Browse Menu</a></p>`;
    updateTotalsDisplay();
    return;
  }

  container.innerHTML = cartItems.map(item => `
    <div class="flex justify-between items-start py-3 border-b border-zinc-700 last:border-0">
      <div class="flex-1">
        <div class="font-medium">${item.name} <span class="text-zinc-500">×${item.quantity}</span></div>
        ${item.selectedCustomizations?.length ? `<div class="text-xs text-zinc-500 mt-1">${item.selectedCustomizations.map(c => c.selected).join(', ')}</div>` : ''}
      </div>
      <div class="font-semibold text-right ml-4">${formatCurrency(item.price * item.quantity)}</div>
    </div>
  `).join('');

  updateTotalsDisplay();
}

function updateTotalsDisplay() {
  const totals = getCartTotals();
  const deliveryFee = orderType === 'delivery' ? 5 : 0;
  const total = totals.subtotal + totals.tax + deliveryFee;

  document.getElementById('summary-subtotal').textContent = formatCurrency(totals.subtotal);
  document.getElementById('summary-tax').textContent = formatCurrency(totals.tax);
  document.getElementById('summary-delivery').textContent = deliveryFee ? formatCurrency(deliveryFee) : 'Free';
  document.getElementById('summary-total').textContent = formatCurrency(total);
}

function setupListeners() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  const typeRadios = document.querySelectorAll('input[name="orderType"]');
  const addressSection = document.getElementById('address-section');

  // Order Type Toggle
  typeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      orderType = e.target.value;
      if (orderType === 'delivery') {
        addressSection?.classList.remove('hidden');
        ['deliveryStreet', 'deliveryCity', 'deliveryPostal'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.required = true;
        });
      } else {
        addressSection?.classList.add('hidden');
        ['deliveryStreet', 'deliveryCity', 'deliveryPostal'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.required = false;
        });
      }
      updateTotalsDisplay();
    });
  });

  setupCardMirroring();
  form.addEventListener('submit', handleSubmit);
}

function setupCardMirroring() {
  const card = document.getElementById('visual-credit-card');
  if (!card) return;

  // Name
  document.getElementById('cardName')?.addEventListener('input', (e) => {
    document.getElementById('card-name-mirror').textContent = (e.target.value || 'YOUR NAME').toUpperCase();
  });

  // Card Number
  const numInput = document.getElementById('cardNumber');
  numInput?.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    e.target.value = val.replace(/(\d{4})/g, '$1 ').trim();
    document.getElementById('card-num-mirror').textContent = e.target.value || '•••• •••• •••• ••••';
  });

  // Expiry
  const expiryInput = document.getElementById('cardExpiry');
  expiryInput?.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
    e.target.value = val;
    document.getElementById('card-expiry-mirror').textContent = val || 'MM/YY';
  });

  // CVV + Flip
  const cvvInput = document.getElementById('cardCVV');
  cvvInput?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
    document.getElementById('card-cvv-mirror').textContent = e.target.value || '•••';
  });

  cvvInput?.addEventListener('focus', () => card.classList.add('card-flip'));
  cvvInput?.addEventListener('blur', () => card.classList.remove('card-flip'));
}

async function handleSubmit(e) {
  e.preventDefault();
  if (isSubmitting) return;

  const submitBtn = document.getElementById('submit-btn');
  if (!submitBtn) return;

  const originalText = submitBtn.textContent;

  if (!validateForm()) return;

  isSubmitting = true;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `Processing Payment...`;

  try {
    const cartItems = getCart();
    if (cartItems.length === 0) throw new Error("Cart is empty");

    const payload = {
      customerName: document.getElementById('customerName').value.trim(),
      customerPhone: document.getElementById('customerPhone').value.trim(),
      customerEmail: document.getElementById('customerEmail').value.trim(),
      orderType,
      items: cartItems.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        selectedCustomizations: item.selectedCustomizations || []
      })),
      notes: document.getElementById('orderNotes')?.value.trim() || ''
    };

    if (orderType === 'delivery') {
      payload.deliveryAddress = {
        street: document.getElementById('deliveryStreet').value.trim(),
        city: document.getElementById('deliveryCity').value.trim(),
        postalCode: document.getElementById('deliveryPostal').value.trim()
      };
    }

    const order = await apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    clearCart();
    showToast('Order placed successfully!', 'success');
    renderTracking(order);

  } catch (error) {
    console.error(error);
    showToast(error.message || 'Failed to place order', 'danger');
  } finally {
    isSubmitting = false;
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

function validateForm() {
  const email = document.getElementById('customerEmail').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const cardNum = document.getElementById('cardNumber').value.replace(/\s/g, '');

  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email', 'warning');
    return false;
  }
  if (!phone || phone.length < 8) {
    showToast('Please enter a valid phone number', 'warning');
    return false;
  }
  if (cardNum.length !== 16) {
    showToast('Card number must be 16 digits', 'warning');
    return false;
  }
  return true;
}

function renderTracking(order) {
  const formContainer = document.getElementById('checkout-form-container');
  const trackingContainer = document.getElementById('tracking-container');

  if (formContainer) formContainer.classList.add('hidden');
  if (trackingContainer) trackingContainer.classList.remove('hidden');

  const orderNumEl = document.getElementById('tracking-order-number');
  if (orderNumEl) {
    orderNumEl.textContent = order.orderNumber || `ORD-${Date.now()}`;
  }

  showToast('Thank you for choosing Veloura!', 'success');
}