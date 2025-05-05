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

export default function DashboardLayout({ children }) {

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
      <p className="text-muted-foreground">
        This is your main dashboard page. You can navigate using the sidebar menu.
      </p>
    </div>
  );
}