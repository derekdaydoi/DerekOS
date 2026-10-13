import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the bundle loads from file:// inside Electron
export default defineConfig({ base: './', plugins: [react()] });
