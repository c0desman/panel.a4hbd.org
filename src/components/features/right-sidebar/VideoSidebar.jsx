"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import axios from "axios";
import { toast } from "sonner";

export default function VideoSidebar({
  open,
  video,
  actionType,
  projects,
  projectTypes,
  onClose,
  onSave,
}) {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [previewVideo, setPreviewVideo] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedProjectTypes, setSelectedProjectTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (video) {
      // Reset form with video data
      reset({
        title: video.title || "",
        videourl: video.videourl || "",
        alt: video.alt || "",
        description: video.description || "",
      });

      // Set video preview
      if (video.videopath) {
        setPreviewVideo(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.videopath.replace(/\\/g, "/")}`);
      } else if (video.videourl) {
        setPreviewVideo(video.videourl);
      } else {
        setPreviewVideo("");
      }

      // Set selected projects
      if (video.projects && video.projects.length > 0) {
        const projectOptions = video.projects.map(p => ({
          value: p.id.toString(),
          label: p.title || `Project ${p.id}`
        }));
        setSelectedProjects(projectOptions);
      } else {
        setSelectedProjects([]);
      }

      // Set selected project types
      if (video.projecttypes && video.projecttypes.length > 0) {
        const typeOptions = video.projecttypes.map(pt => ({
          value: pt.id.toString(),
          label: pt.title || `Project Type ${pt.id}`
        }));
        setSelectedProjectTypes(typeOptions);
      } else {
        setSelectedProjectTypes([]);
      }
    } else {
      // Reset form for new video
      reset({
        title: "",
        videourl: "",
        alt: "",
        description: "",
      });
      setPreviewVideo("");
      setSelectedProjects([]);
      setSelectedProjectTypes([]);
    }
  }, [video, open, reset]);

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectURL = URL.createObjectURL(file);
      setPreviewVideo(objectURL);
      
      // Set default title and alt from filename if empty
      const baseName = file.name.split(".")[0];
      if (!video?.title) setValue("title", baseName);
      if (!video?.alt) setValue("alt", baseName);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      if (video) {
        // Edit existing video
        formData.append("id", video.id);
        formData.append("title", data.title);
        formData.append("alt", data.alt);
        formData.append("description", data.description);
        formData.append("videourl", data.videourl);

        // Add project associations
        selectedProjects.forEach(project => {
          formData.append("projectIds", project.value);
        });

        // Add project type associations
        selectedProjectTypes.forEach(type => {
          formData.append("projectTypeIds", type.value);
        });

        if (selectedFile) {
          formData.append("videopath", selectedFile);
        }

        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/editvideo`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Video updated successfully");
      } else {
        // Create new video
        formData.append("title", data.title);
        formData.append("alt", data.alt);
        formData.append("description", data.description);
        formData.append("videourl", data.videourl);

        selectedProjects.forEach(project => {
          formData.append("projectIds", project.value);
        });

        selectedProjectTypes.forEach(type => {
          formData.append("projectTypeIds", type.value);
        });

        if (selectedFile) {
          formData.append("videopath", selectedFile);
        }

        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/createvideo`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Video created successfully");
      }
      
      onSave();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Error saving video"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

    return (
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white border-l shadow-xl z-50 overflow-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-100">
          <h2 className="text-lg font-semibold">
            {actionType === "view" 
              ? "Video Details" 
              : video 
                ? "Edit Video" 
                : "Upload New Video"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>

        <form className="p-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {actionType === "view" ? (
            <>
              <div>
                <Label>ID</Label>
                <p className="mt-1">{video?.id || "N/A"}</p>
              </div>

              <div>
                <Label>Video</Label>
                {video?.videopath ? (
                  <video 
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.videopath.replace(/\\/g, "/")}`}
                    controls
                    width="100%"
                    className="mt-2 rounded"
                  />
                ) : video?.videourl ? (
                  <div className="mt-2">
                    <iframe
                      src={video.videourl.includes('embed') ? video.videourl : video.videourl.replace("watch?v=", "embed/")}
                      width="100%"
                      height="300"
                      frameBorder="0"
                      allowFullScreen
                      className="rounded"
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-gray-500">No video available</p>
                )}
              </div>

              <div>
                <Label>Title</Label>
                <p className="mt-1">{video?.title || "Untitled"}</p>
              </div>

              <div>
                <Label>Alt Text</Label>
                <p className="mt-1">{video?.alt || "None"}</p>
              </div>

              <div>
                <Label>Description</Label>
                <p className="mt-1">{video?.description || "None"}</p>
              </div>

              <div>
                <Label>Projects</Label>
                <p className="mt-1">
                  {video?.projects?.map(p => p.title).join(", ") || "None"}
                </p>
              </div>

              <div>
                <Label>Project Types</Label>
                <p className="mt-1">
                  {video?.projecttypes?.map(pt => pt.title).join(", ") || "None"}
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>Video File</Label>
                {previewVideo ? (
                  video.videourl ? (
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
                ) : video?.videopath ? (
                  <video 
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.videopath.replace(/\\/g, "/")}`}
                    controls
                    width="100%"
                    className="mt-2 rounded"
                  />
                ) : video?.videourl ? (
                  <div className="mt-2">
                    <iframe
                      src={video.videourl.includes('embed') ? video.videourl : video.videourl.replace("watch?v=", "embed/")}
                      width="100%"
                      height="300"
                      frameBorder="0"
                      allowFullScreen
                      className="rounded"
                    />
                  </div>
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
                  defaultValue={video?.videourl || ""}
                  disabled={isSubmitting}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  {...register("title", { required: "Title is required" })}
                  defaultValue={video?.title || ""}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label>Alt Text</Label>
                <Input
                  {...register("alt", { required: "Alt text is required" })}
                  defaultValue={video?.alt || ""}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  {...register("description")}
                  defaultValue={video?.description || ""}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label>Projects</Label>
                <MultiSelect
                  options={projects.map(p => ({
                    value: p.id.toString(),
                    label: p.title || `Project ${p.id}`
                  }))}
                  value={selectedProjects}
                  onChange={setSelectedProjects}
                  placeholder="Select projects..."
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
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    );
}