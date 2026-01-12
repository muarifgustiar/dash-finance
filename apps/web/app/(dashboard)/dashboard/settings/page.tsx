/**
 * Settings Page
 * ✅ Routing layer only: render feature container
 */

import { SettingsPageContainer } from "../../../../src/features/auth/components/SettingsPageContainer";

// Disable static generation for this page (uses TanStack Query)
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return <SettingsPageContainer />;
}
