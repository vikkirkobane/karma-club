import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { 
  getUserProfileSchemaAware, 
  updateUserProfileSchemaAware,
  createProfileSchemaAware
} from '@/lib/auth-helpers';

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  avatar_url?: string; // Support both naming conventions
  country?: string;
  countryCode?: string;
  organization?: string;
  level: number;
  points: number;
  tier: string;
  badges: string[];
  joinDate: string;
  isAdmin?: boolean; // Admin flag
  role?: 'admin' | 'user'; // Role-based access
  stats: {
    totalActivities: number;
    dailyStreak: number;
    dailyCompleted: number;
    volunteerCompleted: number;
    engagementCompleted: number;
    supportCompleted: number;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Partial<User> & { email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      // Use the schema-aware helper to get user profile
      const profile = await getUserProfileSchemaAware(userId);

      if (profile) {
        const userData: User = {
          id: profile.id,
          username: profile.username || 'User',
          email: profile.email || '',
          avatarUrl: profile.avatar_url,
          avatar_url: profile.avatar_url,
          // Provide client-side defaults for fields not in database
          level: 1,
          points: 0,
          tier: 'Member',
          country: profile.country,
          countryCode: profile.country_code || profile.countryCode || '', // Handle both naming conventions and provide default
          organization: profile.organization,
          joinDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
          // Load admin status from database - check for both possible field names
          isAdmin: profile.is_admin || profile.isAdmin || false,
          role: profile.role || profile.user_role || 'user', // Handle possible different field names
          badges: ['newcomer'],
          stats: {
            totalActivities: 0,
            dailyStreak: 0,
            dailyCompleted: 0,
            volunteerCompleted: 0,
            engagementCompleted: 0,
            supportCompleted: 0
          }
        };
        setUser(userData);
        // Persist user to localStorage
        localStorage.setItem('karma_club_user', JSON.stringify(userData));
      } else {
        // Profile doesn't exist in DB, but user is authenticated, so create a default one
        // This might fail due to RLS, so we handle it gracefully
        console.log('No profile found for user, attempting to create default profile...');
        
        // For new users, we rely on the Supabase auth trigger to create the profile
        // If that didn't work, we'll use a fallback user until they update their profile
        const fallbackUser: User = {
          id: userId,
          username: 'New User', // Will be updated when they edit profile
          email: '', // Will be populated when profile is available
          avatarUrl: '/placeholder.svg',
          avatar_url: '/placeholder.svg',
          level: 1,
          points: 0,
          tier: 'Member',
          country: '',
          countryCode: '',
          organization: '',
          joinDate: new Date().toLocaleDateString(),
          isAdmin: false,
          role: 'user',
          badges: ['newcomer'],
          stats: {
            totalActivities: 0,
            dailyStreak: 0,
            dailyCompleted: 0,
            volunteerCompleted: 0,
            engagementCompleted: 0,
            supportCompleted: 0
          }
        };
        setUser(fallbackUser);
        localStorage.setItem('karma_club_user', JSON.stringify(fallbackUser));
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      // Fall back to demo user for development
      const mockUser: User = {
        id: "user1",
        username: "KindnessWarrior",
        email: "demo@karmaclub.org",
        avatarUrl: "/placeholder.svg",
        avatar_url: "/placeholder.svg",
        level: 12,
        points: 345,
        tier: "Gold",
        country: "United States",
        countryCode: "US",
        organization: "Red Cross",
        joinDate: "Jan 15, 2023",
        badges: ["daily-streak-30", "volunteer-pro", "engagement-master", "gold-tier", "activity-100"],
        stats: {
          totalActivities: 127,
          dailyStreak: 32,
          dailyCompleted: 94,
          volunteerCompleted: 17,
          engagementCompleted: 8,
          supportCompleted: 8
        }
      };
      setUser(mockUser);
    }
  }, []);

  useEffect(() => {
    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        // Check for persisted demo user first (instant load)
        const persistedUser = localStorage.getItem('karma_club_user');
        if (persistedUser) {
          try {
            const user = JSON.parse(persistedUser);
            setUser(user);
            setIsLoading(false);
            setIsInitialized(true);
            console.log('Loaded user from localStorage');
            return;
          } catch (e) {
            console.warn('Invalid persisted user data, clearing...');
            localStorage.removeItem('karma_club_user');
          }
        }

        // Check if Supabase is properly configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const hasSupabaseConfig = supabaseUrl && supabaseUrl !== 'your-supabase-url';
        
        if (hasSupabaseConfig) {
          // Try to get Supabase session with timeout (10 seconds)
          const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout')), 10000)
          );

          const sessionPromise = supabase.auth.getSession();
          type SessionResult = { data: { session: { user: { id: string } } } };
          const result = await Promise.race([sessionPromise, timeout]) as SessionResult;
          
          if (result?.data?.session?.user) {
            // Load user profile with database schema compatibility checks
            await loadUserProfile(result.data.session.user.id);
          } else {
            // No session found - user needs to login
            console.log('No active session found');
          }
        } else {
          // Supabase not configured - demo mode only
          console.log('Supabase not configured, using demo mode');
        }
      } catch (error: unknown) {
        // Handle timeout or other errors gracefully
        if (error.message?.includes('timeout')) {
          console.warn('Session check timed out - proceeding to login');
        } else {
          console.error('Error getting initial session:', error);
        }
        
        // Create a demo user if no session and no stored user exists
        if (!localStorage.getItem('karma_club_user')) {
          console.log('Creating demo user for development');
          const demoUser: User = {
            id: 'demo-user-123',
            email: 'demo@karmaclub.app',
            username: 'DemoUser',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b95c?w=150&h=150&fit=crop&crop=face',
            level: 1,
            points: 150,
            tier: 'Bronze',
            country: 'United States',
            countryCode: '🇺🇸',
            organization: 'Karma Club Community',
            joinDate: new Date().toLocaleDateString(),
            isAdmin: false,
            role: 'user',
            badges: ['newcomer', 'first-activity'],
            stats: {
              totalActivities: 5,
              dailyStreak: 3,
              dailyCompleted: 2,
              volunteerCompleted: 1,
              engagementCompleted: 1,
              supportCompleted: 1
            }
          };
          setUser(demoUser);
          localStorage.setItem('karma_club_user', JSON.stringify(demoUser));
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Load user profile with database schema compatibility checks
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('karma_club_user');
      }
    });

    return () => {
      try {
        subscription.unsubscribe();
      } catch (err) {
        console.warn('Error unsubscribing from auth state changes:', err);
      }
    };
  }, [loadUserProfile]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Demo account bypass for testing
      if (email === 'demo@karmaclub.org' && password === 'demo123') {
        const demoUser: User = {
          id: "demo-user",
          username: "Demo User",
          email: "demo@karmaclub.org",
          avatarUrl: "/placeholder.svg",
          avatar_url: "/placeholder.svg",
          level: 5,
          points: 250,
          tier: "Gold",
          country: "United States",
          countryCode: "US",
          organization: "Demo Organization",
          joinDate: new Date().toLocaleDateString(),
          isAdmin: true, // Demo user has admin access
          role: "admin",
          badges: ["newcomer", "daily-streak-7", "volunteer-pro"],
          stats: {
            totalActivities: 25,
            dailyStreak: 7,
            dailyCompleted: 15,
            volunteerCompleted: 5,
            engagementCompleted: 3,
            supportCompleted: 2
          }
        };
        setUser(demoUser);
        // Persist demo user to localStorage
        localStorage.setItem('karma_club_user', JSON.stringify(demoUser));
        return;
      }

      // Check if Supabase is properly configured before attempting login
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl === 'your-supabase-url' || !supabaseAnonKey || supabaseAnonKey === 'your-supabase-anon-key') {
        console.warn('Supabase not properly configured, falling back to demo mode');
        // Fallback to demo mode if Supabase isn't configured
        const demoUser: User = {
          id: "demo-user",
          username: "Demo User",
          email: email || "demo@karmaclub.org",
          avatarUrl: "/placeholder.svg",
          avatar_url: "/placeholder.svg",
          level: 1,
          points: 0,
          tier: "Member",
          country: "United States",
          countryCode: "US",
          organization: "Demo Organization",
          joinDate: new Date().toLocaleDateString(),
          isAdmin: false,
          role: "user",
          badges: ["newcomer"],
          stats: {
            totalActivities: 0,
            dailyStreak: 0,
            dailyCompleted: 0,
            volunteerCompleted: 0,
            engagementCompleted: 0,
            supportCompleted: 0
          }
        };
        setUser(demoUser);
        localStorage.setItem('karma_club_user', JSON.stringify(demoUser));
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If it's an invalid credentials error, check if it's because of email confirmation
        // but we want to provide a helpful message that also suggests the demo account
        if (error.message?.includes('Invalid login credentials')) {
          // Try to check if user exists but email is not confirmed
          try {
            const { data: userCheck, error: userCheckError } = await supabase
              .from('auth.users')
              .select('email_confirmed_at, id')
              .eq('email', email)
              .single();
              
            if (userCheck && !userCheck.email_confirmed_at) {
              throw new Error('Your email has not been confirmed. Please check your email and click the confirmation link. For a demo account, use email: demo@karmaclub.org and password: demo123');
            }
          } catch (checkError) {
            // If the check fails, just throw the original error with demo info
            throw new Error('Invalid email or password. For a demo account, use email: demo@karmaclub.org and password: demo123');
          }
        }
        throw error;
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      // Provide more specific error messages
      if (error.message?.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before logging in.');
      } else if (error.message?.includes('Invalid login credentials')) {
        // Provide helpful message about demo account
        throw new Error('Invalid email or password. For a demo account, use email: demo@karmaclub.org and password: demo123');
      } else if (error.message?.includes('NetworkError')) {
        throw new Error('Unable to connect to authentication service. Check your internet connection.');
      } else if (error.message?.includes('400')) {
        throw new Error('Authentication service error. The Supabase configuration might be incorrect or you may need to confirm your email.');
      } else {
        throw new Error(error.message || 'Login failed. Please try again or use the demo account (demo@karmaclub.org / demo123).');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: Partial<User> & { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        // Check if it's an email validation error
        if (error.message?.includes('validation')) {
          throw new Error('Please enter a valid email address.');
        }
        throw error;
      }

      if (data.user) {
        // The profile will be automatically created by the Supabase trigger function
        // when the user confirms their email. We just need to wait for that.
        // For now, we'll show a message that the user needs to confirm their email.
        console.log('User created, please check email for confirmation:', data.user.email);
        
        // Create a temporary user object in localStorage to maintain session
        const tempUser: User = {
          id: data.user.id,
          email: userData.email,
          username: userData.username || userData.email.split('@')[0] || 'New User',
          avatarUrl: '/placeholder.svg',
          level: 1,
          points: 0,
          tier: 'Member',
          country: userData.country || '',
          countryCode: userData.countryCode || '',
          organization: userData.organization || '',
          joinDate: new Date().toLocaleDateString(),
          isAdmin: false,
          role: 'user',
          badges: ['newcomer'],
          stats: {
            totalActivities: 0,
            dailyStreak: 0,
            dailyCompleted: 0,
            volunteerCompleted: 0,
            engagementCompleted: 0,
            supportCompleted: 0
          }
        };
        
        setUser(tempUser);
        localStorage.setItem('karma_club_user', JSON.stringify(tempUser));
        
        // If the user provided additional profile info, try to create/update their profile
        // using the schema-aware helper
        if (userData.username || userData.country || userData.organization || userData.countryCode) {
          try {
            const profileData = {
              username: userData.username || userData.email.split('@')[0],
              country: userData.country,
              organization: userData.organization,
              country_code: userData.countryCode,
              avatar_url: '/placeholder.svg',
              email: userData.email
            };
            
            // Attempt to create the profile with provided data using schema-aware approach
            await createProfileSchemaAware(data.user.id, profileData);
          } catch (profileError) {
            console.warn('Could not create profile immediately (this is expected if RLS prevents it):', profileError);
            // This is fine - the profile will be created by the auth trigger function
            // on email confirmation, or the user can update it later
          }
        }
      }
    } catch (error: unknown) {
      console.error('Signup error:', error);
      if (error.message?.includes('already registered')) {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      } else if (error.message?.includes('password')) {
        throw new Error('Password does not meet requirements. Please use at least 6 characters.');
      } else {
        throw new Error(error.message || 'Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    // Clear persisted user data
    localStorage.removeItem('karma_club_user');
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      // Ensure both avatarUrl and avatar_url are synced
      if (userData.avatarUrl) {
        updatedUser.avatar_url = userData.avatarUrl;
      }
      if (userData.avatar_url) {
        updatedUser.avatarUrl = userData.avatar_url;
      }
      
      setUser(updatedUser);

      // Update in Supabase only if the fields exist in the database schema
      try {
        // Only include fields that actually exist in the database
        let dbUpdateData: any = {};
        
        if (userData.username !== undefined) dbUpdateData.username = updatedUser.username;
        if (userData.avatarUrl !== undefined || userData.avatar_url !== undefined) {
          dbUpdateData.avatar_url = updatedUser.avatar_url;
        }
        if (userData.country !== undefined) dbUpdateData.country = updatedUser.country;
        if (userData.countryCode !== undefined) dbUpdateData.country_code = updatedUser.countryCode;
        if (userData.organization !== undefined) dbUpdateData.organization = updatedUser.organization;
        
        // Only attempt database update if there are fields to update
        if (Object.keys(dbUpdateData).length > 0) {
          // Use the schema-aware helper to update user profile
          const success = await updateUserProfileSchemaAware(user.id, dbUpdateData);
          if (!success) {
            console.error('Failed to update user profile in database');
          }
        }
      } catch (error) {
        console.error('Error updating user in database:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isLoading: isLoading && !isInitialized  // Only loading if both conditions are true
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};