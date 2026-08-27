import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{B as t,I as n,J as r,S as i,Tt as a,Z as o,_ as s,at as c,dt as l,ht as u,it as d,lt as f,n as p,pt as m,r as h,rt as g,v as ee,xt as te}from"./react-vendor-CksvodCd.js";import{t as _}from"./format-XQan9feh.js";import{C as ne,D as v,E as re,M as y,O as ie,S as b,T as x,b as S,k as C,n as ae,r as oe,w,x as T,y as se}from"./index-BHT_F94z.js";import{t as ce}from"./useJsonLd-DPwiq2wD.js";var E=e(a(),1),D=m(),O={eggless:{label:`Eggless`,icon:`🌱`,kind:`free`},vegan:{label:`Vegan`,icon:`🌿`,kind:`free`},"gluten-free":{label:`Gluten-Free`,icon:`🌾`,kind:`free`},"contains-nuts":{label:`Contains Nuts`,icon:`🌰`,kind:`contains`},"contains-egg":{label:`Contains Egg`,icon:`🥚`,kind:`contains`},"contains-dairy":{label:`Contains Dairy`,icon:`🥛`,kind:`contains`},"contains-gluten":{label:`Contains Gluten`,icon:`🌾`,kind:`contains`},"eggless-option":{label:`Eggless on request`,icon:`🌱`,kind:`option`}},k={free:{bg:`rgba(34, 139, 81, 0.10)`,fg:`#1d6f3a`,border:`rgba(34, 139, 81, 0.35)`},contains:{bg:`rgba(184, 134, 11, 0.12)`,fg:`#8a5d05`,border:`rgba(184, 134, 11, 0.35)`},option:{bg:`rgba(224, 97, 122, 0.08)`,fg:`var(--cc-rose-deep)`,border:`rgba(224, 97, 122, 0.4)`}};function le({allergens:e,verbose:t=!1,size:n=`sm`}){if(!Array.isArray(e)||e.length===0)return null;let r=[`eggless`,`vegan`,`gluten-free`,`contains-nuts`],i=t?e:e.filter(e=>r.includes(e));if(i.length===0)return null;let a=n===`lg`?`0.4rem 0.7rem`:`0.18rem 0.5rem`,o=n===`lg`?`0.78rem`:`0.66rem`;return(0,D.jsx)(`div`,{className:`d-flex flex-wrap`,style:{gap:4},children:i.map(e=>{let t=O[e];if(!t)return null;let n=k[t.kind];return(0,D.jsxs)(`span`,{title:t.label,style:{display:`inline-flex`,alignItems:`center`,gap:3,fontSize:o,fontWeight:600,letterSpacing:`0.02em`,color:n.fg,background:n.bg,border:`1px solid ${n.border}`,padding:a,borderRadius:999,lineHeight:1.1,whiteSpace:`nowrap`},children:[(0,D.jsx)(`span`,{"aria-hidden":!0,style:{fontSize:`0.9em`},children:t.icon}),t.label]},e)})})}var A=3,j=`Small orders bake with the day’s batch`,M=e=>e===1?`We don’t bake a tray for one — yours joins the day’s batch of this flavour.`:`Small orders join the day’s batch of this flavour.`;function N(){return(0,D.jsxs)(`p`,{className:`qv-batch-hint`,children:[(0,D.jsx)(t,{size:12}),j]})}function ue({product:e,onClose:t}){let{add:n}=y(),i=Math.max(1,Number(e?.minQty)||1),[a,s]=(0,E.useState)(i),[c,u]=(0,E.useState)(1),f=(0,E.useRef)(null);if((0,E.useEffect)(()=>{if(!e)return;let n=e=>{e.key===`Escape`&&t()};return document.addEventListener(`keydown`,n),()=>document.removeEventListener(`keydown`,n)},[e,t]),(0,E.useEffect)(()=>{if(!e)return;let t=e=>{f.current?.contains(e.target)||e.preventDefault()};return document.addEventListener(`touchmove`,t,{passive:!1}),document.addEventListener(`wheel`,t,{passive:!1}),()=>{document.removeEventListener(`touchmove`,t),document.removeEventListener(`wheel`,t)}},[e]),!e)return null;let p=e,m=i>1||p?.piece===!0,h=p?.piece===!0;function g(e,r){n(e,r),t()}return(0,D.jsxs)(`div`,{role:`dialog`,"aria-modal":`true`,"aria-label":p.name,onClick:t,className:`qv-backdrop`,children:[(0,D.jsxs)(`div`,{ref:f,onClick:e=>e.stopPropagation(),className:`qv-modal`,children:[(0,D.jsx)(`button`,{onClick:t,"aria-label":`Close`,className:`qv-close`,children:(0,D.jsx)(l,{size:18})}),(0,D.jsxs)(`div`,{className:`qv-grid`,children:[(0,D.jsxs)(`div`,{className:`qv-image-col`,children:[(0,D.jsx)(`img`,{src:T(p.img,800,800),srcSet:S(p.img),sizes:`(min-width: 720px) 300px, 100vw`,alt:p.name,className:`qv-image`}),p.badge&&(0,D.jsx)(`span`,{className:`qv-badge`,children:p.badge})]}),(0,D.jsxs)(`div`,{className:`qv-info-col`,children:[(0,D.jsx)(`div`,{className:`tag-badge mb-1`,style:{fontSize:`0.65rem`},children:p.category}),(0,D.jsx)(`h3`,{className:`qv-title`,children:p.name}),p.allergens?.length>0&&(0,D.jsx)(`div`,{className:`mt-2`,children:(0,D.jsx)(le,{allergens:p.allergens,verbose:!0})}),(0,D.jsx)(`p`,{className:`qv-desc`,children:w(p)}),(0,D.jsx)(`p`,{className:`qv-desc`,style:{fontSize:`0.82rem`,opacity:.85},children:`Handcrafted with the finest ingredients and freshly prepared. Please pre-order at least 1 day in advance.`}),p.slice?(0,D.jsxs)(`div`,{className:`qv-options`,children:[(0,D.jsxs)(`div`,{className:`qv-option${m?` qv-option--qty`:``}`,children:[(0,D.jsxs)(`div`,{className:`qv-option__info`,children:[(0,D.jsxs)(`div`,{className:`qv-option__label`,children:[p.sizeLabel||`Whole`,m&&(0,D.jsxs)(`span`,{className:`qv-option__min`,children:[`Min `,i]})]}),(0,D.jsxs)(`div`,{className:`qv-option__price`,children:[_(p.price),m&&(0,D.jsx)(`span`,{className:`qv-option__sub`,children:`each`})]})]}),m?(0,D.jsxs)(`div`,{className:`qv-qty`,children:[(0,D.jsx)(`span`,{className:`qv-qty__ask`,children:`How many?`}),(0,D.jsxs)(`div`,{className:`qv-qty__row`,children:[(0,D.jsxs)(`div`,{className:`qv-qty__stepper`,children:[(0,D.jsx)(`button`,{type:`button`,onClick:()=>s(e=>Math.max(i,e-1)),disabled:a<=i,"aria-label":`One fewer`,children:(0,D.jsx)(r,{size:13})}),(0,D.jsx)(`span`,{className:`qv-qty__val`,"aria-live":`polite`,children:a}),(0,D.jsx)(`button`,{type:`button`,onClick:()=>s(e=>e+1),"aria-label":`One more`,children:(0,D.jsx)(o,{size:13})})]}),(0,D.jsxs)(`button`,{className:`qv-btn qv-btn--filled qv-qty__add`,onClick:()=>g({...p,name:`${p.name} (${p.sizeLabel||`Whole`})`,note:h&&a<=A?M(a):void 0},a),children:[(0,D.jsx)(d,{size:13}),` Add `,a,` — `,_(p.price*a)]})]})]}):(0,D.jsxs)(`button`,{className:`qv-btn qv-btn--filled`,onClick:()=>g({...p,name:`${p.name} (${p.sizeLabel||`Whole`})`},i),children:[(0,D.jsx)(d,{size:13}),` Add`]})]}),h&&a<=A&&(0,D.jsx)(N,{}),(0,D.jsxs)(`div`,{className:`qv-option`,children:[(0,D.jsxs)(`div`,{className:`qv-option__info`,children:[(0,D.jsx)(`div`,{className:`qv-option__label`,children:p.sliceLabel||`Slice`}),(0,D.jsx)(`div`,{className:`qv-option__price`,children:_(p.slice)})]}),(0,D.jsxs)(`button`,{className:`qv-btn qv-btn--outline`,onClick:()=>g({id:p.id+`-slice`,name:`${p.name} (${p.sliceLabel||`Slice`})`,price:p.slice,img:p.img}),children:[(0,D.jsx)(d,{size:13}),` Add`]})]}),x(p)&&(0,D.jsxs)(`div`,{className:`qv-option qv-option--qty`,children:[(0,D.jsxs)(`div`,{className:`qv-option__info`,children:[(0,D.jsx)(`div`,{className:`qv-option__label`,children:p.unitLabel||`Per piece`}),(0,D.jsxs)(`div`,{className:`qv-option__price`,children:[_(p.unit),(0,D.jsx)(`span`,{className:`qv-option__sub`,children:`each`})]})]}),(0,D.jsxs)(`div`,{className:`qv-qty`,children:[(0,D.jsx)(`span`,{className:`qv-qty__ask`,children:`How many?`}),(0,D.jsxs)(`div`,{className:`qv-qty__row`,children:[(0,D.jsxs)(`div`,{className:`qv-qty__stepper`,children:[(0,D.jsx)(`button`,{type:`button`,onClick:()=>u(e=>Math.max(1,e-1)),disabled:c<=1,"aria-label":`One fewer`,children:(0,D.jsx)(r,{size:13})}),(0,D.jsx)(`span`,{className:`qv-qty__val`,"aria-live":`polite`,children:c}),(0,D.jsx)(`button`,{type:`button`,onClick:()=>u(e=>e+1),"aria-label":`One more`,children:(0,D.jsx)(o,{size:13})})]}),(0,D.jsxs)(`button`,{className:`qv-btn qv-btn--filled qv-qty__add`,onClick:()=>g({id:p.id+`-unit`,name:`${p.name} (${p.unitLabel||`Per piece`})`,price:p.unit,img:p.img,note:c<=A?M(c):void 0},c),children:[(0,D.jsx)(d,{size:13}),` Add `,c,` — `,_(p.unit*c)]})]})]})]}),x(p)&&c<=A&&(0,D.jsx)(N,{})]}):(0,D.jsx)(`div`,{className:`qv-actions`,children:(0,D.jsxs)(`button`,{className:`qv-btn qv-btn--filled w-100`,onClick:()=>g(p),children:[(0,D.jsx)(d,{size:13}),` Add to Cart — `,_(p.price)]})})]})]})]}),(0,D.jsx)(`style`,{children:`
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
      `})]})}var P=[`All Products`,`Cheesecakes`,`Milk Cakes`,`Sponge Cakes`,`Cookies`,`Cupcakes`,`Bakes`,`Cake Pops`,`Cakesicles`,`Dessert Cups`,`Platters`,`Drinks`],F=12,I={"Cake Pops":e=>e.group===`Cake Pops`,Cakesicles:e=>e.group===`Cakesicles`},L=(e,t)=>t===`All Products`?!0:I[t]?I[t](e):e.category===t,R=[{id:`all`,label:`All Prices`,test:()=>!0},{id:`0-200`,label:`₹0 – ₹200`,test:e=>v(e)<=200},{id:`200-500`,label:`₹200 – ₹500`,test:e=>v(e)>200&&v(e)<=500},{id:`500-1000`,label:`₹500 – ₹1000`,test:e=>v(e)>500&&v(e)<=1e3},{id:`1000+`,label:`₹1000+`,test:e=>v(e)>1e3}];function z({checked:e,onChange:t,label:n}){return(0,D.jsxs)(`label`,{className:`cc-shop-radio`,children:[(0,D.jsx)(`input`,{type:`radio`,checked:e,onChange:t,className:`cc-shop-radio__input`}),(0,D.jsx)(`span`,{className:`cc-shop-radio__dot`,"aria-hidden":!0}),(0,D.jsx)(`span`,{children:n})]})}function B(){oe({title:`Shop`,description:`Order from our full menu — cheesecakes, milk cakes, cookies, cupcakes, dessert cups and drinks. UPI / Cash on Delivery.`}),ce(`shop-products`,{"@context":`https://schema.org`,"@type":`ItemList`,name:`Cake & Crumb — Shop`,numberOfItems:C.length,itemListElement:C.slice(0,30).map((e,t)=>({"@type":`ListItem`,position:t+1,item:{"@type":`Product`,name:e.name,description:w(e),category:e.category,image:typeof window<`u`?new URL(T(e.img,800,800),window.location.origin).href:T(e.img,800,800),brand:{"@type":`Brand`,name:`Cake & Crumb`},offers:{"@type":`Offer`,price:ne(e),priceCurrency:`INR`,availability:`https://schema.org/InStock`}}}))});let[e,t]=te(),a=e.get(`category`),m=e.get(`product`),[x,O]=(0,E.useState)(a&&P.includes(a)?a:`All Products`),[k,A]=(0,E.useState)(`all`),[j,M]=(0,E.useState)(`featured`),[N,B]=(0,E.useState)(F),[de,V]=(0,E.useState)(null),[H,U]=(0,E.useState)(!1),[W,G]=(0,E.useState)(null),K=(x===`All Products`?0:1)+(k===`all`?0:1),{items:fe,count:q,subtotal:J,add:pe,increment:me,decrement:he,remove:ge,clear:_e}=y(),Y=(0,E.useMemo)(()=>{let e=R.find(e=>e.id===k)?.test??(()=>!0),t=C.filter(t=>L(t,x)&&e(t));return j===`lowhigh`?t=[...t].sort((e,t)=>v(e)-v(t)):j===`highlow`&&(t=[...t].sort((e,t)=>v(t)-v(e))),t},[x,k,j]),X=Y.slice(0,N),Z=Y.length-X.length,ve=x!==`All Products`&&j===`featured`&&!I[x],ye=(0,E.useMemo)(()=>{if(!ve)return[{name:null,items:X}];let e=[];for(let t of X){let n=t.group||null,r=e[e.length-1];r&&r.name===n?r.items.push(t):e.push({name:n,items:[t]})}return e},[ve,X]);(0,E.useEffect)(()=>{a&&P.includes(a)&&O(a)},[a]),(0,E.useEffect)(()=>{B(F)},[x,k,j]);let Q=(0,E.useRef)(null);(0,E.useEffect)(()=>{if(!m){Q.current=null;return}if(Q.current===m)return;let n=C.find(e=>e.id===m);if(!n)return;Q.current=m,A(`all`),O(e=>L(n,e)?e:n.category),G(m);let r=new URLSearchParams(e);r.delete(`product`),t(r,{replace:!0})},[m,e,t]);let $=(0,E.useRef)(null);(0,E.useEffect)(()=>{if(!W){$.current=null;return}if($.current===W)return;let e=Y.findIndex(e=>e.id===W);if(e===-1)return;if(e>=N){B(Math.ceil((e+1)/F)*F);return}$.current=W,document.getElementById(`product-${W}`)?.scrollIntoView({behavior:`smooth`,block:`center`});let t=setTimeout(()=>G(null),2600);return()=>clearTimeout(t)},[W,Y,N]);let be=()=>{O(`All Products`),A(`all`)},xe=(0,E.useRef)(null);function Se({everyScreen:e=!1}={}){typeof window>`u`||!e&&window.innerWidth>=992||(U(!1),requestAnimationFrame(()=>{let e=xe.current;if(!e)return;let t=parseInt(getComputedStyle(document.documentElement).getPropertyValue(`--cc-header-h`),10)||82,n=e.getBoundingClientRect().top+window.scrollY-t-12;window.scrollTo({top:n,behavior:`smooth`})}))}let Ce=e=>{O(e),Se()},we=e=>{A(e),Se()};return(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(`section`,{className:`cc-shop-hero`,children:(0,D.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,D.jsxs)(`div`,{className:`row g-4 g-lg-5 align-items-center`,children:[(0,D.jsxs)(`div`,{className:`col-lg-6 text-center text-lg-start`,children:[(0,D.jsx)(`span`,{className:`eyebrow mb-3 d-inline-flex`,children:`Shop Our Treats`}),(0,D.jsxs)(`h1`,{className:`cc-shop-hero__title`,children:[`Handcrafted`,(0,D.jsx)(`br`,{}),`Just for You`]}),(0,D.jsx)(ae,{width:50}),(0,D.jsx)(`p`,{className:`cc-shop-hero__lede`,children:`Discover our handmade cakes, cupcakes, cookies, and chocolates — made with the finest ingredients and a whole lot of love.`})]}),(0,D.jsx)(`div`,{className:`col-lg-6`,children:(0,D.jsx)(`img`,{src:T(se.heroShop,1e3,800),alt:`Cupcakes on tiered display stands`,className:`cc-shop-hero__img`,fetchPriority:`high`})})]})})}),(0,D.jsx)(`section`,{className:`cc-shop-main`,children:(0,D.jsx)(`div`,{className:`container py-4`,children:(0,D.jsxs)(`div`,{className:`row g-4`,children:[(0,D.jsx)(`aside`,{className:`col-lg-3 col-xl-2`,children:(0,D.jsxs)(`div`,{className:`cc-shop-filter`,children:[(0,D.jsx)(`h6`,{className:`cc-shop-filter__heading`,children:`Filter By`}),(0,D.jsxs)(`button`,{type:`button`,className:`cc-shop-filter__toggle`,onClick:()=>U(e=>!e),"aria-expanded":H,children:[(0,D.jsxs)(`span`,{className:`cc-shop-filter__toggle-label`,children:[(0,D.jsx)(c,{size:15}),`Filters`,K>0&&(0,D.jsx)(`span`,{className:`cc-shop-filter__count`,children:K})]}),(0,D.jsx)(ee,{size:18,className:`cc-shop-filter__chevron`+(H?` is-open`:``)})]}),(0,D.jsxs)(`div`,{className:`cc-shop-filter__body`+(H?` is-open`:``),children:[(0,D.jsxs)(`div`,{className:`cc-shop-filter__group`,children:[(0,D.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Category`}),P.map(e=>(0,D.jsx)(z,{label:e,checked:x===e,onChange:()=>Ce(e)},e))]}),(0,D.jsxs)(`div`,{className:`cc-shop-filter__group`,children:[(0,D.jsx)(`div`,{className:`cc-shop-filter__label`,children:`Price Range`}),R.map(e=>(0,D.jsx)(z,{label:e.label,checked:k===e.id,onChange:()=>we(e.id)},e.id))]}),(0,D.jsx)(`button`,{type:`button`,className:`cc-shop-filter__clear`,onClick:be,children:`Clear Filters`})]})]})}),(0,D.jsxs)(`div`,{className:`col-lg-6 col-xl-7`,ref:xe,children:[(0,D.jsxs)(`div`,{className:`cc-shop-toolbar`,children:[(0,D.jsxs)(`span`,{className:`cc-shop-toolbar__count`,children:[`Showing `,X.length,` of `,Y.length,` results`]}),(0,D.jsxs)(`label`,{className:`cc-shop-toolbar__sort`,children:[(0,D.jsx)(`span`,{children:`Sort by:`}),(0,D.jsxs)(`select`,{value:j,onChange:e=>M(e.target.value),children:[(0,D.jsx)(`option`,{value:`featured`,children:`Featured`}),(0,D.jsx)(`option`,{value:`lowhigh`,children:`Price: low to high`}),(0,D.jsx)(`option`,{value:`highlow`,children:`Price: high to low`})]})]})]}),(0,D.jsxs)(`p`,{className:`cc-shop-note cc-shop-note--lead`,children:[(0,D.jsx)(i,{size:12}),` Freshly baked to order — please order at least 1 day in advance.`]}),x===`Cupcakes`&&(0,D.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,D.jsx)(n,{size:12}),` Cupcakes come as a box of 6, or buy them by the piece (minimum 2) — tap any cupcake to choose how many. Add ₹20 for floral or additional decoration.`]}),x===`Cake Pops`&&(0,D.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,D.jsx)(n,{size:12}),` Cake pops come as a box of 6, or by the piece (minimum 2) — tap any flavour to choose how many. A box of 12 is simply two sixes.`]}),x===`Cookies`&&(0,D.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,D.jsx)(n,{size:12}),` Boxes of 6 and 12, or single cookies from `,_(b.Cookies[0].from),` — tap any cookie to pick a size. Singles are baked into the day's batch, so a box is still the better value.`]}),x===`Bakes`&&(0,D.jsxs)(`p`,{className:`cc-shop-note`,children:[(0,D.jsx)(n,{size:12}),` Brownies and blondies also come in `,b.Brownies.map(e=>e.label).join(` and `),` — from `,_(b.Brownies[0].from),` and `,_(b.Brownies[1].from),`. Ask on WhatsApp for those.`]}),(0,D.jsxs)(`div`,{className:`cc-shop-grid`,children:[ye.map(e=>(0,D.jsxs)(E.Fragment,{children:[e.name&&(0,D.jsx)(`h3`,{className:`cc-shop-group`,children:e.name}),e.items.map(e=>(0,D.jsxs)(`article`,{id:`product-${e.id}`,className:`cc-product-card`+(e.id===W?` is-flash`:``),children:[(0,D.jsx)(`button`,{type:`button`,onClick:()=>V(e),"aria-label":`View ${e.name}`,className:`cc-product-card__img-btn`,children:(0,D.jsx)(`img`,{src:T(e.img,500,500),srcSet:S(e.img),sizes:`(min-width: 768px) 240px, 46vw`,alt:e.name,loading:`lazy`})}),(0,D.jsxs)(`div`,{className:`cc-product-card__body`,children:[(0,D.jsxs)(`div`,{className:`cc-product-card__cat`,children:[e.category,(0,D.jsx)(le,{allergens:e.allergens})]}),(0,D.jsx)(`h6`,{className:`cc-product-card__name`,children:(0,D.jsx)(`button`,{type:`button`,className:`cc-product-card__name-btn`,onClick:()=>V(e),title:e.name,children:e.name})}),(0,D.jsx)(`div`,{className:`cc-product-card__price`,children:re(e)?(0,D.jsxs)(D.Fragment,{children:[_(e.slice),(0,D.jsx)(`span`,{className:`cc-product-card__price-sub`,children:e.sliceLabel})]}):ie(e)}),(0,D.jsxs)(`button`,{className:`cc-product-card__add`,"aria-label":e.slice?`Choose a size for ${e.name}`:`Add ${e.name} to cart`,onClick:()=>{e.slice?V(e):pe(e)},children:[(0,D.jsx)(d,{size:12}),` Add to Cart`]})]})]},e.id))]},e.name||`_`)),Y.length===0&&(0,D.jsxs)(`div`,{className:`cc-shop-empty`,children:[(0,D.jsx)(`p`,{className:`mb-2`,children:`No products match your filters.`}),(0,D.jsx)(`button`,{type:`button`,className:`cc-shop-empty__clear`,onClick:be,children:`Clear filters`})]})]}),Z>0&&(0,D.jsx)(`div`,{className:`cc-shop-more`,children:(0,D.jsxs)(`button`,{type:`button`,className:`cc-shop-more__btn`,onClick:()=>B(e=>e+F),children:[`Show `,Math.min(Z,F),` more`,(0,D.jsxs)(`span`,{className:`cc-shop-more__n`,children:[Z,` left`]})]})})]}),(0,D.jsx)(`aside`,{className:`col-lg-3`,children:(0,D.jsxs)(`div`,{className:`cc-shop-cart`,children:[(0,D.jsxs)(`div`,{className:`cc-shop-cart__panel`,children:[(0,D.jsxs)(`div`,{className:`cc-shop-cart__head`,children:[(0,D.jsxs)(`span`,{className:`cc-shop-cart__title`,children:[`Your Cart (`,q,`)`]}),q>0&&(0,D.jsx)(`button`,{type:`button`,className:`cc-shop-cart__clear`,onClick:_e,"aria-label":`Clear cart`,children:(0,D.jsx)(l,{size:16})})]}),q===0&&(0,D.jsx)(`p`,{className:`cc-shop-cart__empty`,children:`Your cart is empty.`}),fe.map(e=>(0,D.jsxs)(`div`,{className:`cc-shop-cart__item`,children:[(0,D.jsx)(`img`,{src:T(e.img,200,200),srcSet:S(e.img),sizes:`64px`,alt:``,className:`cc-shop-cart__item-img`}),(0,D.jsxs)(`div`,{className:`cc-shop-cart__item-body`,children:[(0,D.jsxs)(`div`,{className:`cc-shop-cart__item-top`,children:[(0,D.jsx)(`strong`,{className:`cc-shop-cart__item-name`,children:e.name}),(0,D.jsx)(`button`,{type:`button`,onClick:()=>ge(e.id),"aria-label":`Remove`,className:`cc-shop-cart__item-remove`,children:(0,D.jsx)(l,{size:14})})]}),(0,D.jsx)(`div`,{className:`cc-shop-cart__item-price`,children:_(e.price)}),(0,D.jsxs)(`div`,{className:`cc-shop-cart__qty`,children:[(0,D.jsx)(`button`,{className:`qty-btn`,onClick:()=>he(e.id),"aria-label":`Decrease`,children:(0,D.jsx)(r,{size:12})}),(0,D.jsx)(`span`,{children:e.qty}),(0,D.jsx)(`button`,{className:`qty-btn`,onClick:()=>me(e.id),"aria-label":`Increase`,children:(0,D.jsx)(o,{size:12})})]})]})]},e.id)),(0,D.jsxs)(`div`,{className:`cc-shop-cart__subtotal`,children:[(0,D.jsx)(`span`,{children:`SUBTOTAL`}),(0,D.jsx)(`strong`,{children:_(J)})]}),(0,D.jsx)(`p`,{className:`cc-shop-cart__note`,children:`Delivery calculated at checkout. Self-pickup is always free.`}),(0,D.jsxs)(u,{to:`/cart`,className:`btn-rose w-100 justify-content-center mb-2`,style:{pointerEvents:q===0?`none`:`auto`,opacity:q===0?.5:1},tabIndex:q===0?-1:void 0,"aria-disabled":q===0,children:[(0,D.jsx)(d,{size:14}),` View Cart`]}),(0,D.jsxs)(u,{to:`/checkout`,className:`btn-outline-rose w-100 justify-content-center`,style:{pointerEvents:q===0?`none`:`auto`,opacity:q===0?.5:1},tabIndex:q===0?-1:void 0,"aria-disabled":q===0,children:[(0,D.jsx)(s,{size:14}),` Checkout`]})]}),(0,D.jsxs)(`div`,{className:`cc-shop-special`,children:[(0,D.jsx)(`span`,{className:`cc-shop-special__icon`,children:(0,D.jsx)(n,{size:16})}),(0,D.jsx)(`h6`,{className:`cc-shop-special__title`,children:`Need Something Special?`}),(0,D.jsx)(`p`,{className:`cc-shop-special__text`,children:`We love creating custom treats for your special moments.`}),(0,D.jsx)(u,{to:`/contact`,className:`cc-shop-special__btn`,children:`Place Custom Order`})]}),(0,D.jsx)(`ul`,{className:`cc-shop-trust`,children:[{Icon:n,title:`Handcrafted with Love`,text:`Made in small batches with care.`},{Icon:p,title:`Premium Ingredients`,text:`We use only the finest ingredients.`},{Icon:g,title:`Secure Packaging`,text:`Your treats arrive fresh and beautiful.`}].map((e,t)=>(0,D.jsxs)(`li`,{className:`cc-shop-trust__row`,children:[(0,D.jsx)(`span`,{className:`cc-shop-trust__icon`,children:(0,D.jsx)(e.Icon,{size:14})}),(0,D.jsxs)(`div`,{children:[(0,D.jsx)(`div`,{className:`cc-shop-trust__title`,children:e.title}),(0,D.jsx)(`p`,{className:`cc-shop-trust__text`,children:e.text})]})]},t))})]})})]})})}),(0,D.jsx)(`section`,{className:`cc-shop-promise`,children:(0,D.jsx)(`div`,{className:`container py-4 py-md-5`,children:(0,D.jsx)(`div`,{className:`feature-row`,children:[{Icon:p,title:`Fresh & Quality`,text:`We source the freshest ingredients for the best taste and quality.`},{Icon:h,title:`Made to Order`,text:`Every treat is made to order just for you.`},{Icon:f,title:`On-Time Delivery`,text:`We deliver your treats fresh and on time, every time.`},{Icon:g,title:`Safe & Secure`,text:`Secure checkout and careful packaging always.`}].map((e,t)=>(0,D.jsxs)(`div`,{className:`feature-cell text-center cc-shop-promise__cell`,children:[(0,D.jsx)(`span`,{className:`cc-features-card__icon cc-features-card__icon--lg`,children:(0,D.jsx)(e.Icon,{size:22})}),(0,D.jsx)(`div`,{className:`cc-features-card__heading mt-3`,children:e.title}),(0,D.jsx)(`p`,{className:`cc-features-card__text mt-1`,children:e.text})]},t))})})}),q>0&&(0,D.jsxs)(u,{to:`/cart`,className:`shop-cart-pill`,children:[(0,D.jsx)(d,{size:15}),(0,D.jsxs)(`span`,{children:[(0,D.jsx)(`strong`,{children:q}),` `,q===1?`item`:`items`,` · `,_(J)]}),(0,D.jsx)(`span`,{className:`shop-cart-pill__cta`,children:`View cart`})]}),(0,D.jsx)(ue,{product:de,onClose:()=>V(null)},de?.id)]})}export{B as default};