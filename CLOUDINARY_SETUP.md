# Cloudinary Setup Guide for Karma Club

## ⚠️ SECURITY FIRST - IMPORTANT!

**You shared your API secret in plain text. Please follow these steps immediately:**

1. **Go to your Cloudinary Dashboard** → API Keys section
2. **Regenerate your API Secret** (the one you shared is now compromised)
3. **Never share API secrets** in plain text or commit them to code repositories

## Proper Cloudinary Setup for Client-Side Uploads

For this React application, you should use **unsigned upload presets** instead of API secrets. This is much more secure for client-side applications.

### Step 1: Create Upload Preset

1. **Login to Cloudinary Dashboard**: https://cloudinary.com/console
2. **Go to Settings** → **Upload** tab
3. **Scroll down to "Upload presets"**
4. **Click "Add upload preset"**

### Step 2: Configure Upload Preset

**Preset Name**: `karma-club-uploads` (or any name you prefer)

**Upload Preset Settings**:
```
Signing Mode: Unsigned
Use filename: false
Unique filename: true
Overwrite: false
Resource Type: Auto
Access Mode: Public
```

**Media Analysis**: Enable if you want automatic tagging
**Quality Analysis**: Enable for quality metrics
**Background Removal**: Disable (paid feature)

**Allowed Formats**: 
- Images: jpg, png, gif, webp
- Videos: mp4, mov, avi (if supporting video)

**File Size Limits**:
- Max file size: 10MB (10485760 bytes)
- Max image width: 2000px (optional)
- Max image height: 2000px (optional)

**Folder Structure** (optional):
- Folder: `karma-club/submissions`

### Step 3: Update Environment Variables

Based on your API key `426339892533786`, your cloud name should be something like this. You need to find your actual cloud name in the Cloudinary dashboard.

Update your `.env` file:

```env
# Replace with your actual cloud name (not the API key)
VITE_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name

# Use the upload preset name you created
VITE_CLOUDINARY_UPLOAD_PRESET=karma-club-uploads
```

### Step 4: Find Your Cloud Name

1. **In Cloudinary Dashboard**, look at the top-left corner
2. **Your cloud name** is displayed there (usually not numbers like your API key)
3. **Or check the URL**: https://console.cloudinary.com/console/c/YOUR_CLOUD_NAME

### Step 5: Test the Setup

After configuring:

1. **Start your dev server**: `npm run dev`
2. **Go to**: http://localhost:8080/karma-club-full
3. **Click "Complete Activity"** on any activity
4. **Try uploading an image** in the submission form
5. **Check your Cloudinary Media Library** to see if files appear

## Security Best Practices

### ✅ DO:
- Use unsigned upload presets for client-side uploads
- Set file size and format restrictions
- Use folder organization
- Enable automatic optimization
- Set up webhooks for processing (if needed)

### ❌ DON'T:
- Put API secrets in client-side code
- Share credentials in plain text
- Commit secrets to version control
- Use signed uploads for public web apps
- Allow unlimited file sizes

## Troubleshooting

### Common Issues:

1. **"Invalid Upload Preset"**
   - Check preset name matches exactly
   - Ensure preset is set to "Unsigned"

2. **"Upload Failed"**
   - Check file size limits
   - Verify file format is allowed
   - Check network connectivity

3. **"Unauthorized"**
   - Wrong cloud name
   - Preset is set to "Signed" instead of "Unsigned"

### Debug Steps:

1. **Check browser console** for error messages
2. **Verify environment variables** are loaded correctly
3. **Test with a small image** (< 1MB) first
4. **Check Cloudinary activity log** in dashboard

## Advanced Configuration (Optional)

### Image Transformations:
```javascript
// Auto-optimize uploaded images
const transformedUrl = CloudinaryService.getOptimizedUrl(publicId, {
  width: 800,
  height: 600,
  quality: 'auto',
  format: 'auto'
});
```

### Upload Progress Tracking:
```javascript
// The current implementation can be enhanced to show upload progress
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener('progress', (e) => {
  const progress = (e.loaded / e.total) * 100;
  // Update UI with progress
});
```

## Final Steps

1. **Update .env with correct values**
2. **Test the upload functionality**
3. **Regenerate your API secret** for security
4. **Keep credentials private** going forward

## Example Working Configuration

```env
VITE_CLOUDINARY_CLOUD_NAME=my-karma-club
VITE_CLOUDINARY_UPLOAD_PRESET=karma-club-uploads
```

With this setup, your submission form will securely upload images and videos to Cloudinary without exposing any secrets to client-side code.