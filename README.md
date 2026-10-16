# Parth Goyal's portfolio

Static HTML, CSS and progressive JavaScript. Preferred origin: https://www.parthgoyal.me/ (the existing production redirect target).

Build with Python 3, with no production dependencies:

```powershell
python scripts/build.py
python scripts/validate.py
python -m http.server 8765 --directory dist
```

Deploy **dist**, never the repository root. `vercel.json` sets the build command and output directory. The build generates three project pages from the authored homepage cards and regenerates sitemap.xml and robots.txt. Edit project detail introductions in `scripts/build.py`; edit project descriptions, technologies and demo links in `index.html`. Add new projects to the build inventory and keep its card extraction assertion in sync. Do not hand-edit dist.

`node scripts/check.mjs` checks the running local server with Chrome and the installed Windows Playwright CLI. If Playwright is installed elsewhere, adjust its import path. Screenshots and JSON evidence go into audit/. Fonts are self-hosted with their OFL licenses.

Read [the SEO audit and deployment checklist](SEO-REPORT.md). Changes are local; deploying and account verification are separate steps. This folder was supplied without a Git repository or Vercel project link.
