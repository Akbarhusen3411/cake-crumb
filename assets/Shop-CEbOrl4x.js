import{a as e,n as t,r as n,t as r}from"./usePageMeta-BwaTi6Fl.js";import{n as i,r as a}from"./images-D8FoEGW1.js";import{A as o,B as s,C as c,F as l,H as u,I as d,N as f,U as p,V as m,f as h,h as g,i as _,n as v,r as y}from"./index-B-WnlidN.js";import{t as b}from"./PageHero-BNq0MZjk.js";import{t as x}from"./useJsonLd-DTtfcyja.js";var S=e(n(),1),C=t(),w={eggless:{label:`Eggless`,icon:`🌱`,kind:`free`},vegan:{label:`Vegan`,icon:`🌿`,kind:`free`},"gluten-free":{label:`Gluten-Free`,icon:`🌾`,kind:`free`},"contains-nuts":{label:`Contains Nuts`,icon:`🌰`,kind:`contains`},"contains-egg":{label:`Contains Egg`,icon:`🥚`,kind:`contains`},"contains-dairy":{label:`Contains Dairy`,icon:`🥛`,kind:`contains`},"contains-gluten":{label:`Contains Gluten`,icon:`🌾`,kind:`contains`},"eggless-option":{label:`Eggless on request`,icon:`🌱`,kind:`option`}},T={free:{bg:`rgba(34, 139, 81, 0.10)`,fg:`#1d6f3a`,border:`rgba(34, 139, 81, 0.35)`},contains:{bg:`rgba(184, 134, 11, 0.12)`,fg:`#8a5d05`,border:`rgba(184, 134, 11, 0.35)`},option:{bg:`rgba(224, 97, 122, 0.08)`,fg:`var(--cc-rose-deep)`,border:`rgba(224, 97, 122, 0.4)`}};function E({allergens:e,verbose:t=!1,size:n=`sm`}){if(!Array.isArray(e)||e.length===0)return null;let r=[`eggless`,`eggless-option`,`vegan`,`gluten-free`,`contains-nuts`],i=t?e:e.filter(e=>r.includes(e));if(i.length===0)return null;let a=n===`lg`?`0.4rem 0.7rem`:`0.18rem 0.5rem`,o=n===`lg`?`0.78rem`:`0.66rem`;return(0,C.jsx)(`div`,{className:`d-flex flex-wrap`,style:{gap:4},children:i.map(e=>{let t=w[e];if(!t)return null;let n=T[t.kind];return(0,C.jsxs)(`span`,{title:t.label,style:{display:`inline-flex`,alignItems:`center`,gap:3,fontSize:o,fontWeight:600,letterSpacing:`0.02em`,color:n.fg,background:n.bg,border:`1px solid ${n.border}`,padding:a,borderRadius:999,lineHeight:1.1,whiteSpace:`nowrap`},children:[(0,C.jsx)(`span`,{"aria-hidden":!0,style:{fontSize:`0.9em`},children:t.icon}),t.label]},e)})})}function D({product:e,onClose:t}){let{add:n}=u();if((0,S.useEffect)(()=>{if(!e)return;let n=e=>{e.key===`Escape`&&t()};return document.addEventListener(`keydown`,n),document.body.style.overflow=`hidden`,()=>{document.removeEventListener(`keydown`,n),document.body.style.overflow=``}},[e,t]),!e)return null;let r=e;function i(e){n(e),t()}return(0,C.jsxs)(`div`,{role:`dialog`,"aria-modal":`true`,"aria-label":r.name,onClick:t,className:`qv-backdrop`,children:[(0,C.jsxs)(`div`,{onClick:e=>e.stopPropagation(),className:`qv-modal`,children:[(0,C.jsx)(`button`,{onClick:t,"aria-label":`Close`,className:`qv-close`,children:(0,C.jsx)(m,{size:18})}),(0,C.jsxs)(`div`,{className:`qv-grid`,children:[(0,C.jsxs)(`div`,{className:`qv-image-col`,children:[(0,C.jsx)(`img`,{src:a(r.img,800,800),alt:r.name,className:`qv-image`}),r.badge&&(0,C.jsx)(`span`,{className:`qv-badge`,children:r.badge})]}),(0,C.jsxs)(`div`,{className:`qv-info-col`,children:[(0,C.jsx)(`div`,{className:`tag-badge mb-1`,style:{fontSize:`0.65rem`},children:r.category}),(0,C.jsx)(`h3`,{className:`qv-title`,children:r.name}),r.allergens?.length>0&&(0,C.jsx)(`div`,{className:`mt-2`,children:(0,C.jsx)(E,{allergens:r.allergens,verbose:!0})}),(0,C.jsx)(`div`,{className:`mt-3`,children:r.slice?(0,C.jsxs)(`div`,{className:`qv-price-pair`,children:[(0,C.jsxs)(`div`,{className:`qv-price-cell`,style:{background:`var(--cc-cream)`},children:[(0,C.jsx)(`div`,{className:`qv-price-label`,children:r.sizeLabel||`Whole`}),(0,C.jsx)(`div`,{className:`qv-price-amount`,children:v(r.price)})]}),(0,C.jsxs)(`div`,{className:`qv-price-cell`,style:{background:`#fff`},children:[(0,C.jsx)(`div`,{className:`qv-price-label`,children:r.sliceLabel||`Slice`}),(0,C.jsx)(`div`,{className:`qv-price-amount`,children:v(r.slice)})]})]}):(0,C.jsx)(`div`,{className:`qv-price-single`,children:(0,C.jsx)(`div`,{className:`qv-price-amount`,style:{fontSize:`1.5rem`},children:v(r.price)})})}),(0,C.jsx)(`p`,{className:`qv-desc`,children:`Handcrafted with the finest ingredients. Each order is freshly prepared. Please pre-order at least 1 day in advance.`}),(0,C.jsx)(`div`,{className:`qv-actions`,children:r.slice?(0,C.jsxs)(C.Fragment,{children:[(0,C.jsxs)(`button`,{className:`qv-btn qv-btn--outline`,onClick:()=>i({id:r.id+`-slice`,name:`${r.name} (${r.sliceLabel||`Slice`})`,price:r.slice,img:r.img}),children:[`+ `,r.sliceLabel||`Slice`]}),(0,C.jsxs)(`button`,{className:`qv-btn qv-btn--filled`,onClick:()=>i({...r,name:`${r.name} (${r.sizeLabel||`Whole`})`}),children:[(0,C.jsx)(d,{size:13}),` + `,r.sizeLabel||`Whole`]})]}):(0,C.jsxs)(`button`,{className:`qv-btn qv-btn--filled w-100`,onClick:()=>i(r),children:[(0,C.jsx)(d,{size:13}),` Add to Cart — `,v(r.price)]})}),(0,C.jsxs)(`button`,{className:`qv-fav`,children:[(0,C.jsx)(c,{size:13}),` Save to favourites`]})]})]})]}),(0,C.jsx)(`style`,{children:`
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

        .qv-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: auto;
          padding-top: 1rem;
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
      `})]})}var O=[`All Products`,`Cheesecakes`,`Milk Cakes`,`Cookies`,`Cupcakes`,`Bakes`,`Platters`,`Dessert Cups`,`Drinks`],k=[{id:`a`,label:`Under ₹500`,test:e=>e<500},{id:`b`,label:`₹500 – ₹1,000`,test:e=>e>=500&&e<1e3},{id:`c`,label:`₹1,000 – ₹1,500`,test:e=>e>=1e3&&e<1500},{id:`d`,label:`₹1,500+`,test:e=>e>=1500}],A=[`Birthday`,`Wedding`,`Anniversary`,`Thank You`,`Just Because`,`Other`];function j(){r({title:`Shop`,description:`Order from our full menu — 23 cheesecake flavours, 7 milk cakes, cookies, cupcakes, dessert cups and drinks. UPI / Cash on Delivery.`}),x(`shop-products`,{"@context":`https://schema.org`,"@type":`ItemList`,name:`Cake & Crumb — Shop`,numberOfItems:y.length,itemListElement:y.slice(0,30).map((e,t)=>({"@type":`ListItem`,position:t+1,item:{"@type":`Product`,name:e.name,category:e.category,offers:{"@type":`Offer`,price:e.price,priceCurrency:`INR`,availability:`https://schema.org/InStock`}}}))});let[e,t]=(0,S.useState)(`All Products`),[n,w]=(0,S.useState)([]),[T,E]=(0,S.useState)(`featured`),[j,M]=(0,S.useState)(null),{items:N,count:P,subtotal:F,add:I,increment:L,decrement:R,remove:z,clear:B}=u(),V=(0,S.useMemo)(()=>{let t=y.filter(t=>{let r=e===`All Products`||t.category===e,i=n.length===0||n.some(e=>k.find(t=>t.id===e)?.test(t.price));return r&&i});return T===`lowhigh`?t=[...t].sort((e,t)=>e.price-t.price):T===`highlow`&&(t=[...t].sort((e,t)=>t.price-e.price)),t},[e,n,T]);return(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)(b,{eyebrow:`Shop Our Treats`,title:(0,C.jsxs)(C.Fragment,{children:[`Handcrafted`,(0,C.jsx)(`br`,{}),`Just for You`]}),text:`Discover our handmade cakes, cupcakes, cookies, and chocolates — made with the finest ingredients and a whole lot of love.`,cta:null,image:a(i.pinkDripCake2,1e3,750),imageAlt:`Pink drip cake`}),(0,C.jsx)(`section`,{className:`py-5`,children:(0,C.jsxs)(`div`,{className:`container-fluid px-2 px-md-3 px-lg-4`,children:[(0,C.jsxs)(`div`,{className:`row g-3`,children:[(0,C.jsx)(`aside`,{className:`col-12 col-lg-2`,children:(0,C.jsxs)(`div`,{className:`p-3 p-lg-4`,style:{background:`#fff`,border:`1px solid var(--cc-border)`,borderRadius:14},children:[(0,C.jsx)(`div`,{className:`tag-badge mb-3`,children:`Filter By`}),(0,C.jsxs)(`div`,{className:`mb-4`,children:[(0,C.jsx)(`div`,{className:`filter-label`,children:`Category`}),O.map(n=>(0,C.jsxs)(`label`,{className:`filter-row`,children:[(0,C.jsx)(`input`,{type:`radio`,name:`cat`,checked:e===n,onChange:()=>t(n)}),n]},n))]}),(0,C.jsxs)(`div`,{className:`mb-4`,children:[(0,C.jsx)(`div`,{className:`filter-label`,children:`Price Range`}),k.map(e=>(0,C.jsxs)(`label`,{className:`filter-row`,children:[(0,C.jsx)(`input`,{type:`checkbox`,checked:n.includes(e.id),onChange:t=>w(n=>t.target.checked?[...n,e.id]:n.filter(t=>t!==e.id))}),e.label]},e.id))]}),(0,C.jsxs)(`div`,{className:`mb-4`,children:[(0,C.jsx)(`div`,{className:`filter-label`,children:`Occasion`}),A.map(e=>(0,C.jsxs)(`label`,{className:`filter-row`,children:[(0,C.jsx)(`input`,{type:`checkbox`}),e]},e))]}),(0,C.jsx)(`button`,{className:`btn-outline-rose w-100 justify-content-center`,onClick:()=>{t(`All Products`),w([])},children:`Clear Filters`})]})}),(0,C.jsxs)(`div`,{className:`col-12 col-lg-8`,children:[(0,C.jsxs)(`div`,{className:`d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3`,children:[(0,C.jsxs)(`div`,{style:{fontSize:`0.85rem`},children:[`Showing 1–`,V.length,` of `,y.length,` results`]}),(0,C.jsxs)(`div`,{className:`d-flex align-items-center`,style:{gap:`0.5rem`,fontSize:`0.85rem`},children:[(0,C.jsx)(`span`,{children:`Sort by:`}),(0,C.jsxs)(`select`,{className:`cc-input`,style:{width:`auto`,padding:`0.35rem 0.6rem`},value:T,onChange:e=>E(e.target.value),children:[(0,C.jsx)(`option`,{value:`featured`,children:`Featured`}),(0,C.jsx)(`option`,{value:`lowhigh`,children:`Price: low to high`}),(0,C.jsx)(`option`,{value:`highlow`,children:`Price: high to low`})]})]})]}),(0,C.jsxs)(`div`,{className:`row row-cols-2 row-cols-md-3 row-cols-xl-4 g-2 g-md-3`,children:[V.map(e=>{let t=e.allergens?.includes(`contains-nuts`),n=e.allergens?.includes(`eggless`);return(0,C.jsx)(`div`,{className:`col`,children:(0,C.jsxs)(`article`,{className:`shop-card-mini`,children:[e.badge&&(0,C.jsx)(`span`,{className:`shop-card-mini__badge`,children:e.badge}),(t||n)&&(0,C.jsx)(`span`,{className:`shop-card-mini__diet`,style:{background:t?`rgba(184, 134, 11, 0.85)`:`rgba(34, 139, 81, 0.85)`},title:t?`Contains nuts`:`Eggless`,children:t?`🌰`:`🌱`}),(0,C.jsx)(`button`,{type:`button`,onClick:()=>M(e),"aria-label":`View ${e.name}`,className:`shop-card-mini__img-btn`,children:(0,C.jsx)(`img`,{src:a(e.img,500,500),alt:e.name,loading:`lazy`})}),(0,C.jsxs)(`div`,{className:`shop-card-mini__body text-center`,children:[(0,C.jsx)(`div`,{className:`shop-card-mini__cat`,children:e.category}),(0,C.jsx)(`h6`,{className:`shop-card-mini__name`,onClick:()=>M(e),title:e.name,children:e.name}),(0,C.jsx)(`div`,{className:`shop-card-mini__price`,children:e.slice?`From ${v(e.slice)}`:v(e.price)}),(0,C.jsxs)(`button`,{"aria-label":`Add ${e.name} to cart`,className:`shop-card-mini__add-full`,onClick:()=>{e.slice?M(e):I(e)},children:[(0,C.jsx)(d,{size:12}),` Add to Cart`]})]})]})},e.id)}),V.length===0&&(0,C.jsx)(`div`,{className:`col-12 text-center py-5`,children:(0,C.jsx)(`p`,{children:`No products match your filters.`})})]})]}),(0,C.jsx)(`aside`,{className:`col-12 col-lg-2`,children:(0,C.jsxs)(`div`,{className:`p-3 sticky-lg-top`,style:{background:`#fff`,border:`1px solid var(--cc-border)`,borderRadius:14,top:150,marginTop:20,maxHeight:`calc(100vh - 170px)`,overflowY:`auto`},children:[(0,C.jsxs)(`div`,{className:`d-flex justify-content-between align-items-center mb-3`,children:[(0,C.jsxs)(`div`,{className:`tag-badge`,children:[`Your Cart (`,P,`)`]}),P>0&&(0,C.jsx)(`button`,{className:`border-0 bg-transparent`,"aria-label":`Clear cart`,onClick:B,style:{color:`var(--cc-cocoa-soft)`},children:(0,C.jsx)(m,{})})]}),P===0&&(0,C.jsx)(`p`,{style:{fontSize:`0.85rem`},children:`Your cart is empty.`}),N.map(e=>(0,C.jsxs)(`div`,{className:`d-flex mb-3`,style:{gap:`0.7rem`},children:[(0,C.jsx)(`img`,{src:a(e.img,200,200),alt:``,style:{width:56,height:56,objectFit:`cover`,borderRadius:8,flexShrink:0}}),(0,C.jsxs)(`div`,{className:`flex-grow-1`,style:{fontSize:`0.85rem`,minWidth:0},children:[(0,C.jsxs)(`div`,{className:`d-flex justify-content-between`,children:[(0,C.jsx)(`strong`,{style:{color:`var(--cc-cocoa)`,overflow:`hidden`,textOverflow:`ellipsis`,whiteSpace:`nowrap`},children:e.name}),(0,C.jsx)(`button`,{className:`border-0 bg-transparent p-0`,onClick:()=>z(e.id),"aria-label":`Remove`,style:{color:`var(--cc-cocoa-soft)`,flexShrink:0,marginLeft:6},children:(0,C.jsx)(m,{size:14})})]}),(0,C.jsx)(`div`,{style:{color:`var(--cc-rose)`,fontWeight:700},children:v(e.price)}),(0,C.jsxs)(`div`,{className:`d-inline-flex align-items-center mt-1`,style:{gap:`0.4rem`},children:[(0,C.jsx)(`button`,{className:`qty-btn`,onClick:()=>R(e.id),"aria-label":`Decrease`,children:(0,C.jsx)(o,{size:12})}),(0,C.jsx)(`span`,{children:e.qty}),(0,C.jsx)(`button`,{className:`qty-btn`,onClick:()=>L(e.id),"aria-label":`Increase`,children:(0,C.jsx)(f,{size:12})})]})]})]},e.id)),(0,C.jsx)(`hr`,{style:{borderColor:`var(--cc-border)`}}),(0,C.jsxs)(`div`,{className:`d-flex justify-content-between mb-1`,style:{fontSize:`0.9rem`},children:[(0,C.jsx)(`span`,{children:`Subtotal`}),(0,C.jsx)(`strong`,{style:{color:`var(--cc-cocoa)`},children:v(F)})]}),(0,C.jsx)(`p`,{style:{fontSize:`0.75rem`,color:`var(--cc-cocoa-soft)`},children:`Taxes and delivery calculated at checkout.`}),(0,C.jsxs)(p,{to:`/cart`,className:`btn-rose w-100 justify-content-center mb-2`,style:{pointerEvents:P===0?`none`:`auto`,opacity:P===0?.5:1},children:[(0,C.jsx)(d,{size:14}),` View Cart`]}),(0,C.jsxs)(p,{to:`/checkout`,className:`btn-outline-rose w-100 justify-content-center`,style:{pointerEvents:P===0?`none`:`auto`,opacity:P===0?.5:1},children:[(0,C.jsx)(g,{size:14}),` Checkout`]}),(0,C.jsxs)(`div`,{className:`mt-4 p-3`,style:{background:`var(--cc-cream)`,borderRadius:12},children:[(0,C.jsxs)(`div`,{className:`tag-badge mb-1`,children:[(0,C.jsx)(c,{size:12,style:{marginRight:4}}),` Need Something Special?`]}),(0,C.jsx)(`p`,{style:{fontSize:`0.8rem`,margin:`0.3rem 0 0.6rem`},children:`We love creating custom treats for your special moments.`}),(0,C.jsx)(p,{to:`/contact`,className:`btn-outline-rose`,style:{fontSize:`0.7rem`},children:`Place Custom Order`})]}),(0,C.jsx)(`ul`,{className:`list-unstyled mt-4 mb-0`,children:[{Icon:c,title:`Handcrafted with Love`,text:`Made in small batches with care.`},{Icon:_,title:`Premium Ingredients`,text:`We use only the finest ingredients.`},{Icon:l,title:`Secure Packaging`,text:`Your treats arrive fresh and beautifully.`}].map((e,t)=>(0,C.jsxs)(`li`,{className:`d-flex align-items-start`,style:{gap:`0.6rem`,padding:`0.6rem 0`,borderTop:t?`1px dashed var(--cc-border)`:`none`},children:[(0,C.jsx)(`span`,{style:{width:30,height:30,borderRadius:`50%`,background:`var(--cc-blush)`,color:`var(--cc-rose)`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`,flexShrink:0},children:(0,C.jsx)(e.Icon,{size:14})}),(0,C.jsxs)(`div`,{style:{minWidth:0},children:[(0,C.jsx)(`div`,{style:{fontSize:`0.72rem`,fontWeight:700,color:`var(--cc-rose)`,textTransform:`uppercase`,letterSpacing:`0.06em`,lineHeight:1.2},children:e.title}),(0,C.jsx)(`p`,{style:{fontSize:`0.72rem`,margin:`0.15rem 0 0`,color:`var(--cc-cocoa-soft)`,lineHeight:1.3},children:e.text})]})]},t))})]})})]}),(0,C.jsx)(`div`,{className:`row g-3 g-md-4 mt-2 mt-md-3 pt-3 pt-md-4`,style:{borderTop:`1px solid var(--cc-border)`},children:[{Icon:_,title:`Fresh & Quality`,text:`We source the freshest ingredients for the best taste and quality.`},{Icon:h,title:`Made to Order`,text:`Every treat is made to order just for you.`},{Icon:s,title:`On-Time Delivery`,text:`We deliver your treats fresh and on time, every time.`},{Icon:l,title:`Safe & Secure`,text:`Secure checkout and careful packaging always.`}].map((e,t)=>(0,C.jsxs)(`div`,{className:`col-6 col-lg-3 text-center px-3`,children:[(0,C.jsx)(`span`,{className:`d-inline-flex align-items-center justify-content-center mb-2`,style:{width:50,height:50,borderRadius:`50%`,background:`#fff`,border:`1.5px solid var(--cc-rose)`,color:`var(--cc-rose)`},children:(0,C.jsx)(e.Icon,{size:20})}),(0,C.jsx)(`div`,{className:`tag-badge mb-1`,children:e.title}),(0,C.jsx)(`p`,{style:{fontSize:`0.78rem`,color:`var(--cc-cocoa-soft)`,maxWidth:220,margin:`0 auto`},children:e.text})]},t))})]})}),(0,C.jsx)(D,{product:j,onClose:()=>M(null)})]})}export{j as default};