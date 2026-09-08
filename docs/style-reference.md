# Style reference

Open the [component reference](https://phosphor.unfinished-works.com/examples/components.html) for rendered elements and markup. Start with the [getting-started guide](getting-started.md) if you have not added the stylesheets yet.

## Visual layers

| Treatment | Where it comes from | How to use or adjust it |
| --- | --- | --- |
| Dark surfaces and glass | `core.css`, semantic palette variables | Wrap a page or region with `data-phosphor`; keep the root's pseudo-elements free |
| Text emission and small color offsets | Scoped native text shadows | `glow: 0–100` scales preset shadows; `crispText` overrides them |
| Heading and numeric emphasis | `.ph-title`, `.ph-metric` in core | Apply to real headings and metric text; the text stays selectable |
| Stationary raster, RGB mask, vignette, glass reflection | Root `::after` in core | `raster: 0–100` adjusts the lines/mask and `glass: 0–100` adjusts reflection/vignette; these layers do not move |
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

These low-level CSS variables remain available. The public JavaScript controls are `glow`, `raster`, and `glass`, each 0–100. For CSS-only scopes, set `--ph-glow`, `--ph-raster-strength`, and `--ph-glass-strength` to fractions from 0 to 1. `--ph-raster-opacity` remains the master overlay opacity; RGB mask/lines share one control and reflection/vignette share another. `glass: 0` does not remove panel backgrounds, static fog, or ambient light. Ambient light is a separate renderer, so use `effects: 'static'` when comparing CSS intensity alone. At `glow: 0`, text shadows and metric halo filters are removed. Crisp text and effects-off override the stored optical values. Retest readability after changing values.

### CSS variables and attributes

The [integration guide](integration.md) lists the 24 semantic color tokens; [Palettes](palettes.md) explains how to export their actual values. These additional variables control typography and geometry:

| Variable | Bare core default | Website preset override |
| --- | --- | --- |
| `--ph-size` | `13px` | `15px` |
| `--ph-halo-core` | `2px` | `3px` |
| `--ph-halo-soft` | `7px` | `12px` |
| `--ph-halo-wide` | `20px` | `28px` |
| `--ph-halo-alpha` | `54%` | `64%` |
| `--ph-offset` | `.7px` | `1px` |
| `--ph-fog-alpha` | `9%` | `12%` |
| `--ph-glow` | `1` | Unchanged |
| `--ph-raster-strength` | `1` | Unchanged |
| `--ph-glass-strength` | `1` | Unchanged |
| `--ph-raster-opacity` | `.64` | Unchanged |

`--ph-font` supplies the scope font family. `--ph-shadow` is the composed native text-shadow value; prefer the documented intensity controls over replacing that expression. Title and metric emphasis have separate shadow expressions that still follow `--ph-glow`. Changing the general halo variables alone does not rewrite those emphasis expressions.

| Spacing variable | No density attribute | `compact` | `comfortable` |
| --- | --- | --- | --- |
| `--ph-pad` | `12px` | `10px` | `18px` |
| `--ph-gap` | `10px` | `8px` | `16px` |
| `--ph-cell-y` | `7px` | `5px` | `10px` |
| `--ph-cell-x` | `12px` | `9px` | `14px` |

The JavaScript default sets `data-ph-density="compact"`; a bare CSS-only scope with no density attribute uses the first column. Optional components have some explicit font sizes, so changing the root size is not a universal zoom control. Consumer page widths, grid columns, responsive breakpoints, and font scaling remain application CSS. The display lab's 3200px maximum width is not imposed by the core.

`data-phosphor` activates the scope. CSS-only consumers can set `data-ph-preset`, `data-ph-density`, `data-ph-effects`, `data-ph-crisp`, and `data-ph-font` directly. Named colors still require the adapter or an exported stylesheet. `data-ph-glow="0"` is a zero-shadow removal marker written by the adapter; arbitrary numeric attribute values do not set intensity. For CSS-only intensity use the fraction variables, and add that zero marker when you want computed shadows/filters removed completely at zero. Remove the marker when increasing the fraction again.

Load host overrides after the toolkit and target a class on the scope, for example `.my-interface[data-phosphor]`. Mounted palette and optical variables are inline and owned by JavaScript; use `display.update()` for them. Neither CSS-only variable overrides nor attributes validate ranges or color contrast.

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
| `.ph-sharp` (core) | Opt an entire region and descendants out of text shadows and filters |
| `.ph-prose` | Reading line height and text measure |
| `.ph-kbd` | Keyboard shortcut labels on native `<kbd>` |
| `.ph-range`, `.ph-progress` | Native range and progress appearance; host owns values and behavior |
| `.ph-syntax-keyword`, `.ph-syntax-string`, `.ph-syntax-number`, `.ph-syntax-comment` | Semantic colors for existing syntax markup; no parser |

`aria-disabled="true"` only changes appearance and accessibility state; it does not stop link or custom-button activation. Native checkboxes, radios, and disclosure elements inherit the treatment but have no dedicated component classes. The [reference source](../examples/components.js) demonstrates application-owned tab, form, and dialog behavior.

## What is example-specific

The playground's page layout, navigation tree, chart drawing, split panes, filter/search, draft editor, and toolbar logic are examples, not reusable widget APIs. Copy and adapt their source if useful, keeping the applicable license and notices. Six chart series tokens are available; Phosphor supplies no charting engine.

There are no packaged menus, tooltips, date pickers, toasts, drag-and-drop widgets, or framework components. Existing components can use the semantic tokens without adopting the example layouts. Additional variants should respond to the same palette and accessibility settings rather than embed fixed colors.

The core treatment is covered; this is not an exhaustive component library. The full browser suite targets Chromium, with additional Firefox smoke checks. Safari, assistive-technology sessions, and real application integrations need separate validation. See the [integration guide](integration.md) for reduced-motion, forced-color, contrast, and lifecycle behavior.

See [adapter recipes](adapters.md) for sliders, application editors, SVG/canvas chart colors, export handling, and framework lifecycle. The playground adds shareable configuration links; URL handling is example code, not toolkit state management.
