"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import CategorySidebar from "@/components/features/right-sidebar/CategorySidebar";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";
import { Button } from "@/components/ui/button";

const initialCategories = [
  {
    id: 1,
    name: "Electronics",
    slug: "electronics",
    image: "https://via.placeholder.com/60x60.png?text=Electronics",
  },
  {
    id: 2,
    name: "Books",
    slug: "books",
    image: "https://via.placeholder.com/60x60.png?text=Books",
  },
  {
    id: 3,
    name: "Clothing",
    slug: "clothing",
    image: "https://via.placeholder.com/60x60.png?text=Clothing",
  },
  // Add more dummy data if needed for testing pagination
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setShowSidebar(true);
  };

  const handleCloseSidebar = () => {
    setSelectedCategory(null);
    setShowSidebar(false);
  };

  const handleAdd = (newCategory) => {
    setCategories((prev) => [newCategory, ...prev]);
    handleCloseSidebar();
  };

  const handleUpdate = (updatedCategory) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
    handleCloseSidebar();
  };

  const handleDeletePrompt = (id) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryToDelete));
    setDeleteDialogOpen(false);
    if (selectedCategory?.id === categoryToDelete) {
      handleCloseSidebar();
    }
  };

  // Filtered and paginated data
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, categories]);

  const totalPages = Math.ceil(filteredCategories.length / rowsPerPage);
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredCategories.slice(start, start + rowsPerPage);
  }, [filteredCategories, currentPage, rowsPerPage]);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>

      <Button className="bg-green-600 text-white mb-3">
        Add New Category
      </Button>

      {/* Search and Rows per Page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="Search categories..."
          className="border px-3 py-2 rounded-md w-full sm:max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <label htmlFor="rowsPerPage">Show:</label>
          <select
            id="rowsPerPage"
            className="border rounded px-2 py-1"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
          >
            {[10, 50, 100, 500].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 border-b">#</th>
              <th className="text-left p-3 border-b">Image</th>
              <th className="text-left p-3 border-b">Name</th>
              <th className="text-left p-3 border-b">Slug</th>
              <th className="text-left p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.map((cat, index) => (
              <tr key={cat.id} className="border-b">
                <td className="p-3">
                  {(currentPage - 1) * rowsPerPage + index + 1}
                </td>
                <td className="p-3">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={40}
                    height={40}
                    className="rounded object-cover"
                  />
                </td>
                <td className="p-3">{cat.name}</td>
                <td className="p-3">{cat.slug}</td>
                <td className="p-3 flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(cat)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDeletePrompt(cat.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
            {paginatedCategories.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4 gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="flex items-center px-2">
          Page {currentPage} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </Button>
      </div>

      <CategorySidebar
        open={showSidebar}
        category={selectedCategory}
        onClose={handleCloseSidebar}
        onCategoryUpdate={handleUpdate}
        onCategoryAdd={handleAdd}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Yes, Delete"
      />
    </div>
  );
}
