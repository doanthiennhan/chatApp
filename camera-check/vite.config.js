import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  // server: {
  //   host: 'nhandt.vn', 
  //   port: 3000,
  // }
});
