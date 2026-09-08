# Demo hosting and sharing

The demo is static and is configured for the `unfinished-phosphor` Cloudflare Pages project without a backend, database, or runtime secrets.

## Before the first public upload

The public edition contains four Phosphor variants and three community adaptations with pinned upstream sources and MIT notices. Unreviewed palettes are omitted. Apply the same source-and-notice review before adding further imported palettes.

Run `npm run check`, inspect the exact files selected for the public commit, and review the resulting source archive. Keep private workflow artifacts, screenshots, environment files, and sibling application code out of the commit. Commit and push complete build inputs, including `package.json`, `package-lock.json`, and `.node-version`, before triggering a Git-based build.

## Cloudflare Pages settings

After the release contents have been reviewed and pushed, import `ghreprimand/unfinished-phosphor` through Cloudflare Pages' Git integration. In GitHub's [installed applications](https://github.com/settings/installations), configure **Cloudflare Workers and Pages**, choose **Only select repositories**, and add `unfinished-phosphor` while retaining any existing selections you still use. Save the change. If the app is not installed, Cloudflare's connection flow will offer installation. This grants repository access; making a repository public is not a substitute for authorizing the app. [Cloudflare GitHub access instructions](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)

In Cloudflare, open **Workers & Pages → Create application → Pages → Connect to Git** (the Git import option), select the GitHub account and repository, then enter:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | Repository root |
| Framework preset | None |
| Build command | `npm ci --include=dev && npm run build` |
| Output directory | `dist` |
| Node.js | `.node-version` specifies `24.19.0` |

Use the existing `unfinished-phosphor` project, which assigns `unfinished-phosphor.pages.dev`. Git integration builds pushed changes. Verify the deployment before adding the custom domain below. [Cloudflare Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/), [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [Node version selection](https://developers.cloudflare.com/pages/configuration/build-image/).

Choose Git integration when creating the project if automatic GitHub deployments are desired. A Direct Upload project cannot later be switched to Git integration. [Cloudflare Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## Custom address

The public address is `https://phosphor.unfinished-works.com/`. HTTPS was verified on 2026-09-08; new DNS records can remain absent from some resolver caches after activation.

First open the Pages project → **Custom domains → Set up a domain**, and enter `phosphor.unfinished-works.com`. If the domain's DNS is managed in this Cloudflare account, confirm the CNAME that Cloudflare offers to create. Otherwise add a CNAME at the authoritative DNS provider: name `phosphor`, target the exact `<project>.pages.dev` hostname assigned to this project. Use a hostname, without `https://` or a path. This subdomain uses Pages; it needs no VPS host entry or server IP.

Register the hostname in Pages before adding a CNAME manually. A DNS record alone does not configure Pages to serve that hostname. Wait for the custom domain and certificate to become active, then verify HTTPS. Modify only the `phosphor` record; the parent site's existing DNS records serve a different site. [Cloudflare custom-domain instructions](https://developers.cloudflare.com/pages/configuration/custom-domains/)

The README and playground canonical URL now use the public address. Set the GitHub repository's About/Website field to the same address. Capture a representative demo image for social previews after the public palette selection is final; use synthetic demo content.

## What the build contains

`npm run build` creates the static pages and assets, then adds `LICENSE`, `THIRD_PARTY_NOTICES.md`, and `source.tgz` to `dist/`. All three pages link to these files. The archive contains an explicit list of standalone source files, build configuration, lockfile, notices, and tests; it does not archive the entire working directory or Git history. Update that list in `scripts/package-demo.mjs` when adding required source files.

The archive's palette JSON can be edited directly. Rebuilding does not require a private reference repository or running the optional snapshot ingestion utility. Use `npm ci --include=dev`, then `npm run build` after extracting it. Node.js and GNU `tar` are required. Archive ownership and timestamps are normalized instead of recording workstation metadata. Keep the source archive alongside the matching deployment so the source link does not drift to a different revision. This supports GPL's corresponding-source requirement for distributed builds. [GPL-3.0, section 6](https://www.gnu.org/licenses/gpl-3.0.html).

For local inspection of production output:

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

Visit `http://localhost:4173/`. Development preview source-download links use the most recent local build archive.

Before announcing the public site, check all three pages, keyboard controls, narrow screens, and the license/source downloads at the actual deployed address. Put the demo URL first and the repository URL second in a post. Describe it as an experimental CRT CSS/JavaScript toolkit, credit the adapted palettes, and avoid implying an npm package exists.
