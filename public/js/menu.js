import { apiFetch, formatCurrency, showToast } from './utils.js';
import { addToCart } from './cart.js';

let menuItems = [];
let filteredItems = [];
let currentCategory = 'all';
let searchQuery = '';
let isVegetarian = false;
let isGlutenFree = false;

// Modal State
let selectedItem = null;
let modalQuantity = 1;

document.addEventListener('DOMContentLoaded', () => {
  fetchMenu();
  setupListeners();
});

async function fetchMenu() {
  const loadingEl = document.getElementById('menu-loading');
  const gridEl = document.getElementById('menu-grid');
  
  try {
    menuItems = await apiFetch('/api/menu');
    applyFilters();
    
    if (loadingEl) loadingEl.classList.add('hidden');
    if (gridEl) gridEl.classList.remove('hidden');
  } catch (error) {
    console.error('Fetch Menu Error:', error);
    showToast('Failed to load menu items', 'danger');
  }
}

function applyFilters() {
  filteredItems = menuItems.filter(item => {
    // Category check
    const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
    
    // Search query check
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
                          
    // Dietary checks
    const matchesVeg = !isVegetarian || item.tags.map(t => t.toLowerCase()).includes('vegetarian');
    const matchesGF = !isGlutenFree || item.tags.map(t => t.toLowerCase()).includes('gluten-free');

    return matchesCategory && matchesSearch && matchesVeg && matchesGF;
  });

  renderMenu();
}

