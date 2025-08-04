import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/auth";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Wrapping the entire application with AuthProvider */}
        <AuthProvider>
          <main>{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}