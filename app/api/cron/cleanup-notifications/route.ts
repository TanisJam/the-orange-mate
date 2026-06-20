import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Vercel Cron fallback for cleanup_old_notifications().
 *
 * Triggered by Vercel Cron (or manual invocation) to delete notifications
 * older than 360 days via the `cleanup_old_notifications` Postgres function.
 *
 * When pg_cron is available on the Supabase instance, this route is
 * unnecessary. It serves as the fallback documented in
 * `notifications-cleanup.md`.
 *
 * Security: requires `Authorization: Bearer <CRON_SECRET>` header.
 */
export async function GET(request: Request) {
  // Verify cron secret — fail closed if not configured
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 401 });
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("cleanup_old_notifications");

    if (error) {
      console.error("cleanup_old_notifications RPC error:", error);
      return NextResponse.json(
        { error: "Cleanup function failed", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(
      "cleanup_old_notifications unexpected error:",
      err
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
