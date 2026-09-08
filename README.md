# Unfinished Phosphor

**A CRT presentation toolkit by [Unfinished Works](https://unfinished-works.com/).**

Illuminated text, dark glass, stationary raster, and optional ambient light for native web interfaces.

> **Status: experimental demonstration.** The toolkit code is licensed under GPL-3.0-only. The first public edition includes seven palettes with documented origins. No npm package is published.

[Open the demo](https://phosphor.unfinished-works.com/) · [Getting started](docs/getting-started.md) · [Component reference](https://phosphor.unfinished-works.com/examples/components.html) · [Integration guide](docs/integration.md) · [Third-party credits](THIRD_PARTY_NOTICES.md)

## License

Copyright (C) 2026 Unfinished Works. The toolkit code and examples are licensed under the [GNU General Public License, version 3 only](LICENSE), without warranty. You may redistribute and modify them under those terms. No proprietary-use exception or separate permissive license for examples is granted.

Imported themes retain their applicable upstream licenses and notices. The bundled Victor Mono fonts retain their SIL OFL 1.1 license. See [third-party notices](THIRD_PARTY_NOTICES.md) for pinned sources and full license texts. The GPL designation does not claim ownership of third-party theme names or material. Unreviewed palettes from local development are excluded from the public edition.

## Run locally

Use Node.js 24.19.0 (recorded in `.node-version`) and npm. Building the source download also requires GNU `tar`.

```sh
npm ci --include=dev
npm run dev
```

Vite normally serves at `http://localhost:5173/`. To select an available port explicitly:

```sh
npm run dev -- --port 5180 --strictPort
```

The display lab opens with a typography and optics specimen. Website, dashboard, and workbench examples remain available with invented content. Filter a project queue, inspect native dialogs, explore file tabs, edit a session-only draft, and copy the current configuration or a link to the complete setup. Glow softness, raster, and glass are adjustable from 0–100. Palette, presentation, density, and effects are independent. Changing a palette preserves content and layout.

## Decorate existing HTML

For file-copy instructions and a complete HTML page, start with [Getting started](docs/getting-started.md). Load the scoped core. The component and font stylesheets are optional.

```html
<link rel="stylesheet" href="./src/core.css">
<link rel="stylesheet" href="./src/components.css">

<section id="my-interface">
  <!-- Keep your application's HTML and behavior. -->
</section>

<script type="module">
  import { mountPhosphor } from './src/index.js';

  const root = document.querySelector('#my-interface');
  const display = mountPhosphor(root, {
    palette: 'dashboard:odyssey-crt',
    preset: 'dashboard',
    density: 'compact',
    effects: 'on',
    crispText: false,
  });

  // Optional ambient light; no UI text is drawn into the canvas.
  const { mountAmbient } = await import('./src/ambient.js');
  const ambient = mountAmbient(root);

  // Later:
  display.update({ palette: 'website:amber' });
  // On removal, restore previous attributes/tokens and clean up ambient:
  // display.destroy();
</script>
```

These are repository-relative imports, not an installation command for a published package. The runnable [plain HTML example](examples/plain.html) shows two isolated scopes inside an independently styled host page.

## CSS only

No JavaScript is required for static glow, glass, or raster. The core includes a default green palette.

```html
<link rel="stylesheet" href="./src/core.css">
<section data-phosphor data-ph-preset="website" data-ph-effects="static">
  <h1 class="ph-title">Example heading</h1>
  <p>This text uses the static CRT treatment.</p>
</section>
```

The `data-ph-palette` attribute is descriptive metadata; selecting a catalog palette requires the adapter to write its variables. For CSS-only custom colors, define the complete semantic token set described in the [integration guide](docs/integration.md).

## Included layers

| Layer | Implementation |
| --- | --- |
| Core | Scoped CSS variables, emission, raster, fog, focus and selection |
| Presets | Expressive website and restrained dashboard presentation |
| Density | Compact or comfortable spacing, independent of type size |
| Palettes | Four Phosphor palettes plus adapted Nord, Dracula, and Catppuccin Mocha palettes, with pinned upstream sources |
| Ambient | Optional WebGL, event-driven pointer response, static CSS fallback |
| Typography | Self-hosted Victor Mono on the website; optional font stylesheet for consumers |
| Primitives | Native panels, controls, tables, tabs, notices, code and dialogs |
| Display lab | Typography/optics specimen, three application examples, comparison, live optical controls, configuration export and setup links |
| Optical controls | Glow softness, raster strength, and glass strength; independent 0–100 values |
| Technical content | Sharp editor/code regions, prose, keyboard labels, range/progress, and syntax colors |

The renderer has no application globals or hardcoded IDs. It caps its buffer at 900 pixels on the longest edge and DPR at 1.5. Pointer response draws at most about 30 fps and settles to zero scheduled frames at idle. Hidden/offscreen containers, reduced motion, coarse pointers, increased contrast, and effects-off use static styling.

Reduced motion retains static emission, glass, and raster. Crisp text independently removes text halos; effects-off removes the decorative treatment. No traveling scanline, periodic pulse, or full-content blur is included.

## Validation

```sh
npm test
npx playwright install chromium
npm run test:browser
npm run build
```

Palette tests cover the complete catalog, role mapping, contrast, and stable IDs. Chromium checks cover native interactions, keyboard tabs/dialogs, scope isolation, renderer lifecycle and fallback, motion preferences, high DPI, narrow containers, and zoom. This first demonstration does not establish support across all browsers or frameworks.

See [adapter recipes](docs/adapters.md) for sliders, prose/editors, chart colors and exports, and framework ownership. See the [integration and adaptation guide](docs/integration.md) and [provenance inventory](docs/provenance.md). The website uses self-hosted Victor Mono. The toolkit defaults to system fonts; import `src/fonts.css` after the core and add `data-ph-font="victor-mono"` to opt in. Font sources, hashes, and OFL terms are included. See the [style reference](docs/style-reference.md) for visual layers, reusable classes, and example-only behavior.

## Demo hosting

Cloudflare Pages can host the static `dist/` output. The build includes license notices and a source archive matching that build. See [hosting and release instructions](docs/deployment.md). The website is the first link to share for trying the toolkit; the GitHub repository provides the source and integration instructions.

## Feedback and contributions

[Report a bug or suggest a change](https://github.com/ghreprimand/unfinished-phosphor/issues). For rendering problems, include your browser and version, operating system, steps to reproduce, expected result, and the configuration copied from the playground. Use a minimal example with synthetic data.

For code changes, explain the resulting behavior and run `npm run check`. Keep native controls accessible and preserve reduced-motion behavior. Contributions to toolkit code use GPL-3.0-only; imported material must include its upstream source and applicable license notices. Do not include private application data or screenshots.

The full browser suite targets Chromium. Additional Firefox smoke checks cover native type/overlays, fonts, optical controls, palette switching, tabs, reduced motion, three viewport widths, dialogs, and forms. Safari and real-device validation remain outstanding.

For additional engines, install their Playwright browsers and required platform dependencies, start the dev server on port 5180, then run:

```sh
npx playwright install firefox webkit
npm run test:engines -- firefox
npm run test:engines -- webkit
```

The engine script also accepts `PHOSPHOR_TEST_URL` to check a running production preview. WebKit requires compatible host libraries; a browser-launch failure is not a passing compatibility check.
