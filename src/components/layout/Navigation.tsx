import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Home, 
  ClipboardList, 
  Users, 
  User, 
  TrendingUp, 
  Menu, 
  LogOut, 
  Settings 
} from "lucide-react";

interface NavigationProps {
  title: string;
}

export const Navigation: React.FC<NavigationProps> = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/karma-club-full', label: 'Activities', icon: ClipboardList },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/leaderboard', label: 'Rankings', icon: TrendingUp },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-emerald-600 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <span className="text-white text-xl font-bold">{title}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl || user?.avatar_url} alt={user?.username} />
                  <AvatarFallback className="bg-emerald-700 text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-white">{user?.username}</p>
                  <p className="w-[200px] truncate text-sm text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem 
                className="text-white hover:bg-gray-700"
                onClick={() => navigate('/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-white hover:bg-gray-700"
                onClick={() => navigate('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem 
                className="text-red-400 hover:bg-gray-700"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-900 text-white border-l border-gray-700">
              <SheetHeader>
                <SheetTitle className="text-white">Navigation</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start ${
                        isActive 
                          ? 'bg-emerald-600 text-white' 
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Bottom Navigation for Mobile - Fixed at bottom */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#222] text-white py-2 border-t border-gray-700 md:hidden z-50">
        <div className="flex justify-around items-center">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center p-2 transition-colors ${
                  isActive ? 'text-emerald-500' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </footer>
    </>
  );
};