function renderMenu() {
  const gridEl = document.getElementById('menu-grid');
  const emptyEl = document.getElementById('menu-empty');

  if (!gridEl) return;

  if (filteredItems.length === 0) {
    gridEl.classList.add('hidden');
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }

  if (emptyEl) emptyEl.classList.add('hidden');
  gridEl.classList.remove('hidden');

  gridEl.innerHTML = filteredItems.map(item => {
    const isSpecial = item.tags.includes('Chef Special') || item.tags.includes('Signature');
    const badgeMarkup = isSpecial 
      ? `<span class="absolute top-4 right-4 bg-obsidian/95 backdrop-blur-md text-gold-400 border border-gold-500/30 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md z-10">${item.tags[0]}</span>`
      : '';

    return `
      <div class="glassmorphism rounded-2xl overflow-hidden group shadow-premium hover:border-gold-500/25 hover:shadow-gold-500/5 transition-all duration-500 flex flex-col relative cursor-pointer" data-id="${item._id}">
        ${badgeMarkup}
        <!-- Card Cover -->
        <div class="relative overflow-hidden h-56 flex-shrink-0">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out">
          <div class="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent"></div>
        </div>
        <!-- Card Body -->
        <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <h3 class="font-serif text-lg text-zinc-100 font-bold group-hover:text-gold-400 transition-colors">${item.name}</h3>
            </div>
            <p class="text-zinc-400 text-xs font-light leading-relaxed line-clamp-3">${item.description}</p>
          </div>
          <div class="flex items-center justify-between pt-2">
            <span class="text-xl text-gold-500 font-bold font-serif">${formatCurrency(item.price)}</span>
            <button class="menu-quick-add p-2.5 rounded-full border border-zinc-800 hover:border-gold-500/30 bg-zinc-900/60 hover:bg-gold-500/10 text-zinc-300 hover:text-gold-400 transition-all duration-300 focus:outline-none" data-id="${item._id}">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind Grid Clicks (excluding Quick Add button click)
  gridEl.querySelectorAll('[data-id]').forEach(card => {
    card.onclick = (e) => {
      const isBtn = e.target.closest('.menu-quick-add');
      if (isBtn) {
        e.stopPropagation();
        const itemId = isBtn.dataset.id;
        const item = menuItems.find(i => i._id === itemId);
        if (item) {
          // Add default customizations if any
          const defaultCust = item.customizationOptions.map(c => ({
            name: c.name,
            selected: c.options[0]
          }));
          addToCart(item, defaultCust, 1);
        }
      } else {
        openDetailModal(card.dataset.id);
      }
    };
  });
}

// Modal Logics
function openDetailModal(itemId) {
  selectedItem = menuItems.find(i => i._id === itemId);
  if (!selectedItem) return;

  modalQuantity = 1;

  // Bind static elements
  document.getElementById('modal-image').src = selectedItem.image;
  document.getElementById('modal-title').textContent = selectedItem.name;
  document.getElementById('modal-description').textContent = selectedItem.description;
  document.getElementById('modal-base-price').textContent = formatCurrency(selectedItem.price);
  document.getElementById('modal-qty-value').textContent = modalQuantity;

  // Render Tags
  const tagsContainer = document.getElementById('modal-tags');
  tagsContainer.innerHTML = selectedItem.tags.map(tag => `
    <span class="bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-zinc-700/60">${tag}</span>
  `).join('');

  // Render Allergens
  const allergensText = document.getElementById('modal-allergens');
  allergensText.textContent = selectedItem.allergens.length > 0 
    ? selectedItem.allergens.join(', ')
    : 'None';

  // Render Customizations Form
  const form = document.getElementById('modal-customization-form');
  if (selectedItem.customizationOptions.length === 0) {
    form.innerHTML = '';
    form.classList.add('hidden');
  } else {
    form.classList.remove('hidden');
    form.innerHTML = selectedItem.customizationOptions.map((cust, custIdx) => {
      const optionsMarkup = cust.options.map((opt, optIdx) => {
        const extraPrice = cust.additionalPrice && cust.additionalPrice[optIdx] 
          ? ` (+${formatCurrency(cust.additionalPrice[optIdx])})` 
          : '';
        const checked = optIdx === 0 ? 'checked' : '';

        return `
          <label class="flex items-center justify-between p-3.5 border border-zinc-800 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 cursor-pointer transition-colors">
            <span class="text-sm font-medium text-zinc-300">${opt}${extraPrice}</span>
            <input type="radio" name="customization_${custIdx}" value="${opt}" data-extra="${cust.additionalPrice[optIdx] || 0}" ${checked} class="w-4 h-4 text-gold-500 border-zinc-700 bg-zinc-900 focus:ring-0 focus:ring-offset-0">
          </label>
        `;
      }).join('');

      return `
        <div class="space-y-3">
          <h4 class="text-xs font-semibold text-zinc-400 uppercase tracking-widest">${cust.name}</h4>
          <div class="grid grid-cols-1 gap-2">
            ${optionsMarkup}
          </div>
        </div>
      `;
    }).join('');

    // Attach listeners to input options to trigger price updates
    form.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.onchange = updateModalPrices;
    });
  }

  updateModalPrices();

  // Show Modal container
  const modalOverlay = document.getElementById('detail-modal-overlay');
  const modalCard = document.getElementById('detail-modal-card');
  modalOverlay.classList.remove('hidden');
  setTimeout(() => {
    modalOverlay.classList.add('opacity-100');
    modalCard.classList.remove('scale-95');
    modalCard.classList.add('scale-100');
  }, 10);
}

function closeDetailModal() {
  const modalOverlay = document.getElementById('detail-modal-overlay');
  const modalCard = document.getElementById('detail-modal-card');
  if (modalOverlay) {
    modalOverlay.classList.remove('opacity-100');
    modalCard.classList.remove('scale-100');
    modalCard.classList.add('scale-95');
    setTimeout(() => modalOverlay.classList.add('hidden'), 300);
  }
}

function updateModalPrices() {
  if (!selectedItem) return;

  let optionExtraCosts = 0;
  const form = document.getElementById('modal-customization-form');
  
  if (form && !form.classList.contains('hidden')) {
    const selectedRadios = form.querySelectorAll('input[type="radio"]:checked');
    selectedRadios.forEach(radio => {
      optionExtraCosts += parseFloat(radio.dataset.extra);
    });
  }

  const singleItemPrice = selectedItem.price + optionExtraCosts;
  const totalPrice = singleItemPrice * modalQuantity;

  document.getElementById('modal-total-price').textContent = formatCurrency(totalPrice);
}

function setupListeners() {
  // Category Pill Clicks
  const catContainer = document.getElementById('category-tabs');
  if (catContainer) {
    catContainer.querySelectorAll('.category-btn').forEach(btn => {
      btn.onclick = () => {
        catContainer.querySelector('.category-btn.active').classList.remove('active', 'border-gold-500/30', 'bg-gold-500/10', 'text-gold-400');
        catContainer.querySelector('.category-btn.active').classList.add('border-transparent', 'text-zinc-400');
        
        btn.classList.add('active', 'border-gold-500/30', 'bg-gold-500/10', 'text-gold-400');
        btn.classList.remove('border-transparent', 'text-zinc-400');
        
        currentCategory = btn.dataset.category;
        applyFilters();
      };
    });
  }

  // Search input change
  const searchInput = document.getElementById('menu-search');
  if (searchInput) {
    searchInput.oninput = (e) => {
      searchQuery = e.target.value;
      applyFilters();
    };
  }

  // Dietary checkboxes
  const vegCheck = document.getElementById('filter-vegetarian');
  if (vegCheck) {
    vegCheck.onchange = (e) => {
      isVegetarian = e.target.checked;
      applyFilters();
    };
  }

  const gfCheck = document.getElementById('filter-gluten-free');
  if (gfCheck) {
    gfCheck.onchange = (e) => {
      isGlutenFree = e.target.checked;
      applyFilters();
    };
  }

  // Modal adjustments
  const modalClose = document.getElementById('modal-close-btn');
  const modalOverlay = document.getElementById('detail-modal-overlay');
  if (modalClose) modalClose.onclick = closeDetailModal;
  if (modalOverlay) {
    modalOverlay.onclick = (e) => {
      if (e.target === modalOverlay) closeDetailModal();
    };
  }

  const qtyMinus = document.getElementById('modal-qty-minus');
  const qtyPlus = document.getElementById('modal-qty-plus');
  if (qtyMinus) {
    qtyMinus.onclick = () => {
      if (modalQuantity > 1) {
        modalQuantity--;
        document.getElementById('modal-qty-value').textContent = modalQuantity;
        updateModalPrices();
      }
    };
  }
  if (qtyPlus) {
    qtyPlus.onclick = () => {
      modalQuantity++;
      document.getElementById('modal-qty-value').textContent = modalQuantity;
      updateModalPrices();
    };
  }

  // Add to Order Action from Modal
  const addToCartBtn = document.getElementById('modal-add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.onclick = () => {
      if (!selectedItem) return;

      const selectedCustomizations = [];
      const form = document.getElementById('modal-customization-form');
      if (form && !form.classList.contains('hidden')) {
        selectedItem.customizationOptions.forEach((cust, idx) => {
          const radio = form.querySelector(`input[name="customization_${idx}"]:checked`);
          if (radio) {
            selectedCustomizations.push({
              name: cust.name,
              selected: radio.value
            });
          }
        });
      }

      addToCart(selectedItem, selectedCustomizations, modalQuantity);
      closeDetailModal();
    };
  }
}
