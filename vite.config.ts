import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/MECH123/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
})
