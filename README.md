# Tejas Thange — portfolio

My personal site: the projects I've built, where I've worked, and a page of things I like outside of work.

Built with Next.js 16 (App Router), React 19, Tailwind CSS v4 and Motion.

## What's in it

- **Home, Work, Experience, Space** — four pages, with case studies for the main ML projects under `/work/[slug]`.
- **Playground** — a small CNN that reads hand-drawn digits right in the browser, with a slider that lowers the weight precision so you can see when it starts getting them wrong.
- **The terrain lines** — my name drawn as a relief map of lines, in the intro and the footer (canvas, no libraries).
- **A message form** on the Space page, sent through [Resend](https://resend.com).
- **A visitor counter** that counts each browser once, stored in Upstash Redis.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Environment variables

Put these in `.env.local` locally, and in the project's settings on Vercel.

| Variable | What it's for |
| --- | --- |
| `RESEND_API_KEY` | Sending messages from the form |
| `CONTACT_EMAIL` | Where those messages go |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | The visitor count (added automatically when Upstash Redis is connected on Vercel). Without them, the count lives in `.data/` locally and is hidden in production |
| `NEXT_PUBLIC_SITE_URL` | Optional. The site's address once it has a custom domain; Vercel's address is used until then |

## Project layout

- `src/app` — pages, API routes (`api/ask`, `api/visit`), icons, link-preview image, sitemap and robots
- `src/components` — everything on the pages
- `src/content` — the words: projects, experience, quotes, films, books
- `public` — images, the résumé, and the Playground model's weights
