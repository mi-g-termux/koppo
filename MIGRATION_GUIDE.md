# MIR Labs 3D Portfolio — Migration Guide

This is the English-only Next.js version of the MIR Labs portfolio. It keeps the
3D keyboard scene, smooth scrolling, seasonal visual themes, responsive mobile
layout, accessible project modals, and the content from the old portfolio.

## What was migrated

- **Identity:** Mahfuj Islam, MIR Labs, Bangladesh
- **Contact links:** email, GitHub, Instagram, LinkedIn and WhatsApp from the old site
- **Skills:** HTML5, CSS3, JavaScript, React, Node.js, Next.js, Git, responsive design and UI/UX
- **Flagship projects:** Fruitopia, Creamy, YTrading and MIR Labs Portfolio
- **Screenshots:** copied from the old portfolio archive into `public/projects/mir-labs/`
- **Language:** English only; the old Spanish/English selector is no longer shown
- **Reliability cleanup:** the template now uses Next.js 15.5.25 and local system-font fallbacks instead of a network-dependent Google font import

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If you are using the original ZIP and npm reports
`EALLOWREMOTE` or `package-firewall.replit.internal`, delete the old
`package-lock.json` first. That file was generated inside Replit and contains
machine-specific package URLs; it is not portable to Windows.

For a production check:

```bash
npm run build
npm start
```

The project has no required environment variables for the portfolio itself.

## Where to edit your portfolio data

The main content is intentionally kept in one file:

```text
app/page.tsx
```

1. Update `EMAIL`, `GITHUB`, `INSTAGRAM`, `LINKEDIN` and `WHATSAPP` at the top.
2. Edit the `projects` array to change names, descriptions, details, stacks,
   screenshots, live URLs and GitHub URLs.
3. Add a screenshot to `public/projects/mir-labs/`.
4. Reference it with a public path such as
   `/projects/mir-labs/fruitopia.jpg`.
5. Edit the `experiences` array for your current role or work history.

The project modal automatically displays the project detail text, screenshot
carousel, tech stack, and any `url` or `github` links you add to a project.

## Replacing the temporary project links

The four projects are described from the information supplied in the request.
Because live demo and repository URLs were not included, their action buttons
are intentionally omitted instead of pointing visitors to fake `#` links.
When you have the real URLs, add them to the matching object:

```ts
url: "https://your-live-site.com",
github: "https://github.com/your-name/your-repository",
```

## Moving this into a durable project

1. Extract this ZIP into a new repository or Replit project.
2. Run `npm install`.
3. Replace the temporary screenshots with final screenshots from each real app.
4. Add the real live and GitHub URLs in `app/page.tsx`.
5. Run `npm run build`.
6. Publish the Next.js app.

The portfolio is a showcase site; its payment, courier, invoice and trading
automation descriptions document the capabilities of your separate products.
They do not create those backend integrations inside the portfolio itself.