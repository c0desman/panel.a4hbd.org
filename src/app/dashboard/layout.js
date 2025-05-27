import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
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
      <div className="flex w-screen h-screen overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col transition-all duration-300 md:ml-64 ml-0 w-full min-w-0">
          <DashboardNavbar />
          <main className="flex-1 overflow-auto bg-muted p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
