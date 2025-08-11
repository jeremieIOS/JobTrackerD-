import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Sentry plugin for sourcemap upload and release management
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Enable in production builds only
      disable: process.env.NODE_ENV !== 'production',
      // Upload sourcemaps in production
      sourcemaps: {
        assets: ['./dist/assets/**'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor libraries (most stable)
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          
          // UI Framework (medium stability)
          ui: [
            '@radix-ui/react-tabs',
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-avatar',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            'class-variance-authority',
            'tailwind-merge',
            'tailwindcss-animate'
          ],
          
          // Data & State Management
          query: ['@tanstack/react-query'],
          
          // Forms & Validation
          forms: [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          
          // External APIs (least stable)
          maps: ['@googlemaps/js-api-loader'],
          supabase: ['@supabase/supabase-js'],
          
          // Utilities
          utils: [
            'date-fns',
            'clsx',
            'lucide-react',
            'next-themes'
          ]
        }
      }
    },
    // Optimize chunk size warning threshold
    chunkSizeWarningLimit: 600
  }
})
