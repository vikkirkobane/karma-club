import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#222] text-white border-none text-center">
        <CardHeader>
          <div className="text-6xl mb-4">🤔</div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-400">
            Oops! The page you're looking for doesn't exist. 
            Maybe it's time to spread some kindness instead?
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/')}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
            
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full border-gray-600 text-white hover:bg-gray-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;