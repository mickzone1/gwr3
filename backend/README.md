# EdUHK GWR Video Submission - Backend API

## Microsoft Graph API Integration for OneDrive/SharePoint

This backend handles:
1. Video upload to OneDrive/SharePoint
2. Participant data storage
3. Admin portal for viewing submissions

---

## 📋 Prerequisites

1. **Azure AD App Registration**
2. **Microsoft Graph API Permissions**
3. **SharePoint/OneDrive Site Configuration**

---

## 🔧 Setup Instructions

### Step 1: Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Name: `EdUHK GWR Video Upload`
5. Supported account types: **Single tenant**
6. Redirect URI: Leave blank for now
7. Click **Register**

### Step 2: Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph**
3. Add **Application permissions**:
   - `Files.ReadWrite.All`
   - `Sites.ReadWrite.All`
   - `User.Read.All`
4. Click **Grant admin consent**

### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Description: `Video Upload Secret`
4. Expires: Choose duration
5. **Copy the secret value immediately** (won't show again)

### Step 4: Get Required IDs

From Azure AD App Registration:
- **Application (client) ID**: `YOUR_CLIENT_ID`
- **Directory (tenant) ID**: `YOUR_TENANT_ID`

From SharePoint:
- **Site ID**: `YOUR_SHAREPOINT_SITE_ID`
- **Drive ID**: `YOUR_DRIVE_ID` (or use site ID)

---

## 🚀 Deployment Options

### Option A: Azure Function (Recommended)

```bash
# Create function app
az functionapp create \
  --resource-group EdUHK-GWR \
  --consumption-plan-location eastasia \
  --runtime node \
  --functions-version 4 \
  --name eduhk-gwr-upload \
  --storage-account <your-storage-account>
```

### Option B: Node.js Express Server

```bash
npm install express @azure/identity @microsoft/microsoft-graph-client isomorphic-fetch
```

---

## 📁 File Structure

```
backend/
├── index.js                 # Main API server
├── config.js                # Configuration
├── graphClient.js           # Microsoft Graph client
├── routes/
│   ├── upload.js            # Video upload endpoint
│   └── participants.js      # Participant data endpoint
├── middleware/
│   └── auth.js              # Authentication middleware
└── .env                     # Environment variables
```

---

## 🔑 Environment Variables (.env)

```env
# Azure AD Configuration
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id

# SharePoint/OneDrive Configuration
SHAREPOINT_SITE_ID=your-site-id
SHAREPOINT_DRIVE_ID=your-drive-id
UPLOAD_FOLDER_PATH=/sites/EdUHK-GWR/Shared Documents/Submissions

# Database Configuration (for participant portal)
DATABASE_URL=mongodb://localhost:27017/eduhk-gwr
# OR
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eduhk-gwr

# API Configuration
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

---

## 📡 API Endpoints

### POST /api/upload
Upload video to SharePoint

**Request:**
```json
{
  "video": "base64_encoded_video",
  "familyName": "Chan",
  "firstName": "Tai Man",
  "userEmail": "chan@example.com",
  "whatsappTel": "+85212345678",
  "countryCode": "+852",
  "phone": "12345678",
  "filename": "Chan_Tai_Man1430.mp4",
  "mimeType": "video/mp4",
  "recordedAt": "2024-03-26T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "01AZJL5PN6Y2GOVW7725BZO354PWSELRRZ",
    "fileName": "Chan_Tai_Man1430.mp4",
    "sharePointLink": "https://eduhk.sharepoint.com/sites/GWR/...",
    "uploadedAt": "2024-03-26T10:30:00Z"
  }
}
```

### GET /api/participants
Get all participants (admin only)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "participant_id",
      "familyName": "Chan",
      "firstName": "Tai Man",
      "email": "chan@example.com",
      "whatsappTel": "+85212345678",
      "videoLink": "https://...",
      "uploadedAt": "2024-03-26T10:30:00Z",
      "status": "approved"
    }
  ]
}
```

---

## 💾 Database Schema (MongoDB)

```javascript
// models/Participant.js
{
  familyName: String,
  firstName: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
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
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: String
}
```

---

## 🔐 Authentication

### Frontend Configuration
Update `index.html`:
```javascript
const CONFIG = {
  API_BASE_URL: 'https://your-api-domain.com',
  // API_BASE_URL: 'http://localhost:3000' for local testing
};
```

### Admin Portal Login
Implement JWT-based authentication for admin access to participant data.

---

## 📊 Admin Portal Features

1. **Dashboard**
   - Total submissions count
   - Recent uploads
   - Approval status overview

2. **Participant List**
   - Search/filter by name, email, date
   - View video previews
   - Approve/reject submissions
   - Export to CSV/Excel

3. **Video Management**
   - Bulk download
   - Delete submissions
   - Generate shareable links

---

## 🧪 Testing

```bash
# Test upload endpoint
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"video":"base64...","familyName":"Test","firstName":"User"}'
```

---

## 📝 Notes

1. **File Size Limits**: SharePoint has 250GB per file limit
2. **API Rate Limits**: Microsoft Graph has throttling policies
3. **Storage Quota**: Monitor SharePoint site storage
4. **Compliance**: Ensure GDPR/personal data compliance

---

## 🆘 Troubleshooting

### Common Issues:

1. **401 Unauthorized**
   - Check client secret is correct
   - Verify tenant ID
   - Ensure admin consent granted

2. **403 Forbidden**
   - Check API permissions
   - Verify SharePoint site access

3. **Upload Fails**
   - Check file size limits
   - Verify folder path exists
   - Check network connectivity

---

**For technical support, contact the development team.**
