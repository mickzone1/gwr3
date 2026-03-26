/**
 * Karaoke Video Capture - Google Apps Script Backend
 * 
 * This script handles:
 * 1. Receiving video blobs from the frontend
 * 2. Saving videos to Google Drive
 * 3. Generating shareable links
 * 4. Sending email notifications to administrators
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this code to a new Google Apps Script project
 * 2. Update the CONFIG object below with your settings
 * 3. Deploy as a Web App (see deployment instructions at bottom)
 */

// ============================================================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================================================

const CONFIG = {
  // Google Drive folder ID where videos will be stored
  // To get folder ID: Open Google Drive folder, copy the ID from the URL
  // URL format: https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE
  DRIVE_FOLDER_ID: 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE',
  
  // Administrator email address for notifications
  ADMIN_EMAIL: 'admin@example.com',
  
  // Email subject line for notifications
  EMAIL_SUBJECT: 'New Karaoke Video Submission',
  
  // File name prefix for uploaded videos
  FILE_PREFIX: 'karaoke_submission_',
  
  // Enable/disable email notifications (true/false)
  ENABLE_EMAIL_NOTIFICATIONS: true
};

// ============================================================================
// MAIN ENTRY POINT - DO NOT MODIFY BELOW THIS LINE
// ============================================================================

/**
 * Handles POST requests from the frontend
 * Receives video data and user information
 */
function doPost(e) {
  try {
    // Parse incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.video || !data.userName || !data.userEmail) {
      return createResponse(false, 'Missing required fields: video, userName, userEmail');
    }
    
    // Process the video upload
    const result = processVideoUpload(data);
    
    return createResponse(true, 'Upload successful', result);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createResponse(false, 'Server error: ' + error.message);
  }
}

/**
 * Handles GET requests (for testing)
 */
function doGet(e) {
  return createResponse(true, 'Karaoke Upload Service is running');
}

/**
 * Process video upload: save to Drive and send notification
 */
function processVideoUpload(data) {
  const folder = getDriveFolder();
  const file = saveVideoToDrive(folder, data);
  const shareableLink = makeFileShareable(file);
  
  // Send email notification if enabled
  if (CONFIG.ENABLE_EMAIL_NOTIFICATIONS) {
    sendAdminNotification(data, shareableLink);
  }
  
  return {
    fileId: file.getId(),
    fileName: file.getName(),
    shareableLink: shareableLink,
    uploadedAt: new Date().toISOString()
  };
}

/**
 * Get or create the Google Drive folder for uploads
 */
function getDriveFolder() {
  try {
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    return folder;
  } catch (error) {
    Logger.log('Folder not found, creating new folder...');
    const folder = DriveApp.createFolder('Karaoke Submissions');
    // Update config with new folder ID (manual update required)
    Logger.log('New folder created with ID: ' + folder.getId());
    return folder;
  }
}

/**
 * Save video file to Google Drive
 */
function saveVideoToDrive(folder, data) {
  // Decode base64 video data
  const videoData = Utilities.base64Decode(data.video);
  
  // Determine MIME type from data or default to webm
  const mimeType = data.mimeType || 'video/webm';
  const fileExtension = getFileExtensionFromMime(mimeType);
  
  // Generate filename with timestamp
  const timestamp = new Date().getTime();
  const sanitizedName = data.fileName 
    ? data.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    : CONFIG.FILE_PREFIX + data.userName.replace(/\s+/g, '_') + '_' + timestamp + fileExtension;
  
  // Create blob and save to Drive
  const blob = Utilities.newBlob(videoData, mimeType, sanitizedName);
  const file = folder.createFile(blob);
  
  Logger.log('File saved: ' + file.getName() + ' (ID: ' + file.getId() + ')');
  
  return file;
}

/**
 * Get file extension from MIME type
 */
function getFileExtensionFromMime(mimeType) {
  if (mimeType.includes('mp4') || mimeType.includes('m4v')) return '.mp4';
  if (mimeType.includes('webm')) return '.webm';
  return '.webm';
}

/**
 * Make file publicly accessible and return shareable link
 */
function makeFileShareable(file) {
  // Set sharing permissions - anyone with link can view
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  // Generate shareable link
  const shareableLink = 'https://drive.google.com/file/d/' + file.getId() + '/view?usp=sharing';
  
  Logger.log('Shareable link created: ' + shareableLink);
  
  return shareableLink;
}

/**
 * Send email notification to administrator
 */
