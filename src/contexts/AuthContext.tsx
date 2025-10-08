import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading user profile:', error);
        return;
      }

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
          countryCode: profile.country_code,
          organization: profile.organization,
          joinDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
          // Load admin status from database
          isAdmin: profile.is_admin || false,
          role: profile.role || 'user',
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
        // Create default profile for new user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const newProfile = {
            id: authUser.id,
            email: authUser.email,
            username: authUser.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString()
            // Note: other fields will be handled client-side
          };

          const { error: insertError } = await supabase
            .from('profiles')
            .insert([newProfile]);

          if (!insertError) {
            await loadUserProfile(authUser.id);
          }
        }
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      // Fall back to mock user for development
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
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
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
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else {
        throw new Error(error.message || 'Login failed. Please try again.');
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
        throw error;
      }

      if (data.user) {
        // Create user profile with only fields that exist in the database
        const profileData = {
          id: data.user.id,
          email: userData.email,
          username: userData.username || userData.email.split('@')[0],
          country: userData.country,
          country_code: userData.countryCode,
          organization: userData.organization,
          created_at: new Date().toISOString()
          // Note: level, points, tier, badges, and stats will be handled client-side
          // until the database schema includes these fields
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        await loadUserProfile(data.user.id);
      }
    } catch (error: unknown) {
      console.error('Signup error:', error);
      if (error.message?.includes('already registered')) {
        throw new Error('An account with this email already exists. Please try logging in instead.');
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
        const dbUpdateData: Partial<User> = {};
        
        if (userData.username !== undefined) dbUpdateData.username = updatedUser.username;
        if (userData.avatarUrl !== undefined || userData.avatar_url !== undefined) {
          dbUpdateData.avatar_url = updatedUser.avatar_url;
        }
        if (userData.country !== undefined) dbUpdateData.country = updatedUser.country;
        if (userData.countryCode !== undefined) dbUpdateData.country_code = updatedUser.countryCode;
        if (userData.organization !== undefined) dbUpdateData.organization = updatedUser.organization;
        
        // Only attempt database update if there are fields to update
        if (Object.keys(dbUpdateData).length > 0) {
          const { error } = await supabase
            .from('profiles')
            .update(dbUpdateData)
            .eq('id', user.id);

          if (error) {
            console.error('Error updating user profile:', error);
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