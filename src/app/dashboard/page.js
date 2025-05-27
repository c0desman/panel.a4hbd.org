/*
  📁 Project: Dashboard Layout (Frontend Only)
  📚 Libraries: Tailwind CSS, ShadCN UI
  🧩 Features:
    - Sticky Collapsible Sidebar
    - Sticky Responsive Navbar
    - Notification and Profile Avatar
    - Mobile-Friendly with Logo Placement
    - Menu Items: Dashboard, Profile, Settings, Logout
*/

"use client";

import withAuth from '@/components/auth/withAuth';

function DashboardPage() {
  console.log('[Dashboard] Rendering page');
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="border rounded-lg p-4 bg-card">
        <p className="text-muted-foreground">
          Welcome to your dashboard. This content is protected and only visible to authenticated users.
        </p>
      </div>
    </div>
  );
}

export default withAuth(DashboardPage);