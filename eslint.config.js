import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // DX / migration rules from the react-compiler ruleset — kept visible as
      // warnings rather than build-failing errors. The flagged cases here are
      // intentional & safe: setState in init/reset effects, Date.now() inside
      // event handlers (not render), and constant exports beside components.
      'react-refresh/only-export-components': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
  {
    // Build/tooling scripts run under Node, not the browser.
    files: ['scripts/**/*.js'],
    languageOptions: { globals: globals.node },
  },
])
