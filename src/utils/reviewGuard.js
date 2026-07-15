// Lightweight client-side anti-spam for the review forms.
//
// This is a *speed bump*, not real security — localStorage clears and a
// determined attacker can POST straight to Firestore. The real protection is
// the Firestore security rules (+ Firebase App Check if you enable it). These
// helpers just stop casual double-submits and naive bots.

const RATE_KEY = 'cc_review_last_v1'
const COOLDOWN_MS = 60_000 // at most one review per minute per browser

// Remaining cooldown in ms (0 = allowed to submit now).
export function reviewCooldownMs() {
  try {
    const last = Number(localStorage.getItem(RATE_KEY) || 0)
    const elapsed = Date.now() - last
    return elapsed >= 0 && elapsed < COOLDOWN_MS ? COOLDOWN_MS - elapsed : 0
  } catch {
    return 0
  }
}

// Record that a review was just submitted (starts the cooldown).
export function markReviewSubmitted() {
  try {
    localStorage.setItem(RATE_KEY, String(Date.now()))
  } catch {
    /* storage blocked — best effort only */
  }
}

// A honeypot field is a hidden input real users never see. Bots that auto-fill
// every field will fill it; humans leave it empty. Pass the input's value.
export function isHoneypotTripped(value) {
  return Boolean(value && String(value).trim())
}

// Inline style for the hidden honeypot input — visually gone, still in the DOM
// so bots find and fill it.
export const HONEYPOT_STYLE = {
  position: 'absolute',
  left: '-9999px',
  width: '1px',
  height: '1px',
  opacity: 0,
  overflow: 'hidden',
}
