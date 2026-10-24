# AGENTS.md — hire-me

This repo is a zero-build, static proof-of-work page for Meet Shah. Keep it honest, fast and easy to audit.

## Ground rules

- **Only verified facts.** No invented employers, job titles, years of experience, education, location, work authorization, client names, revenue, stars or outcomes. If a fact is unknown, omit it or say "on request".
- **Dated claims.** Audit scores and repo counts are snapshots. Include the date when repeating them.
- **No fake social proof.** No testimonial, logo or metric may be added without a public source and permission.
- **No tracking.** No analytics, cookies, pixels, fingerprinting or third-party scripts beyond Google Fonts and FormSubmit.
- **Forms are human-triggered.** Never auto-submit the contact form. It sends a real email.
- **Preserve the zero-build setup.** Plain HTML, CSS and JavaScript. No bundler, framework or runtime dependencies.

## Files

- `index.html` — the page. Canonical URL, OG/Twitter tags and Person JSON-LD live in the head.
- `styles.css` — all styling. Dark palette, lime accent, responsive at 980/760/440.
- `app.js` — nav, copy-email, year, contact form + error handling.
- `privacy.html`, `terms.html` — plain-language legal pages.
- `og.png` — 1200×630 social card.
- `llms.txt`, `robots.txt`, `sitemap.xml` — agent and crawler files.
- `.github/workflows/pages.yml` — GitHub Pages deploy from the repo root.

## Local checks

```bash
python -m http.server 4182
# open http://127.0.0.1:4182/
node --check app.js
```

Audit the live page with LaunchGrade:

```bash
node ../launchgrade/bin/launchgrade.js https://fastpresspages.github.io/hire-me/
```

## Editing availability

The availability copy in `index.html` currently says freelance, collaboration and full-time conversations are open, remote-friendly, with timezone and authorization details on request. If that changes, update `index.html`, `llms.txt`, and the Person JSON-LD `seeks` field together.

## Contact form

`app.js` posts to `https://formsubmit.co/ajax/meetcode99@gmail.com`. FormSubmit may return HTTP 200 with `{"success":"false"}`; that must be treated as an error. Test with a mocked `fetch`, not by sending repeated real emails.
