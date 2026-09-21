// ==========================================================================
// DI ĐỘNG VIỆT - JAVASCRIPT APPLICATION CORE
// Full Client Features + RESTful API Integration + Admin Hub
// ==========================================================================

const API_BASE = window.location.origin;

// Application State
const state = {
  allProducts: [],
  filteredProducts: [],
  cart: JSON.parse(localStorage.getItem('ddv_cart') || '[]'),
  appliedVoucher: null,
  compareList: [],
  currentUser: JSON.parse(localStorage.getItem('ddv_user') || 'null'),
  currentAdmin: JSON.parse(localStorage.getItem('ddv_admin') || 'null'),
  currentCategory: 'all',
  currentBrand: 'all',
  minPrice: 0,
  maxPrice: 999999999,
  currentSort: 'sales',
  heroSlideIndex: 0,
  adminData: null
};
let adminSessionValidated = false;

function getAdminHeaders(includeJson = false) {
  const headers = {
    'x-user-role': 'admin',
    'x-admin-email': state.currentAdmin?.email || '',
    'x-admin-token': state.currentAdmin?.sessionToken || ''
  };
  if (includeJson) headers['Content-Type'] = 'application/json';
  return headers;
}

// Trade-In Database for Valuation Calculation
const TRADE_IN_MODELS = {
  Apple: [
    { name: 'iPhone 15 Pro Max 256GB', basePrice: 20500000 },
    { name: 'iPhone 15 Pro 128GB', basePrice: 16800000 },
    { name: 'iPhone 15 128GB', basePrice: 12500000 },
    { name: 'iPhone 14 Pro Max 128GB', basePrice: 15500000 },
    { name: 'iPhone 14 Pro 128GB', basePrice: 13500000 },
    { name: 'iPhone 13 Pro Max 128GB', basePrice: 12000000 },
    { name: 'iPhone 13 128GB', basePrice: 9000000 },
    { name: 'iPhone 12 128GB', basePrice: 6500000 },
    { name: 'iPad Pro M2 11 inch 128GB', basePrice: 13000000 },
    { name: 'MacBook Air M2 (8/256)', basePrice: 15000000 }
  ],
  Samsung: [
    { name: 'Galaxy S24 Ultra 256GB', basePrice: 18500000 },
    { name: 'Galaxy S24 Plus 256GB', basePrice: 13000000 },
    { name: 'Galaxy S23 Ultra 256GB', basePrice: 12500000 },
    { name: 'Galaxy Z Fold5 256GB', basePrice: 16000000 },
    { name: 'Galaxy Z Flip5 256GB', basePrice: 9500000 }
  ],
  Xiaomi: [
    { name: 'Xiaomi 13 Pro 256GB', basePrice: 9500000 },
    { name: 'Xiaomi 13T Pro 512GB', basePrice: 7500000 },
    { name: 'Redmi Note 13 Pro+ 5G', basePrice: 4800000 }
  ],
  Other: [
    { name: 'OPPO Find X6 Pro', basePrice: 8500000 },
    { name: 'vivo X100 Pro', basePrice: 11000000 }
  ]
};

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
  validateAdminSession();
  initHeroSlider();
  initFlashSaleTimer();
  fetchProducts();
  fetchStores();
  populateTradeInModels();
  updateCartUI();
  updateAuthUI();
  enforceCustomerView();
  setupLiveSearch();

  if (window.location.pathname === '/admin' || window.location.hash === '#admin-login') {
    openAdminLoginPortal();
  }
});

function enforceCustomerView() {
  if (!state.currentUser) return;

  const adminView = document.getElementById('adminView');
  const customerView = document.getElementById('customerView');
  if (adminView) adminView.style.display = 'none';
  if (customerView) customerView.style.display = 'block';
}

function hasAdminSession() {
  return adminSessionValidated && Boolean(state.currentAdmin?.role === 'admin' && state.currentAdmin.sessionToken);
}

async function validateAdminSession() {
  if (!(state.currentAdmin?.role === 'admin' && state.currentAdmin.sessionToken)) {
    adminSessionValidated = false;
    state.currentAdmin = null;
    localStorage.removeItem('ddv_admin');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/admin-session`, {
      headers: getAdminHeaders()
    });
    if (!response.ok) throw new Error('Invalid admin session');
    adminSessionValidated = true;
    updateAuthUI();
  } catch (error) {
    adminSessionValidated = false;
    state.currentAdmin = null;
    localStorage.removeItem('ddv_admin');
    const adminView = document.getElementById('adminView');
    const customerView = document.getElementById('customerView');
    if (adminView) adminView.style.display = 'none';
    if (customerView) customerView.style.display = 'block';
  }
}

// Format VND Currency
function formatVND(amount) {
  return (Number(amount) || 0).toLocaleString('vi-VN') + 'đ';
}

// Fallback Image Handler
function handleImgError(img, name = 'Sản phẩm') {
  img.onerror = null;
  img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#f8fafc"/>
      <rect x="75" y="40" width="150" height="220" rx="20" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="4"/>
      <circle cx="150" cy="70" r="8" fill="#94a3b8"/>
      <rect x="95" y="90" width="110" height="130" rx="8" fill="#ffffff"/>
      <text x="150" y="155" font-family="sans-serif" font-size="12" font-weight="bold" fill="#be0014" text-anchor="middle">DI ĐỘNG VIỆT</text>
      <text x="150" y="175" font-family="sans-serif" font-size="9" fill="#64748b" text-anchor="middle">${(name || 'Sản phẩm').slice(0, 22)}</text>
    </svg>
  `);
}

// Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info');
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==================== 1. HERO SLIDER ====================

function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('#heroSliderDots .dot');
  if (!slides.length) return;

  setInterval(() => {
    nextHeroSlide();
  }, 5000);
}

function showHeroSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('#heroSliderDots .dot');
  if (!slides.length) return;

  if (index >= slides.length) state.heroSlideIndex = 0;
  else if (index < 0) state.heroSlideIndex = slides.length - 1;
  else state.heroSlideIndex = index;

  slides.forEach((s, idx) => {
    s.classList.toggle('active', idx === state.heroSlideIndex);
  });
  dots.forEach((d, idx) => {
    d.classList.toggle('active', idx === state.heroSlideIndex);
  });
}

function nextHeroSlide() {
  showHeroSlide(state.heroSlideIndex + 1);
}

function prevHeroSlide() {
  showHeroSlide(state.heroSlideIndex - 1);
}

function goToHeroSlide(index) {
  showHeroSlide(index);
}

// ==================== 2. FLASH SALE TIMER ====================

function initFlashSaleTimer() {
  let secondsLeft = 8 * 3600 + 45 * 60 + 30; // 8h 45m 30s
  const hoursEl = document.getElementById('timerHours');
  const minutesEl = document.getElementById('timerMinutes');
  const secondsEl = document.getElementById('timerSeconds');

  setInterval(() => {
    if (secondsLeft <= 0) secondsLeft = 24 * 3600;
    secondsLeft--;

    const h = Math.floor(secondsLeft / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    const s = secondsLeft % 60;

    if (hoursEl) hoursEl.innerText = String(h).padStart(2, '0');
    if (minutesEl) minutesEl.innerText = String(m).padStart(2, '0');
    if (secondsEl) secondsEl.innerText = String(s).padStart(2, '0');
  }, 1000);
}

// ==================== 3. FETCH & RENDER PRODUCTS ====================

async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    const json = await res.json();
    if (json.success) {
      state.allProducts = json.data;
      renderFlashSaleProducts();
      applyFiltersAndSort();
    }
  } catch (err) {
    console.error('Error fetching products:', err);
  }
}

async function syncCustomerProfile() {
  if (!state.currentUser) return;

  try {
    const res = await fetch(`${API_BASE}/api/auth/profile?phone=${encodeURIComponent(state.currentUser.phone)}`);
    const json = await res.json();
    if (json.success && json.data) {
      state.currentUser = { ...state.currentUser, ...json.data };
      localStorage.setItem('ddv_user', JSON.stringify(state.currentUser));
      updateAuthUI();
    }
  } catch (err) {}
}

async function syncAllData() {
  const tasks = [fetchProducts(), fetchStores()];
  if (state.currentUser) tasks.push(syncCustomerProfile());
  if (hasAdminSession()) {
    tasks.push(loadAdminStats(), loadAdminProducts(), loadAdminOrders(), loadAdminCustomers(), loadAdminTradeIns(), loadAdminVouchers());
  }
  await Promise.allSettled(tasks);
}

