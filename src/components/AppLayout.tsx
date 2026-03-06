"use client";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { cn } from "@/lib/utils";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  
  return (
    <>
      <Sidebar />
      <div className={cn(
        "min-h-screen transition-all duration-300",
        collapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        <Topbar />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
