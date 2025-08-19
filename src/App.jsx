// App.jsx
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import VideoUpload from "./components/VideoUpload";
import CustomAlert from "./components/Alert";
import Approval from "./components/Approve"; // Video review page

import React, { useState, useEffect } from "react";
import { Video, LogOut, Badge } from 'lucide-react';
import { Button } from '@/components/ui/button';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [reviewParams, setReviewParams] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setUser({ role });
      setCurrentPage(role === 'youtuber' ? 'dashboard' : 'upload');
    }

    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const type = urlParams.get('type');
    const page = urlParams.get('page');
    const fileId = urlParams.get('fileId');
    const approveToken = urlParams.get('approveToken');
    const rejectToken = urlParams.get('rejectToken');

    if (message && type) {
      setNotification({ message, type });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (page === 'approval' && fileId && approveToken && rejectToken) {
      setReviewParams({ fileId, approveToken, rejectToken });
      setCurrentPage('approval');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    setCurrentPage('login');
    window.history.replaceState({}, document.title, window.location.pathname);
  };
  

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login setCurrentPage={setCurrentPage} setUser={setUser} />;
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'upload':
        return <VideoUpload user={user} />;
      case 'approval':
        return (
          <Approval
            fileId={reviewParams.fileId}
            approveToken={reviewParams.approveToken}
            rejectToken={reviewParams.rejectToken}
          />
        );
      default:
        return <Login setCurrentPage={setCurrentPage} setUser={setUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                YouTube Platform
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Video Management System</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1 capitalize">
                {user.role}
              </Badge>
              {currentPage !== 'approval' && <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>}
            </div>
          )}
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <CustomAlert message={notification.message} type={notification.type} />
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
