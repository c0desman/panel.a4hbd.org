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
  const [user, setUser] = useState(dummyUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('view');

  const handleUpdate = (updatedUser) => {
    setUser(updatedUser);
    setSidebarOpen(false);
  };

  const handleDelete = () => {
    alert('This option is disabled for the logged-in user.');
    setSidebarOpen(false);
  };

  const handleEditClick = () => {
    setSidebarMode('edit');
    setSidebarOpen(true);
  };

  return (
    <div className="max-w-screen-lg mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h1>
      <div className="flex justify-between items-center">
        <Image
          src={user.avatar}
          alt={user.name}
          width={120}
          height={120}
          className="rounded-full border-4 border-blue-500 shadow-md object-cover"
        />
        <Button
            variant="outline"
            size="icon"
            onClick={handleEditClick}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Pencil className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-3">
        <div className="flex-1 w-full space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
          <p className="text-gray-700">{user.bio}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {user.phone}
            </div>
            <div>
              <span className="font-medium">Role:</span> {user.role}
            </div>
            <div>
              <span className="font-medium">Status:</span>{' '}
              <span
                className={`inline-block px-2 py-1 rounded-full text-white text-xs font-semibold ${
                  user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {user.status}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-medium">Address:</span> {user.address}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <UserSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        mode={sidebarMode}
      />
    </div>
  );
}
