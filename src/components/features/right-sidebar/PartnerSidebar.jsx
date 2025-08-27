// @/components/features/right-sidebar/PartnerSidebar.jsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { toast } from "sonner";

export default function PartnerSidebar({
  open,
  partner,
  actionType,
  onClose,
  onPartnerUpdate,
  onPartnerAdd,
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

  // Watch the name field for auto-slug generation
  const watchedName = watch("name");

  /**
   * Generate slug from name/title
   * Converts: "IHHH Foundation" -> "ihhh-foundation"
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
    if (partner) {
      reset({
        name: partner.name,
        slug: partner.slug,
        status: partner.status,
        address: partner.address,
        about: partner.about,
      });
      setPreviewImage(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${partner.imagepath}`);
    } else {
      reset({ name: "", slug: "", status: "active", address: "", about: "" });
      setPreviewImage("");
    }
  }, [partner, open, reset]);

  /**
   * Auto-generate slug when name changes
   * Only generates slug if current slug is empty or matches the previous auto-generated slug
   */
  useEffect(() => {
    if (watchedName && actionType !== 'view') {
      const newSlug = generateSlug(watchedName);
      setValue("slug", newSlug);
    }
  }, [watchedName, setValue, actionType]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("slug", data.slug);
      formData.append("status", data.status);
      formData.append("address", data.address || "");
      formData.append("about", data.about || "");
      if (selectedFile) formData.append("image", selectedFile);
      if (partner) formData.append("id", partner.id);

      const endpoint = partner
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/editpartner`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/createpartner`;

      await axios.post(endpoint, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`Partner ${partner ? "updated" : "created"} successfully`);
      partner ? onPartnerUpdate() : onPartnerAdd();
    } catch (error) {
      console.error("Form submit error:", error);
      toast.error("Failed to submit partner");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white border-l shadow-xl z-50 overflow-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-100">
        <h2 className="text-lg font-semibold">
          {actionType === 'view' ? 'Partner Details' : partner ? 'Edit Partner' : 'Add New Partner'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
      </div>

      <form className="p-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {actionType === 'view' ? (
          <>
            <Label className='mb-2'>ID</Label><p>{partner?.id}</p>
            <Label className='mb-2'>Image</Label>
            {previewImage && <Image src={previewImage} alt="Preview" width={60} height={60} className="rounded" />}
            <Label className='mb-2'>Name</Label><p>{partner?.name}</p>
            <Label className='mb-2'>Slug</Label><p>{partner?.slug}</p>
            <Label className='mb-2'>Status</Label><p>{partner?.status}</p>
            <Label className='mb-2'>Address</Label><p>{partner?.address}</p>
            <Label className='mb-2'>About</Label><p>{partner?.about}</p>
          </>
        ) : (
          <>
            <div>
              <Label className='mb-2'>Image</Label>
              {previewImage && <Image src={previewImage} alt="Preview" width={60} height={60} className="rounded mb-2" />}
              <Input type="file" accept="image/*" onChange={handleImageChange} />
            </div>

            <div>
              <Label className='mb-2'>Name</Label>
              <Input {...register("name", { required: "Name is required" })} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div>
              <Label className='mb-2'>Slug</Label>
              <Input 
                {...register("slug", { required: "Slug is required" })} 
                placeholder="Auto-generated from name (editable)"
              />
              {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
            </div>

            <div>
              <Label className='mb-2'>Status</Label>
              <Select onValueChange={(value) => setValue("status", value)} defaultValue="active">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className='mb-2'>Address</Label>
              <Input {...register("address")} />
            </div>

            <div>
              <Label className='mb-2'>About</Label>
              <textarea {...register("about")} className="w-full border rounded p-2" rows={4}></textarea>
            </div>

            <div className="flex gap-2 mt-4">
              <Button type="submit" className="bg-green-600 text-white flex-1">
                {partner ? "Save Changes" : "Add Partner"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}