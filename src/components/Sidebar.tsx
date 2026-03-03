"use client";
import { useState } from "react";
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card border border-border shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-40 h-screen bg-card border-r border-border/50 transition-all duration-300",
          // Mobile: slide in from left
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
          // Collapsed on desktop
          collapsed && !mobileOpen ? "lg:w-16" : "lg:w-64",
          // Always full width on mobile when open
          "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn(
            "flex items-center h-16 border-b border-border/50 px-4",
            collapsed && !mobileOpen ? "lg:justify-center" : "justify-between"
          )}>
            {!collapsed || mobileOpen ? (
              <span className="text-xl font-bold text-foreground">Dashboard</span>
            ) : null}
            
            <div className="flex items-center gap-2">
              {mobileOpen ? (
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : null}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hidden lg:block"
              >
                {collapsed ? <ChevronLeft className="w-5 h-5 rotate-180" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {items.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200",
                  collapsed && !mobileOpen ? "lg:justify-center px-2" : ""
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {(!collapsed || mobileOpen) && <span className="text-sm font-medium">{item.label}</span>}
              </a>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
