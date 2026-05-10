/**
 * EdUHK GWR Video Upload - Backend API Server
 * Microsoft Graph API Integration for OneDrive/SharePoint
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 } // 500 MB cap
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduhk-gwr', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Participant Schema
const participantSchema = new mongoose.Schema({
  familyName: { type: String, required: true },
  firstName: { type: String, required: true },
  email: { type: String, required: true, index: true },
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
  uploadedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: String
});

const Participant = mongoose.model('Participant', participantSchema);

// Azure AD Authentication
const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_SECRET
);

// Microsoft Graph Client
const graphClient = Client.init({
  authProvider: async (done) => {
    try {
      const token = await credential.getToken('https://graph.microsoft.com/.default');
      done(null, token.token);
    } catch (error) {
      done(error, null);
    }
  }
});

// Upload video to SharePoint
async function uploadToSharePoint(videoBuffer, fileName, folderPath = '/EdUHK-GWR/Submissions') {
  try {
    const siteId = process.env.SHAREPOINT_SITE_ID;
    
    // Upload file to SharePoint
    const uploadResponse = await graphClient
      .api(`/sites/${siteId}/drive/root:/${folderPath}/${fileName}:/content`)
      .put(videoBuffer);

    // Create shareable link
    const permission = await graphClient
      .api(`/sites/${siteId}/drive/items/${uploadResponse.id}/createLink`)
      .post({
        type: 'view',
        scope: 'anonymous'
      });

    return {
      fileId: uploadResponse.id,
      fileName: uploadResponse.name,
      sharePointLink: permission.link.webUrl,
      size: uploadResponse.size
    };
  } catch (error) {
    console.error('SharePoint upload error:', error);
    throw error;
  }
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get participant count
app.get('/api/participants/count', async (req, res) => {
  try {
    const count = await Participant.countDocuments();
    res.json({
      success: true,
      count: count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload video endpoint
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    const {
      familyName,
      firstName,
      userEmail,
      whatsappTel,
      countryCode,
      phone,
      filename,
      mimeType,
      recordedAt
    } = req.body;

    // Validate required fields
    if (!req.file || !familyName || !firstName || !userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const videoBuffer = req.file.buffer;

    // Upload to SharePoint
    const uploadResult = await uploadToSharePoint(videoBuffer, filename);

    // Save participant data to database
    const participant = new Participant({
      familyName,
      firstName,
      email: userEmail,
      whatsappTel: `${countryCode}${phone}`,
      countryCode,
      phone,
      video: {
        fileName: uploadResult.fileName,
        fileId: uploadResult.fileId,
        sharePointLink: uploadResult.sharePointLink,
        mimeType: mimeType || 'video/mp4',
        size: uploadResult.size
      },
      recordedAt: recordedAt || new Date(),
      status: 'pending'
    });

    await participant.save();

    // Send success response
    res.json({
      success: true,
      message: 'Upload successful',
      data: {
        participantId: participant._id,
        ...uploadResult,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed'
    });
  }
});

// Get all participants (admin only)
app.get('/api/participants', async (req, res) => {
  try {
    const participants = await Participant.find()
      .sort({ uploadedAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      count: participants.length,
      data: participants
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single participant
app.get('/api/participants/:id', async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found'
      });
    }

    res.json({
      success: true,
      data: participant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update participant status
app.put('/api/participants/:id', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const participant = await Participant.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true }
    );

    if (!participant) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found'
      });
    }

    res.json({
      success: true,
      data: participant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete participant
app.delete('/api/participants/:id', async (req, res) => {
  try {
    const participant = await Participant.findByIdAndDelete(req.params.id);
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found'
      });
    }

    res.json({
      success: true,
      message: 'Participant deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Export participants to CSV
app.get('/api/export/csv', async (req, res) => {
  try {
    const participants = await Participant.find().select('-__v');
    
    const csvRows = [
      ['Family Name', 'First Name', 'Email', 'WhatsApp', 'Video Link', 'Upload Date', 'Status']
    ];

    participants.forEach(p => {
      csvRows.push([
        p.familyName,
        p.firstName,
        p.email,
        p.whatsappTel,
        p.video.sharePointLink,
        p.uploadedAt.toISOString(),
        p.status
      ]);
    });

    const csv = csvRows.map(row => row.join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=participants.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EdUHK GWR Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
