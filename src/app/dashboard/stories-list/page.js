"use client";

import { useState, useMemo } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";

const dummyStories = [
  {
    id: 1,
    postTitle: "Clean Water Project in Rangpur",
    slug: "clean-water-project",
    image: "https://via.placeholder.com/80x60.png?text=Water",
    donor: "UNICEF",
    createdAt: "2024-11-01",
    updatedAt: "2025-01-15",
    user: { name: "John Doe" },
    project: "Water Project",
    category: "Story",
  },
  {
    id: 2,
    postTitle: "Education Support provided to Orphans in Cox's Bazar",
    slug: "education-for-all",
    image: "https://via.placeholder.com/80x60.png?text=Education",
    donor: "UNICEF",
    createdAt: "2024-12-05",
    updatedAt: "2025-02-02",
    user: { name: "Jane Smith" },
    project: "Education Support Project",
    category: "Update",
  },
  {
    id: 3,
    postTitle: "Free Medical Camp Held in Rohingya Camp",
    slug: "medical-camp",
    image: "https://via.placeholder.com/80x60.png?text=Medical",
    donor: "UNICEF",
    createdAt: "2025-01-20",
    updatedAt: "2025-03-01",
    user: { name: "Ali Ahmed" },
    project: "Medical Project",
    category: "Story",
  },
  // Add more dummy data as needed for pagination testing
];

export default function StoriesListPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, storyId: null });

  const handleDelete = (id) => {
    console.log("Deleting Story with ID:", id);
    setConfirmDialog({ open: false, storyId: null });
    // Implement your deletion logic here (API call etc.)
  };

  const filteredStories = useMemo(() => {
    return dummyStories.filter((story) =>
      story.postTitle.toLowerCase().includes(search.toLowerCase()) ||
      story.slug.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const totalPages = Math.ceil(filteredStories.length / rowsPerPage);
  const paginatedStories = filteredStories.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Stories and Updates</h1>

      <Link href="/dashboard/stories-list/add">
        <Button className="bg-green-600 text-white mb-3">
          Add New Update
        </Button>
      </Link>
      {/* Search and Row Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <Input
          placeholder="Search stories..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // Reset to page 1 when search changes
          }}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <Select value={String(rowsPerPage)} onValueChange={(value) => {
            setRowsPerPage(parseInt(value));
            setCurrentPage(1); // Reset to page 1 when rows change
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
              <TableHead className="w-12">#</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Post Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Projects & Categories</TableHead>
              <TableHead>Created and Updated</TableHead>
              <TableHead>Posted By</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {paginatedStories.map((story, index) => (
              <TableRow key={story.id}>
                <TableCell className="p-3">
                  {(currentPage - 1) * rowsPerPage + index + 1}
                </TableCell>
                <TableCell className="p-3">
                  <Image
                    src={story.image}
                    alt={story.postTitle}
                    width={60}
                    height={40}
                    className="rounded-md object-cover border"
                  />
                </TableCell>
                <TableCell className="p-3 font-medium">{story.postTitle}</TableCell>
                <TableCell className="p-3">{story.slug}</TableCell>
                <TableCell className="p-3 text-sm text-gray-500">
                  Categories: {story.category}
                  <br />
                  Projects: {story.project}
                  <br />
                  Donors: {story.donor}
                </TableCell>
                <TableCell className="p-3 text-sm text-gray-500">
                  Created: {story.createdAt}
                  <br />
                  Updated: {story.updatedAt}
                </TableCell>
                <TableCell className="p-3">{story.user.name}</TableCell>
                <TableCell className="text-right space-x-2 p-3">
                  <Button size="icon" variant="ghost">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Link href={`/dashboard/stories-list/edit`}>
                    <Button size="icon" variant="ghost">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button onClick={() => setConfirmDialog({ open: true, storyId: story.id })} size="icon" variant="ghost">
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
          {Math.min(currentPage * rowsPerPage, filteredStories.length)} of{" "}
          {filteredStories.length} entries.
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
        onClose={() => setConfirmDialog({ open: false, storyId: null })}
        onConfirm={() => handleDelete(confirmDialog.storyId)}
        title="Are you sure you want to delete this Story/News/Update?"
        description="This action is irreversible and will permanently remove the story from our records."
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </div>
  );
}
