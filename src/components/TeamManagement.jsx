import React, { useState, useEffect } from 'react';
import { fetchWithRetry } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  UserPlus,
  Settings,
  MoreVertical,
  Circle,
  Mail,
  Calendar,
  ChevronRight,
  UserCheck,
  UserX,
  Crown,
  Trash2,
  AlertTriangle,
  Clock,
  Bell,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const TeamSidebar = ({ user, isOpen, onToggle, onViewHistory, isGoogleConnected }) => {
  const [editors, setEditors] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [editorToRemove, setEditorToRemove] = useState(null);
  const [inviteToDeny, setInviteToDeny] = useState(null);
  const [denyReason, setDenyReason] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [activeTab, setActiveTab] = useState('editors');

  useEffect(() => {
    if (user?.role === 'youtuber' && isOpen) {
      fetchEditors();
      fetchPendingInvites();
      // Set up polling for pending invites every 30 seconds
      const interval = setInterval(fetchPendingInvites, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isOpen]);

  const fetchEditors = async () => {
    setLoading(true);
    try {
      const response = await fetchWithRetry(`${BACKEND_URL}/api/team/editors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setEditors(data);
    } catch (error) {
      console.error('Error fetching editors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvites = async () => {
    setPendingLoading(true);
    try {
      const response = await fetchWithRetry(`${BACKEND_URL}/api/team/pending-invites`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setPendingInvites(data);
    } catch (error) {
      console.error('Error fetching pending invites:', error);
    } finally {
      setPendingLoading(false);
    }
  };

  const handleInviteEditor = async () => {
    if (!inviteEmail.trim() || !isGoogleConnected) return;

    setInviteLoading(true);
    try {
      const response = await fetchWithRetry(`${BACKEND_URL}/api/team/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setInviteEmail('');
      setInviteDialogOpen(false);
    } catch (error) {
      console.error('Error inviting editor:', error);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleApproveInvite = async (inviteId) => {
    if (!isGoogleConnected) return;
    setActionLoading(prev => ({ ...prev, [`approve_${inviteId}`]: true }));
    try {
      const response = await fetchWithRetry(`${BACKEND_URL}/api/team/pending-invites/${inviteId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      fetchEditors();
      fetchPendingInvites();
    } catch (error) {
      console.error('Error approving invite:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`approve_${inviteId}`]: false }));
    }
  };

  const handleDenyInvite = async () => {
    if (!inviteToDeny || !isGoogleConnected) return;

    setActionLoading(prev => ({ ...prev, [`deny_${inviteToDeny._id}`]: true }));
    try {
      const response = await fetchWithRetry(`${BACKEND_URL}/api/team/pending-invites/${inviteToDeny._id}/deny`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason: denyReason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setDenyDialogOpen(false);
      setInviteToDeny(null);
      setDenyReason('');
      fetchPendingInvites();
    } catch (error) {
      console.error('Error denying invite:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`deny_${inviteToDeny?._id}`]: false }));
    }
  };

  const handleToggleEditorStatus = async (editorId, currentStatus) => {
    if (!isGoogleConnected) return;
    setActionLoading(prev => ({ ...prev, [editorId]: true }));
    try {
      const action = currentStatus === 'active' ? 'deactivate' : 'activate';
      const response = await fetchWithRetry(`${BACKEND_URL}/api/team/editor/${editorId}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      fetchEditors();
    } catch (error) {
      console.error('Error toggling editor status:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [editorId]: false }));
    }
  };

  const handleRemoveEditor = async () => {
    if (!editorToRemove || !isGoogleConnected) return;

    setRemoveLoading(true);
    try {
      const response = await fetchWithRetry(`${BACKEND_URL}/api/team/editor/${editorToRemove._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setRemoveDialogOpen(false);
      setEditorToRemove(null);
      fetchEditors();
    } catch (error) {
      console.error('Error removing editor:', error);
    } finally {
      setRemoveLoading(false);
    }
  };

  const openRemoveDialog = (editor) => {
    setEditorToRemove(editor);
    setRemoveDialogOpen(true);
  };

  const openDenyDialog = (invite) => {
    setInviteToDeny(invite);
    setDenyDialogOpen(true);
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const getStatusBadge = (status, isOnline = false) => {
    const config = {
      active: {
        className: 'bg-green-100 text-green-800 border border-green-200',
        text: 'Active'
      },
      inactive: {
        className: 'bg-red-100 text-red-600 border border-red-200',
        text: 'Inactive'
      },
      pending: {
        className: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        text: 'Pending'
      }
    };

    const statusConfig = config[status] || config.inactive;
    return (
      <div className="flex items-center gap-2">
        <Badge className={statusConfig.className} variant="outline">
          <Circle className={`w-2 h-2 mr-1 fill-current ${statusConfig.text === 'Active' ? 'text-green-500' : 'text-red-500'}`} />
          {statusConfig.text}
        </Badge>
      </div>
    );
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const requestDate = new Date(date);
    const diffInMs = now - requestDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  return (
    <div className={`fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-xl transition-all duration-300 ease-in-out z-50 ${isOpen ? 'w-80' : 'w-0'
      } overflow-hidden`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center relative">
                <Users className="w-5 h-5 text-white" />
                {pendingInvites.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{pendingInvites.length}</span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Team</h2>
                <p className="text-sm text-gray-600">Manage your editors</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Owner Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600">
                  <AvatarFallback className="text-white text-xs font-semibold bg-transparent">
                    {getInitials(user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{user?.email || 'Loading...'}</span>
                    <Crown className="w-3 h-3 text-yellow-500" />
                  </div>
                  <p className="text-xs text-gray-500">Owner</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content with Tabs */}
        <div className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editors" className="text-xs">
                  Editors ({editors.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs relative">
                  Requests
                  {pendingInvites.length > 0 && (
                    <Badge className="ml-1 px-1 py-0 text-xs h-4 bg-red-500 text-white">
                      {pendingInvites.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {!isGoogleConnected && user?.role === 'youtuber' && (
              <div className="px-6 mt-4">
                <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Connect your Google account to manage your team and invite editors.
                </div>
              </div>
            )}

            <div className="flex-1 overflow-auto px-6">
              {/* Editors Tab */}
              <TabsContent value="editors" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Active Editors</h3>
                  <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-white" 
                        disabled={!isGoogleConnected || user?.role !== 'youtuber'}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Invite
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Invite Editor</DialogTitle>
                        <DialogDescription>
                          Send an invitation to a new editor to join your team.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="editor@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleInviteEditor}
                          disabled={inviteLoading || !inviteEmail.trim() || !isGoogleConnected}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {inviteLoading ? (
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Sending...
                            </div>
                          ) : (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Invitation
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Separator />

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="ml-3 text-sm text-gray-600">Loading editors...</span>
                  </div>
                ) : editors.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">No editors yet</h3>
                    <p className="text-xs text-gray-500 mb-4">Start building your team by inviting editors</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setInviteDialogOpen(true)}
                      className="border-dashed"
                      disabled={!isGoogleConnected || user?.role !== 'youtuber'}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite First Editor
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editors.map((editor) => (
                      <Card key={editor._id} className="border border-gray-100 hover:border-gray-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <Avatar className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600">
                                <AvatarFallback className="text-white text-xs font-semibold bg-transparent">
                                  {getInitials(editor.email)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900 truncate">
                                    {editor.email.split('@')[0]}
                                  </span>
                                  {getStatusBadge(editor.status || 'active')}
                                </div>
                                <p className="text-xs text-gray-500 truncate">{editor.email}</p>
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => handleToggleEditorStatus(editor._id, editor.status || 'active')}
                                  disabled={actionLoading[editor._id] || !isGoogleConnected}
                                >
                                  {(editor.status || 'active') === 'active' ? (
                                    <>
                                      <UserX className="w-4 h-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-4 h-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onViewHistory(editor)}>
                                  <Clock className="w-4 h-4 mr-2" />
                                  View History
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => openRemoveDialog(editor)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove from team
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Pending Requests Tab */}
              <TabsContent value="pending" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Signup Requests</h3>
                  {pendingInvites.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {pendingInvites.length} pending
                    </Badge>
                  )}
                </div>

                <Separator />

                {pendingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="ml-3 text-sm text-gray-600">Loading requests...</span>
                  </div>
                ) : pendingInvites.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">No pending requests</h3>
                    <p className="text-xs text-gray-500">New editor signup requests will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingInvites.map((invite) => (
                      <Card key={invite._id} className="border border-yellow-200 bg-yellow-50/30 hover:bg-yellow-50/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500">
                                <AvatarFallback className="text-white text-xs font-semibold bg-transparent">
                                  {getInitials(invite.email)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900 truncate">
                                    {invite.email.split('@')[0]}
                                  </span>
                                  <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300" variant="outline">
                                    <Clock className="w-2 h-2 mr-1" />
                                    Pending
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 truncate">{invite.email}</p>
                                <p className="text-xs text-gray-500">Requested {formatTimeAgo(invite.requestedAt)}</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveInvite(invite._id)}
                                disabled={actionLoading[`approve_${invite._id}`] || !isGoogleConnected}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              >
                                {actionLoading[`approve_${invite._id}`] ? (
                                  <div className="flex items-center">
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                    Approving...
                                  </div>
                                ) : (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openDenyDialog(invite)}
                                disabled={actionLoading[`deny_${invite._id}`] || !isGoogleConnected}
                                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Deny
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Team management • {editors.filter(e => (e.status || 'active') === 'active').length} active
              {pendingInvites.length > 0 && ` • ${pendingInvites.length} pending`}
            </p>
          </div>
        </div>
      </div>

      {/* Remove Editor Confirmation Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg">Remove Editor</DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-sm text-gray-600">
              Are you sure you want to remove <span className="font-semibold text-gray-900">{editorToRemove?.email}</span> from your team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">This will:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Remove all access to your content</li>
                    <li>• Revoke editing permissions</li>
                    <li>• Cannot be undone easily</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRemoveDialogOpen(false);
                setEditorToRemove(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemoveEditor}
              disabled={removeLoading || !isGoogleConnected}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {removeLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Removing...
                </div>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Editor
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deny Request Dialog */}
      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg">Deny Signup Request</DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-sm text-gray-600">
              Are you sure you want to deny the signup request from <span className="font-semibold text-gray-900">{inviteToDeny?.email}</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Let them know why their request was denied..."
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDenyDialogOpen(false);
                setInviteToDeny(null);
                setDenyReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDenyInvite}
              disabled={actionLoading[`deny_${inviteToDeny?._id}`] || !isGoogleConnected}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading[`deny_${inviteToDeny?._id}`] ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Denying...
                </div>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Deny Request
                </>)
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamSidebar;