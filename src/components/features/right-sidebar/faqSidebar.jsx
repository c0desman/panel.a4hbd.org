"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import axios from "axios";
import { toast } from "sonner";

const FaqSidebar = ({
  open,
  faq,
  actionType,
  projects,
  onClose,
  onSave,
}) => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [currentFaq, setCurrentFaq] = useState(null);
  const [isLoadingFaq, setIsLoadingFaq] = useState(false);

  useEffect(() => {
    const fetchFaqDetails = async () => {
      if (faq && actionType !== 'add') {
        setIsLoadingFaq(true);
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/faq/${faq.id}`,
            { withCredentials: true }
          );
          setCurrentFaq(res.data.faq);
          setSelectedProject(res.data.faq.projectId?.toString() || "");
        } catch (err) {
          toast.error("Failed to load FAQ details");
        } finally {
          setIsLoadingFaq(false);
        }
      } else {
        setCurrentFaq(null);
        setSelectedProject("");
      }
    };

    fetchFaqDetails();
  }, [faq, actionType]);

  useEffect(() => {
    if (currentFaq) {
      reset({
        question: currentFaq.question || "",
        answer: currentFaq.answer || "",
      });
    } else if (!faq) {
      reset({
        question: "",
        answer: "",
      });
      setSelectedProject("");
    }
  }, [currentFaq, faq, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      if (faq) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/editfaq`,
          {
            id: faq.id,
            question: data.question,
            answer: data.answer,
            projectId: selectedProject,
          },
          { withCredentials: true }
        );
        toast.success("FAQ updated successfully");
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/createfaq`,
          {
            question: data.question,
            answer: data.answer,
            projectId: selectedProject,
          },
          { withCredentials: true }
        );
        toast.success("FAQ created successfully");
      }
      
      onSave();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Error saving FAQ"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  if (isLoadingFaq) {
    return (
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white border-l shadow-xl z-50 overflow-auto">
        <div className="flex items-center justify-center h-full">
          <p>Loading FAQ details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white border-l shadow-xl z-50 overflow-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-100">
        <h2 className="text-lg font-semibold">
          {actionType === "view" 
            ? "FAQ Details" 
            : faq 
              ? "Edit FAQ" 
              : "Add New FAQ"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form className="p-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {actionType === "view" ? (
          <>
            <div>
              <Label>ID</Label>
              <p className="mt-1">{currentFaq?.id || "N/A"}</p>
            </div>
            <div>
              <Label>Question</Label>
              <p className="mt-1">{currentFaq?.question || "None"}</p>
            </div>
            <div>
              <Label>Answer</Label>
              <p className="mt-1">{currentFaq?.answer || "None"}</p>
            </div>
            <div>
              <Label>Project</Label>
              <p className="mt-1">
                {currentFaq?.project?.name || projects.find(p => p.id === currentFaq?.projectId)?.title || "None"}
              </p>
            </div>
          </>
        ) : (
          <>
            <div>
              <Label>Question</Label>
              <Input
                {...register("question", { required: "Question is required" })}
                defaultValue={currentFaq?.question || ""}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label>Answer</Label>
              <Textarea
                {...register("answer", { required: "Answer is required" })}
                defaultValue={currentFaq?.answer || ""}
                rows={4}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label>Project</Label>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      selectedProject 
                        ? projects.find(p => p.id.toString() === selectedProject)?.title 
                        : "Select a project..."
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Projects</SelectLabel>
                    {projects.map(project => (
                      <SelectItem 
                        key={project.id} 
                        value={project.id.toString()}
                      >
                        {project.title || `Project ${project.id}`}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : (faq ? "Save Changes" : "Add FAQ")}
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
};

export default FaqSidebar;