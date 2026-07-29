import { useEffect, useRef, useState } from 'react'
import { FiLock, FiAlertTriangle } from 'react-icons/fi'
import { getAccPinHash, setAccPin, verifyAccPin } from '../../../services/accounting.js'

const MAX_TRIES = 5
const COOLDOWN_MS = 30000
const errText = (err) => err?.code || err?.message || 'Could not reach the database.'

/**
 * Second lock on /admin/accounting, after the Firebase Auth sign-in. The money
 * pages are the ones worth a extra step on a shop-counter device that stays
 * signed in; the website Orders page is not gated.
 *
 * No PIN is baked into the code — on first use this screen asks the owner to
 * choose one, and stores only its hash (see services/accounting.js). If it is
 * ever forgotten, deleting the `accPinHash` field from `acc_settings/main` in
 * the Firebase console brings this screen back in "choose a PIN" mode.
 */
export default function PinGate({ onUnlock }) {
  const [hash, setHash] = useState(undefined) // undefined = still loading
  const [loadError, setLoadError] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [tries, setTries] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const inputRef = useRef(null)

  const settingUp = hash === null
  const cooling = lockedUntil > now
  const waitLeft = Math.ceil((lockedUntil - now) / 1000)

  // Retry path — safe to set state synchronously here, it runs from a click.
  async function load() {
    setLoadError(''); setHash(undefined)
    try { setHash(await getAccPinHash()) } catch (err) { setLoadError(errText(err)) }
  }
  // Mount path is separate so nothing is set synchronously inside the effect,
  // and so a resolve after unmount doesn't set state on a dead component.
  useEffect(() => {
    let active = true
    ;(async () => {
      try { const h = await getAccPinHash(); if (active) setHash(h) }
      catch (err) { if (active) setLoadError(errText(err)) }
    })()
    return () => { active = false }
  }, [])
  useEffect(() => { if (hash !== undefined) inputRef.current?.focus() }, [hash])

  // Only ticks while a cooldown is running, so it isn't a permanent timer.
  useEffect(() => {
    if (!cooling) return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [cooling])

  async function submit(e) {
    e.preventDefault()
    if (cooling) return
    setError(''); setBusy(true)
    try {
      if (settingUp) {
        if (pin !== confirmPin) { setError('The two PINs don’t match.'); return }
        await setAccPin(pin)
        onUnlock()
      } else if (await verifyAccPin(pin, hash)) {
        onUnlock()
      } else {
        const n = tries + 1
        setTries(n)
        setPin('')
        if (n >= MAX_TRIES) { setLockedUntil(Date.now() + COOLDOWN_MS); setNow(Date.now()); setTries(0); setError(`Too many wrong tries.`) }
        else setError(`Wrong PIN. ${MAX_TRIES - n} tr${MAX_TRIES - n === 1 ? 'y' : 'ies'} left.`)
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong.')
    } finally { setBusy(false) }
  }

  if (hash === undefined && !loadError) {
    return <div className="container py-5 text-center text-muted">Checking…</div>
  }

  return (
    <div className="container py-5" style={{ maxWidth: 400 }}>
      <div className="text-center mb-4">
        <div style={{ fontSize: 38, color: 'var(--cc-rose,#e0617a)' }}><FiLock /></div>
        <h3 style={{ fontFamily: 'var(--font-heading,serif)', color: '#cf3e63' }}>
          {settingUp ? 'Choose an accounting PIN' : 'Accounting PIN'}
        </h3>
        <p className="text-muted small mb-0">
          {settingUp
            ? 'Pick 4–8 digits. You’ll need it each time you open Daily Accounting on this device.'
            : 'Extra step before the money pages open.'}
        </p>
      </div>

      {loadError ? (
        <div className="alert alert-warning d-flex align-items-start gap-2 py-2 px-3" style={{ borderRadius: 12 }}>
          <FiAlertTriangle className="flex-shrink-0 mt-1" />
          <div className="small">
            Couldn’t check the PIN — <strong>{loadError}</strong>. Not unlocking on a failed check.
            <button type="button" className="btn btn-sm btn-link p-0 ms-1" onClick={load}>Try again</button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="card p-4 border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <input
            ref={inputRef}
            className="form-control mb-2 text-center"
            style={{ letterSpacing: '0.5em', fontSize: '1.25rem', fontWeight: 700 }}
            type="password" inputMode="numeric" autoComplete="off"
            placeholder="••••••" maxLength={8} value={pin} disabled={cooling}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          />
          {settingUp ? (
            <input
              className="form-control mb-2 text-center"
              style={{ letterSpacing: '0.5em', fontSize: '1.25rem', fontWeight: 700 }}
              type="password" inputMode="numeric" autoComplete="off"
              placeholder="repeat" maxLength={8} value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            />
          ) : null}

          {error ? <div className="text-danger small mb-2">{error}</div> : null}
          {cooling ? <div className="text-muted small mb-2">Try again in {waitLeft}s.</div> : null}

          <button
            className="btn text-white" style={{ background: 'var(--cc-rose,#e0617a)' }}
            disabled={busy || cooling || pin.length < 4 || (settingUp && confirmPin.length < 4)}
          >
            {busy ? 'Checking…' : settingUp ? 'Save PIN & open' : 'Sign in'}
          </button>
        </form>
      )}

      <p className="text-muted mt-3 mb-0" style={{ fontSize: '0.76rem', lineHeight: 1.5 }}>
        This is a convenience lock for a device that stays signed in — it is not a
        replacement for your admin password, which is the real protection.
      </p>
    </div>
  )
}
