"use client";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";
import CategorySidebar from "@/components/features/right-sidebar/CategorySidebar";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchCats = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/catagories`, 
        { withCredentials: true }
      );
      setCategories(res.data.data || []);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleAdd = newCat => {
    setCategories(prev => [newCat, ...prev]);
  };
  const handleUpdate = updCat => {
    setCategories(prev => prev.map(c => c.id === updCat.id ? updCat : c));
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/deletecatagory`,
        { data: { id: deleteId }, withCredentials: true }
      );
      setCategories(prev => prev.filter(c => c.id !== deleteId));
      toast.success("Deleted");
      setDeleteId(null);
      setSidebarOpen(false);
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Categories</h1>
      <Button onClick={() => { setSelected(null); setSidebarOpen(true); }}>
        Add New Category
      </Button>

      <table className="min-w-full bg-white border mt-4">
        <thead className="bg-gray-100">
          <tr className="text-left">
            <th className="p-2">#</th><th className="p-2">Image</th><th className="p-2">Name</th><th className="p-2">Slug</th><th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c, i) => (
            <tr key={c.id} className="border-b">
              <td className="p-2">{i + 1}</td>
              <td className="p-2">
                {c.imagepath && (
                  <Image
                    src={
                      c.imagepath?.startsWith("blob:")
                        ? c.imagepath
                        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${c.imagepath?.replace(/\\/g, "/")}`
                    }
                    width={40}
                    height={40}
                    className="rounded object-cover"
                    alt={c.name}
                  />
                )}
              </td>
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.slug}</td>
              <td className="flex gap-2 p-2">
                <Button size="icon" variant="ghost" onClick={() => { setSelected(c); setSidebarOpen(true); }}>
                  <Pencil />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setDeleteId(c.id)}>
                  <Trash2 className="text-red-600" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CategorySidebar
        open={sidebarOpen}
        category={selected}
        onClose={() => setSidebarOpen(false)}
        onCategoryAdd={handleAdd}
        onCategoryUpdate={handleUpdate}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Confirm Delete"
        description="Delete this category?"
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
