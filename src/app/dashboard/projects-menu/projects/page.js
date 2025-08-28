"use client";
import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
import { toast } from "sonner";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";

// Decode HTML entities like &#x2F; to /
function decodeHTMLEntities(text) {
  if (!text) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = text;
  return txt.value;
}

// Format date to readable form
function formatDate(dateStr) {
  const options = {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  };
  return new Date(dateStr).toLocaleString("en-US", options);
}

export default function ProjectsListPage() {
  const [projects, setProjects] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedInitiative, setSelectedInitiative] = useState("all");
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    projectId: null,
  });

  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });

  // Fetch projects from backend search endpoint
  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.pageSize.toString(),
      });

      // Only add search parameter if there's actual content
      if (search && search.trim()) {
        params.append("search", search.trim());
      }

      if (selectedInitiative !== "all") {
        params.append("initiative", selectedInitiative);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/search?${params.toString()}`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (res.ok) {
        setProjects(data.projects || []);
        setPagination((prev) => ({
          ...prev,
          totalItems: data.pagination?.totalItems || 0,
          totalPages: data.pagination?.totalPages || 1,
        }));
      } else {
        console.error("Failed to fetch projects:", data.message);
        toast.error("Failed to fetch projects");
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      toast.error("Error fetching projects");
    }
  };

  // Fetch initiatives (for filter dropdown)
  const fetchInitiatives = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/allinitiative`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) {
        setInitiatives(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching initiatives:", err);
    }
  };

  // Trigger fetch on search / initiative / pagination change
  useEffect(() => {
    fetchProjects();
  }, [search, selectedInitiative, pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/deleteproject/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        toast.success("Project deleted successfully");
        fetchProjects();
      } else {
        console.error("Failed to delete project", data.message);
        toast.error("Unable to delete the project");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Error occurred while deleting the project");
    }
    setConfirmDialog({ open: false, projectId: null });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Projects List</h1>

      <Link href="/dashboard/projects-menu/projects/add/">
        <Button className="bg-green-600 text-white mb-3">Add New Project</Button>
      </Link>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
          }}
          className="max-w-sm"
        />

        <div className="flex items-center gap-2">
          <span className="text-sm">Initiative:</span>
          <Select
            value={selectedInitiative}
            onValueChange={(value) => {
              setSelectedInitiative(value);
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Initiative" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {initiatives.map((initiative) => (
                <SelectItem key={initiative.id} value={initiative.id.toString()}>
                  {initiative.id}: {initiative.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-sm">Rows per page:</span>
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

      {/* Projects Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Project Title</TableHead>
              <TableHead>Initiative</TableHead>
              <TableHead>Created / Updated</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {projects.map((project, index) => (
              <TableRow key={project.id}>
                <TableCell className="p-3">
                  {(pagination.currentPage - 1) * pagination.pageSize + index + 1}
                </TableCell>
                <TableCell className="p-3">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${project.imagepath.replace(
                      /\\/g,
                      "/"
                    )}`}
                    alt="Project"
                    width={60}
                    height={40}
                    className="rounded-md object-cover border"
                  />
                </TableCell>
                <TableCell className="p-3 font-medium">
                  {decodeHTMLEntities(project.title)}
                </TableCell>
                <TableCell className="p-3 text-sm text-gray-500">
                  {project.initiatives?.[0]?.name || "N/A"}
                </TableCell>
                <TableCell className="p-3 text-sm text-gray-500">
                  Created: {formatDate(project.createdAt)}
                  <br />
                  Updated: {formatDate(project.updatedAt)}
                </TableCell>
                <TableCell className="text-right space-x-2 p-3">
                  <Link href={`/dashboard/projects-menu/projects/view/?id=${project.id}`}>
                    <Button size="icon" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/projects-menu/projects/edit/?id=${project.id}`}>
                    <Button size="icon" variant="ghost">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setConfirmDialog({ open: true, projectId: project.id })
                    }
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
          {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{" "}
          {pagination.totalItems} entries.
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
        onClose={() => setConfirmDialog({ open: false, projectId: null })}
        onConfirm={() => handleDelete(confirmDialog.projectId)}
        title="Are you sure you want to delete this project?"
        description="This action is irreversible and will permanently remove the project from our records."
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </div>
  );
}