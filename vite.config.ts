import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isLibraryBuild = mode === 'library';

  const config = {
    plugins: [
      vue(),
      !isLibraryBuild && vueDevTools(),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  };

  if (isLibraryBuild) {
    return {
      ...config,
      plugins: [
        vue(),
        dts({
          rollupTypes: true,
          include: ['src/**/*.vue', 'src/**/*.ts'],
        }),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/lib.ts'),
          name: 'MyCalendar',
          fileName: (format) => `my-calendar.${format}.js`,
        },
        rollupOptions: {
          external: ['vue'],
          output: {
            globals: {
              vue: 'Vue'
            },
            exports: 'named',
          }
        },
      },
    };
  }

  return config;
})
