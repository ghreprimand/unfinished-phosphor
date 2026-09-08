# Documentation

Phosphor is scoped CRT styling for native HTML: CSS surfaces and text emission, a palette adapter, and optional WebGL ambient light. The website is a working demonstration of the same source. The API is experimental; no npm package or framework component library is published.

## Choose a starting point

| Task | Guide |
| --- | --- |
| Run the demo or copy the toolkit into a project | [Getting started](getting-started.md) |
| Look up imports, options, return values, events, and cleanup | [JavaScript API](api.md) |
| Understand scoping, scrolling, portals, and host ownership | [Integration](integration.md) |
| Find classes, typography, spacing, and optical variables | [Style reference](style-reference.md) |
| Choose a palette, export CSS colors, or add your own | [Palettes](palettes.md) |
| Add sliders, editors, charts, or a React lifecycle adapter | [Adapter recipes](adapters.md) |
| Verify readability, keyboard use, fallback, and rendering cost | [Accessibility and performance](accessibility-performance.md) |
| Diagnose missing styles, fonts, effects, or build errors | [Troubleshooting](troubleshooting.md) |
| Build and host a standalone demo with matching source | [Deployment](deployment.md) |
| Review origins, modifications, and third-party licenses | [Provenance](provenance.md) and [full notices](../THIRD_PARTY_NOTICES.md) |
| Change the toolkit, test it, or submit a palette | [Contributing](../CONTRIBUTING.md) |

For first adoption, follow Getting started, choose a palette, then review Integration before decorating a full application. Use the API and style references while implementing. Finish with the accessibility/performance checks on your own content.

## Working examples

| Example | Live page | Source |
| --- | --- | --- |
| Display lab: optics, website, dashboard, workbench | [Playground](https://phosphor.unfinished-works.com/) | [HTML](../index.html), [controls](../playground/main.js), [optics](../playground/optics.js), [application samples](../playground/specimens.js) |
| Existing host page with independent styled regions | [Plain HTML](https://phosphor.unfinished-works.com/examples/plain.html) | [Complete example](../examples/plain.html) |
| Native components, forms, dialogs, and technical content | [Components](https://phosphor.unfinished-works.com/examples/components.html) | [Markup](../examples/components.html), [behavior](../examples/components.js), [example layout](../examples/components.css) |

The component reference owns its event handlers. Copying a class gives an element its appearance; it does not implement tab navigation, submission, validation, or dialog behavior. The application examples contain synthetic data and no connected services.

## Support boundary

The core uses modern browser CSS and ES modules. The complete automated browser suite runs in Chromium; Firefox has additional smoke checks. Safari/WebKit, real-device accessibility sessions, and framework-specific builds remain unverified. The React recipe documents lifecycle ownership, not a tested React package.

Toolkit code and examples are GPL-3.0-only. Community palette material and bundled fonts retain the terms in the notices. All guides are included in the website's [matching source download](https://phosphor.unfinished-works.com/source.tgz). Pin a commit or retain that archive when integrating; review changes before updating an experimental API.
