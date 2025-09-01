//src/components/features/ImageVideoEdit/VideoSection.js
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from "@/components/ui/multi-select";
import ConfirmDialog from '@/components/features/popup/ConfirmDialog';

export default function VideoSection({ 
  videos, 
  projectTypes, 
  projectId, 
  onVideoSubmit, 
  onDeleteVideo, 
  fetchVideos, 
  editingVideoId, 
  setEditingVideoId 
}) {
  // const [editingVideoId, setEditingVideoId] = useState(null);
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, videoId: null });

  // Video Form Component
  const VideoForm = ({ projectTypes, onSubmit, onCancel, video }) => {
    const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm({
      defaultValues: {
        title: video?.title || '',
        videourl: video?.videourl || '',
        alt: video?.alt || '',
        description: video?.description || '',
      },
    });

    const [previewVideo, setPreviewVideo] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedProjectTypes, setSelectedProjectTypes] = useState([]);

    useEffect(() => {
      if (video?.videopath) {
        setPreviewVideo(`${process.env.NEXT_PUBPUBLIC_BACKEND_URL}/${video.videopath.replace(/\\/g, "/")}`);
      } else if (video?.videourl) {
        setPreviewVideo(video.videourl);
      }

      // Initialize selected project types when editing
      if (video && video.projecttypes) {
        const initialProjectTypes = video.projecttypes.map(pt => ({
          value: pt.id.toString(),
          label: pt.title || `Project Type ${pt.id}`
        }));
        setSelectedProjectTypes(initialProjectTypes);
      }
    }, [video]);

    const getFileNameForTitle = (filename) => {
      return filename
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    };

    const handleVideoChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        const objectURL = URL.createObjectURL(file);
        setPreviewVideo(objectURL);
        
        if (!video) {
          const autoTitle = getFileNameForTitle(file.name);
          setValue('title', autoTitle);
          setValue('alt', autoTitle);
        }
      }
    };

    const handleFormSubmit = (data) => {
      onSubmit(data, selectedFile, selectedProjectTypes);
    };

    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-gray-50 p-4 rounded mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{video ? 'Edit Video' : 'Add New Video'}</h3>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <Label>Video File</Label>
          {previewVideo ? (
            video?.videourl || (previewVideo && previewVideo.startsWith('http')) ? (
              <div className="mt-2">
                <iframe
                  src={previewVideo.includes('embed') ? previewVideo : previewVideo.replace("watch?v=", "embed/")}
                  width="100%"
                  height="300"
                  frameBorder="0"
                  allowFullScreen
                  className="rounded"
                />
              </div>
            ) : (
              <video 
                src={previewVideo}
                controls
                width="100%"
                className="mt-2 rounded"
              />
            )
          ) : null}
          <Input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            disabled={isSubmitting}
            className="mt-2"
          />
        </div>

        <div>
          <Label>YouTube Video URL</Label>
          <Input
            {...register("videourl")}
            disabled={isSubmitting}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <div>
          <Label>Title</Label>
          <Input
            {...register("title", { required: "Title is required" })}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label>Alt Text</Label>
          <Input
            {...register("alt", { required: "Alt text is required" })}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            {...register("description")}
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label>Project Types</Label>
          <MultiSelect
            options={projectTypes.map(pt => ({
              value: pt.id.toString(),
              label: pt.title || `Project Type ${pt.id}`
            }))}
            value={selectedProjectTypes}
            onChange={setSelectedProjectTypes}
            placeholder="Select project types..."
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : (video ? "Save Changes" : "Upload Video")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  };

  // Video Edit Form Component
  const VideoEditForm = ({ video, projectTypes, onSave, onCancel }) => {
    const { register, handleSubmit } = useForm({
      defaultValues: {
        title: video.title,
        alt: video.alt,
        description: video.description,
        videourl: video.videourl,
      },
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewVideo, setPreviewVideo] = useState(
      video.videopath ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.videopath.replace(/\\/g, "/")}` : 
      video.videourl || null
    );
    const [selectedProjectTypes, setSelectedProjectTypes] = useState([]);

    // Initialize selected project types when component mounts
    useEffect(() => {
      if (video && video.projecttypes) {
        const initialProjectTypes = video.projecttypes.map(pt => ({
          value: pt.id.toString(),
          label: pt.title || `Project Type ${pt.id}`
        }));
        setSelectedProjectTypes(initialProjectTypes);
      }
    }, [video]);

    const handleVideoChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setPreviewVideo(URL.createObjectURL(file));
      }
    };

    const onSubmit = (data) => onSave(data, selectedFile, selectedProjectTypes, video.id);

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <Label>Video</Label>
          {previewVideo && (
            video.videourl || (previewVideo && previewVideo.startsWith('http')) ? (
              <div className="mt-2">
                <iframe
                  src={previewVideo.includes('embed') ? previewVideo : previewVideo.replace("watch?v=", "embed/")}
                  width="100%"
                  height="200"
                  frameBorder="0"
                  allowFullScreen
                  className="rounded"
                />
              </div>
            ) : (
              <video 
                src={previewVideo}
                controls
                width="100%"
                className="mt-2 rounded h-32"
              />
            )
          )}
          <Input type="file" accept="video/*" onChange={handleVideoChange} className="mt-2" />
        </div>
        <div>
          <Label>YouTube URL</Label>
          <Input {...register('videourl')} placeholder="https://youtube.com/..." />
        </div>
        <div>
          <Label>Title</Label>
          <Input {...register('title')} placeholder="Title" />
        </div>
        <div>
          <Label>Alt Text</Label>
          <Input {...register('alt')} placeholder="Alt text" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea {...register('description')} placeholder="Description" rows={2} />
        </div>
        <div>
          <Label>Project Types</Label>
          <MultiSelect
            options={projectTypes.map(pt => ({
              value: pt.id.toString(),
              label: pt.title || `Project Type ${pt.id}`
            }))}
            value={selectedProjectTypes}
            onChange={setSelectedProjectTypes}
            placeholder="Select project types..."
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Update</Button>
        </div>
      </form>
    );
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Videos</h2>
      
      {/* Add new video button first */}
      <Button onClick={() => setShowAddVideoForm(prev => !prev)} className="mb-6 flex items-center gap-2">
        <Plus /> Add New Video
      </Button>

      {showAddVideoForm && (
        <VideoForm
          projectTypes={projectTypes}
          onSubmit={async (data, file, selectedProjectTypes) => {
            await onVideoSubmit(data, file, selectedProjectTypes);
            setShowAddVideoForm(false);
          }}
          onCancel={() => { setShowAddVideoForm(false); }}
        />
      )}

      {/* Show existing videos */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {videos.map((video) => (
          <div key={video.id} className="bg-white p-4 rounded shadow relative">
            {editingVideoId === video.id ? (
              <VideoEditForm 
                video={video} 
                projectTypes={projectTypes}
                onSave={async (data, file, selectedProjectTypes, videoId) => {
                  await onVideoSubmit(data, file, selectedProjectTypes, videoId);
                  setEditingVideoId(null);
                }} 
                onCancel={() => setEditingVideoId(null)} 
              />
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{video.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{video.alt}</p>
                    {video.description && <p className="text-sm mt-2">{video.description}</p>}
                    {/* Display associated project types */}
                    {video.projecttypes && video.projecttypes.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-blue-600">Project Types:</p>
                        <p className="text-xs text-gray-600">
                          {video.projecttypes.map(pt => pt.title || `Type ${pt.id}`).join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Pencil className="cursor-pointer text-blue-500" onClick={() => { setEditingVideoId(video.id); }} />
                    <Trash2 className="cursor-pointer text-red-500" onClick={() => setConfirmDialog({ open: true, videoId: video.id })} />
                  </div>
                </div>
                
                {/* Video Preview */}
                {video.videourl ? (
                  <div className="w-full h-32">
                    <iframe
                      src={video.videourl.includes('embed') ? video.videourl : video.videourl.replace("watch?v=", "embed/")}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allowFullScreen
                      className="rounded"
                    />
                  </div>
                ) : video.videopath ? (
                  <video 
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.videopath.replace(/\\/g, "/")}`}
                    controls
                    width="100%"
                    className="h-32 rounded object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded">
                    <span className="text-gray-500">No video preview</span>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Video Delete Confirmation */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, videoId: null })}
        onConfirm={async () => {
          await onDeleteVideo(confirmDialog.videoId);
          fetchVideos();
        }}
        title="Are you sure you want to remove this video?"
        description="This action will remove the video from this project but won't delete the video entirely."
        confirmText="Yes, remove"
        cancelText="Cancel"
      />
    </div>
  );
}