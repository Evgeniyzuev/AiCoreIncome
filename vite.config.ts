import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const viteConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
