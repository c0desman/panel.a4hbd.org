// src/components/features/ProjecttypeImageVideo/VideoSection.js
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ConfirmDialog from '@/components/features/popup/ConfirmDialog';
import { toast } from 'sonner';

export default function VideoSection({ projectTypeId }) {
  const [videos, setVideos] = useState([]);
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, videoId: null });

  // Fetch videos for this project type
  const fetchVideos = async () => {
    if (!projectTypeId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/videos/projecttype/${projectTypeId}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (res.ok) {
        setVideos(data.videos || []);
      } else {
        setVideos([]);
        if (data.message) toast.error(data.message);
      }
    } catch {
      toast.error('Error fetching videos');
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [projectTypeId]);

  // Create or update video
  const handleVideoSubmit = async (formData, file, videoId = null) => {
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('alt', formData.alt || '');
      body.append('description', formData.description || '');
      body.append('videourl', formData.videourl || '');
      if (file) body.append('videopath', file);

      // Send projectTypeIds as array
      body.append('projectTypeIds', projectTypeId);

      if (videoId) body.append('id', videoId);

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${videoId ? '/editvideo' : '/createvideo'}`;
      const res = await fetch(url, { method: 'POST', credentials: 'include', body });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || (videoId ? 'Video updated' : 'Video uploaded'));
        fetchVideos();
      } else {
        toast.error(data.message || 'Failed to save video');
      }
    } catch {
      toast.error('Error saving video');
    }
  };

  // Remove video from this project type
    const handleRemove = async (videoId) => {
    if (!videoId || !projectTypeId) return;
    try {
        const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/removevideoprojecttype/${parseInt(videoId)}/${parseInt(projectTypeId)}`,
        { method: 'DELETE', credentials: 'include' }
        );

        const data = await res.json();

        if (res.ok) {
        toast.success(data.message || 'Video removed from this project type');
        fetchVideos();
        } else {
        toast.error(data.message || 'Failed to remove video');
        }
    } catch (error) {
        console.error(error);
        toast.error('Error removing video');
    }
    setConfirmDialog({ open: false, videoId: null });
    };

  // Video form component
  const VideoForm = ({ video, onCancel }) => {
    const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm({
      defaultValues: {
        title: video?.title || '',
        alt: video?.alt || '',
        description: video?.description || '',
        videourl: video?.videourl || '',
      },
    });

    const [previewVideo, setPreviewVideo] = useState(
      video?.videopath ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.videopath.replace(/\\/g, '/')}` : video?.videourl || null
    );
    const [selectedFile, setSelectedFile] = useState(null);

    const handleVideoChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setPreviewVideo(URL.createObjectURL(file));

        if (!video) {
          const autoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setValue('title', autoTitle);
          setValue('alt', autoTitle);
        }
      }
    };

    const onSubmit = (data) => handleVideoSubmit(data, selectedFile, video?.id).then(() => onCancel());

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 p-4 rounded mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{video ? 'Edit Video' : 'Add New Video'}</h3>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <Label>Video File</Label>
          {previewVideo && !previewVideo.includes('youtube') && (
            <video src={previewVideo} controls className="w-full h-32 rounded mt-2" />
          )}
          <Input type="file" accept="video/*" onChange={handleVideoChange} disabled={isSubmitting} className="mt-2" />
        </div>

        <div>
          <Label>YouTube Video URL</Label>
          <Input {...register('videourl')} placeholder="https://youtube.com/..." disabled={isSubmitting} />
        </div>

        <div>
          <Label>Title</Label>
          <Input {...register('title', { required: true })} disabled={isSubmitting} />
        </div>
        <div>
          <Label>Alt Text</Label>
          <Input {...register('alt')} disabled={isSubmitting} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea {...register('description')} rows={2} disabled={isSubmitting} />
        </div>

        <div className="flex gap-2 mt-4">
          <Button type="submit" className="flex-1 bg-green-600 text-white" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : video ? 'Save Changes' : 'Upload Video'}
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Video Section</h2>

      {showAddVideoForm ? (
        <VideoForm onCancel={() => setShowAddVideoForm(false)} />
      ) : (
        <Button onClick={() => setShowAddVideoForm(true)} className="flex items-center gap-2 mb-6">
          <Plus /> Add Video
        </Button>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {videos.map((video) => (
          <div key={video.id} className="bg-white p-4 rounded shadow relative">
            {editingVideoId === video.id ? (
              <VideoForm video={video} onCancel={() => setEditingVideoId(null)} />
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{video.title}</h3>
                    <p className="text-sm text-gray-600">{video.alt}</p>
                    {video.description && <p className="text-sm mt-1">{video.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Pencil className="cursor-pointer text-blue-500" onClick={() => setEditingVideoId(video.id)} />
                    <Trash2 className="cursor-pointer text-red-500" onClick={() => setConfirmDialog({ open: true, videoId: video.id })} />
                  </div>
                </div>

                {video.videourl ? (
                  <iframe
                    src={video.videourl.includes('embed') ? video.videourl : video.videourl.replace('watch?v=', 'embed/')}
                    width="100%"
                    height="150"
                    frameBorder="0"
                    allowFullScreen
                    className="rounded"
                  />
                ) : video.videopath ? (
                  <video src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.videopath.replace(/\\/g, '/')}`} controls className="w-full h-32 rounded object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded text-gray-500">
                    No video
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, videoId: null })}
        onConfirm={() => handleRemove(confirmDialog.videoId)}
        title="Remove video from this project type?"
        description="This will only remove the video from this project type, not delete it globally."
        confirmText="Yes, remove"
        cancelText="Cancel"
      />
    </div>
  );
}