function sendAdminNotification(data, shareableLink) {
  try {
    const htmlBody = createEmailHTML(data, shareableLink);
    
    GmailApp.sendEmail(
      CONFIG.ADMIN_EMAIL,
      CONFIG.EMAIL_SUBJECT + ' - ' + data.userName,
      'Please view this email in an HTML-compatible client to see the full message.',
      {
        htmlBody: htmlBody,
        name: 'Karaoke Video System'
      }
    );
    
    Logger.log('Email notification sent to: ' + CONFIG.ADMIN_EMAIL);
    
  } catch (error) {
    Logger.log('Failed to send email notification: ' + error.message);
    throw error;
  }
}

/**
 * Create HTML email body for notifications
 */
function createEmailHTML(data, shareableLink) {
  const uploadDate = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  
  const fullName = data.fullName || (data.firstName + ' ' + data.familyName) || 'Unknown';
  const whatsappTel = data.whatsappTel || 'Not provided';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #082C56, #407692);
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      margin-bottom: 20px;
      border: 2px solid #C19A3B;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      color: #C19A3B;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      border: 2px solid #C19A3B;
    }
    .field {
      margin-bottom: 15px;
    }
    .label {
      font-weight: bold;
      color: #082C56;
      display: block;
      margin-bottom: 5px;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 1px;
    }
    .value {
      background: white;
      padding: 12px;
      border-radius: 5px;
      border-left: 4px solid #C19A3B;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #C19A3B, #d4a942);
      color: #082C56;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin-top: 10px;
    }
    .footer {
      text-align: center;
      color: #999;
      font-size: 12px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏆 Guinness World Records Attempt</h1>
    <p>EdUHK - Most Instagram Videos Featuring Performances of the Same Song</p>
  </div>
  
  <div class="content">
    <div class="field">
      <span class="label">Family Name:</span>
      <div class="value">${escapeHtml(data.familyName || 'N/A')}</div>
    </div>
    
    <div class="field">
      <span class="label">First Name:</span>
      <div class="value">${escapeHtml(data.firstName || 'N/A')}</div>
    </div>
    
    <div class="field">
      <span class="label">Full Name:</span>
      <div class="value">${escapeHtml(fullName)}</div>
    </div>
    
    <div class="field">
      <span class="label">Email Address:</span>
      <div class="value">${escapeHtml(data.userEmail || 'N/A')}</div>
    </div>
    
    <div class="field">
      <span class="label">WhatsApp Number:</span>
      <div class="value">${escapeHtml(whatsappTel)}</div>
    </div>
    
    <div class="field">
      <span class="label">Upload Date:</span>
      <div class="value">${uploadDate} UTC</div>
    </div>
    
    <div class="field">
      <span class="label">Video Link:</span>
      <div class="value">
        <a href="${shareableLink}" class="button">🎬 Watch Performance</a>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p>This is an automated notification from the EdUHK GWR Attempt Video Capture System</p>
  </div>
</body>
</html>
  `;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Create standardized JSON response
 */
function createResponse(success, message, data) {
  const response = {
    success: success,
    message: message
  };
  
  if (data) {
    response.data = data;
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// DEPLOYMENT INSTRUCTIONS
// ============================================================================

/**
 * HOW TO DEPLOY THIS SCRIPT:
 * 
 * 1. Create a new Google Apps Script project:
 *    - Go to script.google.com
 *    - Click "New Project"
 *    - Copy this entire code into the editor
 * 
 * 2. Configure the script:
 *    - Update CONFIG.DRIVE_FOLDER_ID with your Google Drive folder ID
 *    - Update CONFIG.ADMIN_EMAIL with your administrator email
 *    - Customize other CONFIG values as needed
 * 
 * 3. Set up required permissions:
 *    - Click on "Services" (+ icon) in the left sidebar
 *    - Add "Google Drive API" service
 *    - Save the project
 * 
 * 4. Deploy as Web App:
 *    - Click "Deploy" > "New deployment"
 *    - Select type: "Web app"
 *    - Description: "Karaoke Video Upload"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone" (important for frontend access)
 *    - Click "Deploy"
 * 
 * 5. Authorize the script:
 *    - Click "Review permissions"
 *    - Select your Google account
 *    - Click "Advanced" > "Go to [Your Project] (unsafe)"
 *    - Click "Allow"
 * 
 * 6. Copy the Web App URL:
 *    - After deployment, copy the Web App URL
 *    - Paste it into your frontend HTML as CONFIG.GOOGLE_APPS_SCRIPT_URL
 * 
 * 7. Test the deployment:
 *    - Open the Web App URL in a browser
 *    - You should see: {"success":true,"message":"Karaoke Upload Service is running"}
 * 
 * SECURITY NOTES:
 * - The Web App URL should be kept private in production
 * - Consider implementing additional authentication for production use
 * - Monitor quota usage in Google Cloud Console
 * 
 * TROUBLESHOOTING:
 * - Check "Executions" tab for error logs
 * - Verify Drive folder permissions
 * - Ensure Gmail API is enabled for your Google account
 * - Check email spam folder for notifications
 */
