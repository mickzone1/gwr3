# 🚀 Deployment Guide

## Complete Deployment for EdUHK GWR Application

---

## Part 1: Backend Deployment (Azure)

### Option A: Azure App Service (Recommended)

#### 1. Create Resources
```bash
# Create resource group
az group create --name eduhk-gwr-rg --location eastasia

# Create App Service Plan
az appservice plan create \
  --name eduhk-gwr-plan \
  --resource-group eduhk-gwr-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group eduhk-gwr-rg \
  --plan eduhk-gwr-plan \
  --name eduhk-gwr-api \
  --runtime "NODE|18-lts"
```

#### 2. Configure Environment Variables
```bash
az webapp config appsettings set \
  --resource-group eduhk-gwr-rg \
  --name eduhk-gwr-api \
  --settings \
    AZURE_CLIENT_ID=your-client-id \
    AZURE_CLIENT_SECRET=your-secret \
    AZURE_TENANT_ID=your-tenant-id \
    SHAREPOINT_SITE_ID=your-site-id \
    MONGODB_URI=your-mongodb-uri \
    CORS_ORIGIN=https://your-frontend-domain.com
```

#### 3. Deploy Code
```bash
# Zip backend files
cd backend
zip -r deploy.zip .

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group eduhk-gwr-rg \
  --name eduhk-gwr-api \
  --src deploy.zip
```

### Option B: Azure Functions

```bash
# Create function app
az functionapp create \
  --resource-group eduhk-gwr-rg \
  --consumption-plan-location eastasia \
  --runtime node \
  --functions-version 4 \
  --name eduhk-gwr-func \
  --storage-account <storage-account-name>
```

---

## Part 2: Database Setup

### MongoDB Atlas (Cloud)

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create free cluster (M0)

2. **Configure Access**
   - Create database user
   - Whitelist IP: `0.0.0.0/0` (all IPs)

3. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/eduhk-gwr
   ```

4. **Update Azure App Settings**
   ```bash
   az webapp config appsettings set \
     --name eduhk-gwr-api \
     --settings MONGODB_URI="mongodb+srv://..."
   ```

---

## Part 3: Frontend Deployment

### Option A: Azure Static Web Apps

```bash
# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy ./karaoke-app \
  --app-name eduhk-gwr-app \
  --resource-group eduhk-gwr-rg
```

### Option B: GitHub Pages

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: Deploy from branch (main)
   - Folder: / (root)

3. **Update API URL**
   ```javascript
   const CONFIG = {
     API_BASE_URL: 'https://eduhk-gwr-api.azurewebsites.net'
   };
   ```

### Option C: Netlify

1. **Drag & Drop**
   - Go to [Netlify Drop](https://app.netlify.com/drop)
   - Drop the `karaoke-app` folder

2. **Configure Build Settings**
   - Build command: (leave empty)
   - Publish directory: `/`

---

## Part 4: SharePoint Setup

### Create Document Library

1. **Go to SharePoint**
   - Navigate to your site: `https://eduhk.sharepoint.com/sites/GWR`

2. **Create Folder**
   ```
   /sites/EdUHK-GWR/Shared Documents/Submissions
   ```

3. **Get Site ID**
   ```
   GET https://graph.microsoft.com/v1.0/sites/eduhk.sharepoint.com:/sites/GWR
   ```

4. **Configure Permissions**
   - App registration needs access to this site
   - Grant admin consent in Azure AD

---

## Part 5: Admin Portal Access

### Deploy Admin Portal

```bash
# Option 1: Same domain, different path
# Deploy to: https://your-domain.com/admin

# Option 2: Separate subdomain
# Deploy to: https://admin.your-domain.com
```

### Secure Admin Portal

1. **Add Basic Authentication**
   ```javascript
   // Add to admin-portal/index.html
   const ADMIN_CREDENTIALS = {
     username: 'admin',
     password: 'your-secure-password'
   };
   ```

2. **Or Use Azure AD B2C**
   - Set up user flow
   - Require login before accessing admin portal

---

## Part 6: SSL/HTTPS Setup

### For Custom Domain

1. **Buy Domain** (e.g., from GoDaddy)

2. **Configure DNS**
   ```
   Type: CNAME
   Name: www
   Value: eduhk-gwr-app.azurewebsites.net
   ```

3. **Add Custom Domain to Azure**
   ```bash
   az webapp config hostname add \
     --resource-group eduhk-gwr-rg \
     --webapp-name eduhk-gwr-api \
     --hostname www.your-domain.com
   ```

4. **Bind SSL Certificate**
   - Use App Service Managed Certificate (free)
   - Or upload your own certificate

---

## Part 7: Monitoring & Logging

### Azure Application Insights

```bash
# Enable Application Insights
az monitor app-insights component create \
  --app eduhk-gwr-insights \
  --location eastasia \
  --resource-group eduhk-gwr-rg \
  --application-type web
```

### View Logs

```bash
# Stream logs in real-time
az webapp log tail \
  --name eduhk-gwr-api \
  --resource-group eduhk-gwr-rg
```

---

## Part 8: Testing Deployment

### Checklist

- [ ] Backend API is accessible
- [ ] Database connection works
- [ ] SharePoint upload succeeds
- [ ] Frontend loads correctly
- [ ] Camera/microphone permissions work
- [ ] Video recording functions
- [ ] Upload to SharePoint completes
- [ ] Admin portal accessible
- [ ] CSV export works
- [ ] Mobile responsive design verified

### Test URLs

```
Frontend: https://your-domain.com
Backend API: https://eduhk-gwr-api.azurewebsites.net/health
Admin Portal: https://your-domain.com/admin
```

---

## Part 9: Performance Optimization

### Frontend

1. **Enable CDN** for static assets
2. **Minify HTML/CSS/JS**
3. **Compress images**
4. **Lazy load** non-critical resources

### Backend

1. **Enable caching** (Redis)
2. **Use connection pooling** for MongoDB
3. **Implement retry logic** for Graph API
4. **Set up auto-scaling**

---

## Part 10: Security Hardening

### Production Checklist

- [ ] HTTPS enabled everywhere
- [ ] CORS restricted to specific domains
- [ ] Admin authentication implemented
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] File size limits configured
- [ ] Error messages don't leak sensitive info
- [ ] Regular security audits scheduled
- [ ] Backup strategy implemented
- [ ] Monitoring alerts configured

---

## 🆘 Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check Azure AD credentials
   - Verify admin consent granted

2. **CORS Errors**
   - Update CORS_ORIGIN in backend
   - Ensure frontend domain matches

3. **Database Connection Fails**
   - Check MongoDB connection string
   - Verify IP whitelist (Atlas)

4. **SharePoint Upload Fails**
   - Verify site ID is correct
   - Check folder path exists
   - Ensure app has permissions

---

## 📞 Support Resources

- [Azure Documentation](https://docs.microsoft.com/azure)
- [Microsoft Graph API](https://docs.microsoft.com/graph)
- [MongoDB Atlas](https://docs.atlas.mongodb.com)
- [Azure App Service](https://docs.microsoft.com/azure/app-service)

---

**Deployment typically takes 1-2 hours for first-time setup.**
