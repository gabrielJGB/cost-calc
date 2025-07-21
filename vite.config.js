import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact(),tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['preact.svg'],
    manifest: {
      name: 'Calculadora',
      short_name: 'Calculadora',
      description: 'Calculadora de costo/venta',
      display: 'standalone',
      background_color: '#1e293b',
      theme_color: '#1e293b',
      start_url: '/',
      icons: [
        {
          src: 'calc_64x64.png',
          sizes: '64x64',
          type: 'image/png'
        },
        {
          src: 'calc_128x128.png',
          sizes: '128x128',
          type: 'image/png'
        },
        {
          src: 'calc_256x256.png',
          sizes: '256x256',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    }
  })],
})





