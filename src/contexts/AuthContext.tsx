import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  country?: string;
  countryCode?: string;
  organization?: string;
  level: number;
  points: number;
  tier: string;
  badges: string[];
  joinDate: string;
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

  // Mock authentication - in real app, this would connect to your backend
  useEffect(() => {
    // Check if user is logged in (e.g., from localStorage)
    const savedUser = localStorage.getItem('karma-club-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: "user1",
        username: "KindnessWarrior",
        email: email,
        avatarUrl: "/placeholder.svg",
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
      localStorage.setItem('karma-club-user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: Partial<User> & { email: string; password: string }) => {
    setIsLoading(true);
    try {
      // Mock signup - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: `user_${Date.now()}`,
        username: userData.username || 'NewUser',
        email: userData.email,
        avatarUrl: userData.avatarUrl || "/placeholder.svg",
        level: 1,
        points: 0,
        tier: "Member",
        country: userData.country,
        countryCode: userData.countryCode,
        organization: userData.organization,
        joinDate: new Date().toLocaleDateString(),
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
      
      setUser(newUser);
      localStorage.setItem('karma-club-user', JSON.stringify(newUser));
    } catch (error) {
      throw new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('karma-club-user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('karma-club-user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};