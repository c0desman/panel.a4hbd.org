"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InitiativesSidebar({
  open,
  initiative,
  onClose,
  onInitiativeUpdate,
  onInitiativeDelete,
  onInitiativeCreate,
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const isEditMode = !!initiative;

  useEffect(() => {
    if (initiative) {
      setName(initiative.name);
      setSlug(initiative.slug);
      setDescription(initiative.description);
      setImage(initiative.image);
      setPreviewImage(initiative.image);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setImage("");
      setPreviewImage("");
    }
  }, [initiative]);

  if (!open) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setImage(url);
    }
  };

  const handleSubmit = () => {
    const data = {
      name,
      slug,
      description,
      image,
      id: isEditMode ? initiative.id : Date.now(), // Use current timestamp for demo ID
    };
    if (isEditMode) {
      onInitiativeUpdate(data);
    } else {
      onInitiativeCreate(data);
    }
    onClose();
  };

  const handleDelete = () => {
    if (initiative) {
      onInitiativeDelete(initiative.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white border-l shadow-xl z-50 overflow-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-100">
        <h2 className="text-lg font-semibold">
          {isEditMode ? "Edit Initiative" : "Add Initiative"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Image Preview */}
        <div className="space-y-1">
          <Label>Image</Label>
          {previewImage && (
            <Image src={previewImage} alt="Preview" width={80} height={80} className="rounded" />
          )}
          <Input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {/* Name */}
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {/* Slug */}
        <div className="space-y-1">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description for the initiative"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6 gap-2">
          <Button className="w-1/2 bg-green-600" onClick={handleSubmit}>
            {isEditMode ? "Save Changes" : "Add Initiative"}
          </Button>
          <Button className="w-1/2" onClick={onClose}>
            Cancel
          </Button>
        </div>

        {/* Delete Button */}
        {isEditMode && (
          <div className="mt-4">
            <Button variant="destructive" className="w-full" onClick={handleDelete}>
              Delete Initiative
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
