# Troubleshooting

Start by reproducing the problem in the [plain HTML example](../examples/plain.html). If it works there, compare stylesheet order, root attributes, host overrides, and lifecycle ownership. Use [the API reference](api.md) to check the supported configuration rather than guessing option names.

## Appearance and integration

| Symptom | Check and correction |
| --- | --- |
| Nothing is styled | Load `core.css` and put `data-phosphor` on the intended wrapper, or mount it with `mountPhosphor`. JavaScript imports do not load CSS. Verify the stylesheet request returns CSS rather than an HTML fallback. |
| A named palette does nothing | `data-ph-palette` is metadata. Call `display.update({palette: id})` or load a [generated palette stylesheet](palettes.md). Use an exact namespaced ID. |
| My preset changes when JavaScript starts | Mount options use JavaScript defaults, not existing root attributes. Pass the initial `preset`, `density`, and `effects` explicitly. |
| My custom colors disappear | A mounted owner writes its color variables inline on every update. Add a palette in your vendored catalog or let the host own a CSS-only scope. |
| The glow slider has no visible effect | Check effects-off, crisp text, system increased contrast, and `.ph-sharp`/native code/input exclusions. Observe a normal paragraph or heading. The value scales shadows, not foreground brightness. |
| Raster remains when Glass is zero | Raster and glass are independent. Set both to zero to suppress those overlay layers; CSS fog and panels remain. Effects-off removes the decorative treatment as a whole. |
| My entire editor looks softened | Remove host full-content blur filters. Use `.ph-sharp` for precision regions. Move the editor outside the scope if it must avoid the overlay too. |
| Glow clips at a panel edge | Check host `overflow: hidden`, containment, masks, and clipping. Add space around glyphs or move the scope to a suitable wrapper. The toolkit does not rewrite host clipping. |
| Decorative layers replace my pseudo-elements | The scope owns `::before` and `::after`. Add a separate wrapper whose pseudo-elements are unused. |
| A positioned element moves | The scope becomes positioned and isolated. Recheck the host's containing block and stacking context. Avoid applying the scope directly to an element that must retain different positioning. |
| Raster stops partway through a long scroll | Decorate the natural-height content inside the scroll owner; a fixed-height owner's absolute overlay does not cover all overflow. |
| A portal or dialog lacks colors | Keep a native dialog inside the scope or provide a separate scope/token bridge for external portals. Do not nest Phosphor scopes to work around this. |
| Custom text ignores the palette | The host selector may set a fixed `color` or `font`. Map it to the semantic variables; load intentional overrides after the toolkit. |
| A CSS-only scope has unexpected spacing | Bare core defaults differ from the JavaScript compact preset. Set explicit preset/density attributes; see [the style reference](style-reference.md). |

## Fonts and delivery

Victor Mono requires `src/fonts.css` after `core.css`, `data-ph-font="victor-mono"` on the scope, and the four files under `fonts/victor-mono/` at their preserved relative paths. Inspect font requests for 404s. Keep the font license with the files. If using a host font, omit the opt-in and set `--ph-font` on your scope instead.

Raw source imports use ES modules and a JSON import attribute. Open the page through an HTTP server, not `file://`. If a browser rejects `with { type: 'json' }`, use the Vite-built output or CSS-only integration; do not serve JSON as JavaScript. Confirm module responses have appropriate MIME types. The built demo bundles its catalog, whereas copying unbundled sources preserves the browser's JSON-module requirement.

When embedding at a subpath, configure and test your host build's asset base. The demo currently uses root-relative links such as `/examples/plain.html`, `/source.tgz`, and `/LICENSE`. Setting Vite's asset base alone does not rewrite every hardcoded navigation/source link. A root-domain deployment is the documented demo setup.

The toolkit makes no API calls or analytics requests. It loads local modules, styles, and optional fonts. A restrictive host Content Security Policy must account for its own scripts/styles/fonts and the toolkit's runtime style assignments. Test your actual policy; the repository does not ship a universal CSP or recommend disabling one. Copy the examples into external modules if your policy disallows inline script blocks.

## Ambient light

First confirm `mountAmbient(root)` was called after the root was connected and decorated. `effects: 'on'` alone does not import or create the renderer. Check `ambient.stats`; the [API guide](api.md) explains each field.

Ambient light is intentionally absent with reduced motion, increased contrast, forced colors, coarse pointers/no hover, hidden tabs, offscreen roots, and effects-static/off. A WebGL setup or shader failure uses CSS fallback. Those cases should preserve the interface and its native interactions.

If colors change via an ancestor class or stylesheet replacement, call `ambient.update()`. Root inline styles and relevant data attributes are observed, but arbitrary ancestor mutations are not. If the canvas remains static after inserting a previously detached root, call `update()` after insertion; prefer mounting once the root is connected.

Multiple canvases or persistent work after navigation indicate an ownership problem. Keep one owner per root and destroy it in the host cleanup hook. Do not remount on every keystroke or dynamic child update.

## Local commands and builds

| Error or symptom | Correction |
| --- | --- |
| `npm ci` reports a missing lockfile | Run at the repository root with the committed `package-lock.json`. For Cloudflare, confirm the selected commit includes it and the root directory is correct. |
| Unsupported syntax or dependency engine | Use Node.js 24.19.0 from `.node-version`, then install with `npm ci --include=dev`. |
| Port is already in use | Use the printed Vite URL, or choose an available port with `npm run dev -- --port 5180 --strictPort`. |
| Playwright browser executable is missing | Run `npx playwright install chromium` for the main suite. Optional engines require their own downloads. |
| Browser cannot load shared libraries | Install supported platform dependencies for that browser/environment. A launch failure is not a compatibility pass. WebKit has not been verified by this project. |
| Build reaches packaging and `tar` fails | Packaging requires GNU `tar`, including its ownership/timestamp options. Use a GNU/Linux environment or WSL for this build path; macOS BSD tar and native Windows are not verified packaging environments. |
| Source download is missing or stale locally | Run `npm run build`. The development link serves the latest `dist/source.tgz`; it does not rebuild on each request. Use `npm run preview` to inspect the whole production output. |
| The source archive is missing a new guide/file | Add it explicitly in `scripts/package-demo.mjs`, rebuild, and inspect archive members. Do not replace the allowlist with a recursive worktree archive. |
| A setup link resets settings | The playground validates namespaced IDs, views, keys, and numeric ranges. Unknown/invalid settings display a fallback message. Old links may need updating after experimental API changes. |

## Deployed site

For Cloudflare build/root/domain settings, use [Deployment](deployment.md). Verify the deployment's commit matches what you pushed. A build on an older commit cannot contain unpushed local files. Opening the new deployment URL helps separate build content from a cached custom-domain response.

An active Pages custom domain can still be missing from a resolver cache. Browser reload refreshes page resources; it does not guarantee that operating-system, router, or upstream DNS caches are cleared. Compare the assigned Pages URL with the custom address and inspect the failing browser's exact error before changing anything. Do not change the parent site's working DNS records to troubleshoot this subdomain.

## Useful bug reports

Include the browser/version, OS, viewport and zoom, affected specimen or minimal synthetic HTML, copied configuration/setup link, relevant console error, reproduction steps, and expected/actual behavior. For ambient problems, include `ambient.stats` and relevant motion/contrast/pointer preferences. Remove credentials and private application data before posting. See [Contributing](../CONTRIBUTING.md).
