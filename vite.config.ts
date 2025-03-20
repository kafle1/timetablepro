/// <reference types="vitest" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    
    server: {
        watch: {
            usePolling: true
        }
    },
    
    define: {
        'import.meta.vitest': 'undefined'
    }
});
