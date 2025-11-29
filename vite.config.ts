import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Replace 'academiml' with your actual repository name
  // If your repo is https://github.com/user/my-project, this should be '/my-project/'
  base: '/academiml/', 
})