"use client";

import { useState } from "react";
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
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setShowSidebar(true);
  };

  const handleCloseSidebar = () => {
    setSelectedCategory(null);
    setShowSidebar(false);
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

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Categories</h1>
      <div className="overflow-x-auto">
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
            {categories.map((cat, index) => (
              <tr key={cat.id} className="border-b">
                <td className="p-3">{index + 1}</td>
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
          </tbody>
        </table>
      </div>

      <CategorySidebar
        open={showSidebar}
        category={selectedCategory}
        onClose={handleCloseSidebar}
        onCategoryUpdate={handleUpdate}
        onCategoryDelete={handleDeletePrompt}
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
