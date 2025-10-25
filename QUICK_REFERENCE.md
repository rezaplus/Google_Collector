# Google Collector - Quick Reference

## One-Line Deployment

```bash
docker-compose up -d
```

## Access Points

| Service | Local URL | Remote URL |
|---------|-----------|------------|
| Frontend | http://localhost:3002 | http://YOUR_SERVER_IP:3002 |
| Backend API | http://localhost:3001 | http://YOUR_SERVER_IP:3001 |
| MongoDB | localhost:27017 | YOUR_SERVER_IP:27017 |

## Default Credentials

```
Username: admin
Password: Hello123!
```

## Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Rebuild Everything
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Restart Single Service
```bash
docker-compose restart backend
docker-compose restart frontend
```

## Environment Variables

### Backend (.env)
```bash
BEARER_TOKEN="Bearer YOUR_TOKEN"
CORS_ORIGIN=*  # or specific domain
```

### Frontend (docker-compose.yml)
```yaml
- REACT_APP_BEARER_TOKEN=Bearer YOUR_TOKEN
- REACT_APP_BACKEND_PORT=3001
- REACT_APP_USERNAME=admin
- REACT_APP_PASSWORD=YOUR_PASSWORD
```

## How Dynamic Configuration Works

### Frontend API Detection
The frontend automatically detects the backend URL:
```javascript
// If REACT_APP_API_URL is set, use it
// Otherwise: http://[current-hostname]:3001
```

### Backend CORS
The backend accepts requests from any origin by default:
```javascript
// Configurable via CORS_ORIGIN environment variable
CORS_ORIGIN=* (default)
```

### Docker Networking
Services communicate via Docker network:
- Frontend → Backend: `http://server-ip:3001` (from browser)
- Backend → MongoDB: `mongodb://mongodb:27017` (internal)

## Troubleshooting

### Can't connect to frontend?
```bash
# Check if running
docker ps

# Check frontend logs
docker-compose logs frontend
```

### Can't connect to backend?
```bash
# Test from host
curl http://localhost:3001/collected-data

# Check backend logs
docker-compose logs backend
```

### Database errors?
```bash
# Check MongoDB status
docker-compose logs mongodb

# Test connection from backend
docker exec -it backend ping mongodb
```

### Need to reset everything?
```bash
# Remove everything including volumes
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

## Production Checklist

- [ ] Change default username/password
- [ ] Generate new Bearer token
- [ ] Set specific CORS_ORIGIN (not *)
- [ ] Enable HTTPS with reverse proxy
- [ ] Configure firewall rules
- [ ] Set up MongoDB authentication
- [ ] Regular backups of MongoDB volume
- [ ] Update Docker images regularly

## Backup MongoDB

```bash
# Create backup
docker exec mongodb mongodump --out=/backup
docker cp mongodb:/backup ./mongodb-backup-$(date +%Y%m%d)

# Restore backup
docker cp ./mongodb-backup mongodb:/backup
docker exec mongodb mongorestore /backup
```

## Custom Domain Setup

### Option 1: Update Environment Variables
```yaml
# In docker-compose.yml
- REACT_APP_API_URL=https://api.yourdomain.com
```

```bash
# In backend/.env
CORS_ORIGIN=https://yourdomain.com
```

### Option 2: Nginx Reverse Proxy
```nginx
server {
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3002;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

## Performance Tips

1. **Increase scraping limit**: Adjust Puppeteer resources in backend
2. **Database indexing**: MongoDB automatically indexes domain field
3. **Rate limiting**: Add rate limiting middleware to backend
4. **Caching**: Consider adding Redis for API response caching

## Security Best Practices

1. **Use HTTPS** in production
2. **Restrict CORS** to specific domains
3. **Strong passwords** and tokens
4. **Regular updates** of dependencies and Docker images
5. **Firewall rules** to limit port access
6. **MongoDB auth** if exposed externally
7. **Rate limiting** on API endpoints
8. **Input validation** on all endpoints

## Support

- Full deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Main documentation: [README.md](./README.md)
- View logs: `docker-compose logs -f`
- Check status: `docker-compose ps`
