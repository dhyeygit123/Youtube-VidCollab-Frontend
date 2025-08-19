import React, { useState, useEffect } from 'react';
import { fetchWithRetry } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Clock,
  FileVideo,
  CheckCircle,
  XCircle,
  Upload,
  Edit3,
  Activity,
  Calendar,
  User,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Download
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const EditorHistory = ({ editor, onBack }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [expandedLog, setExpandedLog] = useState(null);
  const [stats, setStats] = useState({
    totalActions: 0,
    videosUploaded: 0,
    lastActivity: null,
    mostActiveDay: null
  });

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchEditorHistory();
  }, [editor._id]);

  const fetchEditorHistory = async () => {
    setLoading(true);
    try {
      const response = await fetchWithRetry(`${BACKEND_URL}/api/team/editor/${editor._id}/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setLogs(data.logs || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching editor history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const getActionIcon = (action) => {
    const iconMap = {
      'video_upload': Upload,
      'video_edit': Edit3,
      'video_view': Eye,
      'video_download': Download,
      'login': User,
      'logout': User,
      'account_created': CheckCircle,
      'status_change': Activity,
      'profile_update': Edit3
    };
    const IconComponent = iconMap[action] || Activity;
    return <IconComponent className="w-4 h-4" />;
  };

  const getActionColor = (action) => {
    const colorMap = {
      'video_upload': 'text-blue-600 bg-blue-50',
      'video_edit': 'text-green-600 bg-green-50',
      'video_view': 'text-gray-600 bg-gray-50',
      'video_download': 'text-purple-600 bg-purple-50',
      'login': 'text-emerald-600 bg-emerald-50',
      'logout': 'text-orange-600 bg-orange-50',
      'account_created': 'text-blue-600 bg-blue-50',
      'status_change': 'text-yellow-600 bg-yellow-50',
      'profile_update': 'text-indigo-600 bg-indigo-50'
    };
    return colorMap[action] || 'text-gray-600 bg-gray-50';
  };

  const getActionBadge = (action) => {
    const badgeMap = {
      'video_upload': { text: 'Upload', className: 'bg-blue-100 text-blue-800' },
      'video_edit': { text: 'Edit', className: 'bg-green-100 text-green-800' },
      'video_view': { text: 'View', className: 'bg-gray-100 text-gray-800' },
      'video_download': { text: 'Download', className: 'bg-purple-100 text-purple-800' },
      'login': { text: 'Login', className: 'bg-emerald-100 text-emerald-800' },
      'logout': { text: 'Logout', className: 'bg-orange-100 text-orange-800' },
      'account_created': { text: 'Created', className: 'bg-blue-100 text-blue-800' },
      'status_change': { text: 'Status', className: 'bg-yellow-100 text-yellow-800' },
      'profile_update': { text: 'Profile', className: 'bg-indigo-100 text-indigo-800' }
    };
    const badge = badgeMap[action] || { text: 'Activity', className: 'bg-gray-100 text-gray-800' };
    return <Badge className={badge.className} variant="outline">{badge.text}</Badge>;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const logDate = new Date(date);
    const diffInMs = now - logDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return logDate.toLocaleDateString();
  };

  const filteredLogs = filterType === 'all'
    ? logs
    : logs.filter(log => log.action === filterType);

  const groupedLogs = filteredLogs.reduce((groups, log) => {
    const date = new Date(log.timestamp).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
    return groups;
  }, {});

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600">
              <AvatarFallback className="text-white text-sm font-semibold bg-transparent">
                {getInitials(editor.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editor.email.split('@')[0]}'s History
              </h2>
              <p className="text-sm text-gray-600">{editor.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{stats.totalActions || 0}</p>
                  <p className="text-xs text-gray-500">Total Actions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileVideo className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{stats.videosUploaded || 0}</p>
                  <p className="text-xs text-gray-500">Videos Uploaded</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {stats.lastActivity ? formatTimeAgo(stats.lastActivity) : 'Never'}
                  </p>
                  <p className="text-xs text-gray-500">Last Activity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {editor.status
                      ? editor.status.charAt(0).toUpperCase() + editor.status.slice(1)
                      : 'Active'}
                  </p>
                  <p className="text-xs text-gray-500">Current Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter activities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="video_upload">Video Uploads</SelectItem>
                <SelectItem value="video_edit">Video Edits</SelectItem>
                <SelectItem value="video_view">Video Views</SelectItem>
                <SelectItem value="login">Login Events</SelectItem>
                <SelectItem value="logout">Logout Events</SelectItem>
                <SelectItem value="status_change">Status Changes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'Entry' : 'Entries'}
          </Badge>
        </div>
      </div>

      {/* Activity Log */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading activity history...</span>
          </div>
        ) : Object.keys(groupedLogs).length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity found</h3>
            <p className="text-gray-600">
              {filterType === 'all'
                ? 'This editor hasn\'t performed any actions yet'
                : `No ${filterType.replace('_', ' ')} activities found`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLogs).map(([date, dayLogs]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <Badge variant="secondary" className="text-xs">
                    {dayLogs.length} {dayLogs.length === 1 ? 'action' : 'actions'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {dayLogs.map((log, index) => (
                    <Card
                      key={`${log._id || index}`}
                      className="border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActionColor(log.action)}`}>
                            {getActionIcon(log.action)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {getActionBadge(log.action)}
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>

                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                              {log.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h4>

                            <p className="text-sm text-gray-600">
                              {log.description || 'No description available'}
                            </p>

                            {log.details && Object.keys(log.details).length > 0 && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                                  className="mt-2 h-auto p-1 text-xs text-gray-500 hover:text-gray-700"
                                >
                                  {expandedLog === log._id ? (
                                    <>
                                      <ChevronUp className="w-3 h-3 mr-1" />
                                      Hide details
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-3 h-3 mr-1" />
                                      Show details
                                    </>
                                  )}
                                </Button>

                                {expandedLog === log._id && (
                                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="space-y-2 text-xs">
                                      {Object.entries(log.details).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                          <span className="font-medium text-gray-700 capitalize">
                                            {key.replace('_', ' ')}:
                                          </span>
                                          <span className="text-gray-600">{String(value)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorHistory;