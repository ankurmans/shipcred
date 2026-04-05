# Viral PLG Engine for GTM Commit

## Context

GTM Commit is ~80% feature-complete as a proof-of-work platform. The core loop works (connect GitHub -> detect AI commits -> score -> public profile). However, the **distribution and re-engagement mechanics** are weak. The biggest gap: when someone shares their profile on LinkedIn and a visitor clicks through, there is **zero conversion prompt** on the public profile page. The share text lacks hashtags and compelling copy. There are no embeddable badges for external distribution. No email notifications to drive re-engagement. No referral incentives.

This plan adds the missing viral PLG mechanics in 3 phases, ordered by impact-to-effort ratio.

---

## Phase 1: Quick Wins (High Impact, Low Effort)

### 1.1 Profile Page Visitor CTA Banner

**Why:** Every profile visit from LinkedIn/Twitter is a wasted conversion if there's no signup prompt. This is the single highest-leverage change.

**What:** Add a sticky bottom banner for unauthenticated visitors: _"What's YOUR GTM Commit score? Get yours free →"_

**Files to modify:**
- `app/[username]/page.tsx` — detect auth state, conditionally render CTA banner
- **New:** `components/profile/VisitorCTA.tsx` — sticky bottom CTA component

**Implementation:**
- Use `createClient()` from `lib/supabase/server.ts` to check auth in the profile page server component
- If no authenticated user, render a fixed-bottom banner with gradient background matching brand
- CTA links to `/login` or hero username input
- Banner dismissable via client-side state (cookie to remember dismissal for session)
- Mobile-friendly: full width, large tap target

**Viral impact:** HIGH — directly converts profile visitors into signups

---

### 1.2 Enhanced Share Text with Hashtags

**Why:** Current share text is generic ("Check out my GTM Commit"). Better copy + hashtags increase impressions and create a trackable movement.

**What:** Upgrade ShareButton with compelling, pre-populated share copy and hashtags.

**Files to modify:**
- `components/shared/ShareButton.tsx` — update tweet/LinkedIn text

**Implementation:**
- Twitter text: `"My GTM Commit Score: {score} ({tier} tier). Talk is cheap. Commits aren't. #GTMCommit #AIShipped\n\n{url}"`
- LinkedIn text: Include score and tier in the share URL description
- Add score/tier as props to ShareButton (already partially passed via `title`)

**Viral impact:** HIGH — better share copy = more clicks per share

---

### 1.3 "Powered By" Badge Upgrade

**Why:** Current badge is a single line of faint text (`components/profile/PoweredByBadge.tsx`). It should be more visually compelling to drive clicks back to homepage.

**What:** Redesign PoweredByBadge with the GTM Commit logo, score, and a mini CTA.

**Files to modify:**
- `components/profile/PoweredByBadge.tsx` — redesign with logo + "Get your score" text

**Viral impact:** MEDIUM — passive but persistent backlink on every profile

---

### 1.4 Activity Feed on Landing Page ("Recently Joined")

**Why:** Shows social proof that real people are signing up NOW. Creates urgency/FOMO.

**What:** Add a "Recent Builders" section below the hero showing the last 5-10 signups with avatars and scores.

**Files to modify:**
- **New:** `components/landing/RecentBuilders.tsx` — horizontal scroll of recent profiles
- `app/page.tsx` — add RecentBuilders section
- `app/api/leaderboard/route.ts` — add `?recent=true` query param to return newest profiles

**Viral impact:** MEDIUM — increases landing page conversion rate

---

## Phase 2: Growth Loops (Medium Effort, Strong Loops)

### 2.1 Embeddable Score Badge (shields.io-style)

**Why:** Huge distribution channel. Users embed badges on GitHub READMEs, personal sites, email signatures. Each badge is a backlink to their profile.

**What:** Dynamic SVG badge API endpoint + embed code generator in dashboard.

**Files to create:**
- **New:** `app/api/badge/[username]/route.ts` — generates SVG badge with score + tier
- **New:** `components/dashboard/EmbedCodeGenerator.tsx` — shows HTML/Markdown snippets
- `app/(app)/dashboard/page.tsx` — add "Embed Your Score" section

**Implementation:**
- SVG endpoint returns a shields.io-style badge: `[GTM Commit | 724 Captain]`
- Badge links to `gtmcommit.com/{username}`
- Dashboard shows copy-pasteable code:
  - HTML: `<a href="..."><img src="/api/badge/{username}" /></a>`
  - Markdown: `[![GTM Commit](gtmcommit.com/api/badge/{username})](gtmcommit.com/{username})`
- Cache badge SVG with `Cache-Control` headers (revalidate every hour)

