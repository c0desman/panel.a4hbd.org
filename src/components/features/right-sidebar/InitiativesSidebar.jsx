"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InitiativesSidebar({ open, initiative, onClose, onInitiativeUpdate, onInitiativeDelete }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    if (initiative) {
      setName(initiative.name);
      setSlug(initiative.slug);
      setDescription(initiative.description);
      setImage(initiative.image);
      setPreviewImage(initiative.image);
    }
  }, [initiative]);

  if (!open || !initiative) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setImage(url); // For demo purposes, using object URL instead of uploading
    }
  };

  const handleUpdate = () => {
    onInitiativeUpdate({ ...initiative, name, slug, description, image });
  };

  const handleDelete = () => {
    onInitiativeDelete(initiative.id);
    onClose(); // Close the sidebar after deleting
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white border-l shadow-xl z-50 overflow-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-100">
        <h2 className="text-lg font-semibold">Edit Initiative</h2>
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

        {/* Buttons */}
        <div className="flex justify-between mt-6 gap-2">
          <Button className="w-1/2 bg-green-600" onClick={handleUpdate}>
            Save Changes
          </Button>
          <Button className="w-1/2" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
