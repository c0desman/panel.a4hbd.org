"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CategorySidebar({
  open,
  category,
  onClose,
  onCategoryUpdate,
  onCategoryAdd,
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const [previewImage, setPreviewImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Initialize form values and preview when sidebar opens
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
      });
      setPreviewImage(category.image);
      setSelectedFile(null); // reset file input
    } else {
      reset({ name: "", slug: "" });
      setPreviewImage("");
      setSelectedFile(null);
    }
  }, [category, open, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const onSubmit = async (data) => {
    // Simulated file upload (replace with your actual API logic)
    let imageUrl = category?.image || "";

    if (selectedFile) {
      // Upload logic goes here (e.g. API call or FormData)
      // Example mock:
      imageUrl = URL.createObjectURL(selectedFile); // For demo only
    }

    const payload = {
      ...data,
      image: imageUrl,
    };

    if (category) {
      onCategoryUpdate({ ...category, ...payload });
    } else {
      const newCategory = {
        id: Date.now(), // Replace with backend ID if needed
        ...payload,
      };
      onCategoryAdd(newCategory);
    }

    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white border-l shadow-xl z-50 overflow-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-100">
        <h2 className="text-lg font-semibold">
          {category ? "Edit Category" : "Add New Category"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X />
        </Button>
      </div>

      <form className="p-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Image Preview and Upload */}
        <div className="space-y-1">
          <Label>Image</Label>
          {previewImage && (
            <div className="relative w-20 h-20">
              <Image
                src={previewImage}
                alt="Preview"
                fill
                className="object-cover rounded"
              />
            </div>
          )}
          <Input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {/* Name */}
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-1">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            {...register("slug", { required: "Slug is required" })}
          />
          {errors.slug && (
            <p className="text-sm text-red-600">{errors.slug.message}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6 gap-2">
          <Button type="submit" className="w-1/2 bg-green-600">
            {category ? "Save Changes" : "Add Category"}
          </Button>
          <Button className="w-1/2" type="button" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
