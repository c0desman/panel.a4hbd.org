'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Pencil, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import UpdateProfileSidebar from '@/components/features/right-sidebar/UpdateProfileSidebar';

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();

  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }

    // Fetch profile if authenticated
    if (!authLoading && isAuthenticated) {
      axios
        .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile`, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.status === 200 && res.data?.data) {
            setUser({
              ...res.data.data,
              profile: res.data.data.profile || {}, // Ensure profile is never null
            });
          } else {
            toast.error('Unexpected response from server');
          }
        })
        .catch((err) => {
          console.error('❌ Error loading profile:', err);
          toast.error(
            err.response?.status === 401
              ? 'Unauthorized. Please log in again.'
              : 'Failed to load profile.'
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [authLoading, isAuthenticated, router]);

  const handleUpdate = (updatedUser) => {
    setUser(updatedUser);
    setSidebarOpen(false);
  };

  const handleEditClick = () => {
    setSidebarOpen(true);
  };

  // Show loader while fetching
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If user is not available after load
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 font-semibold">User profile not found.</p>
      </div>
    );
  }

  const profilePicture =
    user.profile?.profilepicture?.replace(/\\/g, '/') ?? null;

  return (
    <div className="max-w-screen-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h1>

      <div className="flex justify-between items-center mb-6">
        <Image
          loading="lazy"
          src={
            profilePicture
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${profilePicture}`
              : '/images/default-avatar.png'
          }
          alt={`${user.first_name} ${user.last_name}`}
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

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {user.first_name} {user.last_name}
        </h2>
        {user.profile?.bio ? (
          <p className="text-gray-700">
            <span className="font-medium">Bio:</span> {user.profile?.bio}
          </p>
        ) : (
          <p className="text-gray-500 italic">No bio available.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 mt-4">
          <div>
            <span className="font-medium">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-medium">Phone:</span> {user.phone}
          </div>
          <div>
            <span className="font-medium">Role:</span> {user.usertype}
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <span
              className={`inline-block ml-2 px-2 py-1 rounded-full text-white text-xs font-semibold ${
                user.isActive ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
            <span
              className={`inline-block ml-2 px-2 py-1 rounded-full text-white text-xs font-semibold ${
                user.isvalid ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {user.isvalid ? 'Verified' : 'Not Verified'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Edit Sidebar */}
      <UpdateProfileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
