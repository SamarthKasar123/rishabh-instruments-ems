# Deployment Checklist

## Pre-Deployment
- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with read/write permissions
- [ ] Network access configured (0.0.0.0/0 for production)
- [ ] Connection string obtained

## Backend Deployment (Render)
- [ ] Render account created
- [ ] Repository connected
- [ ] Build and start commands configured
- [ ] Environment variables set:
  - [ ] NODE_ENV=production
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET
  - [ ] CLIENT_URL
- [ ] Service deployed successfully
- [ ] Health endpoint accessible

## Frontend Deployment (Netlify)
- [ ] Netlify account created
- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables set:
  - [ ] REACT_APP_API_URL
- [ ] Site deployed successfully
- [ ] React routing works (SPA redirects configured)

## Post-Deployment
- [ ] Backend CLIENT_URL updated with Netlify domain
- [ ] Frontend can connect to backend
- [ ] Authentication works
- [ ] Database operations work
- [ ] All features tested

## URLs to Save
- Backend: https://your-backend-name.onrender.com
- Frontend: https://your-site-name.netlify.app
- Database: MongoDB Atlas cluster connection string

## Common Issues and Solutions

### Backend Issues
1. **503 Service Unavailable**: Check if MongoDB connection string is correct
2. **CORS Errors**: Ensure CLIENT_URL is set to your Netlify domain
3. **Build Failures**: Check package.json dependencies

### Frontend Issues
1. **Blank Page**: Check REACT_APP_API_URL environment variable
2. **API Not Reachable**: Verify backend URL is correct and accessible
3. **404 on Refresh**: Ensure netlify.toml redirects are configured

### Database Issues
1. **Connection Timeout**: Check MongoDB Atlas network access settings
2. **Authentication Failed**: Verify database user credentials
3. **Database Not Found**: Ensure database name matches in connection string
