/* SP Safety storefront. Plain JavaScript; all products live in data/products.js. */
(() => {
  'use strict';
  const products = window.SP_PRODUCTS || [];
  const $ = selector => document.querySelector(selector);
  const money = n => 'LKR ' + n.toLocaleString('en-LK', { minimumFractionDigits: 2 });
  const esc = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const paths = {
    cart: '<path d="M3 3h2l2.5 12h11l2-8H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
    bag: '<path d="M5 7h14l1 14H4L5 7z"/><path d="M9 8V6a3 3 0 016 0v2"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 00-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 00-.1-7.8z"/>',
    arrow: '<path d="M5 12h14m-6-6l6 6-6 6"/>',
    check: '<path d="M5 12l4 4L19 6"/>',
    shield: '<path d="M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3z"/><path d="M8 12l3 3 5-6"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
    chat: '<path d="M21 11.5a8.5 8.5 0 01-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1121 11.5z"/><path d="M8 10h8m-8 4h5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    close: '<path d="M6 6l12 12M6 18L18 6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M16 16l5 5"/>',
    zoom: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M16 16l5 5M7 10.5h7m-3.5-3.5v7"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
  function cleanCart(value) {
    const clean = {};
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      products.forEach(p => { if (Number.isInteger(value[p.id]) && value[p.id] > 0) clean[p.id] = Math.min(999, value[p.id]); });
    }
    return clean;
  }
  function cleanSaved(value) { return Array.isArray(value) ? [...new Set(value)].filter(id => products.some(p => p.id === id)) : []; }
  let cart = cleanCart(read('sp-cart', {}));
  let saved = cleanSaved(read('sp-saved', []));
  let page = 1;
  let timer, undoAction;
  const notice = document.createElement('div');
  notice.className = 'shop-toast';
  notice.innerHTML = '<div role="status" aria-live="polite" class="toast-message"></div><a href="cart.html" class="toast-cart">View cart →</a><button type="button" class="toast-undo" hidden>Undo</button><button type="button" class="toast-close" aria-label="Dismiss notification">' + icon('close') + '</button>';
  document.body.append(notice);
  notice.querySelector('.toast-close').onclick = () => notice.classList.remove('visible');
  notice.querySelector('.toast-undo').onclick = () => { undoAction?.(); notice.classList.remove('visible'); };
  function toast(text, options = {}) {
    notice.querySelector('.toast-message').textContent = text;
    notice.querySelector('.toast-cart').hidden = !options.cart;
    notice.querySelector('.toast-undo').hidden = !options.undo;
    undoAction = options.undo;
    notice.classList.add('visible');
    clearTimeout(timer);
    timer = setTimeout(() => notice.classList.remove('visible'), options.undo ? 7000 : 4500);
  }
  function updateBadge() {
    const count = Object.values(cart).reduce((a, b) => a + b, 0);
    document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = count > 99 ? '99+' : count; el.classList.toggle('has-items', count > 0); });
    document.querySelectorAll('.nav-cart').forEach(el => { el.setAttribute('aria-label', `View enquiry cart, ${count} ${count === 1 ? 'item' : 'items'}`); if (location.pathname.endsWith('/cart.html')) el.setAttribute('aria-current', 'page'); });
  }
  function persist() {
    try { localStorage.setItem('sp-cart', JSON.stringify(cart)); localStorage.setItem('sp-saved', JSON.stringify(saved)); }
    catch { toast('Browser storage is unavailable. Your selection lasts for this page only.'); }
    updateBadge();
  }
  function image(p) { return `<img src="${esc(encodeURI(p.image).replace(/#/g, '%23').replace(/\?/g, '%3F'))}" alt="${esc(p.name)}" loading="lazy" width="400" height="320"/>`; }
  function fallbackImages() {
    document.querySelectorAll('.shop-photo img,.detail-image img,.zoom-dialog img').forEach(img => {
      img.onerror = () => { img.onerror = null; img.src = 'images/product-placeholder.svg'; };
      if (img.complete && !img.naturalWidth) img.onerror();
    });
  }
  function saveButton(p, detail = false) {
    const active = saved.includes(p.id);
    return `<button type="button" class="${detail ? 'detail-save' : 'save-button'}" data-save="${esc(p.id)}" aria-label="${active ? 'Unsave' : 'Save'} ${esc(p.name)}" aria-pressed="${active}">${icon('heart')}${detail ? '<span>' + (active ? 'Saved' : 'Save for later') + '</span>' : ''}</button>`;
  }
  function card(p) {
    return `<article class="shop-card"><div class="card-visual"><a class="shop-photo" href="product.html?id=${encodeURIComponent(p.id)}">${image(p)}<span class="card-explore">View details ${icon('arrow')}</span></a>${p.featured ? '<span class="product-tag">Everyday essential</span>' : ''}${saveButton(p)}</div><div class="shop-card-body"><p class="category-label">${esc(p.category)}</p><h3><a href="product.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3><div class="card-bottom"><div><span class="price-caption">Guide price</span><p class="shop-price">${money(p.price)}</p></div><button type="button" class="add-button" data-add="${esc(p.id)}" aria-label="Add ${esc(p.name)} to cart">${icon('plus')}<span>Add</span></button></div></div></article>`;
  }
  function grid(selector, items) { if ($(selector)) { $(selector).innerHTML = items.map(card).join(''); fallbackImages(); } }
  function quantity(p, value, detail = false) {
    return `<div class="quantity-stepper"><button type="button" data-step="-1" data-for="${detail ? 'quantity' : esc(p.id)}" aria-label="Decrease quantity for ${esc(p.name)}" ${value <= 1 ? 'disabled' : ''}>${icon('minus')}</button><input ${detail ? 'id="quantity"' : `data-quantity="${esc(p.id)}"`} aria-label="Quantity for ${esc(p.name)}" type="number" min="1" max="999" step="1" value="${value}" inputmode="numeric"/><button type="button" data-step="1" data-for="${detail ? 'quantity' : esc(p.id)}" aria-label="Increase quantity for ${esc(p.name)}" ${value >= 999 ? 'disabled' : ''}>${icon('plus')}</button></div>`;
  }
  const menu = $('#main-navigation'), toggle = $('.navbar-toggler');
  if (toggle) toggle.addEventListener('click', () => { const open = menu.classList.toggle('show'); toggle.setAttribute('aria-expanded', open); });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('show'); toggle?.setAttribute('aria-expanded', 'false'); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu?.classList.contains('show')) { menu.classList.remove('show'); toggle?.setAttribute('aria-expanded', 'false'); toggle?.focus(); } });
  if ($('#footer-year')) $('#footer-year').textContent = new Date().getFullYear();
  const marquee = $('.brand-marquee'), pause = $('.marquee-toggle');
  if (pause) pause.addEventListener('click', () => { const state = marquee.classList.toggle('is-paused'); pause.setAttribute('aria-pressed', state); pause.setAttribute('aria-label', state ? 'Resume brand animation' : 'Pause brand animation'); pause.querySelector('span').textContent = state ? 'Resume' : 'Pause'; });
  grid('#featured-products', products.filter(p => p.featured).slice(0, 4));
  document.querySelectorAll('.collection-stats b').forEach((el, i) => el.textContent = i === 0 ? products.length : new Set(products.map(p => p.category)).size);
  if ($('#catalog')) {
    [...new Set(products.map(p => p.category))].sort().forEach(c => $('#category').add(new Option(c, c)));
    const params = new URLSearchParams(location.search);
    for (const id of ['search', 'category', 'min', 'max', 'sort', 'page-size']) {
      const el = $('#' + id), value = params.get(id);
      if (value !== null && (el.tagName !== 'SELECT' || [...el.options].some(o => o.value === value))) el.value = value;
    }
    for (const id of ['featured', 'saved']) $('#' + id).checked = params.get(id) === '1';
    $('#filters').addEventListener('submit', e => e.preventDefault());
    const update = () => { page = 1; renderCatalog(); };
    $('#filters').addEventListener('input', update);
    $('#filters').addEventListener('change', e => { if (e.target.tagName === 'SELECT') update(); });
    $('#filters').addEventListener('reset', () => setTimeout(update, 0));
    $('#sort').addEventListener('change', update);
    $('#page-size').addEventListener('change', update);
    $('.mobile-filter-toggle')?.addEventListener('click', e => { const open = $('#filters').classList.toggle('filters-open'); e.currentTarget.setAttribute('aria-expanded', open); if (open) { $('#filters').scrollIntoView({ behavior: 'smooth', block: 'start' }); $('#search').focus({ preventScroll: true }); } });
    $('.search-label')?.insertAdjacentHTML('beforeend', '<span class="search-field-icon">' + icon('search') + '</span>');
  }
  function renderCatalog() {
    if (!$('#catalog')) return;
    let list = products.filter(p => {
      const words = $('#search').value.trim().toLowerCase().split(/\s+/);
      return words.every(w => (p.name + ' ' + p.category).toLowerCase().includes(w)) && (!$('#category').value || p.category === $('#category').value) && (!$('#min').value || p.price >= Number($('#min').value)) && (!$('#max').value || p.price <= Number($('#max').value)) && (!$('#featured').checked || p.featured) && (!$('#saved').checked || saved.includes(p.id));
    });
    const sort = $('#sort').value;
    list.sort((a, b) => sort === 'price-asc' ? a.price - b.price : sort === 'price-desc' ? b.price - a.price : sort === 'name-desc' ? b.name.localeCompare(a.name) : sort === 'category' ? a.category.localeCompare(b.category) || a.name.localeCompare(b.name) : sort === 'name-asc' ? a.name.localeCompare(b.name) : Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
    const size = Number($('#page-size').value) || 12, pages = Math.max(1, Math.ceil(list.length / size));
    page = Math.min(page, pages);
    $('#results-count').textContent = list.length ? `Showing ${(page - 1) * size + 1}–${Math.min(page * size, list.length)} of ${list.length} products` : 'No products match your filters';
    grid('#catalog', list.slice((page - 1) * size, page * size));
    if (!list.length) $('#catalog').innerHTML = `<div class="empty-state"><span class="empty-icon">${icon('search')}</span><p class="section-kicker">Let’s try again</p><h2>A different search might help.</h2><p>Try a broader keyword or clear a filter to discover more essentials.</p><button type="button" class="button-primary" id="empty-reset">Reset filters ${icon('arrow')}</button></div>`;
    $('#empty-reset')?.addEventListener('click', () => $('#filters').reset());
    $('#pagination').innerHTML = pages > 1 ? `<button type="button" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''} aria-label="Previous page">←</button>` + Array.from({ length: pages }, (_, i) => `<button type="button" data-page="${i + 1}" aria-label="Page ${i + 1}" ${i + 1 === page ? 'aria-current="page"' : ''}>${i + 1}</button>`).join('') + `<button type="button" data-page="${page + 1}" ${page === pages ? 'disabled' : ''} aria-label="Next page">→</button>` : '';
    const chips = [];
    for (const id of ['search', 'category', 'min', 'max']) if ($('#' + id).value) chips.push([id, (id === 'min' ? 'From LKR ' : id === 'max' ? 'Up to LKR ' : id === 'search' ? 'Search: ' : '') + $('#' + id).value]);
    if ($('#featured').checked) chips.push(['featured', 'Everyday essentials']);
    if ($('#saved').checked) chips.push(['saved', 'Saved products']);
    if ($('#active-filters')) $('#active-filters').innerHTML = chips.map(([id, text]) => `<button type="button" data-clear-filter="${id}" aria-label="Remove filter: ${esc(text)}">${esc(text)}${icon('close')}</button>`).join('');
    const query = new URLSearchParams();
    for (const id of ['search', 'category', 'min', 'max', 'sort', 'page-size']) if ($('#' + id).value) query.set(id, $('#' + id).value);
    for (const id of ['featured', 'saved']) if ($('#' + id).checked) query.set(id, '1');
    try { history.replaceState(null, '', '?' + query); } catch {}
  }
  function enquiry(text) { return 'https://wa.me/94772360385?text=' + encodeURIComponent(text); }
  if ($('#product-detail')) {
    const p = products.find(p => p.id === new URLSearchParams(location.search).get('id'));
    if (!p) { $('#product-detail').innerHTML = '<div class="empty-state"><h1>Product not found</h1><p>This item may have been moved or removed.</p><a class="button-primary" href="products.html">Explore the collection →</a></div>'; $('.related').hidden = true; }
    else {
      document.title = p.name + ' | SP Safety';
      $('#crumb').textContent = p.name;
      $('#product-detail').innerHTML = `<article class="detail-layout"><div class="detail-gallery"><button class="detail-image" type="button" data-zoom aria-label="Enlarge photo of ${esc(p.name)}">${image(p)}<span class="zoom-hint">${icon('zoom')} Take a closer look</span></button><div class="gallery-note">${icon('shield')} Choose the protection that fits your work.</div></div><div class="detail-copy"><div class="detail-category-row"><a class="detail-category" href="products.html?category=${encodeURIComponent(p.category)}">${esc(p.category)}</a>${saveButton(p, true)}</div><h1>${esc(p.name)}</h1><div class="detail-pricing"><span class="price-caption">Guide price · LKR</span><p class="detail-price">${money(p.price).replace('LKR ', '')}</p><span class="pricing-note">Final pricing confirmed with your enquiry</span></div><p class="detail-description">${esc(p.description)}</p><div class="detail-purchase"><label for="quantity" class="quantity-label">Choose quantity</label><div class="purchase-row">${quantity(p, 1, true)}<button type="button" class="button-primary" data-add="${esc(p.id)}">${icon('cart')} Add to enquiry cart</button></div><a class="detail-whatsapp" href="${enquiry('Hello SP Safety, I would like more information about ' + p.name + ' (' + money(p.price) + ').')}" target="_blank" rel="noopener">${icon('chat')} Have a question? Talk to our team ${icon('arrow')}</a></div><details class="product-accordion" open><summary>Product information <span aria-hidden="true">+</span></summary><dl><dt>Product reference</dt><dd>${esc(p.id)}</dd><dt>Product category</dt><dd>${esc(p.category)}</dd></dl></details><details class="product-accordion"><summary>Ordering &amp; delivery <span aria-hidden="true">+</span></summary><p>Add products to your cart and send your selection to our team on WhatsApp. We will confirm specifications, sizes, availability, delivery and payment arrangements before you order.</p></details><div class="detail-assurance">${icon('shield')}<p><b>The right equipment starts with the right advice.</b><span>Confirm suitability and specifications with our team before ordering.</span></p></div></div></article>`;
      grid('#related-products', products.filter(q => q.category === p.category && q.id !== p.id).slice(0, 4));
      if (!$('#related-products').children.length) $('.related').hidden = true;
      fallbackImages();
      const dialog = document.createElement('dialog');
      dialog.className = 'zoom-dialog';
      dialog.setAttribute('aria-label', p.name + ' photo');
      dialog.innerHTML = `<button type="button" class="zoom-close" aria-label="Close photo">${icon('close')}</button>${image(p)}<p>${esc(p.name)}</p>`;
      document.body.append(dialog);
      $('[data-zoom]').onclick = () => { dialog.showModal(); document.body.classList.add('dialog-open'); fallbackImages(); };
      dialog.querySelector('.zoom-close').onclick = () => dialog.close();
      dialog.addEventListener('click', e => { if (e.target === dialog) { const rect = dialog.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close(); } });
      dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
    }
  }
  function renderCart() {
    if (!$('#cart-content')) return;
    const entries = products.filter(p => cart[p.id]);
    if (!entries.length) {
      $('#cart-content').innerHTML = `<div class="empty-state cart-empty"><span class="empty-icon">${icon('bag')}</span><p class="section-kicker">Ready when you are</p><h2>Good protection starts here.</h2><p>Your cart is waiting for its first essential. Explore our collection and build a selection that works for you.</p><a class="button-primary" href="products.html">Find your essentials ${icon('arrow')}</a><div class="empty-categories">${['Head Protection', 'Body Protection', 'Fire Protection'].filter(c => products.some(p => p.category === c)).map(c => `<a href="products.html?category=${encodeURIComponent(c)}">${esc(c)} ↗</a>`).join('')}</div></div><section class="cart-recommendations"><div class="section-heading"><p class="section-kicker">A good place to start</p><h2>Everyday essentials</h2></div><div class="shop-grid" id="cart-recommendations"></div></section>`;
      grid('#cart-recommendations', products.filter(p => p.featured).slice(0, 4));
      return;
    }
    const total = entries.reduce((n, p) => n + p.price * cart[p.id], 0);
    const count = Object.values(cart).reduce((a, b) => a + b, 0);
    const message = 'Hello SP Safety, please confirm pricing and availability for:\n\n' + entries.map(p => p.name + ' × ' + cart[p.id] + ' — ' + money(p.price * cart[p.id])).join('\n') + '\n\nEstimated subtotal: ' + money(total) + '\nPlease advise delivery charges and payment arrangements.';
    $('#cart-content').innerHTML = `<div class="cart-layout"><section class="cart-items-panel" aria-label="Cart items"><div class="cart-panel-heading"><h2>Your selection <span>${entries.length} ${entries.length === 1 ? 'product' : 'products'}</span></h2><button type="button" class="clear-cart" id="clear-cart">${icon('trash')} Clear cart</button></div><div class="cart-column-head"><span>Product details</span><span>Item total</span></div>${entries.map(p => `<article class="cart-row" data-row="${esc(p.id)}"><a class="shop-photo" href="product.html?id=${encodeURIComponent(p.id)}">${image(p)}</a><div class="cart-product-info"><p class="category-label">${esc(p.category)}</p><a href="product.html?id=${encodeURIComponent(p.id)}"><h2>${esc(p.name)}</h2></a><p class="unit-price">${money(p.price)} <span>/ item</span></p><div class="cart-item-controls">${quantity(p, cart[p.id])}<button type="button" class="remove" data-remove="${esc(p.id)}" aria-label="Remove ${esc(p.name)}">${icon('trash')}<span>Remove</span></button></div></div><strong class="cart-line-total">${money(p.price * cart[p.id])}</strong></article>`).join('')}<div class="cart-panel-footer"><a class="text-link" href="products.html">← Add more essentials</a><span>${icon('shield')} Your selection is saved in this browser</span></div></section><aside class="order-summary"><div class="summary-heading"><span class="summary-icon">${icon('bag')}</span><div><p class="section-kicker">Nearly there</p><h2>Your enquiry</h2></div></div><dl class="summary-breakdown"><div><dt>Items selected</dt><dd>${count} ${count === 1 ? 'item' : 'items'}</dd></div><div><dt>Products</dt><dd>${entries.length}</dd></div><div><dt>Delivery</dt><dd>To be confirmed</dd></div></dl><div class="summary-total"><span>Estimated subtotal<small>In Sri Lankan rupees</small></span><strong>${money(total)}</strong></div><p class="summary-note">Final pricing, availability and any delivery charges will be confirmed by our team.</p><a id="send-enquiry" class="button-primary whatsapp-button" target="_blank" rel="noopener" href="${enquiry(message)}">${icon('chat')} Enquire on WhatsApp ${icon('arrow')}</a><p class="send-note">Your selection opens as a message.<br/>Review it, then press Send.</p><div class="payment-note">${icon('shield')}<span>No payment required to enquire.</span></div><a class="summary-help" href="tel:+94772360385">Prefer a conversation? <b>077 236 0385</b></a></aside></div><div class="cart-support-strip"><div>${icon('chat')}<p><b>Advice from our team</b><span>Ask about specifications and options</span></p></div><div>${icon('bag')}<p><b>Built around your needs</b><span>Enquire for your team or workplace</span></p></div><div>${icon('shield')}<p><b>A clear next step</b><span>Confirm the details before ordering</span></p></div></div>`;
    fallbackImages();
    $('#clear-cart').onclick = () => { const previous = { ...cart }; cart = {}; persist(); renderCart(); toast('Your cart has been cleared.', { undo: () => { cart = { ...previous, ...cart }; persist(); renderCart(); } }); };
  }
  function syncSaveButtons() {
    document.querySelectorAll('[data-save]').forEach(button => {
      const p = products.find(p => p.id === button.dataset.save); if (!p) return;
      const active = saved.includes(p.id);
      button.setAttribute('aria-pressed', active);
      button.setAttribute('aria-label', `${active ? 'Unsave' : 'Save'} ${p.name}`);
      const label = button.querySelector('span'); if (label) label.textContent = active ? 'Saved' : 'Save for later';
    });
  }
  document.addEventListener('click', e => {
    const step = e.target.closest('[data-step]');
    if (step) {
      const target = step.dataset.for === 'quantity' ? $('#quantity') : document.querySelector(`[data-quantity="${CSS.escape(step.dataset.for)}"]`);
      if (!target) return;
      const n = Math.min(999, Math.max(1, (Number(target.value) || 1) + Number(step.dataset.step)));
      target.value = n;
      if (target.dataset.quantity) { cart[target.dataset.quantity] = n; persist(); renderCart(); const replacement = document.querySelector(`[data-step="${step.dataset.step}"][data-for="${CSS.escape(step.dataset.for)}"]`); replacement?.focus({ preventScroll: true }); }
      else target.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const add = e.target.closest('[data-add]');
    if (add) {
      const q = $('#quantity'), n = q ? Number(q.value) : 1, p = products.find(p => p.id === add.dataset.add);
      if (!p) return;
      if (!Number.isInteger(n) || n < 1 || n > 999) { q?.reportValidity(); toast('Enter a whole quantity from 1 to 999.'); return; }
      if ((cart[p.id] || 0) + n > 999) { toast('The maximum quantity per product is 999.'); return; }
      cart[p.id] = (cart[p.id] || 0) + n; persist(); renderCart();
      const before = add.innerHTML; add.innerHTML = icon('check') + '<span>Added</span>'; add.classList.add('is-added');
      setTimeout(() => { if (add.isConnected) { add.innerHTML = before; add.classList.remove('is-added'); } }, 1400);
      toast(`${n === 1 ? 'Item' : n + ' items'} added to your enquiry cart.`, { cart: true });
    }
    const save = e.target.closest('[data-save]');
    if (save) { const id = save.dataset.save; saved = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id]; persist(); syncSaveButtons(); if ($('#saved')?.checked) renderCatalog(); toast(saved.includes(id) ? 'Saved for later. Find it using the Saved products filter.' : 'Product removed from your saved items.'); }
    const remove = e.target.closest('[data-remove]');
    if (remove) { const id = remove.dataset.remove, value = cart[id]; delete cart[id]; persist(); renderCart(); toast('Product removed from your cart.', { undo: () => { cart[id] = Math.min(999, (cart[id] || 0) + value); persist(); renderCart(); } }); }
    const pagination = e.target.closest('[data-page]');
    if (pagination && !pagination.disabled) { page = Number(pagination.dataset.page); renderCatalog(); $('#results-count').scrollIntoView({ block: 'start', behavior: 'smooth' }); $('#pagination [aria-current="page"]')?.focus({ preventScroll: true }); }
    const clear = e.target.closest('[data-clear-filter]');
    if (clear) { const field = $('#' + clear.dataset.clearFilter); if (field.type === 'checkbox') field.checked = false; else field.value = ''; page = 1; renderCatalog(); $('#search').focus({ preventScroll: true }); }
  });
  document.addEventListener('change', e => {
    if (!e.target.matches('[data-quantity],#quantity')) return;
    const field = e.target, n = Number(field.value);
    if (!Number.isInteger(n) || n < 1 || n > 999) { toast('Enter a whole quantity from 1 to 999.'); field.value = field.dataset.quantity ? cart[field.dataset.quantity] : 1; return; }
    if (field.dataset.quantity) { cart[field.dataset.quantity] = n; persist(); renderCart(); document.querySelector(`[data-quantity="${CSS.escape(field.dataset.quantity)}"]`)?.focus({ preventScroll: true }); }
    else { const controls = field.closest('.quantity-stepper'); controls.querySelector('[data-step="-1"]').disabled = n <= 1; controls.querySelector('[data-step="1"]').disabled = n >= 999; }
  });
  window.addEventListener('storage', e => { if (!e.key || ['sp-cart', 'sp-saved'].includes(e.key)) { cart = cleanCart(read('sp-cart', {})); saved = cleanSaved(read('sp-saved', [])); updateBadge(); renderCart(); renderCatalog(); syncSaveButtons(); } });
  updateBadge(); renderCatalog(); renderCart();
})();
