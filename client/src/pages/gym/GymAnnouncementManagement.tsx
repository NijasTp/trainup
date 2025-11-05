import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, Plus, Search, CreditCard as Edit, Trash2, Calendar, Image as ImageIcon, Eye, EyeOff, Upload } from 'lucide-react';
import { toast } from 'sonner';
import API from '@/lib/axios';

interface Announcement {
  _id: string;
  title: string;
  description: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function GymAnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'TrainUp - Gym Announcements';
    fetchAnnouncements();
  }, [currentPage, searchQuery]);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const response = await API.get('/gym/announcements', {
        params: {
          page: currentPage,
          limit: 10,
          search: searchQuery,
        },
      });
      
      setAnnouncements(response.data.announcements || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err: any) {
      console.error('Failed to fetch announcements:', err);
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAnnouncements();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setFormData({ ...formData, image: file });
      
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', image: null });
    setImagePreview(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await API.post('/gym/announcements', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Announcement created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchAnnouncements();
    } catch (err: any) {
      console.error('Failed to create announcement:', err);
      toast.error(err.response?.data?.message || 'Failed to create announcement');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAnnouncement) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await API.put(`/gym/announcements/${editingAnnouncement._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Announcement updated successfully');
      setShowEditModal(false);
      setEditingAnnouncement(null);
      resetForm();
      fetchAnnouncements();
    } catch (err: any) {
      console.error('Failed to update announcement:', err);
      toast.error(err.response?.data?.message || 'Failed to update announcement');
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      await API.put(`/gym/announcements/${announcement._id}`, {
        isActive: !announcement.isActive
      });
      
      toast.success(`Announcement ${announcement.isActive ? 'deactivated' : 'activated'}`);
      fetchAnnouncements();
    } catch (err: any) {
      console.error('Failed to toggle announcement:', err);
      toast.error('Failed to update announcement');
    }
  };

  const handleDelete = async (announcement: Announcement) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await API.delete(`/gym/announcements/${announcement._id}`);
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (err: any) {
      console.error('Failed to delete announcement:', err);
      toast.error('Failed to delete announcement');
    }
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      description: announcement.description,
      image: null
    });
    setImagePreview(announcement.image || null);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Announcement Management</h1>
              <p className="text-gray-400">Manage your gym announcements and updates</p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-600 text-white"
                />
              </div>
              <Button type="submit" className="px-6">
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Announcements List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : announcements.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-16 text-center">
              <Bell className="h-16 w-16 mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No announcements found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery 
                  ? "Try adjusting your search criteria" 
                  : "Create your first announcement to get started"
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Announcement
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement._id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {announcement.image && (
                        <div className="flex-shrink-0">
                          <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-700">
                            <img
                              src={announcement.image}
                              alt={announcement.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">
                              {announcement.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                              </div>
                              <Badge variant={announcement.isActive ? "default" : "secondary"}>
                                {announcement.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(announcement)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              {announcement.isActive ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(announcement)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(announcement)}
                              className="border-red-600 text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-gray-300 leading-relaxed">
                          {announcement.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="border-gray-600 text-gray-300"
                >
                  Previous
                </Button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = currentPage <= 3 
                    ? i + 1 
                    : currentPage >= totalPages - 2 
                      ? totalPages - 4 + i 
                      : currentPage - 2 + i;
                  
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? "" : "border-gray-600 text-gray-300"}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="border-gray-600 text-gray-300"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-gray-300">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-gray-900 border-gray-600 text-white mt-1"
                placeholder="Enter announcement title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-gray-300">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-900 border-gray-600 text-white mt-1"
                placeholder="Enter announcement description"
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="image" className="text-gray-300">Image (Optional)</Label>
              <div className="mt-1">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="bg-gray-900 border-gray-600 text-white"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-w-xs h-24 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1 border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Create Announcement
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-title" className="text-gray-300">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-gray-900 border-gray-600 text-white mt-1"
                placeholder="Enter announcement title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description" className="text-gray-300">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-900 border-gray-600 text-white mt-1"
                placeholder="Enter announcement description"
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-image" className="text-gray-300">Image (Optional)</Label>
              <div className="mt-1">
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="bg-gray-900 border-gray-600 text-white"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-w-xs h-24 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAnnouncement(null);
                  resetForm();
                }}
                className="flex-1 border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Update Announcement
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}