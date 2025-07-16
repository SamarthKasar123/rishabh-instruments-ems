# Production Deployment Guide

## Quick Setup Commands

### 1. Generate JWT Secret
```bash
# Run this to generate a secure JWT secret
openssl rand -base64 32
```

### 2. MongoDB Atlas Setup
1. Go to https://cloud.mongodb.com/
2. Create new project: "Rishabh Instruments"
3. Create new cluster (free tier)
4. Create database user
5. Set network access to 0.0.0.0/0
6. Get connection string

### 3. Render Backend Deployment
```
Service Name: rishabh-instruments-backend
Build Command: npm install
Start Command: npm start
Environment Variables:
- NODE_ENV=production
- MONGODB_URI=mongodb+srv://...
- JWT_SECRET=[generated secret]
- JWT_EXPIRE=7d
- CLIENT_URL=[netlify domain]
- MAX_FILE_SIZE=10485760
- UPLOAD_PATH=./uploads
```

### 4. Netlify Frontend Deployment
```
Base Directory: frontend
Build Command: npm run build
Publish Directory: frontend/build
Environment Variables:
- REACT_APP_API_URL=https://[render-service].onrender.com/api
```

## Testing URLs
- Backend Health: https://[service].onrender.com/api/health
- Frontend: https://[site].netlify.app
- API Test: https://[service].onrender.com/api/ping

## Security Notes
- Never commit .env files with real credentials
- Use strong JWT secrets (32+ characters)
- MongoDB Atlas handles SSL/TLS automatically
- Render provides HTTPS by default
- Netlify provides HTTPS by default

## Performance Tips
- Render free tier has cold starts (30-second delay after inactivity)
- Consider upgrading to paid plans for production use
- MongoDB Atlas free tier has 512MB storage limit
- Netlify free tier has 100GB bandwidth limit
