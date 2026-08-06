import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{C as t,K as n,P as r,Y as i,b as a,bt as o,ct as s,ft as c,i as l,mt as u,nt as d,r as f,rt as ee,tt as p,ut as m,v as te,wt as h,x as ne,y as re}from"./react-vendor-DV9dzQ9d.js";import{t as g}from"./format-XQan9feh.js";import{C as _,_ as v,b as y,g as b,h as x,m as S,n as ie,p as ae,r as oe,v as C}from"./index-BthU0X3U.js";import{t as se}from"./useJsonLd-8yD5koEc.js";var w=e(h(),1),T=c(),E={eggless:{label:`Eggless`,icon:`🌱`,kind:`free`},vegan:{label:`Vegan`,icon:`🌿`,kind:`free`},"gluten-free":{label:`Gluten-Free`,icon:`🌾`,kind:`free`},"contains-nuts":{label:`Contains Nuts`,icon:`🌰`,kind:`contains`},"contains-egg":{label:`Contains Egg`,icon:`🥚`,kind:`contains`},"contains-dairy":{label:`Contains Dairy`,icon:`🥛`,kind:`contains`},"contains-gluten":{label:`Contains Gluten`,icon:`🌾`,kind:`contains`},"eggless-option":{label:`Eggless on request`,icon:`🌱`,kind:`option`}},D={free:{bg:`rgba(34, 139, 81, 0.10)`,fg:`#1d6f3a`,border:`rgba(34, 139, 81, 0.35)`},contains:{bg:`rgba(184, 134, 11, 0.12)`,fg:`#8a5d05`,border:`rgba(184, 134, 11, 0.35)`},option:{bg:`rgba(224, 97, 122, 0.08)`,fg:`var(--cc-rose-deep)`,border:`rgba(224, 97, 122, 0.4)`}};function O({allergens:e,verbose:t=!1,size:n=`sm`}){if(!Array.isArray(e)||e.length===0)return null;let r=[`eggless`,`eggless-option`,`vegan`,`gluten-free`,`contains-nuts`],i=t?e:e.filter(e=>r.includes(e));if(i.length===0)return null;let a=n===`lg`?`0.4rem 0.7rem`:`0.18rem 0.5rem`,o=n===`lg`?`0.78rem`:`0.66rem`;return(0,T.jsx)(`div`,{className:`d-flex flex-wrap`,style:{gap:4},children:i.map(e=>{let t=E[e];if(!t)return null;let n=D[t.kind];return(0,T.jsxs)(`span`,{title:t.label,style:{display:`inline-flex`,alignItems:`center`,gap:3,fontSize:o,fontWeight:600,letterSpacing:`0.02em`,color:n.fg,background:n.bg,border:`1px solid ${n.border}`,padding:a,borderRadius:999,lineHeight:1.1,whiteSpace:`nowrap`},children:[(0,T.jsx)(`span`,{"aria-hidden":!0,style:{fontSize:`0.9em`},children:t.icon}),t.label]},e)})})}function ce({product:e,onClose:t}){let{add:r}=_(),a=Math.max(1,Number(e?.minQty)||1),[o,s]=(0,w.useState)(a),c=(0,w.useRef)(null);if((0,w.useEffect)(()=>{if(!e)return;let n=e=>{e.key===`Escape`&&t()};return document.addEventListener(`keydown`,n),()=>document.removeEventListener(`keydown`,n)},[e,t]),(0,w.useEffect)(()=>{if(!e)return;let t=e=>{c.current?.contains(e.target)||e.preventDefault()};return document.addEventListener(`touchmove`,t,{passive:!1}),document.addEventListener(`wheel`,t,{passive:!1}),()=>{document.removeEventListener(`touchmove`,t),document.removeEventListener(`wheel`,t)}},[e]),!e)return null;let l=e,u=a>1;function f(e,n){r(e,n),t()}return(0,T.jsxs)(`div`,{role:`dialog`,"aria-modal":`true`,"aria-label":l.name,onClick:t,className:`qv-backdrop`,children:[(0,T.jsxs)(`div`,{ref:c,onClick:e=>e.stopPropagation(),className:`qv-modal`,children:[(0,T.jsx)(`button`,{onClick:t,"aria-label":`Close`,className:`qv-close`,children:(0,T.jsx)(m,{size:18})}),(0,T.jsxs)(`div`,{className:`qv-grid`,children:[(0,T.jsxs)(`div`,{className:`qv-image-col`,children:[(0,T.jsx)(`img`,{src:x(l.img,800,800),srcSet:S(l.img),sizes:`(min-width: 720px) 300px, 100vw`,alt:l.name,className:`qv-image`}),l.badge&&(0,T.jsx)(`span`,{className:`qv-badge`,children:l.badge})]}),(0,T.jsxs)(`div`,{className:`qv-info-col`,children:[(0,T.jsx)(`div`,{className:`tag-badge mb-1`,style:{fontSize:`0.65rem`},children:l.category}),(0,T.jsx)(`h3`,{className:`qv-title`,children:l.name}),l.allergens?.length>0&&(0,T.jsx)(`div`,{className:`mt-2`,children:(0,T.jsx)(O,{allergens:l.allergens,verbose:!0})}),(0,T.jsx)(`p`,{className:`qv-desc`,children:b(l)}),(0,T.jsx)(`p`,{className:`qv-desc`,style:{fontSize:`0.82rem`,opacity:.85},children:`Handcrafted with the finest ingredients and freshly prepared. Please pre-order at least 1 day in advance.`}),l.slice?(0,T.jsxs)(`div`,{className:`qv-options`,children:[(0,T.jsxs)(`div`,{className:`qv-option${u?` qv-option--qty`:``}`,children:[(0,T.jsxs)(`div`,{className:`qv-option__info`,children:[(0,T.jsxs)(`div`,{className:`qv-option__label`,children:[l.sizeLabel||`Whole`,u&&(0,T.jsxs)(`span`,{className:`qv-option__min`,children:[`Min `,a]})]}),(0,T.jsxs)(`div`,{className:`qv-option__price`,children:[g(l.price),u&&(0,T.jsx)(`span`,{className:`qv-option__sub`,children:`each`})]})]}),u?(0,T.jsxs)(`div`,{className:`qv-qty`,children:[(0,T.jsx)(`span`,{className:`qv-qty__ask`,children:`How many?`}),(0,T.jsxs)(`div`,{className:`qv-qty__row`,children:[(0,T.jsxs)(`div`,{className:`qv-qty__stepper`,children:[(0,T.jsx)(`button`,{type:`button`,onClick:()=>s(e=>Math.max(a,e-1)),disabled:o<=a,"aria-label":`One fewer`,children:(0,T.jsx)(n,{size:13})}),(0,T.jsx)(`span`,{className:`qv-qty__val`,"aria-live":`polite`,children:o}),(0,T.jsx)(`button`,{type:`button`,onClick:()=>s(e=>e+1),"aria-label":`One more`,children:(0,T.jsx)(i,{size:13})})]}),(0,T.jsxs)(`button`,{className:`qv-btn qv-btn--filled qv-qty__add`,onClick:()=>f({...l,name:`${l.name} (${l.sizeLabel||`Whole`})`},o),children:[(0,T.jsx)(d,{size:13}),` Add `,o,` — `,g(l.price*o)]})]})]}):(0,T.jsxs)(`button`,{className:`qv-btn qv-btn--filled`,onClick:()=>f({...l,name:`${l.name} (${l.sizeLabel||`Whole`})`},a),children:[(0,T.jsx)(d,{size:13}),` Add`]})]}),(0,T.jsxs)(`div`,{className:`qv-option`,children:[(0,T.jsxs)(`div`,{className:`qv-option__info`,children:[(0,T.jsx)(`div`,{className:`qv-option__label`,children:l.sliceLabel||`Slice`}),(0,T.jsx)(`div`,{className:`qv-option__price`,children:g(l.slice)})]}),(0,T.jsxs)(`button`,{className:`qv-btn qv-btn--outline`,onClick:()=>f({id:l.id+`-slice`,name:`${l.name} (${l.sliceLabel||`Slice`})`,price:l.slice,img:l.img}),children:[(0,T.jsx)(d,{size:13}),` Add`]})]})]}):(0,T.jsx)(`div`,{className:`qv-actions`,children:(0,T.jsxs)(`button`,{className:`qv-btn qv-btn--filled w-100`,onClick:()=>f(l),children:[(0,T.jsx)(d,{size:13}),` Add to Cart — `,g(l.price)]})})]})]})]}),(0,T.jsx)(`style`,{children:`
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

      `})]})}var k=[`All Products`,`Cheesecakes`,`Milk Cakes`,`Sponge Cakes`,`Cookies`,`Cupcakes`,`Bakes`,`Dessert Cups`,`Drinks`];function le(e,t){if(t<=7)return Array.from({length:t},(e,t)=>t+1);let n=[1],r=Math.max(2,e-1),i=Math.min(t-1,e+1);r>2&&n.push(`…`);for(let e=r;e<=i;e+=1)n.push(e);return i<t-1&&n.push(`…`),n.push(t),n}var A=[{id:`all`,label:`All Prices`,test:()=>!0},{id:`0-200`,label:`₹0 – ₹200`,test:e=>C(e)<=200},{id:`200-500`,label:`₹200 – ₹500`,test:e=>C(e)>200&&C(e)<=500},{id:`500-1000`,label:`₹500 – ₹1000`,test:e=>C(e)>500&&C(e)<=1e3},{id:`1000+`,label:`₹1000+`,test:e=>C(e)>1e3}];function j({checked:e,onChange:t,label:n}){return(0,T.jsxs)(`label`,{className:`cc-shop-radio`,children:[(0,T.jsx)(`input`,{type:`radio`,checked:e,onChange:t,className:`cc-shop-radio__input`}),(0,T.jsx)(`span`,{className:`cc-shop-radio__dot`,"aria-hidden":!0}),(0,T.jsx)(`span`,{children:n})]})}function M(){oe({title:`Shop`,description:`Order from our full menu — cheesecakes, milk cakes, cookies, cupcakes, dessert cups and drinks. UPI / Cash on Delivery.`}),se(`shop-products`,{"@context":`https://schema.org`,"@type":`ItemList`,name:`Cake & Crumb — Shop`,numberOfItems:y.length,itemListElement:y.slice(0,30).map((e,t)=>({"@type":`ListItem`,position:t+1,item:{"@type":`Product`,name:e.name,description:b(e),category:e.category,image:typeof window<`u`?new URL(x(e.img,800,800),window.location.origin).href:x(e.img,800,800),brand:{"@type":`Brand`,name:`Cake & Crumb`},offers:{"@type":`Offer`,price:v(e)?e.slice:C(e),priceCurrency:`INR`,availability:`https://schema.org/InStock`}}}))});let[e,c]=o(),h=e.get(`category`),E=e.get(`product`),[D,O]=(0,w.useState)(h&&k.includes(h)?h:`All Products`),[M,N]=(0,w.useState)(`all`),[P,ue]=(0,w.useState)(`featured`),[F,I]=(0,w.useState)(1),[L,R]=(0,w.useState)(null),[z,B]=(0,w.useState)(!1),[V,H]=(0,w.useState)(null),U=(D===`All Products`?0:1)+(M===`all`?0:1),{items:de,count:W,subtotal:G,add:fe,increment:pe,decrement:me,remove:he,clear:ge}=_(),K=(0,w.useMemo)(()=>{let e=A.find(e=>e.id===M)?.test??(()=>!0),t=y.filter(t=>(D===`All Products`||t.category===D)&&e(t));return P===`lowhigh`?t=[...t].sort((e,t)=>C(e)-C(t)):P===`highlow`&&(t=[...t].sort((e,t)=>C(t)-C(e))),t},[D,M,P]),q=Math.max(1,Math.ceil(K.length/12)),J=K.slice((F-1)*12,F*12),_e=K.length===0?0:(F-1)*12+1,ve=Math.min(F*12,K.length),Y=D!==`All Products`&&P===`featured`,ye=(0,w.useMemo)(()=>{if(!Y)return[{name:null,items:J}];let e=[];for(let t of J){let n=t.group||null,r=e[e.length-1];r&&r.name===n?r.items.push(t):e.push({name:n,items:[t]})}return e},[Y,J]);(0,w.useEffect)(()=>{h&&k.includes(h)&&O(h)},[h]),(0,w.useEffect)(()=>{I(1)},[D,M,P]);let X=(0,w.useRef)(null);(0,w.useEffect)(()=>{if(!E){X.current=null;return}if(X.current===E)return;let t=y.find(e=>e.id===E);if(!t)return;X.current=E,N(`all`),O(e=>e===`All Products`||e===t.category?e:t.category),H(E);let n=new URLSearchParams(e);n.delete(`product`),c(n,{replace:!0})},[E,e,c]);let Z=(0,w.useRef)(null);(0,w.useEffect)(()=>{if(!V){Z.current=null;return}if(Z.current===V)return;let e=K.findIndex(e=>e.id===V);if(e===-1)return;let t=Math.floor(e/12)+1;if(t!==F){I(t);return}Z.current=V,document.getElementById(`product-${V}`)?.scrollIntoView({behavior:`smooth`,block:`center`});let n=setTimeout(()=>H(null),2600);return()=>clearTimeout(n)},[V,K,F]);let be=()=>{O(`All Products`),N(`all`)},xe=(0,w.useRef)(null);function Q({everyScreen:e=!1}={}){typeof window>`u`||!e&&window.innerWidth>=992||(B(!1),requestAnimationFrame(()=>{let e=xe.current;if(!e)return;let t=parseInt(getComputedStyle(document.documentElement).getPropertyValue(`--cc-header-h`),10)||82,n=e.getBoundingClientRect().top+window.scrollY-t-12;window.scrollTo({top:n,behavior:`smooth`})}))}let Se=e=>{O(e),Q()},Ce=e=>{N(e),Q()},$=e=>{I(e),Q({everyScreen:!0})};return(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(`section`,{className:`cc-shop-hero`,children:(0,T.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,T.jsxs)(`div`,{className:`row g-4 g-lg-5 align-items-center`,children:[(0,T.jsxs)(`div`,{className:`col-lg-6 text-center text-lg-start`,children:[(0,T.jsx)(`span`,{className:`eyebrow mb-3 d-inline-flex`,children:`Shop Our Treats`}),(0,T.jsxs)(`h1`,{className:`cc-shop-hero__title`,children:[`Handcrafted`,(0,T.jsx)(`br`,{}),`Just for You`]}),(0,T.jsx)(ie,{width:50}),(0,T.jsx)(`p`,{className:`cc-shop-hero__lede`,children:`Discover our handmade cakes, cupcakes, cookies, and chocolates — made with the finest ingredients and a whole lot of love.`})]}),(0,T.jsx)(`div`,{className:`col-lg-6`,children:(0,T.jsx)(`img`,{src:x(ae.heroShop,1e3,800),alt:`Cupcakes on tiered display stands`,className:`cc-shop-hero__img`,fetchPriority:`high`})})]})})}),(0,T.jsx)(`section`,{className:`cc-shop-main`,children:(0,T.jsx)(`div`,{className:`container py-4`,children:(0,T.jsxs)(`div`,{className:`row g-4`,children:[(0,T.jsx)(`aside`,{className:`col-lg-3 col-xl-2`,children:(0,T.jsxs)(`div`,{className:`cc-shop-filter`,children:[(0,T.jsx)(`h6`,{className:`cc-shop-filter__heading`,children:`Filter By`}),(0,T.jsxs)(`button`,{type:`button`,className:`cc-shop-filter__toggle`,onClick:()=>B(e=>!e),"aria-expanded":z,children:[(0,T.jsxs)(`span`,{className:`cc-shop-filter__toggle-label`,children:[(0,T.jsx)(ee,{size:15}),`Filters`,U>0&&(0,T.jsx)(`span`,{className:`cc-shop-filter__count`,children:U})]}),(0,T.jsx)(re,{size:18,className:`cc-shop-filter__chevron`+(z?` is-open`:``)})]}),(0,T.jsxs)(`div`,{className:`cc-shop-filter__body`+(z?` is-open`:``),children:[(0,T.jsxs)(`div`,{className:`cc-shop-filter__group`,children:[(0,T.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Category`}),k.map(e=>(0,T.jsx)(j,{label:e,checked:D===e,onChange:()=>Se(e)},e))]}),(0,T.jsxs)(`div`,{className:`cc-shop-filter__group`,children:[(0,T.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Price Range`}),A.map(e=>(0,T.jsx)(j,{label:e.label,checked:M===e.id,onChange:()=>Ce(e.id)},e.id))]}),(0,T.jsx)(`button`,{type:`button`,className:`cc-shop-filter__clear`,onClick:be,children:`Clear Filters`})]})]})}),(0,T.jsxs)(`div`,{className:`col-lg-6 col-xl-7`,ref:xe,children:[(0,T.jsxs)(`div`,{className:`cc-shop-toolbar`,children:[(0,T.jsxs)(`span`,{className:`cc-shop-toolbar__count`,children:[`Showing `,_e,`–`,ve,` of `,K.length,` results`]}),(0,T.jsxs)(`label`,{className:`cc-shop-toolbar__sort`,children:[(0,T.jsx)(`span`,{children:`Sort by:`}),(0,T.jsxs)(`select`,{value:P,onChange:e=>ue(e.target.value),children:[(0,T.jsx)(`option`,{value:`featured`,children:`Featured`}),(0,T.jsx)(`option`,{value:`lowhigh`,children:`Price: low to high`}),(0,T.jsx)(`option`,{value:`highlow`,children:`Price: high to low`})]})]})]}),(0,T.jsxs)(`p`,{className:`cc-shop-note cc-shop-note--lead`,children:[(0,T.jsx)(t,{size:12}),` Freshly baked to order — please order at least 1 day in advance.`]}),D===`Cupcakes`&&(0,T.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,T.jsx)(r,{size:12}),` Cupcakes come as a box of 6, or buy them by the piece (minimum 2) — tap any cupcake to choose how many. Add ₹20 for floral or additional decoration.`]}),(0,T.jsxs)(`div`,{className:`cc-shop-grid`,children:[ye.map(e=>(0,T.jsxs)(w.Fragment,{children:[e.name&&(0,T.jsx)(`h3`,{className:`cc-shop-group`,children:e.name}),e.items.map(e=>(0,T.jsxs)(`article`,{id:`product-${e.id}`,className:`cc-product-card`+(e.id===V?` is-flash`:``),children:[(0,T.jsx)(`button`,{type:`button`,onClick:()=>R(e),"aria-label":`View ${e.name}`,className:`cc-product-card__img-btn`,children:(0,T.jsx)(`img`,{src:x(e.img,500,500),srcSet:S(e.img),sizes:`(min-width: 992px) 230px, 48vw`,alt:e.name,loading:`lazy`})}),(0,T.jsxs)(`div`,{className:`cc-product-card__body`,children:[(0,T.jsx)(`div`,{className:`cc-product-card__cat`,children:e.category}),(0,T.jsx)(`h6`,{className:`cc-product-card__name`,children:(0,T.jsx)(`button`,{type:`button`,className:`cc-product-card__name-btn`,onClick:()=>R(e),title:e.name,children:e.name})}),(0,T.jsx)(`div`,{className:`cc-product-card__price`,children:v(e)?(0,T.jsxs)(T.Fragment,{children:[g(e.slice),(0,T.jsx)(`span`,{className:`cc-product-card__price-sub`,children:e.sliceLabel})]}):e.slice==null?g(e.price):`From ${g(C(e))}`}),(0,T.jsxs)(`button`,{className:`cc-product-card__add`,"aria-label":e.slice?`Choose a size for ${e.name}`:`Add ${e.name} to cart`,onClick:()=>{e.slice?R(e):fe(e)},children:[(0,T.jsx)(d,{size:12}),` Add to Cart`]})]})]},e.id))]},e.name||`_`)),K.length===0&&(0,T.jsx)(`div`,{className:`cc-shop-empty`,children:`No products match your filters.`})]}),q>1&&(0,T.jsxs)(`nav`,{className:`cc-shop-pagination`,"aria-label":`Product pages`,children:[(0,T.jsx)(`button`,{type:`button`,className:`cc-shop-pagination__btn`,onClick:()=>$(Math.max(1,F-1)),disabled:F===1,"aria-label":`Previous page`,children:(0,T.jsx)(a,{size:14})}),le(F,q).map((e,t)=>e===`…`?(0,T.jsx)(`span`,{className:`cc-shop-pagination__gap`,"aria-hidden":!0,children:`…`},`gap-${t}`):(0,T.jsx)(`button`,{type:`button`,className:`cc-shop-pagination__btn cc-shop-pagination__num`+(e===F?` is-active`:``),onClick:()=>$(e),"aria-label":`Page ${e}`,"aria-current":e===F?`page`:void 0,children:e},e)),(0,T.jsx)(`button`,{type:`button`,className:`cc-shop-pagination__btn`,onClick:()=>$(Math.min(q,F+1)),disabled:F===q,"aria-label":`Next page`,children:(0,T.jsx)(ne,{size:14})})]})]}),(0,T.jsx)(`aside`,{className:`col-lg-3`,children:(0,T.jsxs)(`div`,{className:`cc-shop-cart`,children:[(0,T.jsxs)(`div`,{className:`cc-shop-cart__panel`,children:[(0,T.jsxs)(`div`,{className:`cc-shop-cart__head`,children:[(0,T.jsxs)(`span`,{className:`cc-shop-cart__title`,children:[`Your Cart (`,W,`)`]}),W>0&&(0,T.jsx)(`button`,{type:`button`,className:`cc-shop-cart__clear`,onClick:ge,"aria-label":`Clear cart`,children:(0,T.jsx)(m,{size:16})})]}),W===0&&(0,T.jsx)(`p`,{className:`cc-shop-cart__empty`,children:`Your cart is empty.`}),de.map(e=>(0,T.jsxs)(`div`,{className:`cc-shop-cart__item`,children:[(0,T.jsx)(`img`,{src:x(e.img,200,200),srcSet:S(e.img),sizes:`64px`,alt:``,className:`cc-shop-cart__item-img`}),(0,T.jsxs)(`div`,{className:`cc-shop-cart__item-body`,children:[(0,T.jsxs)(`div`,{className:`cc-shop-cart__item-top`,children:[(0,T.jsx)(`strong`,{className:`cc-shop-cart__item-name`,children:e.name}),(0,T.jsx)(`button`,{type:`button`,onClick:()=>he(e.id),"aria-label":`Remove`,className:`cc-shop-cart__item-remove`,children:(0,T.jsx)(m,{size:14})})]}),(0,T.jsx)(`div`,{className:`cc-shop-cart__item-price`,children:g(e.price)}),(0,T.jsxs)(`div`,{className:`cc-shop-cart__qty`,children:[(0,T.jsx)(`button`,{className:`qty-btn`,onClick:()=>me(e.id),"aria-label":`Decrease`,children:(0,T.jsx)(n,{size:12})}),(0,T.jsx)(`span`,{children:e.qty}),(0,T.jsx)(`button`,{className:`qty-btn`,onClick:()=>pe(e.id),"aria-label":`Increase`,children:(0,T.jsx)(i,{size:12})})]})]})]},e.id)),(0,T.jsxs)(`div`,{className:`cc-shop-cart__subtotal`,children:[(0,T.jsx)(`span`,{children:`SUBTOTAL`}),(0,T.jsx)(`strong`,{children:g(G)})]}),(0,T.jsx)(`p`,{className:`cc-shop-cart__note`,children:`Delivery calculated at checkout. Self-pickup is always free.`}),(0,T.jsxs)(u,{to:`/cart`,className:`btn-rose w-100 justify-content-center mb-2`,style:{pointerEvents:W===0?`none`:`auto`,opacity:W===0?.5:1},tabIndex:W===0?-1:void 0,"aria-disabled":W===0,children:[(0,T.jsx)(d,{size:14}),` View Cart`]}),(0,T.jsxs)(u,{to:`/checkout`,className:`btn-outline-rose w-100 justify-content-center`,style:{pointerEvents:W===0?`none`:`auto`,opacity:W===0?.5:1},tabIndex:W===0?-1:void 0,"aria-disabled":W===0,children:[(0,T.jsx)(te,{size:14}),` Checkout`]})]}),(0,T.jsxs)(`div`,{className:`cc-shop-special`,children:[(0,T.jsx)(`span`,{className:`cc-shop-special__icon`,children:(0,T.jsx)(r,{size:16})}),(0,T.jsx)(`h6`,{className:`cc-shop-special__title`,children:`Need Something Special?`}),(0,T.jsx)(`p`,{className:`cc-shop-special__text`,children:`We love creating custom treats for your special moments.`}),(0,T.jsx)(u,{to:`/contact`,className:`cc-shop-special__btn`,children:`Place Custom Order`})]}),(0,T.jsx)(`ul`,{className:`cc-shop-trust`,children:[{Icon:r,title:`Handcrafted with Love`,text:`Made in small batches with care.`},{Icon:f,title:`Premium Ingredients`,text:`We use only the finest ingredients.`},{Icon:p,title:`Secure Packaging`,text:`Your treats arrive fresh and beautiful.`}].map((e,t)=>(0,T.jsxs)(`li`,{className:`cc-shop-trust__row`,children:[(0,T.jsx)(`span`,{className:`cc-shop-trust__icon`,children:(0,T.jsx)(e.Icon,{size:14})}),(0,T.jsxs)(`div`,{children:[(0,T.jsx)(`div`,{className:`cc-shop-trust__title`,children:e.title}),(0,T.jsx)(`p`,{className:`cc-shop-trust__text`,children:e.text})]})]},t))})]})})]})})}),(0,T.jsx)(`section`,{className:`cc-shop-promise`,children:(0,T.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,T.jsx)(`div`,{className:`feature-row`,children:[{Icon:f,title:`Fresh & Quality`,text:`We source the freshest ingredients for the best taste and quality.`},{Icon:l,title:`Made to Order`,text:`Every treat is made to order just for you.`},{Icon:s,title:`On-Time Delivery`,text:`We deliver your treats fresh and on time, every time.`},{Icon:p,title:`Safe & Secure`,text:`Secure checkout and careful packaging always.`}].map((e,t)=>(0,T.jsxs)(`div`,{className:`feature-cell text-center cc-shop-promise__cell`,children:[(0,T.jsx)(`span`,{className:`cc-features-card__icon cc-features-card__icon--lg`,children:(0,T.jsx)(e.Icon,{size:22})}),(0,T.jsx)(`div`,{className:`cc-features-card__heading mt-3`,children:e.title}),(0,T.jsx)(`p`,{className:`cc-features-card__text mt-1`,children:e.text})]},t))})})}),W>0&&(0,T.jsxs)(u,{to:`/cart`,className:`shop-cart-pill`,children:[(0,T.jsx)(d,{size:15}),(0,T.jsxs)(`span`,{children:[(0,T.jsx)(`strong`,{children:W}),` `,W===1?`item`:`items`,` · `,g(G)]}),(0,T.jsx)(`span`,{className:`shop-cart-pill__cta`,children:`View cart`})]}),(0,T.jsx)(ce,{product:L,onClose:()=>R(null)},L?.id)]})}export{M as default};