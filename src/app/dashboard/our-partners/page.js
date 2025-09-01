"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import PartnerSidebar from "@/components/features/right-sidebar/PartnerSidebar";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function PartnersPage() {
  const [partners, setPartners] = useState([]);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 });

  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [actionType, setActionType] = useState("add");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPartners = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/partners`, {
        params: {
          page: pagination.currentPage,
          limit: pagination.pageSize,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: searchTerm.trim() || undefined,
        },
        withCredentials: true,
      });
      setPartners(res.data.data || []);
      setPagination(res.data.pagination || { totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 });
    } catch (err) {
      console.error("Failed to fetch partners", err);
      toast.error("Could not load partners.");
    }
  };

  useEffect(() => { fetchPartners(); }, [pagination.currentPage, pagination.pageSize, statusFilter]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      fetchPartners();
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleAction = (partner, type) => {
    setSelectedPartner(partner);
    setActionType(type);
    setShowSidebar(true);
  };

  const handleDeletePrompt = (id) => {
    setPartnerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deletepartner`, {
        data: { id: partnerToDelete },
        withCredentials: true,
      });
      toast.success("Partner deleted successfully");
      fetchPartners();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete partner.");
    } finally {
      setDeleteDialogOpen(false);
      setPartnerToDelete(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Our Partners</h1>

      <Button
        className="bg-green-600 text-white mb-3"
        onClick={() => { setSelectedPartner(null); setActionType("add"); setShowSidebar(true); }}
      >
        Add New Partner
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            placeholder="Search partners..."
            className="border px-3 py-2 rounded-md w-full sm:max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="rowsPerPage">Show:</label>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) =>
              setPagination(prev => ({ ...prev, pageSize: Number(value), currentPage: 1 }))
            }
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 50, 100, 500].map((value) => (
                <SelectItem key={value} value={String(value)}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 border-b">ID</th>
              <th className="text-left p-3 border-b">Image</th>
              <th className="text-left p-3 border-b">Name</th>
              <th className="text-left p-3 border-b">Slug</th>
              <th className="text-left p-3 border-b">Status</th>
              <th className="text-left p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.length > 0 ? (
              partners.map((partner) => (
                <tr key={partner.id} className="border-b">
                  <td className="p-3">{partner.id}</td>
                  <td className="p-3">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${partner.imagepath}`}
                      alt={partner.name}
                      width={40}
                      height={40}
                      className="rounded object-cover"
                    />
                  </td>
                  <td className="p-3">{partner.name}</td>
                  <td className="p-3">{partner.slug}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded ${partner.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {partner.status}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleAction(partner, "view")}><Eye className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleAction(partner, "edit")}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeletePrompt(partner.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">No partners found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {partners.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <span>
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1}–
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems} entries
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {showSidebar && (
        <PartnerSidebar
          open={showSidebar}
          partner={selectedPartner}
          actionType={actionType}
          onClose={() => setShowSidebar(false)}
          onPartnerAdd={fetchPartners}
          onPartnerUpdate={fetchPartners}
        />
      )}

      {deleteDialogOpen && (
        <ConfirmDialog
          open={deleteDialogOpen}
          title="Delete Partner"
          message="Are you sure you want to delete this partner?"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteDialogOpen(false)}
        />
      )}
    </div>
  );
}
