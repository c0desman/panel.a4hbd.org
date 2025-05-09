"use client";

import { useEffect, useState } from "react";
import { X, Pencil, Upload, Trash2 } from "lucide-react";
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

export default function UserSidebar({
  open,
  onClose,
  user = {},
  onUpdate,
  onDelete,
  forceEdit = false,
}) {
  const [isEditing, setIsEditing] = useState(forceEdit);
  const [form, setForm] = useState({ ...user, avatarPreview: user.avatar });

  useEffect(() => {
    setForm({
      ...user,
      avatarPreview: user.avatar || "/images/default-avatar.png"
    });
    setIsEditing(forceEdit);
  }, [user, forceEdit]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (!isEditing) return;

    if (name === "avatar" && files?.[0]) {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }
      
      setForm(prev => ({
        ...prev,
        avatar: file,
        avatarPreview: URL.createObjectURL(file)
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    onUpdate(form);
    if (!forceEdit) setIsEditing(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-background z-50 shadow-xl border-l overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-lg font-semibold text-gray-800">
          {isEditing ? "Edit Profile" : "Profile Details"}
        </h2>
        <div className="flex items-center gap-2">
          {!forceEdit && (
            <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isEditing}
              className="hover:bg-blue-100 text-blue-600"
            >
              <Pencil className="h-5 w-5" />
            </Button>
            <Button 
            variant="ghost" 
            size="icon" 
            onClick={onDelete}
            className="hover:bg-red-100 text-red-600"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
          </>
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

      <div className="p-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <Image
              src={form.avatarPreview}
              alt="User Avatar"
              width={120}
              height={120}
              className="rounded-full border-4 border-white shadow-lg object-cover"
            />
            {isEditing && (
              <>
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
                  onChange={handleChange}
                  className="hidden"
                />
              </>
            )}
          </div>
          {!isEditing && (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800">{form.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{form.role}</p>
            </div>
          )}
        </div>

        {/* Form Content */}
        <div className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label className="text-gray-700">Full Name</Label>
                <Input
                  name="name"
                  value={form.name || ""}
                  onChange={handleChange}
                  className="focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Email Address</Label>
                <Input
                  type="email"
                  name="email"
                  value={form.email || ""}
                  onChange={handleChange}
                  className="focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(value) => handleChange({ target: { name: "role", value } })}
                  >
                    <SelectTrigger className="focus:ring-blue-500">
                      <SelectValue placeholder="Select role" />
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
                    value={form.status}
                    onValueChange={(value) => handleChange({ target: { name: "status", value } })}
                  >
                    <SelectTrigger className="focus:ring-blue-500">
                      <SelectValue placeholder="Select status" />
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
                  name="bio"
                  value={form.bio || ""}
                  onChange={handleChange}
                  className="min-h-[100px] focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            <div className="space-y-4 text-gray-700">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-gray-600">{form.email}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium">Status</Label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  form.status === "Active" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {form.status}
                </span>
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium">Bio</Label>
                <p className="text-gray-600 whitespace-pre-line">{form.bio || "No bio provided"}</p>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex gap-2 pt-6">
              <Button 
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </Button>
              {onDelete && (
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}