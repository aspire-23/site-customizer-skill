---
name: site-customizer
description: Turn an existing website, template, or repo into a config-driven site with a built-in visual editor — text, images and animation toggles editable on the page itself, plus one-click export of a clean standalone file. Use when the user hands over a site or repo and asks for a customizable / self-editable version ("做成可自定义的", "加一个编辑器", "make this template customizable", "我发你一个网站，帮我做自定义功能"). Not for ordinary content edits to an already-finished site.
metadata:
  short-description: Make a site editable and exportable
---

# Site Customizer

Deliverable: the user opens one HTML file, edits anything directly on the page, and exports a clean copy for publishing. Content lives in a single config object; the editor is a build-time variant that never appears in the published output.

## Shape the delivery first

Settle these two before writing code; everything else follows from them.

1. **Output form.** Default to one self-contained HTML file that opens from `file://` and drags straight onto Netlify / Cloudflare Pages. `assets/vite-single-file/` is the build skeleton.
2. **Who may edit.** Owner-only (editor appears locally, or on the web behind `?edit=1`) or everyone (editor always visible). Make it a build flag, and keep the editor out of exported files either way.

## Workflow

### 1. Inventory the site

- List every visible string, image, and repeatable block.
- Split **data** (goes in config) from **layout** (stays in code). Hardcoded section titles, card copy, and CTA labels are the usual misses — if the user can see it, they will want to change it.
- Note every list: projects, experience, education, contacts, nav, placed widgets. Those drive the merge rule below.

### 2. Extract content into one config

- One `defaultConfig` plus one provider merging `defaults ← injected config ← draft`.
- Use the merge from [references/patterns.md](references/patterns.md). The array rule is not optional: a patch such as `projects.0.title` must merge *into* the array. Treating that patch as an object replaces the list with an object, and the page dies on the next `.map`.
- Sanitize on load: coerce known list paths back into arrays so a draft corrupted by an older build still opens.

### 3. Build the editor

- Right-hand panel with one tab per content area, plus a floating edit button.
- Field components: text, textarea, line-list, number, color, select, switch, image upload (downscale to a data URL), icon picker.
- Keep each control next to the content it changes — a section's copy field sits with that section's animation settings, not in a separate settings dump. Collapse advanced parameters.
- Give every editable region a way in: wrap it so a double-click opens the panel, switches to the owning tab, scrolls to the matching control, and highlights it.
- Persist the draft in `localStorage`, scoped per document (see the draft pitfall).

### 4. Export

- Prefer a **pre-built slim template embedded at build time** over cloning the live editor page. Cloning carries the whole editor bundle, so a 1.2 MB site exports as 5–6 MB. `scripts/embed-template.mjs` writes that template module; export then injects the config into it.
- Fall back to cloning only for features the slim template lacks (for example an optional heavy 3D bundle), and say so in the handoff because that case is bigger.
- Inject the config as the first script in `<head>`, escaping `<` as `\u003c` so user text can never close the tag.
- Mark exported files `editorEnabled: false` so no drafting state can leak into a published copy.

### 5. Verify in a browser

Walk [references/pitfalls.md](references/pitfalls.md) before handing over. Minimum: edit one field per tab, export, open the exported file, confirm zero console errors and that the editor is gone.

## References

- [references/patterns.md](references/patterns.md) — config provider, array-safe merge, editor shell, field set, export injection, build modes, draggable/resizable placed widgets.
- [references/pitfalls.md](references/pitfalls.md) — failures that actually happen (blank page from `file://`, list-to-object corruption, shared drafts, export bloat, hosting gotchas) and how to verify each.