**Viral impact:** HIGH — every badge on a GitHub README or website is a permanent backlink

---

### 2.2 Milestone Celebration Cards

**Why:** Spotify Wrapped-style moments that users share organically. Tier upgrades, first AI commit detected, score milestones.

**What:** Generate shareable milestone images via `@vercel/og` when users hit key moments.

**Files to create:**
- **New:** `app/api/og/milestone/route.tsx` — generates milestone card images (reuse existing pattern from `app/api/og/[username]/route.tsx`)
- **New:** `components/dashboard/MilestoneCard.tsx` — displays milestone with share buttons
- `lib/scoring/calculate.ts` — detect milestones during score recalculation (return milestone events)
- **New:** `lib/milestones.ts` — milestone definitions and detection logic

**Milestones to track:**
- First AI commit detected
- Tier upgrades (Shipper → Builder → Captain → Legend)
- Score crossing 100, 250, 500, 750
- First vouch received
- 10th, 50th, 100th AI commit

**Implementation:**
- After score calculation, compare old vs new score/tier to detect milestone triggers
- Store milestones in a new `profile_milestones` table (see migration below)
- Dashboard shows unseen milestones with "Share This Achievement" button
- Share button pre-populates: _"Just hit {tier} tier on GTM Commit! {score}/1000. #GTMCommit"_ + milestone OG image URL

**Viral impact:** HIGH — creates organic share moments users WANT to post

---

### 2.3 Referral Tracking

**Why:** Each user becomes a distribution channel. Referred users who complete profiles = bonus points for referrer.

**What:** `?ref=username` parameter tracking + referral bonus scoring.

**Files to modify:**
- `app/api/auth/callback/route.ts` — capture `ref` param from cookie during signup
- `app/api/auth/github/route.ts` — store `ref` in cookie before OAuth redirect
- `components/landing/Hero.tsx` — capture `?ref=` from URL and store in cookie
- `lib/scoring/calculate.ts` — add referral bonus to score (5 pts per referred user who completes profile, max 50 pts)
- **New:** `components/dashboard/ReferralSection.tsx` — shows referral link + stats

