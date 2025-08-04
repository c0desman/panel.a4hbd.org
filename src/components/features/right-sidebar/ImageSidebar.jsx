"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import axios from "axios";
import { toast } from "sonner";

export default function ImageSidebar({
  open,
  image,
  actionType,
  projects,
  projectTypes,
  onClose,
  onSave,
}) {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [previewImage, setPreviewImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedProjectTypes, setSelectedProjectTypes] = useState([]);
  const [originalProjects, setOriginalProjects] = useState([]);
  const [originalProjectTypes, setOriginalProjectTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (image) {
      reset({
        title: image.title || "",
        alt: image.alt || "",
        description: image.description || "",
        caption: image.caption || "",
      });

      setPreviewImage(
        image.imagepath 
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${image.imagepath.replace(/\\/g, "/")}`
          : ""
      );

      // Initialize selected projects and keep original state
      const initialProjects = image.projects?.map(p => ({
        value: p.id.toString(),
        label: p.title || `Project ${p.id}`
      })) || [];
      setSelectedProjects(initialProjects);
      setOriginalProjects(initialProjects);

      // Initialize selected project types and keep original state
      const initialProjectTypes = image.projecttypes?.map(pt => ({
        value: pt.id.toString(),
        label: pt.title || `Project Type ${pt.id}`
      })) || [];
      setSelectedProjectTypes(initialProjectTypes);
      setOriginalProjectTypes(initialProjectTypes);
    } else {
      reset({
        title: "",
        alt: "",
        description: "",
        caption: "",
      });
      setPreviewImage("");
      setSelectedProjects([]);
      setSelectedProjectTypes([]);
      setOriginalProjects([]);
      setOriginalProjectTypes([]);
    }
  }, [image, open, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectURL = URL.createObjectURL(file);
      setPreviewImage(objectURL);
      
      const baseName = file.name.split(".")[0];
      if (!image?.title) setValue("title", baseName);
      if (!image?.alt) setValue("alt", baseName);
    }
  };

  const handleRemoveAssociations = async (imageId, removedProjects, removedProjectTypes) => {
    try {
      // Remove project associations
      await Promise.all(
        removedProjects.map(async (projectId) => {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/removeimageproject/${imageId}/${projectId}`,
            { withCredentials: true }
          );
        })
      );

      // Remove project type associations
      await Promise.all(
        removedProjectTypes.map(async (projectTypeId) => {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/removeimageprojecttype/${imageId}/${projectTypeId}`,
            { withCredentials: true }
          );
        })
      );
    } catch (err) {
      console.error("Error removing associations:", err);
      throw err;
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      if (image) {
        // For edit mode
        const imageId = image.id;
        
        // Get current and original selections
        const currentProjectIds = selectedProjects.map(p => p.value);
        const originalProjectIds = originalProjects.map(p => p.value);
        
        const currentProjectTypeIds = selectedProjectTypes.map(pt => pt.value);
        const originalProjectTypeIds = originalProjectTypes.map(pt => pt.value);

        // Find removed associations
        const removedProjects = originalProjectIds.filter(
          id => !currentProjectIds.includes(id)
        );
        
        const removedProjectTypes = originalProjectTypeIds.filter(
          id => !currentProjectTypeIds.includes(id)
        );

        // Remove old associations if needed
        if (removedProjects.length > 0 || removedProjectTypes.length > 0) {
          await handleRemoveAssociations(imageId, removedProjects, removedProjectTypes);
        }

        // Prepare form data for update
        const formData = new FormData();
        formData.append("id", imageId);
        formData.append("title", data.title);
        formData.append("alt", data.alt);
        formData.append("description", data.description);
        formData.append("caption", data.caption);

        // Add new project IDs
        currentProjectIds.forEach(projectId => {
          formData.append("projectIds", projectId);
        });

        // Add new project type IDs
        currentProjectTypeIds.forEach(typeId => {
          formData.append("projectTypeIds", typeId);
        });

        if (selectedFile) {
          formData.append("imagepath", selectedFile);
        }

        // Update the image
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/editimage`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Image updated successfully");
      } else {
        // For create mode (existing implementation)
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("alt", data.alt);
        formData.append("description", data.description);
        formData.append("caption", data.caption);
        
        selectedProjects.forEach(project => {
          formData.append("projectIds", project.value);
        });
        
        selectedProjectTypes.forEach(type => {
          formData.append("projectTypeIds", type.value);
        });
        
        if (selectedFile) {
          formData.append("imagepath", selectedFile);
        }

        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/createimage`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Image created successfully");
      }
      
      onSave();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Error saving image"
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
            ? "Image Details" 
            : image 
              ? "Edit Image" 
              : "Upload New Image"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X />
        </Button>
      </div>

      <form className="p-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {actionType === "view" ? (
          <>
            <div>
              <Label>Image</Label>
              {previewImage && (
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={200}
                  height={150}
                  className="rounded mt-2 object-cover"
                />
              )}
            </div>

            <div>
              <Label>Title</Label>
              <p className="mt-1">{image?.title || "Untitled"}</p>
            </div>

            <div>
              <Label>Alt Text</Label>
              <p className="mt-1">{image?.alt || "None"}</p>
            </div>

            <div>
              <Label>Description</Label>
              <p className="mt-1">{image?.description || "None"}</p>
            </div>

            <div>
              <Label>Caption</Label>
              <p className="mt-1">{image?.caption || "None"}</p>
            </div>

            <div>
              <Label>Projects</Label>
              <p className="mt-1">
                {image?.projects?.map(p => p.title || `Project ${p.id}`).join(", ") || "None"}
              </p>
            </div>

            <div>
              <Label>Project Types</Label>
              <p className="mt-1">
                {image?.projecttypes?.map(pt => pt.title || `Type ${pt.id}`).join(", ") || "None"}
              </p>
            </div>
          </>
        ) : (
          <>
            <div>
              <Label>Image</Label>
              {previewImage && (
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={200}
                  height={150}
                  className="rounded mt-2 object-cover"
                />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isSubmitting}
                className="mt-2"
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
              <Label>Caption</Label>
              <Textarea
                {...register("caption")}
                rows={2}
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
                {isSubmitting ? "Saving..." : (image ? "Save Changes" : "Upload Image")}
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