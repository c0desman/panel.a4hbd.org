"use client";

import { useState, useMemo } from "react";
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

const dummyProjects = [
  {
    id: 1,
    title: "Clean Water for All",
    slug: "clean-water",
    image: "https://via.placeholder.com/80x60.png?text=Water",
    initiative: "Water Initiative",
    createdAt: "2024-11-01",
    updatedAt: "2025-01-15",
    user: { name: "John Doe" },
  },
  {
    id: 2,
    title: "Support for Education",
    slug: "education-support",
    image: "https://via.placeholder.com/80x60.png?text=Education",
    initiative: "Education Initiative",
    createdAt: "2024-12-05",
    updatedAt: "2025-02-02",
    user: { name: "Jane Smith" },
  },
  {
    id: 3,
    title: "Medical Aid for Refugees",
    slug: "medical-aid",
    image: "https://via.placeholder.com/80x60.png?text=Medical",
    initiative: "Health Initiative",
    createdAt: "2025-01-20",
    updatedAt: "2025-03-01",
    user: { name: "Ali Ahmed" },
  },
];

export default function ProjectsListPage() {
  const [search, setSearch] = useState("");
  const [initiativeFilter, setInitiativeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, projectId: null });
  const [selectedInitiative, setSelectedInitiative] = useState("all");

  const filteredProjects = useMemo(() => {
    return dummyProjects.filter((project) => {
        const matchesSearch =
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.slug.toLowerCase().includes(search.toLowerCase());

        const matchesInitiative =
        selectedInitiative === "all" || project.initiative === selectedInitiative;

        return matchesSearch && matchesInitiative;
    });
    }, [search, selectedInitiative]);

  const totalPages = Math.ceil(filteredProjects.length / rowsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const initiativesList = [...new Set(dummyProjects.map((p) => p.initiative))];

  const handleDelete = (id) => {
    console.log("Deleting project with ID:", id);
    setConfirmDialog({ open: false, projectId: null });
    // Implement your deletion logic here (API call etc.)
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Projects List</h1>

      <Link href="/dashboard/projects-menu/projects/add/">
        <Button className="bg-green-600 text-white mb-3">Add New Project</Button>
      </Link>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm"
        />

        <div className="flex items-center gap-2">
          <span className="text-sm">Initiative:</span>
          <Select
            value={selectedInitiative}
            onValueChange={(value) => {
                setSelectedInitiative(value);
                setCurrentPage(1);
            }}
            >
            <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by Initiative" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {initiativesList.map((initiative) => (
                <SelectItem key={initiative} value={initiative}>
                    {initiative}
                </SelectItem>
                ))}
            </SelectContent>
        </Select>

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

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Project Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Initiative</TableHead>
              <TableHead>Created / Updated</TableHead>
              <TableHead>Posted By</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {paginatedProjects.map((project, index) => (
              <TableRow key={project.id}>
                <TableCell className="p-3">
                  {(currentPage - 1) * rowsPerPage + index + 1}
                </TableCell>
                <TableCell className="p-3">
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={60}
                    height={40}
                    className="rounded-md object-cover border"
                  />
                </TableCell>
                <TableCell className="p-3 font-medium">{project.title}</TableCell>
                <TableCell className="p-3">{project.slug}</TableCell>
                <TableCell className="p-3 text-sm text-gray-500">{project.initiative}</TableCell>
                <TableCell className="p-3 text-sm text-gray-500">
                  Created: {project.createdAt}
                  <br />
                  Updated: {project.updatedAt}
                </TableCell>
                <TableCell className="p-3">{project.user.name}</TableCell>
                <TableCell className="text-right space-x-2 p-3">
                  <Button size="icon" variant="ghost">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Link href={`/dashboard/projects-menu/projects/edit/`}>
                    <Button size="icon" variant="ghost">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setConfirmDialog({ open: true, projectId: project.id })}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
          {Math.min(currentPage * rowsPerPage, filteredProjects.length)} of{" "}
          {filteredProjects.length} entries.
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
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
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
