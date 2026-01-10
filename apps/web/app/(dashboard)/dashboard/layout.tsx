/**
 * Dashboard Layout
 * ✅ Layout wrapper with sidebar and header
 */

import { Sidebar } from "../../../src/components/layouts/sidebar";
import { Header } from "../../../src/components/layouts/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-20">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
