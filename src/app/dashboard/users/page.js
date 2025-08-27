"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "@/context/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@/components/ui/table";
import Image from "next/image";
import { ChevronUp, ChevronDown, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import ConfirmDialog from "@/components/features/popup/ConfirmDialog";
import UserSidebar from "@/components/features/right-sidebar/UserSidebar";
import { USER_ROLES } from "@/constants";

export default function UsersPage() {
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("first_name");
  const [sortOrder, setSortOrder] = useState("asc");

  // pagination state (server-driven)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState("view");
  const [selectedUser, setSelectedUser] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const r = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users?page=${currentPage}&limit=${rowsPerPage}`,
        { withCredentials: true }
      );
      setUsers(r.data.data || []);
      setTotalPages(r.data.pagination.totalPages || 1);
      setTotalItems(r.data.pagination.totalItems || 0);
    } catch {
      toast.error("Failed loading users");
      setUsers([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchUsers();
  }, [isAuthenticated, currentPage, rowsPerPage]);

  // client-side search & sort only on current page's users
  const filtered = useMemo(() => users.filter(u =>
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ), [users, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const aV = (a[sortKey] || "").toString();
      const bV = (b[sortKey] || "").toString();
      return sortOrder === "asc" ? aV.localeCompare(bV) : bV.localeCompare(aV);
    });
    return arr;
  }, [filtered, sortKey, sortOrder]);

  const toggleSort = (k) => {
    if (sortKey === k) setSortOrder(o => o === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortOrder("asc");
    }
  };

  const enterSidebar = (mode, u = null) => {
    setSidebarMode(mode);
    setSelectedUser(u);
    setSidebarOpen(true);
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/deleteuser`,
        { id: selectedUser.id },
        { withCredentials: true }
      );
      toast.success("Deleted");
      setConfirmOpen(false);
      enterSidebar("view", null);
      await fetchUsers();
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-4">
        <Loader2 className="animate-spin h-8 w-8" />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <Button onClick={() => enterSidebar("add")} disabled={isProcessing}>
          Add New User
        </Button>
      </div>

      <div className="flex justify-between mb-3">
        <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
        <select
          className="border px-2"
          value={rowsPerPage}
          onChange={e => { setRowsPerPage(+e.target.value); setCurrentPage(1); }}
        >
          {[10,25,50,100].map(n => <option key={n} value={n}>Show {n}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              {["ID","Avatar","Name","Email","Role","Status","Actions"].map((col, idx) => (
                <TableHead
                  key={idx}
                  onClick={["Name","Email","Role","Status"].includes(col)
                    ? () => toggleSort(
                        col==="Name" ? "first_name"
                        : col==="Email" ? "email"
                        : col==="Role" ? "usertype"
                        : "isActive"
                      )
                    : undefined}
                >
                  <div className="flex items-center gap-1 cursor-pointer">
                    {col}
                    {sortKey === (
                      col==="Name" ? "first_name"
                      : col==="Email" ? "email"
                      : col==="Role" ? "usertype"
                      : col==="Status" ? "isActive"
                      : ""
                    ) && (sortOrder==="asc" ? <ChevronUp size={16}/> : <ChevronDown size={16}/>)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">No users found</TableCell>
              </TableRow>
            ) : sorted.map(u => {
              const avatarSrc = u.profile?.profilepicture
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${u.profile.profilepicture.replace(/\\/g,"/")}`
                : "/images/default-avatar.png";
              return (
                <TableRow key={u.id} className="hover:bg-gray-50">
                  <TableCell>{u.id}</TableCell>
                  <TableCell>
                    <Image
                      src={avatarSrc}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      alt="Avatar"
                    />
                  </TableCell>
                  <TableCell>{u.first_name} {u.last_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{USER_ROLES[u.usertype] || u.usertype}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded ${u.isActive ? "bg-green-100" : "bg-red-100"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className={`ml-2 px-2 py-1 rounded ${u.isvalid ? "bg-green-100" : "bg-red-100"}`}>
                      {u.isvalid ? "Verified" : "Not Valid"}
                    </span>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="icon" onClick={() => enterSidebar("view", u)}><Eye/></Button>
                    <Button size="icon" onClick={() => enterSidebar("edit", u)}><Pencil/></Button>
                    <Button size="icon" onClick={() => { setSelectedUser(u); setConfirmOpen(true); }}>
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Pagination footer uses backend values */}
      {users.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
            {Math.min(currentPage * rowsPerPage, totalItems)} of {totalItems} entries.
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <UserSidebar
        open={sidebarOpen}
        mode={sidebarMode}
        user={selectedUser}
        onClose={() => setSidebarOpen(false)}
        onSave={fetchUsers}
        onDelete={() => setConfirmOpen(true)}
        isProcessing={isProcessing}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm deletion"
        message={`Delete ${selectedUser?.first_name} ${selectedUser?.last_name}?`}
        confirmText="Delete"
        confirmDisabled={isProcessing}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
