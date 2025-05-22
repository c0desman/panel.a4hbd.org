// /src/app/dashboard/page-content/our-partners/page.js
"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import PartnerSidebar from "@/components/features/right-sidebar/PartnerSidebar";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialPartners = [
  {
    id: 1,
    name: "Tech Corp",
    slug: "tech-corp",
    image: "https://via.placeholder.com/60x60.png?text=Tech+Corp",
    status: "active",
    address: "123 Tech Street, Silicon Valley",
    about: "Leading technology solutions provider",
  },
  {
    id: 2,
    name: "Green Energy Ltd",
    slug: "green-energy",
    image: "https://via.placeholder.com/60x60.png?text=Green+Energy",
    status: "inactive",
    address: "456 Eco Road, Green City",
    about: "Sustainable energy solutions pioneer",
  },
];

export default function PartnersPage() {
  const [partners, setPartners] = useState(initialPartners);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [actionType, setActionType] = useState('add'); // 'add', 'edit', 'view'

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const handleAction = (partner, type) => {
    setSelectedPartner(partner);
    setActionType(type);
    setShowSidebar(true);
  };

  const handleCloseSidebar = () => {
    setSelectedPartner(null);
    setShowSidebar(false);
  };

  const handleAdd = (newPartner) => {
    setPartners((prev) => [{ ...newPartner, id: Date.now() }, ...prev]);
    handleCloseSidebar();
  };

  const handleUpdate = (updatedPartner) => {
    setPartners((prev) =>
      prev.map((partner) => 
        partner.id === updatedPartner.id ? updatedPartner : partner
      )
    );
    handleCloseSidebar();
  };

  const handleDeletePrompt = (id) => {
    setPartnerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    setPartners((prev) => prev.filter((p) => p.id !== partnerToDelete));
    setDeleteDialogOpen(false);
    handleCloseSidebar();
  };

  // Filtered and paginated data
  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           partner.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || partner.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, partners]);

  const totalPages = Math.ceil(filteredPartners.length / rowsPerPage);
  const paginatedPartners = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredPartners.slice(start, start + rowsPerPage);
  }, [filteredPartners, currentPage, rowsPerPage]);

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Our Partners</h1>

      <Button
        className="bg-green-600 text-white mb-3"
        onClick={() => {
          setSelectedPartner(null);
          setActionType('add');
          setShowSidebar(true);
        }}
      >
        Add New Partner
      </Button>

      {/* Filters and Rows per Page */}
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
          <Select value={rowsPerPage} onValueChange={handleRowsPerPageChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 50, 100, 500].map((value) => (
                <SelectItem key={value} value={value}>{value}</SelectItem>
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
            {paginatedPartners.map((partner) => (
              <tr key={partner.id} className="border-b">
                <td className="p-3">{partner.id}</td>
                <td className="p-3">
                  <Image
                    src={partner.image}
                    alt={partner.name}
                    width={40}
                    height={40}
                    className="rounded object-cover"
                  />
                </td>
                <td className="p-3">{partner.name}</td>
                <td className="p-3">{partner.slug}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded ${partner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {partner.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleAction(partner, 'view')}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleAction(partner, 'edit')}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDeletePrompt(partner.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
            {paginatedPartners.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  No partners found.
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

      <PartnerSidebar
        open={showSidebar}
        partner={selectedPartner}
        actionType={actionType}
        onClose={handleCloseSidebar}
        onPartnerUpdate={handleUpdate}
        onPartnerAdd={handleAdd}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Partner"
        description="Are you sure you want to delete this partner? This action cannot be undone."
        confirmText="Yes, Delete"
      />
    </div>
  );
}