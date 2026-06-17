# Commercial Lightbox

Next.js landing site for custom commercial lightbox signage in Western
Australia.

## Environment

Create `.env.local` before running the quote form:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
NEXT_PUBLIC_SITE_URL=https://your-a-site.example
NEXT_PUBLIC_B_SITE_URL=https://your-fuel-price-board-site.example
```

`NEXT_PUBLIC_SITE_URL` controls canonical URLs and sitemap output.
`NEXT_PUBLIC_B_SITE_URL` controls contextual links to the FuelWatch-ready fuel
price board site.

## Development

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```
