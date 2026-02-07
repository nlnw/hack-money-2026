import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: cloudflare({
        mode: 'directory',
        platformProxy: {
            enabled: true,
        }
    }),
    integrations: [react()],
    vite: {
        plugins: [
            nodePolyfills({
                globals: {
                    Buffer: true,
                    global: true,
                    process: true,
                },
                protocolImports: true,
            }),
        ],
        resolve: {
            alias: {
                process: "process/browser",
                util: "util",
            },
        }
    }
});
