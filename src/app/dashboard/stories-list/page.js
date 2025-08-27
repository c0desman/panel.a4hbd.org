"use client";

import { useState, useEffect, useMemo } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";
import { toast } from "sonner";
import axios from "axios";

export default function StoriesListPage() {
  const [stories, setStories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0); // 👈 added

  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    storyId: null 
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, categoriesRes, partnersRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allprojects`, { withCredentials: true }),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allcatagories`, { withCredentials: true }),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allpartners`, { withCredentials: true })
        ]);

        setProjects(projectsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
        setPartners(partnersRes.data.data || []);
        
        await fetchStories();
      } catch (error) {
        toast.error("Failed to load initial data");
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentPage, rowsPerPage]); // 👈 refetch when page or rowsPerPage changes

  // Modified fetchStories
  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stories`, {
        params: {
          page: currentPage,
          limit: rowsPerPage
        },
        withCredentials: true
      });
      
      const transformedStories = res.data.stories.map(story => ({
        ...story,
        users: story.user || { first_name: 'Unknown', last_name: 'User' }
      }));
      
      setStories(transformedStories);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.totalCount || 0); // 👈 save count
    } catch (error) {
      console.error("Error fetching stories:", error);
      setStories([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      let response;
      try {
        response = await axios.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/deletestory`,
          {
            data: { id },
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (deleteError) {
        console.log("DELETE method failed, trying POST...", deleteError);
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/deletestory`,
          { id },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      if (response.data && response.data.message === "Story deleted successfully") {
        toast.success("Story deleted successfully");
        setStories(prev => prev.filter(story => story.id !== id));
        setTotalCount(prev => prev - 1); // 👈 adjust count
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Delete error:", error);
      let errorMessage = "Failed to delete story";
      if (error.response?.data) {
        if (typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
          errorMessage = "Server returned HTML error page";
        } else {
          errorMessage = error.response.data.error || error.response.data.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setConfirmDialog({ open: false, storyId: null });
    }
  };

  // Client-side filtering (applies only to current page)
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const matchesSearch = !search || 
        story.title.toLowerCase().includes(search.toLowerCase()) || 
        story.slug.toLowerCase().includes(search.toLowerCase());
      
      const matchesProject = selectedProject === "all" || 
        (story.projectId && story.projectId.toString() === selectedProject);
      const matchesCategory = selectedCategory === "all" || 
        (story.catagoryId && story.catagoryId.toString() === selectedCategory);
      const matchesPartner = selectedPartner === "all" || 
        (story.partnerId && story.partnerId.toString() === selectedPartner);
      
      return matchesSearch && matchesProject && matchesCategory && matchesPartner;
    });
  }, [stories, search, selectedProject, selectedCategory, selectedPartner]);

  const getProjectName = (id) => {
    return projects.find(p => p.id === id)?.title || "N/A";
  };

  const getCategoryName = (id) => {
    return categories.find(c => c.id === id)?.name || "N/A";
  };

  const getPartnerName = (id) => {
    return partners.find(p => p.id === id)?.name || "N/A";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Stories and Updates</h1>

      <Link href="/dashboard/stories-list/add">
        <Button className="bg-green-600 text-white mb-3">
          Add New Story
        </Button>
      </Link>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Input
            placeholder="Search stories by title or slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1"
          />
          
          <div className="flex items-center gap-2">
            <Label className="text-sm">Rows:</Label>
            <Select 
              value={String(rowsPerPage)} 
              onValueChange={(value) => {
                setRowsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Partner</Label>
            <Select value={selectedPartner} onValueChange={setSelectedPartner}>
              <SelectTrigger>
                <SelectValue placeholder="All Partners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Partners</SelectItem>
                {partners.map(partner => (
                  <SelectItem key={partner.id} value={partner.id.toString()}>
                    {partner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Posted By</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading stories...
                </TableCell>
              </TableRow>
            ) : filteredStories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No stories found
                </TableCell>
              </TableRow>
            ) : (
              filteredStories.map((story, index) => (
                <TableRow key={story.id}>
                  <TableCell className="p-3">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="p-3">
                    {story.imagepath ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${story.imagepath.replace(/\\/g, "/")}`}
                        alt={story.title}
                        width={60}
                        height={40}
                        className="rounded-md object-cover border"
                      />
                    ) : (
                      <div className="w-[60px] h-[40px] bg-gray-100 rounded-md border"></div>
                    )}
                  </TableCell>
                  <TableCell className="p-3 font-medium">{story.title}</TableCell>
                  <TableCell className="p-3">{story.slug}</TableCell>
                  <TableCell className="p-3 text-sm text-gray-500">
                    <div>Project: {getProjectName(story.projectId)}</div>
                    <div>Category: {getCategoryName(story.catagoryId)}</div>
                    <div>Partner: {getPartnerName(story.partnerId)}</div>
                  </TableCell>
                  <TableCell className="p-3 text-sm text-gray-500">
                    <div>Created: {new Date(story.createdAt).toLocaleDateString()}</div>
                    {story.updatedAt && (
                      <div>Updated: {new Date(story.updatedAt).toLocaleDateString()}</div>
                    )}
                  </TableCell>
                  <TableCell className="p-3">
                    {story.users?.first_name} {story.users?.last_name}
                  </TableCell>
                  <TableCell className="text-right space-x-2 p-3">
                    <Link href={`/dashboard/stories/${story.id}`}>
                      <Button size="icon" variant="ghost" title="View">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/stories-list/edit/?id=${story.id}`}>
                      <Button size="icon" variant="ghost" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => setConfirmDialog({ open: true, storyId: story.id })} 
                      size="icon" 
                      variant="ghost"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
          {Math.min(currentPage * rowsPerPage, totalCount)} of{" "}
          {totalCount} entries.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, storyId: null })}
        onConfirm={() => handleDelete(confirmDialog.storyId)}
        title="Confirm Delete"
        description="Are you sure you want to delete this story? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
