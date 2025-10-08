# How to Make a User an Admin

## Quick Reference

### 🎯 Three Methods:
1. **Database (Production)** - Modify user directly in database
2. **Code (Development)** - Hardcode admin status for testing
3. **Demo Account** - Already configured as admin

---

## Method 1: Using the Database (Recommended) ✅

### Step 1: Add Admin Columns to Database

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- Add admin fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
```

### Step 2: Make a User Admin

**Option A: By Email**
```sql
UPDATE profiles 
SET is_admin = TRUE, 
    role = 'admin' 
WHERE email = 'your-email@example.com';
```

**Option B: By User ID**
```sql
UPDATE profiles 
SET is_admin = TRUE, 
    role = 'admin' 
WHERE id = 'user-uuid-here';
```

**Option C: By Username**
```sql
UPDATE profiles 
SET is_admin = TRUE, 
    role = 'admin' 
WHERE username = 'JohnDoe';
```

### Step 3: Verify Admin Status

```sql
-- Check if user is admin
SELECT id, username, email, is_admin, role 
FROM profiles 
WHERE email = 'your-email@example.com';

-- List all admins
SELECT id, username, email, is_admin, role 
FROM profiles 
WHERE is_admin = TRUE OR role = 'admin';
```

### Step 4: Remove Admin Access

```sql
UPDATE profiles 
SET is_admin = FALSE, 
    role = 'user' 
WHERE email = 'user-email@example.com';
```

---

## Method 2: Hardcode in Development 🔧

For testing purposes, you can hardcode admin access in the code.

### Option A: Modify Demo User (Already Done)

The demo user is already an admin:
- **Email**: `demo@karmaclub.org`
- **Password**: `demo123`

### Option B: Add Your Email to Demo Check

Edit `src/contexts/AuthContext.tsx`:

```typescript
const login = async (email: string, password: string) => {
  setIsLoading(true);
  try {
    // Add your email here for instant admin access
    const adminEmails = [
      'demo@karmaclub.org',
      'your-email@example.com',  // Add your email
      'admin@karmaclub.org'       // Add more emails
    ];
    
    if (adminEmails.includes(email)) {
      const adminUser: User = {
        id: email,
        username: email.split('@')[0],
        email: email,
        // ... other fields
        isAdmin: true,
        role: 'admin',
        // ... stats
      };
      setUser(adminUser);
      return;
    }
    
    // Regular login flow...
  }
}
```

### Option C: Force All Users to be Admin (Testing Only!)

Edit `src/contexts/AuthContext.tsx` in the `loadUserProfile` function:

```typescript
const userData: User = {
  // ... other fields
  isAdmin: true,  // Force everyone to be admin
  role: 'admin',
  // ... rest of fields
};
```

**⚠️ Remember to remove this before production!**

---

## Method 3: Use the Demo Account 🎮

**Already configured and ready to use:**

1. **Login with demo account:**
   - Email: `demo@karmaclub.org`
   - Password: `demo123`

2. **Navigate to Profile:**
   - Go to `/profile` page
   - You'll see the purple admin card

3. **Access Admin Dashboard:**
   - Click "Open Dashboard" button
   - You're now in the admin panel

---

## 🔍 How to Check if a User is Admin

### In Your Code:

```typescript
import { useAuth } from "@/contexts/AuthContext";

const MyComponent = () => {
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.isAdmin || user?.role === 'admin';
  
  if (isAdmin) {
    // Show admin features
  }
  
  return (
    <>
      {isAdmin && (
        <AdminButton />
      )}
    </>
  );
};
```

### In the Database:

```sql
SELECT 
  username,
  email,
  is_admin,
  role,
  created_at
