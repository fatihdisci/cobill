import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// VITE_BASE env variable controls the base path:
//   GitHub Pages  → /cobill/  (set automatically by deploy.yml)
//   Capacitor/Dev → ./        (default, no env needed)
export default defineConfig({
  plugins: [react()],
  base: typeof process !== 'undefined' && process.env.VITE_BASE ? process.env.VITE_BASE : './',
})
