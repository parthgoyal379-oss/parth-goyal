# Parth Goyal's portfolio

Static HTML, CSS and progressive JavaScript. Preferred origin: https://www.parthgoyal.me/ (the existing production redirect target).

Build with Python 3, with no production dependencies:

```powershell
python scripts/build.py
python scripts/validate.py
python -m http.server 8765 --directory dist
```

Deploy **dist**, never the repository root. `vercel.json` sets the build command and output directory. The build generates project case studies from `content/projects.json` and `templates/project.html`, along with sitemap.xml and robots.txt. Edit homepage summaries in `index.html`, shared refinements in `assets/refinements.css`, and interactions in `assets/site.js`. Keep homepage summaries consistent with the project data. Do not hand-edit dist.

`node scripts/check.mjs` checks all four pages at 320, 390, 768 and 1440px with JavaScript enabled, disabled and reduced motion. It also checks copying email, active navigation and live motion changes. Use a local Playwright installation, the installed Windows Playwright CLI, or set `PLAYWRIGHT_MODULE` to its location. Set `BASE_URL` to test a preview deployment. Screenshots and JSON evidence go into audit/. Fonts are self-hosted with their OFL licenses. The build inlines font definitions and gives fonts/scripts content-hashed URLs for safe caching.

Read [the original SEO audit](SEO-REPORT.md) and [the improvement report](IMPROVEMENTS.md). This repository is connected to `parthgoyal379-oss/parth-goyal`; pushes to main trigger the Vercel production deployment. Search Console, Bing and analytics ownership tasks still require account setup.

The studio design layer lives in `assets/studio.css`. `assets/studio.js` powers the three-project systems explorer and the Ctrl/Cmd+K navigation dialog. The explorer keeps a readable default and case-study link without JavaScript; motion follows the visitor's reduced-motion preference. Run `node scripts/check-studio.mjs` against the preview server to verify explorer states, keyboard navigation, and six viewport widths. Preview screenshots are saved in `audit/`.
