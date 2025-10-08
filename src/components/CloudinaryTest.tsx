import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloudinaryService } from '@/lib/cloudinary';
import { AlertCircle, CheckCircle, Upload, Settings } from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  details?: unknown;
}

export const CloudinaryTest: React.FC = () => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runConfigTest = async () => {
    setIsLoading(true);
    try {
      const result = await CloudinaryService.testConfiguration();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Test failed',
        details: { error }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const configStatus = CloudinaryService.getConfigStatus();

  return (
    <Card className="bg-[#222] text-white border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Cloudinary Configuration Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <div className="space-y-2">
          <h4 className="font-semibold">Configuration Status:</h4>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span>Cloud Name:</span>
              <div className="flex items-center gap-2">
                <Badge variant={configStatus.cloudName ? 'default' : 'destructive'}>
                  {configStatus.cloudName || 'Not Set'}
                </Badge>
                {configStatus.cloudName ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Upload Preset:</span>
              <div className="flex items-center gap-2">
                <Badge variant={configStatus.uploadPreset ? 'default' : 'destructive'}>
                  {configStatus.uploadPreset || 'Not Set'}
                </Badge>
                {configStatus.uploadPreset ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>

          {/* Issues */}
          {configStatus.issues.length > 0 && (
            <div className="mt-3 p-3 bg-red-900/20 border border-red-500/20 rounded">
              <h5 className="font-medium text-red-400 mb-2">Configuration Issues:</h5>
              <ul className="text-sm text-red-300 space-y-1">
                {configStatus.issues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Test Button */}
        <Button 
          onClick={runConfigTest}
          disabled={isLoading || !configStatus.isConfigured}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading ? (
            'Testing...'
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Test Upload Functionality
            </>
          )}
        </Button>

        {/* Test Results */}
        {testResult && (
          <div className={`p-3 rounded border ${
            testResult.success 
              ? 'bg-green-900/20 border-green-500/20' 
              : 'bg-red-900/20 border-red-500/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={`font-medium ${
                testResult.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {testResult.success ? 'Test Passed!' : 'Test Failed'}
              </span>
            </div>
            
            <p className={`text-sm ${
              testResult.success ? 'text-green-300' : 'text-red-300'
            }`}>
              {testResult.message}
            </p>

            {testResult.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs opacity-70">
                  Show Details
                </summary>
                <pre className="mt-2 text-xs bg-black/20 p-2 rounded overflow-auto">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Setup Instructions */}
        {!configStatus.isConfigured && (
          <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded">
            <h5 className="font-medium text-blue-400 mb-2">Setup Required:</h5>
            <ol className="text-sm text-blue-300 space-y-1 list-decimal list-inside">
              <li>Go to your Cloudinary Dashboard</li>
              <li>Create upload preset "karma-club-uploads" (Unsigned mode)</li>
              <li>Update your .env file with correct values</li>
              <li>Restart your development server</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};