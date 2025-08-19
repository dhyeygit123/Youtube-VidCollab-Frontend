import { fetchWithRetry } from "../utils/api";
import CustomAlert from "../components/Alert";
import TeamSidebar from "../components/TeamManagement";
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, Video, User, LogOut, ChevronLeft, ChevronRight, Check, X, ExternalLink, Filter, SortAsc, SortDesc, Users } from 'lucide-react';

function Dashboard({ user }) {
  const [videos, setVideos] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState({});
  const [teamSidebarOpen, setTeamSidebarOpen] = useState(false);
  const videosPerPage = 5;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const type = urlParams.get('type');
    if (message && type) {
      setNotification({ message, type });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await fetchWithRetry('http://localhost:5000/api/video', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Error fetching videos');
        }
        setVideos(data);
      } catch (error) {
        setNotification({ message: error.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleSort = (key) => {
    const newSortOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(key);
    setSortOrder(newSortOrder);
    setVideos([...videos].sort((a, b) => {
      const valA = a[key].toLowerCase ? a[key].toLowerCase() : a[key];
      const valB = b[key].toLowerCase ? b[key].toLowerCase() : b[key];
      return newSortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Action Pending': { className: 'bg-grey-100 text-grey-800 border border-grey-200' },
      'Under Review': { className: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
      'Approved': { className: 'bg-green-100 text-green-800 border border-green-200' },
      'Rejected': { className: 'bg-red-100 text-red-800 border border-red-200' }
    };

    const config = statusConfig[status] || statusConfig['Under Review'];
    return (
      <Badge className={config.className}>
        {status}
      </Badge>
    );
  };

  const filteredVideos = filterStatus != 'all'
    ? videos.filter((video) => video.status === filterStatus)
    : videos;

  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * videosPerPage,
    currentPage * videosPerPage
  );

  return (
    <div className="relative">
      <div className={`transition-all duration-300 ${teamSidebarOpen ? 'mr-80' : 'mr-0'}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage your video content</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-4 py-2 text-sm">
                {videos.length} Total Videos
              </Badge>
              {user?.role === 'youtuber' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTeamSidebarOpen(!teamSidebarOpen)}
                  className={`flex items-center gap-2 transition-colors ${
                    teamSidebarOpen ? 'bg-blue-50 border-blue-200 text-blue-700' : ''
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Team
                </Button>
              )}
            </div>
          </div>

          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  Video Library
                </CardTitle>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Action Pending">Action Pending</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>

                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort(sortBy)}
                    className="flex items-center gap-2"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    Sort by {sortBy}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <CustomAlert message={notification.message} type={notification.type} />

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600">Loading videos...</span>
                </div>
              ) : paginatedVideos.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
                  <p className="text-gray-600">Upload your first video to get started</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <div className="min-w-full bg-white rounded-lg border overflow-hidden">
                      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                          <div
                            className="col-span-4 cursor-pointer hover:text-gray-900 flex items-center gap-2"
                            onClick={() => handleSort('name')}
                          >
                            Video Title
                            {sortBy === 'name' && (sortOrder === 'asc' ?
                              <SortAsc className="w-4 h-4" /> :
                              <SortDesc className="w-4 h-4" />
                            )}
                          </div>
                          <div
                            className="col-span-2 cursor-pointer hover:text-gray-900 flex items-center gap-2"
                            onClick={() => handleSort('status')}
                          >
                            Status
                            {sortBy === 'status' && (sortOrder === 'asc' ?
                              <SortAsc className="w-4 h-4" /> :
                              <SortDesc className="w-4 h-4" />
                            )}
                          </div>
                          <div className="col-span-2">Link</div>
                          {user.role === 'youtuber' && <div className="col-span-4">Actions</div>}
                        </div>
                      </div>

                      <div className="divide-y divide-gray-200">
                        {paginatedVideos.map((video) => (
                          <div key={video.fileId} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                            <div className="grid grid-cols-12 gap-4 items-center">
                              <div className="col-span-4 font-medium text-gray-900 truncate">
                                {video.name}
                              </div>
                              <div className="col-span-2">
                                {getStatusBadge(video.status)}
                              </div>
                              <div className="col-span-2">
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={video.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4" />
                                    View
                                  </a>
                                </Button>
                              </div>
                              {user.role === 'youtuber' && (
                                <div className="col-span-4 flex gap-2">
                                  {video.status === 'Action Pending' && (
                                    <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    disabled={actionLoading[video.fileId] === 'approve'}
                                    onClick={async () => {
                                      setActionLoading((prev) => ({ ...prev, [video.fileId]: 'approve' }));
                                      try {
                                        const response = await fetchWithRetry(
                                          `http://localhost:5000/api/video/approve-json/${video.fileId}`,
                                          {
                                            method: 'POST',
                                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                          }
                                        );
                                        const data = await response.json();
                                        if (!response.ok) throw new Error(data.message);
                                        setNotification({ message: data.message, type: 'success' });
                                        const videoResponse = await fetchWithRetry('http://localhost:5000/api/video', {
                                          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                        });
                                        setVideos(await videoResponse.json());
                                      } catch (error) {
                                        setNotification({ message: error.message, type: 'error' });
                                      } finally {
                                        setActionLoading((prev) => ({ ...prev, [video.fileId]: null }));
                                      }
                                    }}
                                  >
                                    {actionLoading[video.fileId] === 'approve' ? (
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Approving...
                                      </div>
                                    ) : (
                                      <>
                                        <Check className="w-4 h-4 mr-1" />
                                        Approve
                                      </>
                                    )}
                                  </Button>                              
                                  )}
                                  {video.status === "Action Pending" &&
                                    <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={actionLoading[video.fileId] === 'reject'}
                                    onClick={async () => {
                                      setActionLoading((prev) => ({ ...prev, [video.fileId]: 'reject' }));
                                      try {
                                        const response = await fetchWithRetry(
                                          `http://localhost:5000/api/video/reject-json/${video.fileId}`,
                                          {
                                            method: 'POST',
                                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                          }
                                        );
                                        const data = await response.json();
                                        if (!response.ok) throw new Error(data.message);
                                        setNotification({ message: data.message, type: 'success' });
                                        const videoResponse = await fetchWithRetry('http://localhost:5000/api/video', {
                                          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                        });
                                        setVideos(await videoResponse.json());
                                      } catch (error) {
                                        setNotification({ message: error.message, type: 'error' });
                                      } finally {
                                        setActionLoading((prev) => ({ ...prev, [video.fileId]: null }));
                                      }
                                    }}
                                  >
                                    {actionLoading[video.fileId] === 'reject' ? (
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Rejecting...
                                      </div>
                                    ) : (
                                      <>
                                        <X className="w-4 h-4 mr-1" />
                                        Reject
                                      </>
                                    )}
                                  </Button>}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-md">
                      Page {currentPage} of {Math.ceil(filteredVideos.length / videosPerPage)}
                    </span>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={currentPage >= Math.ceil(filteredVideos.length / videosPerPage)}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Sidebar */}
      <TeamSidebar 
        user={user} 
        isOpen={teamSidebarOpen} 
        onToggle={() => setTeamSidebarOpen(!teamSidebarOpen)} 
      />
    </div>
  );
}

export default Dashboard;