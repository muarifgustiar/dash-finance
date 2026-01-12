/**
 * Master Page
 * ✅ Routing layer only: render feature container
 */

import { CategoryMasterPageContainer } from "../../../../src/features/category/components/CategoryMasterPageContainer";

// Disable static generation for this page (uses TanStack Query)
export const dynamic = 'force-dynamic';

export default function MasterPage() {
  return <CategoryMasterPageContainer />;
}
