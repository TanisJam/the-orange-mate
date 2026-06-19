import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicProfileDisplay } from "@/components/public-profile-display";
import {
  getUserProfileByUsername,
  getUserInterests,
  getUserPlanStats,
} from "@/lib/database";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} — The Orange Mate`,
    description: `Perfil público de ${username} en The Orange Mate`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  // Optional auth — public page, no redirect
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile by username
  const profile = await getUserProfileByUsername(username, true);
  if (!profile) {
    notFound();
  }

  // Fetch interests and plan stats in parallel
  const [userInterests, stats] = await Promise.all([
    getUserInterests(profile.id, true),
    getUserPlanStats(profile.id, true),
  ]);

  const isOwner = user?.id === profile.id;

  // Strip phone before serializing to client — never leak to public view
  const { phone: _, ...publicProfile } = profile;

  return (
    <PublicProfileDisplay
      profile={publicProfile}
      interests={userInterests}
      stats={stats}
      isOwner={isOwner}
    />
  );
}
