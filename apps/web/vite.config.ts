import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  
  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
      include: ['react', 'react-dom'],
      esbuildOptions: {
        define: {
          'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
        },
      },
    },
    resolve: {
      alias: isDevelopment ? {
        'react': 'react/index.js',
        'react-dom': 'react-dom/index.js',
      } : {},
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      'process.env.DEV': JSON.stringify(isDevelopment),
      'process.env.PROD': JSON.stringify(isProduction),
      __DEV__: isDevelopment,
      __PROD__: isProduction,
      'import.meta.env.MODE': JSON.stringify(mode),
    },
    build: {
      minify: 'esbuild',
      sourcemap: !isProduction,
      // Ensure React is built correctly
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
      // Ensure React development mode in dev
      define: {
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      },
    },
  };
});
