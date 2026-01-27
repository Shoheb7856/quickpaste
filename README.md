# QuickPaste - Pastebin Clone

A fast, modern Pastebin-like web application built with Next.js where users can quickly store and share text content with shareable links. Content can optionally expire based on time or number of views.

## 🚀 Live Demo

[Your Vercel URL here]

## ✨ Features

- **📝 Create Pastes** - Store any text content instantly
- **🔗 Shareable Links** - Get a unique URL for each paste
- **⏰ Time-Based Expiration** - Set pastes to expire after 10 minutes, 1 hour, 1 day, 1 week, or 1 month
- **👁️ View-Based Expiration** - "Burn after reading" - self-destruct after X views
- **📄 Syntax Highlighting** - Support for multiple programming languages
- **🎨 Modern UI** - Beautiful dark theme with glassmorphism effects
- **📱 Responsive** - Works on all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Styling**: Vanilla CSS with modern design
- **Deployment**: Vercel

## 📋 API Endpoints

### Create a Paste
```bash
POST /api/pastes
Content-Type: application/json

{
  "content": "Your text content here",
  "title": "Optional title",
  "syntax": "javascript",
  "expiresIn": 60,        # Optional: minutes until expiration (null for never)
  "maxViews": 5           # Optional: max views before deletion (null for unlimited)
}
```

**Response:**
```json
{
  "success": true,
  "paste": {
    "id": "clxxx...",
    "slug": "abc123xy",
    "title": "Optional title",
    "syntax": "javascript",
    "expiresAt": "2024-01-27T22:00:00.000Z",
    "maxViews": 5,
    "createdAt": "2024-01-27T21:00:00.000Z",
    "shareableUrl": "https://your-app.vercel.app/abc123xy"
  }
}
```

### Get a Paste
```bash
GET /api/pastes/{slug}
```

**Response:**
```json
{
  "success": true,
  "paste": {
    "id": "clxxx...",
    "slug": "abc123xy",
    "title": "Optional title",
    "content": "Your text content here",
    "syntax": "javascript",
    "viewCount": 3,
    "maxViews": 5,
    "expiresAt": "2024-01-27T22:00:00.000Z",
    "createdAt": "2024-01-27T21:00:00.000Z",
    "willExpireAfterView": false
  }
}
```

### Delete a Paste
```bash
DELETE /api/pastes/{slug}
```

## 🚀 Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or Neon account)

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd assignment
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your database connection string:
```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment to Vercel

### Step 1: Set up Neon Database

1. Go to [Neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (it looks like `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`)

### Step 2: Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `NEXT_PUBLIC_BASE_URL`: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
4. Deploy!

### Step 3: Run Database Migration

After deployment, run the following command to create the database tables:
```bash
npx prisma db push
```

Or via Vercel CLI:
```bash
vercel env pull .env.local
npx prisma db push
```

## 📁 Project Structure

```
assignment/
├── app/
│   ├── api/
│   │   └── pastes/
│   │       ├── route.js          # POST /api/pastes, GET /api/pastes
│   │       └── [slug]/
│   │           └── route.js      # GET/DELETE /api/pastes/{slug}
│   ├── [slug]/
│   │   └── page.js               # View paste page
│   ├── globals.css               # Global styles
│   ├── layout.js                 # Root layout
│   └── page.js                   # Home page (create paste)
├── lib/
│   ├── prisma.js                 # Prisma client singleton
│   └── utils.js                  # Utility functions
├── prisma/
│   └── schema.prisma             # Database schema
├── .env.example                  # Environment variables template
└── README.md
```

## 🔧 Expiration Options

### Time-Based
| Option | Duration |
|--------|----------|
| Never | No expiration |
| 10 Minutes | 600 seconds |
| 1 Hour | 3,600 seconds |
| 1 Day | 86,400 seconds |
| 1 Week | 604,800 seconds |
| 1 Month | 2,592,000 seconds |

### View-Based
| Option | Views |
|--------|-------|
| Unlimited | No limit |
| Burn After Reading | 1 view |
| 5 Views | 5 views |
| 10 Views | 10 views |
| 50 Views | 50 views |
| 100 Views | 100 views |

## 🎯 Design Decisions

1. **Next.js App Router**: Chosen for its modern architecture, server components, and excellent Vercel integration.

2. **Prisma ORM**: Type-safe database access with easy migrations and excellent PostgreSQL support.

3. **Neon PostgreSQL**: Serverless PostgreSQL that scales to zero, perfect for a free-tier deployment.

4. **Nanoid for Slugs**: Generates URL-safe, unique 8-character slugs that are easy to share.

5. **CSS-only Design**: No external CSS frameworks for maximum control and minimal bundle size.

6. **View Counting on Read**: Views are incremented atomically when fetching a paste, ensuring accurate counts.

7. **Lazy Deletion**: Expired pastes are deleted when accessed, not via background jobs, keeping the architecture simple.

## 📄 License

MIT License

---

Built with ❤️ for the take-home assignment
