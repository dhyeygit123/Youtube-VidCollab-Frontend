
import { fetchWithRetry } from "../utils/api";
import CustomAlert from "./Alert";
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, Video, User, LogOut, ChevronLeft, ChevronRight, Check, X, ExternalLink, Filter, SortAsc, SortDesc } from 'lucide-react';

function VideoUpload({ user }) {
  const [file, setFile] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [uploading, setUploading] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setNotification({ message: 'Please select a video file', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('video', file);

    setUploading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/video/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error uploading video');
      }
      setNotification({ message: 'Video uploaded successfully', type: 'success' });
      setFile(null);
      document.getElementById("video").value = "";
    } catch (error) {
      setNotification({ message: error.message, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Upload Video
          </CardTitle>
          <CardDescription className="text-gray-600">
            Share your content with the world
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomAlert message={notification.message} type={notification.type} />

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="video" className="text-sm font-medium text-gray-700">Select Video File</Label>
              <div className="relative w-full">
                <input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                />
              </div>

              {file && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  {file.name}
                </p>
              )}
            </div>

            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={!file || uploading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2.5 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Uploading to Drive...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload to Google Drive
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VideoUpload;