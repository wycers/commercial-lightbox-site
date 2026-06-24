# Commercial Lightbox

Astro landing site for Perth-based custom commercial lightbox signage with Australia-wide design, fabrication, and delivery support.

## Environment

Create `.env.local` before running the quote form:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
PUBLIC_SITE_URL=https://your-a-site.example
PUBLIC_B_SITE_URL=https://your-fuel-price-board-site.example
PUBLIC_BUSINESS_NAME="Your business name"
PUBLIC_SERVICE_AREA="Australia-wide"
PUBLIC_CONTACT_PHONE="+61 ..."
PUBLIC_CONTACT_EMAIL=quotes@example.com
PUBLIC_BUSINESS_ABN="..."
```

`PUBLIC_SITE_URL` controls canonical URLs and sitemap output. `PUBLIC_B_SITE_URL`
controls contextual links to the FuelWatch-ready fuel price board site.
`PUBLIC_CONTACT_PHONE`, `PUBLIC_CONTACT_EMAIL`, and `PUBLIC_BUSINESS_ABN` are
optional and are only displayed when configured, so the site does not publish
unverified contact or registration details. The old `NEXT_PUBLIC_*` names are
still supported for existing Vercel environments.

## Development

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm preview
```
