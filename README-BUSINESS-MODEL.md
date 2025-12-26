# Club Manager Web - Business Model & Payment Documentation

## Overview

Club Manager Web is a SaaS platform that enables clubs, classes, and organizations to manage members and collect recurring subscription payments. The platform uses Stripe Connect to facilitate payments and generates revenue through a 2% platform fee on all transactions.

---

## Table of Contents

1. [Business Model](#business-model)
2. [Payment Flow](#payment-flow)
3. [Revenue Streams](#revenue-streams)
4. [Club Admin Journey](#club-admin-journey)
5. [Member/Parent Journey](#memberparent-journey)
6. [Technical Implementation](#technical-implementation)
7. [Revenue Examples](#revenue-examples)

---

## Business Model

### Platform Fee Structure

The platform operates on a **10% application fee model** using Stripe Connect:

| Party | Percentage | Description |
|-------|------------|-------------|
| Club | 90% | Receives the majority of the payment |
| Platform Owner | 10% | Automatic platform fee |
| Stripe | ~1.4% + £0.20 | Standard Stripe processing fees (paid by club) |

### How It Works

```
Member Payment (£100)
        │
        ▼
┌───────────────────┐
│   Stripe Checkout │
└─────────┬─────────┘
          │
          ▼
┌───────────────────────────────────────┐
│         Stripe Connect Split          │
│                                       │
│  ┌─────────────┐  ┌────────────────┐  │
│  │ Club: £90   │  │ Platform: £10  │  │
│  │ (90%)       │  │ (10% fee)      │  │
│  └─────────────┘  └────────────────┘  │
└───────────────────────────────────────┘
```

---

## Payment Flow

### Complete Payment Journey

```
1. CLUB ADMIN SETUP
   ├── Sign up & create club account
   ├── Connect Stripe account (Stripe Connect)
   ├── Create membership plans (e.g., £30/month)
   └── Add members with parent email

2. MEMBER REGISTRATION
   ├── Admin adds member details
   ├── Admin clicks "Invite Parent"
   ├── Parent receives email invitation
   └── Parent registers account in portal

3. PAYMENT COLLECTION
   ├── Admin clicks "Send Payment Link" for member
   ├── System creates Stripe Checkout session
   ├── Parent receives email with payment link
   ├── Parent completes payment via Stripe
   └── Subscription created (recurring billing)

4. REVENUE DISTRIBUTION
   ├── Payment processed by Stripe
   ├── 2% sent to platform owner (you)
   ├── 98% sent to club's Stripe account
   └── Recurring payments auto-collected
```

---

## Revenue Streams

### Primary Revenue: 10% Transaction Fee

This is your main revenue source. Every payment through the platform generates income:

```typescript
// Implementation in /api/stripe/send-payment-link/route.ts
sessionParams.subscription_data = {
  application_fee_percent: 10,  // Your 10% platform fee
};
```

### Revenue Collection Points

| Event | Platform Revenue |
|-------|------------------|
| Initial subscription payment | 10% of amount |
| Monthly recurring payment | 10% of amount |
| Annual recurring payment | 10% of amount |
| Plan upgrade payment | 10% of difference |

### Future Revenue Options

Consider implementing:

1. **Tiered Pricing** - Higher volume clubs could get lower fee percentage
2. **Premium Features** - Advanced analytics, custom branding
3. **White-Label Solution** - Clubs pay for their own branded version
4. **API Access** - Developers pay for API integration

---

## Club Admin Journey

### Step 1: Registration & Club Setup

1. Admin visits `/sign-up`
2. Creates account via Clerk authentication
3. Club record auto-created and linked to admin
4. Admin customizes club details (name, logo, description)

### Step 2: Connect Stripe Account

1. Navigate to **Settings > Stripe Connect**
2. Click "Connect Stripe Account"
3. Complete Stripe's onboarding:
   - Business information
   - Bank account details
   - Identity verification
4. Once verified, `stripeChargesEnabled = true`

**Important:** Clubs without connected Stripe accounts cannot receive payments!

### Step 3: Create Membership Plans

1. Navigate to **Settings > Membership Plans**
2. Create plans with:
   - Name (e.g., "Junior Football - U10")
   - Amount (e.g., £30)
   - Interval (Monthly/Weekly/Yearly)
3. Plans can be assigned to members

### Step 4: Add Members

1. Navigate to **Members** page
2. Add members individually or bulk import CSV
3. Required information:
   - Member: First name, Last name
   - Parent/Guardian: Name, Email, Phone
   - Assign membership plan

### Step 5: Invite Parents

1. Select members on the Members page
2. Click "Invite Parents"
3. System sends email invitations with registration link
4. Parents register and link to their children

### Step 6: Collect Payments

1. Navigate to **Payments** page
2. For each unpaid member, click "Send Link"
3. Parent receives payment email
4. Payment completes via Stripe Checkout
5. Subscription status updates automatically

---

## Member/Parent Journey

### Step 1: Receive Invitation

Parents receive an email containing:
- Club name
- Children's names
- Registration link: `/portal/{clubSlug}/register?email={parentEmail}`

### Step 2: Register Account

1. Click registration link
2. Complete registration form:
   - Name
   - Email (pre-filled)
   - Phone (optional)
   - Password
3. Account automatically linked to children

### Step 3: Access Portal

1. Sign in at `/portal/{clubSlug}`
2. View dashboard with:
   - Children's membership status
   - Payment history
   - Upcoming payments

### Step 4: Complete Payment

1. Receive payment link email from admin
2. Click "Pay Now" button
3. Complete Stripe Checkout:
   - Enter card details
   - Confirm subscription
4. Receive payment confirmation
5. Subscription begins (auto-recurring)

---

## Technical Implementation

### Key API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/stripe/connect` | POST | Create Stripe Connect account |
| `/api/stripe/connect` | GET | Get Connect onboarding link |
| `/api/stripe/send-payment-link` | POST | Send payment email to parent |
| `/api/stripe/create-checkout` | POST | Create Stripe Checkout session |
| `/api/webhooks/stripe` | POST | Handle Stripe webhook events |
| `/api/parent/invite` | POST | Send parent invitation emails |
| `/api/parent/register` | POST | Register parent account |

### Webhook Events Handled

| Stripe Event | Action |
|--------------|--------|
| `checkout.session.completed` | Create subscription record |
| `customer.subscription.updated` | Update subscription status |
| `customer.subscription.deleted` | Mark subscription canceled |
| `invoice.payment_failed` | Mark as past_due |
| `invoice.paid` | Update invoice record |

### Database Models

```prisma
model Subscription {
  id                 String   @id @default(cuid())
  stripeSubId        String   @unique
  stripeCustomerId   String
  status             String   // active, past_due, canceled
  amount             Int      // in pence
  currency           String   @default("gbp")
  interval           String   // month, year, week
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  memberId           String
  clubId             String
  member             Member   @relation(...)
  club               Club     @relation(...)
}
```

### Environment Variables Required

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourapp.com

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Email (Resend)
RESEND_API_KEY=re_...
```

---

## Revenue Examples

### Scenario 1: Small Sports Club

- **50 members** paying **£30/month**
- Monthly transaction volume: £1,500
- **Your 10% fee: £150/month** (£1,800/year)

### Scenario 2: Medium Dance Academy

- **200 members** paying **£45/month**
- Monthly transaction volume: £9,000
- **Your 10% fee: £900/month** (£10,800/year)

### Scenario 3: Platform Scale

| Clubs | Members/Club | Avg. Monthly Fee | Your Monthly Revenue |
|-------|--------------|------------------|---------------------|
| 10 | 50 | £30 | £1,500 |
| 50 | 50 | £30 | £7,500 |
| 100 | 75 | £35 | £26,250 |
| 500 | 100 | £40 | £200,000 |

### Annual Revenue Projections

```
Year 1 (10 clubs):    £18,000/year
Year 2 (50 clubs):    £90,000/year
Year 3 (100 clubs):   £315,000/year
Year 4 (500 clubs):   £2,400,000/year
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/stripe.ts` | Stripe client initialization |
| `src/app/api/stripe/send-payment-link/route.ts` | Payment link generation with 2% fee |
| `src/app/api/stripe/connect/route.ts` | Stripe Connect management |
| `src/app/api/webhooks/stripe/route.ts` | Webhook event processing |
| `src/lib/email.ts` | Email templates and sending |
| `prisma/schema.prisma` | Database schema |

---

## Monitoring Your Revenue

### Stripe Dashboard

Access your platform revenue in the Stripe Dashboard:

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Navigate to **Connect > Collected Fees**
3. View all application fees collected from connected accounts

### Key Metrics to Track

- Total transaction volume
- Application fees collected
- Number of connected accounts
- Active subscriptions across all clubs
- Failed payment rate

---

## Summary

Your Club Manager platform generates revenue through:

1. **10% automatic fee** on all subscription payments
2. **Recurring revenue** from monthly/yearly subscriptions
3. **Scalable model** - more clubs = more revenue
4. **Zero fulfillment costs** - Stripe handles all payment processing

The more clubs you onboard and the more members they have, the more you earn!

---

## Support & Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe Application Fees](https://stripe.com/docs/connect/direct-charges#collect-fees)
- [Webhook Events Reference](https://stripe.com/docs/api/events/types)
