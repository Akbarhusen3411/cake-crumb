import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{$ as t,B as n,H as r,I as i,N as a,S as o,V as s,Y as c,Z as l,at as u,ct as d,g as ee,h as f,i as p,m,p as h,q as g,r as _}from"./react-vendor-C_nv9d88.js";import{n as v,r as y}from"./images-BHyggAer.js";import{b,n as x,r as S,x as C,y as w}from"./index-CFez9oLy.js";import{t as te}from"./useJsonLd-PD-eEH7C.js";var T=e(d(),1),E=l(),D={eggless:{label:`Eggless`,icon:`🌱`,kind:`free`},vegan:{label:`Vegan`,icon:`🌿`,kind:`free`},"gluten-free":{label:`Gluten-Free`,icon:`🌾`,kind:`free`},"contains-nuts":{label:`Contains Nuts`,icon:`🌰`,kind:`contains`},"contains-egg":{label:`Contains Egg`,icon:`🥚`,kind:`contains`},"contains-dairy":{label:`Contains Dairy`,icon:`🥛`,kind:`contains`},"contains-gluten":{label:`Contains Gluten`,icon:`🌾`,kind:`contains`},"eggless-option":{label:`Eggless on request`,icon:`🌱`,kind:`option`}},O={free:{bg:`rgba(34, 139, 81, 0.10)`,fg:`#1d6f3a`,border:`rgba(34, 139, 81, 0.35)`},contains:{bg:`rgba(184, 134, 11, 0.12)`,fg:`#8a5d05`,border:`rgba(184, 134, 11, 0.35)`},option:{bg:`rgba(224, 97, 122, 0.08)`,fg:`var(--cc-rose-deep)`,border:`rgba(224, 97, 122, 0.4)`}};function k({allergens:e,verbose:t=!1,size:n=`sm`}){if(!Array.isArray(e)||e.length===0)return null;let r=[`eggless`,`eggless-option`,`vegan`,`gluten-free`,`contains-nuts`],i=t?e:e.filter(e=>r.includes(e));if(i.length===0)return null;let a=n===`lg`?`0.4rem 0.7rem`:`0.18rem 0.5rem`,o=n===`lg`?`0.78rem`:`0.66rem`;return(0,E.jsx)(`div`,{className:`d-flex flex-wrap`,style:{gap:4},children:i.map(e=>{let t=D[e];if(!t)return null;let n=O[t.kind];return(0,E.jsxs)(`span`,{title:t.label,style:{display:`inline-flex`,alignItems:`center`,gap:3,fontSize:o,fontWeight:600,letterSpacing:`0.02em`,color:n.fg,background:n.bg,border:`1px solid ${n.border}`,padding:a,borderRadius:999,lineHeight:1.1,whiteSpace:`nowrap`},children:[(0,E.jsx)(`span`,{"aria-hidden":!0,style:{fontSize:`0.9em`},children:t.icon}),t.label]},e)})})}function A({product:e,onClose:t}){let{add:n}=C();if((0,T.useEffect)(()=>{if(!e)return;let n=e=>{e.key===`Escape`&&t()};return document.addEventListener(`keydown`,n),document.body.style.overflow=`hidden`,()=>{document.removeEventListener(`keydown`,n),document.body.style.overflow=``}},[e,t]),!e)return null;let r=e;function i(e){n(e),t()}return(0,E.jsxs)(`div`,{role:`dialog`,"aria-modal":`true`,"aria-label":r.name,onClick:t,className:`qv-backdrop`,children:[(0,E.jsxs)(`div`,{onClick:e=>e.stopPropagation(),className:`qv-modal`,children:[(0,E.jsx)(`button`,{onClick:t,"aria-label":`Close`,className:`qv-close`,children:(0,E.jsx)(c,{size:18})}),(0,E.jsxs)(`div`,{className:`qv-grid`,children:[(0,E.jsxs)(`div`,{className:`qv-image-col`,children:[(0,E.jsx)(`img`,{src:y(r.img,800,800),alt:r.name,className:`qv-image`}),r.badge&&(0,E.jsx)(`span`,{className:`qv-badge`,children:r.badge})]}),(0,E.jsxs)(`div`,{className:`qv-info-col`,children:[(0,E.jsx)(`div`,{className:`tag-badge mb-1`,style:{fontSize:`0.65rem`},children:r.category}),(0,E.jsx)(`h3`,{className:`qv-title`,children:r.name}),r.allergens?.length>0&&(0,E.jsx)(`div`,{className:`mt-2`,children:(0,E.jsx)(k,{allergens:r.allergens,verbose:!0})}),(0,E.jsx)(`p`,{className:`qv-desc`,children:`Handcrafted with the finest ingredients. Each order is freshly prepared. Please pre-order at least 1 day in advance.`}),r.slice?(0,E.jsxs)(`div`,{className:`qv-options`,children:[(0,E.jsxs)(`div`,{className:`qv-option`,children:[(0,E.jsxs)(`div`,{className:`qv-option__info`,children:[(0,E.jsx)(`div`,{className:`qv-option__label`,children:r.sizeLabel||`Whole`}),(0,E.jsx)(`div`,{className:`qv-option__price`,children:w(r.price)})]}),(0,E.jsxs)(`button`,{className:`qv-btn qv-btn--filled`,onClick:()=>i({...r,name:`${r.name} (${r.sizeLabel||`Whole`})`}),children:[(0,E.jsx)(s,{size:13}),` Add`]})]}),(0,E.jsxs)(`div`,{className:`qv-option`,children:[(0,E.jsxs)(`div`,{className:`qv-option__info`,children:[(0,E.jsx)(`div`,{className:`qv-option__label`,children:r.sliceLabel||`Slice`}),(0,E.jsx)(`div`,{className:`qv-option__price`,children:w(r.slice)})]}),(0,E.jsxs)(`button`,{className:`qv-btn qv-btn--outline`,onClick:()=>i({id:r.id+`-slice`,name:`${r.name} (${r.sliceLabel||`Slice`})`,price:r.slice,img:r.img}),children:[(0,E.jsx)(s,{size:13}),` Add`]})]})]}):(0,E.jsx)(`div`,{className:`qv-actions`,children:(0,E.jsxs)(`button`,{className:`qv-btn qv-btn--filled w-100`,onClick:()=>i(r),children:[(0,E.jsx)(s,{size:13}),` Add to Cart — `,w(r.price)]})}),(0,E.jsxs)(`button`,{className:`qv-fav`,children:[(0,E.jsx)(o,{size:13}),` Save to favourites`]})]})]})]}),(0,E.jsx)(`style`,{children:`
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
      `})]})}var j=[`All Products`,`Cheesecakes`,`Milk Cakes`,`Sponge Cakes`,`Cookies`,`Cupcakes`,`Bakes`,`Dessert Cups`,`Drinks`],M=[{id:`all`,label:`All Prices`,test:()=>!0},{id:`0-200`,label:`₹0 – ₹200`,test:e=>(e.slice||e.price)<=200},{id:`200-500`,label:`₹200 – ₹500`,test:e=>(e.slice||e.price)>200&&(e.slice||e.price)<=500},{id:`500-1000`,label:`₹500 – ₹1000`,test:e=>(e.slice||e.price)>500&&(e.slice||e.price)<=1e3},{id:`1000+`,label:`₹1000+`,test:e=>(e.slice||e.price)>1e3}],ne=[`Birthday`,`Wedding`,`Anniversary`,`Thank You`,`Just Because`,`Other`];function N({checked:e,onChange:t,label:n}){return(0,E.jsxs)(`label`,{className:`cc-shop-radio`,children:[(0,E.jsx)(`input`,{type:`radio`,checked:e,onChange:t,className:`cc-shop-radio__input`}),(0,E.jsx)(`span`,{className:`cc-shop-radio__dot`,"aria-hidden":!0}),(0,E.jsx)(`span`,{children:n})]})}function P(){S({title:`Shop`,description:`Order from our full menu — cheesecakes, milk cakes, cookies, cupcakes, dessert cups and drinks. UPI / Cash on Delivery.`}),te(`shop-products`,{"@context":`https://schema.org`,"@type":`ItemList`,name:`Cake & Crumb — Shop`,numberOfItems:b.length,itemListElement:b.slice(0,30).map((e,t)=>({"@type":`ListItem`,position:t+1,item:{"@type":`Product`,name:e.name,category:e.category,image:typeof window<`u`?new URL(y(e.img,800,800),window.location.origin).href:y(e.img,800,800),brand:{"@type":`Brand`,name:`Cake & Crumb`},offers:{"@type":`Offer`,price:e.slice||e.price,priceCurrency:`INR`,availability:`https://schema.org/InStock`},aggregateRating:{"@type":`AggregateRating`,ratingValue:`4.9`,reviewCount:`245`}}}))});let[e]=u(),l=e.get(`category`),[d,D]=(0,T.useState)(l&&j.includes(l)?l:`All Products`),[O,k]=(0,T.useState)(`all`),[P,F]=(0,T.useState)(null),[I,L]=(0,T.useState)(`featured`),[R,z]=(0,T.useState)(1),[B,V]=(0,T.useState)(null),[H,U]=(0,T.useState)(!1),W=(d===`All Products`?0:1)+(O===`all`?0:1)+ +!!P,{items:G,count:K,subtotal:q,add:J,increment:Y,decrement:X,remove:Z,clear:re}=C(),Q=(0,T.useMemo)(()=>{let e=M.find(e=>e.id===O)?.test??(()=>!0),t=b.filter(t=>(d===`All Products`||t.category===d)&&e(t));return I===`lowhigh`?t=[...t].sort((e,t)=>(e.slice||e.price)-(t.slice||t.price)):I===`highlow`&&(t=[...t].sort((e,t)=>(t.slice||t.price)-(e.slice||e.price))),t},[d,O,I]),$=Math.max(1,Math.ceil(Q.length/12)),ie=Q.slice((R-1)*12,R*12),ae=Q.length===0?0:(R-1)*12+1,oe=Math.min(R*12,Q.length);return(0,T.useEffect)(()=>{l&&j.includes(l)&&D(l)},[l]),(0,T.useEffect)(()=>{z(1)},[d,O,I]),(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(`section`,{className:`cc-shop-hero`,children:(0,E.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,E.jsxs)(`div`,{className:`row g-4 g-lg-5 align-items-center`,children:[(0,E.jsxs)(`div`,{className:`col-lg-6 text-center text-lg-start`,children:[(0,E.jsx)(`span`,{className:`eyebrow mb-3 d-inline-flex`,children:`Shop Our Treats`}),(0,E.jsxs)(`h1`,{className:`cc-shop-hero__title`,children:[`Handcrafted`,(0,E.jsx)(`br`,{}),`Just for You`]}),(0,E.jsx)(x,{width:50}),(0,E.jsx)(`p`,{className:`cc-shop-hero__lede`,children:`Discover our handmade cakes, cupcakes, cookies, and chocolates — made with the finest ingredients and a whole lot of love.`})]}),(0,E.jsx)(`div`,{className:`col-lg-6`,children:(0,E.jsx)(`img`,{src:y(v.heroShop,1e3,800),alt:`Cupcakes on tiered display stands`,className:`cc-shop-hero__img`,fetchpriority:`high`})})]})})}),(0,E.jsx)(`section`,{className:`cc-shop-main`,children:(0,E.jsx)(`div`,{className:`container py-4`,children:(0,E.jsxs)(`div`,{className:`row g-4`,children:[(0,E.jsx)(`aside`,{className:`col-lg-3 col-xl-2`,children:(0,E.jsxs)(`div`,{className:`cc-shop-filter`,children:[(0,E.jsx)(`h6`,{className:`cc-shop-filter__heading`,children:`Filter By`}),(0,E.jsxs)(`button`,{type:`button`,className:`cc-shop-filter__toggle`,onClick:()=>U(e=>!e),"aria-expanded":H,children:[(0,E.jsxs)(`span`,{className:`cc-shop-filter__toggle-label`,children:[(0,E.jsx)(r,{size:15}),`Filters`,W>0&&(0,E.jsx)(`span`,{className:`cc-shop-filter__count`,children:W})]}),(0,E.jsx)(m,{size:18,className:`cc-shop-filter__chevron`+(H?` is-open`:``)})]}),(0,E.jsxs)(`div`,{className:`cc-shop-filter__body`+(H?` is-open`:``),children:[(0,E.jsxs)(`div`,{className:`cc-shop-filter__group`,children:[(0,E.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Category`}),j.map(e=>(0,E.jsx)(N,{label:e,checked:d===e,onChange:()=>D(e)},e))]}),(0,E.jsxs)(`div`,{className:`cc-shop-filter__group`,children:[(0,E.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Price Range`}),M.map(e=>(0,E.jsx)(N,{label:e.label,checked:O===e.id,onChange:()=>k(e.id)},e.id))]}),(0,E.jsxs)(`div`,{className:`cc-shop-filter__group`,children:[(0,E.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Occasion`}),ne.map(e=>(0,E.jsx)(N,{label:e,checked:P===e,onChange:()=>F(e)},e))]}),(0,E.jsx)(`button`,{type:`button`,className:`cc-shop-filter__clear`,onClick:()=>{D(`All Products`),k(`all`),F(null)},children:`Clear Filters`})]})]})}),(0,E.jsxs)(`div`,{className:`col-lg-6 col-xl-7`,children:[(0,E.jsxs)(`div`,{className:`cc-shop-toolbar`,children:[(0,E.jsxs)(`span`,{className:`cc-shop-toolbar__count`,children:[`Showing `,ae,`–`,oe,` of `,Q.length,` results`]}),(0,E.jsxs)(`label`,{className:`cc-shop-toolbar__sort`,children:[(0,E.jsx)(`span`,{children:`Sort by:`}),(0,E.jsxs)(`select`,{value:I,onChange:e=>L(e.target.value),children:[(0,E.jsx)(`option`,{value:`featured`,children:`Featured`}),(0,E.jsx)(`option`,{value:`lowhigh`,children:`Price: low to high`}),(0,E.jsx)(`option`,{value:`highlow`,children:`Price: high to low`})]})]})]}),d===`Cupcakes`&&(0,E.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,E.jsx)(o,{size:12}),` Cupcakes are sold by the box of 6. Add ₹20 for floral or additional decoration.`]}),(0,E.jsxs)(`div`,{className:`cc-shop-grid`,children:[ie.map(e=>(0,E.jsxs)(`article`,{className:`cc-product-card`,children:[(0,E.jsx)(`button`,{type:`button`,className:`cc-product-card__heart`,"aria-label":`Add to favorites`,children:(0,E.jsx)(o,{size:14})}),(0,E.jsx)(`button`,{type:`button`,onClick:()=>V(e),"aria-label":`View ${e.name}`,className:`cc-product-card__img-btn`,children:(0,E.jsx)(`img`,{src:y(e.img,500,500),alt:e.name,loading:`lazy`})}),(0,E.jsxs)(`div`,{className:`cc-product-card__body`,children:[(0,E.jsx)(`div`,{className:`cc-product-card__cat`,children:e.category}),(0,E.jsx)(`h6`,{className:`cc-product-card__name`,onClick:()=>V(e),title:e.name,children:e.name}),(0,E.jsx)(`div`,{className:`cc-product-card__price`,children:e.slice?`From ${w(e.slice)}`:w(e.price)}),(0,E.jsxs)(`button`,{className:`cc-product-card__add`,onClick:()=>{e.slice?V(e):J(e)},children:[(0,E.jsx)(s,{size:12}),` Add to Cart`]})]})]},e.id)),Q.length===0&&(0,E.jsx)(`div`,{className:`cc-shop-empty`,children:`No products match your filters.`})]}),$>1&&(0,E.jsxs)(`nav`,{className:`cc-shop-pagination`,"aria-label":`Product pages`,children:[(0,E.jsx)(`button`,{type:`button`,className:`cc-shop-pagination__btn`,onClick:()=>z(e=>Math.max(1,e-1)),disabled:R===1,"aria-label":`Previous page`,children:(0,E.jsx)(f,{size:14})}),Array.from({length:$},(e,t)=>t+1).map(e=>(0,E.jsx)(`button`,{type:`button`,className:`cc-shop-pagination__btn cc-shop-pagination__num`+(e===R?` is-active`:``),onClick:()=>z(e),"aria-current":e===R?`page`:void 0,children:e},e)),(0,E.jsx)(`button`,{type:`button`,className:`cc-shop-pagination__btn`,onClick:()=>z(e=>Math.min($,e+1)),disabled:R===$,"aria-label":`Next page`,children:(0,E.jsx)(ee,{size:14})})]})]}),(0,E.jsx)(`aside`,{className:`col-lg-3`,children:(0,E.jsxs)(`div`,{className:`cc-shop-cart`,children:[(0,E.jsxs)(`div`,{className:`cc-shop-cart__head`,children:[(0,E.jsxs)(`span`,{className:`cc-shop-cart__title`,children:[`Your Cart (`,K,`)`]}),K>0&&(0,E.jsx)(`button`,{type:`button`,className:`cc-shop-cart__clear`,onClick:re,"aria-label":`Clear cart`,children:(0,E.jsx)(c,{size:16})})]}),K===0&&(0,E.jsx)(`p`,{className:`cc-shop-cart__empty`,children:`Your cart is empty.`}),G.map(e=>(0,E.jsxs)(`div`,{className:`cc-shop-cart__item`,children:[(0,E.jsx)(`img`,{src:y(e.img,200,200),alt:``,className:`cc-shop-cart__item-img`}),(0,E.jsxs)(`div`,{className:`cc-shop-cart__item-body`,children:[(0,E.jsxs)(`div`,{className:`cc-shop-cart__item-top`,children:[(0,E.jsx)(`strong`,{className:`cc-shop-cart__item-name`,children:e.name}),(0,E.jsx)(`button`,{type:`button`,onClick:()=>Z(e.id),"aria-label":`Remove`,className:`cc-shop-cart__item-remove`,children:(0,E.jsx)(c,{size:14})})]}),(0,E.jsx)(`div`,{className:`cc-shop-cart__item-price`,children:w(e.price)}),(0,E.jsxs)(`div`,{className:`cc-shop-cart__qty`,children:[(0,E.jsx)(`button`,{className:`qty-btn`,onClick:()=>X(e.id),"aria-label":`Decrease`,children:(0,E.jsx)(a,{size:12})}),(0,E.jsx)(`span`,{children:e.qty}),(0,E.jsx)(`button`,{className:`qty-btn`,onClick:()=>Y(e.id),"aria-label":`Increase`,children:(0,E.jsx)(i,{size:12})})]})]})]},e.id)),(0,E.jsxs)(`div`,{className:`cc-shop-cart__subtotal`,children:[(0,E.jsx)(`span`,{children:`SUBTOTAL`}),(0,E.jsx)(`strong`,{children:w(q)})]}),(0,E.jsx)(`p`,{className:`cc-shop-cart__note`,children:`Home delivery charges confirmed on WhatsApp. Pickup is free.`}),(0,E.jsxs)(t,{to:`/cart`,className:`btn-rose w-100 justify-content-center mb-2`,style:{pointerEvents:K===0?`none`:`auto`,opacity:K===0?.5:1},children:[(0,E.jsx)(s,{size:14}),` View Cart`]}),(0,E.jsxs)(t,{to:`/checkout`,className:`btn-outline-rose w-100 justify-content-center`,style:{pointerEvents:K===0?`none`:`auto`,opacity:K===0?.5:1},children:[(0,E.jsx)(h,{size:14}),` Checkout`]}),(0,E.jsxs)(`div`,{className:`cc-shop-special`,children:[(0,E.jsx)(`span`,{className:`cc-shop-special__icon`,children:(0,E.jsx)(o,{size:16})}),(0,E.jsx)(`h6`,{className:`cc-shop-special__title`,children:`Need Something Special?`}),(0,E.jsx)(`p`,{className:`cc-shop-special__text`,children:`We love creating custom treats for your special moments.`}),(0,E.jsx)(t,{to:`/contact`,className:`cc-shop-special__btn`,children:`Place Custom Order`})]}),(0,E.jsx)(`ul`,{className:`cc-shop-trust`,children:[{Icon:o,title:`Handcrafted with Love`,text:`Made in small batches with care.`},{Icon:_,title:`Premium Ingredients`,text:`We use only the finest ingredients.`},{Icon:n,title:`Secure Packaging`,text:`Your treats arrive fresh and beautiful.`}].map((e,t)=>(0,E.jsxs)(`li`,{className:`cc-shop-trust__row`,children:[(0,E.jsx)(`span`,{className:`cc-shop-trust__icon`,children:(0,E.jsx)(e.Icon,{size:14})}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`div`,{className:`cc-shop-trust__title`,children:e.title}),(0,E.jsx)(`p`,{className:`cc-shop-trust__text`,children:e.text})]})]},t))})]})})]})})}),(0,E.jsx)(`section`,{className:`cc-shop-promise`,children:(0,E.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,E.jsx)(`div`,{className:`feature-row`,children:[{Icon:_,title:`Fresh & Quality`,text:`We source the freshest ingredients for the best taste and quality.`},{Icon:p,title:`Made to Order`,text:`Every treat is made to order just for you.`},{Icon:g,title:`On-Time Delivery`,text:`We deliver your treats fresh and on time, every time.`},{Icon:n,title:`Safe & Secure`,text:`Secure checkout and careful packaging always.`}].map((e,t)=>(0,E.jsxs)(`div`,{className:`feature-cell text-center cc-shop-promise__cell`,children:[(0,E.jsx)(`span`,{className:`cc-features-card__icon cc-features-card__icon--lg`,children:(0,E.jsx)(e.Icon,{size:22})}),(0,E.jsx)(`div`,{className:`cc-features-card__heading mt-3`,children:e.title}),(0,E.jsx)(`p`,{className:`cc-features-card__text mt-1`,children:e.text})]},t))})})}),(0,E.jsx)(A,{product:B,onClose:()=>V(null)})]})}export{P as default};