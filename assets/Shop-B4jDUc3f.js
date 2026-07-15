import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{$ as t,F as n,H as r,R as i,U as a,W as o,Y as s,Z as c,_ as ee,g as l,h as u,i as te,r as d,st as ne,tt as f,ut as p,v as m,w as h}from"./react-vendor-D3H5uvDC.js";import{n as g,r as _}from"./images-Bc_uE_G8.js";import{E as v,T as y,n as b,r as x,w as S}from"./index-BSBX0hGa.js";import{t as re}from"./useJsonLd-SkeF47zR.js";var C=e(p(),1),w=t(),T={eggless:{label:`Eggless`,icon:`🌱`,kind:`free`},vegan:{label:`Vegan`,icon:`🌿`,kind:`free`},"gluten-free":{label:`Gluten-Free`,icon:`🌾`,kind:`free`},"contains-nuts":{label:`Contains Nuts`,icon:`🌰`,kind:`contains`},"contains-egg":{label:`Contains Egg`,icon:`🥚`,kind:`contains`},"contains-dairy":{label:`Contains Dairy`,icon:`🥛`,kind:`contains`},"contains-gluten":{label:`Contains Gluten`,icon:`🌾`,kind:`contains`},"eggless-option":{label:`Eggless on request`,icon:`🌱`,kind:`option`}},E={free:{bg:`rgba(34, 139, 81, 0.10)`,fg:`#1d6f3a`,border:`rgba(34, 139, 81, 0.35)`},contains:{bg:`rgba(184, 134, 11, 0.12)`,fg:`#8a5d05`,border:`rgba(184, 134, 11, 0.35)`},option:{bg:`rgba(224, 97, 122, 0.08)`,fg:`var(--cc-rose-deep)`,border:`rgba(224, 97, 122, 0.4)`}};function D({allergens:e,verbose:t=!1,size:n=`sm`}){if(!Array.isArray(e)||e.length===0)return null;let r=[`eggless`,`eggless-option`,`vegan`,`gluten-free`,`contains-nuts`],i=t?e:e.filter(e=>r.includes(e));if(i.length===0)return null;let a=n===`lg`?`0.4rem 0.7rem`:`0.18rem 0.5rem`,o=n===`lg`?`0.78rem`:`0.66rem`;return(0,w.jsx)(`div`,{className:`d-flex flex-wrap`,style:{gap:4},children:i.map(e=>{let t=T[e];if(!t)return null;let n=E[t.kind];return(0,w.jsxs)(`span`,{title:t.label,style:{display:`inline-flex`,alignItems:`center`,gap:3,fontSize:o,fontWeight:600,letterSpacing:`0.02em`,color:n.fg,background:n.bg,border:`1px solid ${n.border}`,padding:a,borderRadius:999,lineHeight:1.1,whiteSpace:`nowrap`},children:[(0,w.jsx)(`span`,{"aria-hidden":!0,style:{fontSize:`0.9em`},children:t.icon}),t.label]},e)})})}function O({product:e,onClose:t}){let{add:n}=v();if((0,C.useEffect)(()=>{if(!e)return;let n=e=>{e.key===`Escape`&&t()};return document.addEventListener(`keydown`,n),document.body.style.overflow=`hidden`,()=>{document.removeEventListener(`keydown`,n),document.body.style.overflow=``}},[e,t]),!e)return null;let r=e;function i(e){n(e),t()}return(0,w.jsxs)(`div`,{role:`dialog`,"aria-modal":`true`,"aria-label":r.name,onClick:t,className:`qv-backdrop`,children:[(0,w.jsxs)(`div`,{onClick:e=>e.stopPropagation(),className:`qv-modal`,children:[(0,w.jsx)(`button`,{onClick:t,"aria-label":`Close`,className:`qv-close`,children:(0,w.jsx)(c,{size:18})}),(0,w.jsxs)(`div`,{className:`qv-grid`,children:[(0,w.jsxs)(`div`,{className:`qv-image-col`,children:[(0,w.jsx)(`img`,{src:_(r.img,800,800),alt:r.name,className:`qv-image`}),r.badge&&(0,w.jsx)(`span`,{className:`qv-badge`,children:r.badge})]}),(0,w.jsxs)(`div`,{className:`qv-info-col`,children:[(0,w.jsx)(`div`,{className:`tag-badge mb-1`,style:{fontSize:`0.65rem`},children:r.category}),(0,w.jsx)(`h3`,{className:`qv-title`,children:r.name}),r.allergens?.length>0&&(0,w.jsx)(`div`,{className:`mt-2`,children:(0,w.jsx)(D,{allergens:r.allergens,verbose:!0})}),(0,w.jsx)(`p`,{className:`qv-desc`,children:`Handcrafted with the finest ingredients. Each order is freshly prepared. Please pre-order at least 1 day in advance.`}),r.slice?(0,w.jsxs)(`div`,{className:`qv-options`,children:[(0,w.jsxs)(`div`,{className:`qv-option`,children:[(0,w.jsxs)(`div`,{className:`qv-option__info`,children:[(0,w.jsx)(`div`,{className:`qv-option__label`,children:r.sizeLabel||`Whole`}),(0,w.jsx)(`div`,{className:`qv-option__price`,children:S(r.price)})]}),(0,w.jsxs)(`button`,{className:`qv-btn qv-btn--filled`,onClick:()=>i({...r,name:`${r.name} (${r.sizeLabel||`Whole`})`}),children:[(0,w.jsx)(a,{size:13}),` Add`]})]}),(0,w.jsxs)(`div`,{className:`qv-option`,children:[(0,w.jsxs)(`div`,{className:`qv-option__info`,children:[(0,w.jsx)(`div`,{className:`qv-option__label`,children:r.sliceLabel||`Slice`}),(0,w.jsx)(`div`,{className:`qv-option__price`,children:S(r.slice)})]}),(0,w.jsxs)(`button`,{className:`qv-btn qv-btn--outline`,onClick:()=>i({id:r.id+`-slice`,name:`${r.name} (${r.sliceLabel||`Slice`})`,price:r.slice,img:r.img}),children:[(0,w.jsx)(a,{size:13}),` Add`]})]})]}):(0,w.jsx)(`div`,{className:`qv-actions`,children:(0,w.jsxs)(`button`,{className:`qv-btn qv-btn--filled w-100`,onClick:()=>i(r),children:[(0,w.jsx)(a,{size:13}),` Add to Cart — `,S(r.price)]})}),(0,w.jsxs)(`button`,{className:`qv-fav`,children:[(0,w.jsx)(h,{size:13}),` Save to favourites`]})]})]})]}),(0,w.jsx)(`style`,{children:`
        @keyframes qv-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes qv-up { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .qv-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(91, 62, 54, 0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: qv-fade 0.2s ease-out;
        }
        .qv-modal {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 720px;
          max-height: calc(100vh - 2rem);
          overflow-y: auto;
          position: relative;
          box-shadow: 0 24px 60px rgba(0,0,0,0.25);
          animation: qv-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .qv-close {
          position: absolute; top: 12px; right: 12px; z-index: 2;
          width: 34px; height: 34px;
          border-radius: 50%; border: none;
          background: #fff; color: var(--cc-cocoa);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        /* Grid: image left / info right on desktop; stacked on mobile */
        .qv-grid {
          display: grid;
          grid-template-columns: 1fr;
          align-items: stretch;
        }
        .qv-image-col {
          position: relative;
          background: var(--cc-cream);
        }
        .qv-image {
          width: 100%;
          aspect-ratio: 4/3;
          object-fit: cover;
          display: block;
          border-radius: 16px 16px 0 0;
        }
        .qv-badge {
          position: absolute; top: 12px; left: 12px;
          background: var(--cc-rose); color: #fff;
          font-size: 0.65rem; font-weight: 700;
          padding: 4px 10px; border-radius: 999px;
          letter-spacing: 0.08em; text-transform: uppercase;
          box-shadow: 0 4px 10px rgba(207, 62, 99, 0.35);
        }
        .qv-info-col {
          padding: 1.2rem 1.4rem 1.4rem;
          display: flex; flex-direction: column;
        }

        @media (min-width: 720px) {
          .qv-grid { grid-template-columns: 5fr 7fr; }
          .qv-image { aspect-ratio: auto; height: 100%; min-height: 360px; border-radius: 16px 0 0 16px; }
          .qv-info-col { padding: 1.4rem 1.6rem 1.6rem; }
        }

        .qv-title {
          font-size: clamp(1.2rem, 3vw, 1.5rem);
          margin: 0.3rem 0 0;
          color: var(--cc-cocoa);
          font-weight: 700;
          line-height: 1.2;
        }
        .qv-price-pair {
          display: flex;
          border: 1px solid var(--cc-border);
          border-radius: 10px;
          overflow: hidden;
        }
        .qv-price-pair > .qv-price-cell + .qv-price-cell {
          border-left: 1px solid var(--cc-border);
        }
        .qv-price-cell {
          flex: 1;
          text-align: center;
          padding: 0.55rem 0.5rem;
        }
        .qv-price-single {
          padding: 0.6rem;
          background: var(--cc-cream);
          border-radius: 10px;
          text-align: center;
        }
        .qv-price-label {
          font-size: 0.6rem;
          color: var(--cc-cocoa-soft);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 700;
        }
        .qv-price-amount {
          font-size: 1.15rem;
          color: var(--cc-rose);
          font-weight: 700;
          margin-top: 2px;
        }

        .qv-desc {
          font-size: 0.82rem;
          color: var(--cc-cocoa-soft);
          margin: 0.8rem 0 0;
          line-height: 1.5;
        }

        /* Stacked size options — replaces the side-by-side price pair */
        .qv-options {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-top: 1rem;
          padding-top: 0.4rem;
        }
        .qv-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.8rem;
          padding: 0.7rem 0.95rem;
          background: var(--cc-cream);
          border: 1px solid var(--cc-border);
          border-radius: 12px;
        }
        .qv-option + .qv-option { background: #fff; }
        .qv-option__info { min-width: 0; }
        .qv-option__label {
          font-size: 0.62rem;
          color: var(--cc-cocoa-soft);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 700;
        }
        .qv-option__price {
          font-size: 1.25rem;
          color: var(--cc-rose);
          font-weight: 700;
          line-height: 1.1;
          margin-top: 2px;
        }
        .qv-option .qv-btn { flex: 0 0 auto; min-width: 96px; padding: 0.6rem 1rem; }

        .qv-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 0.4rem;
        }
        .qv-btn {
          flex: 1;
          border: none;
          border-radius: 999px;
          padding: 0.55rem 0.7rem;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          white-space: nowrap;
          line-height: 1;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .qv-btn--outline {
          background: #fff;
          color: var(--cc-rose);
          border: 1.5px solid var(--cc-rose);
        }
        .qv-btn--outline:hover {
          background: var(--cc-blush);
        }
        .qv-btn--filled {
          background: var(--cc-rose);
          color: #fff;
          box-shadow: 0 3px 10px rgba(207, 62, 99, 0.25);
        }
        .qv-btn--filled:hover {
          background: var(--cc-rose-deep);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(207, 62, 99, 0.4);
        }

        .qv-fav {
          margin-top: 0.7rem;
          background: none; border: none;
          color: var(--cc-cocoa-soft);
          font-size: 0.75rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          cursor: pointer;
          padding: 0.3rem 0.5rem;
        }
        .qv-fav:hover { color: var(--cc-rose); }
      `})]})}var k=[`All Products`,`Cheesecakes`,`Milk Cakes`,`Sponge Cakes`,`Cookies`,`Cupcakes`,`Bakes`,`Dessert Cups`,`Drinks`],A=[{id:`all`,label:`All Prices`,test:()=>!0},{id:`0-200`,label:`₹0 – ₹200`,test:e=>(e.slice||e.price)<=200},{id:`200-500`,label:`₹200 – ₹500`,test:e=>(e.slice||e.price)>200&&(e.slice||e.price)<=500},{id:`500-1000`,label:`₹500 – ₹1000`,test:e=>(e.slice||e.price)>500&&(e.slice||e.price)<=1e3},{id:`1000+`,label:`₹1000+`,test:e=>(e.slice||e.price)>1e3}],j=[`Birthday`,`Wedding`,`Anniversary`,`Thank You`,`Just Because`,`Other`];function M({checked:e,onChange:t,label:n}){return(0,w.jsxs)(`label`,{className:`cc-shop-radio`,children:[(0,w.jsx)(`input`,{type:`radio`,checked:e,onChange:t,className:`cc-shop-radio__input`}),(0,w.jsx)(`span`,{className:`cc-shop-radio__dot`,"aria-hidden":!0}),(0,w.jsx)(`span`,{children:n})]})}function N(){x({title:`Shop`,description:`Order from our full menu — cheesecakes, milk cakes, cookies, cupcakes, dessert cups and drinks. UPI / Cash on Delivery.`}),re(`shop-products`,{"@context":`https://schema.org`,"@type":`ItemList`,name:`Cake & Crumb — Shop`,numberOfItems:y.length,itemListElement:y.slice(0,30).map((e,t)=>({"@type":`ListItem`,position:t+1,item:{"@type":`Product`,name:e.name,category:e.category,image:typeof window<`u`?new URL(_(e.img,800,800),window.location.origin).href:_(e.img,800,800),brand:{"@type":`Brand`,name:`Cake & Crumb`},offers:{"@type":`Offer`,price:e.slice||e.price,priceCurrency:`INR`,availability:`https://schema.org/InStock`},aggregateRating:{"@type":`AggregateRating`,ratingValue:`4.9`,reviewCount:`245`}}}))});let[e]=ne(),t=e.get(`category`),[p,T]=(0,C.useState)(t&&k.includes(t)?t:`All Products`),[E,D]=(0,C.useState)(`all`),[N,P]=(0,C.useState)(null),[F,I]=(0,C.useState)(`featured`),[L,R]=(0,C.useState)(1),[z,B]=(0,C.useState)(null),[V,H]=(0,C.useState)(!1),U=(p===`All Products`?0:1)+(E===`all`?0:1)+ +!!N,{items:W,count:G,subtotal:K,add:q,increment:J,decrement:Y,remove:ie,clear:ae}=v(),X=(0,C.useMemo)(()=>{let e=A.find(e=>e.id===E)?.test??(()=>!0),t=y.filter(t=>(p===`All Products`||t.category===p)&&e(t));return F===`lowhigh`?t=[...t].sort((e,t)=>(e.slice||e.price)-(t.slice||t.price)):F===`highlow`&&(t=[...t].sort((e,t)=>(t.slice||t.price)-(e.slice||e.price))),t},[p,E,F]),Z=Math.max(1,Math.ceil(X.length/12)),oe=X.slice((L-1)*12,L*12),se=X.length===0?0:(L-1)*12+1,ce=Math.min(L*12,X.length);(0,C.useEffect)(()=>{t&&k.includes(t)&&T(t)},[t]),(0,C.useEffect)(()=>{R(1)},[p,E,F]);let le=()=>{T(`All Products`),D(`all`),P(null)},Q=(0,C.useRef)(null);function $(){typeof window>`u`||window.innerWidth>=992||requestAnimationFrame(()=>{let e=Q.current;if(!e)return;let t=parseInt(getComputedStyle(document.documentElement).getPropertyValue(`--cc-header-h`),10)||82,n=e.getBoundingClientRect().top+window.scrollY-t-12;window.scrollTo({top:n,behavior:`smooth`})})}let ue=e=>{T(e),$()},de=e=>{D(e),$()};return(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(`section`,{className:`cc-shop-hero`,children:(0,w.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,w.jsxs)(`div`,{className:`row g-4 g-lg-5 align-items-center`,children:[(0,w.jsxs)(`div`,{className:`col-lg-6 text-center text-lg-start`,children:[(0,w.jsx)(`span`,{className:`eyebrow mb-3 d-inline-flex`,children:`Shop Our Treats`}),(0,w.jsxs)(`h1`,{className:`cc-shop-hero__title`,children:[`Handcrafted`,(0,w.jsx)(`br`,{}),`Just for You`]}),(0,w.jsx)(b,{width:50}),(0,w.jsx)(`p`,{className:`cc-shop-hero__lede`,children:`Discover our handmade cakes, cupcakes, cookies, and chocolates — made with the finest ingredients and a whole lot of love.`})]}),(0,w.jsx)(`div`,{className:`col-lg-6`,children:(0,w.jsx)(`img`,{src:_(g.heroShop,1e3,800),alt:`Cupcakes on tiered display stands`,className:`cc-shop-hero__img`,fetchPriority:`high`})})]})})}),(0,w.jsx)(`section`,{className:`cc-shop-main`,children:(0,w.jsx)(`div`,{className:`container py-4`,children:(0,w.jsxs)(`div`,{className:`row g-4`,children:[(0,w.jsx)(`aside`,{className:`col-lg-3 col-xl-2`,children:(0,w.jsxs)(`div`,{className:`cc-shop-filter`,children:[(0,w.jsx)(`h6`,{className:`cc-shop-filter__heading`,children:`Filter By`}),(0,w.jsxs)(`button`,{type:`button`,className:`cc-shop-filter__toggle`,onClick:()=>H(e=>!e),"aria-expanded":V,children:[(0,w.jsxs)(`span`,{className:`cc-shop-filter__toggle-label`,children:[(0,w.jsx)(o,{size:15}),`Filters`,U>0&&(0,w.jsx)(`span`,{className:`cc-shop-filter__count`,children:U})]}),(0,w.jsx)(l,{size:18,className:`cc-shop-filter__chevron`+(V?` is-open`:``)})]}),(0,w.jsxs)(`div`,{className:`cc-shop-filter__body`+(V?` is-open`:``),children:[(0,w.jsxs)(`div`,{className:`cc-shop-filter__group`,children:[(0,w.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Category`}),k.map(e=>(0,w.jsx)(M,{label:e,checked:p===e,onChange:()=>ue(e)},e))]}),(0,w.jsxs)(`div`,{className:`cc-shop-filter__group`,children:[(0,w.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Price Range`}),A.map(e=>(0,w.jsx)(M,{label:e.label,checked:E===e.id,onChange:()=>de(e.id)},e.id))]}),(0,w.jsxs)(`div`,{className:`cc-shop-filter__group`,children:[(0,w.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Occasion`}),j.map(e=>(0,w.jsx)(M,{label:e,checked:N===e,onChange:()=>P(e)},e))]}),(0,w.jsx)(`button`,{type:`button`,className:`cc-shop-filter__clear`,onClick:le,children:`Clear Filters`})]})]})}),(0,w.jsxs)(`div`,{className:`col-lg-6 col-xl-7`,ref:Q,children:[(0,w.jsxs)(`div`,{className:`cc-shop-toolbar`,children:[(0,w.jsxs)(`span`,{className:`cc-shop-toolbar__count`,children:[`Showing `,se,`–`,ce,` of `,X.length,` results`]}),(0,w.jsxs)(`label`,{className:`cc-shop-toolbar__sort`,children:[(0,w.jsx)(`span`,{children:`Sort by:`}),(0,w.jsxs)(`select`,{value:F,onChange:e=>I(e.target.value),children:[(0,w.jsx)(`option`,{value:`featured`,children:`Featured`}),(0,w.jsx)(`option`,{value:`lowhigh`,children:`Price: low to high`}),(0,w.jsx)(`option`,{value:`highlow`,children:`Price: high to low`})]})]})]}),p===`Cupcakes`&&(0,w.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,w.jsx)(h,{size:12}),` Cupcakes are sold by the box of 6. Add ₹20 for floral or additional decoration.`]}),(0,w.jsxs)(`div`,{className:`cc-shop-grid`,children:[oe.map(e=>(0,w.jsxs)(`article`,{className:`cc-product-card`,children:[(0,w.jsx)(`button`,{type:`button`,className:`cc-product-card__heart`,"aria-label":`Add to favorites`,children:(0,w.jsx)(h,{size:14})}),(0,w.jsx)(`button`,{type:`button`,onClick:()=>B(e),"aria-label":`View ${e.name}`,className:`cc-product-card__img-btn`,children:(0,w.jsx)(`img`,{src:_(e.img,500,500),alt:e.name,loading:`lazy`})}),(0,w.jsxs)(`div`,{className:`cc-product-card__body`,children:[(0,w.jsx)(`div`,{className:`cc-product-card__cat`,children:e.category}),(0,w.jsx)(`h6`,{className:`cc-product-card__name`,onClick:()=>B(e),title:e.name,children:e.name}),(0,w.jsx)(`div`,{className:`cc-product-card__price`,children:e.slice?`From ${S(e.slice)}`:S(e.price)}),(0,w.jsxs)(`button`,{className:`cc-product-card__add`,onClick:()=>{e.slice?B(e):q(e)},children:[(0,w.jsx)(a,{size:12}),` Add to Cart`]})]})]},e.id)),X.length===0&&(0,w.jsx)(`div`,{className:`cc-shop-empty`,children:`No products match your filters.`})]}),Z>1&&(0,w.jsxs)(`nav`,{className:`cc-shop-pagination`,"aria-label":`Product pages`,children:[(0,w.jsx)(`button`,{type:`button`,className:`cc-shop-pagination__btn`,onClick:()=>R(e=>Math.max(1,e-1)),disabled:L===1,"aria-label":`Previous page`,children:(0,w.jsx)(ee,{size:14})}),Array.from({length:Z},(e,t)=>t+1).map(e=>(0,w.jsx)(`button`,{type:`button`,className:`cc-shop-pagination__btn cc-shop-pagination__num`+(e===L?` is-active`:``),onClick:()=>R(e),"aria-current":e===L?`page`:void 0,children:e},e)),(0,w.jsx)(`button`,{type:`button`,className:`cc-shop-pagination__btn`,onClick:()=>R(e=>Math.min(Z,e+1)),disabled:L===Z,"aria-label":`Next page`,children:(0,w.jsx)(m,{size:14})})]})]}),(0,w.jsx)(`aside`,{className:`col-lg-3`,children:(0,w.jsxs)(`div`,{className:`cc-shop-cart`,children:[(0,w.jsxs)(`div`,{className:`cc-shop-cart__head`,children:[(0,w.jsxs)(`span`,{className:`cc-shop-cart__title`,children:[`Your Cart (`,G,`)`]}),G>0&&(0,w.jsx)(`button`,{type:`button`,className:`cc-shop-cart__clear`,onClick:ae,"aria-label":`Clear cart`,children:(0,w.jsx)(c,{size:16})})]}),G===0&&(0,w.jsx)(`p`,{className:`cc-shop-cart__empty`,children:`Your cart is empty.`}),W.map(e=>(0,w.jsxs)(`div`,{className:`cc-shop-cart__item`,children:[(0,w.jsx)(`img`,{src:_(e.img,200,200),alt:``,className:`cc-shop-cart__item-img`}),(0,w.jsxs)(`div`,{className:`cc-shop-cart__item-body`,children:[(0,w.jsxs)(`div`,{className:`cc-shop-cart__item-top`,children:[(0,w.jsx)(`strong`,{className:`cc-shop-cart__item-name`,children:e.name}),(0,w.jsx)(`button`,{type:`button`,onClick:()=>ie(e.id),"aria-label":`Remove`,className:`cc-shop-cart__item-remove`,children:(0,w.jsx)(c,{size:14})})]}),(0,w.jsx)(`div`,{className:`cc-shop-cart__item-price`,children:S(e.price)}),(0,w.jsxs)(`div`,{className:`cc-shop-cart__qty`,children:[(0,w.jsx)(`button`,{className:`qty-btn`,onClick:()=>Y(e.id),"aria-label":`Decrease`,children:(0,w.jsx)(n,{size:12})}),(0,w.jsx)(`span`,{children:e.qty}),(0,w.jsx)(`button`,{className:`qty-btn`,onClick:()=>J(e.id),"aria-label":`Increase`,children:(0,w.jsx)(i,{size:12})})]})]})]},e.id)),(0,w.jsxs)(`div`,{className:`cc-shop-cart__subtotal`,children:[(0,w.jsx)(`span`,{children:`SUBTOTAL`}),(0,w.jsx)(`strong`,{children:S(K)})]}),(0,w.jsx)(`p`,{className:`cc-shop-cart__note`,children:`Home delivery charges confirmed on WhatsApp. Pickup is free.`}),(0,w.jsxs)(f,{to:`/cart`,className:`btn-rose w-100 justify-content-center mb-2`,style:{pointerEvents:G===0?`none`:`auto`,opacity:G===0?.5:1},children:[(0,w.jsx)(a,{size:14}),` View Cart`]}),(0,w.jsxs)(f,{to:`/checkout`,className:`btn-outline-rose w-100 justify-content-center`,style:{pointerEvents:G===0?`none`:`auto`,opacity:G===0?.5:1},children:[(0,w.jsx)(u,{size:14}),` Checkout`]}),(0,w.jsxs)(`div`,{className:`cc-shop-special`,children:[(0,w.jsx)(`span`,{className:`cc-shop-special__icon`,children:(0,w.jsx)(h,{size:16})}),(0,w.jsx)(`h6`,{className:`cc-shop-special__title`,children:`Need Something Special?`}),(0,w.jsx)(`p`,{className:`cc-shop-special__text`,children:`We love creating custom treats for your special moments.`}),(0,w.jsx)(f,{to:`/contact`,className:`cc-shop-special__btn`,children:`Place Custom Order`})]}),(0,w.jsx)(`ul`,{className:`cc-shop-trust`,children:[{Icon:h,title:`Handcrafted with Love`,text:`Made in small batches with care.`},{Icon:d,title:`Premium Ingredients`,text:`We use only the finest ingredients.`},{Icon:r,title:`Secure Packaging`,text:`Your treats arrive fresh and beautiful.`}].map((e,t)=>(0,w.jsxs)(`li`,{className:`cc-shop-trust__row`,children:[(0,w.jsx)(`span`,{className:`cc-shop-trust__icon`,children:(0,w.jsx)(e.Icon,{size:14})}),(0,w.jsxs)(`div`,{children:[(0,w.jsx)(`div`,{className:`cc-shop-trust__title`,children:e.title}),(0,w.jsx)(`p`,{className:`cc-shop-trust__text`,children:e.text})]})]},t))})]})})]})})}),(0,w.jsx)(`section`,{className:`cc-shop-promise`,children:(0,w.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,w.jsx)(`div`,{className:`feature-row`,children:[{Icon:d,title:`Fresh & Quality`,text:`We source the freshest ingredients for the best taste and quality.`},{Icon:te,title:`Made to Order`,text:`Every treat is made to order just for you.`},{Icon:s,title:`On-Time Delivery`,text:`We deliver your treats fresh and on time, every time.`},{Icon:r,title:`Safe & Secure`,text:`Secure checkout and careful packaging always.`}].map((e,t)=>(0,w.jsxs)(`div`,{className:`feature-cell text-center cc-shop-promise__cell`,children:[(0,w.jsx)(`span`,{className:`cc-features-card__icon cc-features-card__icon--lg`,children:(0,w.jsx)(e.Icon,{size:22})}),(0,w.jsx)(`div`,{className:`cc-features-card__heading mt-3`,children:e.title}),(0,w.jsx)(`p`,{className:`cc-features-card__text mt-1`,children:e.text})]},t))})})}),(0,w.jsx)(O,{product:z,onClose:()=>B(null)})]})}export{N as default};