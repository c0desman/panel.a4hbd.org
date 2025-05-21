"use client";

import { useState, useMemo } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";

const dummyProjectTypes = [
  {
    id: 1,
    title: "Clean Water",
    slug: "clean-water",
    project: "Water Project",
    createdAt: "2024-12-01",
    updatedAt: "2025-01-20",
    user: { name: "John Doe" },
  },
  {
    id: 2,
    title: "School Support",
    slug: "school-support",
    project: "Education Project",
    createdAt: "2024-11-11",
    updatedAt: "2025-01-01",
    user: { name: "Jane Smith" },
  },
  {
    id: 3,
    title: "Emergency Aid",
    slug: "emergency-aid",
    project: "Disaster Relief",
    createdAt: "2024-10-10",
    updatedAt: "2025-02-15",
    user: { name: "Ali Ahmed" },
  },
];

export default function ProjectTypePage() {
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, projectTypeId: null });
  
  const handleDelete = (id) => {
    console.log("Deleting Project Type with ID:", id);
    setConfirmDialog({ open: false, projectTypeId: null });
    // Implement your deletion logic here (API call etc.)
  };

  const filteredProjectTypes = useMemo(() => {
    return dummyProjectTypes.filter((type) => {
      const matchesSearch =
        type.title.toLowerCase().includes(search.toLowerCase()) ||
        type.slug.toLowerCase().includes(search.toLowerCase());
      const matchesProject =
        selectedProject === "" || selectedProject === "all" || type.project === selectedProject;
      return matchesSearch && matchesProject;
    });
  }, [search, selectedProject]);

  const totalPages = Math.ceil(filteredProjectTypes.length / rowsPerPage);
  const paginatedTypes = filteredProjectTypes.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Project Types</h1>

      <Link href="/dashboard/projects-menu/project-type/add">
        <Button className="bg-green-600 text-white mb-3">Add Project Type</Button>
      </Link>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <Input
          placeholder="Search project types..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm"
        />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm whitespace-nowrap">Project:</span>
            <Select value={selectedProject} onValueChange={(value) => {
                setSelectedProject(value);
                setCurrentPage(1);
                }}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem> {/* ✅ Fixed */}
                    <SelectItem value="Water Project">Water Project</SelectItem>
                    <SelectItem value="Education Project">Education Project</SelectItem>
                    <SelectItem value="Disaster Relief">Disaster Relief</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Rows per page:</span>
            <Select value={String(rowsPerPage)} onValueChange={(value) => {
                setRowsPerPage(parseInt(value));
                setCurrentPage(1);
                }}>
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
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Created / Updated</TableHead>
              <TableHead>Posted By</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {paginatedTypes.map((type, index) => (
              <TableRow key={type.id}>
                <TableCell>{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell>{type.title}</TableCell>
                <TableCell>{type.slug}</TableCell>
                <TableCell>{type.project}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  Created: {type.createdAt}
                  <br />
                  Updated: {type.updatedAt}
                </TableCell>
                <TableCell>{type.user.name}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="icon" variant="ghost">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Link href={`/dashboard/projects-menu/project-type/edit`}>
                    <Button size="icon" variant="ghost">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  {/* In the delete button */}
                  <Button 
                    onClick={() => setConfirmDialog({ open: true, projectTypeId: type.id })} // ✅ Change projectType.id to type.id
                    size="icon" 
                    variant="ghost"
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
          Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
          {Math.min(currentPage * rowsPerPage, filteredProjectTypes.length)} of{" "}
          {filteredProjectTypes.length} entries.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
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
