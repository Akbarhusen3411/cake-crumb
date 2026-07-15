import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{$ as t,F as n,H as r,R as i,U as a,W as o,Y as ee,Z as s,_ as c,g as te,h as l,i as u,r as d,st as ne,tt as f,ut as p,v as re,w as m}from"./react-vendor-D3H5uvDC.js";import{n as ie,r as h}from"./images-Bc_uE_G8.js";import{E as g,T as _,n as v,r as y,w as b}from"./index-EKsUIOaj.js";import{t as x}from"./useJsonLd-SkeF47zR.js";var S=e(p(),1),C=t(),w={eggless:{label:`Eggless`,icon:`🌱`,kind:`free`},vegan:{label:`Vegan`,icon:`🌿`,kind:`free`},"gluten-free":{label:`Gluten-Free`,icon:`🌾`,kind:`free`},"contains-nuts":{label:`Contains Nuts`,icon:`🌰`,kind:`contains`},"contains-egg":{label:`Contains Egg`,icon:`🥚`,kind:`contains`},"contains-dairy":{label:`Contains Dairy`,icon:`🥛`,kind:`contains`},"contains-gluten":{label:`Contains Gluten`,icon:`🌾`,kind:`contains`},"eggless-option":{label:`Eggless on request`,icon:`🌱`,kind:`option`}},T={free:{bg:`rgba(34, 139, 81, 0.10)`,fg:`#1d6f3a`,border:`rgba(34, 139, 81, 0.35)`},contains:{bg:`rgba(184, 134, 11, 0.12)`,fg:`#8a5d05`,border:`rgba(184, 134, 11, 0.35)`},option:{bg:`rgba(224, 97, 122, 0.08)`,fg:`var(--cc-rose-deep)`,border:`rgba(224, 97, 122, 0.4)`}};function E({allergens:e,verbose:t=!1,size:n=`sm`}){if(!Array.isArray(e)||e.length===0)return null;let r=[`eggless`,`eggless-option`,`vegan`,`gluten-free`,`contains-nuts`],i=t?e:e.filter(e=>r.includes(e));if(i.length===0)return null;let a=n===`lg`?`0.4rem 0.7rem`:`0.18rem 0.5rem`,o=n===`lg`?`0.78rem`:`0.66rem`;return(0,C.jsx)(`div`,{className:`d-flex flex-wrap`,style:{gap:4},children:i.map(e=>{let t=w[e];if(!t)return null;let n=T[t.kind];return(0,C.jsxs)(`span`,{title:t.label,style:{display:`inline-flex`,alignItems:`center`,gap:3,fontSize:o,fontWeight:600,letterSpacing:`0.02em`,color:n.fg,background:n.bg,border:`1px solid ${n.border}`,padding:a,borderRadius:999,lineHeight:1.1,whiteSpace:`nowrap`},children:[(0,C.jsx)(`span`,{"aria-hidden":!0,style:{fontSize:`0.9em`},children:t.icon}),t.label]},e)})})}function D({product:e,onClose:t}){let{add:n}=g();if((0,S.useEffect)(()=>{if(!e)return;let n=e=>{e.key===`Escape`&&t()};return document.addEventListener(`keydown`,n),document.body.style.overflow=`hidden`,()=>{document.removeEventListener(`keydown`,n),document.body.style.overflow=``}},[e,t]),!e)return null;let r=e;function i(e){n(e),t()}return(0,C.jsxs)(`div`,{role:`dialog`,"aria-modal":`true`,"aria-label":r.name,onClick:t,className:`qv-backdrop`,children:[(0,C.jsxs)(`div`,{onClick:e=>e.stopPropagation(),className:`qv-modal`,children:[(0,C.jsx)(`button`,{onClick:t,"aria-label":`Close`,className:`qv-close`,children:(0,C.jsx)(s,{size:18})}),(0,C.jsxs)(`div`,{className:`qv-grid`,children:[(0,C.jsxs)(`div`,{className:`qv-image-col`,children:[(0,C.jsx)(`img`,{src:h(r.img,800,800),alt:r.name,className:`qv-image`}),r.badge&&(0,C.jsx)(`span`,{className:`qv-badge`,children:r.badge})]}),(0,C.jsxs)(`div`,{className:`qv-info-col`,children:[(0,C.jsx)(`div`,{className:`tag-badge mb-1`,style:{fontSize:`0.65rem`},children:r.category}),(0,C.jsx)(`h3`,{className:`qv-title`,children:r.name}),r.allergens?.length>0&&(0,C.jsx)(`div`,{className:`mt-2`,children:(0,C.jsx)(E,{allergens:r.allergens,verbose:!0})}),(0,C.jsx)(`p`,{className:`qv-desc`,children:`Handcrafted with the finest ingredients. Each order is freshly prepared. Please pre-order at least 1 day in advance.`}),r.slice?(0,C.jsxs)(`div`,{className:`qv-options`,children:[(0,C.jsxs)(`div`,{className:`qv-option`,children:[(0,C.jsxs)(`div`,{className:`qv-option__info`,children:[(0,C.jsx)(`div`,{className:`qv-option__label`,children:r.sizeLabel||`Whole`}),(0,C.jsx)(`div`,{className:`qv-option__price`,children:b(r.price)})]}),(0,C.jsxs)(`button`,{className:`qv-btn qv-btn--filled`,onClick:()=>i({...r,name:`${r.name} (${r.sizeLabel||`Whole`})`}),children:[(0,C.jsx)(a,{size:13}),` Add`]})]}),(0,C.jsxs)(`div`,{className:`qv-option`,children:[(0,C.jsxs)(`div`,{className:`qv-option__info`,children:[(0,C.jsx)(`div`,{className:`qv-option__label`,children:r.sliceLabel||`Slice`}),(0,C.jsx)(`div`,{className:`qv-option__price`,children:b(r.slice)})]}),(0,C.jsxs)(`button`,{className:`qv-btn qv-btn--outline`,onClick:()=>i({id:r.id+`-slice`,name:`${r.name} (${r.sliceLabel||`Slice`})`,price:r.slice,img:r.img}),children:[(0,C.jsx)(a,{size:13}),` Add`]})]})]}):(0,C.jsx)(`div`,{className:`qv-actions`,children:(0,C.jsxs)(`button`,{className:`qv-btn qv-btn--filled w-100`,onClick:()=>i(r),children:[(0,C.jsx)(a,{size:13}),` Add to Cart — `,b(r.price)]})}),(0,C.jsxs)(`button`,{className:`qv-fav`,children:[(0,C.jsx)(m,{size:13}),` Save to favourites`]})]})]})]}),(0,C.jsx)(`style`,{children:`
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
      `})]})}var O=[`All Products`,`Cheesecakes`,`Milk Cakes`,`Sponge Cakes`,`Cookies`,`Cupcakes`,`Bakes`,`Dessert Cups`,`Drinks`],k=e=>e.slice==null?e.price:Math.min(e.price,e.slice),A=[{id:`all`,label:`All Prices`,test:()=>!0},{id:`0-200`,label:`₹0 – ₹200`,test:e=>k(e)<=200},{id:`200-500`,label:`₹200 – ₹500`,test:e=>k(e)>200&&k(e)<=500},{id:`500-1000`,label:`₹500 – ₹1000`,test:e=>k(e)>500&&k(e)<=1e3},{id:`1000+`,label:`₹1000+`,test:e=>k(e)>1e3}];function j({checked:e,onChange:t,label:n}){return(0,C.jsxs)(`label`,{className:`cc-shop-radio`,children:[(0,C.jsx)(`input`,{type:`radio`,checked:e,onChange:t,className:`cc-shop-radio__input`}),(0,C.jsx)(`span`,{className:`cc-shop-radio__dot`,"aria-hidden":!0}),(0,C.jsx)(`span`,{children:n})]})}function M(){y({title:`Shop`,description:`Order from our full menu — cheesecakes, milk cakes, cookies, cupcakes, dessert cups and drinks. UPI / Cash on Delivery.`}),x(`shop-products`,{"@context":`https://schema.org`,"@type":`ItemList`,name:`Cake & Crumb — Shop`,numberOfItems:_.length,itemListElement:_.slice(0,30).map((e,t)=>({"@type":`ListItem`,position:t+1,item:{"@type":`Product`,name:e.name,category:e.category,image:typeof window<`u`?new URL(h(e.img,800,800),window.location.origin).href:h(e.img,800,800),brand:{"@type":`Brand`,name:`Cake & Crumb`},offers:{"@type":`Offer`,price:k(e),priceCurrency:`INR`,availability:`https://schema.org/InStock`}}}))});let[e]=ne(),t=e.get(`category`),[p,w]=(0,S.useState)(t&&O.includes(t)?t:`All Products`),[T,E]=(0,S.useState)(`all`),[M,N]=(0,S.useState)(`featured`),[P,F]=(0,S.useState)(1),[I,L]=(0,S.useState)(null),[R,z]=(0,S.useState)(!1),B=(p===`All Products`?0:1)+(T===`all`?0:1),{items:V,count:H,subtotal:U,add:W,increment:G,decrement:K,remove:q,clear:J}=g(),Y=(0,S.useMemo)(()=>{let e=A.find(e=>e.id===T)?.test??(()=>!0),t=_.filter(t=>(p===`All Products`||t.category===p)&&e(t));return M===`lowhigh`?t=[...t].sort((e,t)=>k(e)-k(t)):M===`highlow`&&(t=[...t].sort((e,t)=>k(t)-k(e))),t},[p,T,M]),X=Math.max(1,Math.ceil(Y.length/12)),ae=Y.slice((P-1)*12,P*12),Z=Y.length===0?0:(P-1)*12+1,oe=Math.min(P*12,Y.length);(0,S.useEffect)(()=>{t&&O.includes(t)&&w(t)},[t]),(0,S.useEffect)(()=>{F(1)},[p,T,M]);let se=()=>{w(`All Products`),E(`all`)},Q=(0,S.useRef)(null);function $(){typeof window>`u`||window.innerWidth>=992||requestAnimationFrame(()=>{let e=Q.current;if(!e)return;let t=parseInt(getComputedStyle(document.documentElement).getPropertyValue(`--cc-header-h`),10)||82,n=e.getBoundingClientRect().top+window.scrollY-t-12;window.scrollTo({top:n,behavior:`smooth`})})}let ce=e=>{w(e),$()},le=e=>{E(e),$()};return(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)(`section`,{className:`cc-shop-hero`,children:(0,C.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,C.jsxs)(`div`,{className:`row g-4 g-lg-5 align-items-center`,children:[(0,C.jsxs)(`div`,{className:`col-lg-6 text-center text-lg-start`,children:[(0,C.jsx)(`span`,{className:`eyebrow mb-3 d-inline-flex`,children:`Shop Our Treats`}),(0,C.jsxs)(`h1`,{className:`cc-shop-hero__title`,children:[`Handcrafted`,(0,C.jsx)(`br`,{}),`Just for You`]}),(0,C.jsx)(v,{width:50}),(0,C.jsx)(`p`,{className:`cc-shop-hero__lede`,children:`Discover our handmade cakes, cupcakes, cookies, and chocolates — made with the finest ingredients and a whole lot of love.`})]}),(0,C.jsx)(`div`,{className:`col-lg-6`,children:(0,C.jsx)(`img`,{src:h(ie.heroShop,1e3,800),alt:`Cupcakes on tiered display stands`,className:`cc-shop-hero__img`,fetchPriority:`high`})})]})})}),(0,C.jsx)(`section`,{className:`cc-shop-main`,children:(0,C.jsx)(`div`,{className:`container py-4`,children:(0,C.jsxs)(`div`,{className:`row g-4`,children:[(0,C.jsx)(`aside`,{className:`col-lg-3 col-xl-2`,children:(0,C.jsxs)(`div`,{className:`cc-shop-filter`,children:[(0,C.jsx)(`h6`,{className:`cc-shop-filter__heading`,children:`Filter By`}),(0,C.jsxs)(`button`,{type:`button`,className:`cc-shop-filter__toggle`,onClick:()=>z(e=>!e),"aria-expanded":R,children:[(0,C.jsxs)(`span`,{className:`cc-shop-filter__toggle-label`,children:[(0,C.jsx)(o,{size:15}),`Filters`,B>0&&(0,C.jsx)(`span`,{className:`cc-shop-filter__count`,children:B})]}),(0,C.jsx)(te,{size:18,className:`cc-shop-filter__chevron`+(R?` is-open`:``)})]}),(0,C.jsxs)(`div`,{className:`cc-shop-filter__body`+(R?` is-open`:``),children:[(0,C.jsxs)(`div`,{className:`cc-shop-filter__group`,children:[(0,C.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Category`}),O.map(e=>(0,C.jsx)(j,{label:e,checked:p===e,onChange:()=>ce(e)},e))]}),(0,C.jsxs)(`div`,{className:`cc-shop-filter__group`,children:[(0,C.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Price Range`}),A.map(e=>(0,C.jsx)(j,{label:e.label,checked:T===e.id,onChange:()=>le(e.id)},e.id))]}),(0,C.jsx)(`button`,{type:`button`,className:`cc-shop-filter__clear`,onClick:se,children:`Clear Filters`})]})]})}),(0,C.jsxs)(`div`,{className:`col-lg-6 col-xl-7`,ref:Q,children:[(0,C.jsxs)(`div`,{className:`cc-shop-toolbar`,children:[(0,C.jsxs)(`span`,{className:`cc-shop-toolbar__count`,children:[`Showing `,Z,`–`,oe,` of `,Y.length,` results`]}),(0,C.jsxs)(`label`,{className:`cc-shop-toolbar__sort`,children:[(0,C.jsx)(`span`,{children:`Sort by:`}),(0,C.jsxs)(`select`,{value:M,onChange:e=>N(e.target.value),children:[(0,C.jsx)(`option`,{value:`featured`,children:`Featured`}),(0,C.jsx)(`option`,{value:`lowhigh`,children:`Price: low to high`}),(0,C.jsx)(`option`,{value:`highlow`,children:`Price: high to low`})]})]})]}),p===`Cupcakes`&&(0,C.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,C.jsx)(m,{size:12}),` Cupcakes are sold by the box of 6. Add ₹20 for floral or additional decoration.`]}),(0,C.jsxs)(`div`,{className:`cc-shop-grid`,children:[ae.map(e=>(0,C.jsxs)(`article`,{className:`cc-product-card`,children:[(0,C.jsx)(`button`,{type:`button`,onClick:()=>L(e),"aria-label":`View ${e.name}`,className:`cc-product-card__img-btn`,children:(0,C.jsx)(`img`,{src:h(e.img,500,500),alt:e.name,loading:`lazy`})}),(0,C.jsxs)(`div`,{className:`cc-product-card__body`,children:[(0,C.jsx)(`div`,{className:`cc-product-card__cat`,children:e.category}),(0,C.jsx)(`h6`,{className:`cc-product-card__name`,onClick:()=>L(e),title:e.name,children:e.name}),(0,C.jsx)(`div`,{className:`cc-product-card__price`,children:e.slice==null?b(e.price):`From ${b(k(e))}`}),(0,C.jsxs)(`button`,{className:`cc-product-card__add`,onClick:()=>{e.slice?L(e):W(e)},children:[(0,C.jsx)(a,{size:12}),` Add to Cart`]})]})]},e.id)),Y.length===0&&(0,C.jsx)(`div`,{className:`cc-shop-empty`,children:`No products match your filters.`})]}),X>1&&(0,C.jsxs)(`nav`,{className:`cc-shop-pagination`,"aria-label":`Product pages`,children:[(0,C.jsx)(`button`,{type:`button`,className:`cc-shop-pagination__btn`,onClick:()=>F(e=>Math.max(1,e-1)),disabled:P===1,"aria-label":`Previous page`,children:(0,C.jsx)(c,{size:14})}),Array.from({length:X},(e,t)=>t+1).map(e=>(0,C.jsx)(`button`,{type:`button`,className:`cc-shop-pagination__btn cc-shop-pagination__num`+(e===P?` is-active`:``),onClick:()=>F(e),"aria-current":e===P?`page`:void 0,children:e},e)),(0,C.jsx)(`button`,{type:`button`,className:`cc-shop-pagination__btn`,onClick:()=>F(e=>Math.min(X,e+1)),disabled:P===X,"aria-label":`Next page`,children:(0,C.jsx)(re,{size:14})})]})]}),(0,C.jsx)(`aside`,{className:`col-lg-3`,children:(0,C.jsxs)(`div`,{className:`cc-shop-cart`,children:[(0,C.jsxs)(`div`,{className:`cc-shop-cart__head`,children:[(0,C.jsxs)(`span`,{className:`cc-shop-cart__title`,children:[`Your Cart (`,H,`)`]}),H>0&&(0,C.jsx)(`button`,{type:`button`,className:`cc-shop-cart__clear`,onClick:J,"aria-label":`Clear cart`,children:(0,C.jsx)(s,{size:16})})]}),H===0&&(0,C.jsx)(`p`,{className:`cc-shop-cart__empty`,children:`Your cart is empty.`}),V.map(e=>(0,C.jsxs)(`div`,{className:`cc-shop-cart__item`,children:[(0,C.jsx)(`img`,{src:h(e.img,200,200),alt:``,className:`cc-shop-cart__item-img`}),(0,C.jsxs)(`div`,{className:`cc-shop-cart__item-body`,children:[(0,C.jsxs)(`div`,{className:`cc-shop-cart__item-top`,children:[(0,C.jsx)(`strong`,{className:`cc-shop-cart__item-name`,children:e.name}),(0,C.jsx)(`button`,{type:`button`,onClick:()=>q(e.id),"aria-label":`Remove`,className:`cc-shop-cart__item-remove`,children:(0,C.jsx)(s,{size:14})})]}),(0,C.jsx)(`div`,{className:`cc-shop-cart__item-price`,children:b(e.price)}),(0,C.jsxs)(`div`,{className:`cc-shop-cart__qty`,children:[(0,C.jsx)(`button`,{className:`qty-btn`,onClick:()=>K(e.id),"aria-label":`Decrease`,children:(0,C.jsx)(n,{size:12})}),(0,C.jsx)(`span`,{children:e.qty}),(0,C.jsx)(`button`,{className:`qty-btn`,onClick:()=>G(e.id),"aria-label":`Increase`,children:(0,C.jsx)(i,{size:12})})]})]})]},e.id)),(0,C.jsxs)(`div`,{className:`cc-shop-cart__subtotal`,children:[(0,C.jsx)(`span`,{children:`SUBTOTAL`}),(0,C.jsx)(`strong`,{children:b(U)})]}),(0,C.jsx)(`p`,{className:`cc-shop-cart__note`,children:`Home delivery charges confirmed on WhatsApp. Pickup is free.`}),(0,C.jsxs)(f,{to:`/cart`,className:`btn-rose w-100 justify-content-center mb-2`,style:{pointerEvents:H===0?`none`:`auto`,opacity:H===0?.5:1},tabIndex:H===0?-1:void 0,"aria-disabled":H===0,children:[(0,C.jsx)(a,{size:14}),` View Cart`]}),(0,C.jsxs)(f,{to:`/checkout`,className:`btn-outline-rose w-100 justify-content-center`,style:{pointerEvents:H===0?`none`:`auto`,opacity:H===0?.5:1},tabIndex:H===0?-1:void 0,"aria-disabled":H===0,children:[(0,C.jsx)(l,{size:14}),` Checkout`]}),(0,C.jsxs)(`div`,{className:`cc-shop-special`,children:[(0,C.jsx)(`span`,{className:`cc-shop-special__icon`,children:(0,C.jsx)(m,{size:16})}),(0,C.jsx)(`h6`,{className:`cc-shop-special__title`,children:`Need Something Special?`}),(0,C.jsx)(`p`,{className:`cc-shop-special__text`,children:`We love creating custom treats for your special moments.`}),(0,C.jsx)(f,{to:`/contact`,className:`cc-shop-special__btn`,children:`Place Custom Order`})]}),(0,C.jsx)(`ul`,{className:`cc-shop-trust`,children:[{Icon:m,title:`Handcrafted with Love`,text:`Made in small batches with care.`},{Icon:d,title:`Premium Ingredients`,text:`We use only the finest ingredients.`},{Icon:r,title:`Secure Packaging`,text:`Your treats arrive fresh and beautiful.`}].map((e,t)=>(0,C.jsxs)(`li`,{className:`cc-shop-trust__row`,children:[(0,C.jsx)(`span`,{className:`cc-shop-trust__icon`,children:(0,C.jsx)(e.Icon,{size:14})}),(0,C.jsxs)(`div`,{children:[(0,C.jsx)(`div`,{className:`cc-shop-trust__title`,children:e.title}),(0,C.jsx)(`p`,{className:`cc-shop-trust__text`,children:e.text})]})]},t))})]})})]})})}),(0,C.jsx)(`section`,{className:`cc-shop-promise`,children:(0,C.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,C.jsx)(`div`,{className:`feature-row`,children:[{Icon:d,title:`Fresh & Quality`,text:`We source the freshest ingredients for the best taste and quality.`},{Icon:u,title:`Made to Order`,text:`Every treat is made to order just for you.`},{Icon:ee,title:`On-Time Delivery`,text:`We deliver your treats fresh and on time, every time.`},{Icon:r,title:`Safe & Secure`,text:`Secure checkout and careful packaging always.`}].map((e,t)=>(0,C.jsxs)(`div`,{className:`feature-cell text-center cc-shop-promise__cell`,children:[(0,C.jsx)(`span`,{className:`cc-features-card__icon cc-features-card__icon--lg`,children:(0,C.jsx)(e.Icon,{size:22})}),(0,C.jsx)(`div`,{className:`cc-features-card__heading mt-3`,children:e.title}),(0,C.jsx)(`p`,{className:`cc-features-card__text mt-1`,children:e.text})]},t))})})}),(0,C.jsx)(D,{product:I,onClose:()=>L(null)})]})}export{M as default};