document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('workGrid');
  const statusEl = document.getElementById('catalogStatus');
  const tabsEl = document.getElementById('rootTabs');
  const productsView = document.getElementById('productsView');
  const productsGrid = document.getElementById('productsGrid');
  const productsStatus = document.getElementById('productsStatus');
  const productsTitle = document.getElementById('productsTitle');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (!grid) return;

  function isArabic(){ if(typeof currentLang!=='undefined') return currentLang==='ar'; return document.body.classList.contains('ar'); }
  function pickName(o){ return window.MazidAPI ? window.MazidAPI.pickName(o, isArabic()?'ar':'en') : (o.name_en||''); }
  function displayImage(o){ return window.MazidAPI ? window.MazidAPI.displayImage(o) : (o.image_url||''); }

  let allRoots = [];
  let selectedRootId = null; // null = All
  let currentCategoryId = null;
  let currentCategoryName = '';
  let page = 1;
  let totalPages = 1;
  let loadingMore = false;

  // Check URL param ?id= or ?categoryId=
  const urlParams = new URLSearchParams(location.search);
  const initialCategoryId = urlParams.get('id') || urlParams.get('categoryId') || urlParams.get('category_id');

  function showStatus(msg, isError=false){
    if(!statusEl) return;
    statusEl.style.display = msg ? 'block' : 'none';
    statusEl.textContent = msg || '';
    statusEl.classList.toggle('error', !!isError);
  }

  function renderTabs(){
    if(!tabsEl) return;
    tabsEl.innerHTML = '';
    const mk = (label, id, active)=>{
      const b=document.createElement('button');
      b.className='root-tab'+(active?' active':'');
      b.textContent=label;
      b.onclick=()=> selectRoot(id);
      tabsEl.appendChild(b);
    };
    mk(isArabic()?'الكل':'All', null, selectedRootId===null);
    allRoots.forEach(r=> mk(pickName(r), r.id, selectedRootId===r.id));
  }

  async function loadRoots(){
    showStatus(isArabic()?'جاري تحميل المجموعات...':'Loading collections...');
    grid.innerHTML = '<div class="work-box skeleton-box skeleton"></div>'.repeat(4);
    try{
      const resp = await window.MazidAPI.getCategories();
      const data = resp && resp.data ? resp.data : [];
      allRoots = data.filter(c=> c.is_active!==false).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
      if(!allRoots.length) throw new Error('empty');
      renderTabs();
      await selectRoot(selectedRootId, true);
    }catch(e){
      console.warn(e);
      showStatus(isArabic()?'تعذر تحميل المجموعات':'Failed to load collections', true);
      grid.innerHTML='';
    }
  }

  async function selectRoot(rootId, skipRenderTabs=false){
    selectedRootId = rootId;
    if(!skipRenderTabs) renderTabs();
    // fetch display categories
    showStatus(isArabic()?'جاري التحميل...':'Loading...');
    grid.innerHTML = '';
    try{
      let cats = [];
      if (rootId===null){
        cats = allRoots;
      } else {
        const resp = await window.MazidAPI.getSubcategories(rootId);
        const data = resp && resp.data ? resp.data : [];
        // if no subs, show the root itself as single
        cats = data.length ? data.filter(c=>c.is_active!==false) : allRoots.filter(c=>c.id===rootId);
        if (!cats.length) cats = allRoots.filter(c=>c.id===rootId);
      }
      // if still empty for that root, try products count fallback - show empty message
      renderCategoryGrid(cats);
    }catch(e){
      showStatus('Error: '+e.message, true);
    }
  }

  function renderCategoryGrid(cats){
    grid.innerHTML='';
    if(!cats.length){
      showStatus(isArabic()?'لا توجد مجموعات':'No collections');
      return;
    }
    showStatus('');
    cats.forEach(cat=>{
      const box=document.createElement('div');
      box.className='work-box';
      box.tabIndex=0; box.setAttribute('role','button');
      const img = displayImage(cat) || 'images/MazidMartLogo.png';
      const count = cat.products_count ?? cat.productsCount ?? '';
      box.innerHTML=`
        <img src="${img}" alt="${pickName(cat)}" loading="lazy" onerror="this.src='images/MazidMartLogo.png'"/>
        ${count!=='' && count!==0 ? `<span class="badge-count">${count} items</span>` : ''}
        <div class="work-overlay"><h3>${pickName(cat)}</h3><p class="work-cta">${isArabic()?'عرض المنتجات':'View products'}</p></div>
      `;
      box.onclick=()=> openProducts(cat.id, pickName(cat));
      box.onkeydown=(e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openProducts(cat.id, pickName(cat)); }};
      grid.appendChild(box);
    });
    // update hero title if viewing filtered
    const heroTitle=document.getElementById('catHeroTitle');
    const heroDesc=document.getElementById('catHeroDesc');
    if(selectedRootId){
      const sel = allRoots.find(c=>c.id===selectedRootId);
      if(sel && heroTitle) heroTitle.textContent = pickName(sel);
      if(heroDesc) heroDesc.textContent = isArabic() ? 'استعرض منتجات هذه المجموعة' : 'Explore products in this collection';
    } else {
      if(heroTitle) heroTitle.textContent = isArabic() ? 'مجموعاتنا' : 'Our Collections';
      if(heroDesc) heroDesc.textContent = isArabic() ? 'تصفح المجموعات الحية والمنتجات — اضغط على أي مجموعة لعرض منتجاتها.' : 'Browse live categories and products — tap a collection to explore its products.';
    }
  }

  async function openProducts(categoryId, categoryName){
    currentCategoryId = categoryId;
    currentCategoryName = categoryName;
    page = 1; totalPages = 1;
    // update URL without reload
    const u = new URL(location.href);
    u.searchParams.set('id', categoryId);
    history.pushState({}, '', u);
    // toggle views: keep grid hidden? We'll hide grid and show productsView
    grid.style.display='none';
    if(statusEl) statusEl.style.display='none';
    if(productsView) productsView.style.display='block';
    if(productsTitle) productsTitle.textContent = categoryName;
    if(productsStatus) productsStatus.textContent = isArabic()?'جاري تحميل المنتجات...':'Loading products...';
    if(productsGrid) productsGrid.innerHTML='';
    await loadProducts(true);
  }

  async function loadProducts(isFirst=false){
    if(!currentCategoryId) return;
    if(loadingMore) return;
    loadingMore=true;
    if(loadMoreBtn) loadMoreBtn.style.display='none';
    try{
      const resp = await window.MazidAPI.getProductsByCategory(currentCategoryId, page, 20);
      const data = resp && resp.data ? resp.data : [];
      const pagination = resp && resp.pagination ? resp.pagination : null;
      if(pagination){ totalPages = pagination.totalPages || pagination.total_pages || 1; page = pagination.page || page; }
      if(isFirst){
        if(productsGrid) productsGrid.innerHTML='';
      }
      if(!data.length && isFirst){
        if(productsStatus) productsStatus.textContent = isArabic()?'لا توجد منتجات في هذه المجموعة':'No products in this collection yet.';
      } else {
        if(productsStatus) productsStatus.textContent='';
        renderProducts(data, isFirst);
        // pagination
        if(pagination && page < totalPages){
          if(loadMoreBtn) loadMoreBtn.style.display='inline-flex';
        } else {
          if(loadMoreBtn) loadMoreBtn.style.display='none';
        }
        page++;
      }
    }catch(e){
      if(productsStatus) { productsStatus.textContent='Error: '+e.message; productsStatus.classList.add('error'); }
    } finally { loadingMore=false; }
  }

  function renderProducts(products, isFirst){
    if(!productsGrid) return;
    products.forEach(p=>{
      const img = p.main_image_url || p.mainImageUrl || p.image_url || (p.image_urls && p.image_urls[0]) || (p.imageUrls && p.imageUrls[0]) || 'images/MazidMartLogo.png';
      const title = pickName(p) || p.sku || 'Product';
      const price = p.final_price ?? p.finalPrice ?? p.base_price ?? p.basePrice;
      const priceStr = price!=null ? Number(price).toLocaleString(isArabic()?'ar-EG':'en-US', {maximumFractionDigits:2})+' AED' : '';
      const card=document.createElement('div');
      card.className='product-card';
      card.style.cursor='pointer';
      card.innerHTML=`
        <img src="${img}" alt="${title}" loading="lazy" onerror="this.src='images/MazidMartLogo.png'"/>
        <div class="product-card-body">
          <div class="product-card-title">${title}</div>
          ${priceStr ? `<div class="product-card-price">${priceStr}</div>` : ''}
          ${p.weight_grams || p.weightGrams ? `<div class="product-card-meta">${p.weight_grams||p.weightGrams}g</div>` : ''}
        </div>
      `;
      card.onclick=()=> location.href=`product.html?id=${p.id}`;
      productsGrid.appendChild(card);
    });
  }

  if(loadMoreBtn) loadMoreBtn.onclick=()=> loadProducts(false);

  // Language switch re-render
  const langBtn=document.getElementById('lang-btn');
  if(langBtn) langBtn.addEventListener('click', ()=> setTimeout(()=>{ renderTabs(); if(currentCategoryId){ if(productsTitle) productsTitle.textContent = currentCategoryName; } else { const cats = selectedRootId===null ? allRoots : []; if(grid.style.display!=='none') renderCategoryGrid(allRoots); } },300));

  // If direct link with id, auto open
  loadRoots().then(()=>{
    if(initialCategoryId){
      // find name or fetch
      const found = allRoots.find(c=>c.id===initialCategoryId);
      // if not in roots, try to discover name via first fetch: we can just open with id
      const name = found ? pickName(found) : (isArabic()?'المنتجات':'Products');
      openProducts(initialCategoryId, name);
      // also find actual name after open? fetch products title will be okay
      if(found) {
        // ensure tab reflects root if subcategory
        // try to find parent: if not root, keep All selected
      }
    }
  });

  // Handle back via popstate
  window.addEventListener('popstate', ()=>{
    const params=new URLSearchParams(location.search);
    const id=params.get('id')||params.get('categoryId');
    if(!id){
      // back to collections
      grid.style.display='grid';
      if(productsView) productsView.style.display='none';
      if(statusEl) statusEl.style.display='none';
      currentCategoryId=null;
    } else {
      openProducts(id, currentCategoryName||'Products');
    }
  });
});
