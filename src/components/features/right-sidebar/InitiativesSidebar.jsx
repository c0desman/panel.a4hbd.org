"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";

export default function InitiativesSidebar({
  open,
  initiative,
  onClose,
  onInitiativeUpdate,
  onInitiativeAdd,
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState(null);

  const isEdit = !!initiative;

  /**
   * Generate slug from name/title
   * Converts: "Clean Water Initiative" -> "clean-water-initiative"
   * @param {string} name - The name/title to convert to slug
   * @returns {string} - Generated slug
   */
  const generateSlug = (name) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  useEffect(() => {
    if (open) {
      setName(initiative?.name || "");
      setSlug(initiative?.slug || "");
      setDescription(initiative?.description || "");
      setPreview(initiative?.imagepath
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${initiative.imagepath.replace(/\\/g, "/")}`
        : "");
      setFile(null);
    }
  }, [initiative, open]);

  /**
   * Handle name input change and auto-generate slug
   * @param {Event} e - Input change event
   */
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    
    // Auto-generate slug from name
    const newSlug = generateSlug(newName);
    setSlug(newSlug);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const onSubmit = async () => {
    const form = new FormData();
    form.append("name", name);
    form.append("slug", slug);
    form.append("description", description);
    if (file) {
      form.append("image", file);
    }

    try {
      if (isEdit) {
        form.append("id", initiative.id);
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/editinitiative`, form, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });

        const updated = {
          ...initiative,
          name,
          slug,
          description,
          imagepath: file ? URL.createObjectURL(file) : initiative.imagepath,
        };

        toast.success("Initiative updated");
        onInitiativeUpdate(updated);
      } else {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/createinitiative`, form, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });

        const added = {
          id: Date.now(), // temporary ID
          name,
          slug,
          description,
          imagepath: file ? URL.createObjectURL(file) : "",
        };

        toast.success("Initiative created");
        onInitiativeAdd(added);
      }

      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error saving initiative"
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white border-l shadow-xl z-50 overflow-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-100">
        <h2 className="text-lg font-semibold">{isEdit ? "Edit" : "Add"} Initiative</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-1">
          <Label>Image</Label>
          {preview && (
            <Image
              src={preview}
              alt="Preview"
              width={80}
              height={80}
              className="rounded object-cover"
            />
          )}
          <Input type="file" accept="image/*" onChange={handleFile} />
        </div>

        <div className="space-y-1">
          <Label>Name</Label>
          <Input 
            value={name} 
            onChange={handleNameChange}
          />
        </div>

        <div className="space-y-1">
          <Label>Slug</Label>
          <Input 
            value={slug} 
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Auto-generated from name (editable)"
          />
        </div>

        <div className="space-y-1">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="flex justify-between mt-6 gap-2">
          <Button className="w-1/2 bg-green-600 text-white" onClick={onSubmit}>
            {isEdit ? "Save Changes" : "Add Initiative"}
          </Button>
          <Button className="w-1/2" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}