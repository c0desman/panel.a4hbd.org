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
    formState: { errors },
  } = useForm();

  const [previewImage, setPreviewImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (partner) {
      reset({
        name: partner.name,
        slug: partner.slug,
        status: partner.status,
        address: partner.address,
        about: partner.about,
      });
      setPreviewImage(partner.image);
    } else {
      reset({
        name: "",
        slug: "",
        status: "active",
        address: "",
        about: "",
      });
      setPreviewImage("");
    }
  }, [partner, open, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      image: selectedFile ? URL.createObjectURL(selectedFile) : previewImage,
    };

    if (partner) {
      onPartnerUpdate({ ...partner, ...payload });
    } else {
      onPartnerAdd({ ...payload, id: Date.now() });
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white border-l shadow-xl z-50 overflow-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-100">
        <h2 className="text-lg font-semibold">
          {actionType === 'view' ? 'Partner Details' : 
           partner ? 'Edit Partner' : 'Add New Partner'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X />
        </Button>
      </div>

      <form className="p-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* View Mode Display */}
        {actionType === 'view' ? (
          <div className="space-y-4">
            <div>
              <Label>ID</Label>
              <p className="mt-1">{partner?.id}</p>
            </div>
            <div>
              <Label>Image</Label>
              {previewImage && (
                <div className="relative w-20 h-20 mt-1">
                  <Image
                    src={previewImage}
                    alt="Partner"
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
            </div>
            <div>
              <Label>Name</Label>
              <p className="mt-1">{partner?.name}</p>
            </div>
            <div>
              <Label>Slug</Label>
              <p className="mt-1">{partner?.slug}</p>
            </div>
            <div>
              <Label>Status</Label>
              <p className="mt-1 capitalize">{partner?.status}</p>
            </div>
            <div>
              <Label>Address</Label>
              <p className="mt-1">{partner?.address}</p>
            </div>
            <div>
              <Label>About</Label>
              <p className="mt-1 whitespace-pre-line">{partner?.about}</p>
            </div>
          </div>
        ) : (
          /* Edit/Add Form */
          <>
            <div className="space-y-1">
              <Label>Image</Label>
              {previewImage && (
                <div className="relative w-20 h-20 mb-2">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                disabled={actionType === 'view'}
              />
            </div>

            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                {...register("name", { required: "Name is required" })}
                disabled={actionType === 'view'}
              />
              {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Slug</Label>
              <Input
                {...register("slug", { required: "Slug is required" })}
                disabled={actionType === 'view'}
              />
              {errors.slug && <p className="text-red-600 text-sm">{errors.slug.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                onValueChange={(value) => setValue("status", value)}
                defaultValue={partner?.status || "active"}
                disabled={actionType === 'view'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Address</Label>
              <Input
                {...register("address")}
                disabled={actionType === 'view'}
              />
            </div>

            <div className="space-y-1">
              <Label>About Partner</Label>
              <textarea
                {...register("about")}
                className="w-full border rounded-md p-2 min-h-[100px]"
                disabled={actionType === 'view'}
              />
            </div>

            {actionType !== 'view' && (
              <div className="flex gap-2 mt-6">
                <Button type="submit" className="flex-1 bg-green-600">
                  {partner ? "Save Changes" : "Add Partner"}
                </Button>
                <Button type="button" className="flex-1" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            )}
          </>
        )}
      </form>
    </div>
  );
}