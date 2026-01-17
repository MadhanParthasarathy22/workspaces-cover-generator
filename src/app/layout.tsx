import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { WorkspaceProvider } from "@/contexts/workspace-context";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { SidebarContent } from "@/components/sidebar-content";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Workspaces Cover Generator",
  description: "Generate book covers from Workspaces.xyz profiles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <WorkspaceProvider>
          <SidebarProvider>
            <Sidebar />
            <SidebarContent>{children}</SidebarContent>
          </SidebarProvider>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
