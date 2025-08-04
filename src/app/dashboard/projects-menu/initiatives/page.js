"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";
import InitiativesSidebar from "@/components/features/right-sidebar/InitiativesSidebar";
import { toast } from "sonner";

export default function InitiativesPage() {
  const [initiatives, setInitiatives] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchInitiatives = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/initiatives`, {
        withCredentials: true,
      });
      setInitiatives(res.data.data || []);
    } catch {
      toast.error("Failed to load initiatives");
    }
  };

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const handleAdd = async () => {
    await fetchInitiatives(); // Always fetch from backend after creation
  };

  const handleUpdate = async () => {
    await fetchInitiatives(); // Always fetch from backend after edit
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deleteinitiative`, {
        data: { id: deleteId },
        withCredentials: true,
      });
      toast.success("Initiative deleted");
      setDeleteId(null);
      setSidebarOpen(false);
      await fetchInitiatives(); // Always fetch from backend after delete
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Initiatives</h1>

      <Button onClick={() => { setSelected(null); setSidebarOpen(true); }} className="bg-green-600 text-white">
        Add New Initiative
      </Button>

      <table className="min-w-full bg-white border mt-4">
        <thead className="bg-gray-100">
          <tr className="text-left">
            <th className="text-center">#</th><th>Image</th><th className="text-left pl-2">Name</th><th  className="text-left pl-2">Description</th><th  className="text-left pl-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {initiatives.map((item, i) => (
            <tr key={item.id} className="border-b">
              <td className="text-center">{i + 1}</td>
              <td className="p-2 text-left">
                {item.imagepath && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.imagepath.replace(/\\/g, "/")}`}
                    width={80}
                    height={50}
                    className="rounded object-cover"
                    alt={item.name}
                  />
                )}
              </td>
              <td className="text-left pl-2">{item.name}</td>
              <td className="text-left pl-2">{item.description}</td>
              <td className="flex gap-2 p-2">
                <Button size="icon" variant="ghost" onClick={() => { setSelected(item); setSidebarOpen(true); }}>
                  <Pencil />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setDeleteId(item.id)}>
                  <Trash2 className="text-red-600" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <InitiativesSidebar
        open={sidebarOpen}
        initiative={selected}
        onClose={() => setSidebarOpen(false)}
        onInitiativeAdd={handleAdd}
        onInitiativeUpdate={handleUpdate}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Confirm Delete"
        description="Delete this initiative?"
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}