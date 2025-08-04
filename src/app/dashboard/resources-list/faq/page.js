"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import FaqSidebar from "@/components/features/right-sidebar/faqSidebar";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";
import { toast } from "sonner";
import axios from "axios";

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [actionType, setActionType] = useState('add');

  useEffect(() => {
    fetchProjects();
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allfaq`, {
        withCredentials: true,
      });
      
      // Filter FAQs based on selected project if not "all"
      let filteredFaqs = res.data.faqs || [];
      if (selectedProject && selectedProject !== "all") {
        filteredFaqs = filteredFaqs.filter(faq => 
          faq.projectId.toString() === selectedProject
        );
      }
      
      setFaqs(filteredFaqs);
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error("Failed to load FAQs");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allprojects`, {
        withCredentials: true,
      });
      setProjects(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load projects");
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm) {
        const filtered = faqs.filter(faq => 
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFaqs(filtered);
      } else {
        fetchFaqs();
      }
    }, 500);
    
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    fetchFaqs();
  }, [selectedProject]);

  const handleAction = (faq, type) => {
    setActionType(type);
    setSelectedFaq(faq);
    setShowSidebar(true);
  };

  const handleCloseSidebar = () => {
    setSelectedFaq(null);
    setShowSidebar(false);
  };

  const handleFaqSaved = () => {
    fetchFaqs();
    handleCloseSidebar();
  };

  const confirmDelete = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/deletefaq`,
        { id: deleteId },
        { withCredentials: true }
      );

      setFaqs(prev => prev.filter(f => f.id !== deleteId));
      toast.success("FAQ deleted successfully");
    } catch (err) {
      console.error("Error deleting FAQ:", err);
      toast.error(
        err.response?.data?.message || 
        "Failed to delete FAQ"
      );
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">FAQ Management</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <Button 
          className="bg-green-600 text-white hover:bg-green-700"
          onClick={() => handleAction(null, "add")}
        >
          Add New FAQ
        </Button>

        <div className="flex-1">
          <Input
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label>Filter by Project</Label>
          <Select
            value={selectedProject}
            onValueChange={setSelectedProject}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a project..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Projects</SelectLabel>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.title || `Project ${project.id}`}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading FAQs...</div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No FAQs found {selectedProject !== "all" ? "for this project" : ""}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="p-3 font-medium">ID</th>
                  <th className="p-3 font-medium">Question</th>
                  <th className="p-3 font-medium">Answer</th>
                  <th className="p-3 font-medium">Project</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((faq) => (
                  <tr key={faq.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{faq.id}</td>
                    <td className="p-3 max-w-xs truncate">{faq.question}</td>
                    <td className="p-3 max-w-xs truncate">{faq.answer}</td>
                    <td className="p-3">
                      {faq.project?.title || `Project ${faq.projectId}`}
                    </td>
                    <td className="p-3 flex gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleAction(faq, "view")}
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleAction(faq, "edit")}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => setDeleteId(faq.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FaqSidebar
        open={showSidebar}
        faq={selectedFaq}
        actionType={actionType}
        projects={projects}
        onClose={handleCloseSidebar}
        onSave={handleFaqSaved}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Confirm Delete"
        description="Are you sure you want to delete this FAQ? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}