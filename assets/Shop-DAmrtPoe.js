import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{C as t,Et as n,F as r,St as i,Z as a,at as o,ft as s,gt as c,it as l,mt as u,ot as d,q as f,r as p,v as m,y as h,z as g}from"./react-vendor-DX2Sh_E-.js";import{t as _}from"./format-XQan9feh.js";import{i as v,n as y,r as b}from"./images-CjTmwZHg.js";import{F as x,I as S,L as ee,M as te,N as ne,P as C,R as w,V as T,j as E,n as re,r as ie}from"./index-B5vv3Isd.js";import{t as ae}from"./OfferGift-BP4tD-CT.js";import{t as oe}from"./useJsonLd-BV0_tS9U.js";var D=e(n(),1),O=u(),k={eggless:{label:`Eggless`,icon:`🌱`,kind:`free`},vegan:{label:`Vegan`,icon:`🌿`,kind:`free`},"gluten-free":{label:`Gluten-Free`,icon:`🌾`,kind:`free`},"contains-nuts":{label:`Contains Nuts`,icon:`🌰`,kind:`contains`},"contains-egg":{label:`Contains Egg`,icon:`🥚`,kind:`contains`},"contains-dairy":{label:`Contains Dairy`,icon:`🥛`,kind:`contains`},"contains-gluten":{label:`Contains Gluten`,icon:`🌾`,kind:`contains`},"eggless-option":{label:`Eggless on request`,icon:`🌱`,kind:`option`}},A={free:{bg:`rgba(34, 139, 81, 0.10)`,fg:`#1d6f3a`,border:`rgba(34, 139, 81, 0.35)`},contains:{bg:`rgba(184, 134, 11, 0.12)`,fg:`#8a5d05`,border:`rgba(184, 134, 11, 0.35)`},option:{bg:`rgba(224, 97, 122, 0.08)`,fg:`var(--cc-rose-deep)`,border:`rgba(224, 97, 122, 0.4)`}};function se({allergens:e,verbose:t=!1,size:n=`sm`}){if(!Array.isArray(e)||e.length===0)return null;let r=[`eggless`,`vegan`,`gluten-free`,`contains-nuts`],i=t?e:e.filter(e=>r.includes(e));if(i.length===0)return null;let a=n===`lg`?`0.4rem 0.7rem`:`0.18rem 0.5rem`,o=n===`lg`?`0.78rem`:`0.66rem`;return(0,O.jsx)(`div`,{className:`d-flex flex-wrap`,style:{gap:4},children:i.map(e=>{let t=k[e];if(!t)return null;let n=A[t.kind];return(0,O.jsxs)(`span`,{title:t.label,style:{display:`inline-flex`,alignItems:`center`,gap:3,fontSize:o,fontWeight:600,letterSpacing:`0.02em`,color:n.fg,background:n.bg,border:`1px solid ${n.border}`,padding:a,borderRadius:999,lineHeight:1.1,whiteSpace:`nowrap`},children:[(0,O.jsx)(`span`,{"aria-hidden":!0,style:{fontSize:`0.9em`},children:t.icon}),t.label]},e)})})}var j=3,M=`Small orders bake with the day’s batch`,N=e=>e===1?`We don’t bake a tray for one — yours joins the day’s batch of this flavour.`:`Small orders join the day’s batch of this flavour.`;function P(){return(0,O.jsxs)(`p`,{className:`qv-batch-hint`,children:[(0,O.jsx)(g,{size:12}),M]})}function ce({product:e,onClose:t}){let{add:n}=T(),r=Math.max(1,Number(e?.minQty)||1),[i,c]=(0,D.useState)(r),[l,u]=(0,D.useState)(1),[d,p]=(0,D.useState)(0),m=(0,D.useRef)(null);if((0,D.useEffect)(()=>{if(!e)return;let n=e=>{e.key===`Escape`&&t()};return document.addEventListener(`keydown`,n),()=>document.removeEventListener(`keydown`,n)},[e,t]),(0,D.useEffect)(()=>{if(!e)return;let t=e=>{m.current?.contains(e.target)||e.preventDefault()};return document.addEventListener(`touchmove`,t,{passive:!1}),document.addEventListener(`wheel`,t,{passive:!1}),()=>{document.removeEventListener(`touchmove`,t),document.removeEventListener(`wheel`,t)}},[e]),!e)return null;let h=e,g=r>1||h?.piece===!0,y=h?.piece===!0;function x(e,r){n(e,r),t()}return(0,O.jsxs)(`div`,{role:`dialog`,"aria-modal":`true`,"aria-label":h.name,onClick:t,className:`qv-backdrop`,children:[(0,O.jsxs)(`div`,{ref:m,onClick:e=>e.stopPropagation(),className:`qv-modal`,children:[(0,O.jsx)(`button`,{onClick:t,"aria-label":`Close`,className:`qv-close`,children:(0,O.jsx)(s,{size:18})}),(0,O.jsxs)(`div`,{className:`qv-grid`,children:[(0,O.jsxs)(`div`,{className:`qv-image-col${h.photos?` qv-image-col--gallery`:``}`,children:[(0,O.jsx)(`img`,{src:v(h.photos?.[d]||h.img,800,800),srcSet:b(h.photos?.[d]||h.img),sizes:`(min-width: 720px) 300px, 100vw`,alt:h.name,className:`qv-image`},h.photos?.[d]||h.img),h.badge&&(0,O.jsx)(`span`,{className:`qv-badge`,children:h.badge}),h.photos&&(0,O.jsx)(`div`,{className:`qv-thumbs`,role:`group`,"aria-label":`Product photos`,children:h.photos.map((e,t)=>(0,O.jsx)(`button`,{type:`button`,className:`qv-thumb${t===d?` is-active`:``}`,onClick:()=>p(t),"aria-label":`Photo ${t+1} of ${h.photos.length}`,"aria-pressed":t===d,children:(0,O.jsx)(`img`,{src:v(e),srcSet:b(e),sizes:`56px`,alt:``})},e))})]}),(0,O.jsxs)(`div`,{className:`qv-info-col`,children:[(0,O.jsx)(`div`,{className:`tag-badge mb-1`,style:{fontSize:`0.65rem`},children:h.category}),(0,O.jsx)(`h3`,{className:`qv-title`,children:h.name}),h.allergens?.length>0&&(0,O.jsx)(`div`,{className:`mt-2`,children:(0,O.jsx)(se,{allergens:h.allergens,verbose:!0})}),(0,O.jsx)(`p`,{className:`qv-desc`,children:ne(h)}),(0,O.jsx)(`p`,{className:`qv-desc`,style:{fontSize:`0.82rem`,opacity:.85},children:`Handcrafted with the finest ingredients and freshly prepared. Please pre-order at least 1 day in advance.`}),h.slice?(0,O.jsxs)(`div`,{className:`qv-options`,children:[(0,O.jsxs)(`div`,{className:`qv-option${g?` qv-option--qty`:``}`,children:[(0,O.jsxs)(`div`,{className:`qv-option__info`,children:[(0,O.jsxs)(`div`,{className:`qv-option__label`,children:[h.sizeLabel||`Whole`,g&&(0,O.jsxs)(`span`,{className:`qv-option__min`,children:[`Min `,r]})]}),(0,O.jsxs)(`div`,{className:`qv-option__price`,children:[_(h.price),g&&(0,O.jsx)(`span`,{className:`qv-option__sub`,children:`each`})]})]}),g?(0,O.jsxs)(`div`,{className:`qv-qty`,children:[(0,O.jsx)(`span`,{className:`qv-qty__ask`,children:`How many?`}),(0,O.jsxs)(`div`,{className:`qv-qty__row`,children:[(0,O.jsxs)(`div`,{className:`qv-qty__stepper`,children:[(0,O.jsx)(`button`,{type:`button`,onClick:()=>c(e=>Math.max(r,e-1)),disabled:i<=r,"aria-label":`One fewer`,children:(0,O.jsx)(f,{size:13})}),(0,O.jsx)(`span`,{className:`qv-qty__val`,"aria-live":`polite`,children:i}),(0,O.jsx)(`button`,{type:`button`,onClick:()=>c(e=>e+1),"aria-label":`One more`,children:(0,O.jsx)(a,{size:13})})]}),(0,O.jsxs)(`button`,{className:`qv-btn qv-btn--filled qv-qty__add`,onClick:()=>x({...h,name:`${h.name} (${h.sizeLabel||`Whole`})`,note:y&&i<=j?N(i):void 0},i),children:[(0,O.jsx)(o,{size:13}),` Add `,i,` — `,_(h.price*i)]})]})]}):(0,O.jsxs)(`button`,{className:`qv-btn qv-btn--filled`,onClick:()=>x({...h,name:`${h.name} (${h.sizeLabel||`Whole`})`},r),children:[(0,O.jsx)(o,{size:13}),` Add`]})]}),y&&i<=j&&(0,O.jsx)(P,{}),(0,O.jsxs)(`div`,{className:`qv-option`,children:[(0,O.jsxs)(`div`,{className:`qv-option__info`,children:[(0,O.jsx)(`div`,{className:`qv-option__label`,children:h.sliceLabel||`Slice`}),(0,O.jsx)(`div`,{className:`qv-option__price`,children:_(h.slice)})]}),(0,O.jsxs)(`button`,{className:`qv-btn qv-btn--outline`,onClick:()=>x({id:h.id+`-slice`,name:`${h.name} (${h.sliceLabel||`Slice`})`,price:h.slice,img:h.img}),children:[(0,O.jsx)(o,{size:13}),` Add`]})]}),C(h)&&(0,O.jsxs)(`div`,{className:`qv-option qv-option--qty`,children:[(0,O.jsxs)(`div`,{className:`qv-option__info`,children:[(0,O.jsx)(`div`,{className:`qv-option__label`,children:h.unitLabel||`Per piece`}),(0,O.jsxs)(`div`,{className:`qv-option__price`,children:[_(h.unit),(0,O.jsx)(`span`,{className:`qv-option__sub`,children:`each`})]})]}),(0,O.jsxs)(`div`,{className:`qv-qty`,children:[(0,O.jsx)(`span`,{className:`qv-qty__ask`,children:`How many?`}),(0,O.jsxs)(`div`,{className:`qv-qty__row`,children:[(0,O.jsxs)(`div`,{className:`qv-qty__stepper`,children:[(0,O.jsx)(`button`,{type:`button`,onClick:()=>u(e=>Math.max(1,e-1)),disabled:l<=1,"aria-label":`One fewer`,children:(0,O.jsx)(f,{size:13})}),(0,O.jsx)(`span`,{className:`qv-qty__val`,"aria-live":`polite`,children:l}),(0,O.jsx)(`button`,{type:`button`,onClick:()=>u(e=>e+1),"aria-label":`One more`,children:(0,O.jsx)(a,{size:13})})]}),(0,O.jsxs)(`button`,{className:`qv-btn qv-btn--filled qv-qty__add`,onClick:()=>x({id:h.id+`-unit`,name:`${h.name} (${h.unitLabel||`Per piece`})`,price:h.unit,img:h.img,note:l<=j?N(l):void 0},l),children:[(0,O.jsx)(o,{size:13}),` Add `,l,` — `,_(h.unit*l)]})]})]})]}),C(h)&&l<=j&&(0,O.jsx)(P,{})]}):(0,O.jsx)(`div`,{className:`qv-actions`,children:(0,O.jsxs)(`button`,{className:`qv-btn qv-btn--filled w-100`,onClick:()=>x(h),children:[(0,O.jsx)(o,{size:13}),` Add to Cart — `,_(h.price)]})})]})]})]}),(0,O.jsx)(`style`,{children:`
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
      `})]})}var F=[`All Products`,`Cheesecakes`,`Milk Cakes`,`Sponge Cakes`,`Cookies`,`Cupcakes`,`Bakes`,`Cake Pops`,`Cakesicles`,`Dessert Cups`,`Platters`,`Drinks`,`Special Gifts`],I=12,L={"Cake Pops":e=>e.group===`Cake Pops`,Cakesicles:e=>e.group===`Cakesicles`},le=(e,t)=>t===`All Products`?!0:L[t]?L[t](e):e.category===t,ue=[{id:`all`,label:`All Prices`,test:()=>!0},{id:`0-200`,label:`₹0 – ₹200`,test:e=>S(e)<=200},{id:`200-500`,label:`₹200 – ₹500`,test:e=>S(e)>200&&S(e)<=500},{id:`500-1000`,label:`₹500 – ₹1000`,test:e=>S(e)>500&&S(e)<=1e3},{id:`1000+`,label:`₹1000+`,test:e=>S(e)>1e3}];function R({checked:e,onChange:t,label:n,name:r}){return(0,O.jsxs)(`label`,{className:`cc-shop-radio`,children:[(0,O.jsx)(`input`,{type:`radio`,name:r,checked:e,onChange:t,className:`cc-shop-radio__input`}),(0,O.jsx)(`span`,{className:`cc-shop-radio__dot`,"aria-hidden":!0}),(0,O.jsx)(`span`,{children:n})]})}function z(){ie({title:`Shop`,description:`Order from our full menu — cheesecakes, milk cakes, cookies, cupcakes, dessert cups and drinks. UPI / Cash on Delivery.`}),oe(`shop-products`,{"@context":`https://schema.org`,"@type":`ItemList`,name:`Cake & Crumb — Shop`,numberOfItems:w.length,itemListElement:w.slice(0,30).map((e,t)=>({"@type":`ListItem`,position:t+1,item:{"@type":`Product`,name:e.name,description:ne(e),category:e.category,image:typeof window<`u`?new URL(v(e.img,800,800),window.location.origin).href:v(e.img,800,800),brand:{"@type":`Brand`,name:`Cake & Crumb`},offers:{"@type":`Offer`,price:te(e),priceCurrency:`INR`,availability:`https://schema.org/InStock`}}}))});let[e,n]=i(),u=e.get(`category`),g=e.get(`product`),[C,k]=(0,D.useState)(u&&F.includes(u)?u:`All Products`),[A,j]=(0,D.useState)(`all`),[M,N]=(0,D.useState)(`featured`),[P,z]=(0,D.useState)(I),[B,V]=(0,D.useState)(null),[H,U]=(0,D.useState)(!1),[W,G]=(0,D.useState)(null),de=(C===`All Products`?0:1)+(A===`all`?0:1),{items:fe,count:K,subtotal:q,add:pe,increment:me,decrement:he,remove:ge,clear:_e}=T(),J=(0,D.useMemo)(()=>{let e=ue.find(e=>e.id===A)?.test??(()=>!0),t=w.filter(t=>le(t,C)&&e(t));return M===`lowhigh`?t=[...t].sort((e,t)=>S(e)-S(t)):M===`highlow`&&(t=[...t].sort((e,t)=>S(t)-S(e))),t},[C,A,M]),Y=J.slice(0,P),X=J.length-Y.length,Z=C!==`All Products`&&M===`featured`&&!L[C],ve=(0,D.useMemo)(()=>{if(!Z)return[{name:null,items:Y}];let e=[];for(let t of Y){let n=t.group||null,r=e[e.length-1];r&&r.name===n?r.items.push(t):e.push({name:n,items:[t]})}return e},[Z,Y]);(0,D.useEffect)(()=>{u&&F.includes(u)&&k(u)},[u]),(0,D.useEffect)(()=>{z(I)},[C,A,M]);let Q=(0,D.useRef)(null);(0,D.useEffect)(()=>{if(!g){Q.current=null;return}if(Q.current===g)return;let t=w.find(e=>e.id===g);if(!t)return;Q.current=g,j(`all`),k(e=>le(t,e)?e:t.category),G(g);let r=new URLSearchParams(e);r.delete(`product`),n(r,{replace:!0})},[g,e,n]);let $=(0,D.useRef)(null);(0,D.useEffect)(()=>{if(!W){$.current=null;return}if($.current===W)return;let e=J.findIndex(e=>e.id===W);if(e===-1)return;if(e>=P){z(Math.ceil((e+1)/I)*I);return}$.current=W,document.getElementById(`product-${W}`)?.scrollIntoView({behavior:`smooth`,block:`center`});let t=setTimeout(()=>G(null),2600);return()=>clearTimeout(t)},[W,J,P]);let ye=()=>{k(`All Products`),j(`all`)},be=(0,D.useRef)(null);function xe({everyScreen:e=!1}={}){typeof window>`u`||!e&&window.innerWidth>=992||(U(!1),requestAnimationFrame(()=>{let e=be.current;if(!e)return;let t=parseInt(getComputedStyle(document.documentElement).getPropertyValue(`--cc-header-h`),10)||82,n=e.getBoundingClientRect().top+window.scrollY-t-12;window.scrollTo({top:n,behavior:`smooth`})}))}let Se=e=>{k(e),xe()},Ce=e=>{j(e),xe()};return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(`section`,{className:`cc-shop-hero`,children:(0,O.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,O.jsxs)(`div`,{className:`row g-4 g-lg-5 align-items-center`,children:[(0,O.jsxs)(`div`,{className:`col-lg-6 text-center text-lg-start`,children:[(0,O.jsx)(`span`,{className:`eyebrow mb-3 d-inline-flex`,children:`Shop Our Treats`}),(0,O.jsxs)(`h1`,{className:`cc-shop-hero__title`,children:[`Handcrafted`,(0,O.jsx)(`br`,{}),`Just for You`]}),(0,O.jsx)(re,{width:50}),(0,O.jsx)(`p`,{className:`cc-shop-hero__lede`,children:`Cheesecakes, milk cakes, sponge cakes, cookies, cupcakes, bakes, dessert cups and drinks — every one of them baked after you order it.`})]}),(0,O.jsx)(`div`,{className:`col-lg-6`,children:(0,O.jsx)(`img`,{src:v(y.heroShop,1e3,800),alt:`Cupcakes on tiered display stands`,className:`cc-shop-hero__img`,fetchPriority:`high`})})]})})}),(0,O.jsx)(`section`,{className:`cc-shop-main`,children:(0,O.jsx)(`div`,{className:`container py-4`,children:(0,O.jsxs)(`div`,{className:`row g-4`,children:[(0,O.jsx)(`aside`,{className:`col-lg-3 col-xl-2`,children:(0,O.jsxs)(`div`,{className:`cc-shop-filter`,children:[(0,O.jsx)(`h6`,{className:`cc-shop-filter__heading`,children:`Filter By`}),(0,O.jsxs)(`button`,{type:`button`,className:`cc-shop-filter__toggle`,onClick:()=>U(e=>!e),"aria-expanded":H,children:[(0,O.jsxs)(`span`,{className:`cc-shop-filter__toggle-label`,children:[(0,O.jsx)(d,{size:15}),`Filters`,de>0&&(0,O.jsx)(`span`,{className:`cc-shop-filter__count`,children:de})]}),(0,O.jsx)(h,{size:18,className:`cc-shop-filter__chevron`+(H?` is-open`:``)})]}),(0,O.jsxs)(`div`,{className:`cc-shop-filter__body`+(H?` is-open`:``),children:[(0,O.jsxs)(`div`,{className:`cc-shop-filter__group`,role:`radiogroup`,"aria-label":`Category`,children:[(0,O.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Category`}),F.map(e=>(0,O.jsx)(R,{name:`shop-category`,label:e,checked:C===e,onChange:()=>Se(e)},e))]}),(0,O.jsxs)(`div`,{className:`cc-shop-filter__group`,role:`radiogroup`,"aria-label":`Price range`,children:[(0,O.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Price Range`}),ue.map(e=>(0,O.jsx)(R,{name:`shop-price`,label:e.label,checked:A===e.id,onChange:()=>Ce(e.id)},e.id))]}),(0,O.jsx)(`button`,{type:`button`,className:`cc-shop-filter__clear`,onClick:ye,children:`Clear Filters`})]})]})}),(0,O.jsxs)(`div`,{className:`col-lg-6 col-xl-7`,ref:be,children:[(0,O.jsxs)(`div`,{className:`cc-shop-toolbar`,children:[(0,O.jsxs)(`span`,{className:`cc-shop-toolbar__count`,children:[`Showing `,Y.length,` of `,J.length,` results`]}),(0,O.jsxs)(`label`,{className:`cc-shop-toolbar__sort`,children:[(0,O.jsx)(`span`,{children:`Sort by:`}),(0,O.jsxs)(`select`,{value:M,onChange:e=>N(e.target.value),children:[(0,O.jsx)(`option`,{value:`featured`,children:`Featured`}),(0,O.jsx)(`option`,{value:`lowhigh`,children:`Price: low to high`}),(0,O.jsx)(`option`,{value:`highlow`,children:`Price: high to low`})]})]})]}),(0,O.jsxs)(`p`,{className:`cc-shop-note cc-shop-note--lead`,children:[(0,O.jsx)(t,{size:12}),` Freshly baked to order — please order at least 1 day in advance.`]}),C===`Cupcakes`&&(0,O.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,O.jsx)(r,{size:12}),` Cupcakes come as a box of 6, or buy them by the piece (minimum 2) — tap any cupcake to choose how many. Add ₹20 for floral or additional decoration.`]}),C===`Cake Pops`&&(0,O.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,O.jsx)(r,{size:12}),` Cake pops come as a box of 6, or by the piece (minimum 2) — tap any flavour to choose how many. A box of 12 is simply two sixes.`]}),C===`Cookies`&&(0,O.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,O.jsx)(r,{size:12}),` Boxes of 6 and 12, or single cookies from `,_(E.Cookies[0].from),` — tap any cookie to pick a size. Singles are baked into the day's batch, so a box is still the better value.`]}),C===`Bakes`&&(0,O.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,O.jsx)(r,{size:12}),` Brownies and blondies also come in `,E.Brownies.map(e=>e.label).join(` and `),` — from `,_(E.Brownies[0].from),` and `,_(E.Brownies[1].from),`. Ask on WhatsApp for those.`]}),(0,O.jsxs)(`div`,{className:`cc-shop-grid`,children:[ve.map(e=>(0,O.jsxs)(D.Fragment,{children:[e.name&&(0,O.jsx)(`h3`,{className:`cc-shop-group`,children:e.name}),e.items.map(e=>(0,O.jsxs)(`article`,{id:`product-${e.id}`,className:`cc-product-card`+(e.id===W?` is-flash`:``),children:[(0,O.jsx)(`button`,{type:`button`,onClick:()=>V(e),"aria-label":`View ${e.name}`,className:`cc-product-card__img-btn`,children:(0,O.jsx)(`img`,{src:v(e.img,500,500),srcSet:b(e.img),sizes:`(min-width: 768px) 240px, 46vw`,alt:e.name,loading:`lazy`})}),(0,O.jsxs)(`div`,{className:`cc-product-card__body`,children:[(0,O.jsxs)(`div`,{className:`cc-product-card__cat`,children:[e.category,(0,O.jsx)(se,{allergens:e.allergens})]}),(0,O.jsx)(`h6`,{className:`cc-product-card__name`,children:(0,O.jsx)(`button`,{type:`button`,className:`cc-product-card__name-btn`,onClick:()=>V(e),title:e.name,children:e.name})}),(0,O.jsx)(`div`,{className:`cc-product-card__price`,children:x(e)?(0,O.jsxs)(O.Fragment,{children:[_(e.slice),(0,O.jsx)(`span`,{className:`cc-product-card__price-sub`,children:e.sliceLabel})]}):ee(e)}),(0,O.jsxs)(`button`,{className:`cc-product-card__add`,"aria-label":e.slice?`Choose a size for ${e.name}`:`Add ${e.name} to cart`,onClick:()=>{e.slice?V(e):pe(e)},children:[(0,O.jsx)(o,{size:12}),` Add to Cart`]})]})]},e.id))]},e.name||`_`)),J.length===0&&(0,O.jsxs)(`div`,{className:`cc-shop-empty`,children:[(0,O.jsx)(`p`,{className:`mb-2`,children:`No products match your filters.`}),(0,O.jsx)(`button`,{type:`button`,className:`cc-shop-empty__clear`,onClick:ye,children:`Clear filters`})]})]}),X>0&&(0,O.jsx)(`div`,{className:`cc-shop-more`,children:(0,O.jsxs)(`button`,{type:`button`,className:`cc-shop-more__btn`,onClick:()=>z(e=>e+I),children:[`Show `,Math.min(X,I),` more`,(0,O.jsxs)(`span`,{className:`cc-shop-more__n`,children:[X,` left`]})]})})]}),(0,O.jsx)(`aside`,{className:`col-lg-3`,children:(0,O.jsxs)(`div`,{className:`cc-shop-cart`,children:[(0,O.jsxs)(`div`,{className:`cc-shop-cart__panel`,children:[(0,O.jsxs)(`div`,{className:`cc-shop-cart__head`,children:[(0,O.jsxs)(`span`,{className:`cc-shop-cart__title`,children:[`Your Cart (`,K,`)`]}),K>0&&(0,O.jsx)(`button`,{type:`button`,className:`cc-shop-cart__clear`,onClick:_e,"aria-label":`Clear cart`,children:(0,O.jsx)(s,{size:16})})]}),K===0&&(0,O.jsx)(`p`,{className:`cc-shop-cart__empty`,children:`Your cart is empty.`}),fe.map(e=>(0,O.jsxs)(`div`,{className:`cc-shop-cart__item`,children:[(0,O.jsx)(`img`,{src:v(e.img,200,200),srcSet:b(e.img),sizes:`64px`,alt:``,className:`cc-shop-cart__item-img`}),(0,O.jsxs)(`div`,{className:`cc-shop-cart__item-body`,children:[(0,O.jsxs)(`div`,{className:`cc-shop-cart__item-top`,children:[(0,O.jsx)(`strong`,{className:`cc-shop-cart__item-name`,children:e.name}),(0,O.jsx)(`button`,{type:`button`,onClick:()=>ge(e.id),"aria-label":`Remove`,className:`cc-shop-cart__item-remove`,children:(0,O.jsx)(s,{size:14})})]}),(0,O.jsx)(`div`,{className:`cc-shop-cart__item-price`,children:_(e.price)}),(0,O.jsxs)(`div`,{className:`cc-shop-cart__qty`,children:[(0,O.jsx)(`button`,{className:`qty-btn`,onClick:()=>he(e.id),"aria-label":`Decrease`,children:(0,O.jsx)(f,{size:12})}),(0,O.jsx)(`span`,{children:e.qty}),(0,O.jsx)(`button`,{className:`qty-btn`,onClick:()=>me(e.id),"aria-label":`Increase`,children:(0,O.jsx)(a,{size:12})})]})]})]},e.id)),(0,O.jsxs)(`div`,{className:`cc-shop-cart__subtotal`,children:[(0,O.jsx)(`span`,{children:`SUBTOTAL`}),(0,O.jsx)(`strong`,{children:_(q)})]}),(0,O.jsx)(ae,{items:fe,subtotal:q,compact:!0}),(0,O.jsx)(`p`,{className:`cc-shop-cart__note`,children:`Delivery calculated at checkout. Self-pickup is always free.`}),(0,O.jsxs)(c,{to:`/cart`,className:`btn-rose w-100 justify-content-center mb-2`,style:{pointerEvents:K===0?`none`:`auto`,opacity:K===0?.5:1},tabIndex:K===0?-1:void 0,"aria-disabled":K===0,children:[(0,O.jsx)(o,{size:14}),` View Cart`]}),(0,O.jsxs)(c,{to:`/checkout`,className:`btn-outline-rose w-100 justify-content-center`,style:{pointerEvents:K===0?`none`:`auto`,opacity:K===0?.5:1},tabIndex:K===0?-1:void 0,"aria-disabled":K===0,children:[(0,O.jsx)(m,{size:14}),` Checkout`]})]}),(0,O.jsxs)(`div`,{className:`cc-shop-special`,children:[(0,O.jsx)(`span`,{className:`cc-shop-special__icon`,children:(0,O.jsx)(r,{size:16})}),(0,O.jsx)(`h6`,{className:`cc-shop-special__title`,children:`Need Something Special?`}),(0,O.jsx)(`p`,{className:`cc-shop-special__text`,children:`We love creating custom treats for your special moments.`}),(0,O.jsx)(c,{to:`/contact`,className:`cc-shop-special__btn`,children:`Place Custom Order`})]})]})})]})})}),(0,O.jsx)(`section`,{className:`cc-shop-promise`,children:(0,O.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,O.jsx)(`div`,{className:`feature-row`,children:[{Icon:r,title:`Handcrafted with Love`,text:`Made in small batches with care.`},{Icon:p,title:`Made to Order`,text:`Every treat is made to order just for you.`},{Icon:l,title:`Safe & Secure`,text:`Secure checkout and careful packaging always.`}].map((e,t)=>(0,O.jsxs)(`div`,{className:`feature-cell text-center cc-shop-promise__cell`,children:[(0,O.jsx)(`span`,{className:`cc-features-card__icon cc-features-card__icon--lg`,children:(0,O.jsx)(e.Icon,{size:22})}),(0,O.jsx)(`div`,{className:`cc-features-card__heading mt-3`,children:e.title}),(0,O.jsx)(`p`,{className:`cc-features-card__text mt-1`,children:e.text})]},t))})})}),K>0&&(0,O.jsxs)(c,{to:`/cart`,className:`shop-cart-pill`,children:[(0,O.jsx)(o,{size:15}),(0,O.jsxs)(`span`,{children:[(0,O.jsx)(`strong`,{children:K}),` `,K===1?`item`:`items`,` · `,_(q)]}),(0,O.jsx)(`span`,{className:`shop-cart-pill__cta`,children:`View cart`})]}),(0,O.jsx)(ce,{product:B,onClose:()=>V(null)},B?.id)]})}export{z as default};