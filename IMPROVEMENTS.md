# Portfolio improvements — 16 October 2026

The improved portfolio is deployed at https://www.parthgoyal.me/. The application changes were included in commit `e6a093b`, together with the owner's Google Search Console verification file. The original age references are unchanged, and the removed city name remains absent from the public pages.

## What changed

- Added a project index to the hero, presented as a paper card on desktop and a compact list on mobile. Each item links directly to an owned case-study page.
- Replaced the unfinished photo placeholder with a workbench note and a link to ClassPredictor's confirmed public source repository.
- Rewrote the three project descriptions around concrete functionality and implementation. Replaced unsupported “zero downtime” and habit-cure wording with descriptions of the actual features. Original ClassPredictor launch figures remain explicitly self-reported.
- Rebuilt project detail pages as distinct case studies with problem, approach, implementation, contribution and outcome sections. Added an on-page contents navigation, technology sidebar, public demo/source links, related projects and a collaboration link.
- Moved project content into `content/projects.json` and layout into `templates/project.html`. The build no longer extracts nested project markup using a fragile regex. All case-study content is in the initial HTML.
- Made contact easier with a copy-email button and accessible success/failure feedback. The normal email link remains available without JavaScript or clipboard access.
- Improved navigation touch targets, 320px layouts, active-section indication, keyboard focus and reduced-motion behavior. Preserved the existing paper aesthetic, typography, counters, stamps, desktop tilt and parallax.
- Consolidated scrolling into one animation-frame update, cached section positions, batched startup layout reads, and limited pointer effects to devices with a fine pointer. Identifiers such as SHA-256 are no longer treated as animated numerical counters.
- Inlined font declarations to remove the separate render-blocking stylesheet request. Font and script URLs now contain content hashes; production returns a one-year immutable cache policy for those assets, so changed files receive fresh URLs while unchanged files stay cached.
- Preserved the Search Console HTML verification file and confirmed it is included in deployment output.

## Validation

The static build and metadata/link/JSON-LD/sitemap validation passed for all four pages. Python syntax checks and JavaScript syntax checks passed. Browser validation covered four routes at 320, 390, 768 and 1440px in normal, JavaScript-disabled and reduced-motion modes: 48 combinations. The local checks also passed email copying, active navigation, project reveals and switching reduced motion while the page is open. Desktop and mobile screenshots were inspected.

Repeating the complete browser matrix against the public domain hit a 30-second navigation timeout. The full matrix is therefore verified locally, while production validation consists of the completed Lighthouse run and direct HTTP/content checks below.

Production HTTP checks confirmed:

- Homepage and all three case-study pages return 200.
- robots.txt returns 200 as text/plain and sitemap.xml returns 200 as application/xml.
- The Search Console verification file returns 200. This confirms file delivery, not that ownership verification has been completed in Google's account interface.
- An unknown page returns a genuine 404.
- Hashed font and JavaScript files return 200 with `public, max-age=31536000, immutable`.
- Age text is retained and the removed city name is absent from the generated HTML.

Latest production Lighthouse 13.5.0 mobile lab result:

| Metric | Result |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| Largest Contentful Paint | 1.9 seconds |
| Cumulative Layout Shift | 0 |
| Total Blocking Time | 40 milliseconds |
| Speed Index | 2.8 seconds |

This is a single simulated mobile lab run against production, not a field-data claim or a guarantee of the score on every connection. The report has no runtimeError or runWarnings. The Windows Lighthouse launcher emitted an EPERM temporary-directory cleanup error after writing the completed report. Raw evidence is retained locally in `audit/iteration-production-final.json`; HTTP evidence is in `audit/iteration-production-http.json`.

The earlier production sample scored 88 performance and 92 SEO; its robots test timed out even though a direct request returned valid content. Network variation affected that sample, so it should not be treated as a controlled improvement percentage. Lab total blocking time does not establish field INP.

Local structured-data checks pass. A fresh attempt to submit the new HTML to Schema.org's validator returned HTTP 405, so external revalidation of this iteration is **pending**, as is Google's Rich Results Test. The prior iteration's validator result does not substitute for validating the changed graph. Production Search Console indexing, selected canonicals, field Core Web Vitals and qualified-contact measurements remain account-dependent.

## Maintenance

Edit homepage copy in `index.html`, case-study copy in `content/projects.json`, shared styles in `assets/refinements.css`, and interactions in `assets/site.js`. Keep facts aligned between the homepage, case studies and project repositories. Run:

```powershell
python scripts/build.py
python scripts/validate.py
python -m http.server 8765 --directory dist
```

Then, in another terminal:

```powershell
node scripts/check.mjs
```

Use `BASE_URL` to check a deployed preview instead. Pushes to main deploy through the existing Vercel integration. Only `dist` is public; the content sources, scripts and audit reports are not copied to the website root.

Guidance checked against [Google's LCP optimization guidance](https://web.dev/articles/optimize-lcp), [Google's AI search guidance](https://developers.google.com/search/docs/appearance/ai-features), and [Google's breadcrumb requirements](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb). Search indexing, rankings and AI citations are not guaranteed by these changes.
