import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{C as t,Ct as n,Dt as r,F as i,Z as a,_t as o,at as s,ht as c,it as ee,ot as l,pt as u,q as d,r as f,v as p,y as m,z as h}from"./react-vendor-Ch8wCBc_.js";import{t as g}from"./format-XQan9feh.js";import{A as _,D as v,E as y,F as te,I as b,M as x,N as ne,O as S,P as C,j as w,k as T,n as re,r as ie,z as ae}from"./index-0x4lwhNW.js";import{t as oe}from"./OfferGift-0kFZw3oo.js";import{t as se}from"./useJsonLd-DpRgdikn.js";var E=e(r(),1),D=c(),O={eggless:{label:`Eggless`,icon:`🌱`,kind:`free`},vegan:{label:`Vegan`,icon:`🌿`,kind:`free`},"gluten-free":{label:`Gluten-Free`,icon:`🌾`,kind:`free`},"contains-nuts":{label:`Contains Nuts`,icon:`🌰`,kind:`contains`},"contains-egg":{label:`Contains Egg`,icon:`🥚`,kind:`contains`},"contains-dairy":{label:`Contains Dairy`,icon:`🥛`,kind:`contains`},"contains-gluten":{label:`Contains Gluten`,icon:`🌾`,kind:`contains`},"eggless-option":{label:`Eggless on request`,icon:`🌱`,kind:`option`}},k={free:{bg:`rgba(34, 139, 81, 0.10)`,fg:`#1d6f3a`,border:`rgba(34, 139, 81, 0.35)`},contains:{bg:`rgba(184, 134, 11, 0.12)`,fg:`#8a5d05`,border:`rgba(184, 134, 11, 0.35)`},option:{bg:`rgba(224, 97, 122, 0.08)`,fg:`var(--cc-rose-deep)`,border:`rgba(224, 97, 122, 0.4)`}};function A({allergens:e,verbose:t=!1,size:n=`sm`}){if(!Array.isArray(e)||e.length===0)return null;let r=[`eggless`,`vegan`,`gluten-free`],i=t?e:e.filter(e=>r.includes(e));if(i.length===0)return null;let a=n===`lg`?`0.4rem 0.7rem`:`0.18rem 0.5rem`,o=n===`lg`?`0.78rem`:`0.66rem`;return(0,D.jsx)(`div`,{className:`d-flex flex-wrap`,style:{gap:4},children:i.map(e=>{let t=O[e];if(!t)return null;let n=k[t.kind];return(0,D.jsxs)(`span`,{title:t.label,style:{display:`inline-flex`,alignItems:`center`,gap:3,fontSize:o,fontWeight:600,letterSpacing:`0.02em`,color:n.fg,background:n.bg,border:`1px solid ${n.border}`,padding:a,borderRadius:999,lineHeight:1.1,whiteSpace:`nowrap`},children:[(0,D.jsx)(`span`,{"aria-hidden":!0,style:{fontSize:`0.9em`},children:t.icon}),t.label]},e)})})}var j=`a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`;function M(e,t){(0,E.useEffect)(()=>{if(!t)return;let n=document.activeElement;e.current?.focus({preventScroll:!0});let r=t=>{if(t.key!==`Tab`||!e.current)return;let n=[...e.current.querySelectorAll(j)].filter(e=>e.offsetParent!==null);if(!n.length){t.preventDefault();return}let r=n[0],i=n[n.length-1],a=e.current.contains(document.activeElement);t.shiftKey&&(document.activeElement===r||document.activeElement===e.current||!a)?(t.preventDefault(),i.focus()):!t.shiftKey&&(document.activeElement===i||!a)&&(t.preventDefault(),r.focus())};return document.addEventListener(`keydown`,r),()=>{document.removeEventListener(`keydown`,r);let e=n&&document.contains(n)&&n!==document.body?n:document.querySelector(`main`);e&&(e.tagName===`MAIN`&&!e.hasAttribute(`tabindex`)&&e.setAttribute(`tabindex`,`-1`),e.focus?.({preventScroll:!0}))}},[e,t])}var N=3,P=`Small orders bake with the day’s batch`,F=e=>e===1?`We don’t bake a tray for one — yours joins the day’s batch of this flavour.`:`Small orders join the day’s batch of this flavour.`;function I(){return(0,D.jsxs)(`p`,{className:`qv-batch-hint`,children:[(0,D.jsx)(h,{size:12}),P]})}function L({label:e,minQty:t,unitPrice:n,each:r=`each`,qty:i,setQty:o,onAdd:c}){return(0,D.jsxs)(`div`,{className:`qv-buy`,children:[(0,D.jsxs)(`div`,{className:`qv-buy__head`,children:[(0,D.jsxs)(`span`,{className:`qv-buy__label`,children:[e,t>1&&(0,D.jsxs)(`span`,{className:`qv-option__min`,children:[`Min `,t]})]}),(0,D.jsxs)(`span`,{className:`qv-buy__unit`,children:[g(n),` `,r&&(0,D.jsx)(`small`,{children:r})]})]}),(0,D.jsxs)(`div`,{className:`qv-buy__body`,children:[(0,D.jsxs)(`div`,{className:`qv-buy__stepper`,role:`group`,"aria-label":`How many?`,children:[(0,D.jsx)(`button`,{type:`button`,onClick:()=>o(e=>Math.max(t,e-1)),disabled:i<=t,"aria-label":`One fewer`,children:(0,D.jsx)(d,{size:16})}),(0,D.jsx)(`span`,{className:`qv-buy__qty`,children:i}),(0,D.jsx)(`button`,{type:`button`,onClick:()=>o(e=>e+1),"aria-label":`One more`,children:(0,D.jsx)(a,{size:16})})]}),(0,D.jsxs)(`div`,{className:`qv-buy__total`,"aria-live":`polite`,children:[(0,D.jsx)(`strong`,{children:g(n*i)}),(0,D.jsx)(`small`,{children:`${i} × ${g(n)}`})]})]}),(0,D.jsxs)(`button`,{type:`button`,className:`qv-btn qv-btn--filled qv-buy__add`,onClick:c,children:[(0,D.jsx)(s,{size:15}),` Add `,i,` to cart`]})]})}function ce({product:e,onClose:t}){let{add:n}=ae(),r=Math.max(1,Number(e?.minQty)||1),[i,a]=(0,E.useState)(0),[o,s]=(0,E.useState)({}),[c,ee]=(0,E.useState)(0),l=(0,E.useRef)(null);if(M(l,!!e),(0,E.useEffect)(()=>{if(!e)return;let n=e=>{e.key===`Escape`&&t()};return document.addEventListener(`keydown`,n),()=>document.removeEventListener(`keydown`,n)},[e,t]),(0,E.useEffect)(()=>{if(!e)return;let t=0,n=e=>{t=e.touches?.[0]?.clientY??0},r=(e,t)=>{for(let n=e;n&&n!==document.body;n=n.parentElement){let e=getComputedStyle(n).overflowY;if((e===`auto`||e===`scroll`)&&n.scrollHeight>n.clientHeight+1&&(t>0&&n.scrollTop+n.clientHeight<n.scrollHeight-1||t<0&&n.scrollTop>0))return!0;if(n===l.current)break}return!1},i=e=>{if(!l.current?.contains(e.target)){e.preventDefault();return}let n;if(e.type===`wheel`)n=e.deltaY;else{let r=e.touches?.[0]?.clientY??t;n=t-r,t=r}n!==0&&!r(e.target,n)&&e.preventDefault()};return document.addEventListener(`touchstart`,n,{passive:!0}),document.addEventListener(`touchmove`,i,{passive:!1}),document.addEventListener(`wheel`,i,{passive:!1}),()=>{document.removeEventListener(`touchstart`,n),document.removeEventListener(`touchmove`,i),document.removeEventListener(`wheel`,i)}},[e]),!e)return null;let d=e,f=r>1||d?.piece===!0,p=d?.piece===!0;function m(e,r){n(e,r),t()}let h=[d.slice||x(d)?{key:`base`,label:d.sizeLabel||`Whole`,unitPrice:d.price,min:r,pieces:f,line:e=>({...d,name:`${d.name} (${d.sizeLabel||`Whole`})`,note:p&&e<=N?F(e):void 0})}:{key:`base`,label:d.sizeLabel||`Each`,unitPrice:d.price,min:r,pieces:f,line:()=>d},d.slice!=null&&{key:`slice`,label:d.sliceLabel||`Slice`,unitPrice:d.slice,min:1,line:()=>({id:d.id+`-slice`,name:`${d.name} (${d.sliceLabel||`Slice`})`,price:d.slice,img:d.img})},x(d)&&{key:`unit`,label:d.unitLabel||`Per piece`,unitPrice:d.unit,min:1,pieces:!0,batch:!0,line:e=>({id:d.id+`-unit`,name:`${d.name} (${d.unitLabel||`Per piece`})`,price:d.unit,img:d.img,note:e<=N?F(e):void 0})}].filter(Boolean),_=h[Math.min(i,h.length-1)],y=o[_.key]??_.min,te=e=>s(t=>({...t,[_.key]:e(t[_.key]??_.min)})),b=_.key===`base`&&p||_.batch;return(0,D.jsxs)(`div`,{onClick:t,className:`qv-backdrop`,children:[(0,D.jsxs)(`div`,{ref:l,onClick:e=>e.stopPropagation(),className:`qv-modal`,role:`dialog`,"aria-modal":`true`,"aria-label":d.name,tabIndex:-1,children:[(0,D.jsx)(`button`,{type:`button`,onClick:t,"aria-label":`Close`,className:`qv-close`,children:(0,D.jsx)(u,{size:18})}),(0,D.jsxs)(`div`,{className:`qv-grid`,children:[(0,D.jsxs)(`div`,{className:`qv-image-col${d.photos?` qv-image-col--gallery`:``}`,children:[(0,D.jsx)(`img`,{src:S(d.photos?.[c]||d.img,800,800),srcSet:v(d.photos?.[c]||d.img),sizes:`(min-width: 720px) 300px, 100vw`,alt:d.name,className:`qv-image`},d.photos?.[c]||d.img),d.badge&&(0,D.jsx)(`span`,{className:`qv-badge`,children:d.badge}),d.photos&&(0,D.jsx)(`div`,{className:`qv-thumbs`,role:`group`,"aria-label":`Product photos`,children:d.photos.map((e,t)=>(0,D.jsx)(`button`,{type:`button`,className:`qv-thumb${t===c?` is-active`:``}`,onClick:()=>ee(t),"aria-label":`Photo ${t+1} of ${d.photos.length}`,"aria-pressed":t===c,children:(0,D.jsx)(`img`,{src:S(e),srcSet:v(e),sizes:`56px`,alt:``})},e))})]}),(0,D.jsxs)(`div`,{className:`qv-info-col`,children:[(0,D.jsx)(`div`,{className:`tag-badge mb-1`,style:{fontSize:`0.65rem`},children:d.category}),(0,D.jsx)(`h3`,{className:`qv-title`,children:d.name}),d.allergens?.length>0&&(0,D.jsx)(`div`,{className:`mt-2`,children:(0,D.jsx)(A,{allergens:d.allergens,verbose:!0})}),(0,D.jsx)(`p`,{className:`qv-desc`,children:w(d)}),(0,D.jsx)(`p`,{className:`qv-desc`,style:{fontSize:`0.82rem`,opacity:.85},children:`Handcrafted with the finest ingredients and freshly prepared. Please pre-order at least 1 day in advance.`}),(0,D.jsxs)(`div`,{className:`qv-options qv-options--buy`,children:[h.length>1&&(0,D.jsx)(`div`,{className:`qv-tiers`,role:`radiogroup`,"aria-label":`Choose a size`,onKeyDown:e=>{let t=h.indexOf(_),n={ArrowRight:t+1,ArrowDown:t+1,ArrowLeft:t-1,ArrowUp:t-1,Home:0,End:h.length-1}[e.key];if(n==null)return;e.preventDefault();let r=(n+h.length)%h.length;a(r),e.currentTarget.querySelectorAll(`[role="radio"]`)[r]?.focus()},children:h.map((e,t)=>(0,D.jsxs)(`button`,{type:`button`,role:`radio`,"aria-checked":e.key===_.key,tabIndex:e.key===_.key?0:-1,className:`qv-tier${e.key===_.key?` is-on`:``}`,onClick:()=>a(t),children:[(0,D.jsx)(`span`,{className:`qv-tier__label`,children:e.label}),(0,D.jsx)(`span`,{className:`qv-tier__price`,children:g(e.unitPrice)})]},e.key))}),(0,D.jsx)(L,{label:_.label,minQty:_.min,unitPrice:_.unitPrice,each:_.pieces||h.length>1?`each`:``,qty:y,setQty:te,onAdd:()=>m(_.line(y),y)},_.key),b&&y<=N&&(0,D.jsx)(I,{})]})]})]})]}),(0,D.jsx)(`style`,{children:`
        /* ── Opening motion ────────────────────────────────────────────────
           The sheet RISES and settles rather than popping: a short overshoot
           on the way up, none on the way back, which reads as something being
           lifted onto the counter. The photo lands a beat later on a slow
           settling zoom (food looks best still moving), and the text plates
           itself in order — category, name, tags, description, prices.

           Timings are deliberately short. This fires on every Add to Cart tap
           on a 120-product grid, so anything that makes a returning customer
           wait for the price rows is a tax, not a flourish. Everything the
           customer needs has settled by ~0.6s.

           All of it collapses to a plain fade under prefers-reduced-motion,
           at the end of this block. */
        @keyframes qv-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes qv-veil {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to   { opacity: 1; backdrop-filter: blur(4px); }
        }
        @keyframes qv-rise {
          from { opacity: 0; transform: translateY(30px) scale(0.93); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        /* Slow settle — starts wide and eases down, so the photo is never
           static on arrival. 1.06 is enough to read; more looks like a glitch. */
        @keyframes qv-settle {
          from { transform: scale(1.06); }
          to   { transform: scale(1); }
        }
        @keyframes qv-plate {
          from { opacity: 0; transform: translateY(9px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes qv-pop {
          0%   { opacity: 0; transform: scale(0.7); }
          60%  { opacity: 1; transform: scale(1.06); }
          100% { opacity: 1; transform: scale(1); }
        }

        .qv-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(91, 62, 54, 0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: qv-veil 0.28s ease-out;
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
          /* Overshoot only on the rise (the 1.2 in the curve). */
          animation: qv-rise 0.42s cubic-bezier(0.22, 1.2, 0.36, 1);
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
          /* The settling zoom starts at 1.06, so the column has to clip it —
             and it needs the image's own radius, or the rounded corners scale
             out past the square column and the corners flash sharp. */
          overflow: hidden;
          border-radius: 16px 16px 0 0;
        }
        .qv-image {
          width: 100%;
          aspect-ratio: 4/3;
          object-fit: cover;
          display: block;
          border-radius: 16px 16px 0 0;
          animation: qv-settle 1.1s cubic-bezier(0.16, 1, 0.3, 1) both;
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
          animation: qv-pop 0.4s cubic-bezier(0.34, 1.4, 0.5, 1) 0.24s backwards;
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
        /* Plated in reading order. Driven off nth-child rather than a class per
           block, so the optional allergen row can come and go without the
           delays needing to be renumbered. backwards holds each child hidden
           through its delay — without it they all flash in at once first.
           The step is capped so a long product never trails on. */
        .qv-info-col > * {
          animation: qv-plate 0.34s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }
        .qv-info-col > *:nth-child(1) { animation-delay: 0.10s; }
        .qv-info-col > *:nth-child(2) { animation-delay: 0.14s; }
        /* A product with several photos: the frame shows the WHOLE picture
           (contain, never cover) with the thumbnails under it. These are square
           shots with lettering in the corners, which any crop cuts through. */
        .qv-image-col--gallery {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 0.75rem;
          background: var(--cc-blush-soft);
        }
        .qv-image-col--gallery .qv-image {
          width: 100%;
          height: min(78vw, 44vh);
          aspect-ratio: auto;
          object-fit: contain;
          border-radius: 12px;
        }
        .qv-thumbs { display: flex; gap: 0.5rem; }
        .qv-thumb {
          width: 56px;
          height: 56px;
          padding: 0;
          border: 2px solid transparent;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity var(--cc-dur) var(--cc-ease), border-color var(--cc-dur) var(--cc-ease);
        }
        .qv-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .qv-thumb:hover { opacity: 1; }
        .qv-thumb.is-active { opacity: 1; border-color: var(--cc-rose-deep); }
        .qv-thumb:focus-visible { outline: 2px solid var(--cc-rose-deep); outline-offset: 2px; }

        .qv-info-col > *:nth-child(3) { animation-delay: 0.18s; }
        .qv-info-col > *:nth-child(4) { animation-delay: 0.22s; }
        .qv-info-col > *:nth-child(n+5) { animation-delay: 0.26s; }

        /* On desktop the photo must NOT decide how tall the modal is. It used to:
           height: 100% on an <img> inside a grid row of indefinite height
           resolves to auto, so the image fell back to its own aspect ratio and
           a portrait photo stretched the row far past what the text needed —
           leaving a tall white gap under the price rows, while a landscape
           photo left none. Same product type, two different modal heights.

           Taking the image out of flow (absolute + inset) makes the INFO column
           the only thing that sets the height, so every product of the same
           shape opens at the same size and the photo crops to fit. */
        @media (min-width: 720px) {
          .qv-grid { grid-template-columns: 5fr 7fr; }
          .qv-image-col { min-height: 380px; border-radius: 16px 0 0 16px; }
          .qv-image {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            aspect-ratio: auto;
            object-fit: cover;
            border-radius: 16px 0 0 16px;
          }
          /* Back in flow, so it can sit above its thumbnails: a square the
             width of the column, which the 380px minimum already allows for. */
          .qv-image-col--gallery .qv-image {
            position: static;
            height: auto;
            aspect-ratio: 1 / 1;
            border-radius: 12px;
          }
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

        /* ONE bordered price table with divided rows.
           Each size used to be its own card — own border, own shadow, own gap,
           label stacked above the price. Three sizes then filled the modal and
           pushed the Add buttons below the fold on a phone. As a table the same
           three sizes read at a glance and take about half the height: name and
           price share one baseline, the action sits on the right, and the rule
           between rows does the separating that the gaps used to. */
        .qv-options {
          margin-top: 0.9rem;
          border: 1px solid var(--cc-border);
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
        }
        .qv-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.7rem;
          padding: 0.5rem 0.75rem;
        }
        .qv-option + .qv-option,
        .qv-batch-hint { border-top: 1px solid var(--cc-border); }

        /* Label and price on ONE line, sharing a baseline. */
        .qv-option__info {
          min-width: 0;
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .qv-option__label {
          font-size: 0.8rem;
          color: var(--cc-cocoa);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .qv-option__min {
          background: var(--cc-blush-soft);
          color: var(--cc-rose-deep);
          border-radius: 999px;
          padding: 1px 6px;
          font-size: 0.6rem;
          font-weight: 700;
        }
        .qv-option__price {
          font-size: 1rem;
          color: var(--cc-rose);
          font-weight: 700;
          line-height: 1.2;
          display: flex;
          align-items: baseline;
          gap: 0.3rem;
          font-variant-numeric: lining-nums tabular-nums;
        }
        .qv-option__sub {
          font-size: 0.66rem;
          font-weight: 600;
          color: var(--cc-cocoa-soft);
        }
        .qv-option .qv-btn {
          flex: 0 0 auto;
          min-width: 0;
          padding: 0.4rem 0.9rem;
          font-size: 0.8rem;
        }

        /* One quiet line under the loose-piece row. The paragraph this replaced
           was four lines tall and out-shouted the prices it sat between; the
           full sentence now rides on the add-to-cart toast instead. */
        .qv-batch-hint {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin: 0;
          padding: 0.45rem 0.85rem;
          background: var(--cc-cream);
          border-top: 1px dashed var(--cc-blush-soft);
          color: var(--cc-cocoa-soft);
          font-size: 0.73rem;
          line-height: 1.3;
        }
        .qv-batch-hint svg {
          flex: 0 0 auto;
          color: var(--cc-rose);
        }

        /* Per-piece tier: label/price on top, then "How many?" + stepper + a
           live-total Add button. Stacks so the row never gets cramped. */
        /* The counted row stays on ONE line too: label + price on the left,
           stepper and Add on the right. It only wraps when there genuinely
           isn't room, rather than always stacking as it did before. */
        .qv-option--qty {
          flex-wrap: wrap;
          row-gap: 0.5rem;
        }
        .qv-qty { margin-left: auto; }
        /* "How many?" is dropped visually — a − 1 + control says it — but kept
           for screen readers, which otherwise meet three unlabelled buttons. */
        .qv-qty__ask {
          position: absolute;
          width: 1px; height: 1px;
          padding: 0; margin: -1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
        }
        .qv-qty__row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;
        }
        .qv-qty__stepper {
          display: inline-flex;
          align-items: center;
          background: #fff;
          border: 1px solid var(--cc-rose-soft);
          border-radius: 999px;
          padding: 0.12rem;
          flex: 0 0 auto;
        }
        .qv-qty__stepper button {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--cc-rose);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background var(--cc-dur) var(--cc-ease),
                      transform var(--cc-dur) var(--cc-ease);
        }
        .qv-qty__stepper button:hover:not(:disabled) { background: var(--cc-blush); transform: scale(1.1); }
        .qv-qty__stepper button:active:not(:disabled) { transform: scale(0.9); transition-duration: var(--cc-dur-fast); }
        .qv-qty__stepper button:disabled { opacity: 0.35; cursor: not-allowed; }
        .qv-qty__val {
          min-width: 22px;
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
          transition: background var(--cc-dur) var(--cc-ease),
                      color var(--cc-dur) var(--cc-ease),
                      transform var(--cc-dur) var(--cc-ease),
                      box-shadow var(--cc-dur) var(--cc-ease);
        }
        /* These are the buttons the whole modal exists to get tapped, so they
           carry the same press as every other button on the site. */
        .qv-btn:active {
          transform: translateY(0) scale(0.97);
          transition-duration: var(--cc-dur-fast);
        }
        .qv-btn:focus-visible {
          outline: 2px solid var(--cc-rose-deep);
          outline-offset: 2px;
        }
        .qv-btn--outline {
          background: #fff;
          color: var(--cc-rose);
          border: 1.5px solid var(--cc-rose);
        }
        .qv-btn--outline:hover {
          background: var(--cc-blush);
          transform: translateY(-1px);
        }
        .qv-btn--filled:active { box-shadow: 0 2px 6px rgba(207, 62, 99, 0.3); }
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


        /* Vestibular disorders: a rising, zooming, staggering sheet is exactly
           the pattern that triggers them. Everything above collapses to one
           quiet fade — the modal still announces itself, nothing travels. */
        @media (prefers-reduced-motion: reduce) {
          .qv-backdrop { animation: qv-fade 0.2s ease-out; }
          .qv-modal { animation: qv-fade 0.2s ease-out; }
          .qv-image,
          .qv-badge,
          .qv-info-col > * { animation: none; }
          .qv-btn:hover,
          .qv-btn:active,
          .qv-btn--outline:hover,
          .qv-btn--filled:hover,
          .qv-qty__stepper button:hover:not(:disabled),
          .qv-qty__stepper button:active:not(:disabled) { transform: none; }
        }
      `})]})}var R=[`All Products`,`Cheesecakes`,`Milk Cakes`,`Sponge Cakes`,`Cookies`,`Cupcakes`,`Bakes`,`Cake Pops`,`Cakesicles`,`Dessert Cups`,`Platters`,`Drinks`,`Special Gifts`],z=12,B={"Cake Pops":e=>e.group===`Cake Pops`,Cakesicles:e=>e.group===`Cakesicles`},V=(e,t)=>t===`All Products`?!0:B[t]?B[t](e):e.category===t,H=[{id:`all`,label:`All Prices`,test:()=>!0},{id:`0-200`,label:`₹0 – ₹200`,test:e=>C(e)<=200},{id:`200-500`,label:`₹200 – ₹500`,test:e=>C(e)>200&&C(e)<=500},{id:`500-1000`,label:`₹500 – ₹1000`,test:e=>C(e)>500&&C(e)<=1e3},{id:`1000+`,label:`₹1000+`,test:e=>C(e)>1e3}];function U({checked:e,onChange:t,label:n,name:r}){return(0,D.jsxs)(`label`,{className:`cc-shop-radio`,children:[(0,D.jsx)(`input`,{type:`radio`,name:r,checked:e,onChange:t,className:`cc-shop-radio__input`}),(0,D.jsx)(`span`,{className:`cc-shop-radio__dot`,"aria-hidden":!0}),(0,D.jsx)(`span`,{children:n})]})}function W(){ie({title:`Shop`,description:`Order from our full menu — cheesecakes, milk cakes, cookies, cupcakes, dessert cups and drinks. Pay by UPI or cash.`}),se(`shop-products`,{"@context":`https://schema.org`,"@type":`ItemList`,name:`Cake & Crumb — Shop`,numberOfItems:b.length,itemListElement:b.slice(0,30).map((e,t)=>({"@type":`ListItem`,position:t+1,item:{"@type":`Product`,name:e.name,description:w(e),category:e.category,image:typeof window<`u`?new URL(S(e.img,800,800),window.location.origin).href:S(e.img,800,800),brand:{"@type":`Brand`,name:`Cake & Crumb`},offers:{"@type":`Offer`,price:_(e),priceCurrency:`INR`,availability:`https://schema.org/InStock`}}}))});let[e,r]=n(),c=e.get(`category`),h=e.get(`product`),[x,O]=(0,E.useState)(c&&R.includes(c)?c:`All Products`),[k,j]=(0,E.useState)(`all`),[M,N]=(0,E.useState)(`featured`),[P,F]=(0,E.useState)(z),[I,L]=(0,E.useState)(null),[W,G]=(0,E.useState)(!1),[K,le]=(0,E.useState)(null),ue=(x===`All Products`?0:1)+(k===`all`?0:1),{items:de,count:q,subtotal:J,add:fe,increment:pe,decrement:me,remove:he,clear:ge}=ae(),Y=(0,E.useMemo)(()=>{let e=H.find(e=>e.id===k)?.test??(()=>!0),t=b.filter(t=>V(t,x)&&e(t));return M===`lowhigh`?t=[...t].sort((e,t)=>C(e)-C(t)):M===`highlow`&&(t=[...t].sort((e,t)=>C(t)-C(e))),t},[x,k,M]),X=Y.slice(0,P),Z=Y.length-X.length,_e=x!==`All Products`&&M===`featured`&&!B[x],ve=(0,E.useMemo)(()=>{if(!_e)return[{name:null,items:X}];let e=[];for(let t of X){let n=t.group||null,r=e[e.length-1];r&&r.name===n?r.items.push(t):e.push({name:n,items:[t]})}return e},[_e,X]);(0,E.useEffect)(()=>{c&&R.includes(c)&&O(c)},[c]),(0,E.useEffect)(()=>{F(z)},[x,k,M]);let Q=(0,E.useRef)(null);(0,E.useEffect)(()=>{if(!h){Q.current=null;return}if(Q.current===h)return;let t=b.find(e=>e.id===h);if(!t)return;Q.current=h,j(`all`),O(e=>V(t,e)?e:t.category),le(h);let n=new URLSearchParams(e);n.delete(`product`),r(n,{replace:!0})},[h,e,r]);let $=(0,E.useRef)(null);(0,E.useEffect)(()=>{if(!K){$.current=null;return}if($.current===K)return;let e=Y.findIndex(e=>e.id===K);if(e===-1)return;if(e>=P){F(Math.ceil((e+1)/z)*z);return}$.current=K,document.getElementById(`product-${K}`)?.scrollIntoView({behavior:`smooth`,block:`center`});let t=setTimeout(()=>le(null),2600);return()=>clearTimeout(t)},[K,Y,P]);let ye=()=>{O(`All Products`),j(`all`)},be=(0,E.useRef)(null);function xe({everyScreen:e=!1}={}){typeof window>`u`||!e&&window.innerWidth>=992||(G(!1),requestAnimationFrame(()=>{let e=be.current;if(!e)return;let t=parseInt(getComputedStyle(document.documentElement).getPropertyValue(`--cc-header-h`),10)||82,n=e.getBoundingClientRect().top+window.scrollY-t-12;window.scrollTo({top:n,behavior:`smooth`})}))}let Se=e=>{O(e),xe()},Ce=e=>{j(e),xe()};return(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(`section`,{className:`cc-shop-hero`,"data-no-reveal":!0,children:(0,D.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,D.jsxs)(`div`,{className:`row g-4 g-lg-5 align-items-center`,children:[(0,D.jsxs)(`div`,{className:`col-lg-6 text-center text-lg-start`,children:[(0,D.jsx)(`span`,{className:`eyebrow mb-3 d-inline-flex`,children:`Shop Our Treats`}),(0,D.jsxs)(`h1`,{className:`cc-shop-hero__title`,children:[`Handcrafted`,(0,D.jsx)(`br`,{}),`Just for You`]}),(0,D.jsx)(re,{width:50}),(0,D.jsx)(`p`,{className:`cc-shop-hero__lede`,children:`Cheesecakes, milk cakes, sponge cakes, cookies, cupcakes, bakes, dessert cups and drinks — every one of them made after you order it.`})]}),(0,D.jsx)(`div`,{className:`col-lg-6`,children:(0,D.jsx)(`img`,{src:S(y.heroShop,1e3,800),alt:`Cupcakes on tiered display stands`,className:`cc-shop-hero__img`,fetchPriority:`high`})})]})})}),(0,D.jsx)(`section`,{className:`cc-shop-main`,children:(0,D.jsx)(`div`,{className:`container py-4`,children:(0,D.jsxs)(`div`,{className:`row g-4`,children:[(0,D.jsx)(`aside`,{className:`col-lg-3 col-xl-2`,children:(0,D.jsxs)(`div`,{className:`cc-shop-filter`,children:[(0,D.jsx)(`h2`,{className:`cc-shop-filter__heading`,children:`Filter By`}),(0,D.jsxs)(`button`,{type:`button`,className:`cc-shop-filter__toggle`,onClick:()=>G(e=>!e),"aria-expanded":W,children:[(0,D.jsxs)(`span`,{className:`cc-shop-filter__toggle-label`,children:[(0,D.jsx)(l,{size:15}),`Filters`,ue>0&&(0,D.jsx)(`span`,{className:`cc-shop-filter__count`,children:ue})]}),(0,D.jsx)(m,{size:18,className:`cc-shop-filter__chevron`+(W?` is-open`:``)})]}),(0,D.jsxs)(`div`,{className:`cc-shop-filter__body`+(W?` is-open`:``),children:[(0,D.jsxs)(`div`,{className:`cc-shop-filter__group`,role:`radiogroup`,"aria-label":`Category`,children:[(0,D.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Category`}),R.map(e=>(0,D.jsx)(U,{name:`shop-category`,label:e,checked:x===e,onChange:()=>Se(e)},e))]}),(0,D.jsxs)(`div`,{className:`cc-shop-filter__group`,role:`radiogroup`,"aria-label":`Price range`,children:[(0,D.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Price Range`}),H.map(e=>(0,D.jsx)(U,{name:`shop-price`,label:e.label,checked:k===e.id,onChange:()=>Ce(e.id)},e.id))]}),(0,D.jsx)(`button`,{type:`button`,className:`cc-shop-filter__clear`,onClick:ye,children:`Clear Filters`})]})]})}),(0,D.jsxs)(`div`,{className:`col-lg-6 col-xl-7`,ref:be,children:[(0,D.jsxs)(`div`,{className:`cc-shop-toolbar`,children:[(0,D.jsxs)(`span`,{className:`cc-shop-toolbar__count`,children:[`Showing `,X.length,` of `,Y.length,` results`]}),(0,D.jsxs)(`label`,{className:`cc-shop-toolbar__sort`,children:[(0,D.jsx)(`span`,{children:`Sort by:`}),(0,D.jsxs)(`select`,{value:M,onChange:e=>N(e.target.value),children:[(0,D.jsx)(`option`,{value:`featured`,children:`Featured`}),(0,D.jsx)(`option`,{value:`lowhigh`,children:`Price: low to high`}),(0,D.jsx)(`option`,{value:`highlow`,children:`Price: high to low`})]})]})]}),(0,D.jsxs)(`p`,{className:`cc-shop-note cc-shop-note--lead`,children:[(0,D.jsx)(t,{size:12}),` Freshly baked to order — please order at least 1 day in advance.`]}),x===`Cupcakes`&&(0,D.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,D.jsx)(i,{size:12}),` Cupcakes come as a box of 6, or buy them by the piece (minimum 2) — tap any cupcake to choose how many. Floral or extra decoration is `,g(20),` more — mention it in your order notes.`]}),x===`Cake Pops`&&(0,D.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,D.jsx)(i,{size:12}),` Cake pops come as a box of 6, or by the piece (minimum 2) — tap any flavour to choose how many. A box of 12 is simply two sixes.`]}),x===`Cookies`&&(0,D.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,D.jsx)(i,{size:12}),` Boxes of 6 and 12, or single cookies from `,g(T.Cookies[0].from),` — tap any cookie to pick a size. Singles are baked into the day's batch, so a box is still the better value.`]}),x===`Bakes`&&(0,D.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,D.jsx)(i,{size:12}),` Brownies and blondies also come in `,T.Brownies.map(e=>e.label).join(` and `),` — from `,g(T.Brownies[0].from),` and `,g(T.Brownies[1].from),`. Ask on WhatsApp for those.`]}),(0,D.jsxs)(`div`,{className:`cc-shop-grid`,children:[ve.map(e=>(0,D.jsxs)(E.Fragment,{children:[e.name&&(0,D.jsx)(`h3`,{className:`cc-shop-group`,children:e.name}),e.items.map(e=>(0,D.jsxs)(`article`,{id:`product-${e.id}`,className:`cc-product-card`+(e.id===K?` is-flash`:``),children:[(0,D.jsx)(`button`,{type:`button`,onClick:()=>L(e),"aria-label":`View ${e.name}`,className:`cc-product-card__img-btn`,children:(0,D.jsx)(`img`,{src:S(e.img,500,500),srcSet:v(e.img),sizes:`(min-width: 768px) 240px, 46vw`,alt:e.name,loading:`lazy`})}),(0,D.jsxs)(`div`,{className:`cc-product-card__body`,children:[(0,D.jsxs)(`div`,{className:`cc-product-card__cat`,children:[e.category,(0,D.jsx)(A,{allergens:e.allergens})]}),(0,D.jsx)(`h3`,{className:`cc-product-card__name`,children:(0,D.jsx)(`button`,{type:`button`,className:`cc-product-card__name-btn`,onClick:()=>L(e),title:e.name,children:e.name})}),(0,D.jsx)(`div`,{className:`cc-product-card__price`,children:ne(e)?(0,D.jsxs)(D.Fragment,{children:[g(e.slice),(0,D.jsx)(`span`,{className:`cc-product-card__price-sub`,children:e.sliceLabel})]}):te(e)}),(0,D.jsxs)(`button`,{className:`cc-product-card__add`,"aria-label":e.slice?`Choose a size for ${e.name}`:`Add ${e.name} to cart`,onClick:()=>{e.slice?L(e):fe(e)},children:[(0,D.jsx)(s,{size:12}),` Add to Cart`]})]})]},e.id))]},e.name||`_`)),Y.length===0&&(0,D.jsxs)(`div`,{className:`cc-shop-empty`,children:[(0,D.jsx)(`p`,{className:`mb-2`,children:`No products match your filters.`}),(0,D.jsx)(`button`,{type:`button`,className:`cc-shop-empty__clear`,onClick:ye,children:`Clear filters`})]})]}),Z>0&&(0,D.jsx)(`div`,{className:`cc-shop-more`,children:(0,D.jsxs)(`button`,{type:`button`,className:`cc-shop-more__btn`,onClick:()=>F(e=>e+z),children:[`Show `,Math.min(Z,z),` more`,(0,D.jsxs)(`span`,{className:`cc-shop-more__n`,children:[Z,` left`]})]})})]}),(0,D.jsx)(`aside`,{className:`col-lg-3`,children:(0,D.jsxs)(`div`,{className:`cc-shop-cart`,children:[(0,D.jsxs)(`div`,{className:`cc-shop-cart__panel`,children:[(0,D.jsxs)(`div`,{className:`cc-shop-cart__head`,children:[(0,D.jsxs)(`span`,{className:`cc-shop-cart__title`,children:[`Your Cart (`,q,`)`]}),q>0&&(0,D.jsx)(`button`,{type:`button`,className:`cc-shop-cart__clear`,onClick:ge,"aria-label":`Clear cart`,children:(0,D.jsx)(u,{size:16})})]}),q===0&&(0,D.jsx)(`p`,{className:`cc-shop-cart__empty`,children:`Your cart is empty.`}),de.map(e=>(0,D.jsxs)(`div`,{className:`cc-shop-cart__item`,children:[(0,D.jsx)(`img`,{src:S(e.img,200,200),srcSet:v(e.img),sizes:`64px`,alt:``,className:`cc-shop-cart__item-img`}),(0,D.jsxs)(`div`,{className:`cc-shop-cart__item-body`,children:[(0,D.jsxs)(`div`,{className:`cc-shop-cart__item-top`,children:[(0,D.jsx)(`strong`,{className:`cc-shop-cart__item-name`,children:e.name}),(0,D.jsx)(`button`,{type:`button`,onClick:()=>he(e.id),"aria-label":`Remove`,className:`cc-shop-cart__item-remove`,children:(0,D.jsx)(u,{size:14})})]}),(0,D.jsx)(`div`,{className:`cc-shop-cart__item-price`,children:g(e.price)}),(0,D.jsxs)(`div`,{className:`cc-shop-cart__qty`,children:[(0,D.jsx)(`button`,{className:`qty-btn`,onClick:()=>me(e.id),"aria-label":`Decrease`,children:(0,D.jsx)(d,{size:12})}),(0,D.jsx)(`span`,{children:e.qty}),(0,D.jsx)(`button`,{className:`qty-btn`,onClick:()=>pe(e.id),"aria-label":`Increase`,children:(0,D.jsx)(a,{size:12})})]})]})]},e.id)),(0,D.jsxs)(`div`,{className:`cc-shop-cart__subtotal`,children:[(0,D.jsx)(`span`,{children:`SUBTOTAL`}),(0,D.jsx)(`strong`,{children:g(J)})]}),(0,D.jsx)(oe,{items:de,subtotal:J,compact:!0}),(0,D.jsx)(`p`,{className:`cc-shop-cart__note`,children:`Delivery calculated at checkout. Self-pickup is always free.`}),(0,D.jsxs)(o,{to:`/cart`,className:`btn-rose w-100 justify-content-center mb-2`,style:{pointerEvents:q===0?`none`:`auto`,opacity:q===0?.5:1},tabIndex:q===0?-1:void 0,"aria-disabled":q===0,children:[(0,D.jsx)(s,{size:14}),` View Cart`]}),(0,D.jsxs)(o,{to:`/checkout`,className:`btn-outline-rose w-100 justify-content-center`,style:{pointerEvents:q===0?`none`:`auto`,opacity:q===0?.5:1},tabIndex:q===0?-1:void 0,"aria-disabled":q===0,children:[(0,D.jsx)(p,{size:14}),` Checkout`]})]}),(0,D.jsxs)(`div`,{className:`cc-shop-special`,children:[(0,D.jsx)(`span`,{className:`cc-shop-special__icon`,children:(0,D.jsx)(i,{size:16})}),(0,D.jsx)(`h2`,{className:`cc-shop-special__title`,children:`Need Something Special?`}),(0,D.jsx)(`p`,{className:`cc-shop-special__text`,children:`We love creating custom treats for your special moments.`}),(0,D.jsx)(o,{to:`/contact`,className:`cc-shop-special__btn`,children:`Place Custom Order`})]})]})})]})})}),(0,D.jsx)(`section`,{className:`cc-shop-promise`,children:(0,D.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,D.jsx)(`div`,{className:`feature-row`,children:[{Icon:i,title:`Handcrafted with Love`,text:`Made in small batches with care.`},{Icon:f,title:`Made to Order`,text:`Every treat is made to order just for you.`},{Icon:ee,title:`Packed with Care`,text:`Every order is boxed carefully for pickup or delivery.`}].map((e,t)=>(0,D.jsxs)(`div`,{className:`feature-cell text-center cc-shop-promise__cell`,children:[(0,D.jsx)(`span`,{className:`cc-features-card__icon cc-features-card__icon--lg`,children:(0,D.jsx)(e.Icon,{size:22})}),(0,D.jsx)(`div`,{className:`cc-features-card__heading mt-3`,children:e.title}),(0,D.jsx)(`p`,{className:`cc-features-card__text mt-1`,children:e.text})]},t))})})}),q>0&&(0,D.jsxs)(o,{to:`/cart`,className:`shop-cart-pill`,children:[(0,D.jsx)(s,{size:15}),(0,D.jsxs)(`span`,{children:[(0,D.jsx)(`strong`,{children:q}),` `,q===1?`item`:`items`,` · `,g(J)]}),(0,D.jsx)(`span`,{className:`shop-cart-pill__cta`,children:`View cart`})]}),(0,D.jsx)(ce,{product:I,onClose:()=>L(null)},I?.id)]})}export{W as default};