function renderFlashSaleProducts() {
  const container = document.getElementById('flashSaleContainer');
  if (!container) return;

  const flashItems = state.allProducts.filter(p => p.isFlashSale).slice(0, 4);
  container.innerHTML = flashItems.map(product => {
    const discountPercent = Math.round(((product.price - product.salePrice) / product.price) * 100);
    const sold = product.soldCount || 15;
    const stock = product.stock || 40;
    const progressPercent = Math.min(100, Math.round((sold / (sold + stock)) * 100));

    return `
      <div class="product-card">
        <div class="card-top-badges">
          <span class="badge-tag flash"><i class="fa-solid fa-bolt"></i> Flash Sale</span>
          <span class="badge-tag tro-gia">${product.badge || 'Trợ giá sốc'}</span>
        </div>
        <div class="card-img-wrap" onclick="quickViewProduct('${product.id}')">
          <img src="${product.image}" alt="${product.name}" onerror="handleImgError(this, '${product.name.replace(/'/g, "\\'")}')">
        </div>
        <div class="card-body">
          <span class="card-brand">${product.brand}</span>
          <h4 class="card-title" onclick="quickViewProduct('${product.id}')">${product.name}</h4>
          
          <div class="card-pricing">
            <span class="card-sale-price">${formatVND(product.salePrice)}</span>
            <span class="card-old-price">${formatVND(product.price)}</span>
            <span class="card-discount-badge">-${discountPercent}%</span>
          </div>

          <div class="stock-progress-wrap">
            <div class="progress-bg">
              <div class="progress-fill" style="width: ${progressPercent}%;"></div>
              <span class="progress-label">🔥 Đã bán ${sold} suất</span>
            </div>
          </div>

          ${hasAdminSession() ? `
            <div class="card-admin-actions">
              <button type="button" class="btn-admin-card-edit" onclick="event.stopPropagation(); openEditProductModal('${product.id}')" title="Sửa sản phẩm (Quyền Admin)">
                <i class="fa-solid fa-pen-to-square"></i> Sửa
              </button>
              <button type="button" class="btn-admin-card-del" onclick="event.stopPropagation(); deleteProduct('${product.id}')" title="Xóa sản phẩm (Quyền Admin)">
                <i class="fa-solid fa-trash-can"></i> Xóa
              </button>
            </div>
          ` : ''}

          <div class="card-actions">
            <button class="btn-card-buy" onclick="addToCart('${product.id}')">
              <i class="fa-solid fa-cart-plus"></i> Mua Ngay
            </button>
            <button class="btn-card-compare ${state.compareList.includes(product.id) ? 'active' : ''}" onclick="toggleCompare('${product.id}')" title="So sánh">
              <i class="fa-solid fa-code-compare"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderMainProducts(productsToRender) {
  const container = document.getElementById('mainProductsGrid');
  const countEl = document.getElementById('productResultCount');
  if (!container) return;

  if (countEl) countEl.innerText = `Đang hiển thị ${productsToRender.length} sản phẩm`;

  if (productsToRender.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #fff; border-radius: 12px;">
        <i class="fa-solid fa-box-open" style="font-size: 48px; color: #94a3b8; margin-bottom: 12px;"></i>
        <h4 style="font-size: 16px; color: #334155;">Không tìm thấy sản phẩm nào phù hợp</h4>
        <p style="font-size: 13px; color: #64748b;">Vui lòng thử chọn mức giá hoặc thương hiệu khác.</p>
        <button class="btn-card-buy" style="margin: 16px auto 0; width: auto; padding: 8px 20px;" onclick="resetFilters()">
          Xem tất cả sản phẩm
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = productsToRender.map(product => {
    const discountPercent = Math.round(((product.price - product.salePrice) / product.price) * 100);
    const storageOptions = product.storageOptions || ['128GB'];

    return `
      <div class="product-card">
        <div class="card-top-badges">
          ${product.badge ? `<span class="badge-tag tro-gia">${product.badge}</span>` : ''}
          ${product.installment ? `<span class="badge-tag tra-gop">${product.installment}</span>` : ''}
        </div>
        <div class="card-img-wrap" onclick="quickViewProduct('${product.id}')">
          <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="handleImgError(this, '${product.name.replace(/'/g, "\\'")}')">
        </div>
        <div class="card-body">
          <span class="card-brand">${product.brand}</span>
          <h4 class="card-title" onclick="quickViewProduct('${product.id}')">${product.name}</h4>

          <div class="card-storage-tags">
            ${storageOptions.map(opt => `<span class="storage-pill">${opt}</span>`).join('')}
          </div>
          
          <div class="card-pricing">
            <span class="card-sale-price">${formatVND(product.salePrice)}</span>
            <span class="card-old-price">${formatVND(product.price)}</span>
            <span class="card-discount-badge">-${discountPercent}%</span>
          </div>

          <div class="card-promo-note">
            <i class="fa-solid fa-gift text-danger"></i> Tặng gói bảo hành 1 đổi 1 trong 33 ngày
          </div>

          <div class="card-rating-stock">
            <span class="stars">
              <i class="fa-solid fa-star"></i> <strong>${product.rating || 4.9}</strong> (${product.reviewsCount || 45})
            </span>
            <span>Kho: <strong>${product.stock || 10}</strong> máy</span>
          </div>

          ${hasAdminSession() ? `
            <div class="card-admin-actions">
              <button type="button" class="btn-admin-card-edit" onclick="event.stopPropagation(); openEditProductModal('${product.id}')" title="Sửa sản phẩm (Quyền Admin)">
                <i class="fa-solid fa-pen-to-square"></i> Sửa
              </button>
              <button type="button" class="btn-admin-card-del" onclick="event.stopPropagation(); deleteProduct('${product.id}')" title="Xóa sản phẩm (Quyền Admin)">
                <i class="fa-solid fa-trash-can"></i> Xóa
              </button>
            </div>
          ` : ''}

          <div class="card-actions">
            <button class="btn-card-buy" onclick="addToCart('${product.id}')">
              <i class="fa-solid fa-cart-plus"></i> Chọn Mua
            </button>
            <button class="btn-card-compare ${state.compareList.includes(product.id) ? 'active' : ''}" onclick="toggleCompare('${product.id}')" title="So sánh thông số">
              <i class="fa-solid fa-code-compare"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== 4. FILTERS & SORT LOGIC ====================

function filterByCategory(category, el) {
  state.currentCategory = category;
  
  // Active state on nav
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  if (el) el.classList.add('active');

  const titleEl = document.getElementById('catalogSectionTitle');
  const catNames = {
    all: 'Tất Cả Sản Phẩm Nổi Bật',
    phone: 'Điện Thoại Di Động Chính Hãng',
    laptop: 'MacBook & Laptop Đồ Họa',
    tablet: 'Máy Tính Bảng iPad & Samsung Tab',
    apple: 'Hệ Sinh Thái Apple Chính Hãng',
    old: 'Máy Cũ Like New 99% Chuẩn AAR',
    accessory: 'Phụ Kiện Cáp Sạc, Pin Dự Phòng',
    watch: 'Đồng Hồ Thông Minh',
    audio: 'Loa & Tai Nghe Âm Thanh Cao Cấp'
  };
  if (titleEl) titleEl.innerText = catNames[category] || 'Danh Sách Sản Phẩm';

  applyFiltersAndSort();
}

function filterByBrand(brand, el) {
  state.currentBrand = brand;
  if (el) {
    document.querySelectorAll('#brandPillsContainer .pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
  }
  applyFiltersAndSort();
}

function filterByPrice(min, max, el) {
  state.minPrice = min;
  state.maxPrice = max;
  if (el) {
    document.querySelectorAll('#pricePillsContainer .pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
  }
  applyFiltersAndSort();
}

function handleSortChange(sortVal) {
  state.currentSort = sortVal;
  applyFiltersAndSort();
}

function applyFiltersAndSort() {
  let result = [...state.allProducts];

  // Category
  if (state.currentCategory !== 'all') {
    if (state.currentCategory === 'apple') {
      result = result.filter(p => p.brand.toLowerCase() === 'apple');
    } else {
      result = result.filter(p => p.category === state.currentCategory);
    }
  }

  // Brand
  if (state.currentBrand !== 'all') {
    result = result.filter(p => p.brand.toLowerCase() === state.currentBrand.toLowerCase());
  }

  // Price
  result = result.filter(p => p.salePrice >= state.minPrice && p.salePrice <= state.maxPrice);

  // Sorter
  if (state.currentSort === 'price-asc') {
    result.sort((a, b) => a.salePrice - b.salePrice);
  } else if (state.currentSort === 'price-desc') {
    result.sort((a, b) => b.salePrice - a.salePrice);
  } else if (state.currentSort === 'discount') {
    result.sort((a, b) => ((b.price - b.salePrice) / b.price) - ((a.price - a.salePrice) / a.price));
  } else if (state.currentSort === 'rating') {
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else {
    // 'sales'
    result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
  }

  state.filteredProducts = result;
  renderMainProducts(result);
}

function resetFilters() {
  state.currentCategory = 'all';
  state.currentBrand = 'all';
  state.minPrice = 0;
  state.maxPrice = 999999999;
  state.currentSort = 'sales';

  document.querySelectorAll('#brandPillsContainer .pill').forEach((p, idx) => p.classList.toggle('active', idx === 0));
  document.querySelectorAll('#pricePillsContainer .pill').forEach((p, idx) => p.classList.toggle('active', idx === 0));
  document.querySelectorAll('.nav-item').forEach((p, idx) => p.classList.toggle('active', idx === 0));

  applyFiltersAndSort();
}

// ==================== 5. LIVE SEARCH ====================

function setupLiveSearch() {
  const input = document.getElementById('searchInput');
  const dropdown = document.getElementById('liveSearchDropdown');
  const clearBtn = document.getElementById('clearSearchBtn');

  if (!input || !dropdown) return;

  input.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

    if (!q) {
      dropdown.style.display = 'none';
      return;
    }

    const matches = state.allProducts.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    ).slice(0, 6);

    if (matches.length === 0) {
      dropdown.innerHTML = `<div style="padding: 16px; text-align: center; color: #64748b; font-size: 13px;">Không tìm thấy sản phẩm nào khớp với "${e.target.value}"</div>`;
    } else {
      dropdown.innerHTML = matches.map(p => `
        <div class="live-search-item" onclick="quickViewProduct('${p.id}'); document.getElementById('liveSearchDropdown').style.display='none';">
          <img src="${p.image}" alt="${p.name}">
          <div class="info">
            <h5>${p.name}</h5>
            <div class="prices">
              <span class="sale-p">${formatVND(p.salePrice)}</span>
              <span class="old-p">${formatVND(p.price)}</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    dropdown.style.display = 'block';
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      dropdown.style.display = 'none';
    });
  }

  // Hide on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box-wrap')) {
      dropdown.style.display = 'none';
    }
  });
}

// ==================== 6. PRODUCT QUICK VIEW & DETAILS MODAL ====================

function quickViewProduct(productId) {
  const product = state.allProducts.find(p => p.id === productId);
  if (!product) return;

  const contentEl = document.getElementById('productModalDetailsContent');
  if (!contentEl) return;

  const storageList = product.storageOptions || ['128GB', '256GB'];
  const colorList = product.colors || ['Đen Titan', 'Bạc'];
  const specs = product.specs || {};

  contentEl.innerHTML = `
    <div class="product-detail-layout">
      <!-- Left: Gallery -->
      <div class="detail-gallery">
        <div class="detail-main-img">
          <img id="detailActiveImg" src="${product.image}" alt="${product.name}" onerror="handleImgError(this, '${product.name.replace(/'/g, "\\'")}')">
        </div>
        <div class="detail-thumbs-strip">
          ${(product.gallery && product.gallery.length ? product.gallery : [product.image]).map((gImg, gIdx) => `
            <div class="detail-thumb-box ${gIdx === 0 ? 'active' : ''}" onclick="switchDetailMainImage('${gImg}', this)">
              <img src="${gImg}" alt="${product.name} ${gIdx + 1}" onerror="handleImgError(this, '${product.name.replace(/'/g, "\\'")}')">
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Right: Info -->
      <div class="detail-info">
        <span class="card-brand">${product.brand} - Chính Hãng VN/A</span>
        <h2>${product.name}</h2>
        
        <div class="detail-price-box">
          <span class="detail-sale-p" id="detailModalPrice">${formatVND(product.salePrice)}</span>
          <span class="detail-old-p">${formatVND(product.price)}</span>
          <span class="card-discount-badge">Tiết kiệm ${formatVND(product.price - product.salePrice)}</span>
        </div>

        <!-- Storage Selection -->
        <div class="detail-selector-group">
          <span>Chọn dung lượng bộ nhớ:</span>
          <div class="detail-options-list" id="detailStorageOptions">
            ${storageList.map((opt, idx) => `
              <button class="detail-opt-pill ${idx === 0 ? 'active' : ''}" onclick="selectDetailOption('storage', '${opt}', this)">
                ${opt}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Color Selection -->
        <div class="detail-selector-group">
          <span>Chọn màu sắc:</span>
          <div class="detail-options-list" id="detailColorOptions">
            ${colorList.map((col, idx) => `
              <button class="detail-opt-pill ${idx === 0 ? 'active' : ''}" onclick="selectDetailOption('color', '${col}', this)">
                ${col}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Promo box -->
        <div class="detail-promo-box">
          <h4><i class="fa-solid fa-gift"></i> Ưu Đãi Độc Quyền Tại Di Động Việt</h4>
          <p>• Trợ giá <strong>2.000.000đ</strong> khi Thu cũ lên đời máy mới</p>
          <p>• <strong>Bảo hành 1 đổi 1 trong 33 ngày</strong> đặc quyền duy nhất</p>
          <p>• Tặng củ sạc nhanh chính hãng hoặc gói dán màn hình cao cấp</p>
          <p>• Trả góp 0% qua Home Credit / Shinhan hoặc thẻ tín dụng</p>
        </div>

        <div class="detail-action-buttons">
          <button class="btn-detail-buy-now" onclick="buyNowFromDetail('${product.id}')">
            <i class="fa-solid fa-bolt"></i> Mua Ngay Giá Ưu Đãi
          </button>
          <button class="btn-detail-add-cart" onclick="addToCartFromDetail('${product.id}')">
            <i class="fa-solid fa-cart-shopping"></i> Thêm Giỏ Hàng
          </button>
        </div>

        <!-- Specifications Table -->
        <h4>Thông Số Kỹ Thuật Chi Tiết</h4>
        <table class="specs-table">
          ${Object.entries(specs).map(([k, v]) => `
            <tr>
              <td>${formatSpecKey(k)}</td>
              <td><strong>${v}</strong></td>
            </tr>
          `).join('')}
        </table>
      </div>
    </div>
  `;

  openModal('productDetailModal');
}

function formatSpecKey(key) {
  const map = {
    screen: 'Màn hình',
    chip: 'Chip xử lý',
    ram: 'Bộ nhớ RAM',
    storage: 'Bộ nhớ trong',
    rearCamera: 'Camera sau',
    frontCamera: 'Camera trước',
    battery: 'Pin & Sạc',
    os: 'Hệ điều hành',
    power: 'Công suất',
    waterproof: 'Chống nước',
    features: 'Tính năng đặc biệt',
    status: 'Tình trạng máy',
    warranty: 'Bảo hành'
  };
  return map[key] || key;
}

let activeDetailStorage = '';
let activeDetailColor = '';

function selectDetailOption(type, val, btn) {
  const parent = btn.parentElement;
  parent.querySelectorAll('.detail-opt-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');

  if (type === 'storage') activeDetailStorage = val;
  if (type === 'color') activeDetailColor = val;
}

function switchDetailMainImage(imgUrl, el) {
  const mainImg = document.getElementById('detailActiveImg');
  if (mainImg) {
    mainImg.style.opacity = '0.3';
    setTimeout(() => {
      mainImg.src = imgUrl;
      mainImg.style.opacity = '1';
    }, 150);
  }
  if (el) {
    document.querySelectorAll('.detail-thumb-box').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
  }
}

function addToCartFromDetail(productId) {
  const product = state.allProducts.find(p => p.id === productId);
  if (!product) return;

  const storage = activeDetailStorage || (product.storageOptions ? product.storageOptions[0] : 'Tiêu chuẩn');
  const color = activeDetailColor || (product.colors ? product.colors[0] : 'Đen');

  addToCart(productId, storage, color);
  closeModal('productDetailModal');
}

function buyNowFromDetail(productId) {
  if (!state.currentUser) {
    showToast('Vui lòng đăng nhập tài khoản khách hàng để mua sắm.', 'error');
    openModal('authModal');
    return;
  }

  addToCartFromDetail(productId);
  toggleCartDrawer(true);
}

// ==================== 7. SHOPPING CART SYSTEM ====================

function addToCart(productId, storage = '', color = '') {
  if (!state.currentUser) {
    showToast('Vui lòng đăng nhập tài khoản khách hàng để sử dụng giỏ hàng.', 'error');
    openModal('authModal');
    return;
  }

  const product = state.allProducts.find(p => p.id === productId);
  if (!product) return;

  const finalStorage = storage || (product.storageOptions ? product.storageOptions[0] : 'Tiêu chuẩn');
  const finalColor = color || (product.colors ? product.colors[0] : 'Đen');

  const existingIndex = state.cart.findIndex(
    item => item.id === productId && item.storage === finalStorage && item.color === finalColor
  );

  if (existingIndex > -1) {
    state.cart[existingIndex].quantity += 1;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      storage: finalStorage,
      color: finalColor,
      price: product.salePrice,
      image: product.image,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast(`Đã thêm ${product.name} (${finalStorage}) vào giỏ hàng!`);
}

function updateCartItemQty(index, delta) {
  if (!state.cart[index]) return;
  state.cart[index].quantity += delta;
  if (state.cart[index].quantity <= 0) {
    state.cart.splice(index, 1);
  }
  saveCart();
  updateCartUI();
}

function removeCartItem(index) {
  state.cart.splice(index, 1);
  saveCart();
  updateCartUI();
  showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
}

function saveCart() {
  localStorage.setItem('ddv_cart', JSON.stringify(state.cart));
}

function calculateCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;
  if (state.appliedVoucher) {
    if (subtotal >= state.appliedVoucher.minOrder) {
      discount = state.appliedVoucher.discount;
    } else {
      state.appliedVoucher = null;
    }
  }
  const finalTotal = Math.max(0, subtotal - discount);
  return { subtotal, discount, finalTotal };
}

function updateCartUI() {
  const countBadge = document.getElementById('cartCountBadge');
  const headerTotal = document.getElementById('cartHeaderTotal');
  const drawerCount = document.getElementById('cartDrawerItemCount');
  const drawerItems = document.getElementById('cartDrawerItems');
  const subtotalText = document.getElementById('cartSubtotalText');
  const discountRow = document.getElementById('cartDiscountRow');
  const discountText = document.getElementById('cartDiscountText');
  const finalTotalText = document.getElementById('cartFinalTotalText');

  const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const { subtotal, discount, finalTotal } = calculateCartTotals();

  if (countBadge) countBadge.innerText = totalQty;
  if (headerTotal) headerTotal.innerText = formatVND(finalTotal);
  if (drawerCount) drawerCount.innerText = totalQty;

  if (subtotalText) subtotalText.innerText = formatVND(subtotal);
  if (finalTotalText) finalTotalText.innerText = formatVND(finalTotal);

  if (discountRow) {
    if (discount > 0) {
      discountRow.style.display = 'flex';
      discountText.innerText = `-${formatVND(discount)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  if (drawerItems) {
    if (state.cart.length === 0) {
      drawerItems.innerHTML = `
        <div style="text-align: center; padding: 40px 10px; color: #64748b;">
          <i class="fa-solid fa-cart-shopping" style="font-size: 40px; margin-bottom: 12px; color: #cbd5e1;"></i>
          <p>Giỏ hàng của bạn đang trống!</p>
          <button class="btn-card-buy" style="margin: 14px auto 0; width: auto;" onclick="toggleCartDrawer(false)">
            Tiếp tục mua sắm
          </button>
        </div>
      `;
    } else {
      drawerItems.innerHTML = state.cart.map((item, idx) => `
        <div class="cart-item-row">
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-info">
            <h5 class="cart-item-title">${item.name}</h5>
            <div class="cart-item-variant">${item.storage} • Màu: ${item.color}</div>
            <div class="cart-item-price-qty">
              <span class="cart-item-price">${formatVND(item.price)}</span>
              <div class="qty-control">
                <button class="qty-btn" onclick="updateCartItemQty(${idx}, -1)">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn" onclick="updateCartItemQty(${idx}, 1)">+</button>
              </div>
            </div>
          </div>
          <button class="btn-remove-item" onclick="removeCartItem(${idx})"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      `).join('');
    }
  }
}

function setShoppingCartVisibility(isVisible) {
  const cartButton = document.querySelector('.btn-cart');
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');

  if (cartButton) cartButton.style.display = isVisible ? 'flex' : 'none';
  if (!isVisible) {
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.style.display = 'none';
  }
}

function toggleCartDrawer(forceOpen = null) {
  if (!state.currentUser) {
    showToast('Vui lòng đăng nhập tài khoản khách hàng để sử dụng giỏ hàng.', 'error');
    openModal('authModal');
    return;
  }

  const adminView = document.getElementById('adminView');
  if (adminView && adminView.style.display !== 'none') {
    showToast('Giỏ hàng chỉ dành cho khách hàng mua sắm.', 'error');
    return;
  }

  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (!drawer || !overlay) return;

  const isOpen = drawer.classList.contains('open');
  const targetState = forceOpen !== null ? forceOpen : !isOpen;

  drawer.classList.toggle('open', targetState);
  overlay.style.display = targetState ? 'block' : 'none';
}

// ==================== 8. VOUCHERS ====================

async function applyVoucher() {
  const input = document.getElementById('cartVoucherInput');
  const msgDiv = document.getElementById('voucherMessage');
  if (!input || !msgDiv) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    msgDiv.innerText = 'Vui lòng nhập mã ưu đãi';
    msgDiv.style.color = '#ef4444';
    return;
  }

  const { subtotal } = calculateCartTotals();

  try {
    const res = await fetch(`${API_BASE}/api/vouchers/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, orderTotal: subtotal })
    });
    const data = await res.json();

    if (data.success) {
      state.appliedVoucher = data.data;
      msgDiv.innerText = data.message;
      msgDiv.style.color = '#16a34a';
      showToast(data.message);
      updateCartUI();
    } else {
      msgDiv.innerText = data.message;
      msgDiv.style.color = '#ef4444';
    }
  } catch (err) {
    msgDiv.innerText = 'Lỗi kết nối voucher';
    msgDiv.style.color = '#ef4444';
  }
}

// ==================== 9. CHECKOUT & VIETQR ====================

let selectedPaymentMethod = 'vietqr';
let selectedDeliveryMethod = '1h';

function openCheckoutModal() {
  if (!state.currentUser) {
    showToast('Vui lòng đăng nhập tài khoản khách hàng để đặt hàng.', 'error');
    openModal('authModal');
    return;
  }

  const adminView = document.getElementById('adminView');
  if (adminView && adminView.style.display !== 'none') {
    showToast('Admin không thể sử dụng giỏ hàng mua sắm.', 'error');
    return;
  }

  if (state.cart.length === 0) {
    showToast('Giỏ hàng của bạn đang trống!', 'error');
    return;
  }

  toggleCartDrawer(false);
  const { finalTotal } = calculateCartTotals();

  const finalAmountEl = document.getElementById('checkoutFinalAmountText');
  if (finalAmountEl) finalAmountEl.innerText = formatVND(finalTotal);

  if (state.currentUser) {
    const nameInput = document.getElementById('checkoutName');
    const phoneInput = document.getElementById('checkoutPhone');
    if (nameInput && !nameInput.value) nameInput.value = state.currentUser.name || '';
    if (phoneInput && !phoneInput.value) phoneInput.value = state.currentUser.phone || '';
  }

  updateVietQRPreview(finalTotal);
  openModal('checkoutModal');
}

function updateVietQRPreview(amount) {
  const qrImg = document.getElementById('vietqrCodeImg');
  const qrAmountText = document.getElementById('vietqrAmountText');
  const qrBox = document.getElementById('vietqrPreviewBox');

  if (qrBox) {
    qrBox.style.display = selectedPaymentMethod === 'vietqr' ? 'block' : 'none';
  }

  if (selectedPaymentMethod === 'vietqr') {
    // Generate VietQR URL dynamically
    const qrUrl = `https://img.vietqr.io/image/MB-0903123456-compact2.png?amount=${amount}&addInfo=DDV%20THANHTOAN&accountName=DI%20DONG%20VIET%20STORE`;
    if (qrImg) qrImg.src = qrUrl;
    if (qrAmountText) qrAmountText.innerText = formatVND(amount);
  }
}

function selectDeliveryMethod(method, el) {
  selectedDeliveryMethod = method;
  document.querySelectorAll('.delivery-opt').forEach(opt => opt.classList.remove('active'));
  el.classList.add('active');

  const addrGroup = document.getElementById('deliveryAddressGroup');
  if (addrGroup) {
    addrGroup.style.display = method === 'store' ? 'none' : 'block';
  }
}

function selectPaymentMethod(method, el) {
  selectedPaymentMethod = method;
  document.querySelectorAll('.pay-method-card').forEach(card => card.classList.remove('active'));
  el.classList.add('active');

  const { finalTotal } = calculateCartTotals();
  updateVietQRPreview(finalTotal);
}

async function handlePlaceOrder(e) {
  e.preventDefault();

  const name = document.getElementById('checkoutName').value.trim();
  const phone = document.getElementById('checkoutPhone').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();

  if (!name || !phone) {
    showToast('Vui lòng điền đủ họ tên và SĐT!', 'error');
    return;
  }

  const { subtotal, discount, finalTotal } = calculateCartTotals();

  const orderPayload = {
    customerName: name,
    phone,
    address: selectedDeliveryMethod === 'store' ? 'Nhận tại Siêu thị Di Động Việt' : address,
    deliveryMethod: selectedDeliveryMethod,
    paymentMethod: selectedPaymentMethod,
    items: state.cart,
    voucherCode: state.appliedVoucher ? state.appliedVoucher.code : '',
    discountAmount: discount,
    totalAmount: finalTotal
  };

  const btn = document.getElementById('btnSubmitOrder');
  btn.disabled = true;
  btn.innerText = 'Đang xử lý đơn hàng...';

  try {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const data = await res.json();

    btn.disabled = false;
    btn.innerText = 'Hoàn Tất Đặt Hàng';

    if (data.success) {
      // Clear cart
      state.cart = [];
      state.appliedVoucher = null;
      saveCart();
      updateCartUI();
      closeModal('checkoutModal');
      await syncAllData();

      showToast(data.message, 'success');

      // Automatically open tracking modal with this order
      setTimeout(() => {
        openModal('orderLookupModal');
        const input = document.getElementById('orderLookupInput');
        if (input) input.value = data.data.id;
        handleOrderLookup(new Event('submit'));
      }, 600);
    } else {
      showToast(data.message || 'Lỗi đặt hàng', 'error');
    }
  } catch (err) {
    btn.disabled = false;
    btn.innerText = 'Hoàn Tất Đặt Hàng';
    showToast('Lỗi server đặt hàng, vui lòng thử lại', 'error');
  }
}

// ==================== 10. ORDER LOOKUP ====================

async function handleOrderLookup(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('orderLookupInput');
  const resultsDiv = document.getElementById('orderLookupResults');
  if (!input || !resultsDiv) return;

  const query = input.value.trim();
  if (!query) return;

  resultsDiv.innerHTML = '<div style="padding: 20px; text-align: center;"><i class="fa-solid fa-spinner fa-spin"></i> Đang tra cứu dữ liệu...</div>';

  try {
    const isId = query.toUpperCase().startsWith('DDV-');
    const param = isId ? `id=${query}` : `phone=${query}`;
    const res = await fetch(`${API_BASE}/api/orders?${param}`);
    const json = await res.json();

    if (!json.success || !json.data) {
      resultsDiv.innerHTML = `<div style="color: #ef4444; padding: 14px; text-align: center;">${json.message || 'Không tìm thấy đơn hàng nào khớp với thông tin này!'}</div>`;
      return;
    }

    const orders = Array.isArray(json.data) ? json.data : [json.data];
    if (orders.length === 0) {
      resultsDiv.innerHTML = `<div style="color: #64748b; padding: 14px; text-align: center;">Không có đơn hàng nào cho số điện thoại ${query}.</div>`;
      return;
    }

    resultsDiv.innerHTML = orders.map(order => renderOrderTrackingCard(order)).join('');
  } catch (err) {
    resultsDiv.innerHTML = '<div style="color: #ef4444; padding: 14px; text-align: center;">Lỗi tra cứu đơn hàng, vui lòng thử lại sau!</div>';
  }
}

function renderOrderTrackingCard(order) {
  const steps = [
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'preparing', label: 'Đang chuẩn bị' },
    { key: 'shipping', label: 'Đang giao hàng' },
    { key: 'completed', label: 'Hoàn thành' }
  ];

  const currentIdx = steps.findIndex(s => s.key === order.status);

  return `
    <div class="lookup-order-card">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
        <strong style="font-size: 16px; color: var(--primary);">Mã Đơn: ${order.id}</strong>
        <span style="font-size: 12.5px; color: #64748b;">${order.createdAt}</span>
      </div>

      <div style="font-size: 13px; margin-bottom: 12px; color: #334155;">
        <div>Người nhận: <strong>${order.customerName}</strong> (${order.phone})</div>
        <div>Địa chỉ: <strong>${order.address}</strong></div>
        <div>Thanh toán: <strong>${order.paymentMethod.toUpperCase()}</strong> - Trạng thái: <span class="status-badge ${order.paymentStatus === 'paid' ? 'completed' : 'pending'}">${order.paymentStatus === 'paid' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}</span></div>
      </div>

      <!-- Stepper -->
      <div class="order-stepper">
        ${steps.map((step, idx) => {
          let nodeClass = '';
          if (order.status === 'cancelled') {
            nodeClass = '';
          } else if (idx < currentIdx) {
            nodeClass = 'completed';
          } else if (idx === currentIdx) {
            nodeClass = 'active';
          }
          return `
            <div class="step-node ${nodeClass}">
              <div class="step-circle">${idx < currentIdx ? '<i class="fa-solid fa-check"></i>' : idx + 1}</div>
              <span class="step-label">${step.label}</span>
            </div>
          `;
        }).join('')}
      </div>

      ${order.status === 'cancelled' ? '<div style="background: #fee2e2; color: #b91c1c; padding: 6px 12px; border-radius: 4px; font-size: 12.5px; margin-bottom: 10px;">Đơn hàng này đã bị hủy.</div>' : ''}

      <!-- Items -->
      <div style="border-top: 1px dashed #e2e8f0; padding-top: 10px; margin-top: 10px;">
        ${order.items.map(i => `
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
            <span>• ${i.name} (${i.storage}) x ${i.quantity}</span>
            <strong>${formatVND(i.price * i.quantity)}</strong>
          </div>
        `).join('')}
        ${order.discountAmount ? `<div style="display: flex; justify-content: space-between; font-size: 12.5px; color: #16a34a;"><span>Giảm Voucher:</span> <strong>-${formatVND(order.discountAmount)}</strong></div>` : ''}
        <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; color: var(--primary); margin-top: 6px;">
          <span>Tổng thanh toán:</span>
          <span>${formatVND(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  `;
}

// ==================== 11. THU CŨ ĐỔI MỚI (TRADE-IN) ====================

function populateTradeInModels() {
  const brandSelect = document.getElementById('tradeInBrand');
  if (!brandSelect) return;
  handleTradeInBrandChange();
}

function handleTradeInBrandChange() {
  const brand = document.getElementById('tradeInBrand').value;
  const modelSelect = document.getElementById('tradeInModel');
  if (!modelSelect) return;

  const models = TRADE_IN_MODELS[brand] || TRADE_IN_MODELS['Apple'];
  modelSelect.innerHTML = models.map(m => `
    <option value="${m.name}" data-base="${m.basePrice}">${m.name}</option>
  `).join('');

  calculateTradeInEstimate();
}

function calculateTradeInEstimate() {
  const modelSelect = document.getElementById('tradeInModel');
  const condSelect = document.getElementById('tradeInCondition');
  const screenSelect = document.getElementById('tradeInScreen');
  const baseEl = document.getElementById('tradeInBasePrice');
  const finalEl = document.getElementById('tradeInFinalPrice');

  if (!modelSelect || !condSelect || !screenSelect) return;

  const selectedOpt = modelSelect.selectedOptions[0];
  const base = Number(selectedOpt.getAttribute('data-base')) || 12000000;
  const condMultiplier = Number(condSelect.value) || 1.0;
  const screenMultiplier = Number(screenSelect.value) || 1.0;

  const calculatedBase = Math.round(base * condMultiplier * screenMultiplier);
  const subsidy = 2000000; // Trợ giá 2 Tr
  const finalVal = calculatedBase + subsidy;

  if (baseEl) baseEl.innerText = formatVND(calculatedBase);
  if (finalEl) finalEl.innerText = formatVND(finalVal);
}

const tradeInForm = document.getElementById('tradeInForm');
if (tradeInForm) {
  tradeInForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('tradeInName').value.trim();
    const phone = document.getElementById('tradeInPhone').value.trim();
    const brand = document.getElementById('tradeInBrand').value;
    const model = document.getElementById('tradeInModel').value;
    const store = document.getElementById('tradeInStoreSelect').value;

    const baseValText = document.getElementById('tradeInBasePrice').innerText.replace(/[^\d]/g, '');
    const finalValText = document.getElementById('tradeInFinalPrice').innerText.replace(/[^\d]/g, '');

    const payload = {
      customerName: name,
      phone,
      oldBrand: brand,
      oldModel: model,
      estimatedValue: Number(baseValText),
      preferredStore: store
    };

    try {
      const res = await fetch(`${API_BASE}/api/trade-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message, 'success');
        tradeInForm.reset();
        handleTradeInBrandChange();
      } else {
        showToast(data.message || 'Lỗi gửi yêu cầu', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ', 'error');
    }
  });
}

// ==================== 12. PRODUCT COMPARATOR ====================

function toggleCompare(productId) {
  const idx = state.compareList.indexOf(productId);
  if (idx > -1) {
    state.compareList.splice(idx, 1);
    showToast('Đã bỏ sản phẩm khỏi so sánh', 'info');
  } else {
    if (state.compareList.length >= 3) {
      showToast('Chỉ có thể so sánh tối đa 3 sản phẩm cùng lúc!', 'error');
      return;
    }
    state.compareList.push(productId);
    showToast('Đã thêm vào danh sách so sánh!');
  }

  updateCompareBar();
  applyFiltersAndSort();
}

function updateCompareBar() {
  const bar = document.getElementById('compareBar');
  const countEl = document.getElementById('compareCount');
  const thumbsContainer = document.getElementById('compareThumbnails');

  if (!bar || !countEl || !thumbsContainer) return;

  if (state.compareList.length === 0) {
    bar.style.display = 'none';
    return;
  }

  bar.style.display = 'block';
  countEl.innerText = state.compareList.length;

  const compareProducts = state.compareList.map(id => state.allProducts.find(p => p.id === id)).filter(Boolean);
  thumbsContainer.innerHTML = compareProducts.map(p => `
    <div class="compare-thumb-item">
      <img src="${p.image}" alt="${p.name}">
      <button class="btn-remove-thumb" onclick="toggleCompare('${p.id}')"><i class="fa-solid fa-xmark"></i></button>
    </div>
  `).join('');
}

function clearCompareList() {
  state.compareList = [];
  updateCompareBar();
  applyFiltersAndSort();
}

function openCompareModal() {
  if (state.compareList.length < 2) {
    showToast('Vui lòng chọn ít nhất 2 sản phẩm để so sánh!', 'error');
    return;
  }

  const table = document.getElementById('compareSpecsTable');
  if (!table) return;

  const prods = state.compareList.map(id => state.allProducts.find(p => p.id === id)).filter(Boolean);

  const specRows = [
    { label: 'Hình ảnh', render: p => `<img src="${p.image}" style="max-height: 120px; object-fit: contain;">` },
    { label: 'Tên sản phẩm', render: p => `<strong>${p.name}</strong>` },
    { label: 'Giá bán', render: p => `<strong style="color: var(--primary); font-size: 16px;">${formatVND(p.salePrice)}</strong>` },
    { label: 'Giá gốc', render: p => `<span style="text-decoration: line-through; color: #94a3b8;">${formatVND(p.price)}</span>` },
    { label: 'Màn hình', render: p => p.specs?.screen || 'N/A' },
    { label: 'Chip xử lý', render: p => p.specs?.chip || 'N/A' },
    { label: 'RAM / Bộ nhớ', render: p => `${p.specs?.ram || ''} / ${p.specs?.storage || ''}` },
    { label: 'Camera sau', render: p => p.specs?.rearCamera || 'N/A' },
    { label: 'Pin & Sạc', render: p => p.specs?.battery || 'N/A' },
    { label: 'Hệ điều hành', render: p => p.specs?.os || 'N/A' },
    { label: 'Hành động', render: p => `<button class="btn-card-buy" style="width: 100%;" onclick="closeModal('compareModal'); addToCart('${p.id}')">Mua Ngay</button>` }
  ];

  table.innerHTML = `
    <thead>
      <tr>
        <th style="width: 180px;">Tiêu chí</th>
        ${prods.map(p => `<th>${p.name}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${specRows.map(row => `
        <tr>
          <td><strong>${row.label}</strong></td>
          ${prods.map(p => `<td>${row.render(p)}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  `;

  openModal('compareModal');
}

// ==================== 13. STORES ====================

let allStores = [];

async function fetchStores() {
  try {
    const res = await fetch(`${API_BASE}/api/stores`);
    const json = await res.json();
    if (json.success) {
      allStores = json.data;
      renderQuickStores();
      renderFullStores('all');
    }
  } catch (err) {}
}

function renderQuickStores() {
  const container = document.getElementById('storesQuickList');
  if (!container) return;

  container.innerHTML = allStores.slice(0, 3).map(store => `
    <div class="store-card">
      <div class="store-card-city">${store.city}</div>
      <div class="store-card-address"><i class="fa-solid fa-location-dot text-danger"></i> ${store.address}</div>
      <div class="store-card-meta">
        <div><i class="fa-solid fa-clock"></i> ${store.hours}</div>
        <div><i class="fa-solid fa-phone"></i> ${store.phone}</div>
      </div>
    </div>
  `).join('');
}

function filterStoresCity(city, btn) {
  if (btn) {
    document.querySelectorAll('.store-city-filter .city-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  renderFullStores(city);
}

function renderFullStores(city) {
  const container = document.getElementById('storesFullList');
  if (!container) return;

  const list = city === 'all' ? allStores : allStores.filter(s => s.city === city);
  container.innerHTML = list.map(store => `
    <div class="store-card" style="margin-bottom: 12px;">
      <div class="store-card-city">${store.city} - ${store.district}</div>
      <div class="store-card-address"><i class="fa-solid fa-location-dot text-danger"></i> ${store.address}</div>
      <div class="store-card-meta" style="margin-bottom: 8px;">
        <div><i class="fa-solid fa-clock"></i> Giờ mở cửa: ${store.hours}</div>
        <div><i class="fa-solid fa-phone"></i> Hotline: ${store.phone}</div>
      </div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        ${(store.features || []).map(f => `<span class="badge-tag tra-gop">${f}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// ==================== 14. CHATBOT ASSISTANT ====================

function toggleChatbot() {
  const win = document.getElementById('chatbotWindow');
  if (win) {
    win.style.display = win.style.display === 'none' ? 'flex' : 'none';
  }
}

function sendQuickChat(text) {
  const input = document.getElementById('chatInput');
  if (input) {
    input.value = text;
    handleChatSubmit(new Event('submit'));
  }
}

function handleChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('chatInput');
  const container = document.getElementById('chatMessages');
  if (!input || !container) return;

  const text = input.value.trim();
  if (!text) return;

  // Append user bubble
  container.innerHTML += `<div class="chat-bubble user">${text}</div>`;
  input.value = '';
  container.scrollTop = container.scrollHeight;

  // Bot thinking reply
  setTimeout(() => {
    const reply = generateBotReply(text);
    container.innerHTML += `<div class="chat-bubble bot">${reply}</div>`;
    container.scrollTop = container.scrollHeight;
  }, 400);
}

function generateBotReply(query) {
  const q = query.toLowerCase();

  if (q.includes('16 pro max') || q.includes('iphone 16')) {
    return 'Dạ <strong>iPhone 16 Pro Max 256GB</strong> đang sẵn hàng tại Di Động Việt với giá ưu đãi chỉ <strong>34.490.000đ</strong>, trợ giá thu cũ lên đến 2 triệu đồng và trả góp 0%! Bạn có muốn xem máy ngay không ạ?';
  }
  if (q.includes('15 đến 20') || q.includes('10 đến 15') || q.includes('triệu')) {
    return 'Dạ tầm giá 15 - 20 triệu, Di Động Việt có những mẫu bán chạy nhất: <br>• <strong>iPhone 15 128GB</strong>: 18.790.000đ<br>• <strong>iPhone 14 Pro Max Cũ 99%</strong>: 17.890.000đ (Bảo hành 1 đổi 1 33 ngày)<br>• <strong>iPad Air M2</strong>: 15.790.000đ!';
  }
  if (q.includes('thu cũ') || q.includes('đổi mới') || q.includes('lên đời')) {
    return 'Dạ chính sách <strong>Thu Cũ Đổi Mới</strong> tại Di Động Việt trợ giá thêm đến <strong>2.000.000đ - 5.000.000đ</strong>! Không cần bù nhiều tiền, máy cũ trầy xước nhẹ vẫn thu giá cao. Bạn có thể kéo xuống phần "Thu Cũ Đổi Mới" để tính giá ngay nhé!';
  }
  if (q.includes('trả góp') || q.includes('lãi suất') || q.includes('cccd')) {
    return 'Dạ Di Động Việt hỗ trợ <strong>Trả Góp 0% Lãi Suất</strong>, không cần trả trước (0đ trả trước). Chỉ cần CCCD gắn chip, xét duyệt online trong 3 phút là nhận máy ngay ạ!';
  }
  if (q.includes('bảo hành') || q.includes('đổi trả')) {
    return 'Dạ đặc quyền vượt trội tại Di Động Việt là chính sách <strong>1 ĐỔI 1 TRONG 33 NGÀY</strong> nếu máy có lỗi phần cứng từ nhà sản xuất, bảo hành rơi vỡ và sửa chữa uy tín 100% linh kiện chính hãng!';
  }

  return 'Dạ Di Động Việt đã nhận thông tin từ bạn! Hotline miễn phí <strong>1800.6018</strong> luôn sẵn sàng tư vấn trực tiếp 24/7 hoặc bạn có thể ghé cửa hàng gần nhất để trải nghiệm máy nhé!';
}

// ==================== 15. USER AUTH ====================

function openAdminLoginPortal() {
  closeModal('authModal');
  openModal('adminAuthModal');
}

function openCustomerLoginPortal() {
  closeModal('adminAuthModal');
  openModal('authModal');
  switchAuthTab('login');
}

function switchAuthTab(tab) {
  document.getElementById('tabLoginBtn').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegisterBtn').classList.toggle('active', tab === 'register');
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

function handleUserHeaderClick() {
  const adminView = document.getElementById('adminView');
  if (adminView && adminView.style.display !== 'none') {
    showToast('Bạn đang ở Cổng Quản Trị Admin. Hãy dùng tài khoản Admin tại cổng riêng.', 'error');
    return;
  }

  if (state.currentUser) {
    openCustomerAccountModal();
  } else {
    openModal('authModal');
  }
}

async function handleCustomerLogin(e) {
  e.preventDefault();

  const loginValue = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!loginValue || !password) {
    showToast('Vui lòng nhập đầy đủ thông tin đăng nhập!', 'error');
    return;
  }

  const submitButton = e.target.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginValue, password })
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      showToast(result.message || 'Đăng nhập thất bại!', 'error');
      return;
    }

    state.currentUser = result.data;
    localStorage.setItem('ddv_user', JSON.stringify(state.currentUser));
    enforceCustomerView();
    updateAuthUI();
    closeModal('authModal');
    showToast(`Chào mừng ${result.data.name} quay trở lại Di Động Việt!`);
  } catch (error) {
    showToast('Không thể kết nối máy chủ. Vui lòng thử lại!', 'error');
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

async function handleCustomerRegister(e) {
  e.preventDefault();

  const name = document.getElementById('regName').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;

  if (!name || !phone || !password) {
    showToast('Vui lòng điền đầy đủ họ tên, số điện thoại và mật khẩu!', 'error');
    return;
  }

  const submitButton = e.target.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;
  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, password })
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      showToast(result.message || 'Đăng ký thất bại!', 'error');
      if (response.status === 409) switchAuthTab('login');
      return;
    }

    state.currentUser = result.data;
    localStorage.setItem('ddv_user', JSON.stringify(state.currentUser));
    enforceCustomerView();
    updateAuthUI();
    closeModal('authModal');
    showToast(`Đăng ký thành công! Chào mừng ${name}`);
  } catch (error) {
    showToast('Không thể kết nối máy chủ. Vui lòng thử lại!', 'error');
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

async function fillAndLoginCustomer(phone, password) {
  const userField = document.getElementById('loginUsername');
  const passField = document.getElementById('loginPassword');
  if (userField) userField.value = phone;
  if (passField) passField.value = password;

  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: phone, password })
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      showToast(result.message || 'Đăng nhập thất bại!', 'error');
      return;
    }

    state.currentUser = result.data;
    localStorage.setItem('ddv_user', JSON.stringify(state.currentUser));
    enforceCustomerView();
    updateAuthUI();
    closeModal('authModal');
    showToast(`Đăng nhập thành công! Xin chào ${result.data.name} (${result.data.tier})`);
  } catch (error) {
    showToast('Không thể kết nối máy chủ. Vui lòng thử lại!', 'error');
  }
}

function demoLoginVIP() {
  fillAndLoginCustomer('0903123456', '123456');
}

async function openCustomerAccountModal() {
  if (!state.currentUser) {
    openModal('authModal');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/profile?phone=${encodeURIComponent(state.currentUser.phone)}`);
    const json = await res.json();
    if (json.success && json.data) {
      state.currentUser = { ...state.currentUser, ...json.data };
      localStorage.setItem('ddv_user', JSON.stringify(state.currentUser));
    }
  } catch (err) {}

  const u = state.currentUser;
  const nameEl = document.getElementById('accModalName');
  const tierEl = document.getElementById('accModalTier');
  const phoneEl = document.getElementById('accModalPhone');
  const emailEl = document.getElementById('accModalEmail');
  const ordersCountEl = document.getElementById('accModalOrdersCount');
  const totalSpentEl = document.getElementById('accModalTotalSpent');
  const joinedAtEl = document.getElementById('accModalJoinedAt');

  if (nameEl) nameEl.innerText = u.name || 'Khách Hàng DDV';
  if (tierEl) {
    tierEl.innerText = u.tier || 'Hội Viên Mới';
    tierEl.className = 'account-tier-badge ' + (u.tier ? u.tier.toLowerCase().replace(/\s+/g, '-') : '');
  }
  if (phoneEl) phoneEl.innerText = u.phone || 'Chưa cập nhật';
  if (emailEl) emailEl.innerText = u.email || `${u.phone}@didongviet.vn`;
  if (ordersCountEl) ordersCountEl.innerText = `${u.ordersCount || 0} đơn hàng`;
  if (totalSpentEl) totalSpentEl.innerText = formatVND(u.totalSpent || 0);
  if (joinedAtEl) joinedAtEl.innerText = u.joinedAt || 'Thành viên thân thiết';

  loadMyOrders();
  openModal('customerAccountModal');
}

async function loadMyOrders() {
  const container = document.getElementById('myOrdersList');
  if (!container || !state.currentUser) return;

  container.innerHTML = '<div class="orders-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải đơn hàng...</div>';

  try {
    const res = await fetch(`${API_BASE}/api/orders?phone=${encodeURIComponent(state.currentUser.phone)}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      container.innerHTML = json.data.map(order => {
        const statusMap = {
          pending: { label: 'Chờ xử lý', class: 'pending' },
          confirmed: { label: 'Đã xác nhận', class: 'pending' },
          shipping: { label: 'Đang giao hàng', class: 'shipping' },
          completed: { label: 'Đã hoàn thành', class: 'completed' },
          cancelled: { label: 'Đã hủy', class: 'cancelled' }
        };
        const st = statusMap[order.status] || { label: order.status, class: 'pending' };
        const itemsSummary = (order.items || []).map(it => `
          <div class="my-order-item">
            <img src="${it.image}" alt="${it.name}" onerror="handleImgError(this)">
            <div class="item-info">
              <strong>${it.name}</strong>
              <span>${it.color || ''} ${it.storage ? '| ' + it.storage : ''} x${it.quantity || 1}</span>
            </div>
            <strong class="item-price">${formatVND(it.price * (it.quantity || 1))}</strong>
          </div>
        `).join('');

        return `
          <div class="my-order-card">
            <div class="my-order-head">
              <div class="order-code-date">
                <strong>#${order.id}</strong>
                <span class="order-date"><i class="fa-regular fa-clock"></i> ${order.createdAt}</span>
              </div>
              <span class="status-badge ${st.class}">${st.label}</span>
            </div>
            <div class="my-order-items-list">
              ${itemsSummary}
            </div>
            <div class="my-order-footer">
              <span>Phương thức: <strong>${order.paymentMethod === 'vietqr' ? 'VietQR Pro' : 'Tiền mặt khi nhận'}</strong></span>
              <div class="order-total-block">
                <span>Tổng thanh toán:</span>
                <strong class="total-price">${formatVND(order.totalAmount)}</strong>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      container.innerHTML = `
        <div class="empty-orders-state">
          <i class="fa-solid fa-box-open"></i>
          <p>Bạn chưa có đơn hàng nào với số điện thoại này.</p>
          <button class="btn-shop-now" onclick="closeModal('customerAccountModal')">Khám Phá Mua Sắm Ngay</button>
        </div>
      `;
    }
  } catch (err) {
    container.innerHTML = '<div class="orders-error">Không thể tải danh sách đơn hàng.</div>';
  }
}

async function logoutCustomer(e) {
  if (e) e.stopPropagation();

  try {
    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
  } catch (err) {}

  state.currentUser = null;
  localStorage.removeItem('ddv_user');
  state.appliedVoucher = null;
  closeModal('customerAccountModal');
  setShoppingCartVisibility(false);
  updateAuthUI();
  showToast('Đã đăng xuất tài khoản khách hàng thành công!');
}

function updateAuthUI() {
  const el = document.getElementById('userHeaderAction');
  const quickLogoutBtn = document.getElementById('btnQuickLogout');
  const adminSwitchButton = document.getElementById('headerAdminBtn');
  if (!el) return;

  if (state.currentUser) {
    const displayName = state.currentUser.name ? state.currentUser.name.split(' ').pop() : 'Tài khoản';
    el.innerHTML = `
      <span class="sub user-tier-badge-sub">${state.currentUser.tier || 'Thành viên'}</span>
      <strong>${displayName}</strong>
    `;
    if (quickLogoutBtn) quickLogoutBtn.style.display = 'inline-flex';
    if (adminSwitchButton) adminSwitchButton.style.display = 'none';
    setShoppingCartVisibility(true);
  } else {
    el.innerHTML = `
      <span class="sub">Xin chào</span>
      <strong>Tài khoản</strong>
    `;
    if (quickLogoutBtn) quickLogoutBtn.style.display = 'none';
    if (adminSwitchButton) adminSwitchButton.style.display = hasAdminSession() ? 'inline-flex' : 'none';
    setShoppingCartVisibility(false);
  }
}

// ==================== 16. ADMIN PORTAL LOGIC ====================

let currentAdminTab = 'dashboard';

function handleAdminBtnClick() {
  const customerView = document.getElementById('customerView');
  const adminView = document.getElementById('adminView');

  if (customerView && customerView.style.display === 'none' && adminView && adminView.style.display !== 'none') {
    switchToAdminPortal();
    return;
  }

  if (hasAdminSession()) {
    switchToAdminPortal();
    return;
  }
  openModal('adminAuthModal');
}

function switchToAdminPortal() {
  if (!hasAdminSession()) {
    openModal('adminAuthModal');
    return;
  }

  const adminView = document.getElementById('adminView');
  if (adminView && adminView.style.display === 'none') {
    toggleAdminView();
  }
}

function toggleAdminView() {
  const customerView = document.getElementById('customerView');
  const adminView = document.getElementById('adminView');
  const label = document.getElementById('adminSwitchLabel');

  const isAdmin = adminView.style.display !== 'none';

  if (isAdmin) {
    // Back to Customer
    adminView.style.display = 'none';
    customerView.style.display = 'block';
    setShoppingCartVisibility(true);
    label.innerText = 'Quản Trị Admin';
  } else {
    if (!hasAdminSession()) {
      openModal('adminAuthModal');
      return;
    }
    // Switch to Admin
    closeModal('authModal');
    closeModal('customerAccountModal');
    customerView.style.display = 'none';
    adminView.style.display = 'block';
    setShoppingCartVisibility(false);
    label.innerText = 'Về Shop';

    // Cập nhật thông tin Admin trong sidebar
    const adminNameEl = document.getElementById('adminSidebarName');
    const adminEmailEl = document.getElementById('adminSidebarEmail');
    if (adminNameEl && state.currentAdmin) adminNameEl.innerText = state.currentAdmin.name || 'Super Admin DDV';
    if (adminEmailEl && state.currentAdmin) adminEmailEl.innerText = state.currentAdmin.email || 'admin@didongviet.vn';

    loadAdminStats();
    loadAdminProducts();
    loadAdminOrders();
    loadAdminCustomers();
    loadAdminTradeIns();
    loadAdminVouchers();
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();
  if (state.currentUser) {
    showToast('Bạn đang đăng nhập tài khoản khách hàng. Vui lòng đăng xuất khách hàng trước khi vào Admin.', 'error');
    return;
  }

  const email = document.getElementById('adminLoginEmail').value.trim();
  const password = document.getElementById('adminLoginPassword').value;
  const submitButton = e.target.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      showToast(result.message || 'Đăng nhập Admin thất bại!', 'error');
      return;
    }

    state.currentAdmin = result.data;
    adminSessionValidated = true;
    localStorage.setItem('ddv_admin', JSON.stringify(state.currentAdmin));
    updateAuthUI();
    closeModal('adminAuthModal');
    toggleAdminView();
    showToast('Đăng nhập Admin thành công!');
  } catch (error) {
    showToast('Không thể kết nối máy chủ. Vui lòng thử lại!', 'error');
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

async function fillAndLoginAdmin(email, password) {
  if (state.currentUser) {
    showToast('Vui lòng đăng xuất tài khoản khách hàng trước khi đăng nhập Admin.', 'error');
    return;
  }

  const emailInput = document.getElementById('adminLoginEmail');
  const passInput = document.getElementById('adminLoginPassword');
  if (emailInput) emailInput.value = email;
  if (passInput) passInput.value = password;

  try {
    const response = await fetch(`${API_BASE}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      showToast(result.message || 'Đăng nhập Admin thất bại!', 'error');
      return;
    }

    state.currentAdmin = result.data;
    adminSessionValidated = true;
    localStorage.setItem('ddv_admin', JSON.stringify(state.currentAdmin));
    updateAuthUI();
    closeModal('adminAuthModal');
    toggleAdminView();
    showToast('Đăng nhập Admin thành công!');
  } catch (error) {
    showToast('Lỗi kết nối máy chủ. Vui lòng thử lại!', 'error');
  }
}

async function logoutAdmin() {
  try {
    await fetch(`${API_BASE}/api/auth/admin-logout`, {
      method: 'POST',
      headers: { 'x-admin-token': state.currentAdmin?.sessionToken || '' }
    });
  } catch (err) {}

  state.currentAdmin = null;
  adminSessionValidated = false;
  localStorage.removeItem('ddv_admin');
  const adminView = document.getElementById('adminView');
  const customerView = document.getElementById('customerView');
  const label = document.getElementById('adminSwitchLabel');
  if (adminView) adminView.style.display = 'none';
  if (customerView) customerView.style.display = 'block';
  updateAuthUI();
  await syncAllData();
  if (label) label.innerText = 'Quản Trị Admin';
  showToast('Đã đăng xuất Quản trị Admin thành công!');
}

function switchAdminTab(tab, el) {
  currentAdminTab = tab;
  document.querySelectorAll('.admin-nav-item').forEach(item => item.classList.remove('active'));
  if (el) el.classList.add('active');

  document.querySelectorAll('.admin-tab-pane').forEach(pane => pane.classList.remove('active'));
  const targetPane = document.getElementById(`adminTab-${tab}`);
  if (targetPane) targetPane.classList.add('active');

  const titles = {
    dashboard: 'Dashboard Tổng Quan',
    products: 'Quản Lý Danh Mục Sản Phẩm Trong Kho',
    orders: 'Quản Lý & Cập Nhật Trạng Thái Đơn Hàng',
    customers: 'Danh Sách Khách Hàng & Hạng Thành Viên',
    tradein: 'Hồ Sơ Thu Cũ Đổi Mới Cần Thẩm Định',
    vouchers: 'Quản Lý Khuyến Mãi & Mã Giảm Giá'
  };
  const titleEl = document.getElementById('adminCurrentTabTitle');
  if (titleEl) titleEl.innerText = titles[tab] || 'Admin Hub';
}

async function refreshAdminData() {
  await syncAllData();
  showToast('Đã làm mới dữ liệu quản trị');
}

async function loadAdminStats() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/stats`, { headers: getAdminHeaders() });
    const json = await res.json();
    if (json.success) {
      const d = json.data;
      document.getElementById('adminTotalRevenue').innerText = formatVND(d.totalRevenue);
      document.getElementById('adminTotalOrders').innerText = d.totalOrders;
      document.getElementById('adminPendingOrdersText').innerText = `${d.pendingOrders} đơn chờ xác nhận`;
      document.getElementById('adminPendingOrdersBadge').innerText = d.pendingOrders;
      document.getElementById('adminTotalCustomers').innerText = d.totalCustomers;
      document.getElementById('adminTotalProducts').innerText = d.totalProducts;

      // Category breakdown
      const breakdownEl = document.getElementById('adminCategoryBreakdown');
      if (breakdownEl && d.categoryCounts) {
        const total = d.totalProducts || 1;
        breakdownEl.innerHTML = Object.entries(d.categoryCounts).map(([cat, count]) => {
          const pct = Math.round((count / total) * 100);
          return `
            <div class="cat-stat-row">
              <span style="width: 110px; font-weight: 600;">${formatCatName(cat)}</span>
              <div class="bar-wrap">
                <div class="bar-fill" style="width: ${pct}%;"></div>
              </div>
              <span style="font-weight: 700;">${count} SP (${pct}%)</span>
            </div>
          `;
        }).join('');
      }

      // Recent orders in dashboard
      const recentTable = document.getElementById('adminRecentOrdersTable');
      if (recentTable && d.recentOrders) {
        recentTable.innerHTML = d.recentOrders.map(o => `
          <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customerName}</td>
            <td><strong>${formatVND(o.totalAmount)}</strong></td>
            <td><span class="status-badge ${o.paymentStatus === 'paid' ? 'completed' : 'pending'}">${o.paymentMethod.toUpperCase()}</span></td>
            <td><span class="status-badge ${o.status}">${formatOrderStatus(o.status)}</span></td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error loading admin stats:', err);
  }
}

function formatCatName(cat) {
  const map = {
    phone: 'Điện thoại',
    laptop: 'MacBook/Laptop',
    tablet: 'Tablet/iPad',
    watch: 'Đồng hồ',
    audio: 'Âm thanh',
    accessory: 'Phụ kiện',
    old: 'Máy cũ'
  };
  return map[cat] || cat;
}

function formatOrderStatus(status) {
  const map = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    preparing: 'Đang chuẩn bị',
    shipping: 'Đang giao hàng',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  };
  return map[status] || status;
}

// Admin Products Table
let adminProductsList = [];

async function loadAdminProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    const json = await res.json();
    if (json.success) {
      adminProductsList = json.data;
      renderAdminProductsTable(adminProductsList);
    }
  } catch (err) {}
}

function renderAdminProductsTable(list) {
  const tbody = document.getElementById('adminProductsTableBody');
  if (!tbody) return;

  tbody.innerHTML = list.map(p => `
    <tr>
      <td><img src="${p.image}" style="width: 44px; height: 44px; object-fit: contain; border-radius: 4px; border: 1px solid #e2e8f0;"></td>
      <td><strong>${p.name}</strong><br><small style="color: #64748b;">${p.brand}</small></td>
      <td>${formatCatName(p.category)}</td>
      <td><strong style="color: var(--primary);">${formatVND(p.salePrice)}</strong></td>
      <td><span style="color: #94a3b8; text-decoration: line-through;">${formatVND(p.price)}</span></td>
      <td><strong>${p.stock || 0}</strong> máy</td>
      <td>${p.isFlashSale ? '<span class="status-badge completed">Có</span>' : '<span class="status-badge">Không</span>'}</td>
      <td>
        <div class="action-btn-group">
          <button class="btn-action-sm" onclick="openEditProductModal('${p.id}')" title="Sửa"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-action-sm danger" onclick="deleteProduct('${p.id}')" title="Xóa"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function handleAdminProductSearch(q) {
  const query = q.toLowerCase().trim();
  const filtered = adminProductsList.filter(p => p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query));
  renderAdminProductsTable(filtered);
}

function handleAdminProductCategoryFilter(cat) {
  const filtered = cat === 'all' ? adminProductsList : adminProductsList.filter(p => p.category === cat);
  renderAdminProductsTable(filtered);
}

function previewAdminProdImage(url) {
  const preview = document.getElementById('adminProdImagePreview');
  if (!preview) return;
  if (url && url.startsWith('http')) {
    preview.innerHTML = `<img src="${url}" style="max-height: 100px; border-radius: 6px; border: 1px solid #cbd5e1; padding: 4px;" onerror="handleImgError(this, 'Xem trước')">`;
  } else {
    preview.innerHTML = '';
  }
}

function openAddProductModal() {
  if (!hasAdminSession()) {
    showToast('Bạn không có quyền thực hiện thao tác này! Chỉ Quản Trị Viên (Admin) mới có quyền thêm sản phẩm.', 'error');
    return;
  }
  document.getElementById('adminProductForm').reset();
  document.getElementById('adminProdId').value = '';
  document.getElementById('adminProductModalTitle').innerText = 'Thêm Sản Phẩm Mới (Quyền Quản Trị)';
  previewAdminProdImage('');
  openModal('adminProductModal');
}

function openEditProductModal(id) {
  if (!hasAdminSession()) {
    showToast('Bạn không có quyền thực hiện thao tác này! Chỉ Quản Trị Viên (Admin) mới có quyền sửa sản phẩm.', 'error');
    return;
  }
  let p = adminProductsList.find(x => x.id === id);
  if (!p && Array.isArray(state.allProducts)) {
    p = state.allProducts.find(x => x.id === id);
  }
  if (!p) {
    showToast('Không tìm thấy thông tin sản phẩm!', 'error');
    return;
  }

  document.getElementById('adminProdId').value = p.id;
  document.getElementById('adminProdName').value = p.name;
  document.getElementById('adminProdBrand').value = p.brand;
  document.getElementById('adminProdCategory').value = p.category;
  document.getElementById('adminProdStock').value = p.stock || 10;
  document.getElementById('adminProdSalePrice').value = p.salePrice;
  document.getElementById('adminProdPrice').value = p.price;
  document.getElementById('adminProdImage').value = p.image;
  document.getElementById('adminProdStorage').value = (p.storageOptions || []).join(', ');
  document.getElementById('adminProdColors').value = (p.colors || []).join(', ');
  document.getElementById('adminProdDesc').value = p.description || '';
  document.getElementById('adminProdFlashSale').checked = Boolean(p.isFlashSale);
  previewAdminProdImage(p.image);

  document.getElementById('adminProductModalTitle').innerText = 'Chỉnh Sửa Sản Phẩm: ' + p.name;
  openModal('adminProductModal');
}

async function handleSaveAdminProduct(e) {
  e.preventDefault();
  if (!hasAdminSession()) {
    showToast('Bạn không có quyền lưu sản phẩm! Chỉ Quản Trị Viên (Admin) mới được phép.', 'error');
    return;
  }

  const id = document.getElementById('adminProdId').value;
  const name = document.getElementById('adminProdName').value.trim();
  const brand = document.getElementById('adminProdBrand').value;
  const category = document.getElementById('adminProdCategory').value;
  const stock = Number(document.getElementById('adminProdStock').value);
  const salePrice = Number(document.getElementById('adminProdSalePrice').value);
  const price = Number(document.getElementById('adminProdPrice').value);
  const image = document.getElementById('adminProdImage').value.trim();
  const storageStr = document.getElementById('adminProdStorage').value;
  const colorsStr = document.getElementById('adminProdColors').value;
  const desc = document.getElementById('adminProdDesc').value.trim();
  const isFlashSale = document.getElementById('adminProdFlashSale').checked;

  const payload = {
    name, brand, category, stock, salePrice, price, image,
    storageOptions: storageStr ? storageStr.split(',').map(s => s.trim()) : ['128GB'],
    colors: colorsStr ? colorsStr.split(',').map(c => c.trim()) : ['Đen'],
    description: desc,
    isFlashSale
  };

  const isEdit = Boolean(id);
  const url = isEdit ? `${API_BASE}/api/products/${id}` : `${API_BASE}/api/products`;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'admin',
        'x-admin-email': state.currentAdmin.email || 'admin@didongviet.vn',
        'x-admin-token': state.currentAdmin.sessionToken || ''
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showToast(data.message);
      closeModal('adminProductModal');
      await syncAllData();
    } else {
      showToast(data.message || 'Lỗi lưu sản phẩm', 'error');
    }
  } catch (err) {
    showToast('Lỗi lưu sản phẩm', 'error');
  }
}

async function deleteProduct(id) {
  if (!hasAdminSession()) {
    showToast('Bạn không có quyền xóa sản phẩm! Chỉ Quản Trị Viên (Admin) mới có quyền này.', 'error');
    return;
  }

  if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi hệ thống Di Động Việt?')) return;

  try {
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-role': 'admin',
        'x-admin-email': state.currentAdmin.email || 'admin@didongviet.vn',
        'x-admin-token': state.currentAdmin.sessionToken || ''
      }
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message);
      await syncAllData();
    } else {
      showToast(data.message || 'Lỗi xóa sản phẩm', 'error');
    }
  } catch (err) {
    showToast('Lỗi xóa sản phẩm', 'error');
  }
}

// Admin Orders Table
let adminOrdersList = [];

async function loadAdminOrders() {
  try {
    const res = await fetch(`${API_BASE}/api/orders`, { headers: getAdminHeaders() });
    const json = await res.json();
    if (json.success) {
      adminOrdersList = json.data;
      renderAdminOrdersTable(adminOrdersList);
    }
  } catch (err) {}
}

function renderAdminOrdersTable(orders) {
  const tbody = document.getElementById('adminOrdersTableBody');
  if (!tbody) return;

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td style="font-size: 12px; color: #64748b;">${o.createdAt}</td>
      <td><strong>${o.customerName}</strong><br><small>${o.phone}</small></td>
      <td style="font-size: 12px;">
        ${(o.items || []).map(i => `<div>• ${i.name} (x${i.quantity})</div>`).join('')}
      </td>
      <td><strong style="color: var(--primary);">${formatVND(o.totalAmount)}</strong></td>
      <td><span class="status-badge ${o.paymentStatus === 'paid' ? 'completed' : 'pending'}">${o.paymentMethod.toUpperCase()}</span></td>
      <td><span class="status-badge ${o.status}">${formatOrderStatus(o.status)}</span></td>
      <td>
        <select onchange="updateOrderStatus('${o.id}', this.value)" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #cbd5e1; font-size: 12px;">
          <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Chờ xác nhận</option>
          <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
          <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>Đang chuẩn bị</option>
          <option value="shipping" ${o.status === 'shipping' ? 'selected' : ''}>Đang giao</option>
          <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
          <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Hủy đơn</option>
        </select>
      </td>
    </tr>
  `).join('');
}

function handleAdminOrderSearch(q) {
  const query = q.toLowerCase().trim();
  const filtered = adminOrdersList.filter(o => o.id.toLowerCase().includes(query) || o.phone.includes(query) || o.customerName.toLowerCase().includes(query));
  renderAdminOrdersTable(filtered);
}

function handleAdminOrderStatusFilter(status) {
  const filtered = status === 'all' ? adminOrdersList : adminOrdersList.filter(o => o.status === status);
  renderAdminOrdersTable(filtered);
}

async function updateOrderStatus(orderId, status) {
  try {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAdminHeaders(true),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Đã cập nhật đơn ${orderId} sang trạng thái "${formatOrderStatus(status)}"`);
      loadAdminOrders();
      loadAdminStats();
    }
  } catch (err) {
    showToast('Lỗi cập nhật trạng thái đơn', 'error');
  }
}

// Admin Customers
async function loadAdminCustomers() {
  try {
    const res = await fetch(`${API_BASE}/api/customers`, { headers: getAdminHeaders() });
    const json = await res.json();
    if (json.success) {
      const tbody = document.getElementById('adminCustomersTableBody');
      if (tbody) {
        tbody.innerHTML = json.data.map(c => `
          <tr>
            <td><strong>${c.id}</strong></td>
            <td><strong>${c.name}</strong></td>
            <td>${c.phone}</td>
            <td>${c.email}</td>
            <td><span class="status-badge completed">${c.tier}</span></td>
            <td><strong>${c.ordersCount}</strong> đơn</td>
            <td><strong style="color: var(--primary);">${formatVND(c.totalSpent)}</strong></td>
            <td>${c.joinedAt}</td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {}
}

// Admin Trade-Ins
async function loadAdminTradeIns() {
  try {
    const res = await fetch(`${API_BASE}/api/trade-in`, { headers: getAdminHeaders() });
    const json = await res.json();
    if (json.success) {
      const tbody = document.getElementById('adminTradeInsTableBody');
      if (tbody) {
        tbody.innerHTML = json.data.map(t => `
          <tr>
            <td><strong>${t.id}</strong></td>
            <td><strong>${t.customerName}</strong></td>
            <td>${t.phone}</td>
            <td><strong>${t.oldModel}</strong></td>
            <td>${t.targetModel}</td>
            <td><strong style="color: var(--primary);">${formatVND(t.finalEstimatedValue)}</strong></td>
            <td><small>${t.preferredStore}</small></td>
            <td><span class="status-badge ${t.status === 'completed' ? 'completed' : 'pending'}">${t.status === 'completed' ? 'Đã thu máy' : 'Chờ khách mang máy'}</span></td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {}
}

// Admin Vouchers
async function loadAdminVouchers() {
  try {
    const res = await fetch(`${API_BASE}/api/vouchers`, { headers: getAdminHeaders() });
    const json = await res.json();
    if (json.success) {
      const tbody = document.getElementById('adminVouchersTableBody');
      if (tbody) {
        tbody.innerHTML = json.data.map(v => `
          <tr>
            <td><strong style="color: var(--primary); font-size: 14px;">${v.code}</strong></td>
            <td><strong>${formatVND(v.discount)}</strong></td>
            <td>Đơn từ ${formatVND(v.minOrder)}</td>
            <td>${v.desc}</td>
            <td><span class="status-badge completed">Đang áp dụng</span></td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {}
}

// ==================== 17. MODAL HELPERS ====================

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Close on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
});

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}