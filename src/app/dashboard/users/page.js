// File: src/app/dashboard/users/page.js

"use client";

import UsersTable from '@/components/features/UsersTable'

export default function UsersPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Users Management</h1>
      <UsersTable />
    </div>
  );
}