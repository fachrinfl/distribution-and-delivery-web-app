"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Map,
  Menu,
  Route,
  Users,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navigation = [
    { name: "Map Dashboard", href: "/dashboard", icon: Map },
    { name: "Employees", href: "/dashboard/employees", icon: Users },
    { name: "Routes", href: "/dashboard/routes", icon: Route },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-20" : "w-64"
        } lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-transparent">
            <div
              className={`flex items-center gap-3 transition-opacity duration-300 ${
                sidebarCollapsed
                  ? "opacity-0 w-0 overflow-hidden"
                  : "opacity-100"
              }`}
            >
              <div className="bg-primary rounded-xl p-2 shadow-lg">
                <Map className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                Sales Tracker
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {!sidebarCollapsed && (
                <div className="bg-primary rounded-xl p-2 shadow-lg lg:hidden">
                  <Map className="h-5 w-5 text-white" />
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={
                  sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center ${
                    sidebarCollapsed ? "justify-center px-2" : "space-x-3 px-4"
                  } py-3 rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span
                    className={`font-medium transition-opacity duration-300 whitespace-nowrap ${
                      sidebarCollapsed
                        ? "opacity-0 w-0 overflow-hidden absolute"
                        : "opacity-100"
                    }`}
                  >
                    {item.name}
                  </span>
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div
              className={`px-4 py-2 mb-2 transition-opacity duration-300 ${
                sidebarCollapsed
                  ? "opacity-0 h-0 overflow-hidden mb-0"
                  : "opacity-100"
              }`}
            >
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              className={`w-full ${sidebarCollapsed ? "px-2" : ""}`}
              onClick={handleLogout}
              title={sidebarCollapsed ? "Logout" : undefined}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span
                className={`transition-opacity duration-300 ${
                  sidebarCollapsed
                    ? "opacity-0 w-0 overflow-hidden absolute"
                    : "opacity-100 ml-2"
                }`}
              >
                Logout
              </span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {navigation.find((n) => n.href === pathname)?.name || "Dashboard"}
            </h2>
            <div className="w-6" /> {/* Spacer for mobile */}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
