# JavaScript API

Use repository-relative imports after copying the files as described in [Getting started](getting-started.md). Examples here assume `vendor/phosphor/` is beside your application module. Load the CSS separately; importing JavaScript does not load styles or fonts.

## Modules and exports

| Module | Exports | Environment |
| --- | --- | --- |
| `src/index.js` | `mountPhosphor`, `defaults`, `palettes`, `resolvePalette`, `paletteProvenance` | Import is safe without a DOM; mounting requires a browser element |
| `src/ambient.js` | `mountAmbient` | Mounting requires a connected browser scope; WebGL has a CSS fallback |
| `src/palettes.js` | `palettes`, `resolvePalette`, `paletteProvenance`, `defaultPalette`, `catalogVersion`, `rgb`, `mix`, `contrast` | Pure palette utilities, usable in Node.js or a browser |

The `exports` map in [package.json](../package.json) describes these source entry points; it does not mean a registry package exists. JSON imports use import attributes. Vite bundles the JSON for the built demo; direct unbundled imports require a browser that supports them. See [Troubleshooting](troubleshooting.md).

## `mountPhosphor(root, options = {})`

Decorates one HTML container and returns its owner. `root` must exist before mounting. Omitted options take the values below; existing `data-ph-*` attributes are not read back as initial options.

| Option | Accepted value | Default |
| --- | --- | --- |
| `palette` | Exact ID from [the palette catalog](palettes.md) | `dashboard:odyssey-crt` |
| `preset` | `website` or `dashboard` | `dashboard` |
| `density` | `compact` or `comfortable` | `compact` |
| `effects` | `on`, `static`, or `off` | `on` |
| `crispText` | Boolean | `false` |
| `glow` | Finite number from 0 to 100, including fractions | `100` |
| `raster` | Finite number from 0 to 100, including fractions | `100` |
| `glass` | Finite number from 0 to 100, including fractions | `100` |

`glow` scales the preset's text-shadow spread and strength, including heading and metric halos. It does not resize or blur the content. `raster` scales stationary lines and the RGB mask; `glass` scales vignette and reflection. These are percentages of the preset, not pixel radii. Panel surfaces, CSS fog, and ambient light are separate. The [style reference](style-reference.md) documents lower-level CSS controls.

```js
import { mountPhosphor, defaults } from './vendor/phosphor/src/index.js';
import { mountAmbient } from './vendor/phosphor/src/ambient.js';

const root = document.querySelector('#interface');
const display = mountPhosphor(root, { palette: 'dashboard:tokyo-night', glow: 50 });
const ambient = mountAmbient(root); // Optional. Requires effects: 'on' to draw.

display.update({ density: 'comfortable' }).update({ raster: 25 });
console.log(display.config.glow); // 50
display.update(defaults);        // Reset every supported option.

// Before removing the root:
display.destroy();               // Also disposes this root's ambient instance.
```

### Owner methods

| Member | Contract |
| --- | --- |
| `config` | Getter for the current frozen, flat configuration object; keep a fresh reference after an update |
| `update(patch = {})` | Merges with current settings, validates the complete result, applies it, emits an event, and returns the same owner |
| `destroy()` | Idempotent cleanup; returns `undefined`; the old owner's `update()` subsequently throws |

Passing a partial patch preserves all other settings. Passing `undefined` as an option value does not reset that field; it fails validation. Use `defaults` for a full reset. Update calls emit even when the resulting values are unchanged; avoid calling `update()` recursively from a change listener.

Repeated mounting on the same element returns the existing owner and applies the supplied patch. A second caller does not acquire an independent lifetime. After destruction, mounting again creates a new owner.

The owner writes `data-phosphor`, `data-ph-palette`, `data-ph-preset`, `data-ph-density`, `data-ph-effects`, `data-ph-crisp`, `data-ph-glow`, all resolved palette variables, and the three optical fraction variables. Destruction restores their pre-mount values, including inline CSS priorities. It preserves child content, host event listeners, unrelated styles, and `data-ph-font`. External changes to owned fields during the lifetime are replaced by the next update or original values at cleanup. Use `update()` for owned settings.

