# Google Collector - Dynamic Deployment Guide

This project is designed to be deployed with a single `docker-compose up` command on any server without requiring domain name configuration. All networking, CORS, and API connections are handled dynamically.

## Quick Start

### Deploy Anywhere with One Command

```bash
docker-compose up -d
```

That's it! The application will be available at:
- Frontend: `http://your-server-ip:3002`
- Backend API: `http://your-server-ip:3001`

## How It Works

### Dynamic Configuration

The project uses several techniques to work without hardcoded domains:

1. **Backend CORS**: Configured to accept requests from any origin (can be restricted via `CORS_ORIGIN` env var)
2. **Frontend API Detection**: Automatically detects the backend URL based on the browser's location
3. **Docker Networking**: All services communicate via a dedicated Docker network

### Architecture

```
Browser (Host Machine)
    ↓ http://server-ip:3002
Frontend Container (Port 3002)
    ↓ http://server-ip:3001 (detected dynamically)
Backend Container (Port 3001)
    ↓ mongodb://mongodb:27017 (Docker network)
MongoDB Container (Port 27017)
```

## Configuration

### Environment Variables

#### Backend (.env)
```bash
BEARER_TOKEN="Bearer AIzaSyD8Z0jJ9Q9Q6Z2MaSKLNSD2jkmsasdnk"
CORS_ORIGIN=*  # Or set to specific origin like http://example.com:3002
```

#### Frontend (Built into docker-compose.yml)
```yaml
REACT_APP_BACKEND_PORT=3001  # Port where backend runs
REACT_APP_BEARER_TOKEN="Bearer AIzaSyD8Z0jJ9Q9Q6Z2MaSKLNSD2jkmsasdnk"
REACT_APP_USERNAME="admin"
REACT_APP_PASSWORD="Hello123!"
```

### Custom Domain Setup (Optional)

If you want to use a custom domain with reverse proxy:

1. **With Nginx**:
```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

2. **Update CORS_ORIGIN** in `backend/.env`:
```bash
CORS_ORIGIN=http://example.com
```

## Deployment Options

### Development (Local)

```bash
docker-compose up
```
Access at: http://localhost:3002

### Production (Remote Server)

```bash
# Clone the repository
git clone <your-repo-url>
cd Google_Collector

# Start services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access at: http://your-server-ip:3002

### Behind Reverse Proxy

If using a reverse proxy (Nginx, Apache, Traefik):

1. Configure your reverse proxy to forward:
   - Frontend: `/` → `http://localhost:3002`
   - Backend: `/api` → `http://localhost:3001`

2. Update `backend/.env`:
   ```bash
   CORS_ORIGIN=https://yourdomain.com
   ```

3. Optionally set `REACT_APP_API_URL` in frontend to use the proxy path:
   ```yaml
   # In docker-compose.yml, frontend environment:
   - REACT_APP_API_URL=https://yourdomain.com/api
   ```

## Security Considerations

### For Production Deployment:

1. **Change Default Credentials**:
   ```yaml
   # In docker-compose.yml
   - REACT_APP_USERNAME=your_username
   - REACT_APP_PASSWORD=your_secure_password
   - REACT_APP_BEARER_TOKEN=Bearer your_secure_token
   ```

2. **Restrict CORS**:
   ```bash
   # In backend/.env
   CORS_ORIGIN=https://yourdomain.com
   ```

3. **Use HTTPS**: Set up SSL/TLS with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

4. **Firewall Configuration**:
   ```bash
   # Allow only necessary ports
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

5. **MongoDB Security** (Optional - for external access):
   ```yaml
   # In docker-compose.yml, add to mongodb service:
   environment:
     - MONGO_INITDB_ROOT_USERNAME=admin
     - MONGO_INITDB_ROOT_PASSWORD=secure_password
   ```

## Ports

- **3001**: Backend API
- **3002**: Frontend Web UI
- **27017**: MongoDB (exposed for debugging, can be removed in production)

## Troubleshooting

### Frontend can't connect to Backend

1. Check if backend is running:
   ```bash
   curl http://localhost:3001/collected-data
   ```

2. Check Docker logs:
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```

3. Verify CORS configuration in backend logs

### MongoDB Connection Issues

```bash
# Check if MongoDB is accessible from backend
docker exec -it backend ping mongodb
```

### Rebuild Containers

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

## Data Persistence

MongoDB data is stored in a Docker volume named `mongodb`. To backup:

```bash
# Backup
docker exec mongodb mongodump --out=/backup
docker cp mongodb:/backup ./mongodb-backup

# Restore
docker cp ./mongodb-backup mongodb:/backup
docker exec mongodb mongorestore /backup
```

## Support

For issues or questions, please check:
- Application logs: `docker-compose logs`
- Browser console for frontend errors
- Network tab in browser DevTools for API call issues
