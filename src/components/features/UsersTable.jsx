"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import UserSidebar from "@/components/features/right-sidebar/UserSidebar";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";
import Image from "next/image";
import { USER_ROLES } from "@/constants";
import { toast } from "sonner";
import axios from "axios";

const columns = [
  { key: "id", label: "ID" },
  { key: "avatar", label: "Avatar" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "usertype", label: "Role" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

export default function UsersTable({
  users = [], 
  loading,
  onUserAdd,
  onUserUpdate,
  onUserDelete
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState("view");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
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
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleDeleteUser = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${selectedUser.id}`,
        { 
          withCredentials: true,
          timeout: 10000 // 10 seconds timeout
        }
      );

      if (response.status === 200) {
        onUserDelete(selectedUser.id);
        toast.success('User deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsProcessing(false);
      setConfirmOpen(false);
      setSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="animate-spin h-8 w-8" />
        <p>Loading users...</p>
      </div>
    );
  }

  const profilePicture =
  user.profile?.profilepicture?.replace(/\\/g, '/') ?? null;

  return (
    <>
      <Button
        className="bg-green-600 text-white mb-3"
        onClick={() => {
          setSelectedUser({});
          setSidebarMode("add");
          setSidebarOpen(true);
        }}
        disabled={isProcessing}
      >
        {isProcessing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
        Add New User
      </Button>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[900px] space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
              disabled={isProcessing}
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
                disabled={isProcessing}
              >
                {[10, 25, 50, 100].map(n => (
                  <option key={n} value={n}>Show {n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded border">
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow>
                  {columns.map(col => (
                    <TableHead
                      key={col.key}
                      onClick={() => col.key !== "actions" && !isProcessing && toggleSort(col.key)}
                      className={`select-none whitespace-nowrap ${
                        col.key !== "actions" ? "cursor-pointer hover:underline" : ""
                      } ${
                        isProcessing ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {sortKey === col.key && !isProcessing && (
                          sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map(user => (
                    <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        <Image
                            src={
                              profilePicture
                                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${profilePicture}`
                                : '/images/default-avatar.png'
                            }
                          alt={`${user.first_name} ${user.last_name}`}
                          width={40}
                          height={40}
                          loading="lazy"
                          className="rounded-full"
                        />
                      </TableCell>
                      <TableCell>{`${user?.first_name || ''} ${user?.last_name || ''}`}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{USER_ROLES[user.usertype] || user.usertype}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            user.isActive === false // Check for boolean false
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.isActive === false ? "Inactive" : "Active"}
                        </span>
                        <span
                          className={`inline-block mx-2 px-2 py-1 rounded text-xs font-semibold ${
                            user.isvalid === false // Check for boolean false
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.isvalid === false ? "Not Verified" : "Verified"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap justify-start">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setSidebarMode("view");
                              setSidebarOpen(true);
                            }}
                            disabled={isProcessing}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setSidebarMode("edit");
                              setSidebarOpen(true);
                            }}
                            disabled={isProcessing}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setConfirmOpen(true);
                            }}
                            disabled={isProcessing}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8">
                      {isProcessing ? 'Processing...' : 'No users found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {paginatedUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-2">
              <span className="text-sm">
                Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                {Math.min(currentPage * rowsPerPage, filteredUsers.length)} of{' '}
                {filteredUsers.length} users
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1 || isProcessing}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || isProcessing}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {sidebarOpen && (
        <UserSidebar
          mode={sidebarMode}
          user={selectedUser}
          open={sidebarOpen}
          onClose={() => !isProcessing && setSidebarOpen(false)}
          onSave={(user) => {
            if (sidebarMode === "edit") {
              onUserUpdate(user);
            } else {
              onUserAdd(user);
            }
            setSidebarOpen(false);
          }}
          disabled={isProcessing}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleDeleteUser}
        onCancel={() => !isProcessing && setConfirmOpen(false)}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${selectedUser?.name}?`}
        confirmText={isProcessing ? "Deleting..." : "Delete"}
        confirmDisabled={isProcessing}
      />
    </>
  );
}
