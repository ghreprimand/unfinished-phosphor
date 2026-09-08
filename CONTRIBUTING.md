# Contributing

Use [GitHub issues](https://github.com/ghreprimand/unfinished-phosphor/issues) for reproducible bugs and proposals. For a larger API or behavior change, describe the consumer problem and intended interface before implementing it. Small fixes can be submitted directly as a pull request.

## Set up and validate

Use Node.js 24.19.0 and npm. GNU `tar` is needed for the downloadable-source build; the verified packaging path is GNU/Linux. No runtime secrets or sibling projects are needed.

```sh
npm ci --include=dev
npx playwright install chromium
npm run check
npm run dev
```

`npm run check` validates documentation, palette data, browser behavior, and the production build. The browser tests start their configured Vite server automatically; inspect [playwright.config.js](playwright.config.js) for its port and server reuse. The manual dev server normally prints `http://localhost:5173/`. If needed, choose a free port with `--port 5180 --strictPort`.

| Command | Purpose |
| --- | --- |
| `npm run test:docs` | Local documentation links/anchors, JavaScript syntax, documented palette IDs, and API-export coverage |
| `npm test` | Complete palette snapshot, provenance structure, semantic tokens, and contrast |
| `npm run test:browser` | Chromium interactions, accessibility checks, effects, lifecycle/fallback, responsiveness, and documented integration examples |
| `npm run build` | Static demo plus notices and explicit source archive |
| `npm run preview` | Serve the built output, normally at port 4173 |

For optional engine checks, install the browser and its supported platform dependencies, start the dev server at port 5180, and run:

```sh
npx playwright install firefox webkit
npm run dev -- --port 5180 --strictPort
# In another terminal:
npm run test:engines -- firefox
npm run test:engines -- webkit
```

Or set `PHOSPHOR_TEST_URL=http://localhost:4173/` when checking a running production preview. Firefox has smoke coverage. WebKit/Safari remains unverified; record browser-launch failures and don't count them as passes.

## Source layout

| Location | Responsibility |
| --- | --- |
| `src/core.css` | Scoped tokens, typography, optics, preferences, and print behavior |
| `src/components.css` | Optional native-element appearance; no widget logic |
| `src/fonts.css`, `fonts/` | Optional self-hosted Victor Mono and its provenance/license |
| `src/index.js` | Validated configuration, scope ownership, events, cleanup |
| `src/ambient.js` | Optional WebGL resources, scheduling, observers, fallback |
| `src/palettes.js`, `src/palette-snapshot.json` | Catalog, pure resolver, provenance |
| `playground/`, `index.html` | Demonstration UI, synthetic fixtures, configuration links |
| `examples/` | Standalone native integration and component references |
| `docs/` | Public guides and reference material |
| `tests/` | Palette and browser validation |
| `scripts/package-demo.mjs` | Explicit distribution allowlist and build notices |

## Changes to the treatment

Keep palette, preset, density, and effects independent. Preserve native text, focus, selection, form behavior, and host content. Keep effects within their scope and preserve a useful CSS fallback. Reduced motion must retain static glow while stopping ambient rendering. Do not add a traveling scanline, pulsing brightness, full-content blur, or continuous idle animation to the default treatment.

Check the relevant specimens with long text, code, controls, status colors, and tables. Review narrow screens, large displays, zoom, and reduced-motion/effects-off states. Lifecycle changes need checks for repeated mounts, cleanup, hidden/offscreen roots, context failure/loss, and resize. Avoid modifying unrelated example behavior to make a screenshot look better.

For a palette, follow [the catalog procedure](docs/palettes.md). Use traceable public sources, preserve exact applicable notices, document the role mapping and modifications, and check every surface/foreground pair. Do not import an unreviewed catalog in bulk. Do not rename existing palette IDs casually: saved setup links and consumer configs use them.

## Documentation changes

Update the guide that owns the behavior and link it from [the documentation index](docs/README.md). Keep the README a starting point. API changes need updated defaults/errors/events; new classes and variables need style-reference entries; palette changes need catalog/provenance/notices updates.

Use executable commands and complete setup paths. Mark illustrative framework recipes as such. Avoid claiming npm publication, browser compatibility, accessibility certification, or integrations that were not verified. Documentation checks catch syntax and link drift; inspect examples in a browser when their behavior changes.

Add new public guides, examples, or build/test inputs to `scripts/package-demo.mjs`. After building, confirm `dist/source.tgz` contains everything needed to reproduce the output and no private working files. The archive deliberately excludes Git history and the rest of the worktree.

## Pull requests and publication

Describe the concrete problem, resulting behavior, and validation. Include synthetic screenshots only when they help review a visual change. Run the relevant checks and disclose limitations. Contributions to toolkit code/examples use GPL-3.0-only; imported material retains its applicable upstream terms. Do not add proprietary-use exceptions or remove third-party notices.

Review exact staged files and commit metadata before pushing. Exclude credentials, environment files, private notes, application data, and authenticated screenshots. `.gitignore` is only a safeguard. A pull request may be public: do not post an exposed credential as a reproduction. If you discover a credential, the owner needs to revoke it through its provider; deleting the visible line alone does not invalidate it.

The maintainer publishes reviewed `main` changes through Cloudflare Pages. The repository remains `private: true` in package metadata to prevent accidental npm publication. See [Deployment](docs/deployment.md) for the release procedure and source-download checks.
