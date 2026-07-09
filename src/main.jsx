import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Bootstrap CSS only — we use its grid/layout utilities. The JS bundle (and the
// Popper dep it carries) is deliberately NOT imported: nothing here uses a Bootstrap
// JS component. The mobile menu, modals, dropdowns and toasts are all hand-rolled,
// so importing it added ~23 KB gzip to every page for nothing. Don't re-add it
// without a `data-bs-*` attribute or a `new bootstrap.*()` call that needs it.
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
