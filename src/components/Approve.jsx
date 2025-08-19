import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertTriangle, Play, Clock } from 'lucide-react';
import { fetchWithRetry } from "../utils/api";

export default function Approval({ fileId, approveToken, rejectToken }) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("pending");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithRetry(
        `${BACKEND_URL}/api/video/approve-json/${fileId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setMessage(data.message);
      setStatus("approved");
    } catch (error) {
      setMessage(error.message);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReject = async () => {
    setIsLoading(true);
    try {  
      const response = await fetchWithRetry(
        `${BACKEND_URL}/api/video/reject-json/${fileId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setMessage(data.message);
      setStatus("rejected");
    } catch (error) {
      setMessage(error.message);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusBadge = () => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><AlertTriangle className="w-3 h-3 mr-1" />Under Review</Badge>;
      case "error":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
    }
  };

  const getAlertVariant = () => {
    if (status === "approved") return "default";
    if (status === "rejected") return "default";
    if (status === "error") return "destructive";
    return "default";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Video Review</h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve content before publication</p>
        </div>
        {getStatusBadge()}
      </div>

      {message && (
        <Alert variant={getAlertVariant()} className="border-l-4">
          <AlertDescription className="flex items-center">
            {status === "approved" && <CheckCircle className="w-4 h-4 mr-2 text-green-600" />}
            {status === "rejected" && <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />}
            {status === "error" && <XCircle className="w-4 h-4 mr-2 text-red-600" />}
            {message}
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg font-medium">
            <Play className="w-5 h-5 mr-2 text-gray-600" />
            Video Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <video
              width="100%"
              height="auto"
              controls
              src={`${BACKEND_URL}/api/video/stream/${fileId}`}
              className="w-full h-auto"
              style={{ maxHeight: '500px' }}
            />
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              onClick={handleApprove}
              disabled={isLoading || status === "approved" || status === "rejected"}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium transition-colors duration-200"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isLoading ? "Processing..." : "Approve & Publish"}
            </Button>

            <Button
              type="button"
              onClick={handleReject}
              disabled={isLoading || status === "approved" || status === "rejected"}
              variant="outline"
              className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300 font-medium transition-colors duration-200"
            >
              <XCircle className="w-4 h-4 mr-2" />
              {isLoading ? "Processing..." : "Reject & Review"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-xs text-gray-400">
          File ID: <span className="font-mono">{fileId}</span>
        </p>
      </div>
    </div>
  );
}
