# YojanaSetu - Production-Grade Government Information Portal

A comprehensive platform to track government schemes, tenders, and recruitments across India with automated data crawling and admin moderation.

## 🚀 Features

- **Automated Data Pipeline**: Crawlers for .gov websites with state-based data collection
- **Admin Dashboard**: Secure moderation system with approval workflow
- **Public API**: Clean REST API serving only approved data
- **Real-time Updates**: Scheduled crawlers running every 12 hours
- **PostgreSQL Database**: Production-grade database with Supabase
- **JWT Authentication**: Secure admin authentication
- **Audit Logging**: Complete trail of all admin actions

## 📋 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT, bcrypt
- **Crawlers**: axios, cheerio, node-cron
- **Logging**: Winston
- **Frontend**: Vanilla HTML/CSS/JS

## 🛠️ Installation

### Prerequisites

- Node.js (v16+)
- PostgreSQL database (Supabase account)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd YojanaSetu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your database credentials:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.kjgdjydzjknyrwsvpgvy.supabase.co:5432/postgres
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Run database migration**
   ```bash
   npm run migrate
   ```
   
   This creates all tables and a default admin account:
   - Email: `admin@yojanasetu.gov.in`
   - Password: `admin123`
   
   ⚠️ **Change this password immediately after first login!**

5. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## 🎯 Usage

### Public Portal
- Visit: `http://localhost:3000`
- Browse approved schemes, tenders, and recruitments
- Filter by state, search, and sort

### Admin Dashboard
- Visit: `http://localhost:3000/admin`
- Login with admin credentials
- Review pending crawled data
- Approve/reject entries
- Trigger manual crawls
- View audit logs

### API Endpoints

**Public API** (`/api`)
- `GET /api/schemes` - Get all approved schemes
- `GET /api/tenders` - Get all approved tenders
- `GET /api/recruitments` - Get all approved recruitments
- `GET /api/stats` - Get statistics

**Admin API** (`/api/admin`) - Requires JWT token
- `POST /api/admin/login` - Admin login
- `GET /api/admin/pending` - Get pending reviews
- `POST /api/admin/pending/:id/approve` - Approve item
- `POST /api/admin/pending/:id/reject` - Reject item
- `POST /api/admin/crawler/trigger` - Trigger crawler
- `GET /api/admin/logs` - Get audit logs

## 🤖 Crawler System

### How It Works

1. **Scheduled Execution**: Crawlers run automatically every 12 hours
2. **State-Based**: Each crawler iterates through all Indian states
3. **Data Normalization**: Raw HTML/JSON is parsed and standardized
4. **Staging**: Data is stored in `crawl_results` table (pending status)
5. **Admin Review**: Admins review, edit, and approve/reject
6. **Publication**: Approved data moves to public tables

### Manual Trigger

From admin dashboard:
1. Go to "Crawlers" tab
2. Click "Run" next to desired source
3. Monitor progress in "Recent Crawl Jobs"

### Adding New Sources

```sql
INSERT INTO sources (name, url, type, is_active)
VALUES ('Source Name', 'https://example.gov.in/', 'scheme', true);
```

## 📁 Project Structure

```
YojanaSetu/
├── migrations/          # Database migrations
├── scripts/             # Helper scripts
├── src/
│   ├── admin/           # Admin dashboard UI
│   ├── config/          # Configuration files
│   ├── controllers/     # API controllers
│   │   ├── admin/       # Admin controllers
│   │   └── public/      # Public controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── public/          # Public frontend
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   │   └── crawlers/    # Crawler implementations
│   └── server.js        # Entry point
├── logs/                # Application logs
├── .env                 # Environment variables
└── package.json
```

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt (10 rounds)
- Rate limiting on public API (100 req/15min)
- Stricter rate limiting on login (5 attempts/15min)
- SQL injection prevention (parameterized queries)
- CORS enabled
- Audit logging for all admin actions

## 🚀 Deployment

### Render / Railway / Heroku

1. Connect your GitHub repository
2. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
3. Build command: `npm install`
4. Start command: `npm start`
5. Run migration: `npm run migrate` (one-time)

### Manual Server

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name yojanasetu

# View logs
pm2 logs yojanasetu

# Restart
pm2 restart yojanasetu
```

## 📊 Database Schema

- **schemes** - Approved government schemes
- **tenders** - Approved tenders
- **recruitments** - Approved recruitments
- **sources** - Crawler source configurations
- **crawl_jobs** - Crawler execution history
- **crawl_results** - Pending scraped data
- **admins** - Admin users
- **audit_logs** - Admin action history

## 🛠️ Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run migrate    # Run database migration
npm run create-admin  # Create new admin user
```

## 📝 License

MIT

## 👥 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for transparent governance**
