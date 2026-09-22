# Pitfalls

Every item below has actually broken a delivered site. Check the symptom, apply the fix, then verify.

## 1. Blank page when the file is opened from disk

**Symptom.** Double-clicking the exported HTML shows the right `<title>` and a white screen. Console: `Failed to load module script` or a React "Target container is not a DOM element" (#299).

**Cause.** A Vite build emits the bundle as `<script type="module">` inside `<head>`. Browsers refuse module scripts from `file://`. Simply removing `type="module"` is not enough either: a classic script in `<head>` runs before `<div id="root">` exists.

**Fix.** Emit a classic (IIFE) bundle and move it to the end of `<body>` — `scripts/classic-script.mjs`. Verify the output has no `type="module"`, no `import.meta`, and a single `index.html` with no sibling JS chunks.

## 2. Editing a nested list field blanks the whole site

**Symptom.** Editing a project title, an experience row, a contact, or a placed widget makes the page disappear. Console: `TypeError: A.map is not a function`.

**Cause.** The patch `{ projects: { 0: { title } } }` was merged as a value, replacing the projects **array** with an **object**. Any `.map` on it throws and React unmounts the tree.

**Fix.** Array-aware merge plus `sanitizeConfig` on load ([patterns.md](patterns.md#config-provider)). Then verify by editing one field in **every** tab, not just one — the bug only shows on list-backed fields.

## 3. Drafts bleed between files

**Symptom.** A file opens with another file's content, or an exported site shows edits that were never exported.

**Cause.** All `file://` pages share one `localStorage` origin, so a single global key mixes drafts. The same mixing earlier caused "the second version doesn't show my change" — version one had stored its own portrait mode under the shared key.

**Fix.** Key the draft by `location.pathname`; make exported files ignore the draft entirely (`editorEnabled: false` wins over any stored draft).

## 4. Exported files inherit the whole editor

**Symptom.** A 1.2 MB site exports as 5–6 MB.

**Cause.** Export clones the live editor page, bundle included.

**Fix.** Embed a pre-built slim template at build time and inject the config into it ([patterns.md](patterns.md#export)). Report the exported size in the handoff and say which case still falls back to cloning.

## 5. The light variant quietly gets heavy

**Symptom.** A build that cannot use a feature (3D, physics, a component library) still ships its code.

**Cause.** The component is imported unconditionally, or only hidden at runtime.

**Fix.** Gate the import with a build-time flag so the bundler drops it, and prove it by grepping the output:

```bash
grep -c "WebGLRenderer" dist/index.html   # expect 0 in the light build
```

Same for a big inline asset: shrink or replace it before embedding (a 2.4 MB model whose texture was
an unused demo image dropped to 160 KB), then re-measure.

## 6. The editor hides where the user expects it

**Symptom.** "The edit button disappeared after uploading." The hosted page looks clean and has no editor.

**Cause.** By design: the public page shows the editor only with `?edit=1`.

**Fix.** Say the exact URL (`https://site.netlify.app/?edit=1`) and how to publish an edit: change → export → re-upload. Also mention that a hard refresh (Ctrl+Shift+R) may be needed after re-uploading.

## 7. Host-level surprises

- **Netlify password protection** returns `401` + a "Password Protection" page for *every* path, including `/index.html`. Site configuration → Access & security. Check from outside with `curl -I` before blaming the deploy.
- **404 at the root** usually means the upload had one extra folder level, or the file was not named `index.html`. Drop the folder's *contents*.
- A site deployed to a URL when the user meant another one is common right after Drop creates a new site — confirm the production URL from the site overview.

## 8. Verification shortcuts that mislead

- **`file://` cannot be opened by an automated browser** (URL policy blocks it). Test over `http://127.0.0.1:<port>` and verify the `file://` case by static checks on the built HTML, plus a request for the user to confirm.
- The in-app browser **does not perform downloads**, so "生成 HTML" appears to do nothing there. Test the export path through an in-page preview (render the produced HTML in an iframe) instead, and tell the user to click the download in their own browser.
- `document.getElementById(...).childElementCount` can read as `undefined` in a read-only evaluation scope — do not use it as a page-alive check; assert on real content (a heading's text, a known card count) instead.
- Always read the console after a batch of edits. One `ReferenceError` from a stale destructure blanks the entire app while the panel keeps rendering — a "nothing happened" report is often this.
