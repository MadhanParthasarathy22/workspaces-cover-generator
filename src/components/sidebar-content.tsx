"use client";

import { useSidebar } from "@/contexts/sidebar-context";

export function SidebarContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <main
      data-component="main-content-wrapper"
      className={`transition-all duration-300 ease-in-out ${
        isCollapsed ? "ml-0" : "ml-64"
      }`}
    >
      {children}
    </main>
  );
}
