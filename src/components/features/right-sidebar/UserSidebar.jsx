"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Pencil, Upload, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Image from "next/image";
import { useState } from "react";

export default function UserSidebar({
  open,
  onClose,
  user = {},
  onUpdate,
  onDelete,
  onAdd,
  mode = "view", // "view" | "edit" | "add"
}) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "User",
      status: user.status || "Active",
      password: "",
      bio: user.bio || "",
      avatar: null,
      avatarPreview: user.avatar || "/images/default-avatar.png",
    },
  });

  const avatarPreview = watch("avatarPreview");

  useEffect(() => {
    reset({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "User",
      status: user.status || "Active",
      password: "",
      bio: user.bio || "",
      avatar: null,
      avatarPreview: user.avatar || "/images/default-avatar.png",
    });
  }, [user, mode, reset]);

  const onSubmit = (data) => {
    const payload = { ...user, ...data };
    if (mode === "add") onAdd(payload);
    else if (mode === "edit") onUpdate(payload);
    onClose();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setValue("avatar", file);
      setValue("avatarPreview", URL.createObjectURL(file));
    }
  };

  if (!open) return null;

  const isReadOnly = mode === "view";

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white z-50 shadow-xl border-l overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-lg font-semibold text-gray-800">
          {mode === "add"
            ? "Add New User"
            : mode === "edit"
            ? "Edit Profile"
            : "Profile Details"}
        </h2>
        <div className="flex items-center gap-2">
          {mode === "view" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUpdate({ ...user })}
              className="hover:bg-blue-100 text-blue-600"
            >
              <Pencil className="h-5 w-5" />
            </Button>
          )}
          {mode !== "add" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="hover:bg-red-100 text-red-600"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-red-100 text-red-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isReadOnly ? (
        // VIEW MODE
        <div className="p-6 space-y-6 text-gray-800">
          <div className="flex flex-col items-center gap-4">
            <Image
              src={user.avatar || "/images/default-avatar.png"}
              alt="User Avatar"
              width={120}
              height={120}
              className="rounded-full border-4 border-white shadow-lg object-cover"
            />
            <h3 className="text-xl font-bold">{`${user.firstName} ${user.lastName}`}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Phone:</span>
              <span className="text-gray-800">{user.phone || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Role:</span>
              <span className="text-gray-800">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Status:</span>
              <span
                className={`px-2 py-0.5 text-sm rounded-full ${
                  user.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.status}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600 block mb-1">Bio:</span>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {user.bio || "No bio available."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        // EDIT / ADD MODE
        <form className="p-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Image
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
                name="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700">First Name</Label>
                <Input {...register("firstName")} className="focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Last Name</Label>
                <Input {...register("lastName")} className="focus:ring-blue-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Email Address</Label>
              <Input
                type="email"
                {...register("email")}
                className="focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Phone Number</Label>
              <Input
                type="tel"
                {...register("phone")}
                className="focus:ring-blue-500"
              />
            </div>

            {mode === "add" && (
              <div className="space-y-2">
                <Label className="text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700">Role</Label>
                <Select
                  value={watch("role")}
                  onValueChange={(value) => setValue("role", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Status</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(value) => setValue("status", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Bio</Label>
              <Textarea
                {...register("bio")}
                className="min-h-[100px] focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-6">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {mode === "add" ? "Add User" : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}