import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig(({ mode }) => {
  // Editor variants. `editor-public` hands the panel to every visitor.
  const editorBuild = mode.includes('editor')
  const publicEditor = mode.includes('public')
  const outDir = editorBuild ? (publicEditor ? 'dist-editor-public' : 'dist-editor') : 'dist'

  return {
    base: './',
    publicDir: false,
    define: {
      // Build-time switches: gate optional heavy imports with these so the
      // light build never bundles them.
      __EDITOR__: JSON.stringify(editorBuild),
      __EDITOR_PUBLIC__: JSON.stringify(publicEditor),
    },
    plugins: [react(), viteSingleFile()],
    build: {
      outDir,
      target: 'es2018',
      assetsInlineLimit: 100000000,
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          // Classic script: a module script would be refused on file://.
          format: 'iife',
          inlineDynamicImports: true,
        },
      },
    },
    server: { host: '127.0.0.1', port: 5180 },
  }
})
