/**
 * Budget Page
 * ✅ Routing layer only: render feature container
 */

import { BudgetPageContainer } from "../../../../src/features/budget/components/BudgetPageContainer";

// Disable static generation for this page (uses TanStack Query)
export const dynamic = 'force-dynamic';

export default function BudgetPage() {
  return <BudgetPageContainer />;
}
