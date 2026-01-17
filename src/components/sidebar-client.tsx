"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/sidebar-context";

interface SidebarClientProps {
  navigation: ReadonlyArray<{ name: string; href: string }>;
}

export function SidebarClient({ navigation }: SidebarClientProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <>
      <aside
        data-component="sidebar"
        className={cn(
          "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-40 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-0 overflow-hidden" : "w-64"
        )}
      >
        <div data-component="sidebar-content" className="flex flex-col h-full p-6">
          {/* Toggle Button */}
          <button
            data-component="sidebar-toggle-button"
            onClick={toggleSidebar}
            className="mb-4 p-2 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground transition-colors self-start"
            aria-label="Collapse sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <nav data-component="sidebar-navigation" className="flex-1 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Floating Toggle Button when collapsed */}
      {isCollapsed && (
        <button
          data-component="sidebar-floating-toggle"
          onClick={toggleSidebar}
          className="fixed left-2 top-4 z-50 p-2 rounded-lg bg-sidebar border border-sidebar-border hover:bg-sidebar-accent/50 text-sidebar-foreground transition-colors shadow-lg"
          aria-label="Expand sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </>
  );
}
