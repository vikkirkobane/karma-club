import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Bell, Shield, Globe, User, Trash2 } from "lucide-react";

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      achievementAlerts: true,
      weeklyDigest: false,
    },
    privacy: {
      showOnLeaderboard: true,
      shareLocation: true,
      publicProfile: true,
      allowMessages: true,
    },
    preferences: {
      language: 'en',
      timezone: 'UTC',
      theme: 'dark',
    }
  });

  const handleSettingChange = (category: string, setting: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, this would upload to cloud storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateUser({ avatarUrl: imageUrl });
        toast({
          title: "Profile Picture Updated",
          description: "Your profile picture has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = () => {
    // In a real app, this would show a confirmation dialog
    toast({
      title: "Account Deletion",
      description: "This feature will be available soon. Please contact support for account deletion.",
      variant: "destructive",
    });
  };

  if (!user) return null;

  return (
    <PageLayout title="SETTINGS">
      <div className="space-y-6">
        {/* Profile Section */}
        <Card className="bg-[#222] text-white border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-emerald-600 rounded-full p-2 cursor-pointer hover:bg-emerald-700">
                  <Camera className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageUpload}
                  />
                </label>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{user.username}</h3>
                <p className="text-gray-400">{user.email}</p>
                <p className="text-sm text-emerald-400">Level {user.level} • {user.tier} Tier</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={user.username}
                  className="bg-gray-800 border-gray-700"
                  onChange={(e) => updateUser({ username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-gray-800 border-gray-700 opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={user.country || ''}
                  placeholder="Enter your country"
                  className="bg-gray-800 border-gray-700"
                  onChange={(e) => updateUser({ country: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="organization">Organization (Optional)</Label>
                <Input
                  id="organization"
                  value={user.organization || ''}
                  placeholder="Enter your organization"
                  className="bg-gray-800 border-gray-700"
                  onChange={(e) => updateUser({ organization: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-[#222] text-white border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-400">Receive notifications on your device</p>
              </div>
              <Switch
                checked={settings.notifications.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'pushNotifications', checked)}
              />
            </div>

            <Separator className="bg-gray-700" />

            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-400">Receive updates via email</p>
              </div>
              <Switch
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
              />
            </div>

            <Separator className="bg-gray-700" />

            <div className="flex items-center justify-between">
              <div>
                <Label>Achievement Alerts</Label>
                <p className="text-sm text-gray-400">Get notified when you earn badges</p>
              </div>
              <Switch
                checked={settings.notifications.achievementAlerts}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'achievementAlerts', checked)}
              />
            </div>

            <Separator className="bg-gray-700" />

            <div className="flex items-center justify-between">
              <div>
                <Label>Weekly Digest</Label>
                <p className="text-sm text-gray-400">Weekly summary of your activities</p>
              </div>
              <Switch
                checked={settings.notifications.weeklyDigest}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'weeklyDigest', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="bg-[#222] text-white border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show on Leaderboard</Label>
                <p className="text-sm text-gray-400">Display your profile on public leaderboards</p>
              </div>
              <Switch
                checked={settings.privacy.showOnLeaderboard}
                onCheckedChange={(checked) => handleSettingChange('privacy', 'showOnLeaderboard', checked)}
              />
            </div>

            <Separator className="bg-gray-700" />

            <div className="flex items-center justify-between">
              <div>
                <Label>Share Location</Label>
                <p className="text-sm text-gray-400">Show your country on your profile</p>
              </div>
              <Switch
                checked={settings.privacy.shareLocation}
                onCheckedChange={(checked) => handleSettingChange('privacy', 'shareLocation', checked)}
              />
            </div>

            <Separator className="bg-gray-700" />

            <div className="flex items-center justify-between">
              <div>
                <Label>Public Profile</Label>
                <p className="text-sm text-gray-400">Allow others to view your profile</p>
              </div>
              <Switch
                checked={settings.privacy.publicProfile}
                onCheckedChange={(checked) => handleSettingChange('privacy', 'publicProfile', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card className="bg-[#222] text-white border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              App Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Language</Label>
                <Select value={settings.preferences.language} onValueChange={(value) => handleSettingChange('preferences', 'language', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Theme</Label>
                <Select value={settings.preferences.theme} onValueChange={(value) => handleSettingChange('preferences', 'theme', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>

          <Button
            onClick={logout}
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            Sign Out
          </Button>

          <Button
            onClick={handleDeleteAccount}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;