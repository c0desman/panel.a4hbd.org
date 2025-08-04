"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import ImageSidebar from "@/components/features/right-sidebar/ImageSidebar";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";
import { toast } from "sonner";
import axios from "axios";

export default function ImagesPage() {
  const [images, setImages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedProjectTypes, setSelectedProjectTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionType, setActionType] = useState('add');

  useEffect(() => {
    fetchImages();
    fetchProjects();
    fetchProjectTypes();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      let endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/images`;
      const params = { page: 1, limit: 100 };
      
      if (searchTerm) {
        endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/search`;
        params.search = searchTerm;
      }
      
      const res = await axios.get(endpoint, {
        params,
        withCredentials: true,
      });
      setImages(res.data.images || []);
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error("Failed to load images");
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
      fetchImages();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleAction = async (image, type) => {
    setActionType(type);
    if (type === "edit" || type === "view") {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${image.id}`, {
          withCredentials: true,
        });
        setSelectedImage(res.data.image);
      } catch (err) {
        toast.error("Failed to load image details");
        return;
      }
    } else {
      setSelectedImage(null);
    }
    setShowSidebar(true);
  };

  const handleCloseSidebar = () => {
    setSelectedImage(null);
    setShowSidebar(false);
  };

  const handleImageSaved = () => {
    fetchImages();
    handleCloseSidebar();
  };

  const removeImageAssociations = async (imageId, projects, projectTypes) => {
    try {
      // Remove all project associations
      await Promise.all(
        projects.map(async (project) => {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/removeimageproject/${imageId}/${project.id}`,
            { withCredentials: true }
          );
        })
      );

      // Remove all project type associations
      await Promise.all(
        projectTypes.map(async (projectType) => {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/removeimageprojecttype/${imageId}/${projectType.id}`,
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
      const imageId = deleteId;
      const imageToDelete = images.find(i => i.id === imageId);
      
      if (!imageToDelete) {
        toast.error("Image not found");
        return;
      }

      // First remove all project and project type associations
      await removeImageAssociations(
        imageId,
        imageToDelete.projects || [],
        imageToDelete.projecttypes || []
      );

      // Then delete the image itself
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/deleteimage/${imageId}`,
        { withCredentials: true }
      );

      // Update local state
      setImages(prev => prev.filter(i => i.id !== imageId));
      toast.success("Image and all associations deleted successfully");
    } catch (err) {
      console.error("Error deleting image:", err);
      toast.error(
        err.response?.data?.message || 
        "Failed to delete image and associations"
      );
    } finally {
      setDeleteId(null);
    }
  };

  const filteredImages = images.filter(image => {
    const matchesSearch = image.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesProjects = selectedProjects.length === 0 || 
      (image.projects?.some(p => selectedProjects.some(sp => sp.value === p.id.toString())));
    const matchesProjectTypes = selectedProjectTypes.length === 0 || 
      (image.projecttypes?.some(pt => selectedProjectTypes.some(spt => spt.value === pt.id.toString())));
    
    return matchesSearch && matchesProjects && matchesProjectTypes;
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Image Resources</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <Button 
          className="bg-green-600 text-white"
          onClick={() => handleAction(null, "add")}
        >
          Upload New Image
        </Button>

        <div className="flex-1">
          <Input
            placeholder="Search images..."
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
        <div className="text-center py-8">Loading images...</div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {images.length === 0 ? "No images available" : "No images match your filters"}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="p-3">Image</th>
                <th className="p-3">Title</th>
                <th className="p-3">Projects</th>
                <th className="p-3">Project Types</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredImages.map((image) => (
                <tr key={image.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <Image
                      src={image.imagepath ? 
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/${image.imagepath.replace(/\\/g, "/")}` : 
                        '/images/default-image.png'}
                      alt={image.alt || "Image"}
                      width={60}
                      height={60}
                      className="rounded object-cover"
                    />
                  </td>
                  <td className="p-3">{image.title || "Untitled"}</td>
                  <td className="p-3">
                    {image.projects?.map(p => p.title || `Project ${p.id}`).join(", ") || "None"}
                  </td>
                  <td className="p-3">
                    {image.projecttypes?.map(pt => pt.title || `Type ${pt.id}`).join(", ") || "None"}
                  </td>
                  <td className="p-3 flex gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleAction(image, "view")}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleAction(image, "edit")}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setDeleteId(image.id)}
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

      <ImageSidebar
        open={showSidebar}
        image={selectedImage}
        actionType={actionType}
        projects={projects}
        projectTypes={projectTypes}
        onClose={handleCloseSidebar}
        onSave={handleImageSaved}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Confirm Delete"
        description="Are you sure you want to delete this image and all its associations? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}