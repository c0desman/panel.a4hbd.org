"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";

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
    formState: { errors } 
  } = useForm();
  
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState(null);

  // Watch the name field for auto-slug generation
  const watchedName = watch("name");

  /**
   * Generate slug from name/title
   * Converts: "Technology News" -> "technology-news"
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
      reset({ name: category?.name || "", slug: category?.slug || "" });
      setPreview(category?.imagepath
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${category.imagepath.replace(/\\/g, "/")}`
        : "");
      setFile(null);
    }
  }, [category, open, reset]);

  /**
   * Auto-generate slug when name changes
   * Only generates slug if current slug is empty or matches the previous auto-generated slug
   */
  useEffect(() => {
    if (watchedName && open) {
      const newSlug = generateSlug(watchedName);
      setValue("slug", newSlug);
    }
  }, [watchedName, setValue, open]);

  const handleFile = e => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const onSubmit = async (data) => {
    const form = new FormData();
    form.append("name", data.name);
    form.append("slug", data.slug);
    if (file) {
      form.append("image", file);
    }

    try {
      if (category) {
        form.append("id", category.id);
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/editcatagory`,
          form,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const updated = {
          ...category,
          name: data.name,
          slug: data.slug,
          imagepath: file
            ? URL.createObjectURL(file)
            : category.imagepath,
        };

        toast.success("Category updated");
        onCategoryUpdate(updated);
      } else {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/createcatagory`,
          form,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const added = {
          id: res.data?.id || Date.now(),
          name: data.name,
          slug: data.slug,
          imagepath: file ? URL.createObjectURL(file) : "",
        };

        toast.success("Category created");
        onCategoryAdd(added);
      }

      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error saving category"
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white border-l shadow-xl z-50 overflow-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-100">
        <h2 className="text-lg font-semibold">
          {category ? "Edit Category" : "Add Category"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
        <div className="space-y-1">
          <Label>Image</Label>
          {preview && (
            <div className="relative w-20 h-20">
              <Image src={preview} alt="Preview" fill className="object-cover rounded" />
            </div>
          )}
          <Input type="file" accept="image/*" onChange={handleFile} />
        </div>

        <div className="space-y-1">
          <Label>Name</Label>
          <Input {...register("name", { required: "Name required" })}/>
          {errors.name && <p className="text-red-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Slug</Label>
          <Input 
            {...register("slug", { required: "Slug required" })}
            placeholder="Auto-generated from name (editable)"
          />
          {errors.slug && <p className="text-red-600">{errors.slug.message}</p>}
        </div>

        <div className="flex justify-between mt-6 gap-2">
          <Button type="submit" className="w-1/2 bg-green-600">
            {category ? "Save Changes" : "Add Category"}
          </Button>
          <Button type="button" className="w-1/2" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}