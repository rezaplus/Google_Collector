# Google Collector

A powerful web scraping and data collection tool for gathering information from Google search results. Built with React frontend and Node.js/Express backend, containerized with Docker for easy deployment.

## Features

- 🔍 Google Search Integration with customizable parameters
- 🌍 Multi-country and multi-language support
- 📧 Automatic email and phone number extraction
- 🎯 CMS detection (WordPress, Joomla, Drupal, etc.)
- 📊 Data export to Excel and JSON formats
- 🚫 Domain ignore list management
- 🔐 Secure authentication system
- 🐳 Fully containerized with Docker

## Quick Start

### Prerequisites

- Docker
- Docker Compose

### Installation & Deployment

```bash
# Clone the repository
git clone <repository-url>
cd Google_Collector

# Start all services
docker-compose up -d
```

That's it! The application will be available at:
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:3001

### Default Credentials

- **Username**: admin
- **Password**: Hello123!

⚠️ **Important**: Change these credentials before deploying to production!

## Dynamic Configuration

This project is designed to work on any server without requiring domain configuration. All networking and CORS settings are handled dynamically:

- ✅ Backend automatically accepts requests based on CORS configuration
- ✅ Frontend automatically detects backend URL based on browser location
- ✅ MongoDB connections use Docker service names
- ✅ No hardcoded IPs or domains

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Architecture

```
┌─────────────────┐
│  Browser (You)  │
└────────┬────────┘
         │ http://server:3002
         ↓
┌─────────────────┐
│   Frontend      │ (React App - Port 3002)
│   Container     │
└────────┬────────┘
         │ Detects: http://server:3001
         ↓
┌─────────────────┐
│   Backend       │ (Express API - Port 3001)
│   Container     │
└────────┬────────┘
         │ mongodb://mongodb:27017
         ↓
┌─────────────────┐
│   MongoDB       │ (Database - Port 27017)
│   Container     │
└─────────────────┘
```

## Project Structure

```
Google_Collector/
├── backend/
│   ├── src/
│   │   ├── main.js          # Express server & API routes
│   │   ├── database.js      # MongoDB connection & models
│   │   ├── scraper.js       # Web scraping logic
│   │   └── searchGoogle.js  # Google search integration
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── config.js        # Dynamic API configuration
│   │   └── App.js           # Main React app
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── docker-compose.yml       # Container orchestration
└── DEPLOYMENT.md           # Detailed deployment guide
```

## Configuration

### Backend Environment Variables

Create `backend/.env` from `backend/.env.example`:

```bash
BEARER_TOKEN="Bearer YourSecureTokenHere"
CORS_ORIGIN=*  # Or set to specific origin in production
```

### Frontend Environment Variables

Set in `docker-compose.yml` or create `frontend/.env`:

```bash
REACT_APP_BEARER_TOKEN="Bearer YourSecureTokenHere"
REACT_APP_BACKEND_PORT=3001
REACT_APP_USERNAME="admin"
REACT_APP_PASSWORD="YourSecurePassword"
```

## Usage

### 1. Search & Collect Data

1. Log in with your credentials
2. Enter search query
3. Select country and language
4. Set result limit
5. Click "Search"
6. Collect data from individual results or all at once

### 2. View Collections

- Access collected data from the Collections page
- Filter by emails, phone numbers, or search text
- Export to Excel or JSON format

### 3. Manage Ignore List

- Add domains to skip during collection
- Remove domains from the ignore list

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/search` | Search Google with parameters |
| POST | `/scrape` | Scrape website information |
| GET | `/collected-data` | Retrieve all collected data |
| PUT | `/ignore` | Add domain to ignore list |
| GET | `/ignore` | Get ignore list |
| DELETE | `/ignore` | Remove domain from ignore list |

All endpoints require Bearer token authentication.

## Development

### Run Locally (without Docker)

**Backend:**
```bash
cd backend
npm install
node src/main.js
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

**MongoDB:**
```bash
docker run -d -p 27017:27017 mongo:latest
```

### Hot Reload

The docker-compose setup includes volume mounts for hot reloading during development.

## Security Recommendations

For production deployment:

1. **Change all default credentials**
2. **Set specific CORS_ORIGIN** instead of '*'
3. **Use environment-specific .env files**
4. **Enable HTTPS** with reverse proxy (Nginx/Traefik)
5. **Secure MongoDB** with authentication
6. **Use firewall rules** to restrict port access
7. **Keep Docker images updated**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed security setup.

## Troubleshooting

### Frontend can't connect to Backend

```bash
# Check backend health
curl http://localhost:3001/collected-data

# View logs
docker-compose logs backend
docker-compose logs frontend
```

### Database Connection Issues

```bash
# Test MongoDB connectivity
docker exec -it backend ping mongodb

# Check MongoDB logs
docker-compose logs mongodb
```

### Rebuild Everything

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Tech Stack

- **Frontend**: React, Bootstrap, Axios
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- **Scraping**: Puppeteer, Cheerio
- **Search**: Google-it (custom fork)
- **Containerization**: Docker, Docker Compose

## License

[Your License Here]

## Contributing

[Your Contributing Guidelines Here]

## Support

For issues and questions:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review container logs: `docker-compose logs`
- Open an issue on GitHub

## Deployment on Any Server

This project is designed to work on any server with Docker:

```bash
# On your server
git clone <your-repo>
cd Google_Collector
docker-compose up -d
```

Access via: `http://your-server-ip:3002`

No configuration needed! 🚀
