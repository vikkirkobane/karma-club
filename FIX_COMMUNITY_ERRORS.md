# Fix Community Feature Errors

## Problem
The app is showing 404 errors when trying to access community features because the required database tables don't exist:

```
hjiqtjcqdjikmsybfuve.supabase.co/rest/v1/community_posts?select=...  Failed to load resource: the server responded with a status of 404 ()
hjiqtjcqdjikmsybfuve.supabase.co/rest/v1/rpc/toggle_post_like:1  Failed to load resource: the server responded with a status of 404 ()
```

## Solution

### Step 1: Set up Community Tables in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: `hjiqtjcqdjikmsybfuve`
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the entire contents of `setup-community-features.sql` 
6. Paste it into the SQL editor
7. Click "Run" to execute the script

### Step 2: Verify the Setup

After running the SQL script, you should see:
- `community_posts` table created
- `post_likes` table created  
- `toggle_post_like` function created
- Policies and triggers configured

### Step 3: Test the Application

1. Restart your development server if it's running
2. The community feature errors should now be resolved
3. You should be able to use like/unlike functionality without 404 errors

## What We Fixed

1. **Added graceful error handling** - The app now shows helpful warnings instead of crashing when tables don't exist
2. **Created database setup script** - Easy one-click setup for all community features
3. **Fixed Dialog accessibility warning** - Added proper aria-describedby handling

## Other Errors Addressed

- **Dialog accessibility warning**: Fixed by adding proper ARIA description handling
- **Grammarly extension errors**: These are harmless browser extension conflicts that don't affect functionality

The main functionality (activity submissions, points, etc.) was working fine - only the community features needed database setup.