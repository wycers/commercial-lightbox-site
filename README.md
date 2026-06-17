# Commercial Lightbox

Astro landing site for custom commercial lightbox signage in Western Australia.

## Environment

Create `.env.local` before running the quote form:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
PUBLIC_SITE_URL=https://your-a-site.example
PUBLIC_B_SITE_URL=https://your-fuel-price-board-site.example
```

`PUBLIC_SITE_URL` controls canonical URLs and sitemap output. `PUBLIC_B_SITE_URL`
controls contextual links to the FuelWatch-ready fuel price board site. The old
`NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_B_SITE_URL` names are still supported for
existing Vercel environments.

## Development

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm preview
```
