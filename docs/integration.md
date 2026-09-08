# Integration and adaptation

Start with [Getting started](getting-started.md) for file-copy instructions and complete HTML. The [style reference](style-reference.md) covers fonts, intensity controls, and component classes. Use the [API reference](api.md) for module exports, method behavior, events, and errors; see the [documentation index](README.md) for all guides.

## Configuration contract

`mountPhosphor(element, options)` decorates an existing container and returns an object with `config`, `update(patch)`, and `destroy()`.

| Option | Values | Default |
| --- | --- | --- |
| `palette` | Namespaced ID from `palettes` | `dashboard:odyssey-crt` |
| `preset` | `website`, `dashboard` | `dashboard` |
| `density` | `compact`, `comfortable` | `compact` |
| `effects` | `on`, `static`, `off` | `on` |
| `crispText` | Boolean | `false` |
| `glow` | Finite number, 0–100; text-shadow softness/strength | `100` |
| `raster` | Finite number, 0–100; stationary lines and RGB mask | `100` |
| `glass` | Finite number, 0–100; vignette and reflection | `100` |

Optical values are percentages of the preset treatment, not blur radii. Glow does not change foreground color or geometry. Code, inputs, and `.ph-sharp` regions remain sharp. See [adapter recipes](adapters.md) for live sliders, editors, charts, exports, and framework ownership.

Unknown keys and values throw before changing the container. `config` is immutable. Calling mount again on the same element returns the existing owner and applies the provided options. Do not share ownership across unrelated lifecycles. `destroy()` is idempotent; it restores pre-mount attributes and inline palette tokens, disposes its ambient instance, and preserves application content and listeners. Updating a destroyed owner throws.

A `phosphorchange` event is dispatched on the container after a successful update, with the current configuration in `event.detail`. This event does not bubble. Applications can subscribe to repaint their existing charts while preserving their models, zoom, and interaction state. CSS-only attribute changes are observed by the optional renderer. If overriding semantic colors directly, call `ambient.update()` after changes not represented by a root style mutation (for example an ancestor class change).

## What each layer owns

The core establishes a positioned, isolated container, colors, typography, native text emission, and two pointer-transparent pseudo-elements. It does not set page layout, reset all elements, change your routes, or own your data. `::before` and `::after` on the scope root are reserved for decorative layers. Use an otherwise undecorated wrapper when your app already uses those pseudo-elements. Existing positioned content should be checked against this new containing block.

Use multiple sibling scopes. Nested Phosphor roots are not supported in this first API; parent text effects and overlays can affect a child scope. A single scope can span a page, a panel, or a workbench. For a scrolling region, place the scope on its natural-height inner content; an absolutely positioned raster on a fixed-height scroll owner cannot cover all overflowing content. Keep native dialogs inside the scope and call `showModal()`. They enter the browser top layer while inheriting tokens. Portals outside the scope need their own scope/configuration or a host-provided token bridge. The toolkit never relocates or clips portals.

Optional `.ph-*` component classes can decorate existing native elements. They add no event handlers. Tab roles and keyboard behavior in the playground belong to that example; the CSS alone does not implement a tab widget. `.ph-table-scroll` provides a scrolling region; add an accessible label and `tabindex="0"` when horizontal scrolling is possible.

## Semantic tokens

All variables start with `--ph-`. `resolvePalette(id)` returns a frozen object mapping full variable names to six-digit hex colors. It is pure and can be used outside a browser. The adapter retains catalog seed colors, derives missing roles, lifts foreground luminance against every declared dark surface, and selects a black or white accent foreground.

| Roles | Variables |
| --- | --- |
| Surfaces | `--ph-bg`, `--ph-surface`, `--ph-raised`, `--ph-input` |
| Text | `--ph-text`, `--ph-muted` |
| Accent and focus | `--ph-accent`, `--ph-on-accent`, `--ph-focus` |
| Borders | `--ph-border` (decorative), `--ph-control` (essential controls) |
| Status | `--ph-success`, `--ph-warning`, `--ph-danger`, `--ph-info`, `--ph-secondary` |
| Optical colors | `--ph-emission`, `--ph-glass` |
| Chart series | `--ph-chart-1` through `--ph-chart-6` |

