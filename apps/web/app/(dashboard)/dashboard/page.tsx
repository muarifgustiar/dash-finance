/**
 * Dashboard Page
 * ✅ Routing layer only: render feature container
 */

import { DashboardPageContainer } from "../../../src/features/dashboard/components/DashboardPageContainer";

// Disable static generation for this page (uses TanStack Query)
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return <DashboardPageContainer />;
}
