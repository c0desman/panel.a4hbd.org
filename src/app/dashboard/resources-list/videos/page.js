"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import VideoSidebar from "@/components/features/right-sidebar/VideoSidebar";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";
import { toast } from "sonner";
import axios from "axios";

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedProjectTypes, setSelectedProjectTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionType, setActionType] = useState('add');

  useEffect(() => {
    fetchVideos();
    fetchProjects();
    fetchProjectTypes();
  }, []);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      let endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/videos`;
      const params = { page: 1, limit: 100 };
      
      if (searchTerm) {
        endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/videos/search`;
        params.search = searchTerm;
      }
      
      const res = await axios.get(endpoint, {
        params,
        withCredentials: true,
      });
      setVideos(res.data.videos || []);
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error("Failed to load videos");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allprojects`, {
        withCredentials: true,
      });
      setProjects(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load projects");
    }
  };

  const fetchProjectTypes = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allprojecttypes`, {
        withCredentials: true,
      });
      setProjectTypes(res.data.projectTypes || []);
    } catch (err) {
      console.error("Error fetching project types:", err);
      toast.error("Failed to load project types");
      setProjectTypes([]);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchVideos();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleAction = async (video, type) => {
    setActionType(type);
    if (type === "edit" || type === "view") {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/video/${video.id}`, {
          withCredentials: true,
        });
        setSelectedVideo(res.data); // Make sure this is res.data and not res.data.video
      } catch (err) {
        console.error("Error fetching video:", err);
        toast.error("Failed to load video details");
        return;
      }
    } else {
      setSelectedVideo(null);
    }
    setShowSidebar(true);
  };

  const handleCloseSidebar = () => {
    setSelectedVideo(null);
    setShowSidebar(false);
  };

  const handleVideoSaved = () => {
    fetchVideos();
    handleCloseSidebar();
  };

  const removeVideoAssociations = async (videoId, projects, projectTypes) => {
    try {
      // Remove all project associations
      await Promise.all(
        projects.map(async (project) => {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/removevideoproject/${videoId}/${project.id}`,
            { withCredentials: true }
          );
        })
      );

      // Remove all project type associations
      await Promise.all(
        projectTypes.map(async (projectType) => {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/removevideoprojecttype/${videoId}/${projectType.id}`,
            { withCredentials: true }
          );
        })
      );
    } catch (err) {
      console.error("Error removing associations:", err);
      throw err;
    }
  };

  const confirmDelete = async () => {
    try {
      const videoId = deleteId;
      const videoToDelete = videos.find(v => v.id === videoId);
      
      if (!videoToDelete) {
        toast.error("Video not found");
        return;
      }

      // First remove all project and project type associations
      await removeVideoAssociations(
        videoId,
        videoToDelete.projects || [],
        videoToDelete.projecttypes || []
      );

      // Then delete the video itself
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/deletevideo/${videoId}`,
        { withCredentials: true }
      );

      // Update local state
      setVideos(prev => prev.filter(v => v.id !== videoId));
      toast.success("Video and all associations deleted successfully");
    } catch (err) {
      console.error("Error deleting video:", err);
      toast.error(
        err.response?.data?.message || 
        "Failed to delete video and associations"
      );
    } finally {
      setDeleteId(null);
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesProjects = selectedProjects.length === 0 || 
      (video.projects?.some(p => selectedProjects.some(sp => sp.value === p.id.toString())));
    const matchesProjectTypes = selectedProjectTypes.length === 0 || 
      (video.projecttypes?.some(pt => selectedProjectTypes.some(spt => spt.value === pt.id.toString())));
    
    return matchesSearch && matchesProjects && matchesProjectTypes;
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Video Resources</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <Button 
          className="bg-green-600 text-white"
          onClick={() => handleAction(null, "add")}
        >
          Upload New Video
        </Button>

        <div className="flex-1">
          <Input
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label>Filter by Projects</Label>
          <MultiSelect
            options={projects.map(p => ({
              value: p.id.toString(),
              label: p.title || `Project ${p.id}`
            }))}
            value={selectedProjects}
            onChange={setSelectedProjects}
            placeholder="Select projects..."
          />
        </div>
        
        <div className="space-y-2">
          <Label>Filter by Project Types</Label>
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
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading videos...</div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {videos.length === 0 ? "No videos available" : "No videos match your filters"}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="p-3">ID</th>
                <th className="p-3">Video</th>
                <th className="p-3">Title</th>
                <th className="p-3">Projects</th>
                <th className="p-3">Project Types</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVideos.map((video) => (
                <tr key={video.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{video.id}</td>
                  <td className="p-3">{
                    video.videopath ? (
                      <video 
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.videopath.replace(/\\/g, "/")}`}
                        width={120}
                        height={80}
                        controls
                        className="rounded object-cover"
                      />
                    ) : (
                      <a 
                        href={video.videourl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        YouTube Link
                      </a>
                    )
                  }</td>
                  <td className="p-3">{video.title || "Untitled"}</td>
                  <td className="p-3">{
                    video.projects?.map(p => p.title || `Project ${p.id}`).join(", ") || "None"
                  }</td>
                  <td className="p-3">{
                    video.projecttypes?.map(pt => pt.title || `Type ${pt.id}`).join(", ") || "None"
                  }</td>
                  <td className="p-3 flex gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleAction(video, "view")}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleAction(video, "edit")}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setDeleteId(video.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <VideoSidebar
        open={showSidebar}
        video={selectedVideo}
        actionType={actionType}
        projects={projects}
        projectTypes={projectTypes}
        onClose={handleCloseSidebar}
        onSave={handleVideoSaved}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Confirm Delete"
        description="Are you sure you want to delete this video and all its associations? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}