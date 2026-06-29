# Inkwell — Full-Stack Blogging Platform

A production-ready, full-stack blogging platform inspired by Medium, LinkedIn, and Instagram.

Built with **React + Vite + Tailwind CSS** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## Features

- **Authentication** — Email/password + Google OAuth 2.0, JWT-based, account linking
- **Social Feed** — Personalized feed from followed authors + trending content
- **Rich Blog Editor** — Tiptap-powered editor with formatting, images, code blocks, tables
- **Blog CRUD** — Create, edit, delete, draft/publish, preview
- **Comments** — Nested replies, edit/delete, real-time counts
- **Likes & Bookmarks** — Toggle like/bookmark, bookmark dashboard
- **Follow System** — Follow/unfollow users, followers/following lists
- **Notifications** — Real-time updates for likes, comments, follows, new posts
- **Explore Page** — Filter by category, sort by latest/trending/popular
- **Global Search** — Search blogs, users, categories with autocomplete
- **User Profiles** — Cover banner, bio, skills, social links, stats
- **Author Dashboard** — Stats, charts, blog management
- **Admin Panel** — User/blog management, block users, feature posts, site stats
- **Dark Mode** — System-aware with toggle
- **Responsive Design** — Mobile-first, works on all screen sizes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, TipTap |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT, bcryptjs, Google OAuth 2.0 |
| Image Storage | Cloudinary |
| Charts | Recharts |
| Icons | Lucide React |

---

## Project Structure

```
blogging-website/
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, Footer, BlogEditor, UI components
│   │   ├── context/          # AuthContext, ThemeContext
│   │   ├── hooks/            # Custom hooks
│   │   ├── layouts/          # MainLayout, AuthLayout
│   │   ├── pages/            # All page components
│   │   ├── services/         # API service layer
│   │   └── utils/            # Helpers
│   └── package.json
│
├── backend/
│   ├── controllers/          # Business logic
│   ├── models/               # Mongoose models
│   ├── routes/               # Express routes
│   ├── middleware/           # Auth, error handling
│   ├── config/               # DB, Cloudinary
│   ├── utils/                # Token generation, notifications
│   └── server.js
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Google Cloud Console project (for OAuth)

### 1. Clone and install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure environment variables

**Backend** — copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/inkwell
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Frontend** — copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Run the application

**Development:**

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

App runs at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## API Documentation

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Google OAuth |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Blogs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blogs` | Get all published blogs |
| GET | `/api/blogs/feed` | Get personalized feed |
| GET | `/api/blogs/trending` | Get trending blogs |
| GET | `/api/blogs/featured` | Get featured blogs |
| GET | `/api/blogs/:slug` | Get single blog |
| POST | `/api/blogs` | Create blog |
| PUT | `/api/blogs/:id` | Update blog |
| DELETE | `/api/blogs/:id` | Delete blog |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:username` | Get user profile |
| GET | `/api/users/:username/blogs` | Get user's blogs |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/profile/picture` | Upload profile picture |
| PUT | `/api/users/profile/cover` | Upload cover image |

### Social
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/likes/:blogId` | Toggle like |
| POST | `/api/bookmarks/:blogId` | Toggle bookmark |
| GET | `/api/bookmarks` | Get user bookmarks |
| POST | `/api/follow/:userId` | Toggle follow |
| POST | `/api/comments/blog/:blogId` | Add comment |

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

Set environment variable in Vercel dashboard:
- `VITE_GOOGLE_CLIENT_ID`

### Backend → Render

1. Connect your GitHub repo to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add all environment variables from `.env`

### Database → MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user
3. Whitelist IP addresses (0.0.0.0/0 for all)
4. Copy the connection string to `MONGO_URI`

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable **Google+ API** and **Google Identity API**
4. Create OAuth 2.0 credentials
5. Add authorized origins: `http://localhost:5173`, `https://yourdomain.com`
6. Add your Client ID to both `.env` files

---

## Future Enhancements

- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Real-time notifications (WebSockets)
- [ ] Blog reading history
- [ ] AI blog summarizer
- [ ] SEO optimization (sitemap, meta tags)
- [ ] PWA support
- [ ] Newsletter subscription

---

## License

MIT — free to use for portfolio and commercial projects.
