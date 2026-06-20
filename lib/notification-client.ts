import { createClient } from "@/lib/supabase/client";
import type { Notification, CreateNotificationParams } from "./types";

export async function createNotification(
  params: CreateNotificationParams
): Promise<Notification | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notifications")
    .insert(params)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Error creating notification:", error);
    return null;
  }

  return data;
}

export async function getNotifications(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: Notification[]; count: number }> {
  const supabase = createClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("notifications")
    .select(
      "*, actor:user_profiles!actor_id(id, username, full_name, avatar_url)",
      { count: "exact" }
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching notifications:", error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error counting unread notifications:", error);
    return 0;
  }

  return count || 0;
}

export async function markAsRead(notificationId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }

  return true;
}

export async function markAllAsRead(userId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }

  return true;
}
