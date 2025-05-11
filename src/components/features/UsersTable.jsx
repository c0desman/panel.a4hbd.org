// /components/features/UsersTable.jsx
"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, Eye, Pencil, Trash2 } from "lucide-react";
import UserSidebar from "@/components/features/right-sidebar/UserSidebar";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";
import Image from "next/image";

const initialUsers = [...Array(100).keys()].map((i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 2 === 0 ? "Admin" : "Editor",
  status: i % 3 === 0 ? "Inactive" : "Active",
  avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
  phone: `+880 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
  address: "Dhaka, Bangladesh",
  bio: "Sample bio text",
}));

const columns = [
  { key: "avatar", label: "Avatar" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

export default function UsersTable() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [users, setUsers] = useState(initialUsers);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState("view"); // "view" | "edit" | "add"
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, users]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortKey, sortOrder]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedUsers.slice(start, start + rowsPerPage);
  }, [sortedUsers, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleAddUser = (newUser) => {
    const id = users.length + 1;
    setUsers([...users, { id, ...newUser }]);
  };

  const handleUpdateUser = (updatedUser) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
  };

  const handleDeleteUser = () => {
    setUsers(users.filter(user => user.id !== selectedUser.id));
    setConfirmOpen(false);
    setSidebarOpen(false);
  };
  
  return (
    <>
      <Button
        className="bg-green-600 text-white mb-3"
        onClick={() => {
          setSelectedUser({});
          setSidebarMode("add");
          setSidebarOpen(true);
        }}
      >
        Add New User
      </Button>
      <div className="w-full overflow-x-auto">
      <div className="min-w-[900px] space-y-4">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Rows per page</label>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              {[10, 50, 100, 500].map((n) => (
                <option key={n} value={n}>
                  Show {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded border">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    onClick={() => col.key !== "actions" && toggleSort(col.key)}
                    className={`cursor-pointer select-none whitespace-nowrap ${
                      col.key !== "actions" ? "hover:underline" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key &&
                        (sortOrder === "asc" ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell>
                    <Image
                      src={user.avatar}
                      width={40}
                      height={40}
                      alt={user.name}
                      className="rounded-full"
                    />
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap justify-start">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedUser(user);
                          setSidebarMode("view");
                          setSidebarOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedUser(user);
                          setSidebarMode("edit");
                          setSidebarOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Trash2
                        className="text-red-500 cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => {
                          setSelectedUser(user);
                          setConfirmOpen(true);
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-2">
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar & Delete Dialog */}
      {selectedUser && (
        <>
          <UserSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            user={selectedUser}
            mode={sidebarMode}
            onUpdate={handleUpdateUser}
            onAdd={handleAddUser}
            onDelete={handleDeleteUser}
          />
          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleDeleteUser}
            title={`Delete ${selectedUser.name}?`}
            description="This action cannot be undone. Are you sure you want to permanently delete this user?"
            confirmText="Delete User"
          />
        </>
      )}
    </div>
    </>
  );
}