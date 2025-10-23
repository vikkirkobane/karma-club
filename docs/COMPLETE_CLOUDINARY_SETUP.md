# 📸 Complete Cloudinary Setup Guide for Karma Club

## 🎯 **Overview**
This guide will help you set up Cloudinary for secure, client-side media uploads in your Karma Club application. Your media files (images and videos) will be stored on Cloudinary and linked to your Supabase database.

## 🔧 **Current Configuration Status**
```env
✅ VITE_CLOUDINARY_CLOUD_NAME=dyedachrz (appears to be set)
✅ VITE_CLOUDINARY_UPLOAD_PRESET=karma-club-uploads (needs verification)
```

## 🚀 **Step-by-Step Setup**

### **Step 1: Access Your Cloudinary Dashboard**
1. Go to [Cloudinary Console](https://console.cloudinary.com/)
2. Log in to your account
3. You should see your dashboard for cloud: `dyedachrz`

### **Step 2: Verify/Create Upload Preset**
1. **In your Cloudinary Dashboard**, click **"Settings"** (gear icon)
2. **Navigate to "Upload"** tab
3. **Scroll down to "Upload presets"** section
4. **Look for preset named:** `karma-club-uploads`

**If preset doesn't exist, create it:**
1. **Click "Add upload preset"**
2. **Configure as follows:**

```
Preset name: karma-club-uploads
Signing mode: Unsigned ⚠️ (CRITICAL - must be unsigned for client-side)
Use filename: false
Unique filename: true
Overwrite: false
Resource type: Auto
Access mode: Public
```

### **Step 3: Configure Upload Restrictions**

**File Size & Format Limits:**
```
Max file size: 10485760 (10MB)
Max image width: 2000
Max image height: 2000
Max video length: 60 seconds (optional)
```

**Allowed Formats:**
```
Images: jpg, jpeg, png, gif, webp
Videos: mp4, mov, quicktime, avi (if supporting video)
```

**Folder Organization (Recommended):**
```
Folder: karma-club/submissions
```

### **Step 4: Configure Transformations (Optional but Recommended)**

**Auto-Optimization Settings:**
```
Quality: Auto
Format: Auto
Fetch Format: Auto
```

**Image Transformations:**
```
Width: Auto
Height: Auto
Crop: Scale
```

### **Step 5: Security & Access Control**

**Upload Restrictions:**
```
Enable: File size validation
Enable: Format validation
Enable: Unique filename
Disable: Background removal (paid feature)
```

**Access Control:**
```
Access mode: Public (for web display)
Resource type: Auto (supports images and videos)
```

## 🔍 **Verification Steps**

### **Test Your Configuration:**

1. **Open your Karma Club app** at `http://localhost:8080`
2. **Navigate to Community** (`/community`)
3. **Try creating a post with an image:**
   - Click "Add Photo/Video"
   - Select a small image (< 5MB)
   - Type some text
   - Click "Share Your Kindness"

4. **Check for success indicators:**
   - Toast notification: "Uploading media..."
   - Toast notification: "Post shared! 🎉"
   - Image appears in your post
   - No errors in browser console

### **Verify in Cloudinary Dashboard:**
1. **Go to "Media Library"** in Cloudinary
2. **Look for folder:** `karma-club/submissions`
3. **Verify your uploaded image** appears there
4. **Click on the image** to see its details and URL

## 🛠️ **Troubleshooting Common Issues**

### **Issue 1: "Upload Failed" Error**

**Possible Causes & Solutions:**
```
❌ Upload preset doesn't exist
✅ Create "karma-club-uploads" preset in Cloudinary

❌ Preset is set to "Signed" mode
✅ Change to "Unsigned" mode in preset settings

❌ File size too large
✅ Check file is under 10MB

❌ Unsupported file format  
✅ Use JPG, PNG, or MP4 files
```

### **Issue 2: "Invalid Cloud Name" Error**

**Check Your Configuration:**
```javascript
// In browser console, check:
console.log(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
// Should output: "dyedachrz"

console.log(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);  
// Should output: "karma-club-uploads"
```

### **Issue 3: Files Upload but Don't Display**

**Check URL Format:**
- Uploaded URL should look like: `https://res.cloudinary.com/dyedachrz/image/upload/v1234567890/karma-club/submissions/filename.jpg`
- If URL is different, check your preset folder settings

### **Issue 4: CORS Errors**

**Solution:**
- Cloudinary should allow browser uploads by default
- If you see CORS errors, check your upload preset is set to "Unsigned"

## 📋 **Environment Variables Verification**

**Your `.env` file should contain:**
```env
# Cloudinary Configuration (Client-side upload)
VITE_CLOUDINARY_CLOUD_NAME=dyedachrz
VITE_CLOUDINARY_UPLOAD_PRESET=karma-club-uploads
```

**To verify they're loaded correctly:**
1. **Open browser developer tools**
2. **Go to Console tab**
3. **Run these commands:**
```javascript
// Check cloud name
console.log('Cloud Name:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

// Check preset  
console.log('Upload Preset:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
```

## 🔒 **Security Best Practices**

### **✅ Current Setup (Good):**
- Using unsigned upload presets (client-safe)
- No API secrets in client code
- File size and format restrictions
- Unique filename generation

### **🛡️ Additional Security (Recommended):**
```
1. Set up webhooks for post-upload processing
2. Enable automatic moderation for inappropriate content
3. Set up usage monitoring and alerts
4. Regular audit of uploaded content
```

## 🚦 **Testing Checklist**

**Before marking as complete, verify:**

- [ ] **Upload preset exists** in Cloudinary dashboard
- [ ] **Preset is set to "Unsigned"** mode
- [ ] **Environment variables** are loaded correctly
- [ ] **Small image upload** works in community feed
- [ ] **Large image upload** shows proper error message
- [ ] **Video upload** works (if supported)
- [ ] **Images display correctly** in posts after upload
- [ ] **Media appears** in Cloudinary Media Library
- [ ] **No console errors** during upload process

## 📊 **Monitoring & Analytics**

**Track Usage in Cloudinary:**
1. **Dashboard Overview** - See upload counts and bandwidth
2. **Usage Analytics** - Monitor monthly limits
3. **Activity Log** - Debug upload issues
4. **Media Library** - View all uploaded files

**Set Up Alerts (Recommended):**
- Monthly bandwidth usage alerts
- Storage usage alerts
- Failed upload notifications

## 🎯 **Expected Results After Setup**

### **✅ Working Features:**
- **Community Posts** - Users can upload images with posts
- **Activity Submissions** - Photos/videos save with activity completions
- **Media Display** - All uploaded media displays properly
- **Performance** - Images load fast with Cloudinary optimization
- **Storage Organization** - Files organized in `karma-club/submissions/` folder

### **📈 File URLs:**
```
✅ Images: https://res.cloudinary.com/dyedachrz/image/upload/v[timestamp]/karma-club/submissions/[filename]
✅ Videos: https://res.cloudinary.com/dyedachrz/video/upload/v[timestamp]/karma-club/submissions/[filename]
```

## 🆘 **Get Help**

**If you encounter issues:**

1. **Check Cloudinary Activity Log** for specific error messages
2. **Review browser console** for JavaScript errors
3. **Test with different file types/sizes**
4. **Verify upload preset configuration**

**Common Settings to Double-Check:**
- Upload preset name: `karma-club-uploads`
- Signing mode: `Unsigned`
- Cloud name: `dyedachrz`
- Resource type: `Auto`
- Access mode: `Public`

## 🎉 **Success Indicators**

**You'll know setup is working when:**
- ✅ **No upload errors** in browser console
- ✅ **Images appear** immediately after posting
- ✅ **Files visible** in Cloudinary Media Library
- ✅ **Fast loading** of images in the app
- ✅ **Toast notifications** show upload progress
- ✅ **URLs are properly formatted** Cloudinary URLs

**Your Cloudinary integration will be production-ready!** 🚀