FROM profiles
WHERE email = 'user@example.com';
```

---

## 📋 Step-by-Step: Making Yourself Admin

### If You Have a Supabase Account:

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click "SQL Editor" in the left sidebar

2. **Run the setup SQL**
   - Copy the SQL from `database/add_admin_fields.sql`
   - Paste and execute

3. **Make yourself admin**
   ```sql
   UPDATE profiles 
   SET is_admin = TRUE, role = 'admin' 
   WHERE email = 'YOUR_EMAIL@example.com';
   ```

4. **Log out and log back in**
   - Your admin status will now load

5. **Check your profile page**
   - You should see the purple admin card

### If You Don't Have Database Access:

Use the demo account:
- Email: `demo@karmaclub.org`
- Password: `demo123`

---

## 🎨 Visual Indicators

When you're an admin, you'll see:

### On Profile Page:
```
┌─────────────────────────────────┐
│  Your User Info                 │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│  🛡️ Admin Access (Purple Card)  │
│                                 │
│  "Open Dashboard" button        │
└─────────────────────────────────┘
```

### Console Verification:
```javascript
// Open browser console
console.log(user);
// Should show:
// { 
//   ...
//   isAdmin: true,
//   role: "admin"
//   ...
// }
```

---

## 🛠️ Troubleshooting

### Admin Button Not Showing?

**1. Check user object in console:**
```javascript
// Add to Profile.tsx temporarily
console.log('User:', user);
console.log('Is Admin?', user?.isAdmin);
console.log('Role:', user?.role);
```

**2. Verify database columns exist:**
```sql
-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
```

**3. Clear cache and re-login:**
- Log out
- Clear browser cache (Ctrl+Shift+Delete)
- Log back in

**4. Check database value:**
```sql
SELECT * FROM profiles WHERE email = 'your-email@example.com';
```

### Admin Status Not Loading?

**Verify AuthContext is loading it:**
```typescript
// In AuthContext.tsx, add console.log
const userData: User = {
  // ...
  isAdmin: profile.is_admin || false,
  role: profile.role || 'user',
};
console.log('Loaded user with admin status:', userData.isAdmin);
```

---

## 🔐 Security Best Practices

### Production Recommendations:

1. **Protect Admin Routes:**
```typescript
<Route path="/admin" element={
  <ProtectedRoute requireAdmin={true}>
    <Admin />
  </ProtectedRoute>
} />
```

2. **Verify on Backend:**
```typescript
// In your API endpoints
const checkAdmin = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('is_admin, role')
    .eq('id', userId)
    .single();
    
  return data?.is_admin || data?.role === 'admin';
};
```

3. **Use Row Level Security (RLS):**
```sql
-- Only admins can update admin status
CREATE POLICY "Only admins can modify admin status"
ON profiles
FOR UPDATE
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);
```

---

## 📊 Quick Commands Reference

```sql
-- Make user admin
UPDATE profiles SET is_admin = TRUE, role = 'admin' WHERE email = 'user@example.com';

-- Remove admin
UPDATE profiles SET is_admin = FALSE, role = 'user' WHERE email = 'user@example.com';

-- List all admins
SELECT username, email FROM profiles WHERE is_admin = TRUE;

-- Check specific user
SELECT * FROM profiles WHERE email = 'user@example.com';

-- Count total admins
SELECT COUNT(*) FROM profiles WHERE is_admin = TRUE;
```

---

## ✅ Verification Checklist

After making a user admin:

- [ ] Database shows `is_admin = TRUE` and `role = 'admin'`
- [ ] User logs out and logs back in
- [ ] Purple admin card appears on profile page
- [ ] "Open Dashboard" button is visible
- [ ] Clicking button navigates to `/admin`
- [ ] Admin dashboard loads successfully

---

## 🎯 Summary

**Easiest Method**: Use demo account (`demo@karmaclub.org` / `demo123`)

**Best Method for Production**: 
```sql
UPDATE profiles 
SET is_admin = TRUE, role = 'admin' 
WHERE email = 'your-email@example.com';
```

**Development Testing**: Hardcode in `AuthContext.tsx`

---

**Need help?** Check the troubleshooting section above or verify the database values directly.
