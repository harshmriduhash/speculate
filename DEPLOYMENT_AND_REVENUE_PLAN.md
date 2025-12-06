# Deployment & Revenue Plan for Speculate MVP

## Deployment Strategy

### Phase 1: Local Testing (This Week)
1. Install dependencies and set up local Postgres
2. Run migrations: `npx prisma migrate dev --name init`
3. Seed demo data: `npx ts-node prisma/seed.ts`
4. Test Razorpay checkout with test keys locally
5. Verify webhook handling with Razorpay CLI or tunnel service

### Phase 2: Staging (Week 2)
- Deploy to a staging environment (Vercel recommended for Next.js)
- Configure environment variables for staging Razorpay/Stripe keys
- Test full payment flow end-to-end
- Validate email notifications and payment records
- QA subscription lifecycle

### Phase 3: Production Launch (Week 3+)
- Use production Razorpay keys (India) and Stripe keys (global)
- Deploy to production (Vercel, AWS, DigitalOcean, etc.)
- Set up monitoring (error tracking, analytics, uptime monitoring)
- Configure production database backups
- Enable webhook forwarding for both Razorpay and Stripe

## Deployment Platforms

### Recommended: Vercel
- **Why**: Built-in Next.js support, instant deployments, auto-scaling
- **Cost**: Free tier + $20/month for production ($0–$100 depending on usage)
- **Setup**: Connect GitHub repo, set environment variables, deploy on push

### Alternative: AWS
- EC2 + RDS (PostgreSQL) + ALB
- More control, slightly higher complexity

### Alternative: DigitalOcean
- App Platform (similar to Vercel but cheaper) + Managed PostgreSQL
- Cost: ~$12/month base

## Environment Variables (Production)

Set these in your deployment platform:
```
# Database
POSTGRES_PRISMA_URL="postgresql://user:pass@db.example.com/speculate"
POSTGRES_URL_NON_POOLING="postgresql://user:pass@db.example.com/speculate"

# NextAuth
NEXTAUTH_URL="https://speculate.com"
NEXTAUTH_SECRET="<generate-long-random-string>"

# Auth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Razorpay (India primary)
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="<secret>"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_..."

# Stripe (Global launch later)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Optional: Analytics, Email, etc.
OPENAI_API_KEY="sk-..."
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.xxxxx"
EMAIL_FROM="noreply@speculate.com"
```

## Revenue Model

### Pricing Tiers (India-First)
- **Free**: 1 flow, basic templates, community support → $0/month
- **Pro**: Unlimited flows, premium templates, analytics, priority support → ₹499/month (≈$6)
- **Team**: Everything in Pro + unlimited team members, custom domain → ₹1,499/month (≈$18)

### Revenue Streams

1. **Subscriptions (60% of revenue)**
   - Monthly recurring from Pro/Team subscriptions
   - Target: 5% conversion from free → Pro in month 3

2. **Marketplace Templates (25% of revenue)**
   - 70% goes to seller, 30% to platform
   - Sell premium templates: ₹199–₹999 each
   - Target: 20 template sellers by month 6

3. **Credits/One-Off Purchases (15% of revenue)**
   - Credits for template purchases, bulk operations, API calls
   - ₹99–₹999 packs

## 1-Year Revenue Projection (India Launch)

### Conservative Scenario (3% conversion)
- **Month 1–2**: Launch + viral marketing push
  - 10,000 signups, 300 Pro conversions = ₹149,700/month (~$1,800)
- **Month 3–4**: Product-market fit + referral loop
  - 30,000 signups, 900 Pro conversions = ₹449,100/month (~$5,400)
- **Month 5–6**: Marketplace launch + creators uploading
  - 60,000 signups, 1,800 Pro + 50 template sales = ₹1,010,000/month (~$12,100)
- **Month 7–12**: Scale & retention optimization
  - 150,000 signups, 4,500 Pro + 200 template sales = ₹2,500,000/month (~$30,000)

**Year 1 Total: ₹7–8 Crore (~$840k–$960k)**

### Optimistic Scenario (5% conversion)
- Month 1–2: 500 Pro = ₹249,500/month
- Month 3–4: 1,500 Pro = ₹749,500/month
- Month 5–6: 3,000 Pro + 100 templates = ₹1,700,000/month
- Month 7–12: 7,500 Pro + 400 templates = ₹4,000,000/month

**Year 1 Total: ₹12–13 Crore (~$1.4m–$1.6m)**

### Pessimistic Scenario (1% conversion)
- Month 1–2: 100 Pro = ₹49,900/month
- Ramp slower, but still profitable by month 6

## CAC & LTV

- **CAC (Customer Acquisition Cost)**: ₹200–₹500 (via organic + early SEM)
- **LTV (Lifetime Value)**: ₹3,000–₹10,000 per Pro user (assuming 2–3 year retention)
- **LTV:CAC Ratio**: 6–50x (strong economics)

## Go-To-Market Strategy (First 3 Months)

### Tactic 1: Organic + SEO
- Blog posts: "Top 5 Flow Builders," "Questionnaire Templates," etc.
- Target: 500–1,000 organic signups/month

### Tactic 2: Twitter/LinkedIn + Early Community
- Launch day thread → 1,000 followers
- Daily tips, template examples, case studies
- Target: 2,000 signups from social

### Tactic 3: Product Hunt / Indie Hackers
- Submit on day 1, aim for #1 trending
- Target: 5,000 signups in first week

### Tactic 4: Partnerships
- Content creators, template designers (rev share)
- Target: 10–20 creators uploading templates month 2

### Tactic 5: Referral Loop
- Invite friends → ₹100 credit for referrer + referee
- Built into onboarding

## Retention & Churn

- **Churn Target**: <5% monthly for Pro (industry avg ~3–8%)
- **Strategy**:
  - Email nurture 2–3x/week (tips, new templates, case studies)
  - In-app onboarding to reach "aha moment" in first session
  - Monthly feature releases (new nodes, AI improvements, analytics)
  - Premium support for Team tier

## Success Metrics (Year 1)

| Metric | Target | Stretch |
|--------|--------|---------|
| Signups | 150k | 250k |
| Pro Users | 4,500 | 12,500 |
| Monthly Recurring Revenue (MRR) | ₹2.2 Crore | ₹3.5 Crore |
| Team Plans | 200 | 500 |
| Marketplace Templates | 200 | 1,000 |
| Net Retention Rate | >110% | >125% |

## Budget Allocation (Monthly by Month 6)

- **Product Development**: 40% (2–3 engineers)
- **Marketing & Growth**: 30% (1 marketer + SEM)
- **Operations & Infrastructure**: 20% (hosting, email, monitoring)
- **Sales & Support**: 10% (1 support person)

## Next Steps (Post-MVP)

1. **Month 2–3**: Expand to global (US + EU) with Stripe
2. **Month 4–6**: Hire first sales person for enterprise deals
3. **Month 6–9**: B2B partnerships (CMS, CRM integrations)
4. **Month 9–12**: API marketplace, white-label offerings

---

## Technical Notes for Launch

- Keep Stripe + Razorpay running in parallel (easy global expansion later)
- Monitor Razorpay charge backs and fraud (implement 3D Secure)
- Daily backups of production database
- Error tracking + alerting (Sentry recommended)
- Email delivery monitoring (SendGrid recommended)
- CDN for static assets (Cloudflare free tier)
- Analytics: Mixpanel or Plausible for event tracking

