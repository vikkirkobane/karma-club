# ✅ Cloudinary Setup Checklist for Karma Club

## 🎯 **Quick Setup Verification**

Use this checklist to ensure your Cloudinary integration is working perfectly.

## 📋 **Step-by-Step Checklist**

### **Step 1: Verify Environment Variables**
Open your browser console and run:
```javascript
console.log('Cloud Name:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
console.log('Upload Preset:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
```

**Expected Output:**
```
✅ Cloud Name: dyedachrz
✅ Upload Preset: karma-club-uploads
```

**If you see `undefined`:**
- [ ] Check your `.env` file has the correct variables
- [ ] Restart your development server
- [ ] Ensure variables start with `VITE_`

### **Step 2: Cloudinary Dashboard Configuration**

**Login to Cloudinary:**
1. [ ] Go to [Cloudinary Console](https://console.cloudinary.com/)
2. [ ] Verify you're in the `dyedachrz` cloud
3. [ ] Navigate to **Settings** → **Upload** tab

**Check Upload Preset:**
4. [ ] Look for preset named `karma-club-uploads`
5. [ ] If not found, click **"Add upload preset"**

**Preset Configuration (CRITICAL):**
```
✅ Preset name: karma-club-uploads
✅ Signing mode: Unsigned (MUST be unsigned for client-side)
✅ Use filename: false
✅ Unique filename: true
✅ Overwrite: false
✅ Resource type: Auto
✅ Access mode: Public
✅ Max file size: 10485760 (10MB)
✅ Folder: karma-club/submissions (optional but recommended)
```

### **Step 3: Test Upload Functionality**

**In Your App:**
1. [ ] Navigate to `/community` page
2. [ ] Click **"Share an Act of Kindness"**
3. [ ] Click **"Add Photo/Video"**
4. [ ] Select a small image (< 5MB)
5. [ ] Type some content
6. [ ] Click **"Share Your Kindness"**

**Expected Behavior:**
- [ ] Toast shows "Uploading media..."
- [ ] Toast shows "Post shared! 🎉"
- [ ] Image appears in your post immediately
- [ ] No errors in browser console

### **Step 4: Verify in Cloudinary Dashboard**

**Check Media Library:**
1. [ ] Go to **Media Library** in Cloudinary
2. [ ] Look for folder: `karma-club/submissions/`
3. [ ] Verify your uploaded image is there
4. [ ] Click on image to see details and URL

**Expected URL Format:**
```
✅ https://res.cloudinary.com/dyedachrz/image/upload/v[timestamp]/karma-club/submissions/[filename]
```

### **Step 5: Test Error Handling**

**Test File Size Limit:**
1. [ ] Try uploading a file > 10MB
2. [ ] Should see error: "File is too large. Please use a file smaller than 10MB."

**Test File Type Restriction:**
1. [ ] Try uploading a .txt or .pdf file
2. [ ] Should see error: "Unsupported file type. Please use JPG, PNG, GIF, or MP4 files."

## 🔧 **Configuration Test Component**

Add this temporary component to test configuration:

```tsx
import { CloudinaryTest } from '@/components/CloudinaryTest';

// Add to any page for testing
<CloudinaryTest />
```

**Expected Results:**
- [ ] Configuration Status shows ✅ for both values
- [ ] Test button is enabled
- [ ] Test passes with "Test Passed!" message

## 🚨 **Common Issues & Solutions**

### **Issue: "Upload preset not found"**
```
❌ Error: Upload preset "karma-club-uploads" not found
```
**Solution:**
1. Create upload preset in Cloudinary dashboard
2. Ensure name matches exactly: `karma-club-uploads`
3. Set to "Unsigned" mode

### **Issue: "Upload unauthorized"**
```
❌ Error: Upload unauthorized (401)
```
**Solution:**
1. Check upload preset is set to **"Unsigned"** mode
2. Verify cloud name is correct in .env file

### **Issue: "Invalid cloud name"**
```
❌ Error: Upload failed (404)
```
**Solution:**
1. Find your actual cloud name in Cloudinary dashboard
2. Update `VITE_CLOUDINARY_CLOUD_NAME` in .env file
3. Restart development server

### **Issue: Environment variables undefined**
```
❌ Cloud Name: undefined
❌ Upload Preset: undefined
```
**Solution:**
1. Check .env file exists in project root
2. Ensure variables start with `VITE_`
3. Restart development server after changes

## 📊 **Current Configuration Status**

**Your .env file should contain:**
```env
# Cloudinary Configuration (Client-side upload)
VITE_CLOUDINARY_CLOUD_NAME=dyedachrz
VITE_CLOUDINARY_UPLOAD_PRESET=karma-club-uploads
```

**Cloudinary Upload Preset Settings:**
```
Name: karma-club-uploads
Mode: Unsigned ⚠️ (Critical for security)
Folder: karma-club/submissions
Max Size: 10MB
Formats: jpg, png, gif, mp4
```

## ✨ **Success Indicators**

**You'll know setup is complete when:**
- [ ] ✅ Environment variables load correctly
- [ ] ✅ Upload preset exists and is unsigned
- [ ] ✅ Test uploads work without errors
- [ ] ✅ Images appear in posts immediately
- [ ] ✅ Files show up in Cloudinary Media Library
- [ ] ✅ Error handling works for invalid files
- [ ] ✅ URLs follow expected format
- [ ] ✅ No console errors during upload

## 🎉 **Final Verification**

**Test the complete workflow:**
1. [ ] **Community Post**: Upload image with post → Success
2. [ ] **Activity Submission**: Upload photo with activity → Success  
3. [ ] **Error Handling**: Try invalid file → Proper error message
4. [ ] **Performance**: Images load quickly in app
5. [ ] **Organization**: Files organized in correct folder

**When all checkboxes are ✅, your Cloudinary integration is production-ready!** 🚀

## 📞 **Get Help**

**If you encounter issues:**
1. Check browser console for specific error messages
2. Verify upload preset configuration in Cloudinary
3. Test with small image files (< 1MB) first
4. Use the CloudinaryTest component for debugging

**Common settings to double-check:**
- Upload preset name: `karma-club-uploads`
- Signing mode: `Unsigned`
- Cloud name: `dyedachrz`
- Resource type: `Auto`
- Max file size: `10485760` (10MB)

Your Cloudinary media upload functionality will be fully operational! 📸✨