import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ContentModerationDashboard } from '@/components/admin/ContentModerationDashboard';  
import { ActivityManagement } from '@/components/admin/ActivityManagement';
import { ActivityVerification } from '@/components/admin/ActivityVerification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Activity, FileText, CheckSquare } from 'lucide-react';

const Admin = () => {
  return (
    <PageLayout title="Admin Dashboard">
      <Tabs defaultValue="submissions" className="w-full">
        <TabsList className="grid grid-cols-3 bg-[#333] w-full mb-6">
          <TabsTrigger 
            value="submissions" 
            className="text-white data-[state=active]:bg-emerald-600"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Submissions
          </TabsTrigger>
          <TabsTrigger 
            value="activities" 
            className="text-white data-[state=active]:bg-emerald-600"
          >
            <Activity className="h-4 w-4 mr-2" />
            Activity Management
          </TabsTrigger>
          <TabsTrigger 
            value="moderation" 
            className="text-white data-[state=active]:bg-blue-600"
          >
            <Shield className="h-4 w-4 mr-2" />
            Content Moderation
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="submissions">
          <ActivityVerification />
        </TabsContent>
        
        <TabsContent value="activities">
          <ActivityManagement />
        </TabsContent>
        
        <TabsContent value="moderation">
          <ContentModerationDashboard />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Admin;