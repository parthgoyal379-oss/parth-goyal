# Parth Goyal: SEO, AEO and GEO audit

Audit date: 16 October 2026. Production inspected at https://www.parthgoyal.me/. **Implementation is local and has not been deployed.** The original site is preserved locally in audit/before.html; it is excluded from the deployment output.

## 1. Architecture and confirmed audit

The supplied application was one 51,387-byte HTML file with inline CSS and JavaScript. It has no frontend framework, client router, package manifest, tests, lint configuration, or build configuration. Vercel response headers establish the hosting platform; dashboard settings and the connected Git repository were not available. This directory itself has no .git directory. All identity, about, project and contact text is already present in the initial HTML: an SSR migration would add needless complexity.

The crawl found one public HTML page with five fragment sections: hero, about, work, method and contact. Fragments are not separate indexable pages. All three linked project demos and the existing GitHub profile returned HTTP 200. These availability checks do not validate the projects' functionality or ownership independently. No other owned profile URLs were supplied, so no LinkedIn or other identity links were invented.

Evidence: audit/live-http.json; audit/before.html; audit/lighthouse-before.json. The web extraction service could not retrieve the initial domain, so direct HTTP requests and browser checks supplied the actual evidence.

| Severity | Confirmed finding / affected URLs | Action / remaining risk |
| --- | --- | --- |
| Critical | None confirmed. No accidental noindex or robots blocking observed. | Actual Google index state requires Search Console. |
| High | Homepage canonical, og:url and Person.url point to parth-goyal.vercel.app while the supplied domain redirects to www.parthgoyal.me. The old Vercel host returns the same HTML with 200. | Align canonical, schema, sharing metadata and sitemap to the existing www origin; configure permanent redirect for the known old host. Deployment required. |
| High | `.reveal` uses opacity:0 by default. With JavaScript disabled, most page content is invisible despite being in HTML. | Default visible content; enable reveal effects after observer setup. Hero identity stays visible immediately. |
| Medium | /robots.txt and /sitemap.xml return 404. Missing robots is not itself a crawl block. | Generate permissive robots and a four-URL sitemap at build time. No artificial lastmod dates, priorities or fragment URLs. |
| Medium | Google Fonts stylesheet blocks initial rendering; first lab LCP 4.63s. | Host the same four font families locally, preserve swap, preload the normal heading and body fonts. Final lab LCP 2.71s remains above target. |
| Medium | Three substantial project descriptions have no owned standalone URLs; names were divs. | Generate three static detail pages from existing cards, add crawlable links, use semantic project headings. Homepage summaries and project pages overlap intentionally; add more original evidence over time. |
| Medium | Homepage lacks main landmark; footer contrast fails 4.5:1 threshold. | Add main and a working skip target; slightly darken footer text. Final automated accessibility score 100 is not a full accessibility certification. |
| Medium | SYNAPSE status and September 2026 launch wording are stale. | User confirmed SYNAPSE is live. Updated status, removed old launch date, and changed two live products to three. |
| Medium | Existing 100+ users, first 100 in two days, zero marketing spend and zero downtime claims lack linked supporting records. | Retained existing wording; not independently verified or copied into schema. Obtain supporting data and qualify zero-downtime wording with a measured period. SYNAPSE health/recovery framing also needs careful evidence; no medical credentials or efficacy claims were added. |
| Low | Large Twitter card requested without any social image; favicon was a data URI. | Add 1200×630 branded PNG, image metadata/alt text, and a crawlable SVG favicon. Search favicon display is unverified. |
| Low | HTTP apex takes two 308 hops before www HTTPS. | Keep the working production HTTPS/domain behavior; assess optional single-hop consolidation in Vercel domain settings. |
| Low | Photo is a placeholder; age and experience durations will become stale. | Preserve the design. Add an authentic portrait later; review age wording by 11 November and time-relative copy regularly. |

Preview domains were not enumerable from the supplied repository. Their exposure and Vercel automatic preview noindex behavior must be checked in the hosting account. No broad *.vercel.app redirect was added: it could break previews.

## 2. Implementation inventory

