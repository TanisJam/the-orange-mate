import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicProfileDisplay } from "@/components/public-profile-display";
import {
  getUserProfileByUsername,
  getUserProfile,
  getUserInterests,
  getUserPlanStats,
  getFriendStatus,
} from "@/lib/database";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} — The Orange Mate`,
    description: `Perfil público en The Orange Mate`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  // Optional auth — public page, no redirect
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile — try username first, then userId fallback
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);
  let profile = isUuid
    ? await getUserProfile(username, true)
    : await getUserProfileByUsername(username, true);
  if (!profile) {
    // Try the other lookup as fallback
    profile = isUuid
      ? await getUserProfileByUsername(username, true)
      : await getUserProfile(username, true);
  }
  if (!profile) {
    notFound();
  }

  // Fetch interests and plan stats in parallel
  const [userInterests, stats] = await Promise.all([
    getUserInterests(profile.id, true),
    getUserPlanStats(profile.id, true),
  ]);

  const isOwner = user?.id === profile.id;

  // Fetch friend relationship if viewer is authenticated and not the owner
  let friendStatus = null;
  if (user && !isOwner) {
    friendStatus = await getFriendStatus(user.id, profile.id, true);
  }

  // Strip phone before serializing to client — never leak to public view
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { phone: _phone, ...publicProfile } = profile;

  return (
    <PublicProfileDisplay
      profile={publicProfile}
      interests={userInterests}
      stats={stats}
      isOwner={isOwner}
      currentUserId={user?.id ?? null}
      friendStatus={friendStatus}
    />
  );
}
