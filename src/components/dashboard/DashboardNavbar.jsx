"use client";

import Link from "next/link";
import { useSidebar } from "@/context/SidebarContext";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function DashboardNavbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { isMobileSidebarOpen, toggleMobileSidebar } = useSidebar();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-lg border-b shadow-sm h-16 px-4 md:px-6 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          className="md:hidden"
        >
          {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded flex items-center justify-center">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <span className="text-xl font-bold text-gray-800 hidden md:block">Logo</span>
        </Link>
      </div>

      {/* Search */}
      {/* <div
        className={cn(
          "absolute md:relative left-0 right-0 md:left-auto md:right-auto mx-4 md:mx-0 transition-all duration-300",
          searchOpen ? "opacity-100 visible" : "opacity-0 invisible md:opacity-100 md:visible"
        )}
      >
        <div className="relative max-w-2xl w-full">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-primary/50 bg-gray-50/50"
          />
        </div>
      </div> */}

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSearchOpen((prev) => !prev)}
        >
          <Search className="h-5 w-5" />
        </Button> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center">3</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 shadow-xl">
            <DropdownMenuLabel className="px-4 py-3 border-b flex justify-between items-center">
              <span className="font-semibold">Notifications</span>
              <Button variant="link" className="text-sm text-primary p-0 h-auto">Mark all as read</Button>
            </DropdownMenuLabel>
            <div className="max-h-96 overflow-y-auto">
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className="flex gap-3 items-start px-4 py-3 hover:bg-gray-50">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New notification {i}</p>
                    <p className="text-sm text-gray-500 mt-1">You have a new message</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100 px-2">
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarImage src="https://github.com/shadcn.png" alt="avatar" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              {isDesktop && <ChevronDown className="h-4 w-4 text-gray-600" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 shadow-xl">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><Link href="/profile">Profile</Link></DropdownMenuItem>
            <DropdownMenuItem><Link href="/settings">Settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem><Link href="/auth/logout">Logout</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
