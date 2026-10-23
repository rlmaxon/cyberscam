import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Absolute base so deep links like /training/email/abc load assets correctly
  base: '/',
})
