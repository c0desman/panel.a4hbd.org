import "../globals.css";
import { Toaster } from "@/components/ui/sonner"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { SidebarProvider } from "@/context/SidebarContext";

export const metadata = {
    title: "Dashboard Admin Template",
    description: "Modern and responsive admin dashboard for managing content and settings.",
  };

export default function RootLayout({ children }) {
  return (
    <SidebarProvider>
          <div className="flex">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col transition-all duration-300 md:ml-64 ml-0">
              <DashboardNavbar />
              <div className="p-6 bg-muted min-h-screen">{children}</div>
            </div>
          </div>
          <Toaster />
    </SidebarProvider>
  );
}