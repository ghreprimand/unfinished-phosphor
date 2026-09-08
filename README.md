# Unfinished Phosphor

**A CRT presentation toolkit by Unfinished Works.**

Illuminated text, dark glass, fine raster texture and ambient tube light—for interfaces that feel like a phosphor display while remaining readable and usable.

Unfinished Phosphor is being developed as a reusable version of the visual language behind Unfinished Works. The aim is to bring that appearance to websites, dashboards and application workbenches without replacing their content or behavior.

> **Status: project foundation.** This repository currently contains the project introduction. The toolkit, examples and installation instructions are still to come; there is no published package or supported API yet.

## The visual direction

- Readable phosphor text emission with a tight luminous core and a softer halo.
- Dark glass surfaces, subtle vignette and stationary raster texture.
- Optional ambient illumination and restrained pointer response.
- Terminal-inspired typography, fine borders and compact controls.
- Color palettes that change the atmosphere without rearranging the interface.

The everyday treatment is designed for displays that stay open for hours. It avoids a traveling bright scanline, distracting flicker and full-page text blur.

## Planned building blocks

| Layer | Purpose |
| --- | --- |
| Core CSS | Typography, text emission, glass, raster, focus states and shared visual tokens |
| Optional renderer | Ambient CRT illumination with lifecycle cleanup and a static fallback |
| Palettes | Consistent roles for surfaces, text, accents, status and effects |
| Presentation presets | Expressive website and dense dashboard treatments, independent of palette |
| Optional component styles | Panels, controls, tables, tabs, notices and dialogs |
| Playground and examples | Realistic interfaces, live adjustments and copyable configuration |

## Integration principles

Start with plain HTML, CSS and a small optional JavaScript module. Framework integrations can build on that foundation.

Applications should be able to adopt the effects and color tokens while retaining their existing layout, or use the optional component styles for a fuller treatment. Styling will be explicitly scoped rather than imposed globally.

Text must remain selectable and accessible. Effects must not intercept input. Static styling should remain useful without WebGL, and reduced motion should stop animation without unnecessarily removing static glow. Palette, density and effects controls should remain independent.

## Initial milestone

The first milestone is a working, inspectable core with two presentation presets, a palette collection and representative website, dashboard and workbench examples. Visual fidelity, readability, accessibility and resource use will be checked together.

Follow this repository as the implementation and examples take shape.
