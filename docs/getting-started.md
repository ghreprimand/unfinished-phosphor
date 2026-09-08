# Getting started

Phosphor adds CRT styling to native HTML. Start with CSS; add JavaScript for named palettes or pointer-responsive ambient light. The website, reusable source, and examples live in this repository. No npm package has been published.

## Try the examples

```sh
git clone https://github.com/ghreprimand/unfinished-phosphor.git
cd unfinished-phosphor
npm ci --include=dev
npm run dev
```

Use Node.js 24.19.0. Building the downloadable-source archive also requires GNU `tar`; use GNU/Linux or WSL for that packaging path. Open the address Vite prints, normally `http://localhost:5173/`. The [playground](https://phosphor.unfinished-works.com/) lets you compare presets and palettes. The [component reference](https://phosphor.unfinished-works.com/examples/components.html) shows reusable markup; the [HTML integration](https://phosphor.unfinished-works.com/examples/plain.html) demonstrates isolated scopes in a differently styled page.

## Add it to an existing project

Copy `src/`, `fonts/`, `LICENSE`, and `THIRD_PARTY_NOTICES.md` into a directory such as `vendor/phosphor/` in your project. Preserve their relative paths: `src/fonts.css` refers to `../fonts/victor-mono/`, and the palette module imports `src/palette-snapshot.json`. Keep the notices with redistributed material. Toolkit code and examples are GPL-3.0-only; imported palettes retain MIT notices and the font files remain OFL-1.1. See the [license](../LICENSE) for distribution terms.

Alternatively, download the demo's [matching source archive](https://phosphor.unfinished-works.com/source.tgz). It contains editable sources and build inputs, not a prebuilt npm package. Use an HTTP development server; opening HTML with `file://` does not reliably load JavaScript modules or JSON imports.

This complete HTML page starts with static effects and the default green palette:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>My Phosphor interface</title>
  <link rel="stylesheet" href="./vendor/phosphor/src/core.css">
  <link rel="stylesheet" href="./vendor/phosphor/src/components.css">
  <link rel="stylesheet" href="./vendor/phosphor/src/fonts.css">
</head>
<body>
  <main data-phosphor data-ph-effects="static" data-ph-font="victor-mono">
    <article class="ph-panel">
      <h1 class="ph-panel-heading">Recording archive</h1>
      <div class="ph-panel-body">
        <p>12 recordings are ready.</p>
        <a class="ph-button" href="#details">View details</a>
        <p id="details">Keep your application content and behavior here.</p>
      </div>
    </article>
  </main>
</body>
</html>
```

Only `core.css` is required. Omit `components.css` when styling your existing components with the semantic tokens. Omit `fonts.css`, the `data-ph-font` attribute, and the `fonts/` directory if you want system fonts. The Phosphor website uses self-hosted Victor Mono; consumers choose their own font.

## Select a named palette

Give the container an ID, such as `id="my-interface"`, and add this module script. Keep the stylesheets from the example above.

```html
<script type="module">
  import { mountPhosphor } from './vendor/phosphor/src/index.js';

  const root = document.querySelector('#my-interface');
  const display = mountPhosphor(root, {
    palette: 'website:amber',
    preset: 'dashboard',
    density: 'comfortable',
    effects: 'static',
    glow: 50,
    raster: 75,
    glass: 100,
  });

  // When preferences change:
  // display.update({ palette: 'website:white' });

  // Before your application removes the container:
  // display.destroy();
</script>
```

Import `palettes` from `src/index.js` to list the available `{ id, name }` entries. See [Palettes](palettes.md) for all twelve IDs, CSS-only export, and custom-color instructions. `data-ph-palette` alone does not load a named palette; `mountPhosphor` writes its color variables. The playground's **Get configuration** button produces JavaScript settings, so the stylesheets and container still need to be present.

For optional ambient light, set `effects: 'on'`, import `mountAmbient` from `src/ambient.js`, then call `mountAmbient(root)` after mounting Phosphor. `display.destroy()` also cleans up its ambient instance. Reduced motion and unsupported WebGL retain static CSS styling.

## In a Vite or framework application

Import the stylesheets once from your application entry, preserving this order:

```js
import './vendor/phosphor/src/core.css';
import './vendor/phosphor/src/components.css'; // Optional native element styles.
import './vendor/phosphor/src/fonts.css';     // Optional Victor Mono font faces.
import { mountPhosphor } from './vendor/phosphor/src/index.js';
```

Adjust paths relative to that entry file. Mount after the container exists in the browser, keep the instance, update settings through `update()`, and call `destroy()` in the framework's cleanup hook. Do not mount during server rendering. Dynamic children inherit the styling without remounting. The repository tests native HTML; it does not ship or certify framework-specific wrappers.

## Change the treatment

Use `data-ph-preset="website"` for larger type and stronger glow, or `dashboard` for smaller type and less glow. Density changes spacing independently. Use `data-ph-effects="off"` to remove decorative effects and `data-ph-crisp="true"` to remove text halos only. If JavaScript owns the container, use `display.update()` so its configuration remains in sync.

For sliders, sharp editor surfaces, charts, exports, and a React lifecycle recipe, see [Adapting an existing interface](adapters.md).

The [style reference](style-reference.md) maps the visual layers, component classes, and intensity controls. The [integration guide](integration.md) covers all options, semantic colors, scoping, portals, cleanup, accessibility, and renderer limits.
