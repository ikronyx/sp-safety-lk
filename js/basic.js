/* Temporary brochure only. Product images, titles, categories and prices still come from data/products.js. */
(() => {
 'use strict';
 const products=window.SP_PRODUCTS||[];
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=n=>'LKR '+Number(n).toLocaleString('en-LK',{minimumFractionDigits:2});
 const card=p=>`<article class="shop-card"><div class="card-visual"><div class="shop-photo"><img src="${esc(encodeURI(p.image).replace(/#/g,'%23').replace(/\?/g,'%3F'))}" alt="${esc(p.name)}" loading="lazy" width="400" height="320"/></div></div><div class="shop-card-body"><p class="category-label">${esc(p.category)}</p><h3>${esc(p.name)}</h3><div class="card-bottom"><div><span class="price-caption">Guide price</span><p class="shop-price">${money(p.price)}</p></div></div></div></article>`;
 const catalog=document.getElementById('catalog');if(catalog)catalog.innerHTML=products.map(card).join('');
 const featured=document.getElementById('featured-products');if(featured)featured.innerHTML=products.filter(p=>p.featured).slice(0,4).map(card).join('');
 document.querySelectorAll('.shop-photo img').forEach(image=>{image.onerror=()=>{image.onerror=null;image.src='images/product-placeholder.svg';};if(image.complete&&!image.naturalWidth)image.onerror();});
 document.querySelectorAll('.collection-stats b').forEach((e,i)=>e.textContent=i===0?products.length:new Set(products.map(p=>p.category)).size);
 const menu=document.getElementById('main-navigation'),toggle=document.querySelector('.navbar-toggler');
 if(menu&&toggle){toggle.addEventListener('click',()=>{const open=menu.classList.toggle('show');toggle.setAttribute('aria-expanded',String(open));});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('show');toggle.setAttribute('aria-expanded','false');}));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('show')){menu.classList.remove('show');toggle.setAttribute('aria-expanded','false');toggle.focus();}});}
 const year=document.getElementById('footer-year');if(year)year.textContent=new Date().getFullYear();
 const pause=document.querySelector('.marquee-toggle'),marquee=document.querySelector('.brand-marquee');if(pause&&marquee)pause.addEventListener('click',()=>{const state=marquee.classList.toggle('is-paused');pause.setAttribute('aria-pressed',String(state));pause.setAttribute('aria-label',state?'Resume brand animation':'Pause brand animation');const label=pause.querySelector('span');if(label)label.textContent=state?'Resume':'Pause';});
})();
