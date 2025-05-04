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

import { useState } from "react";
import { Menu, Bell, User, LogOut, ChevronDown, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-gray-900 text-white transition-all duration-300 flex flex-col justify-between sticky top-0 h-screen z-30",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-2">
          {!collapsed && <span className="text-xl font-bold">Dashboard</span>}
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1 px-2">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" collapsed={collapsed} />
          <SidebarItem icon={<User size={20} />} label="Profile" collapsed={collapsed} />
          <SidebarItem icon={<Settings size={20} />} label="Settings" collapsed={collapsed} />
          <SidebarItem icon={<LogOut size={20} />} label="Logout" collapsed={collapsed} />
        </nav>

        {/* Collapse Button */}
        <div className="p-2 border-t border-gray-800">
          <Button
            variant="ghost"
            onClick={() => setCollapsed((prev) => !prev)}
            className="w-full text-sm justify-start"
          >
            {collapsed ? "Expand" : "Collapse"}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="sticky top-0 bg-white border-b z-20 h-16 flex items-center justify-between px-4 md:px-6 shadow-sm">
          {/* Mobile menu trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col space-y-4 mt-6">
                  <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" collapsed={false} />
                  <SidebarItem icon={<User size={20} />} label="Profile" collapsed={false} />
                  <SidebarItem icon={<Settings size={20} />} label="Settings" collapsed={false} />
                  <SidebarItem icon={<LogOut size={20} />} label="Logout" collapsed={false} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Center logo (mobile only) */}
          <div className="md:hidden absolute left-1/2 transform -translate-x-1/2">
            <span className="font-bold">Logo</span>
          </div>

          {/* Desktop navbar - no logo */}
          <div className="hidden md:flex gap-2"> </div>

          {/* Notification and Profile */}
          <div className="flex gap-4 items-center ml-auto">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="relative">
              <Button variant="ghost" size="icon">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>
        </header>

        {/* Main content slot */}
        <main className="flex-1 overflow-auto bg-muted p-6">{children}</main>
      </div>
    </div>
  );
}

// Sidebar item component
function SidebarItem({ icon, label, collapsed }) {
  return (
    <Button
      variant="ghost"
      className="w-full flex items-center gap-2 text-left justify-start px-2 py-2 hover:bg-gray-800 text-white"
    >
      {icon}
      {!collapsed && <span className="text-sm">{label}</span>}
    </Button>
  );
}