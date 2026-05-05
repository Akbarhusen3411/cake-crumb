// Vite's base path (e.g. "/cake-crumb/" on GitHub Pages, "/" on local dev without base).
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

// Helper for /public assets — prefix with base URL so they resolve correctly under Vite's `base`.
export const asset = (path) => BASE + (path.startsWith('/') ? path : '/' + path)

// If the value starts with "/" it's a local file in /public; prefix it with the base URL.
// Otherwise treat it as an Unsplash photo ID and build a sized URL.
export const u = (idOrPath, w = 800, h = 800) => {
  if (typeof idOrPath === 'string' && idOrPath.startsWith('/')) return BASE + idOrPath
  return `https://images.unsplash.com/photo-${idOrPath}?w=${w}&h=${h}&fit=crop&auto=format&q=80`
}

export const img = {
  // Local hero images (provided by user — see /public)
  heroRoses: '/hero-roses.jpeg',
  pinkRoses: '/hero-roses.jpeg',
  pinkDripCake: '/hero-cake.jpeg',
  pinkDripCake2: '/hero-cake.jpeg',
  cakeStand: '/hero-cake.jpeg',
  dessertTable: '/hero-cupcakes.jpeg',

  // Unsplash IDs for product / decorative images
  berryCake: '1488477181946-6428a0291777',
  chocolateCake: '1578985545062-69928b1d9587',
  chocolateBerryCake: '1488477181946-6428a0291777',
  cupcakesPink: '1486427944299-d1955d23e34d',
  cupcakesRose: '1587668178277-295251f900ce',
  cookies: '1499636136210-6f4ee915583e',
  truffles: '1548741487-18d363dc4469',
  truffleBox: '1481391319762-47dff72954d9',
  macarons: '1569864358642-9d1684040f43',
  cakePops: '1519869325930-281384150729',
  redVelvet: '1546069901-ba9599a7e63c',
  baker: '1556910103-1c02745aae4d',
  bakerPiping: '1607478900766-efe13248b125',
  rosesBouquet: '1455659817273-f96807779a8a',
  flourSplash: '1486427944299-d1955d23e34d',
  cakeSlice: '1606312619070-d48b4c652a52',
  brownies: '1606313564200-e75d5e30476c',
  cheesecake: '1567306226416-28f0efdc88ce',
}
