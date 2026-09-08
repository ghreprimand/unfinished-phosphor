# Provenance and licensing

The toolkit code, examples, and original Phosphor variants are GPL-3.0-only. Third-party palette material retains its upstream MIT terms. Full copyright and permission notices are in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).

## Public palette selection

This edition contains seven palettes: Odyssey CRT, P1 Green, P3 Amber, P4 White, Nord, Dracula, and Catppuccin Mocha. Unreviewed palettes from local development are excluded from the repository and downloadable source archive.

The three community adaptations were rebuilt on 2026-09-08 from the exact upstream commits recorded in `src/palette-snapshot.json`. Each entry records the source URL, commit, source-file SHA-256, MIT license URL, author, and mapping from upstream color names to Phosphor interface roles. The resolver derives glass and emission colors and adjusts foregrounds for contrast. These adaptations do not imply upstream endorsement.

The original Phosphor presentation mechanisms and four palette variants come from Unfinished Works. Application data, private screenshots, and workstation context are not included. The website bundles four unchanged Victor Mono WOFF2 fonts by Rune Bjørnerås under SIL OFL 1.1. Their pinned sources and hashes are in [the font manifest](../fonts/victor-mono/provenance.json); the full [font license](../fonts/victor-mono/LICENSE) is also included in third-party notices. The toolkit uses system fonts unless a consumer opts into the font stylesheet. No image or sound assets are bundled.

## Editable catalog

`src/palette-snapshot.json` is the independently editable release catalog. Schema 2 records a dated catalog revision and the SHA-256 of `JSON.stringify(palettes)` for its four entries. The three website seeds remain in `src/palettes.js`. Editing or rebuilding requires no sibling repository.

Palette IDs retain their existing `dashboard:` and `website:` namespaces. The namespace describes the adapter's history, not upstream authorship. Additional community palettes need a pinned upstream source, applicable notices, and a reviewed mapping before inclusion. Update the catalog digest and tests when changing the public selection.

`scripts/snapshot-palettes.mjs` is an optional local ingestion utility. It executes a trusted TypeScript input and requires an explicit, new output path. It cannot overwrite the release catalog. An export is material for review, not approval for publication. The production build does not run this utility.

## Dependencies and distribution

The build includes Vite runtime helpers; their MIT notice accompanies the demo. Playwright and axe-core are development tools and are not imported into production. Their installed packages retain their respective notices.

The demo includes the toolkit license, third-party notices, and an archive of the exact standalone sources and build inputs. Package metadata retains `private: true` to prevent accidental npm publication. That setting does not restrict access to the public source repository.