### Validation and errors

| Condition | Error |
| --- | --- |
| Missing/non-element root | `TypeError` |
| Unknown configuration key | `TypeError` |
| `crispText` is not a boolean | `TypeError` |
| Unknown palette/preset/density/effects | `RangeError` |
| Optical value is a string, `NaN`, infinite, or outside 0–100 | `RangeError` |
| Update after destruction | `Error` |

Validation completes before the configuration or DOM changes. Convert a native range's string value with `Number(input.value)`. There is no clamping or silent fallback in the core. The playground's invalid-link fallback is separate example behavior. Pass a plain options/patch object; no schema migration or persistence layer is provided.

### Events

`phosphorchange` is dispatched on the root after the initial mount and each successful update. Its `detail` is the current frozen configuration. `phosphordestroy` fires before original attributes/tokens are restored. Both are non-bubbling `CustomEvent`s.

```js
const root = document.querySelector('#interface');
const onChange = event => {
  console.log('Active palette:', event.detail.palette);
};
root.addEventListener('phosphorchange', onChange);
// Mount after attaching the listener if the first event matters.
// During host cleanup, remove host-owned listeners too:
root.removeEventListener('phosphorchange', onChange);
```

## `mountAmbient(root)`

Import from `src/ambient.js`. The root must have `data-phosphor`; normally call `mountPhosphor` first. For a CSS-only root, set `data-ph-effects="on"` explicitly. Mount after connecting the root to the document. The renderer prepends an owned, pointer-transparent canvas; ordinary content remains in the DOM.

Repeated calls return the same ambient owner. `update()` re-evaluates permissions, size, and colors, resets pointer charge, and draws a static frame when permitted. It returns `undefined` and becomes a no-op after destruction. `destroy()` is idempotent and disconnects observers/listeners, cancels scheduled work, releases GPU resources, and removes the canvas.

Attribute changes to `data-ph-effects`, `data-ph-preset`, and the root's inline style are observed. Ancestor class changes and stylesheet replacement are not observed; call `ambient.update()` after those. Root size, viewport resize, document visibility, intersection, and relevant media preference changes are handled automatically.

### `ambient.stats`

Each read returns a frozen snapshot for diagnostics, not a reactive object.

| Field | Meaning |
| --- | --- |
| `context` | `static` before initialization; `webgl` after setup; `fallback` after setup failure; `lost` after context loss; `destroyed` after cleanup |
| `frames` | Cumulative completed draw calls |
| `running` | Whether pointer-response work is scheduled |
| `width`, `height` | Last allocated drawing-buffer dimensions, not CSS pixels |

`context: 'webgl'` can remain set while effects are paused: it describes the initialized context, not current activity. Inspect `running` and compare `frames` over time. A zero frame delta after the pointer settles is expected. See [accessibility and performance](accessibility-performance.md) for rendering conditions and test limits.

## Palette utilities

`palettes` is a frozen array of shallow-frozen seed records, including IDs, names, categories, colors, and provenance. Treat nested metadata as read-only. There is no runtime registration method.

`resolvePalette(id = defaultPalette)` returns a new frozen object of 24 semantic CSS color variables. It has no DOM side effects and does not return optical percentages. Unknown IDs throw `RangeError`. Foreground colors may differ from upstream seeds after contrast adjustment. `paletteProvenance` describes the JSON snapshot (`source`, `revision`, `sha256`, `count`); its count excludes the three website seeds. `catalogVersion` is the adapter format version, not the package release number.

The lower-level exports are `rgb(hex)` (three integer channels for six-digit hex), `mix(a, b, amount)` (linear RGB channel interpolation), and `contrast(a, b)` (relative-luminance contrast ratio). `rgb` rejects other color syntaxes with `TypeError`; callers should pass valid six-digit inputs to all three and keep `amount` between 0 and 1. These helpers do not register or validate an entire custom palette. See [Palettes](palettes.md) for the supported customization paths.
