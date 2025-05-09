// /app/profile/page.js
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserSidebar from '@/components/features/right-sidebar/UserSidebar';

const dummyUser = {
  id: 99,
  name: 'Samiur Rahman',
  email: 'samiur@example.com',
  phone: '+880 1234 567890',
  role: 'Admin',
  status: 'Active',
  avatar: 'https://i.pravatar.cc/150?img=99',
  address: 'Dhaka, Bangladesh',
  bio: 'Frontend Developer with a passion for clean UI and user-centric design.',
};

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(dummyUser);

  const handleUpdate = (updatedUser) => {
    setUser(updatedUser);
    setSidebarOpen(false);
  };

  const handleDelete = () => {
    alert('This option is disabled for the logged-in user.');
    setSidebarOpen(false);
  };

  return (
    <div className="max-w-screen-md mx-auto w-full px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">My Profile</h1>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Image
          src={user.avatar}
          alt={user.name}
          width={120}
          height={120}
          className="rounded-full border-4 border-blue-500 shadow-md object-cover"
        />

        <div className="flex-1 space-y-4 w-full">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-semibold">{user.name}</h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-blue-500 hover:text-white"
            >
              <Pencil className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-gray-700">{user.bio}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Phone:</strong> {user.phone}</div>
            <div><strong>Role:</strong> {user.role}</div>
            <div>
              <strong>Status:</strong>{' '}
              <span className={`inline-block px-2 py-1 rounded-full text-white text-xs font-semibold ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}>
                {user.status}
              </span>
            </div>
            <div className="sm:col-span-2"><strong>Address:</strong> {user.address}</div>
          </div>
        </div>
      </div>

      {/* Sidebar: Force open in editing mode */}
      {sidebarOpen && (
        <UserSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          forceEdit={true}
        />
      )}
    </div>
  );
}