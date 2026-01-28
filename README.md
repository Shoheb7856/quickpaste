# QuickPaste - Pastebin-Lite

A small Pastebin-like application where users can create text pastes and share a link to view them. Pastes can optionally expire based on time (TTL) or view count limits.

## 🚀 Live Demo

**Deployed URL:** https://quickpaste-mauve.vercel.app

**Git Repository:** https://github.com/Shoheb7856/quickpaste

## 📋 Features

- **Create Pastes**: Store any text content instantly
- **Shareable Links**: Get a unique URL for each paste (`/p/:id`)
- **Time-Based Expiry (TTL)**: Pastes auto-expire after a set duration
- **View-Count Limits**: Pastes self-destruct after N views
- **Combined Constraints**: If both TTL and view limit are set, paste expires when either triggers first

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon - Serverless)
- **ORM**: Prisma
- **Deployment**: Vercel

## 💾 Persistence Layer

**PostgreSQL via [Neon](https://neon.tech)** - A serverless PostgreSQL database that:
- Persists data across serverless function invocations
- Scales to zero when not in use (cost-effective)
- Provides instant branching for development
- Offers a generous free tier suitable for this application

This choice ensures data survives across requests in Vercel's serverless environment, unlike in-memory storage which would be reset between function invocations.

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── healthz/route.js     # GET /api/healthz - Health check
│   │   └── pastes/
│   │       ├── route.js         # POST /api/pastes - Create paste
│   │       └── [id]/route.js    # GET /api/pastes/:id - Fetch paste
│   ├── p/[id]/page.js           # GET /p/:id - View paste (HTML)
│   ├── page.js                  # Home page (Create paste UI)
│   └── layout.js                # Root layout
├── lib/
│   ├── prisma.js                # Prisma client singleton
│   └── utils.js                 # Utility functions (ID generation, time handling)
├── prisma/
│   └── schema.prisma            # Database schema
└── README.md
```

## 🔧 Running Locally

### Prerequisites
- Node.js 18+
- npm

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Shoheb7856/quickpaste.git
cd quickpaste
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file:
```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

Get a free PostgreSQL database from [Neon](https://neon.tech).

4. **Push database schema**
```bash
npx prisma db push
```

5. **Start the development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

### Health Check
```
GET /api/healthz
```
Returns `{ "ok": true }` with HTTP 200 if the application and database are healthy.

### Create Paste
```
POST /api/pastes
Content-Type: application/json

{
  "content": "Hello World",    // Required, non-empty string
  "ttl_seconds": 60,           // Optional, integer >= 1
  "max_views": 5               // Optional, integer >= 1
}
```

Response (201):
```json
{
  "id": "abc123xy",
  "url": "https://quickpaste-mauve.vercel.app/p/abc123xy"
}
```

### Fetch Paste (API)
```
GET /api/pastes/:id
```

Response (200):
```json
{
  "content": "Hello World",
  "remaining_views": 4,        // null if unlimited
  "expires_at": "2026-01-28T12:00:00.000Z"  // null if no TTL
}
```

Each API fetch counts as a view. Returns 404 if paste is missing, expired, or view limit exceeded.

### View Paste (HTML)
```
GET /p/:id
```
Returns HTML page displaying the paste content. Returns HTTP 404 if unavailable.

## 🧪 Testing Features

### Deterministic Time Testing
When `TEST_MODE=1` environment variable is set:
- The `x-test-now-ms` request header is treated as the current time for expiry logic
- Allows automated tests to verify TTL behavior

### Validation
- `content` is required and must be a non-empty string
- `ttl_seconds` must be an integer >= 1 if provided
- `max_views` must be an integer >= 1 if provided
- Invalid inputs return 400 with JSON error body

## 🎯 Design Decisions

1. **Neon PostgreSQL**: Chose Neon for persistence because it's serverless-friendly, has a generous free tier, and works seamlessly with Vercel's serverless functions.

2. **View Count Before Check**: Views are incremented atomically to prevent race conditions under concurrent load. The check happens before increment to ensure accurate remaining count.

3. **Nanoid for IDs**: Using nanoid with a custom alphabet (no confusing characters like 0/O, 1/l) for URL-safe, human-readable paste IDs.

4. **HTML Escaping**: Content is escaped using a custom function to prevent XSS attacks when rendering pastes.

5. **404 for All Unavailable States**: Whether a paste is missing, expired by time, or exceeded view limit - all return HTTP 404 with consistent JSON error body.

6. **Combined Constraint Logic**: When both TTL and max_views are set, the paste becomes unavailable as soon as either constraint triggers.

## 📝 License

MIT
