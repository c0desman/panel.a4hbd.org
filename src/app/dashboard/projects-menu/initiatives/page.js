"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Shadcn table components
import Image from "next/image";
import { Edit, Trash } from "lucide-react"; // Import edit and delete icons
import InitiativesSidebar from "@/components/features/right-sidebar/InitiativesSidebar";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";

export default function InitiativesPage() {
  const [initiatives, setInitiatives] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, initiativeId: null });

  // Search, pagination, and rows per page state
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const handleDelete = (id) => {
    console.log("Deleting initiative with ID:", id);
    setConfirmDialog({ open: false, initiativeId: null });
    // Implement your deletion logic here (API call etc.)
  };

  useEffect(() => {
    // Mock fetching data (replace with actual fetch request)
    const fetchInitiatives = async () => {
      const data = [
        { id: 1, name: "Initiative 1", description: "Description of Initiative 1", slug: "initiatives-id", image: "/path/to/image1.jpg" },
        { id: 2, name: "Initiative 2", description: "Description of Initiative 2", slug: "initiatives-id", image: "/path/to/image2.jpg" },
        { id: 3, name: "Initiative 3", description: "Description of Initiative 3", slug: "initiatives-id", image: "/path/to/image3.jpg" },
        { id: 4, name: "Initiative 4", description: "Description of Initiative 4", slug: "initiatives-id", image: "/path/to/image4.jpg" },
        // Add more sample initiatives for testing pagination
      ];
      setInitiatives(data);
    };

    fetchInitiatives();
  }, []);

  const handleAddInitiative = () => {
    setSelectedInitiative(null);
    setShowSidebar(true);
  };

  const handleEditInitiative = (initiative) => {
    setSelectedInitiative(initiative);
    setShowSidebar(true);
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
  };

  const handleInitiativeUpdate = (updatedInitiative) => {
    setInitiatives((prev) =>
      prev.map((initiative) =>
        initiative.id === updatedInitiative.id ? updatedInitiative : initiative
      )
    );
    handleCloseSidebar();
  };

  const handleInitiativeCreate = (newInitiative) => {
    setInitiatives((prev) => [...prev, newInitiative]);
  };

  // Filtered and paginated data
  const filteredInitiatives = useMemo(() => {
    return initiatives.filter((initiative) =>
      initiative.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, initiatives]);

  const totalPages = Math.ceil(filteredInitiatives.length / rowsPerPage);
  const paginatedInitiatives = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredInitiatives.slice(start, start + rowsPerPage);
  }, [filteredInitiatives, currentPage, rowsPerPage]);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold mb-4">Initiatives</h1>

      <Button onClick={handleAddInitiative} className="bg-green-600 text-white">
        Add New Initiative
      </Button>

      {/* Search and Rows per Page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="Search initiatives..."
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

      {/* Initiatives Table */}
      <Table className="border">
        <TableHeader className="bg-[#f5f5f5]">
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedInitiatives.map((initiative, index) => (
            <TableRow className="bg-white" key={initiative.id}>
              <TableCell>
                {(currentPage - 1) * rowsPerPage + index + 1}
              </TableCell>
              <TableCell>
                <Image
                  src={initiative.image}
                  alt={initiative.name}
                  width={100}
                  height={60}
                  className="object-cover rounded-md"
                />
              </TableCell>
              <TableCell>{initiative.name}</TableCell>
              <TableCell>{initiative.description}</TableCell>
              <TableCell className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-blue-600"
                  onClick={() => handleEditInitiative(initiative)}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600"
                  onClick={() => setConfirmDialog({ open: true, initiativeId: initiative.id })}
                >
                  <Trash size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {paginatedInitiatives.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center p-4 text-gray-500">
                No initiatives found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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

      {/* Sidebar for creating or editing an initiative */}
      <InitiativesSidebar
        open={showSidebar}
        initiative={selectedInitiative}
        onClose={handleCloseSidebar}
        onInitiativeUpdate={handleInitiativeUpdate}
        onInitiativeDelete={handleDelete}
        onInitiativeCreate={handleInitiativeCreate}
      />
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, initiativeId: null })}
        onConfirm={() => handleDelete(confirmDialog.initiativeId)}
        title="Are you sure you want to delete this initiative?"
        description="This action is irreversible and will permanently remove the initiative from our records."
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </div>
  );
}
