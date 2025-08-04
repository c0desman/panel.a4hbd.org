"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";
import { toast } from "sonner";

// Decode HTML entities like &#x2F; to /
function decodeHTMLEntities(text) {
  if (!text) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = text;
  return txt.value;
}

// Format date to readable form
function formatDate(dateStr) {
  if (!dateStr) return "";
  const options = {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  };
  return new Date(dateStr).toLocaleString("en-US", options);
}

export default function ProjectTypePage() {
  const [projectTypes, setProjectTypes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [confirmDialog, setConfirmDialog] = useState({ open: false, projectTypeId: null });

  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });

  // Fetch project types from backend
  const fetchProjectTypes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/projecttypes`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setProjectTypes(data.projectTypes || []);
        setPagination((prev) => ({
          ...prev,
          totalItems: data.pagination?.totalItems || data.projectTypes.length,
          totalPages: data.pagination?.totalPages || 1,
          pageSize: data.pagination?.pageSize || 10,
        }));
      } else {
        toast.error(data.message || "Failed to fetch project types");
      }
    } catch (err) {
      toast.error("Error fetching project types");
    }
  };

  // Fetch all projects for filter dropdown
  const fetchProjects = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allprojects`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch projects");
      }
    } catch (err) {
      toast.error("Error fetching projects");
    }
  };

  useEffect(() => {
    fetchProjectTypes();
    fetchProjects();
  }, []);

  // Filter project types based on search and selected project filter
  const filteredProjectTypes = useMemo(() => {
    return projectTypes.filter((pt) => {
      const title = decodeHTMLEntities(pt.title || "");
      const matchesSearch = title.toLowerCase().includes(search.toLowerCase());

      // If selectedProject is "all", show all
      if (selectedProject === "all") return matchesSearch;

      // Otherwise check if pt.projects contains selected project id
      return (
        matchesSearch &&
        pt.projects?.some((proj) => proj.id.toString() === selectedProject)
      );
    });
  }, [projectTypes, search, selectedProject]);

  // Paginate filtered project types
  const paginatedTypes = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    return filteredProjectTypes.slice(start, start + pagination.pageSize);
  }, [filteredProjectTypes, pagination]);

  // Handle deleting a project type
  const handleDelete = async (id) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/deleteprojecttype/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Project type deleted successfully");
        fetchProjectTypes();
      } else {
        toast.error(data.message || "Failed to delete project type");
      }
    } catch (err) {
      toast.error("Error occurred while deleting project type");
    }
    setConfirmDialog({ open: false, projectTypeId: null });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Project Types</h1>

      <Link href="/dashboard/projects-menu/project-type/add/">
        <Button className="bg-green-600 text-white mb-3">Add Project Type</Button>
      </Link>

      {/* Search and Project Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <Input
          placeholder="Search project types..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
          }}
          className="max-w-sm"
        />

        <div className="flex items-center gap-2">
          <span className="text-sm whitespace-nowrap">Project:</span>
          <Select
            value={selectedProject}
            onValueChange={(value) => {
              setSelectedProject(value);
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((proj) => (
                <SelectItem key={proj.id} value={proj.id.toString()}>
                  {proj.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-sm whitespace-nowrap">Rows per page:</span>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) =>
              setPagination((prev) => ({
                ...prev,
                pageSize: parseInt(value),
                currentPage: 1,
              }))
            }
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="500">500</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Project Types Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead className="text-sm text-gray-500">Created / Updated</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {paginatedTypes.map((type, index) => (
              <TableRow key={type.id}>
                <TableCell>{type.id}</TableCell>
                <TableCell>
                  {type.seo?.imagepath ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${type.seo.imagepath.replace(/\\/g, "/")}`}
                      alt={decodeHTMLEntities(type.title)}
                      width={60}
                      height={40}
                      className="rounded-md object-cover border"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </TableCell>
                <TableCell>{decodeHTMLEntities(type.title)}</TableCell>
                <TableCell>{decodeHTMLEntities(type.slug)}</TableCell>
                <TableCell className="text-sm">
                  {type.projects && type.projects.length > 0
                    ? type.projects.map((p) => p.title).join(", ")
                    : "N/A"}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  Created: {formatDate(type.createdAt)} <br />
                  Updated: {formatDate(type.updatedAt)}
                </TableCell>
                <TableCell className="text-right space-x-2 p-3">
                  <Link href={`/dashboard/projects-menu/project-type/view/?id=${type.id}`}>
                    <Button size="icon" variant="ghost" title="View">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/projects-menu/project-type/edit/?id=${type.id}`}>
                    <Button size="icon" variant="ghost" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Delete"
                    onClick={() => setConfirmDialog({ open: true, projectTypeId: type.id })}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
          {Math.min(pagination.currentPage * pagination.pageSize, filteredProjectTypes.length)} of{" "}
          {filteredProjectTypes.length} entries.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                currentPage: Math.max(prev.currentPage - 1, 1),
              }))
            }
            disabled={pagination.currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                currentPage: Math.min(prev.currentPage + 1, pagination.totalPages),
              }))
            }
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, projectTypeId: null })}
        onConfirm={() => handleDelete(confirmDialog.projectTypeId)}
        title="Are you sure you want to delete this project type?"
        description="This action is irreversible and will permanently remove the project type from our records."
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </div>
  );
}
