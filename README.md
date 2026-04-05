# ShipCred

**Talk is cheap. Commits aren't.**

The proof-of-work network for AI-native GTM professionals. Connect GitHub. Show what you've shipped. Get your ShipCred.

→ [shipcred.io](https://shipcred.io)

---

## What is ShipCred?

Everyone says they're "AI-native" on LinkedIn. ShipCred proves it.

Connect your GitHub and we automatically detect your AI-assisted commits — Claude Code, Cursor, Copilot, Aider, and more. Your profile at `shipcred.io/username` becomes your verifiable credential showing you actually ship, not just talk.

**Built for:** Marketers, SDRs, Account Executives, Growth Operators, and Founders who use AI coding tools for go-to-market work.

## How It Works

1. **Connect GitHub** — We scan your commits (including private repos) for AI tool signatures
2. **Build Your Profile** — Add your portfolio, declare your tools, get vouched by peers
3. **Share Your ShipCred** — Your profile URL is your proof. Share it everywhere.

## ShipCred Score

Your score (0-1000) is calculated from four proof tiers:

| Source | Max Points | Weight | Verification |
|---|---|---|---|
| **GitHub commits** | 500 | Highest | Auto-detected AI tool signatures |
| **Portfolio projects** | 250 | Medium | Self-reported + community vouches |
| **Community vouches** | 150 | Medium | Peer endorsements |
| **Tool declarations** | 100 | Lowest | Self-declared (verified if found in commits) |

**Tiers:** Unranked (0-49) → Shipper (50-249) → Builder (250-499) → Captain (500-749) → Legend (750+)

## Privacy

- We **never** store source code — only commit metadata (SHA, timestamp, diff stats, AI detection)
- Private repo names are **never** displayed publicly
- GitHub tokens are encrypted at rest
- Disconnect GitHub anytime — all commit data is deleted immediately
- This project is fully open source — audit exactly what we collect

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **UI:** Tailwind CSS + DaisyUI
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Vercel
- **OG Images:** @vercel/og (Satori)
- **Email:** Resend
- **Analytics:** PostHog

## Getting Started

```bash
# Clone the repo
git clone https://github.com/your-org/shipcred.git
cd shipcred

# Install dependencies
pnpm install

# Copy environment variables
cp .env.local.example .env.local
# Fill in your Supabase, GitHub OAuth, and other keys

# Run database migrations
pnpm supabase db push

# Start dev server
pnpm dev
```

## Contributing

ShipCred is open source. Contributions welcome.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push and open a PR

## License

AGPL-3.0 — You can fork, modify, and self-host. But if you run a modified version as a hosted service, you must open source your changes. This protects the community while keeping the project fully open.

---

Built with Claude Code by [@AnkurShrestha](https://twitter.com/AnkurShrestha)
