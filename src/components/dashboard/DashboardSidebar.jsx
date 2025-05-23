"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import {
  LayoutDashboard,
  User,
  UsersRound,
  LibraryBig,
  PanelTop,
  Layers,
  ChartBarStacked,
  NotepadText,
  Presentation,
  Shapes,
  LogOut,
  ChevronDown,
  ChevronRight,
  Facebook,
  Footprints,
  SquareLibrary,
  FileSymlink,
  QrCode,
  Handshake,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Users",
    icon: UsersRound,
    submenu: [
      { label: "Users", icon: UsersRound, path: "/dashboard/users" },
      { label: "My Profile", icon: User, path: "/dashboard/profile" },
    ],
  },
  {
    label: "Partners/Donors",
    icon: Handshake,
    path: "/dashboard/our-partners",
  },
  {
    label: "Stories and Update",
    icon: LibraryBig,
    submenu: [
      { label: "Stories/Update", icon: LibraryBig, path: "/dashboard/stories-list" },
      { label: "Category", icon: ChartBarStacked, path: "/dashboard/categories-list" },
    ],
  },
  {
    label: "Projects",
    icon: Presentation,
    submenu: [
      { label: "Projects", icon: Presentation, path: "/dashboard/projects-menu/projects" },
      { label: "Initiatives", icon: NotepadText, path: "/dashboard/projects-menu/initiatives" },
      { label: "Project Type", icon: Shapes, path: "/dashboard/projects-menu/project-type" },
    ],
  },
  {
    label: "Information Section",
    icon: SquareLibrary,
    submenu: [
      { label: "Site Info", icon: QrCode, path: "/dashboard/info-sections/site-info" },
      { label: "Social Media", icon: Facebook, path: "/dashboard/info-sections/social-media" },
      { label: "Footer", icon: Footprints, path: "/dashboard/info-sections/footer" },
    ],
  },
  {
    label: "Page Content",
    icon: Layers,
    submenu: [
      { label: "Home", icon: PanelTop, path: "/dashboard/page-content/home-page" },
      { label: "About Us", icon: PanelTop, path: "/dashboard/page-content/about-us" },
      { label: "Chairman's Message", icon: PanelTop, path: "/dashboard/page-content/chairman-message" },
      { label: "Advisor's Message", icon: PanelTop, path: "/dashboard/page-content/advisor-message" },
      { label: "How We Work", icon: PanelTop, path: "/dashboard/page-content/how-we-work" },
      { label: "Our Partners", icon: PanelTop, path: "/dashboard/page-content/our-partners" },
      { label: "Our Works/Projects Page", icon: PanelTop, path: "/dashboard/page-content/our-projects" },
      { label: "Our Stories", icon: PanelTop, path: "/dashboard/page-content/our-stories" },
      { label: "Contact Us", icon: PanelTop, path: "/dashboard/page-content/contact-us" },
      { label: "Collaboration Message", icon: PanelTop, path: "/dashboard/page-content/collaboration-msg" },
    ],
  },
  {
    label: "Go to Website",
    icon: FileSymlink,
    path: "https://a4hbd-org.vercel.app/",
    external: true,
  },
  {
    label: "Logout",
    icon: LogOut,
    path: "/auth/logout",
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const {
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    isMobileSidebarOpen,
    closeMobileSidebar,
  } = useSidebar();
  const [openSubmenus, setOpenSubmenus] = useState({});

  const isActive = (path) => pathname === path;

  const toggleSubmenu = (label) => {
    setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  useEffect(() => {
    closeMobileSidebar();
  }, [pathname]);

  return (
    <aside
      className={cn(
        "fixed z-50 top-0 left-0 h-full bg-white border-r shadow-lg transition-all duration-300 flex flex-col",
        isSidebarCollapsed ? "w-16" : "w-64",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-16">
        <div className="flex items-center gap-2">
          {!isSidebarCollapsed && <span className="text-2xl font-bold text-primary">Logo</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebarCollapsed}
            className="text-muted-foreground hover:bg-primary/10 hidden md:flex lg:hidden"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </Button>
        </div>
        
        {/* Mobile Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={closeMobileSidebar}
          className="md:hidden text-muted-foreground hover:bg-primary/10"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <Separator />

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isLastItem = index === menuItems.length - 1;

          return (
            <div key={item.label}>
              {item.submenu ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSubmenu(item.label)}
                    className={cn(
                      "w-full h-12 flex items-center justify-between px-3 rounded-lg hover:bg-primary/10",
                      openSubmenus[item.label] && "bg-primary/10 text-primary"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isSidebarCollapsed &&
                      (openSubmenus[item.label] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      ))}
                  </Button>
                  {!isSidebarCollapsed && openSubmenus[item.label] && (
                    <div className="ml-4 pl-3 border-l-2 border-primary/20 space-y-1">
                      {item.submenu.map((sub) => (
                        <Link
                          href={sub.path}
                          key={sub.label}
                          className={cn(
                            "h-10 flex items-center gap-3 px-3 my-2 py-1 rounded-lg text-sm hover:bg-primary/10",
                            isActive(sub.path) && "bg-primary/10 text-primary"
                          )}
                        >
                          <sub.icon className="w-4 h-4" />
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.path}
                  className={cn(
                    "h-12 flex items-center gap-3 px-3 rounded-lg hover:bg-primary/10",
                    isActive(item.path) && "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </Link>
              )}
              {!isLastItem && !openSubmenus[item.label] && <Separator className="my-2" />}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}