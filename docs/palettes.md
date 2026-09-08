# Palettes and custom colors

A palette supplies semantic colors. Presentation, density, font, glow, raster, glass, and example content are separate settings. All twelve included palettes use dark surfaces. Community adaptations preserve upstream color seeds and map them into Phosphor roles; the resolver may brighten foregrounds for contrast. They are not official editor-theme ports.

## Included catalog

| Name | ID | Appearance |
| --- | --- | --- |
| Odyssey CRT | `dashboard:odyssey-crt` | Near-black green surfaces and mint emission; the default |
| P1 · Green | `website:green` | Green phosphor with brighter multicolor status accents |
| P3 · Amber | `website:amber` | Amber emission and warm dark surfaces |
| P4 · White | `website:white` | White emission and neutral dark surfaces |
| Nord | `dashboard:nord` | Slate surfaces and pale cyan |
| Dracula | `dashboard:dracula` | Purple accents with bright status colors |
| Catppuccin Mocha | `dashboard:catppuccin` | Mauve accents and dark blue-gray surfaces |
| Gruvbox Dark | `dashboard:gruvbox` | Warm gray surfaces, cream text, and yellow/orange accents |
| Solarized Dark | `dashboard:solarized-dark` | Blue-green surfaces and cyan accents |
| Tokyo Night | `dashboard:tokyo-night` | Deep blue surfaces and blue emission |
| Rosé Pine | `dashboard:rose-pine` | Violet surfaces and pale rose emission |
| Everforest Dark | `dashboard:everforest-dark` | Gray-green surfaces and green accents |

The `website:` and `dashboard:` prefixes are historical namespaces. Every palette works with either presentation preset. Existing IDs remain unchanged, including `dashboard:catppuccin` for Mocha. Use exact IDs, not display names.

```js
import { palettes, resolvePalette } from './vendor/phosphor/src/index.js';

const options = palettes.map(({ id, name, category }) => ({ id, name, category }));
const colors = resolvePalette('dashboard:everforest-dark');
console.log(options, colors['--ph-accent']);
```

For a mounted scope, select with `display.update({palette: id})`. Setting `data-ph-palette` alone does not resolve or apply colors. The [playground](https://phosphor.unfinished-works.com/) provides the full catalog in its selector; quick swatches are a subset.

## Seed colors versus resolved colors

The JSON snapshot supplies nine entries; `src/palettes.js` supplies the three original website seeds. The resolver creates the same 24-token contract for each entry. It derives a raised surface when absent, chooses a contrasting accent foreground, and derives emission/glass colors. Text, muted, accent, focus, and status roles are lifted toward white until they reach 4.5:1 against every declared surface. Essential control borders target 3:1. Six chart roles map to accent, info, success, warning, secondary, and danger.

The color swatch in the selector represents the seed accent. The palette values beneath the specimen and `resolvePalette()` show the resolved colors. A difference is expected when a seed needs more contrast. Solarized's original contrast relationships are therefore not preserved exactly. Rosé Pine has no green hue; its pine color is used for success, accompanied by text labels.

Do not infer that a rendered interface passes accessibility checks from these ratios alone. Transparency, overlays, small text, adjacent colors, and overrides affect the result. See [Accessibility and performance](accessibility-performance.md).

## Use a catalog palette without runtime JavaScript

From the repository root, export a resolved palette as a stylesheet:

```sh
node --input-type=module - <<'JS' > phosphor-theme.css
import { resolvePalette } from './src/palettes.js';
const tokens = resolvePalette('dashboard:tokyo-night');
console.log('.my-interface[data-phosphor] {');
for (const [name, value] of Object.entries(tokens)) console.log(`  ${name}: ${value};`);
console.log('}');
JS
```

Load the generated CSS after `core.css`, then use it on a scope:

```html
<link rel="stylesheet" href="./vendor/phosphor/src/core.css">
<link rel="stylesheet" href="./phosphor-theme.css">
<section class="my-interface" data-phosphor data-ph-preset="dashboard" data-ph-effects="static">
  <h1 class="ph-title">Measurements</h1>
  <p>This scope needs no runtime JavaScript.</p>
</section>
```

Copy that generated stylesheet into your application with the toolkit and applicable notices. This example writes one generated file in the directory where you run it; choose a different output path if needed. CSS-only custom colors are not validated at runtime.

## Customize an application's colors

For small changes, override semantic variables on your CSS-only scope after loading the core. Keep the full contract from the export as your starting point. Changing only `--ph-accent` does not automatically recalculate `--ph-on-accent`, focus, emission, or chart colors. Check all dependent roles together.

If JavaScript owns the scope, it writes palette variables inline and rewrites them on updates. A normal stylesheet override will not supersede those inline values. Prefer adding a catalog entry in your vendored copy, or use a CSS-only scope when the host already manages all colors. Avoid competing owners and `!important` patches that make exported configuration disagree with the appearance.

The ambient renderer expects computed six-digit hex values for `--ph-emission` and `--ph-info`. CSS accepts other syntaxes, but ambient rendering falls back to its built-in tints for values it cannot parse.

## Add a palette to a vendored catalog

1. Edit `src/palette-snapshot.json` and append a new seed entry. Use a unique unprefixed ID such as `my-palette`; the adapter exposes it as `dashboard:my-palette`.
2. Supply `name`, `category`, and six-digit hex values for `bg`, `secondary`, `border`, `text`, `muted`, and `accent`. For a complete submission, also supply `tertiary`, `input`, `green`, `red`, `orange`, `blue`, and `purple`. The latter color names are source-schema roles, not required visual hues.
3. Keep surfaces dark. The current solver only brightens foregrounds and throws if it cannot reach the target contrast. Light variants need a separate contrast/design implementation; changing the background alone is not supported.
4. Record authorship and licensing. An imported palette needs a pinned upstream commit, source URL and SHA-256, license URL, full notice, and a role mapping. Original palettes need accurate authorship and a compatible license. See [Provenance](provenance.md).
5. Update the snapshot's count, revision date, and digest, then update the expected IDs in `tests/palettes.test.js`. Keep existing IDs stable so saved configuration links continue to work.
6. Run the checks in [Contributing](../CONTRIBUTING.md), inspect all four specimens with the new palette, and rebuild the source archive.

This command updates snapshot metadata after you edit its palette entries:

```sh
node --input-type=module - <<'JS'
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const file = 'src/palette-snapshot.json';
const catalog = JSON.parse(readFileSync(file, 'utf8'));
catalog.count = catalog.palettes.length;
catalog.revision = new Date().toISOString().slice(0, 10);
catalog.sha256 = createHash('sha256').update(JSON.stringify(catalog.palettes)).digest('hex');
writeFileSync(file, JSON.stringify(catalog, null, 2) + '\n');
JS
```

It changes the catalog file in place. The digest covers `JSON.stringify(catalog.palettes)`, not the JSON file's whitespace or metadata. A valid digest proves consistency, not permission to redistribute an imported palette.

There is no `registerPalette()` API, remote theme download, or custom palette object option. Catalog changes require rebuilding your application. The optional `scripts/snapshot-palettes.mjs` utility executes a trusted TypeScript source to create a separate review file; it is not needed to edit the catalog or build the toolkit.
