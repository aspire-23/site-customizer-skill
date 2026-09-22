/**
 * Post-build step for the single-file site: make it openable from `file://`.
 *
 * Vite emits the inlined bundle as `<script type="module">` inside `<head>`.
 * Browsers refuse module scripts from `file://`, and a classic script in
 * `<head>` would run before `<div id="root">` exists, so we drop the module
 * type and move the bundle to the end of `<body>`.
 *
 * Usage: node scripts/classic-script.mjs [dist-dir]
 */
import { readFile, writeFile } from 'node:fs/promises'

const targetDir = process.argv[2] ?? 'dist'
// This file lives in <project>/scripts/, so one level up is the project root.
const file = new URL(`../${targetDir}/index.html`, import.meta.url)
let html = await readFile(file, 'utf8')

const openMatch = /<script\b[^>]*>/.exec(html)
if (!openMatch) throw new Error('classic-script: no <script> tag found in the build output')

const openTag = openMatch[0]
const start = openMatch.index
const closeIndex = html.indexOf('</script>', start)
if (closeIndex === -1) throw new Error('classic-script: unterminated <script> tag')

const end = closeIndex + '</script>'.length
const code = html.slice(start + openTag.length, closeIndex)

const withoutBundle = html.slice(0, start) + html.slice(end)
const bodyClose = withoutBundle.lastIndexOf('</body>')

const output =
  bodyClose === -1
    ? withoutBundle.replace('<head>', `<head><script>${code}</script>`)
    : `${withoutBundle.slice(0, bodyClose)}    <script>${code}</script>\n  ${withoutBundle.slice(bodyClose)}`

const cleaned = output.replace(/<link rel="modulepreload"[^>]*>\s*/g, '').replace(/\n{3,}/g, '\n\n')
await writeFile(file, cleaned)

const modules = (cleaned.match(/type="module"/g) ?? []).length
const importMeta = (cleaned.match(/import\.meta/g) ?? []).length
console.log(`[classic-script] ${targetDir}: type=module → ${modules}, import.meta → ${importMeta}`)
if (modules || importMeta) {
  throw new Error('classic-script: module syntax still present, the file will not run from file://')
}
