/**
 * Root Page
 * ✅ Redirect to login or dashboard
 */

import { redirect } from "next/navigation";

export default function Home() {
  // In production, check auth status and redirect accordingly
  // For now, redirect to login
  redirect("/login");
}
