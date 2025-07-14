import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: false,
            pwaAssets: {
                disabled: false,
                config: true,
            },
            manifest: {
                name: 'KNG',
                short_name: 'KNG',
                description: 'kng - Tu aliado digital para la gestión de negocios',
                theme_color: '#642869',
                background_color: '#ffffff',
                icons: [
                    {
                        src: '/img/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/img/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                
                ],
                start_url: '/',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff,woff2,ttf,eot}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                     {
                       urlPattern: /\.(?:png|gif|jpg|jpeg|svg|webp)$/,
                       handler: 'CacheFirst',
                       options: {
                         cacheName: 'images-cache',
                         expiration: {
                           maxEntries: 60,
                           maxAgeSeconds: 30 * 24 * 60 * 60,
                         },
                         cacheableResponse: { statuses: [0, 200] },
                       },
                     },
                    {
                      urlPattern: ({ request, url }) =>
                        request.headers.has('X-Inertia') || url.pathname.startsWith('/api/'),
                      handler: 'NetworkFirst',
                      options: {
                        cacheName: 'inertia-api-cache',
                        networkTimeoutSeconds: 10,
                        expiration: {
                          maxEntries: 30,
                          maxAgeSeconds: 60 * 60 * 24 * 7,
                        },
                        cacheableResponse: { statuses: [0, 200] },
                      },
                    },
                ],
            },
            devOptions: {
                enabled: true,
                type: 'module',
            },
        }),
    ],

});