| File | Implemented change and reason |
| --- | --- |
| index.html | Preferred-domain metadata; factual name/role/location/project introduction; updated SYNAPSE status; linked Person/WebSite/ProfilePage graph; semantic main and project headings; project detail links; progressive reveal behavior; visible hero; CSS anchor offsets; same local fonts; footer contrast. Existing navigation, counters, tilt, parallax, stamps, reduced motion, email and outbound links retained. |
| scripts/build.py | Dependency-free Python static generation; three project pages reuse authored cards rather than speculative case studies. Unique metadata, breadcrumbs, author reference, contact links, robots and sitemap generated together. Only public artifacts copied into dist. |
| assets/favicon.svg, assets/parth-goyal-social.png | Real identity assets for browser and sharing. PNG is a typography-based graphic, not a fabricated portrait. |
| assets/fonts.css, assets/fonts/* | Six WOFF2 files shared across four original font families, Latin subsets, OFL licenses. Existing typography preserved; non-Latin glyphs use fallback fonts. |
| vercel.json | Build/output configuration, trailing-slash consistency, old-host redirect, index.html alias redirects, one-day asset caching. Hosting behavior awaits deployment verification. |
| scripts/validate.py | Static checks for unique metadata, canonical and OG agreement, one h1/main, JSON-LD structure, local targets and exact sitemap inventory. |
| scripts/check.mjs | Chrome checks for four mobile routes with JavaScript on/off, overflow, fragments, script errors, JSON-LD and desktop navigation/reveal; screenshot evidence. |
| README.md, .gitignore | Reproducible build and verification instructions; generated output and local evidence excluded from version control by default. |

Generated public pages: /, /projects/classpredictor/, /projects/synapse/, /projects/verdikt/. A nonindexable 404.html is included. Vercel must retain genuine 404 responses for unknown URLs; no catch-all homepage rewrite was added.

The full per-page title, description, canonical, index directive and schema inventory is appended below and stored in audit/metadata-inventory.json. All four intended public pages are index, follow. Canonicalization and robots are directives/signals, not evidence that Google has indexed a URL.

## 3. AEO and GEO changes

The initial HTML now directly identifies Parth Goyal as a student developer in Saharanpur, India and names what each project does. Existing stack tables and project pipelines provide factual technical context. Owned project pages connect those explanations to the original demos, authorship, contact information and homepage. No artificial FAQ or generic article was created.

Homepage schema uses a stable Person identity linked to a WebSite and ProfilePage. Only the existing public GitHub account appears in sameAs. Project pages use WebPage and BreadcrumbList; they are not presented as articles, reviews, medical products, rated software or verified achievements. Unnecessary exact birth date and unsupported generic machine-learning expertise were omitted from the new identity graph. Google-specific eligibility has not been established merely by producing parsable JSON-LD.

llms.txt was evaluated and deliberately omitted: this small site already exposes its useful content as linked static HTML and JSON-LD. Adding a separately maintained AI summary offers no demonstrated benefit here and risks stale duplication. Google states there is no special AI text file or schema required for its AI search features. Crawl permissions remain permissive, consistent with the original site and the requested discoverability; no new training-specific permissions policy was introduced.

## 4. Validation and actual performance

Commands run: `python scripts/build.py`, `python scripts/validate.py`, `python -m py_compile scripts/build.py scripts/validate.py`, `node scripts/check.mjs`, and Lighthouse 13.5.0 against locally served before/final HTML with default mobile simulated throttling in installed Chrome.

| Local mobile lab metric | Original | Final |
| --- | ---: | ---: |
| Performance | 70 | 92 |
| Accessibility | 92 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| LCP | 4.63s | 2.71s |
| FCP | 4.63s | 2.26s |
| CLS | 0.0006 | 0 |
| Total blocking time | 0ms | 0ms |
| Speed Index | 5.46s | 4.25s |

These are single local runs, not statistical proof, production CDN measurements or real-user field data. Original and final reports have no runtimeError or runWarnings. Earlier Windows Lighthouse invocations returned an EPERM error during temporary-profile cleanup after writing reports; an original run also printed a NO_LCP diagnostic. The final invocation exited successfully. Raw reports are retained; do not describe the CLI invocations as entirely clean exits. Re-run on the deployed site to confirm results. Lighthouse SEO 100 on the original illustrates why its score does not detect all canonical/identity issues.

LCP improved by about 41% in these samples, but the ≤2.5s goal is not yet met. CLS is within the ≤0.1 target. TBT is a lab responsiveness proxy and does **not** establish INP ≤200ms. INP and 75th-percentile field CWV remain unverified. Remaining lab opportunities include font rendering dependencies, CSS minification and decorative rendering costs. Local Python serves without production compression/caching, so those Lighthouse warnings must be rechecked on Vercel. Asset caching is configured locally but untested at the CDN.

Browser checks passed all eight mobile route/JavaScript combinations at 390×844, with one h1/main, visible headings, no horizontal document overflow, no broken fragment targets and no script errors. Desktop navigation/reveal checked at 1440×900. Mobile homepage and project screenshots plus a desktop homepage screenshot were captured; a project screenshot was visually inspected. This is not an exhaustive device or assistive-technology matrix. The final generated project headings passed static and browser validation.

JSON-LD parses and local required-property/relationship checks pass. The Schema.org validator /validate service accepted the final generated HTML for all four pages with zero errors and zero warnings (audit/schema-validator.json). This validates submitted code, not live crawling. Google Rich Results Test remains pending; run it after deployment. Vercel configuration instance validation against its current official JSON schema passed as well. No production deployment, remote redirect execution, ownership verification, sitemap submission, search traffic improvement or indexing result is claimed.

## 5. Ten prioritized content opportunities

These are relevance-based editorial opportunities, not keyword-volume forecasts. Publish only when you can supply actual implementation details and evidence. No demand or competitiveness numbers were measured.

| Priority | Opportunity and search intent | Real basis / evidence to add |
| --- | --- | --- |
| 1 | Extend ClassPredictor case study: name + project, academic dependency graph prediction. | Existing marks→dependency graph→risk→division pipeline. Add an anonymized worked example, graph and limitations. |
| 2 | SYNAPSE launch notes: name + SYNAPSE, AI habit support app. | User-confirmed live status, five-step flow and check-ins. Add real launch date, screenshots and limitations; avoid unsupported therapeutic promises. |
| 3 | Verdikt ingestion architecture: Indian market RSS processing pipeline. | Existing five-source ingestion, Railway backend and Vercel frontend. Add actual architecture diagram, scheduling and retry behavior. |
| 4 | SHA-256 news deduplication engineering note. | Verdikt implementation. Explain actual normalization, duplicate edge cases and tests using allowed excerpts or synthetic examples. |
| 5 | Firebase identity verification in serverless AI endpoints. | Existing SYNAPSE server-side verification description. Add redacted request flow and actual code; no credentials. |
| 6 | Streak resets and relapse response state modeling. | Existing SYNAPSE streak/SOS features. Document actual state transitions and timezone behavior with examples. |
| 7 | Gemini market-impact evaluation: scoring and failure cases. | Existing Verdikt evaluation pipeline. Publish real rubric and examples; distinguish generated interpretations from financial facts. |
| 8 | ClassPredictor launch retrospective: reaching the first users. | Existing 100+ users/two days/₹0 statement. Provide dated, anonymized analytics and explain what “user” means before expanding the claim. |
| 9 | English, Hindi and Hinglish terminal UX. | Existing Verdikt three-language support. Show real UI and explain actual translation/localization strategy; no empty language landing pages. |
| 10 | About/engineering index with repositories and dated decisions. | Existing JavaScript/TypeScript, Python, React, Firebase work. Link exact public repos and contributions once supplied; connect each skill to demonstrated code. |

Prioritize branded and specific implementation queries over broad “best developer” or generic technology terms. Use the consistent full name Parth Goyal; do not invent name variants or founder/employer credentials. Set a sustainable cadence around shipped changes rather than filling a blog quota.

## 6. Deployment, search and analytics checklist

1. Put the changed files into the actual connected repository. No commit or PR was possible in this folder without .git. In Vercel select the correct existing portfolio project, confirm the root directory, framework preset Other, Python 3 availability, build command `python scripts/build.py`, and output `dist`. Do not publish audit/ or scripts/ as public files. The configuration is prepared, not remotely applied.
2. Preview the build and inspect all four pages, navigation, reduced motion, email link, fonts and card interactions. Ensure unknown paths return 404. Vercel preview deployments should use deployment protection or a crawlable noindex response; never place a production-wide noindex in shared HTML.
3. Deploy production. Keep www.parthgoyal.me as primary and the current apex→www domain redirect. Verify HTTPS certificates, query/path preservation and a single permanent old-host→preferred-host redirect for the known Vercel alias. Check /index.html and project index.html aliases, slash normalization, robots/sitemap content types, caching and any X-Robots-Tag. Account-level routing may precede file-based rules, so inspect actual responses.
4. Open https://validator.schema.org/ and test each production URL. Open https://search.google.com/test/rich-results and test the homepage ProfilePage and each project breadcrumb. Confirm names, URL IDs, visible-content agreement and required properties. Save results. A valid schema or rich-result test never guarantees a search enhancement.
5. In Google Search Console add a **Domain property** for parthgoyal.me; copy the exact TXT token generated for your account into the authoritative DNS zone and click Verify after propagation. No token can be generated without account access. Submit `https://www.parthgoyal.me/sitemap.xml`. URL-inspect all four canonical URLs, run Live Test, compare user-declared/Google-selected canonical, confirm rendered text and request indexing where appropriate. Inspect the old alias as well if it is available as a verified property.
6. Add the site to Bing Webmaster Tools. Import the verified Search Console property if offered, or use Bing's exact generated DNS/XML/meta verification option. Submit the same sitemap and use URL Inspection. Monitor crawl errors and duplicate URL handling.
7. Choose analytics: Vercel Web Analytics is a practical option for this host; alternatively create a GA4 web data stream and supply its actual G- measurement ID. Do not insert placeholder tags. Configure applicable consent/privacy settings before enabling collection. Count `contact_click` for mailto and optionally `project_demo_click` by project; never send email contents or other personal data as event parameters. A click is contact intent, not a proven qualified lead. Mark contact intent as a key event, and separately track qualified inquiries received.
8. Establish a 28-day baseline and compare successive periods: branded impressions/clicks (Parth Goyal and legitimate query variants), non-branded discovery, landing pages, indexed canonical pages, organic contacts and qualified inquiries. Filter out your own testing. Review Search Console CWV/CrUX when enough traffic exists and repeat PageSpeed Insights on production. Low traffic may mean no field dataset; do not substitute a lab score for field data.

## 7. Completion states

- **Completed locally:** source audit, public-page/link HTTP checks, canonical/metadata/schema implementation, identity introduction, live SYNAPSE update, three project pages, sitemap/robots generation, local fonts/social/favicon assets, semantic and progressive enhancement fixes, static build/validation, browser checks, local Lighthouse evidence, content plan and account instructions.
- **Partially completed:** performance (2.71s local LCP is above target); project case studies (real existing detail reused, deeper evidence and exact repositories still needed); structured-data validation (local and Schema.org code checks passed; Google rich-result checks pending); hosting redirect and caching configuration (prepared, not executed).
- **Unverified:** field CWV/INP, actual indexed pages and Google-selected canonicals, Google rich-result results, production performance after deployment, all preview domain behavior, mobile devices beyond the tested viewports, independently measured project outcome claims.
- **Requires account access or owner evidence:** production deployment/project linkage, Search Console/Bing ownership verification and sitemap submission, analytics account/measurement choice, private usage evidence and exact public repository/contribution links. No credentials were requested or fabricated.

## 8. Official references used

- [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google ProfilePage requirements](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google AI features guidance](https://developers.google.com/search/docs/appearance/ai-features): no separate AI-file requirement or inclusion guarantee.
- [Vercel project configuration](https://vercel.com/docs/project-configuration)
- [Schema Markup Validator](https://validator.schema.org/) and [Google Rich Results Test](https://search.google.com/test/rich-results): Schema.org submitted-code validation passed; Google rich-result testing pending.

## Full metadata and schema inventory

See the following generated table. All pages use index, follow.

| Page / canonical | Title | Description | Schema |
| --- | --- | --- | --- |
| https://www.parthgoyal.me/ | Parth Goyal — Student Developer & Builder in Saharanpur | I’m Parth Goyal, a student developer in Saharanpur, India. Explore ClassPredictor, SYNAPSE, and Verdikt, built with React, Firebase, and AI APIs. | Person, WebSite, ProfilePage |
| https://www.parthgoyal.me/projects/classpredictor/ | ClassPredictor — Academic prediction with React and Firebase &#124; Parth Goyal | I built ClassPredictor to help students see their class division trajectory from subject-wise marks, prerequisite dependencies, and risk scores. | WebPage, BreadcrumbList |
| https://www.parthgoyal.me/projects/synapse/ | SYNAPSE — An AI habit support web app &#124; Parth Goyal | I built SYNAPSE with a five-step pattern mapping flow, AI-generated plans, daily check-ins, streaks, and relapse responses. SYNAPSE is live. | WebPage, BreadcrumbList |
| https://www.parthgoyal.me/projects/verdikt/ | Verdikt — AI market news intelligence for India &#124; Parth Goyal | I built Verdikt to ingest Indian market news, deduplicate stories with SHA-256, and evaluate market impact with a Gemini multi-agent pipeline. | WebPage, BreadcrumbList |
