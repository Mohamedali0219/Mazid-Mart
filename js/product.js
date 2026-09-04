document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const productId = params.get('id') || params.get('productId') || params.get('product_id');
  const statusEl = document.getElementById('pdStatus');
  const contentEl = document.getElementById('pdContent');
  const mainImg = document.getElementById('pdMainImg');
  const thumbs = document.getElementById('pdThumbs');
  const titleEl = document.getElementById('pdTitle');
  const categoryEl = document.getElementById('pdCategory');
  const priceEl = document.getElementById('pdPrice');
  const skuEl = document.getElementById('pdSku');
  const descEl = document.getElementById('pdDesc');
  const specsEl = document.getElementById('pdSpecs');
  const sizesSection = document.getElementById('pdSizesSection');
  const sizesEl = document.getElementById('pdSizes');
  const stockEl = document.getElementById('pdStock');
  const backLink = document.getElementById('backLink');

  function isArabic(){ if(typeof currentLang!=='undefined') return currentLang==='ar'; return document.body.classList.contains('ar'); }
  function pickName(o){ return window.MazidAPI ? window.MazidAPI.pickName(o, isArabic()?'ar':'en') : (o.name_en||''); }

  if (!productId){
    if(statusEl) { statusEl.textContent = isArabic() ? 'لم يتم تحديد المنتج' : 'No product selected'; statusEl.classList.add('error'); }
    return;
  }

  // back link respect referrer category
  const refCat = params.get('categoryId') || params.get('category_id') || document.referrer.includes('category') ? '' : null;
  if (backLink && params.get('categoryId')){
    backLink.href = `categories.html?id=${params.get('categoryId')}`;
  } else if (backLink) {
    backLink.href = 'categories.html';
  }

  try{
    if(statusEl) statusEl.textContent = isArabic() ? 'جاري تحميل المنتج...' : 'Loading product...';
    const resp = await window.MazidAPI.getProductDetails(productId);
    // resp may be {success, data:{...}} or direct
    let product = null;
    if (resp && resp.data) {
      // if resp.data is product directly or {data: product}
      if (resp.data.data) product = resp.data.data;
      else if (resp.data.id) product = resp.data;
      else product = resp.data;
    } else if (resp && resp.id) product = resp;
    else product = resp;

    // Some backends return {data: product} nested
    if (!product || !product.id) throw new Error('Product not found');

    render(product);
    if(statusEl) statusEl.style.display='none';
    if(contentEl) contentEl.style.display='grid';

    // lang switch re-render
    const langBtn=document.getElementById('lang-btn');
    if(langBtn) langBtn.addEventListener('click', ()=> setTimeout(()=> render(product), 300));

  }catch(e){
    console.error(e);
    if(statusEl){
      const isAr = (typeof currentLang!=='undefined' && currentLang==='ar') || document.body.classList.contains('ar');
      statusEl.innerHTML = `Error: ${e.message}<br><button class="btn" onclick="location.reload()" style="margin-top:10px;">${isAr?'إعادة المحاولة':'Retry'}</button>`;
      statusEl.classList.add('error');
      statusEl.style.display='block';
    }
    if(contentEl) contentEl.style.display='none';
  }

  async function render(product){
    const isAr = isArabic();
    const title = isAr ? (product.name_ar || product.nameAr || product.name_en || product.nameEn) : (product.name_en || product.nameEn || product.name_ar || product.nameAr);
    if(titleEl) titleEl.textContent = title;
    if(categoryEl) categoryEl.textContent = isAr ? (product.category_name_ar || product.categoryNameAr || '') : (product.category_name_en || product.categoryNameEn || '');
    if(skuEl) skuEl.textContent = product.sku ? `SKU: ${product.sku}` : '';

    // price — handle both list and details shapes (price/weight vs final_price/weight_grams)
    const finalPrice = product.final_price ?? product.finalPrice ?? product.price ?? null;
    const basePrice = product.base_price ?? product.basePrice ?? product.price ?? null;
    const salePrice = product.sale_price ?? product.salePrice ?? null;
    const isOnSale = product.is_on_sale ?? product.isOnSale ?? false;
    if(priceEl){
      const fmt = (v)=> Number(v).toLocaleString(isAr?'ar-EG':'en-US', {maximumFractionDigits:2}) + ' AED';
      if (isOnSale && salePrice!=null){
        priceEl.innerHTML = `${fmt(salePrice)} <s>${fmt(basePrice||finalPrice)}</s>`;
      } else if (finalPrice!=null){
        priceEl.textContent = fmt(finalPrice);
      } else if (basePrice!=null){
        priceEl.textContent = fmt(basePrice);
      } else priceEl.textContent='';
    }

    // stock
    if(stockEl){
      const level = product.stock_level || product.stockLevel || '';
      const qty = product.stock_quantity ?? product.stockQuantity ?? '';
      let text='', cls='';
      if (level==='in_stock' || level==='low_stock' || qty>0){ text = isAr?'متوفر':'In stock'; cls='in';}
      else if (level==='out_of_stock'){ text = isAr?'نفد المخزون':'Out of stock'; cls='out';}
      else text = level || (isAr?'متوفر':'Available');
      stockEl.textContent = text + (qty!=='' ? ` • ${qty}` : '');
      stockEl.className='pd-badge '+(cls||'');
      stockEl.style.display='inline-flex';
    }

    // images
    const images = [];
    if(product.main_image_url) images.push(product.main_image_url);
    if(product.mainImageUrl && !images.includes(product.mainImageUrl)) images.push(product.mainImageUrl);
    if(Array.isArray(product.image_urls)) images.push(...product.image_urls);
    if(Array.isArray(product.imageUrls)) images.push(...product.imageUrls);
    // details shape may have single image_url or first of image_urls already, ensure at least one
    if(images.length===0 && product.image_url) images.push(product.image_url);
    const uniq = [...new Set(images.filter(Boolean))];
    if(mainImg){
      mainImg.src = uniq[0] || 'images/MazidMartLogo.png';
      mainImg.alt = title;
      mainImg.onerror=()=> mainImg.src='images/MazidMartLogo.png';
    }
    if(thumbs){
      thumbs.innerHTML='';
      uniq.forEach((src,i)=>{
        const t=document.createElement('img');
        t.src=src; t.alt=title+' '+(i+1); t.className=i===0?'active':'';
        t.onclick=()=>{ if(mainImg) mainImg.src=src; thumbs.querySelectorAll('img').forEach(x=>x.classList.remove('active')); t.classList.add('active'); };
        t.onerror=()=> t.style.display='none';
        thumbs.appendChild(t);
      });
      thumbs.style.display = uniq.length>1 ? 'flex' : 'none';
    }

    // description
    if(descEl){
      const desc = isAr ? (product.description_ar || product.descriptionAr || product.description_en || product.descriptionEn || '') : (product.description_en || product.descriptionEn || product.description_ar || product.descriptionAr || '');
      descEl.textContent = desc || (isAr?'لا يوجد وصف':'No description available');
    }

    // specs — handle both shapes
    if(specsEl){
      specsEl.innerHTML='';
      const add = (k,v)=>{ if(v===undefined||v===null||v==='') return; const dt=document.createElement('dt'); dt.textContent=k; const dd=document.createElement('dd'); dd.textContent=String(v); specsEl.appendChild(dt); specsEl.appendChild(dd); };
      const weight = product.weight_grams ?? product.weightGrams ?? product.weight ?? null;
      add(isAr?'الوزن':'Weight', weight ? `${weight} g` : '');
      add(isAr?'سعر الجرام':'Metal price/g', product.metal_price_per_gram ?? product.metalPricePerGram);
      add('SKU', product.sku);
      add(isAr?'الحالة':'Status', product.status);
      add(isAr?'المشاهدات':'Views', product.view_count ?? product.viewCount);
      if(product.average_rating || product.averageRating) add(isAr?'التقييم':'Rating', `${product.average_rating ?? product.averageRating} (${(product.reviews_count ?? product.reviewsCount ?? 0)})`);
      if(product.silver_purity) add(isAr?'نقاء الفضة':'Silver purity', product.silver_purity);
      if(product.specifications?.material) add(isAr?'المادة':'Material', product.specifications.material);
      if(product.specifications?.thickness_mm) add(isAr?'السماكة':'Thickness', product.specifications.thickness_mm+' mm');
      if(product.making_fee) add(isAr?'أجرة التصنيع':'Making fee', product.making_fee);
    }

    // sizes
    if(sizesSection && sizesEl){
      const sizes = product.specifications?.ar_sizes || product.specifications?.arSizes || [];
      if(sizes && sizes.length){
        sizesSection.style.display='block';
        sizesEl.innerHTML='';
        sizes.forEach(s=>{
          const b=document.createElement('span');
          b.textContent=s;
          b.style.cssText='padding:6px 12px; border:1px solid var(--color-border); border-radius:20px; background:#fff; font-size:0.85rem;';
          sizesEl.appendChild(b);
        });
      } else sizesSection.style.display='none';
    }

    // WhatsApp inquiry link with product title + id
    const whatsapp = document.getElementById('pdWhatsapp');
    if(whatsapp){
      const msg = encodeURIComponent(`${isAr?'استفسار عن المنتج':'Inquiry about product'}: ${title} (ID: ${product.id})`);
      whatsapp.href = `https://wa.me/971555501925?text=${msg}`;
    }

    // Related products by same category (non-blocking)
    const relatedSection = document.getElementById('relatedSection');
    const relatedGrid = document.getElementById('relatedGrid');
    const catId = product.category_id || product.categoryId || product.category?.id;
    if (catId && relatedSection && relatedGrid){
      relatedGrid.innerHTML = `<div class="catalog-status">Loading related…</div>`;
      relatedSection.style.display='block';
      try{
        const resp = await window.MazidAPI.getProductsByCategory(catId, 1, 8);
        const list = resp && resp.data ? resp.data : [];
        const filtered = list.filter(p=> p.id !== product.id).slice(0,4);
        if (filtered.length){
          relatedGrid.innerHTML='';
          filtered.forEach(p=>{
            const img = p.image_urls?.[0] || p.main_image_url || p.mainImageUrl || p.imageUrl || p.image_url || 'images/MazidMartLogo.png';
            const name = pickName(p);
            const price = p.final_price ?? p.finalPrice ?? p.base_price ?? p.price ?? null;
            const priceStr = price!=null ? Number(price).toLocaleString(isAr?'ar-EG':'en-US', {maximumFractionDigits:2})+' AED' : '';
            const card=document.createElement('div');
            card.className='product-card';
            card.style.cursor='pointer';
            card.onclick=()=> location.href=`product.html?id=${p.id}&categoryId=${catId}`;
            card.innerHTML=`<img src="${img}" alt="${name}" loading="lazy" onerror="this.src='images/MazidMartLogo.png'"/><div class="product-card-body"><div class="product-card-title">${name}</div>${priceStr?`<div class="product-card-price">${priceStr}</div>`:''}</div>`;
            relatedGrid.appendChild(card);
          });
        } else {
          relatedGrid.innerHTML = `<div class="catalog-status">${isAr?'لا توجد منتجات مشابهة':'No related products'}</div>`;
        }
      }catch(e){ relatedGrid.innerHTML = `<div class="catalog-status error">Failed to load related</div>`; }
    }
  }
});
