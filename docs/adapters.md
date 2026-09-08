# Adapting an existing interface

The toolkit owns the optical treatment. Your application owns layout, content, events, state, and persistence. Start with [Getting started](getting-started.md), then use the recipes below at the boundary between them.

## A glow slider

```html
<label for="glow">Glow softness</label>
<input id="glow" type="range" min="0" max="100" value="50">
<output id="glow-value" for="glow">50%</output>
<section id="interface">Your existing interface</section>

<script type="module">
  import { mountPhosphor } from './vendor/phosphor/src/index.js';
  const display = mountPhosphor(document.querySelector('#interface'), {glow: 50});
  const slider = document.querySelector('#glow');
  const output = document.querySelector('#glow-value');
  slider.addEventListener('input', () => {
    const glow = Number(slider.value);
    display.update({glow});
    output.value = `${glow}%`;
  });
</script>
```

Load `core.css` as described in Getting started. Use `input` for immediate visual feedback. If saving preferences to a server, persist on `change` rather than issuing a request for every slider movement. Persistence is not built into Phosphor. Disable the glow slider while crisp text or effects-off overrides its appearance, preserving the chosen value for later.

`glow: 0` removes text halos; `50` tightens their spread and reduces their opacity; `100` uses the selected preset's full treatment. This scales shadows, including heading and metric halos. It does not blur the DOM, resize type, lower foreground brightness, or change the palette. `raster` and `glass` are separate 0–100 controls. Reduced motion preserves all three static settings.

## Prose, code, and editors

Use `.ph-prose` for line spacing and a readable text measure. Native `pre`, `code`, `input`, `textarea`, and `select` text stays sharp. Wrap a terminal emulator, editor, diff, or other precision surface with `.ph-sharp` to remove text shadows and descendant filters in that region.

```html
<article class="ph-prose">
  <h2 class="ph-title">Session notes</h2>
  <p>Ordinary prose retains the selected glow.</p>
</article>
<div class="ph-sharp">
  <!-- Mount your existing editor here. -->
</div>
<pre class="ph-code"><code><span class="ph-syntax-keyword">const</span> count = <span class="ph-syntax-number">12</span>;</code></pre>
```

`.ph-sharp` leaves the root's glass and raster overlay in place. Use a sibling unstyled scope if an editor must avoid every decorative layer. Syntax helper classes map keyword/string/number/comment to semantic colors; they do not parse code. For an existing highlighter, map its selectors to `--ph-secondary`, `--ph-success`, `--ph-warning`, and `--ph-muted` instead.

## SVG charts and diagrams

Bind your existing SVG elements to the palette variables. Keep viewBox, zoom, selection, hit targets, data, and geometry in the host application.

```css
.my-chart .series-a { stroke: var(--ph-chart-1); }
.my-chart .series-b { stroke: var(--ph-chart-2); }
.my-chart .grid { stroke: var(--ph-border); }
.my-diagram .node { fill: var(--ph-surface); stroke: var(--ph-control); }
.my-diagram text { fill: var(--ph-text); font-family: var(--ph-font); }
```

Supply accessible descriptions and a native table alternative for charts. Palette changes update CSS without rebuilding the graph. For canvas or standalone SVG exports, obtain concrete colors from `resolvePalette(display.config.palette)` and write them into the export. External SVG files do not inherit your page's variables. Six chart-series roles are available, but no charting engine or graph layout algorithm is included.

## Framework lifecycle

Mount after the root exists in the browser. Keep one owner per root, update its configuration when preferences change, and destroy it before removing the root. In React, the pattern is:

```jsx
import { useEffect, useRef } from 'react';
import { mountPhosphor } from './vendor/phosphor/src/index.js';

export function Display({ children, glow = 50 }) {
  const root = useRef(null);
  const owner = useRef(null);
  useEffect(() => {
    owner.current = mountPhosphor(root.current);
    return () => { owner.current.destroy(); owner.current = null; };
  }, []);
  useEffect(() => { owner.current.update({glow}); }, [glow]);
  return <section ref={root}>{children}</section>;
}
```

Load the stylesheets once from the application entry. This recipe illustrates lifecycle ownership; React is not a dependency and this repository does not test a React build. The same ownership rules apply to other frameworks. For portals, keep dialogs inside the scope or provide a separate token/scope bridge as described in the [integration guide](integration.md).

## Deliberate boundaries

Boot sequences, scrambled-text reveals, audio feedback, command interpreters, screensavers, application dashboards, and navigation systems belong to the host application. They are not prerequisites for the CRT treatment and are not shipped as toolkit behavior. No additional private application data, theme catalogs, or font assets are required by these recipes.
