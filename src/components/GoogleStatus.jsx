import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Wifi, WifiOff, ExternalLink } from 'lucide-react';
import ConnectGoogle from './ConnectGoogle';

function GoogleConnectionStatus({ 
  isConnected, 
  BACKEND_URL, 
  setNotification, 
  className = "" 
}) {
  if (isConnected) {
    return (
      <Card className={`bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 ${className}`}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-green-800 text-lg">Google Connected</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300 text-xs px-2 py-1">
                  <Wifi className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-sm text-green-600 leading-relaxed">
                Your Google account is linked and ready for YouTube uploads
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-100 px-4"
              onClick={() => {
                setNotification({ 
                  message: 'Google connection is active and working properly', 
                  type: 'success' 
                });
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 ${className}`}>
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-bold text-yellow-800 text-lg">Google Not Connected</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs px-2 py-1">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            </div>
            <p className="text-sm text-yellow-600 leading-relaxed">
              Connect your Google account to enable YouTube uploads and management
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">
          <ConnectGoogle 
            BACKEND_URL={BACKEND_URL} 
            setNotification={setNotification}
          />
        </div>
      </div>
    </Card>
  );
}

export default GoogleConnectionStatus;