Text/status/accent colors target at least 4.5:1 on the four declared surfaces. Control borders target 3:1. These checks do not certify a rendered UI: glass compositing, glow, raster, adjacent colors, and your application's overrides require visual review. Decorative borders and emission are not text colors. Status text and labels must accompany color, as in the specimens. The current adapter is for dark catalog palettes; it is not a general light-theme contrast solver.

The optional WebGL renderer reads `--ph-emission` and `--ph-info` as six-digit hex colors. Other color syntaxes continue to work in CSS but the renderer uses its default tints. Convert custom colors to hex for matching ambient output.

### Existing application recipe

```css
/* Application-specific adapter; retain existing selectors and layout. */
.my-app[data-phosphor] {
  --app-text: var(--ph-text);
  --app-panel: var(--ph-surface);
  --app-highlight: var(--ph-accent);
  --app-focus: var(--ph-focus);
}
.my-app[data-phosphor] .existing-panel {
  background: var(--app-panel);
  border-color: var(--ph-border);
}
```

Changing the palette must not change chart data, font family, density, or layout. Read resolved values for SVG/canvas chart strokes and export colors. The demo chart uses semantic CSS colors and includes the same data as a native table.

### Framework lifecycle recipe

The core has no React or other framework dependency. Call mount after the HTML element exists, keep the returned instance in the framework's local lifecycle state, update it when preferences change, and call `destroy()` during cleanup. A framework may run setup/cleanup more than once in development; idempotent destruction and remount are supported. Dynamic child updates need no remount because CSS applies to native descendants. Only the plain HTML integration is exercised here; no framework-specific support claim is made.

## Effects and accessibility

| Mode | Text emission | Glass/raster | Optional canvas |
| --- | --- | --- | --- |
| `on` | Yes | Yes | Pointer response when permitted |
| `static` | Yes | Yes | Hidden and stopped |
| `off` | No | No | Hidden and stopped |
| Reduced motion + `on` | Yes | Yes | Hidden and stopped |
| Crisp text | No | Follows effects setting | Follows effects setting |

System increased contrast removes text halos and raster. Forced colors removes ambient and overlay layers. Native selection uses accent/inverse text without shadows. Text, buttons, form fields, tables, and dialogs remain in the DOM. No text is rendered into WebGL. The localized metric halo is the only filter; no broad content blur is used.

Preferences are host-owned. Mount does not read/write storage or replace OS preferences. The playground keeps settings and drafts in memory for the current page session. Reduced motion is always respected; effects-on does not override it.

## Renderer lifecycle and cost

`mountAmbient(root)` is optional and returns `update()`, `destroy()`, and a read-only `stats` snapshot (`context`, `frames`, `running`, `width`, `height`). Mount Phosphor first. Repeated ambient mounts return the same owner.

One triangle renders low-intensity fog and pointer light with fixed final-gradient dithering. A 34 ms timer is scheduled only while pointer charge is changing. Once settled, no timer or animation frame remains. Theme/container changes draw a static frame. The buffer has at most a 900-pixel edge with DPR at most 1.5; native text and CSS raster retain display resolution. High-DPI monitor changes are reflected on window resize/update.

ResizeObserver and IntersectionObserver track geometry/visibility; media and document visibility listeners pause rendering when appropriate. Missing WebGL, shader/link failure, and context loss hide the canvas and retain the CSS fallback. Context restoration rebuilds GPU resources. Cleanup cancels work, disconnects observers/listeners, deletes buffers/programs, releases the owned context, and removes the canvas. Hosts must call cleanup before removing the container; detachment alone is not a substitute for lifecycle ownership.

This implementation does not animate ambient light continuously. It has no moving brightness band, automatic pulse, game-style bloom, or sound. Performance counters demonstrate draw scheduling, not battery life or GPU timing across devices.

## Local delivery and boundaries

The Vite build produces a static demo with playground, component reference, and plain HTML entries, license notices, and a matching source archive. It is not an npm release pipeline. JSON catalog import attributes and modern CSS (`color-mix`, container queries) require current browsers; Chromium has the full automated suite, with additional Firefox smoke checks. Safari remains unverified. The toolkit code and examples use GPL-3.0-only. The public palette selection includes pinned upstream sources and notices. See [deployment instructions](deployment.md) before public distribution.
