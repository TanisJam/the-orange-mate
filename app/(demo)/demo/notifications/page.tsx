"use client";

import { useDemo } from "@/components/demo-provider";
import NotificationList from "@/components/notification-list";

/**
 * Demo notifications page.
 *
 * Client-rendered equivalent of `app/(app)/notifications/page.tsx`.
 * Passes `demoUserId` to `NotificationList` so it skips the Supabase
 * auth check and uses demo-database functions for data fetching and
 * mark-as-read operations.
 */
export default function DemoNotificationsPage() {
  const { demoUser } = useDemo();

  return <NotificationList demoUserId={demoUser.id} />;
}
