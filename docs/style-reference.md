# Style reference

Open the [component reference](https://phosphor.unfinished-works.com/examples/components.html) for rendered elements and markup. Start with the [getting-started guide](getting-started.md) if you have not added the stylesheets yet.

## Visual layers

| Treatment | Where it comes from | How to use or adjust it |
| --- | --- | --- |
| Dark surfaces and glass | `core.css`, semantic palette variables | Wrap a page or region with `data-phosphor`; keep the root's pseudo-elements free |
| Text emission and small color offsets | Scoped native text shadows | Preset controls the baseline; `crispText` removes text shadows |
| Heading and numeric emphasis | `.ph-title`, `.ph-metric` in core | Apply to real headings and metric text; the text stays selectable |
| Stationary raster, RGB mask, vignette, glass reflection | Root `::after` in core | `--ph-raster-opacity` adjusts their combined strength; these layers do not move |
| Surface fog | Root `::before` in core | `--ph-fog-alpha` adjusts opacity |
| Pointer-responsive light | Optional `ambient.js` | Mount after Phosphor; `on` allows it, `static` and `off` stop it |
| Font | Optional `fonts.css` | The site uses Victor Mono; other applications may retain their font |
| Spacing and type presets | Core attributes or mount options | Density changes panel/table spacing; preset changes type size and optical strength |
| Focus, selection, form accents | Scoped core selectors | Native focus and selection remain usable; do not remove their indicators |
| Status and chart colors | Semantic palette tokens | Add text labels; map chart variables into your existing SVG/canvas implementation |

Presets and palettes are independent. A palette switch does not change the font, geometry, content, or interaction state. Community palette colors are adapted to Phosphor's semantic roles, not exact reproductions of each upstream editor theme.

### Font

Load `fonts.css` **after** `core.css`, then add `data-ph-font="victor-mono"` to the Phosphor root. Normal and italic faces at weights 400 and 700 are included and self-hosted. No font service is contacted. The font attribute is a CSS opt-in, not a `mountPhosphor` option.

To use your own font, omit that opt-in and provide a variable on the scope:

```css
.my-interface[data-phosphor] {
  --ph-font: 'Your installed font', ui-monospace, monospace;
}
```

### Intensity

Use a class on your scope to override optical variables. This example reduces glow and glass strength:

```css
.my-interface[data-phosphor] {
  --ph-halo-core: 1px;
  --ph-halo-soft: 4px;
  --ph-halo-wide: 9px;
  --ph-halo-alpha: 18%;
  --ph-raster-opacity: .16;
  --ph-fog-alpha: 8%;
}
```

These are CSS variables, not JavaScript configuration keys. `--ph-raster-opacity` affects the combined overlay; the first API does not offer separate public controls for RGB mask, reflection, and vignette. Ambient light is a separate renderer, so use `effects: 'static'` when comparing CSS intensity alone. Retest readability after changing values.

## Optional component classes

Load `components.css` after the core. These are styling primitives; they do not create widgets or event handlers.

| Classes | Native markup and responsibility |
| --- | --- |
| `.ph-panel`, `.ph-panel-heading`, `.ph-panel-body` | Panel container, heading, and padded contents; your application owns layout |
| `.ph-muted`, `.ph-accent`, `.ph-success`, `.ph-warning`, `.ph-danger`, `.ph-info` | Semantic text colors; include words that explain state |
| `.ph-button`, `.ph-button-primary` | Buttons or navigation links; use native `disabled` for buttons |
| `.ph-field`, `.ph-input` | Labels with inputs, selects, or textareas; supply IDs, validation, and error descriptions |
| `.ph-table-scroll`, `.ph-table` | Native tables with captions and scoped headings; label and keyboard-enable the scroll wrapper |
| `.ph-badge` | A small bordered text label; combine with a status class |
| `.ph-notice` | Informational block; choose live-region semantics only when content needs announcing |
| `.ph-tabs` | Tab strip appearance; supply tab/panel relationships, selection, and keyboard handling |
| `.ph-dialog` | Native `<dialog>` inside the scope; open with `showModal()` and provide a labelled heading |
| `.ph-code` | Scrollable preformatted code without text halos |

`aria-disabled="true"` only changes appearance and accessibility state; it does not stop link or custom-button activation. Native checkboxes, radios, and disclosure elements inherit the treatment but have no dedicated component classes. The [reference source](../examples/components.js) demonstrates application-owned tab, form, and dialog behavior.

## What is example-specific

The playground's page layout, navigation tree, chart drawing, split panes, filter/search, draft editor, and toolbar logic are examples, not reusable widget APIs. Copy and adapt their source if useful, keeping the applicable license and notices. Six chart series tokens are available; Phosphor supplies no charting engine.

There are no packaged menus, tooltips, date pickers, toasts, drag-and-drop widgets, or framework components. Existing components can use the semantic tokens without adopting the example layouts. Additional variants should respond to the same palette and accessibility settings rather than embed fixed colors.

The core treatment is covered; this is not an exhaustive component library. Browser tests currently target Chromium. Firefox, Safari, assistive-technology sessions, and real application integrations need separate validation. See the [integration guide](integration.md) for reduced-motion, forced-color, contrast, and lifecycle behavior.
