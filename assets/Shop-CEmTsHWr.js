import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{C as t,Ct as n,G as r,J as i,P as a,b as o,dt as s,et as c,i as l,lt as u,nt as d,pt as f,r as p,st as ee,tt as m,v as te,x as ne,y as re,yt as ie}from"./react-vendor-DYqTT9iz.js";import{t as h}from"./format-XQan9feh.js";import{g,h as _,m as v,n as ae,p as oe,r as se,y}from"./index-CCFIKQLp.js";import{t as ce}from"./useJsonLd-C4vyDQVH.js";var b=e(n(),1),x=s(),S={eggless:{label:`Eggless`,icon:`🌱`,kind:`free`},vegan:{label:`Vegan`,icon:`🌿`,kind:`free`},"gluten-free":{label:`Gluten-Free`,icon:`🌾`,kind:`free`},"contains-nuts":{label:`Contains Nuts`,icon:`🌰`,kind:`contains`},"contains-egg":{label:`Contains Egg`,icon:`🥚`,kind:`contains`},"contains-dairy":{label:`Contains Dairy`,icon:`🥛`,kind:`contains`},"contains-gluten":{label:`Contains Gluten`,icon:`🌾`,kind:`contains`},"eggless-option":{label:`Eggless on request`,icon:`🌱`,kind:`option`}},C={free:{bg:`rgba(34, 139, 81, 0.10)`,fg:`#1d6f3a`,border:`rgba(34, 139, 81, 0.35)`},contains:{bg:`rgba(184, 134, 11, 0.12)`,fg:`#8a5d05`,border:`rgba(184, 134, 11, 0.35)`},option:{bg:`rgba(224, 97, 122, 0.08)`,fg:`var(--cc-rose-deep)`,border:`rgba(224, 97, 122, 0.4)`}};function w({allergens:e,verbose:t=!1,size:n=`sm`}){if(!Array.isArray(e)||e.length===0)return null;let r=[`eggless`,`eggless-option`,`vegan`,`gluten-free`,`contains-nuts`],i=t?e:e.filter(e=>r.includes(e));if(i.length===0)return null;let a=n===`lg`?`0.4rem 0.7rem`:`0.18rem 0.5rem`,o=n===`lg`?`0.78rem`:`0.66rem`;return(0,x.jsx)(`div`,{className:`d-flex flex-wrap`,style:{gap:4},children:i.map(e=>{let t=S[e];if(!t)return null;let n=C[t.kind];return(0,x.jsxs)(`span`,{title:t.label,style:{display:`inline-flex`,alignItems:`center`,gap:3,fontSize:o,fontWeight:600,letterSpacing:`0.02em`,color:n.fg,background:n.bg,border:`1px solid ${n.border}`,padding:a,borderRadius:999,lineHeight:1.1,whiteSpace:`nowrap`},children:[(0,x.jsx)(`span`,{"aria-hidden":!0,style:{fontSize:`0.9em`},children:t.icon}),t.label]},e)})})}function le({product:e,onClose:t}){let{add:n}=y(),a=Math.max(1,Number(e?.minQty)||1),[o,s]=(0,b.useState)(a),c=(0,b.useRef)(null);if((0,b.useEffect)(()=>{if(!e)return;let n=e=>{e.key===`Escape`&&t()};return document.addEventListener(`keydown`,n),()=>document.removeEventListener(`keydown`,n)},[e,t]),(0,b.useEffect)(()=>{if(!e)return;let t=e=>{c.current?.contains(e.target)||e.preventDefault()};return document.addEventListener(`touchmove`,t,{passive:!1}),document.addEventListener(`wheel`,t,{passive:!1}),()=>{document.removeEventListener(`touchmove`,t),document.removeEventListener(`wheel`,t)}},[e]),!e)return null;let l=e,d=a>1;function f(e,r){n(e,r),t()}return(0,x.jsxs)(`div`,{role:`dialog`,"aria-modal":`true`,"aria-label":l.name,onClick:t,className:`qv-backdrop`,children:[(0,x.jsxs)(`div`,{ref:c,onClick:e=>e.stopPropagation(),className:`qv-modal`,children:[(0,x.jsx)(`button`,{onClick:t,"aria-label":`Close`,className:`qv-close`,children:(0,x.jsx)(u,{size:18})}),(0,x.jsxs)(`div`,{className:`qv-grid`,children:[(0,x.jsxs)(`div`,{className:`qv-image-col`,children:[(0,x.jsx)(`img`,{src:_(l.img,800,800),srcSet:v(l.img),sizes:`(min-width: 720px) 300px, 100vw`,alt:l.name,className:`qv-image`}),l.badge&&(0,x.jsx)(`span`,{className:`qv-badge`,children:l.badge})]}),(0,x.jsxs)(`div`,{className:`qv-info-col`,children:[(0,x.jsx)(`div`,{className:`tag-badge mb-1`,style:{fontSize:`0.65rem`},children:l.category}),(0,x.jsx)(`h3`,{className:`qv-title`,children:l.name}),l.allergens?.length>0&&(0,x.jsx)(`div`,{className:`mt-2`,children:(0,x.jsx)(w,{allergens:l.allergens,verbose:!0})}),(0,x.jsx)(`p`,{className:`qv-desc`,children:`Handcrafted with the finest ingredients. Each order is freshly prepared. Please pre-order at least 1 day in advance.`}),l.slice?(0,x.jsxs)(`div`,{className:`qv-options`,children:[(0,x.jsxs)(`div`,{className:`qv-option${d?` qv-option--qty`:``}`,children:[(0,x.jsxs)(`div`,{className:`qv-option__info`,children:[(0,x.jsxs)(`div`,{className:`qv-option__label`,children:[l.sizeLabel||`Whole`,d&&(0,x.jsxs)(`span`,{className:`qv-option__min`,children:[`Min `,a]})]}),(0,x.jsxs)(`div`,{className:`qv-option__price`,children:[h(l.price),d&&(0,x.jsx)(`span`,{className:`qv-option__sub`,children:`each`})]})]}),d?(0,x.jsxs)(`div`,{className:`qv-qty`,children:[(0,x.jsx)(`span`,{className:`qv-qty__ask`,children:`How many?`}),(0,x.jsxs)(`div`,{className:`qv-qty__row`,children:[(0,x.jsxs)(`div`,{className:`qv-qty__stepper`,children:[(0,x.jsx)(`button`,{type:`button`,onClick:()=>s(e=>Math.max(a,e-1)),disabled:o<=a,"aria-label":`One fewer`,children:(0,x.jsx)(r,{size:13})}),(0,x.jsx)(`span`,{className:`qv-qty__val`,"aria-live":`polite`,children:o}),(0,x.jsx)(`button`,{type:`button`,onClick:()=>s(e=>e+1),"aria-label":`One more`,children:(0,x.jsx)(i,{size:13})})]}),(0,x.jsxs)(`button`,{className:`qv-btn qv-btn--filled qv-qty__add`,onClick:()=>f({...l,name:`${l.name} (${l.sizeLabel||`Whole`})`},o),children:[(0,x.jsx)(m,{size:13}),` Add `,o,` — `,h(l.price*o)]})]})]}):(0,x.jsxs)(`button`,{className:`qv-btn qv-btn--filled`,onClick:()=>f({...l,name:`${l.name} (${l.sizeLabel||`Whole`})`},a),children:[(0,x.jsx)(m,{size:13}),` Add`]})]}),(0,x.jsxs)(`div`,{className:`qv-option`,children:[(0,x.jsxs)(`div`,{className:`qv-option__info`,children:[(0,x.jsx)(`div`,{className:`qv-option__label`,children:l.sliceLabel||`Slice`}),(0,x.jsx)(`div`,{className:`qv-option__price`,children:h(l.slice)})]}),(0,x.jsxs)(`button`,{className:`qv-btn qv-btn--outline`,onClick:()=>f({id:l.id+`-slice`,name:`${l.name} (${l.sliceLabel||`Slice`})`,price:l.slice,img:l.img}),children:[(0,x.jsx)(m,{size:13}),` Add`]})]})]}):(0,x.jsx)(`div`,{className:`qv-actions`,children:(0,x.jsxs)(`button`,{className:`qv-btn qv-btn--filled w-100`,onClick:()=>f(l),children:[(0,x.jsx)(m,{size:13}),` Add to Cart — `,h(l.price)]})})]})]})]}),(0,x.jsx)(`style`,{children:`
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
        /* On a phone the modal scrolls internally, and a 4:3 photo pushed the
           price and the Add button below the fold — the customer opened a
           product and saw no way to buy it without scrolling. A 16:9 band buys
           back ~90px and the allergen tags collapse to one line. */
        @media (max-width: 480px) {
          .qv-image { aspect-ratio: 16/9; }
          .qv-info-col { padding: 1rem 1.1rem 1.2rem; }
          .qv-desc { font-size: 0.78rem; margin-top: 0.6rem; }
          .qv-options { margin-top: 0.75rem; gap: 0.5rem; }
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
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .qv-option__min {
          background: var(--cc-blush-soft);
          color: var(--cc-rose-deep);
          border-radius: 999px;
          padding: 1px 7px;
          letter-spacing: 0.08em;
          font-size: 0.58rem;
        }
        .qv-option__price {
          font-size: 1.25rem;
          color: var(--cc-rose);
          font-weight: 700;
          line-height: 1.1;
          margin-top: 2px;
          display: flex;
          align-items: baseline;
          gap: 0.45rem;
        }
        .qv-option__sub {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--cc-cocoa-soft);
          letter-spacing: 0.02em;
        }
        .qv-option .qv-btn { flex: 0 0 auto; min-width: 96px; padding: 0.6rem 1rem; }

        /* Per-piece tier: label/price on top, then "How many?" + stepper + a
           live-total Add button. Stacks so the row never gets cramped. */
        .qv-option--qty {
          flex-direction: column;
          align-items: stretch;
          gap: 0.6rem;
        }
        .qv-qty__ask {
          display: block;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--cc-cocoa-soft);
          margin-bottom: 0.35rem;
        }
        .qv-qty__row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .qv-qty__stepper {
          display: inline-flex;
          align-items: center;
          gap: 0.15rem;
          background: #fff;
          border: 1.5px solid var(--cc-rose-soft);
          border-radius: 999px;
          padding: 0.2rem;
          flex: 0 0 auto;
        }
        .qv-qty__stepper button {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--cc-rose);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
        }
        .qv-qty__stepper button:hover:not(:disabled) { background: var(--cc-blush); }
        .qv-qty__stepper button:disabled { opacity: 0.35; cursor: not-allowed; }
        .qv-qty__val {
          min-width: 26px;
          text-align: center;
          font-weight: 800;
          font-size: 0.95rem;
          color: var(--cc-cocoa);
          font-variant-numeric: tabular-nums;
        }
        .qv-option--qty .qv-qty__add {
          flex: 1 1 auto;
          min-width: 0;
        }

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

      `})]})}var T=[`All Products`,`Cheesecakes`,`Milk Cakes`,`Sponge Cakes`,`Cookies`,`Cupcakes`,`Bakes`,`Dessert Cups`,`Drinks`],E=e=>e.slice==null?e.price:Math.min(e.price,e.slice),D=e=>e.slice!=null&&(e.minQty||1)>1;function ue(e,t){if(t<=7)return Array.from({length:t},(e,t)=>t+1);let n=[1],r=Math.max(2,e-1),i=Math.min(t-1,e+1);r>2&&n.push(`…`);for(let e=r;e<=i;e+=1)n.push(e);return i<t-1&&n.push(`…`),n.push(t),n}var O=[{id:`all`,label:`All Prices`,test:()=>!0},{id:`0-200`,label:`₹0 – ₹200`,test:e=>E(e)<=200},{id:`200-500`,label:`₹200 – ₹500`,test:e=>E(e)>200&&E(e)<=500},{id:`500-1000`,label:`₹500 – ₹1000`,test:e=>E(e)>500&&E(e)<=1e3},{id:`1000+`,label:`₹1000+`,test:e=>E(e)>1e3}];function k({checked:e,onChange:t,label:n}){return(0,x.jsxs)(`label`,{className:`cc-shop-radio`,children:[(0,x.jsx)(`input`,{type:`radio`,checked:e,onChange:t,className:`cc-shop-radio__input`}),(0,x.jsx)(`span`,{className:`cc-shop-radio__dot`,"aria-hidden":!0}),(0,x.jsx)(`span`,{children:n})]})}function A(){se({title:`Shop`,description:`Order from our full menu — cheesecakes, milk cakes, cookies, cupcakes, dessert cups and drinks. UPI / Cash on Delivery.`}),ce(`shop-products`,{"@context":`https://schema.org`,"@type":`ItemList`,name:`Cake & Crumb — Shop`,numberOfItems:g.length,itemListElement:g.slice(0,30).map((e,t)=>({"@type":`ListItem`,position:t+1,item:{"@type":`Product`,name:e.name,category:e.category,image:typeof window<`u`?new URL(_(e.img,800,800),window.location.origin).href:_(e.img,800,800),brand:{"@type":`Brand`,name:`Cake & Crumb`},offers:{"@type":`Offer`,price:D(e)?e.slice:E(e),priceCurrency:`INR`,availability:`https://schema.org/InStock`}}}))});let[e,n]=ie(),s=e.get(`category`),S=e.get(`product`),[C,w]=(0,b.useState)(s&&T.includes(s)?s:`All Products`),[A,j]=(0,b.useState)(`all`),[M,de]=(0,b.useState)(`featured`),[N,P]=(0,b.useState)(1),[F,I]=(0,b.useState)(null),[L,R]=(0,b.useState)(!1),[z,B]=(0,b.useState)(null),V=(C===`All Products`?0:1)+(A===`all`?0:1),{items:fe,count:H,subtotal:U,add:pe,increment:me,decrement:he,remove:ge,clear:_e}=y(),W=(0,b.useMemo)(()=>{let e=O.find(e=>e.id===A)?.test??(()=>!0),t=g.filter(t=>(C===`All Products`||t.category===C)&&e(t));return M===`lowhigh`?t=[...t].sort((e,t)=>E(e)-E(t)):M===`highlow`&&(t=[...t].sort((e,t)=>E(t)-E(e))),t},[C,A,M]),G=Math.max(1,Math.ceil(W.length/12)),K=W.slice((N-1)*12,N*12),ve=W.length===0?0:(N-1)*12+1,q=Math.min(N*12,W.length),J=C!==`All Products`&&M===`featured`,ye=(0,b.useMemo)(()=>{if(!J)return[{name:null,items:K}];let e=[];for(let t of K){let n=t.group||null,r=e[e.length-1];r&&r.name===n?r.items.push(t):e.push({name:n,items:[t]})}return e},[J,K]);(0,b.useEffect)(()=>{s&&T.includes(s)&&w(s)},[s]),(0,b.useEffect)(()=>{P(1)},[C,A,M]);let Y=(0,b.useRef)(null);(0,b.useEffect)(()=>{if(!S){Y.current=null;return}if(Y.current===S)return;let t=g.find(e=>e.id===S);if(!t)return;Y.current=S,j(`all`),w(e=>e===`All Products`||e===t.category?e:t.category),B(S);let r=new URLSearchParams(e);r.delete(`product`),n(r,{replace:!0})},[S,e,n]);let X=(0,b.useRef)(null);(0,b.useEffect)(()=>{if(!z){X.current=null;return}if(X.current===z)return;let e=W.findIndex(e=>e.id===z);if(e===-1)return;let t=Math.floor(e/12)+1;if(t!==N){P(t);return}X.current=z,document.getElementById(`product-${z}`)?.scrollIntoView({behavior:`smooth`,block:`center`});let n=setTimeout(()=>B(null),2600);return()=>clearTimeout(n)},[z,W,N]);let be=()=>{w(`All Products`),j(`all`)},Z=(0,b.useRef)(null);function Q({everyScreen:e=!1}={}){typeof window>`u`||!e&&window.innerWidth>=992||(R(!1),requestAnimationFrame(()=>{let e=Z.current;if(!e)return;let t=parseInt(getComputedStyle(document.documentElement).getPropertyValue(`--cc-header-h`),10)||82,n=e.getBoundingClientRect().top+window.scrollY-t-12;window.scrollTo({top:n,behavior:`smooth`})}))}let xe=e=>{w(e),Q()},Se=e=>{j(e),Q()},$=e=>{P(e),Q({everyScreen:!0})};return(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(`section`,{className:`cc-shop-hero`,children:(0,x.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,x.jsxs)(`div`,{className:`row g-4 g-lg-5 align-items-center`,children:[(0,x.jsxs)(`div`,{className:`col-lg-6 text-center text-lg-start`,children:[(0,x.jsx)(`span`,{className:`eyebrow mb-3 d-inline-flex`,children:`Shop Our Treats`}),(0,x.jsxs)(`h1`,{className:`cc-shop-hero__title`,children:[`Handcrafted`,(0,x.jsx)(`br`,{}),`Just for You`]}),(0,x.jsx)(ae,{width:50}),(0,x.jsx)(`p`,{className:`cc-shop-hero__lede`,children:`Discover our handmade cakes, cupcakes, cookies, and chocolates — made with the finest ingredients and a whole lot of love.`})]}),(0,x.jsx)(`div`,{className:`col-lg-6`,children:(0,x.jsx)(`img`,{src:_(oe.heroShop,1e3,800),alt:`Cupcakes on tiered display stands`,className:`cc-shop-hero__img`,fetchPriority:`high`})})]})})}),(0,x.jsx)(`section`,{className:`cc-shop-main`,children:(0,x.jsx)(`div`,{className:`container py-4`,children:(0,x.jsxs)(`div`,{className:`row g-4`,children:[(0,x.jsx)(`aside`,{className:`col-lg-3 col-xl-2`,children:(0,x.jsxs)(`div`,{className:`cc-shop-filter`,children:[(0,x.jsx)(`h6`,{className:`cc-shop-filter__heading`,children:`Filter By`}),(0,x.jsxs)(`button`,{type:`button`,className:`cc-shop-filter__toggle`,onClick:()=>R(e=>!e),"aria-expanded":L,children:[(0,x.jsxs)(`span`,{className:`cc-shop-filter__toggle-label`,children:[(0,x.jsx)(d,{size:15}),`Filters`,V>0&&(0,x.jsx)(`span`,{className:`cc-shop-filter__count`,children:V})]}),(0,x.jsx)(re,{size:18,className:`cc-shop-filter__chevron`+(L?` is-open`:``)})]}),(0,x.jsxs)(`div`,{className:`cc-shop-filter__body`+(L?` is-open`:``),children:[(0,x.jsxs)(`div`,{className:`cc-shop-filter__group`,children:[(0,x.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Category`}),T.map(e=>(0,x.jsx)(k,{label:e,checked:C===e,onChange:()=>xe(e)},e))]}),(0,x.jsxs)(`div`,{className:`cc-shop-filter__group`,children:[(0,x.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Price Range`}),O.map(e=>(0,x.jsx)(k,{label:e.label,checked:A===e.id,onChange:()=>Se(e.id)},e.id))]}),(0,x.jsx)(`button`,{type:`button`,className:`cc-shop-filter__clear`,onClick:be,children:`Clear Filters`})]})]})}),(0,x.jsxs)(`div`,{className:`col-lg-6 col-xl-7`,ref:Z,children:[(0,x.jsxs)(`div`,{className:`cc-shop-toolbar`,children:[(0,x.jsxs)(`span`,{className:`cc-shop-toolbar__count`,children:[`Showing `,ve,`–`,q,` of `,W.length,` results`]}),(0,x.jsxs)(`label`,{className:`cc-shop-toolbar__sort`,children:[(0,x.jsx)(`span`,{children:`Sort by:`}),(0,x.jsxs)(`select`,{value:M,onChange:e=>de(e.target.value),children:[(0,x.jsx)(`option`,{value:`featured`,children:`Featured`}),(0,x.jsx)(`option`,{value:`lowhigh`,children:`Price: low to high`}),(0,x.jsx)(`option`,{value:`highlow`,children:`Price: high to low`})]})]})]}),(0,x.jsxs)(`p`,{className:`cc-shop-note cc-shop-note--lead`,children:[(0,x.jsx)(t,{size:12}),` Freshly baked to order — please order at least 1 day in advance.`]}),C===`Cupcakes`&&(0,x.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,x.jsx)(a,{size:12}),` Cupcakes come as a box of 6, or buy them by the piece (minimum 2) — tap any cupcake to choose how many. Add ₹20 for floral or additional decoration.`]}),(0,x.jsxs)(`div`,{className:`cc-shop-grid`,children:[ye.map(e=>(0,x.jsxs)(b.Fragment,{children:[e.name&&(0,x.jsx)(`h3`,{className:`cc-shop-group`,children:e.name}),e.items.map(e=>(0,x.jsxs)(`article`,{id:`product-${e.id}`,className:`cc-product-card`+(e.id===z?` is-flash`:``),children:[(0,x.jsx)(`button`,{type:`button`,onClick:()=>I(e),"aria-label":`View ${e.name}`,className:`cc-product-card__img-btn`,children:(0,x.jsx)(`img`,{src:_(e.img,500,500),srcSet:v(e.img),sizes:`(min-width: 992px) 230px, 48vw`,alt:e.name,loading:`lazy`})}),(0,x.jsxs)(`div`,{className:`cc-product-card__body`,children:[(0,x.jsx)(`div`,{className:`cc-product-card__cat`,children:e.category}),(0,x.jsx)(`h6`,{className:`cc-product-card__name`,children:(0,x.jsx)(`button`,{type:`button`,className:`cc-product-card__name-btn`,onClick:()=>I(e),title:e.name,children:e.name})}),(0,x.jsx)(`div`,{className:`cc-product-card__price`,children:D(e)?(0,x.jsxs)(x.Fragment,{children:[h(e.slice),(0,x.jsx)(`span`,{className:`cc-product-card__price-sub`,children:e.sliceLabel})]}):e.slice==null?h(e.price):`From ${h(E(e))}`}),(0,x.jsxs)(`button`,{className:`cc-product-card__add`,"aria-label":e.slice?`Choose a size for ${e.name}`:`Add ${e.name} to cart`,onClick:()=>{e.slice?I(e):pe(e)},children:[(0,x.jsx)(m,{size:12}),` Add to Cart`]})]})]},e.id))]},e.name||`_`)),W.length===0&&(0,x.jsx)(`div`,{className:`cc-shop-empty`,children:`No products match your filters.`})]}),G>1&&(0,x.jsxs)(`nav`,{className:`cc-shop-pagination`,"aria-label":`Product pages`,children:[(0,x.jsx)(`button`,{type:`button`,className:`cc-shop-pagination__btn`,onClick:()=>$(Math.max(1,N-1)),disabled:N===1,"aria-label":`Previous page`,children:(0,x.jsx)(o,{size:14})}),ue(N,G).map((e,t)=>e===`…`?(0,x.jsx)(`span`,{className:`cc-shop-pagination__gap`,"aria-hidden":!0,children:`…`},`gap-${t}`):(0,x.jsx)(`button`,{type:`button`,className:`cc-shop-pagination__btn cc-shop-pagination__num`+(e===N?` is-active`:``),onClick:()=>$(e),"aria-label":`Page ${e}`,"aria-current":e===N?`page`:void 0,children:e},e)),(0,x.jsx)(`button`,{type:`button`,className:`cc-shop-pagination__btn`,onClick:()=>$(Math.min(G,N+1)),disabled:N===G,"aria-label":`Next page`,children:(0,x.jsx)(ne,{size:14})})]})]}),(0,x.jsx)(`aside`,{className:`col-lg-3`,children:(0,x.jsxs)(`div`,{className:`cc-shop-cart`,children:[(0,x.jsxs)(`div`,{className:`cc-shop-cart__panel`,children:[(0,x.jsxs)(`div`,{className:`cc-shop-cart__head`,children:[(0,x.jsxs)(`span`,{className:`cc-shop-cart__title`,children:[`Your Cart (`,H,`)`]}),H>0&&(0,x.jsx)(`button`,{type:`button`,className:`cc-shop-cart__clear`,onClick:_e,"aria-label":`Clear cart`,children:(0,x.jsx)(u,{size:16})})]}),H===0&&(0,x.jsx)(`p`,{className:`cc-shop-cart__empty`,children:`Your cart is empty.`}),fe.map(e=>(0,x.jsxs)(`div`,{className:`cc-shop-cart__item`,children:[(0,x.jsx)(`img`,{src:_(e.img,200,200),srcSet:v(e.img),sizes:`64px`,alt:``,className:`cc-shop-cart__item-img`}),(0,x.jsxs)(`div`,{className:`cc-shop-cart__item-body`,children:[(0,x.jsxs)(`div`,{className:`cc-shop-cart__item-top`,children:[(0,x.jsx)(`strong`,{className:`cc-shop-cart__item-name`,children:e.name}),(0,x.jsx)(`button`,{type:`button`,onClick:()=>ge(e.id),"aria-label":`Remove`,className:`cc-shop-cart__item-remove`,children:(0,x.jsx)(u,{size:14})})]}),(0,x.jsx)(`div`,{className:`cc-shop-cart__item-price`,children:h(e.price)}),(0,x.jsxs)(`div`,{className:`cc-shop-cart__qty`,children:[(0,x.jsx)(`button`,{className:`qty-btn`,onClick:()=>he(e.id),"aria-label":`Decrease`,children:(0,x.jsx)(r,{size:12})}),(0,x.jsx)(`span`,{children:e.qty}),(0,x.jsx)(`button`,{className:`qty-btn`,onClick:()=>me(e.id),"aria-label":`Increase`,children:(0,x.jsx)(i,{size:12})})]})]})]},e.id)),(0,x.jsxs)(`div`,{className:`cc-shop-cart__subtotal`,children:[(0,x.jsx)(`span`,{children:`SUBTOTAL`}),(0,x.jsx)(`strong`,{children:h(U)})]}),(0,x.jsx)(`p`,{className:`cc-shop-cart__note`,children:`Delivery calculated at checkout. Self-pickup is always free.`}),(0,x.jsxs)(f,{to:`/cart`,className:`btn-rose w-100 justify-content-center mb-2`,style:{pointerEvents:H===0?`none`:`auto`,opacity:H===0?.5:1},tabIndex:H===0?-1:void 0,"aria-disabled":H===0,children:[(0,x.jsx)(m,{size:14}),` View Cart`]}),(0,x.jsxs)(f,{to:`/checkout`,className:`btn-outline-rose w-100 justify-content-center`,style:{pointerEvents:H===0?`none`:`auto`,opacity:H===0?.5:1},tabIndex:H===0?-1:void 0,"aria-disabled":H===0,children:[(0,x.jsx)(te,{size:14}),` Checkout`]})]}),(0,x.jsxs)(`div`,{className:`cc-shop-special`,children:[(0,x.jsx)(`span`,{className:`cc-shop-special__icon`,children:(0,x.jsx)(a,{size:16})}),(0,x.jsx)(`h6`,{className:`cc-shop-special__title`,children:`Need Something Special?`}),(0,x.jsx)(`p`,{className:`cc-shop-special__text`,children:`We love creating custom treats for your special moments.`}),(0,x.jsx)(f,{to:`/contact`,className:`cc-shop-special__btn`,children:`Place Custom Order`})]}),(0,x.jsx)(`ul`,{className:`cc-shop-trust`,children:[{Icon:a,title:`Handcrafted with Love`,text:`Made in small batches with care.`},{Icon:p,title:`Premium Ingredients`,text:`We use only the finest ingredients.`},{Icon:c,title:`Secure Packaging`,text:`Your treats arrive fresh and beautiful.`}].map((e,t)=>(0,x.jsxs)(`li`,{className:`cc-shop-trust__row`,children:[(0,x.jsx)(`span`,{className:`cc-shop-trust__icon`,children:(0,x.jsx)(e.Icon,{size:14})}),(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`div`,{className:`cc-shop-trust__title`,children:e.title}),(0,x.jsx)(`p`,{className:`cc-shop-trust__text`,children:e.text})]})]},t))})]})})]})})}),(0,x.jsx)(`section`,{className:`cc-shop-promise`,children:(0,x.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,x.jsx)(`div`,{className:`feature-row`,children:[{Icon:p,title:`Fresh & Quality`,text:`We source the freshest ingredients for the best taste and quality.`},{Icon:l,title:`Made to Order`,text:`Every treat is made to order just for you.`},{Icon:ee,title:`On-Time Delivery`,text:`We deliver your treats fresh and on time, every time.`},{Icon:c,title:`Safe & Secure`,text:`Secure checkout and careful packaging always.`}].map((e,t)=>(0,x.jsxs)(`div`,{className:`feature-cell text-center cc-shop-promise__cell`,children:[(0,x.jsx)(`span`,{className:`cc-features-card__icon cc-features-card__icon--lg`,children:(0,x.jsx)(e.Icon,{size:22})}),(0,x.jsx)(`div`,{className:`cc-features-card__heading mt-3`,children:e.title}),(0,x.jsx)(`p`,{className:`cc-features-card__text mt-1`,children:e.text})]},t))})})}),H>0&&(0,x.jsxs)(f,{to:`/cart`,className:`shop-cart-pill`,children:[(0,x.jsx)(m,{size:15}),(0,x.jsxs)(`span`,{children:[(0,x.jsx)(`strong`,{children:H}),` `,H===1?`item`:`items`,` · `,h(U)]}),(0,x.jsx)(`span`,{className:`shop-cart-pill__cta`,children:`View cart`})]}),(0,x.jsx)(le,{product:F,onClose:()=>I(null)},F?.id)]})}export{A as default};