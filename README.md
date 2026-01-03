# Club Manager

A comprehensive web application for managing clubs, members, classes, attendance, payments, and communications. Built with Next.js 15, TypeScript, Prisma, and Tailwind CSS.

**Designed for all types of organizations** - dance studios, churches, sports clubs, hobby groups, and more. Uses neutral "Contact" terminology that works for both youth organizations (where contacts are parents/guardians) and adult organizations (where contacts are the members themselves).

## Features

### For Club Administrators
- **Dashboard** - Overview of club statistics, recent activity, and quick actions
- **Member Management** - Add, edit, and manage club members with detailed profiles
- **Class Management** - Create and organize classes with schedules
- **Attendance Tracking** - Record and monitor member attendance
- **Payment Processing** - Stripe integration for subscription billing
- **Messaging** - Send broadcast emails to members and contacts
- **Reports** - View attendance and payment reports
- **Schedule** - Calendar view of upcoming sessions

### For Members (Portal)
- **Member Portal** - Dedicated login for members/contacts to manage memberships
- **View Members** - See linked members and their class assignments
- **Subscription Status** - View payment status and upcoming renewals
- **Attendance History** - Track recent attendance records

### Security Features
- **Authentication** - Clerk-based authentication for admins
- **CSRF Protection** - Token-based protection for form submissions
- **Security Headers** - CSP, X-Frame-Options, HSTS, and more
- **Session Management** - Server-side session validation with token expiry
- **Email Verification** - Verification emails for member accounts
- **HTML Escaping** - XSS prevention in email content

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Payments**: Stripe Connect
- **Email**: Resend
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account
- Stripe account
- Resend account (for emails)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/club_manager"
DIRECT_URL="postgresql://user:password@localhost:5432/club_manager"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
CLERK_WEBHOOK_SECRET="whsec_..."

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="Club Manager <noreply@yourdomain.com>"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_EMAILS="admin@example.com"

# Security (optional - auto-generated if not set)
CSRF_SECRET="your-32-byte-secret"
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/club-manager-web.git
cd club-manager-web
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (admin)/           # Admin-only pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main dashboard pages
│   ├── (marketing)/       # Public marketing pages
│   ├── api/               # API routes
│   └── portal/            # Member portal pages
├── components/            # React components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions and configurations
│   ├── csrf.ts           # CSRF token utilities
│   ├── email.ts          # Email sending functions
│   ├── member-auth.ts    # Member portal authentication helpers
│   ├── prisma.ts         # Prisma client instance
│   └── utils.ts          # General utilities
└── test/                  # Test setup and utilities
```

## Navigation

### Admin Dashboard Routes
| Route | Description |
|-------|-------------|
| `/dashboard` | Main dashboard with overview |
| `/members` | Member list and management |
| `/members/[id]` | Individual member details |
| `/classes` | Class management |
| `/attendance` | Attendance tracking |
| `/payments` | Payment management |
| `/schedule` | Session calendar |
| `/messages` | Broadcast messaging |
| `/reports` | Analytics and reports |
| `/settings` | Club settings and Stripe setup |

### Admin Routes (Super Admin)
| Route | Description |
|-------|-------------|
| `/admin` | Admin dashboard |
| `/admin/clubs` | Manage all clubs |
| `/admin/users` | Manage users |
| `/admin/revenue` | Revenue analytics |
| `/admin/activity` | Activity logs |

### Member Portal Routes
| Route | Description |
|-------|-------------|
| `/portal/[slug]` | Club-specific login |
| `/portal/[slug]/register` | Member account registration |
| `/portal/[slug]/dashboard` | Member dashboard |

### Public Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/industries` | Industry-specific pages |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |

## API Endpoints

### Authentication
- `POST /api/webhooks/clerk` - Clerk webhook handler

### Members
- `GET /api/members` - List members
- `POST /api/members` - Create member
- `GET /api/members/[id]` - Get member details
- `PATCH /api/members/[id]` - Update member
- `DELETE /api/members/[id]` - Delete member

### Classes
- `GET /api/classes` - List classes
- `POST /api/classes` - Create class
- `PATCH /api/classes/[id]` - Update class
- `DELETE /api/classes/[id]` - Delete class

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Record attendance
- `POST /api/attendance/batch` - Batch record attendance

### Payments (Stripe)
- `POST /api/stripe/connect` - Create Stripe Connect account
- `POST /api/stripe/create-checkout` - Create checkout session
- `POST /api/stripe/send-payment-link` - Send payment link email
- `POST /api/webhooks/stripe` - Stripe webhook handler

### Member Portal (Account)
- `POST /api/account/auth` - Member login
- `DELETE /api/account/auth` - Member logout
- `POST /api/account/register` - Member registration
- `GET /api/account/profile` - Get member profile
- `PATCH /api/account/profile` - Update member profile
- `POST /api/account/invite` - Invite members to portal
- `GET /api/account/verify` - Verify email
- `POST /api/account/verify` - Resend verification

### Other
- `GET /api/csrf` - Get CSRF token
- `GET /api/club` - Get club details
- `PATCH /api/club` - Update club

## Database Schema

Key models in the database:

- **User** - Admin users (Clerk-authenticated)
- **Club** - Club organizations
- **Member** - Club members with contact information
  - `contactName` - Name of the contact person (member themselves for adults, parent/guardian for minors)
  - `contactEmail` - Email for communications and portal login
  - `contactPhone` - Phone number (optional)
- **MemberAccount** - Member portal accounts (for self-service access)
- **Class** - Classes/groups
- **Session** - Scheduled sessions
- **Attendance** - Attendance records
- **MembershipPlan** - Subscription plans
- **Subscription** - Active subscriptions
- **Invoice** - Payment invoices
- **Message** - Broadcast messages

## Security

### Implemented Security Measures

1. **Authentication**
   - Clerk for admin authentication
   - Custom session tokens for member portal
   - Session validation on each request

2. **CSRF Protection**
   - Token-based CSRF protection
   - 1-hour token expiry
   - Timing-safe token comparison

3. **Security Headers**
   - Content-Security-Policy
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Referrer-Policy
   - Permissions-Policy
   - Strict-Transport-Security (production)

4. **Input Validation**
   - HTML escaping in emails
   - SQL injection prevention (Prisma)
   - XSS prevention

5. **Error Handling**
   - Error boundaries for React components
   - Proper error responses without leaking details

## Testing

Run the test suite:

```bash
# Watch mode
npm run test

# Single run
npm run test:run

# With coverage
npm run test:coverage
```

Test files are located alongside their source files with `.test.ts` extension.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and proprietary.

## Support

For issues or questions, please open a GitHub issue.
