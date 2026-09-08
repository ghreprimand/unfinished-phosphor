# Accessibility and performance

Phosphor keeps text and controls in native HTML. The optical layers are decorative and pointer-transparent. That preserves browser selection, search, focus, and native semantics; it does not make an arbitrary host interface accessible automatically.

## Preference behavior

| Setting or condition | Result |
| --- | --- |
| `effects: 'on'` | Static CSS treatment; optional pointer light when the renderer is mounted and permitted |
| `effects: 'static'` | Static glow, fog, raster, and glass; canvas hidden and stopped |
| `effects: 'off'` | Text shadows, scope overlays, canvas, and component panel glow removed; palette and component structure remain |
| `crispText: true` | Text shadows and metric filters removed; other layers follow the effects setting |
| `glow: 0` | Text halos removed; chosen raster/glass settings remain |
| Reduced motion | Canvas hidden/stopped and smooth scrolling disabled inside the scope; static CSS treatment retained |
| Increased contrast | Text halos and the complete raster/glass overlay suppressed; canvas stopped; CSS fog/panel surfaces remain |
| Forced colors | Scope overlays and canvas hidden; text halos removed; browser system colors apply |
| Coarse pointer or no hover | Ambient renderer stopped; CSS treatment retained |
| Hidden tab or offscreen scope | Ambient rendering stopped until permitted again |
| Print | Scope background/text switch to white/black, overlays and text filters removed; custom components still need print review |

User/system restrictions take precedence over `effects: 'on'`. The toolkit does not store preferences. Provide accessible controls in the host if users need an in-app override, keep their chosen values when temporarily overridden, and persist only the supported configuration fields. A blur preference should update `glow`, not apply `filter: blur()` to an application tree.

`prefers-contrast` does not constitute a complete high-contrast theme. In particular, panel surfaces and CSS fog are separate from the raster/glass overlay. Use effects-off and review the final colors if stronger simplification is needed. Print rules also do not rewrite every component background or semantic color; supply host print styles for printable reports.

## Verify your content

1. Check ordinary text, muted text, errors, selected text, and primary buttons on each actual surface. Seed-color contrast is only part of the result. Try full glow and effects-off; use crisp text where users read dense content for long periods.
2. Navigate by keyboard. Preserve visible focus, native labels, logical tab order, and reachable scroll regions. Provide tab/panel keyboard behavior in the host; `.ph-tabs` supplies appearance only.
3. Label errors and statuses with words or symbols as well as color. Give charts an accessible description and data-table alternative. A progress indicator needs an associated label and meaningful value/max.
4. Open and dismiss dialogs using the keyboard. Label the dialog and keep its markup inside the scope when it should inherit tokens. Test focus return and any portal bridge in your framework.
5. Test narrow viewports, browser zoom at 200%, long content, and enlarged system text. Content should reflow or have a labelled, keyboard-scrollable region. The demo's wide-screen layout is example CSS; the core does not impose that layout on consumers.
6. Check reduced motion, increased contrast, forced colors, and WebGL unavailable. Reading and essential actions must still work.
7. Use a screen reader and real devices for your own interface. Automated checks catch a subset of accessibility problems; this repository has not completed that manual certification.

Native `pre`, `code`, `input`, `textarea`, and `select` text stays sharp. `.ph-sharp` extends that exclusion to a region and its descendants. The root's overlay still crosses the region. For a canvas editor, terminal, image, or chart that must be unaffected by every layer, place it in a sibling scope outside the decorated root.

## Renderer cost and limits

One optional WebGL canvas is allocated per ambient owner. It draws a single triangle with fixed grain, low-intensity fog, and pointer light. No ordinary text or UI is drawn into the canvas. It requests a low-power context, but that hint does not guarantee a particular GPU or battery cost.

The drawing buffer's longest edge is capped at 900 pixels and its DPR multiplier at 1.5. This bounds the ambient buffer on 4K displays while native HTML, fonts, and CSS remain at their normal resolution. It is not a 900px limit on the interface. The canvas needs no continuously advancing time input.

Pointer response schedules a 34ms timer while charge is changing, then stops. Resize, palette, and permission changes can draw a static frame. Missing WebGL or shader/link failure leaves the CSS fallback; context loss hides the canvas, and restoration rebuilds GPU resources.

Each owner has observers and listeners even while paused. Prefer a few meaningful scopes over one canvas per table row. Detaching a root is not cleanup: call `display.destroy()` before removing it, or `ambient.destroy()` when ambient was independently mounted on a CSS-only root. Repeated mount/destroy cycles should leave no extra canvases or scheduled work.

## Inspect activity

Use the ambient owner returned by your own mount:

```js
const before = ambient.stats.frames;
setTimeout(() => {
  const after = ambient.stats;
  console.log({ draws: after.frames - before, scheduled: after.running, buffer: [after.width, after.height] });
}, 1000);
```

Let pointer charge settle before measuring idle activity. A stable, idle, unchanged scope should show zero new draws and `running: false`. These counters measure scheduling/draw calls, not GPU time, memory usage, power consumption, or frame delivery. Use browser performance tools for those. Large amounts of glowing text and CSS overlays can have cost even with the ambient renderer disabled.

## What is tested here

The Node suite checks every catalog palette's token contract and contrast. Chromium tests cover optical settings, keyboard/native interactions, scope isolation, cleanup, repeated mounting, context loss/failure, high DPI, scrolling, zoom, and responsive layouts through 3840 CSS pixels. Axe checks representative rendered states. Firefox has smoke coverage for fonts, optics, tabs, dialogs, forms, preferences, and layout.

These checks do not establish universal browser, assistive-technology, or framework compatibility. Safari/WebKit remains unverified. See [Contributing](../CONTRIBUTING.md) for commands and [Troubleshooting](troubleshooting.md) for failures.