**Schema change:**
- Add `referred_by TEXT` column to `profiles` table (stores referrer's username)

**Viral impact:** HIGH — turns every user into a growth channel with incentive alignment

---

### 2.4 Email Notifications (Wire Up Resend)

**Why:** Re-engagement is the biggest gap. Users sign up, sync once, and forget. Notifications bring them back.

**What:** Transactional emails for key moments using Resend (dependency already in `package.json`).

**Files to create:**
- **New:** `lib/email/client.ts` — Resend client wrapper
- **New:** `lib/email/templates/welcome.tsx` — welcome email (React Email or HTML)
- **New:** `lib/email/templates/vouch-received.tsx` — "Someone vouched for you!"
- **New:** `lib/email/templates/tier-upgrade.tsx` — "You're now a Builder!"
- **New:** `lib/email/templates/weekly-digest.tsx` — weekly score/rank summary
- **New:** `lib/email/send.ts` — dispatcher function

**Trigger points (modify existing files):**
- `app/api/auth/callback/route.ts` — send welcome email on new user creation
- `app/api/vouches/route.ts` — send vouch notification on POST
- `lib/scoring/calculate.ts` — send tier upgrade email when tier changes
- **New:** `app/api/cron/digest/route.ts` — weekly digest cron job

**Schema change:**
- Add `email_notifications BOOLEAN DEFAULT true` to profiles
- Add `last_digest_sent_at TIMESTAMPTZ` to profiles

**Viral impact:** MEDIUM — drives return visits and engagement, not direct virality

---

## Phase 3: Compounding Growth (Higher Effort, Long-Term)

### 3.1 Profile View Counter

**Why:** "X people viewed your profile this week" drives re-engagement and gives users a reason to share more.

**What:** Track anonymous profile views, show count to profile owner on dashboard.

**Files to create:**
- **New:** `app/api/profiles/[username]/view/route.ts` — POST endpoint to record a view
- **New:** `components/dashboard/ProfileViews.tsx` — view count display

**Files to modify:**
- `app/[username]/page.tsx` — fire view tracking call (client-side, after render)
- `app/(app)/dashboard/page.tsx` — show weekly view count

**Viral impact:** MEDIUM — creates engagement feedback loop

---

### 3.2 Compare Scores Feature

**Why:** Competitive comparison is inherently shareable. "My score vs yours" creates two-sided sharing.

**What:** Side-by-side score comparison page with shareable OG image.

**Files to create:**
- **New:** `app/compare/[user1]/[user2]/page.tsx` — comparison page
- **New:** `app/api/og/compare/route.tsx` — comparison OG image
- **New:** `components/profile/CompareCard.tsx` — side-by-side display

**Files to modify:**
- `app/[username]/page.tsx` — add "Compare with me" button
- `components/shared/ShareButton.tsx` — reuse for comparison sharing

**Viral impact:** HIGH — competitive sharing drives two-sided engagement

---

### 3.3 Programmatic SEO Pages

**Why:** Capture long-tail search traffic for "Claude Code users", "AI-native marketers", etc.

**What:** Auto-generated pages for tools and roles.

**Files to create:**
- **New:** `app/tools/[tool]/page.tsx` — e.g., `/tools/claude-code` showing all users who use Claude Code
- **New:** `app/roles/[role]/page.tsx` — e.g., `/roles/growth-engineer`
- Both pages pull from existing `tool_declarations` and `profiles` tables

**Viral impact:** MEDIUM — passive inbound growth, compounds over time

---

## Database Migration

### `supabase/migrations/006_viral_plg.sql`

```sql
-- Referral tracking
ALTER TABLE profiles ADD COLUMN referred_by TEXT;
ALTER TABLE profiles ADD COLUMN email_notifications BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN last_digest_sent_at TIMESTAMPTZ;
CREATE INDEX idx_profiles_referred_by ON profiles(referred_by) WHERE referred_by IS NOT NULL;

-- Profile view tracking
CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_hash TEXT NOT NULL,
  viewed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(profile_id, viewer_hash, viewed_at)
);
CREATE INDEX idx_profile_views_profile ON profile_views(profile_id, viewed_at DESC);

-- Milestones
CREATE TABLE profile_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,      -- 'tier_upgrade' | 'score_milestone' | 'commit_count' | 'first_vouch'
  milestone_value TEXT,               -- 'builder' | '500' | '100' | etc.
  achieved_at TIMESTAMPTZ DEFAULT now(),
  seen_at TIMESTAMPTZ,
  shared_at TIMESTAMPTZ,
  UNIQUE(profile_id, milestone_type, milestone_value)
);
CREATE INDEX idx_milestones_profile ON profile_milestones(profile_id, achieved_at DESC);
CREATE INDEX idx_milestones_unseen ON profile_milestones(profile_id) WHERE seen_at IS NULL;

-- RLS
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile views insert by anyone" ON profile_views
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Profile views read by owner" ON profile_views
  FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Milestones viewable by owner" ON profile_milestones
  FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
```

---

## Verification Plan

### Phase 1 Testing
- Open a profile page in incognito → verify CTA banner appears
- Log in → verify CTA banner disappears
- Click share on Twitter → verify hashtags and score in pre-populated text
- Check PoweredByBadge renders with updated design
- Check landing page shows RecentBuilders section

### Phase 2 Testing
- Hit `/api/badge/{username}` → verify SVG renders with correct score/tier
- Embed badge HTML in a test page → verify it renders and links correctly
- Sign up with `?ref=testuser` → verify `referred_by` is stored
- Trigger a score recalculation → verify milestone detection
- Check milestone card renders on dashboard with share button
- Send test emails via Resend → verify delivery

### Phase 3 Testing
- Visit a profile → verify view count increments
- Check dashboard shows weekly view count
- Visit `/compare/user1/user2` → verify comparison renders
- Visit `/tools/claude-code` → verify tool page renders with correct profiles

---

## Implementation Priority Matrix

| Priority | Feature | Files Changed/Created | Complexity | Viral Impact |
|----------|---------|----------------------|------------|--------------|
| **P0** | 1.1 Visitor CTA Banner | 2 files | Small | HIGH |
| **P0** | 1.2 Enhanced Share Text | 1 file | Tiny | HIGH |
| **P0** | 1.3 PoweredBy Badge Upgrade | 1 file | Tiny | MEDIUM |
| **P1** | 1.4 Recent Builders Feed | 3 files | Small | MEDIUM |
| **P1** | 2.1 Embeddable Score Badge | 3 files | Medium | HIGH |
| **P1** | 2.2 Milestone Cards | 5 files + migration | Medium | HIGH |
| **P2** | 2.3 Referral Tracking | 5 files + migration | Medium | HIGH |
| **P2** | 2.4 Email Notifications | 8 files + migration | Large | MEDIUM |
| **P3** | 3.1 Profile View Counter | 4 files + migration | Medium | MEDIUM |
| **P3** | 3.2 Compare Scores | 4 files | Medium | HIGH |
| **P3** | 3.3 SEO Pages | 2 files | Small | MEDIUM |

All Phase 2+ schema changes consolidated into `006_viral_plg.sql`.
