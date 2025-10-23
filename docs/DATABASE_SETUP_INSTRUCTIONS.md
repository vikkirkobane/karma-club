# Database Schema Update Instructions

This guide explains how to update your Supabase database schema to fix authentication and other database-related errors in the Karma Club application.

## Why This Update is Needed

The application code expects certain database columns and configurations that may not exist in the currently deployed database schema. This causes errors like:
- "Could not find the 'country_code' column" 
- "new row violates row-level security policy"
- Authentication failures when loading user profiles

## SQL Files Included

1. `profiles-table-update.sql` - Updates the profiles table with missing columns
2. `complete-database-update.sql` - Complete schema update including all necessary changes
3. `profiles-table-update-fixed.sql` - Fixed version that handles existing policies
4. `complete-database-update-fixed.sql` - Fixed complete update that handles existing policies

## How to Apply the Schema Update

### Option 1: Complete Update (Recommended)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/)
2. Select your project
3. Navigate to the "SQL Editor" section
4. Copy and paste the contents of `complete-database-update-fixed.sql` (this handles existing policies)
5. Click "Run" to execute the script

### Option 2: Step-by-Step Update
1. Use `profiles-table-update-fixed.sql` if you only need to fix authentication issues
2. Follow the same steps as above

### Note on Policy Conflicts
If you previously ran community setup SQL that created policies, use the "-fixed" versions of the files as they properly handle existing policies by dropping them first before creating new ones.

## Important Notes

- This update will add missing columns to your existing `profiles` table
- It will update Row Level Security (RLS) policies to match what the application expects
- It includes an optional section to create a demo user (uncomment if needed)
- The demo user credentials are: 
  - Email: `demo@karmaclub.org`
  - Password: `demo123`

## After Applying the Update

1. Restart your local development server
2. Clear your browser's local storage to remove any cached user data
3. Try logging in again with your credentials or use the demo account

## Troubleshooting

If you still encounter issues after the update:

1. Check that your `.env` variables are properly set
2. Verify that your Supabase URL and API key are correct
3. Make sure you're using the correct database connection settings
4. Check your Supabase project's authentication settings