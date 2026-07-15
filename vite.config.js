import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Относительные пути к ассетам — сайт работает на любом хостинге и в любой
  // подпапке (GitHub Pages /repo/, Netlify, свой домен) без правок.
  base: './',
  plugins: [react()],
})
