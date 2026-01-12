/**
 * Transaction Page
 * ✅ Routing layer only: render feature container
 */

import { TransactionPageContainer } from "../../../../src/features/transaction/components/TransactionPageContainer";

// Disable static generation for this page (uses TanStack Query)
export const dynamic = 'force-dynamic';

export default function TransactionPage() {
  return <TransactionPageContainer />;
}
