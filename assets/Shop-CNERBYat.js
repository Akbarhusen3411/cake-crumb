import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{F as t,S as n,X as r,_ as i,bt as a,ft as o,it as s,mt as c,nt as l,q as u,r as d,rt as f,ut as p,v as m,wt as h,z as g}from"./react-vendor-BCk0ZdQ6.js";import{t as _}from"./format-XQan9feh.js";import{A as v,C as y,D as ee,E as b,N as x,O as S,S as C,T as te,b as ne,k as re,n as ie,r as ae,w as oe,x as w}from"./index-B1IOd00L.js";import{t as se}from"./useJsonLd-CKSfMEyH.js";var T=e(h(),1),E=o(),D={eggless:{label:`Eggless`,icon:`🌱`,kind:`free`},vegan:{label:`Vegan`,icon:`🌿`,kind:`free`},"gluten-free":{label:`Gluten-Free`,icon:`🌾`,kind:`free`},"contains-nuts":{label:`Contains Nuts`,icon:`🌰`,kind:`contains`},"contains-egg":{label:`Contains Egg`,icon:`🥚`,kind:`contains`},"contains-dairy":{label:`Contains Dairy`,icon:`🥛`,kind:`contains`},"contains-gluten":{label:`Contains Gluten`,icon:`🌾`,kind:`contains`},"eggless-option":{label:`Eggless on request`,icon:`🌱`,kind:`option`}},O={free:{bg:`rgba(34, 139, 81, 0.10)`,fg:`#1d6f3a`,border:`rgba(34, 139, 81, 0.35)`},contains:{bg:`rgba(184, 134, 11, 0.12)`,fg:`#8a5d05`,border:`rgba(184, 134, 11, 0.35)`},option:{bg:`rgba(224, 97, 122, 0.08)`,fg:`var(--cc-rose-deep)`,border:`rgba(224, 97, 122, 0.4)`}};function ce({allergens:e,verbose:t=!1,size:n=`sm`}){if(!Array.isArray(e)||e.length===0)return null;let r=[`eggless`,`vegan`,`gluten-free`,`contains-nuts`],i=t?e:e.filter(e=>r.includes(e));if(i.length===0)return null;let a=n===`lg`?`0.4rem 0.7rem`:`0.18rem 0.5rem`,o=n===`lg`?`0.78rem`:`0.66rem`;return(0,E.jsx)(`div`,{className:`d-flex flex-wrap`,style:{gap:4},children:i.map(e=>{let t=D[e];if(!t)return null;let n=O[t.kind];return(0,E.jsxs)(`span`,{title:t.label,style:{display:`inline-flex`,alignItems:`center`,gap:3,fontSize:o,fontWeight:600,letterSpacing:`0.02em`,color:n.fg,background:n.bg,border:`1px solid ${n.border}`,padding:a,borderRadius:999,lineHeight:1.1,whiteSpace:`nowrap`},children:[(0,E.jsx)(`span`,{"aria-hidden":!0,style:{fontSize:`0.9em`},children:t.icon}),t.label]},e)})})}var k=3,A=`Small orders bake with the day’s batch`,j=e=>e===1?`We don’t bake a tray for one — yours joins the day’s batch of this flavour.`:`Small orders join the day’s batch of this flavour.`;function M(){return(0,E.jsxs)(`p`,{className:`qv-batch-hint`,children:[(0,E.jsx)(g,{size:12}),A]})}function le({product:e,onClose:t}){let{add:n}=x(),i=Math.max(1,Number(e?.minQty)||1),[a,o]=(0,T.useState)(i),[s,c]=(0,T.useState)(1),l=(0,T.useRef)(null);if((0,T.useEffect)(()=>{if(!e)return;let n=e=>{e.key===`Escape`&&t()};return document.addEventListener(`keydown`,n),()=>document.removeEventListener(`keydown`,n)},[e,t]),(0,T.useEffect)(()=>{if(!e)return;let t=e=>{l.current?.contains(e.target)||e.preventDefault()};return document.addEventListener(`touchmove`,t,{passive:!1}),document.addEventListener(`wheel`,t,{passive:!1}),()=>{document.removeEventListener(`touchmove`,t),document.removeEventListener(`wheel`,t)}},[e]),!e)return null;let d=e,m=i>1||d?.piece===!0,h=d?.piece===!0;function g(e,r){n(e,r),t()}return(0,E.jsxs)(`div`,{role:`dialog`,"aria-modal":`true`,"aria-label":d.name,onClick:t,className:`qv-backdrop`,children:[(0,E.jsxs)(`div`,{ref:l,onClick:e=>e.stopPropagation(),className:`qv-modal`,children:[(0,E.jsx)(`button`,{onClick:t,"aria-label":`Close`,className:`qv-close`,children:(0,E.jsx)(p,{size:18})}),(0,E.jsxs)(`div`,{className:`qv-grid`,children:[(0,E.jsxs)(`div`,{className:`qv-image-col`,children:[(0,E.jsx)(`img`,{src:C(d.img,800,800),srcSet:w(d.img),sizes:`(min-width: 720px) 300px, 100vw`,alt:d.name,className:`qv-image`}),d.badge&&(0,E.jsx)(`span`,{className:`qv-badge`,children:d.badge})]}),(0,E.jsxs)(`div`,{className:`qv-info-col`,children:[(0,E.jsx)(`div`,{className:`tag-badge mb-1`,style:{fontSize:`0.65rem`},children:d.category}),(0,E.jsx)(`h3`,{className:`qv-title`,children:d.name}),d.allergens?.length>0&&(0,E.jsx)(`div`,{className:`mt-2`,children:(0,E.jsx)(ce,{allergens:d.allergens,verbose:!0})}),(0,E.jsx)(`p`,{className:`qv-desc`,children:te(d)}),(0,E.jsx)(`p`,{className:`qv-desc`,style:{fontSize:`0.82rem`,opacity:.85},children:`Handcrafted with the finest ingredients and freshly prepared. Please pre-order at least 1 day in advance.`}),d.slice?(0,E.jsxs)(`div`,{className:`qv-options`,children:[(0,E.jsxs)(`div`,{className:`qv-option${m?` qv-option--qty`:``}`,children:[(0,E.jsxs)(`div`,{className:`qv-option__info`,children:[(0,E.jsxs)(`div`,{className:`qv-option__label`,children:[d.sizeLabel||`Whole`,m&&(0,E.jsxs)(`span`,{className:`qv-option__min`,children:[`Min `,i]})]}),(0,E.jsxs)(`div`,{className:`qv-option__price`,children:[_(d.price),m&&(0,E.jsx)(`span`,{className:`qv-option__sub`,children:`each`})]})]}),m?(0,E.jsxs)(`div`,{className:`qv-qty`,children:[(0,E.jsx)(`span`,{className:`qv-qty__ask`,children:`How many?`}),(0,E.jsxs)(`div`,{className:`qv-qty__row`,children:[(0,E.jsxs)(`div`,{className:`qv-qty__stepper`,children:[(0,E.jsx)(`button`,{type:`button`,onClick:()=>o(e=>Math.max(i,e-1)),disabled:a<=i,"aria-label":`One fewer`,children:(0,E.jsx)(u,{size:13})}),(0,E.jsx)(`span`,{className:`qv-qty__val`,"aria-live":`polite`,children:a}),(0,E.jsx)(`button`,{type:`button`,onClick:()=>o(e=>e+1),"aria-label":`One more`,children:(0,E.jsx)(r,{size:13})})]}),(0,E.jsxs)(`button`,{className:`qv-btn qv-btn--filled qv-qty__add`,onClick:()=>g({...d,name:`${d.name} (${d.sizeLabel||`Whole`})`,note:h&&a<=k?j(a):void 0},a),children:[(0,E.jsx)(f,{size:13}),` Add `,a,` — `,_(d.price*a)]})]})]}):(0,E.jsxs)(`button`,{className:`qv-btn qv-btn--filled`,onClick:()=>g({...d,name:`${d.name} (${d.sizeLabel||`Whole`})`},i),children:[(0,E.jsx)(f,{size:13}),` Add`]})]}),h&&a<=k&&(0,E.jsx)(M,{}),(0,E.jsxs)(`div`,{className:`qv-option`,children:[(0,E.jsxs)(`div`,{className:`qv-option__info`,children:[(0,E.jsx)(`div`,{className:`qv-option__label`,children:d.sliceLabel||`Slice`}),(0,E.jsx)(`div`,{className:`qv-option__price`,children:_(d.slice)})]}),(0,E.jsxs)(`button`,{className:`qv-btn qv-btn--outline`,onClick:()=>g({id:d.id+`-slice`,name:`${d.name} (${d.sliceLabel||`Slice`})`,price:d.slice,img:d.img}),children:[(0,E.jsx)(f,{size:13}),` Add`]})]}),b(d)&&(0,E.jsxs)(`div`,{className:`qv-option qv-option--qty`,children:[(0,E.jsxs)(`div`,{className:`qv-option__info`,children:[(0,E.jsx)(`div`,{className:`qv-option__label`,children:d.unitLabel||`Per piece`}),(0,E.jsxs)(`div`,{className:`qv-option__price`,children:[_(d.unit),(0,E.jsx)(`span`,{className:`qv-option__sub`,children:`each`})]})]}),(0,E.jsxs)(`div`,{className:`qv-qty`,children:[(0,E.jsx)(`span`,{className:`qv-qty__ask`,children:`How many?`}),(0,E.jsxs)(`div`,{className:`qv-qty__row`,children:[(0,E.jsxs)(`div`,{className:`qv-qty__stepper`,children:[(0,E.jsx)(`button`,{type:`button`,onClick:()=>c(e=>Math.max(1,e-1)),disabled:s<=1,"aria-label":`One fewer`,children:(0,E.jsx)(u,{size:13})}),(0,E.jsx)(`span`,{className:`qv-qty__val`,"aria-live":`polite`,children:s}),(0,E.jsx)(`button`,{type:`button`,onClick:()=>c(e=>e+1),"aria-label":`One more`,children:(0,E.jsx)(r,{size:13})})]}),(0,E.jsxs)(`button`,{className:`qv-btn qv-btn--filled qv-qty__add`,onClick:()=>g({id:d.id+`-unit`,name:`${d.name} (${d.unitLabel||`Per piece`})`,price:d.unit,img:d.img,note:s<=k?j(s):void 0},s),children:[(0,E.jsx)(f,{size:13}),` Add `,s,` — `,_(d.unit*s)]})]})]})]}),b(d)&&s<=k&&(0,E.jsx)(M,{})]}):(0,E.jsx)(`div`,{className:`qv-actions`,children:(0,E.jsxs)(`button`,{className:`qv-btn qv-btn--filled w-100`,onClick:()=>g(d),children:[(0,E.jsx)(f,{size:13}),` Add to Cart — `,_(d.price)]})})]})]})]}),(0,E.jsx)(`style`,{children:`
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
      `})]})}var N=[`All Products`,`Cheesecakes`,`Milk Cakes`,`Sponge Cakes`,`Cookies`,`Cupcakes`,`Bakes`,`Cake Pops`,`Cakesicles`,`Dessert Cups`,`Platters`,`Drinks`],P=12,F={"Cake Pops":e=>e.group===`Cake Pops`,Cakesicles:e=>e.group===`Cakesicles`},I=(e,t)=>t===`All Products`?!0:F[t]?F[t](e):e.category===t,L=[{id:`all`,label:`All Prices`,test:()=>!0},{id:`0-200`,label:`₹0 – ₹200`,test:e=>S(e)<=200},{id:`200-500`,label:`₹200 – ₹500`,test:e=>S(e)>200&&S(e)<=500},{id:`500-1000`,label:`₹500 – ₹1000`,test:e=>S(e)>500&&S(e)<=1e3},{id:`1000+`,label:`₹1000+`,test:e=>S(e)>1e3}];function R({checked:e,onChange:t,label:n,name:r}){return(0,E.jsxs)(`label`,{className:`cc-shop-radio`,children:[(0,E.jsx)(`input`,{type:`radio`,name:r,checked:e,onChange:t,className:`cc-shop-radio__input`}),(0,E.jsx)(`span`,{className:`cc-shop-radio__dot`,"aria-hidden":!0}),(0,E.jsx)(`span`,{children:n})]})}function z(){ae({title:`Shop`,description:`Order from our full menu — cheesecakes, milk cakes, cookies, cupcakes, dessert cups and drinks. UPI / Cash on Delivery.`}),se(`shop-products`,{"@context":`https://schema.org`,"@type":`ItemList`,name:`Cake & Crumb — Shop`,numberOfItems:v.length,itemListElement:v.slice(0,30).map((e,t)=>({"@type":`ListItem`,position:t+1,item:{"@type":`Product`,name:e.name,description:te(e),category:e.category,image:typeof window<`u`?new URL(C(e.img,800,800),window.location.origin).href:C(e.img,800,800),brand:{"@type":`Brand`,name:`Cake & Crumb`},offers:{"@type":`Offer`,price:oe(e),priceCurrency:`INR`,availability:`https://schema.org/InStock`}}}))});let[e,o]=a(),h=e.get(`category`),g=e.get(`product`),[b,D]=(0,T.useState)(h&&N.includes(h)?h:`All Products`),[O,k]=(0,T.useState)(`all`),[A,j]=(0,T.useState)(`featured`),[M,z]=(0,T.useState)(P),[B,V]=(0,T.useState)(null),[H,U]=(0,T.useState)(!1),[W,G]=(0,T.useState)(null),K=(b===`All Products`?0:1)+(O===`all`?0:1),{items:ue,count:q,subtotal:J,add:de,increment:fe,decrement:pe,remove:me,clear:he}=x(),Y=(0,T.useMemo)(()=>{let e=L.find(e=>e.id===O)?.test??(()=>!0),t=v.filter(t=>I(t,b)&&e(t));return A===`lowhigh`?t=[...t].sort((e,t)=>S(e)-S(t)):A===`highlow`&&(t=[...t].sort((e,t)=>S(t)-S(e))),t},[b,O,A]),X=Y.slice(0,M),Z=Y.length-X.length,ge=b!==`All Products`&&A===`featured`&&!F[b],_e=(0,T.useMemo)(()=>{if(!ge)return[{name:null,items:X}];let e=[];for(let t of X){let n=t.group||null,r=e[e.length-1];r&&r.name===n?r.items.push(t):e.push({name:n,items:[t]})}return e},[ge,X]);(0,T.useEffect)(()=>{h&&N.includes(h)&&D(h)},[h]),(0,T.useEffect)(()=>{z(P)},[b,O,A]);let Q=(0,T.useRef)(null);(0,T.useEffect)(()=>{if(!g){Q.current=null;return}if(Q.current===g)return;let t=v.find(e=>e.id===g);if(!t)return;Q.current=g,k(`all`),D(e=>I(t,e)?e:t.category),G(g);let n=new URLSearchParams(e);n.delete(`product`),o(n,{replace:!0})},[g,e,o]);let $=(0,T.useRef)(null);(0,T.useEffect)(()=>{if(!W){$.current=null;return}if($.current===W)return;let e=Y.findIndex(e=>e.id===W);if(e===-1)return;if(e>=M){z(Math.ceil((e+1)/P)*P);return}$.current=W,document.getElementById(`product-${W}`)?.scrollIntoView({behavior:`smooth`,block:`center`});let t=setTimeout(()=>G(null),2600);return()=>clearTimeout(t)},[W,Y,M]);let ve=()=>{D(`All Products`),k(`all`)},ye=(0,T.useRef)(null);function be({everyScreen:e=!1}={}){typeof window>`u`||!e&&window.innerWidth>=992||(U(!1),requestAnimationFrame(()=>{let e=ye.current;if(!e)return;let t=parseInt(getComputedStyle(document.documentElement).getPropertyValue(`--cc-header-h`),10)||82,n=e.getBoundingClientRect().top+window.scrollY-t-12;window.scrollTo({top:n,behavior:`smooth`})}))}let xe=e=>{D(e),be()},Se=e=>{k(e),be()};return(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(`section`,{className:`cc-shop-hero`,children:(0,E.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,E.jsxs)(`div`,{className:`row g-4 g-lg-5 align-items-center`,children:[(0,E.jsxs)(`div`,{className:`col-lg-6 text-center text-lg-start`,children:[(0,E.jsx)(`span`,{className:`eyebrow mb-3 d-inline-flex`,children:`Shop Our Treats`}),(0,E.jsxs)(`h1`,{className:`cc-shop-hero__title`,children:[`Handcrafted`,(0,E.jsx)(`br`,{}),`Just for You`]}),(0,E.jsx)(ie,{width:50}),(0,E.jsx)(`p`,{className:`cc-shop-hero__lede`,children:`Cheesecakes, milk cakes, sponge cakes, cookies, cupcakes, bakes, dessert cups and drinks — every one of them baked after you order it.`})]}),(0,E.jsx)(`div`,{className:`col-lg-6`,children:(0,E.jsx)(`img`,{src:C(ne.heroShop,1e3,800),alt:`Cupcakes on tiered display stands`,className:`cc-shop-hero__img`,fetchPriority:`high`})})]})})}),(0,E.jsx)(`section`,{className:`cc-shop-main`,children:(0,E.jsx)(`div`,{className:`container py-4`,children:(0,E.jsxs)(`div`,{className:`row g-4`,children:[(0,E.jsx)(`aside`,{className:`col-lg-3 col-xl-2`,children:(0,E.jsxs)(`div`,{className:`cc-shop-filter`,children:[(0,E.jsx)(`h6`,{className:`cc-shop-filter__heading`,children:`Filter By`}),(0,E.jsxs)(`button`,{type:`button`,className:`cc-shop-filter__toggle`,onClick:()=>U(e=>!e),"aria-expanded":H,children:[(0,E.jsxs)(`span`,{className:`cc-shop-filter__toggle-label`,children:[(0,E.jsx)(s,{size:15}),`Filters`,K>0&&(0,E.jsx)(`span`,{className:`cc-shop-filter__count`,children:K})]}),(0,E.jsx)(m,{size:18,className:`cc-shop-filter__chevron`+(H?` is-open`:``)})]}),(0,E.jsxs)(`div`,{className:`cc-shop-filter__body`+(H?` is-open`:``),children:[(0,E.jsxs)(`div`,{className:`cc-shop-filter__group`,role:`radiogroup`,"aria-label":`Category`,children:[(0,E.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Category`}),N.map(e=>(0,E.jsx)(R,{name:`shop-category`,label:e,checked:b===e,onChange:()=>xe(e)},e))]}),(0,E.jsxs)(`div`,{className:`cc-shop-filter__group`,role:`radiogroup`,"aria-label":`Price range`,children:[(0,E.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Price Range`}),L.map(e=>(0,E.jsx)(R,{name:`shop-price`,label:e.label,checked:O===e.id,onChange:()=>Se(e.id)},e.id))]}),(0,E.jsx)(`button`,{type:`button`,className:`cc-shop-filter__clear`,onClick:ve,children:`Clear Filters`})]})]})}),(0,E.jsxs)(`div`,{className:`col-lg-6 col-xl-7`,ref:ye,children:[(0,E.jsxs)(`div`,{className:`cc-shop-toolbar`,children:[(0,E.jsxs)(`span`,{className:`cc-shop-toolbar__count`,children:[`Showing `,X.length,` of `,Y.length,` results`]}),(0,E.jsxs)(`label`,{className:`cc-shop-toolbar__sort`,children:[(0,E.jsx)(`span`,{children:`Sort by:`}),(0,E.jsxs)(`select`,{value:A,onChange:e=>j(e.target.value),children:[(0,E.jsx)(`option`,{value:`featured`,children:`Featured`}),(0,E.jsx)(`option`,{value:`lowhigh`,children:`Price: low to high`}),(0,E.jsx)(`option`,{value:`highlow`,children:`Price: high to low`})]})]})]}),(0,E.jsxs)(`p`,{className:`cc-shop-note cc-shop-note--lead`,children:[(0,E.jsx)(n,{size:12}),` Freshly baked to order — please order at least 1 day in advance.`]}),b===`Cupcakes`&&(0,E.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,E.jsx)(t,{size:12}),` Cupcakes come as a box of 6, or buy them by the piece (minimum 2) — tap any cupcake to choose how many. Add ₹20 for floral or additional decoration.`]}),b===`Cake Pops`&&(0,E.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,E.jsx)(t,{size:12}),` Cake pops come as a box of 6, or by the piece (minimum 2) — tap any flavour to choose how many. A box of 12 is simply two sixes.`]}),b===`Cookies`&&(0,E.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,E.jsx)(t,{size:12}),` Boxes of 6 and 12, or single cookies from `,_(y.Cookies[0].from),` — tap any cookie to pick a size. Singles are baked into the day's batch, so a box is still the better value.`]}),b===`Bakes`&&(0,E.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,E.jsx)(t,{size:12}),` Brownies and blondies also come in `,y.Brownies.map(e=>e.label).join(` and `),` — from `,_(y.Brownies[0].from),` and `,_(y.Brownies[1].from),`. Ask on WhatsApp for those.`]}),(0,E.jsxs)(`div`,{className:`cc-shop-grid`,children:[_e.map(e=>(0,E.jsxs)(T.Fragment,{children:[e.name&&(0,E.jsx)(`h3`,{className:`cc-shop-group`,children:e.name}),e.items.map(e=>(0,E.jsxs)(`article`,{id:`product-${e.id}`,className:`cc-product-card`+(e.id===W?` is-flash`:``),children:[(0,E.jsx)(`button`,{type:`button`,onClick:()=>V(e),"aria-label":`View ${e.name}`,className:`cc-product-card__img-btn`,children:(0,E.jsx)(`img`,{src:C(e.img,500,500),srcSet:w(e.img),sizes:`(min-width: 768px) 240px, 46vw`,alt:e.name,loading:`lazy`})}),(0,E.jsxs)(`div`,{className:`cc-product-card__body`,children:[(0,E.jsxs)(`div`,{className:`cc-product-card__cat`,children:[e.category,(0,E.jsx)(ce,{allergens:e.allergens})]}),(0,E.jsx)(`h6`,{className:`cc-product-card__name`,children:(0,E.jsx)(`button`,{type:`button`,className:`cc-product-card__name-btn`,onClick:()=>V(e),title:e.name,children:e.name})}),(0,E.jsx)(`div`,{className:`cc-product-card__price`,children:ee(e)?(0,E.jsxs)(E.Fragment,{children:[_(e.slice),(0,E.jsx)(`span`,{className:`cc-product-card__price-sub`,children:e.sliceLabel})]}):re(e)}),(0,E.jsxs)(`button`,{className:`cc-product-card__add`,"aria-label":e.slice?`Choose a size for ${e.name}`:`Add ${e.name} to cart`,onClick:()=>{e.slice?V(e):de(e)},children:[(0,E.jsx)(f,{size:12}),` Add to Cart`]})]})]},e.id))]},e.name||`_`)),Y.length===0&&(0,E.jsxs)(`div`,{className:`cc-shop-empty`,children:[(0,E.jsx)(`p`,{className:`mb-2`,children:`No products match your filters.`}),(0,E.jsx)(`button`,{type:`button`,className:`cc-shop-empty__clear`,onClick:ve,children:`Clear filters`})]})]}),Z>0&&(0,E.jsx)(`div`,{className:`cc-shop-more`,children:(0,E.jsxs)(`button`,{type:`button`,className:`cc-shop-more__btn`,onClick:()=>z(e=>e+P),children:[`Show `,Math.min(Z,P),` more`,(0,E.jsxs)(`span`,{className:`cc-shop-more__n`,children:[Z,` left`]})]})})]}),(0,E.jsx)(`aside`,{className:`col-lg-3`,children:(0,E.jsxs)(`div`,{className:`cc-shop-cart`,children:[(0,E.jsxs)(`div`,{className:`cc-shop-cart__panel`,children:[(0,E.jsxs)(`div`,{className:`cc-shop-cart__head`,children:[(0,E.jsxs)(`span`,{className:`cc-shop-cart__title`,children:[`Your Cart (`,q,`)`]}),q>0&&(0,E.jsx)(`button`,{type:`button`,className:`cc-shop-cart__clear`,onClick:he,"aria-label":`Clear cart`,children:(0,E.jsx)(p,{size:16})})]}),q===0&&(0,E.jsx)(`p`,{className:`cc-shop-cart__empty`,children:`Your cart is empty.`}),ue.map(e=>(0,E.jsxs)(`div`,{className:`cc-shop-cart__item`,children:[(0,E.jsx)(`img`,{src:C(e.img,200,200),srcSet:w(e.img),sizes:`64px`,alt:``,className:`cc-shop-cart__item-img`}),(0,E.jsxs)(`div`,{className:`cc-shop-cart__item-body`,children:[(0,E.jsxs)(`div`,{className:`cc-shop-cart__item-top`,children:[(0,E.jsx)(`strong`,{className:`cc-shop-cart__item-name`,children:e.name}),(0,E.jsx)(`button`,{type:`button`,onClick:()=>me(e.id),"aria-label":`Remove`,className:`cc-shop-cart__item-remove`,children:(0,E.jsx)(p,{size:14})})]}),(0,E.jsx)(`div`,{className:`cc-shop-cart__item-price`,children:_(e.price)}),(0,E.jsxs)(`div`,{className:`cc-shop-cart__qty`,children:[(0,E.jsx)(`button`,{className:`qty-btn`,onClick:()=>pe(e.id),"aria-label":`Decrease`,children:(0,E.jsx)(u,{size:12})}),(0,E.jsx)(`span`,{children:e.qty}),(0,E.jsx)(`button`,{className:`qty-btn`,onClick:()=>fe(e.id),"aria-label":`Increase`,children:(0,E.jsx)(r,{size:12})})]})]})]},e.id)),(0,E.jsxs)(`div`,{className:`cc-shop-cart__subtotal`,children:[(0,E.jsx)(`span`,{children:`SUBTOTAL`}),(0,E.jsx)(`strong`,{children:_(J)})]}),(0,E.jsx)(`p`,{className:`cc-shop-cart__note`,children:`Delivery calculated at checkout. Self-pickup is always free.`}),(0,E.jsxs)(c,{to:`/cart`,className:`btn-rose w-100 justify-content-center mb-2`,style:{pointerEvents:q===0?`none`:`auto`,opacity:q===0?.5:1},tabIndex:q===0?-1:void 0,"aria-disabled":q===0,children:[(0,E.jsx)(f,{size:14}),` View Cart`]}),(0,E.jsxs)(c,{to:`/checkout`,className:`btn-outline-rose w-100 justify-content-center`,style:{pointerEvents:q===0?`none`:`auto`,opacity:q===0?.5:1},tabIndex:q===0?-1:void 0,"aria-disabled":q===0,children:[(0,E.jsx)(i,{size:14}),` Checkout`]})]}),(0,E.jsxs)(`div`,{className:`cc-shop-special`,children:[(0,E.jsx)(`span`,{className:`cc-shop-special__icon`,children:(0,E.jsx)(t,{size:16})}),(0,E.jsx)(`h6`,{className:`cc-shop-special__title`,children:`Need Something Special?`}),(0,E.jsx)(`p`,{className:`cc-shop-special__text`,children:`We love creating custom treats for your special moments.`}),(0,E.jsx)(c,{to:`/contact`,className:`cc-shop-special__btn`,children:`Place Custom Order`})]})]})})]})})}),(0,E.jsx)(`section`,{className:`cc-shop-promise`,children:(0,E.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,E.jsx)(`div`,{className:`feature-row`,children:[{Icon:t,title:`Handcrafted with Love`,text:`Made in small batches with care.`},{Icon:d,title:`Made to Order`,text:`Every treat is made to order just for you.`},{Icon:l,title:`Safe & Secure`,text:`Secure checkout and careful packaging always.`}].map((e,t)=>(0,E.jsxs)(`div`,{className:`feature-cell text-center cc-shop-promise__cell`,children:[(0,E.jsx)(`span`,{className:`cc-features-card__icon cc-features-card__icon--lg`,children:(0,E.jsx)(e.Icon,{size:22})}),(0,E.jsx)(`div`,{className:`cc-features-card__heading mt-3`,children:e.title}),(0,E.jsx)(`p`,{className:`cc-features-card__text mt-1`,children:e.text})]},t))})})}),q>0&&(0,E.jsxs)(c,{to:`/cart`,className:`shop-cart-pill`,children:[(0,E.jsx)(f,{size:15}),(0,E.jsxs)(`span`,{children:[(0,E.jsx)(`strong`,{children:q}),` `,q===1?`item`:`items`,` · `,_(J)]}),(0,E.jsx)(`span`,{className:`shop-cart-pill__cta`,children:`View cart`})]}),(0,E.jsx)(le,{product:B,onClose:()=>V(null)},B?.id)]})}export{z as default};