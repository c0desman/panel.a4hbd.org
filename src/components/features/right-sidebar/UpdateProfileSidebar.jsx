"use client";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { X, Eye, EyeOff, Upload } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";

export default function UpdateProfileSidebar({ open, onClose, user, onUpdate }) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      bio: "",
      password: "",
      image: null,
      avatarPreview: "/images/default-avatar.png", // Default avatar
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.profile.bio || "",
        password: "",
        image: null,
        avatarPreview: `${process.env.NEXT_PUBLIC_BACKEND_URL}/${user.profile.profilepicture}` || "/images/default-avatar.png",
      });
    }
  }, [user, reset]);

  const avatarPreview = watch("avatarPreview");

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setValue("image", file);
      setValue("avatarPreview", URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("bio", data.bio);
    if (data.password) formData.append("password", data.password);
    if (data.image) formData.append("image", data.image);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/editprofile`,
        formData,
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success("Profile updated successfully");

        // ✅ REFETCH updated user info
        const profileRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile`, {
          withCredentials: true,
        });

        onUpdate(profileRes.data.data);
        onClose();
      }
    } catch (error) {
      if (error.response) {
        const code = error.response.status;
        if (code === 400) toast.error("Invalid input fields");
        else if (code === 401) toast.error("Unauthorized request");
        else toast.error("Something went wrong");
      } else {
        toast.error("Network error");
      }
    }
  };


  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white z-50 shadow-xl border-l overflow-auto">
      <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-lg font-semibold text-gray-800">Edit Profile</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-red-100 text-red-600"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form className="p-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <Image
              loading="lazy"
              src={avatarPreview}
              alt="User Avatar"
              width={120}
              height={120}
              className="rounded-full border-4 border-white shadow-lg object-cover"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-5 w-5 text-white" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700 mb-2">First Name</Label>
              <Input {...register("first_name")} />
            </div>
            <div>
              <Label className="text-gray-700 mb-2">Last Name</Label>
              <Input {...register("last_name")} />
            </div>
          </div>

          <div>
            <Label className="text-gray-700 mb-2">Email</Label>
            <Input type="email" {...register("email")} />
          </div>

          <div>
            <Label className="text-gray-700 mb-2">Phone</Label>
            <Input type="tel" {...register("phone")} />
          </div>

          <div>
            <Label className="text-gray-700 mb-2">Bio</Label>
            <Textarea {...register("bio")} className="min-h-[100px]" />
          </div>

          <div>
            <Label className="text-gray-700 mb-2">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Leave blank to keep existing"
                {...register("password")}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave blank if you don't want to change password.
            </p>
          </div>

          <div className="flex gap-2 pt-6">
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Updating..." : "Update Profile"}
            </Button>
            <Button type="button" variant="destructive" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
