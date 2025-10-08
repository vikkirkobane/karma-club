import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Save } from "lucide-react";
import { ActivityType, Activity } from "@/types/activities";
import {
  dailyActivities,
  volunteerActivities,
  engagementActivities,
  supportActivities
} from "@/data/activities";

interface ActivityFormData {
  title: string;
  description: string;
  points: number;
  category: ActivityType | '';
  imageUrl: string;
}

export const ActivityManagement: React.FC = () => {
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    description: '',
    points: 1,
    category: '',
    imageUrl: '/placeholder.svg'
  });

  const [activities, setActivities] = useState({
    daily: [...dailyActivities],
    engagement: [...engagementActivities],
    volunteer: [...volunteerActivities],
    support: [...supportActivities]
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Generate unique ID
  const generateId = (category: string) => {
    const categoryActivities = activities[category as keyof typeof activities];
    const maxId = categoryActivities.reduce((max, activity) => {
      const num = parseInt(activity.id.split('-')[1]) || 0;
      return Math.max(max, num);
    }, 0);
    return `${category}-${maxId + 1}`;
  };

  const handleInputChange = (field: keyof ActivityFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateActivity = () => {
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Activity title is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Activity description is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive"
      });
      return;
    }

    if (formData.points < 1 || formData.points > 10) {
      toast({
        title: "Validation Error",
        description: "Points must be between 1 and 10",
        variant: "destructive"
      });
      return;
    }

    // Create new activity
    const newActivity: Activity = {
      id: generateId(formData.category),
      title: formData.title,
      description: formData.description,
      points: formData.points,
      isCompleted: false,
      imageUrl: formData.imageUrl || '/placeholder.svg'
    };

    // Add to appropriate category
    const categoryKey = formData.category as keyof typeof activities;
    setActivities(prev => ({
      ...prev,
      [categoryKey]: [...prev[categoryKey], newActivity]
    }));

    toast({
      title: "Activity Created!",
      description: `"${formData.title}" has been added to ${formData.category} activities.`
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      points: 1,
      category: '',
      imageUrl: '/placeholder.svg'
    });
    setShowForm(false);
  };

  const handleDeleteActivity = (category: keyof typeof activities, activityId: string) => {
    setActivities(prev => ({
      ...prev,
      [category]: prev[category].filter(a => a.id !== activityId)
    }));

    toast({
      title: "Activity Deleted",
      description: "Activity has been removed successfully."
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      daily: 'Daily Acts',
      volunteer: 'Volunteerism',
      engagement: 'Engagement',
      support: 'Support'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      daily: 'bg-emerald-900',
      volunteer: 'bg-blue-900',
      engagement: 'bg-purple-900',
      support: 'bg-orange-900'
    };
    return colors[category] || 'bg-gray-900';
  };

  const totalActivities = Object.values(activities).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-[#222] text-white border-none">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalActivities}</div>
            <div className="text-sm text-gray-400">Total Activities</div>
          </CardContent>
        </Card>
        
        <Card className="bg-emerald-900 text-white border-none">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{activities.daily.length}</div>
            <div className="text-sm">Daily Acts</div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-900 text-white border-none">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{activities.engagement.length}</div>
            <div className="text-sm">Engagement</div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-900 text-white border-none">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{activities.volunteer.length}</div>
            <div className="text-sm">Volunteerism</div>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-900 text-white border-none">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{activities.support.length}</div>
            <div className="text-sm">Support</div>
          </CardContent>
        </Card>
      </div>

      {/* Create Activity Form */}
      <Card className="bg-[#222] text-white border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Activity
            </CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              variant={showForm ? "outline" : "default"}
              className={showForm ? "text-white" : "bg-emerald-600 hover:bg-emerald-700"}
            >
              {showForm ? "Cancel" : "Add Activity"}
            </Button>
          </div>
        </CardHeader>
        
        {showForm && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Activity Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Help a Senior Citizen"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="daily">Daily Acts of Kindness</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="volunteer">Volunteerism</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this activity involves..."
                className="bg-gray-800 border-gray-700 min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="points">Points *</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.points}
                  onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 1)}
                  className="bg-gray-800 border-gray-700"
                />
                <p className="text-xs text-gray-400">Points awarded (1-10)</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="/placeholder.svg"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>
            
            <Button
              onClick={handleCreateActivity}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Create Activity
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Activities List by Category */}
      <div className="space-y-6">
        {Object.entries(activities).map(([category, categoryActivities]) => (
          <Card key={category} className="bg-[#222] text-white border-none">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`}></div>
                  {getCategoryLabel(category)} ({categoryActivities.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categoryActivities.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No activities in this category yet.</p>
                ) : (
                  categoryActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{activity.title}</h4>
                        <p className="text-sm text-gray-400">{activity.description}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs bg-emerald-900 px-2 py-1 rounded">
                            {activity.points} {activity.points === 1 ? 'Point' : 'Points'}
                          </span>
                          <span className="text-xs text-gray-500">{activity.id}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={() => handleDeleteActivity(category as keyof typeof activities, activity.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
