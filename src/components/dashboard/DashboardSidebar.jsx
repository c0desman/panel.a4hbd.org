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
  Images,
  TvMinimalPlay,
  GalleryVerticalEnd,
  FolderClosed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth";
import { USER_ROLES } from "@/constants";

// Single configuration object with role visibility
const menuConfig = [
  // Dashboard - visible to all
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: Object.values(USER_ROLES),
  },
  
  // Profile - visible to contributors, donors, guests
  {
    label: "Profile",
    icon: User,
    path: "/dashboard/profile",
    roles: [USER_ROLES.CONTRIBUTOR, USER_ROLES.DONORS, USER_ROLES.GUEST],
  },

  // Users - admin only with Profile submenu
  {
    label: "Users",
    icon: UsersRound,
    roles: [USER_ROLES.ADMIN, USER_ROLES.EDITOR],
    submenu: [
      { 
        label: "Users", 
        icon: UsersRound, 
        path: "/dashboard/users",
        roles: [USER_ROLES.ADMIN, USER_ROLES.EDITOR],
      },
      { 
        label: "Profile", 
        icon: User, 
        path: "/dashboard/profile",
        roles: [USER_ROLES.ADMIN, USER_ROLES.EDITOR],
      },
    ],
  },

  // Partners/Donors - admin and editor
  {
    label: "Partners/Donors",
    icon: Handshake,
    path: "/dashboard/our-partners",
    roles: [USER_ROLES.ADMIN, USER_ROLES.EDITOR, USER_ROLES.CONTRIBUTOR],
  },

  // Stories and Update - admin, editor, contributor
  {
    label: "Stories and Update",
    icon: LibraryBig,
    roles: Object.values(USER_ROLES),
    submenu: [
      { 
        label: "Stories/Update", 
        icon: LibraryBig, 
        path: "/dashboard/stories-list",
        roles: Object.values(USER_ROLES)
      },
      { 
        label: "Category", 
        icon: ChartBarStacked, 
        path: "/dashboard/categories-list",
        roles: [USER_ROLES.ADMIN, USER_ROLES.EDITOR] 
      },
    ],
  },

  // Projects - admin, editor, contributor
  {
    label: "Projects",
    icon: Presentation,
    roles: Object.values(USER_ROLES),
    submenu: [
      { 
        label: "Projects", 
        icon: Presentation, 
        path: "/dashboard/projects-menu/projects",
        roles: Object.values(USER_ROLES)
      },
      { 
        label: "Initiatives", 
        icon: NotepadText, 
        path: "/dashboard/projects-menu/initiatives",
        roles: Object.values(USER_ROLES)
      },
      { 
        label: "Project Type", 
        icon: Shapes, 
        path: "/dashboard/projects-menu/project-type",
        roles: Object.values(USER_ROLES)
      },
    ],
  },

  // Information Section - admin and editor
  {
    label: "Information Section",
    icon: SquareLibrary,
    roles: [USER_ROLES.ADMIN],
    submenu: [
      { 
        label: "Site Info", 
        icon: QrCode, 
        path: "/dashboard/info-sections/site-info",
        roles: [USER_ROLES.ADMIN] 
      },
      { 
        label: "Social Media", 
        icon: Facebook, 
        path: "/dashboard/info-sections/social-media",
        roles: [USER_ROLES.ADMIN] 
      },
      { 
        label: "Footer", 
        icon: Footprints, 
        path: "/dashboard/info-sections/footer",
        roles: [USER_ROLES.ADMIN] 
      },
    ],
  },

  // Page Content - admin and editor
  {
    label: "Page Content",
    icon: Layers,
    roles: [USER_ROLES.ADMIN],
    submenu: [
      { 
        label: "Home", 
        icon: PanelTop, 
        path: "/dashboard/page-content/home-page",
        roles: [USER_ROLES.ADMIN]
      },
      { 
        label: "About Us", 
        icon: PanelTop, 
        path: "/dashboard/page-content/about-us",
        roles: [USER_ROLES.ADMIN]
      },
      { 
        label: "Chairman's Message", 
        icon: PanelTop, 
        path: "/dashboard/page-content/chairman-message",
        roles: [USER_ROLES.ADMIN]
      },
      { 
        label: "Advisor's Message", 
        icon: PanelTop, 
        path: "/dashboard/page-content/advisor-message",
        roles: [USER_ROLES.ADMIN]
      },
      { 
        label: "How We Work", 
        icon: PanelTop, 
        path: "/dashboard/page-content/how-we-work",
        roles: [USER_ROLES.ADMIN]
      },
      { 
        label: "Our Partners", 
        icon: PanelTop, 
        path: "/dashboard/page-content/our-partners",
        roles: [USER_ROLES.ADMIN]
      },
      { 
        label: "Our Works/Projects Page", 
        icon: PanelTop, 
        path: "/dashboard/page-content/our-projects",
        roles: [USER_ROLES.ADMIN]
      },
      { 
        label: "Our Stories", 
        icon: PanelTop, 
        path: "/dashboard/page-content/our-stories",
        roles: [USER_ROLES.ADMIN]
      },
      { 
        label: "Contact Us", 
        icon: PanelTop, 
        path: "/dashboard/page-content/contact-us",
        roles: [USER_ROLES.ADMIN]
      },
      { 
        label: "Collaboration Message", 
        icon: PanelTop, 
        path: "/dashboard/page-content/collaboration-msg",
        roles: [USER_ROLES.ADMIN] 
      },
    ],
  },

  // Resouce -> Image, Video and Card - All Users
  {
    label: "Resource",
    icon: FolderClosed,
    roles: Object.values(USER_ROLES),
    submenu: [
      { 
        label: "Images", 
        icon: Images, 
        path: "/dashboard/resources-list/images",
        roles: Object.values(USER_ROLES) 
      },
      { 
        label: "Videos", 
        icon: TvMinimalPlay, 
        path: "/dashboard/resources-list/videos",
        roles: Object.values(USER_ROLES)
      },
      { 
        label: "Cards", 
        icon: GalleryVerticalEnd, 
        path: "/dashboard/resources-list/cards",
        roles: Object.values(USER_ROLES)
      },
      { 
        label: "FAQ", 
        icon: GalleryVerticalEnd, 
        path: "/dashboard/resources-list/faq",
        roles: Object.values(USER_ROLES)
      },
    ],
  },

  // Go to Website - all roles
  {
    label: "Go to Website",
    icon: FileSymlink,
    path: "https://a4hbd-org.vercel.app/",
    external: true,
    roles: Object.values(USER_ROLES),
  },

  // Logout - all roles
  {
    label: "Logout",
    icon: LogOut,
    path: "/auth/logout",
    roles: Object.values(USER_ROLES),
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
  const { user } = useAuth();

  const isActive = (path) => pathname === path;

  const toggleSubmenu = (label) => {
    setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  useEffect(() => {
    closeMobileSidebar();
  }, [pathname]);

  // Check if menu item should be visible to current user
  const isVisibleToUser = (item) => {
    if (!user?.usertype) return false;
    return item.roles.includes(user.usertype);
  };

  // Filter visible menu items
  const visibleMenuItems = menuConfig.filter(isVisibleToUser);

  const renderMenuItem = (item, index) => {
    const Icon = item.icon;
    const isLastItem = index === visibleMenuItems.length - 1;

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
                {item.submenu.filter(isVisibleToUser).map((sub) => (
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
            target={item.external ? "_blank" : undefined}
          >
            <Icon className="w-5 h-5" />
            {!isSidebarCollapsed && <span>{item.label}</span>}
          </Link>
        )}
        {!isLastItem && !openSubmenus[item.label] && <Separator className="my-2" />}
      </div>
    );
  };

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
        {visibleMenuItems.map((item, index) => renderMenuItem(item, index))}
      </nav>
    </aside>
  );
}