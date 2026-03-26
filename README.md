# 🏆 EdUHK Guinness World Records Attempt
## Most Instagram Videos Featuring Performances of the Same Song

**Official Video Capture Application**  
The Education University of Hong Kong

---

## 📋 Project Overview

This application enables participants to:
- Record karaoke performances with synchronized lyrics
- Choose between Traditional Chinese or English lyrics
- Upload videos to OneDrive/SharePoint
- Store participant information in a central database

**Admin Portal**: Manage submissions, approve videos, export data

---

## 📁 Project Structure

```
karaoke-app/
├── index.html              # Main recording application
├── admin-portal/
│   └── index.html          # Admin dashboard
├── backend/
│   ├── index.js            # Node.js API server
│   ├── package.json        # Dependencies
│   └── .env.example        # Environment variables template
├── assets/
│   ├── karaoke-track.mp3   # Background music
│   └── eduhk-logo.png      # EdUHK logo
├── README.md               # This file
└── LYRICS-GUIDE.md         # Lyrics customization guide
```

---

## 🚀 Quick Start

### Frontend Setup

1. **Add Audio File**
   ```
   Place your song file in: assets/karaoke-track.mp3
   ```

2. **Update API URL** (in `index.html`)
   ```javascript
   const CONFIG = {
     API_BASE_URL: 'https://your-api-domain.com'
     // For local testing: 'http://localhost:3000'
   };
   ```

3. **Run Frontend**
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Open: http://localhost:8000
   ```

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Run Backend**
   ```bash
   npm start
   ```

---

## 🔧 Backend Configuration

### Azure AD Setup

1. **Register App** in Azure Portal
2. **Add Permissions**:
   - `Files.ReadWrite.All`
   - `Sites.ReadWrite.All`
3. **Create Client Secret**
4. **Copy IDs**:
   - Client ID
   - Tenant ID
   - SharePoint Site ID

### Environment Variables (.env)

```env
# Azure AD
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id

# SharePoint
SHAREPOINT_SITE_ID=your-site-id
SHAREPOINT_DRIVE_ID=your-drive-id
UPLOAD_FOLDER_PATH=/sites/EdUHK-GWR/Submissions

# Database
MONGODB_URI=mongodb://localhost:27017/eduhk-gwr

# Server
PORT=3000
CORS_ORIGIN=http://localhost:8000
```

---

## 📱 Responsive Design

The application is fully responsive across all devices:

### Desktop (1441px+)
- Large video preview
- Full control panel
- Side-by-side form fields

### Tablet (769px - 1440px)
- Optimized video size
- Stacked layout
- Touch-friendly buttons

### Mobile (≤768px)
- Compact header with logo
- Single column form
- Full-width buttons
- Reduced lyrics font size
- Optimized video container

### Extra Small Mobile (≤480px)
- Minimal header
- Large touch targets
- Simplified controls

---

## 🎯 Features

### Participant Features
- ✅ User registration (Family Name, First Name, Email, WhatsApp)
- ✅ Country code selector (60+ countries)
- ✅ Language selection (Chinese/English lyrics)
- ✅ Live webcam preview (1080×1920 portrait)
- ✅ Synchronized lyrics display
- ✅ Video download (MP4/WebM)
- ✅ Upload to SharePoint

### Admin Features
- ✅ Dashboard with statistics
- ✅ View all submissions
- ✅ Search & filter (name, email, date, status)
- ✅ Video preview
- ✅ Approve/reject submissions
- ✅ Add admin notes
- ✅ Export to CSV
- ✅ Delete submissions

---

## 📊 Database Schema

```javascript
{
  familyName: String,
  firstName: String,
  email: String,
  whatsappTel: String,
  countryCode: String,
  phone: String,
  video: {
    fileName: String,
    fileId: String,
    sharePointLink: String,
    mimeType: String,
    size: Number
  },
  recordedAt: Date,
  uploadedAt: Date,
  status: 'pending' | 'approved' | 'rejected',
  adminNotes: String
}
```

---

## 🎵 Lyrics Configuration

### Available Languages
- **Traditional Chinese** (繁體中文)
- **English/Jyutping** (拼音)

### Customize Lyrics
See `LYRICS-GUIDE.md` for detailed instructions.

### Current Song: 良師頌 (Ode to Teachers)
```
良師啊
是您一顆
愛心關懷
燃亮了我
```

---

## 🔐 Security

### Frontend
- Input validation
- Email format verification
- Phone number validation

### Backend
- CORS configuration
- Request size limits (50MB)
- MongoDB injection protection
- Azure AD authentication

### Recommendations for Production
1. Enable HTTPS
2. Add admin authentication (JWT)
3. Implement rate limiting
4. Add file type validation
5. Set up monitoring/logging

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/upload` | Upload video |
| GET | `/api/participants` | Get all participants |
| GET | `/api/participants/:id` | Get single participant |
| PUT | `/api/participants/:id` | Update status |
| DELETE | `/api/participants/:id` | Delete participant |
| GET | `/api/export/csv` | Export to CSV |

---

##  Design System

### Colors (Guinness World Records)
- **#082C56** - Deep Navy (Primary)
- **#C19A3B** - Gold (Accent)
- **#407692** - Teal (Secondary)

### Typography
- Headings: 2.5rem - 3.2rem (Desktop)
- Body: 1rem - 1.1rem
- Lyrics: 2rem - 2.5rem (Desktop)

### Components
- Gradient backgrounds
- Gold borders and accents
- Glassmorphism effects
- Responsive grid layouts

---

## 🧪 Testing

### Frontend Testing
1. Open in Chrome/Firefox/Safari
2. Grant camera/microphone permissions
3. Complete registration form
4. Select language preference
5. Record video
6. Test download and upload

### Backend Testing
```bash
# Health check
curl http://localhost:3000/health

# Test upload
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"video":"base64...","familyName":"Test"}'
```

### Responsive Testing
- Desktop: 1920×1080
- Tablet: 1024×768
- Mobile: 375×667 (iPhone SE)
- Mobile: 414×896 (iPhone 11 Pro Max)

---

## 🐛 Troubleshooting

### Camera Not Working
- Use HTTPS or localhost
- Grant browser permissions
- Close other apps using camera

### Upload Fails
- Check backend is running
- Verify Azure credentials
- Check MongoDB connection
- Review CORS settings

### Lyrics Not Syncing
- Check audio file exists
- Verify timestamps in milliseconds
- Ensure audio duration matches lyrics

---

## 📞 Support

For technical issues:
1. Check console logs (F12)
2. Review backend logs
3. Verify environment variables
4. Test API endpoints

---

## 📄 License

This project is for EdUHK's Guinness World Records attempt.

---

**Good luck with the World Record! 🏆**

*The Education University of Hong Kong*
