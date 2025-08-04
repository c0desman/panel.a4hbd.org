"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import axios from "axios";
import { toast } from "sonner";

export default function CardSidebar({
  open,
  card,
  actionType,
  projects,
  onClose,
  onCardSaved,
}) {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [previewIcon, setPreviewIcon] = useState(null); // Changed to null instead of empty string
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (card) {
      reset({
        title: card.title || "",
        number: card.number || "",
        suffix: card.suffix || "",
        text: card.text || "",
      });
      
      // Only set previewIcon if card has an icon
      setPreviewIcon(
        card.icon 
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${card.icon.replace(/\\/g, "/")}`
          : null
      );
      
      // Initialize selected projects
      const initialProjects = [];
      if (card.projects && card.projects.length > 0) {
        card.projects.forEach(p => {
          initialProjects.push({
            value: p.id.toString(),
            label: p.title
          });
        });
      }
      setSelectedProjects(initialProjects);
    } else {
      reset({
        title: "",
        number: "",
        suffix: "",
        text: "",
      });
      setPreviewIcon(null); // Set to null instead of empty string
      setSelectedProjects([]);
    }
  }, [card, open, reset]);

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectURL = URL.createObjectURL(file);
      setPreviewIcon(objectURL);
    } else {
      setPreviewIcon(null); // Set to null when no file selected
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const formData = new FormData();
    
    formData.append("title", data.title);
    formData.append("number", data.number);
    formData.append("suffix", data.suffix || "");
    formData.append("text", data.text);
    
    // Add project IDs
    selectedProjects.forEach(project => {
      formData.append("projectids", project.value);
    });
    
    if (selectedFile) {
      formData.append("icon", selectedFile);
    }

    try {
      if (card) {
        formData.append("id", card.id);
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/editcard`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Card updated successfully");
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/createcard`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Card created successfully");
      }
      onCardSaved();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Error saving card"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white border-l shadow-xl z-50 overflow-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-100">
        <h2 className="text-lg font-semibold">
          {actionType === "view"
            ? "Card Details"
            : card
            ? "Edit Card"
            : "Add New Card"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X />
        </Button>
      </div>

      <form className="p-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {actionType === "view" ? (
          <>
            <div>
              <Label>Title</Label>
              <p className="mt-1">{card?.title}</p>
            </div>
            
            <div>
              <Label>Number</Label>
              <p className="mt-1">{card?.number}{card?.suffix}</p>
            </div>
            
            <div>
              <Label>Text</Label>
              <p className="mt-1">{card?.text}</p>
            </div>
            
            <div>
              <Label>Icon</Label>
              {previewIcon ? ( // Only render Image if previewIcon exists
                <Image
                  src={previewIcon}
                  alt="Card icon"
                  width={80}
                  height={80}
                  className="rounded mt-2"
                />
              ) : (
                <p className="mt-1 text-gray-500">No icon</p>
              )}
            </div>
            
            <div>
              <Label>Projects</Label>
              <p className="mt-1">
                {card?.projects?.map(p => p.title).join(", ") || "No projects assigned"}
              </p>
            </div>
          </>
        ) : (
          <>
            <div>
              <Label>Title</Label>
              <Input
                {...register("title", { required: "Title is required" })}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label>Number</Label>
              <Input
                type="number"
                {...register("number", { 
                  required: "Number is required",
                  valueAsNumber: true
                })}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label>Suffix (optional)</Label>
              <Input
                {...register("suffix")}
                placeholder="+, %, etc."
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label>Text</Label>
              <Textarea
                {...register("text", { required: "Text is required" })}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label>Icon</Label>
              {previewIcon ? ( // Only render Image if previewIcon exists
                <Image
                  src={previewIcon}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="rounded mt-2"
                />
              ) : (
                <p className="mt-2 text-gray-500">No icon selected</p>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleIconChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Projects</Label>
              <MultiSelect
                options={projects.map(project => ({
                  value: project.id.toString(),
                  label: project.title
                }))}
                value={selectedProjects}
                onChange={setSelectedProjects}
                placeholder="Select projects..."
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : card ? "Save Changes" : "Add Card"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
           </>
        )}
      </form>
    </div>
  );
}