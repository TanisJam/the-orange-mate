"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useDemo } from "@/components/demo-provider";
import {
  getUserProfileByUsername,
  getUserInterests,
  getUserPlanStats,
  getUserReviews,
} from "@/lib/demo-database";
import { PublicProfileDisplay } from "@/components/public-profile-display";
import type {
  UserProfile,
  UserInterest,
  UserReview,
} from "@/lib/types";
import { User } from "lucide-react";

/**
 * Demo public profile page.
 *
 * Client-rendered equivalent of `app/(app)/profile/[username]/page.tsx`.
 * Fetches mock profile, interests, reviews, and plan stats from the
 * demo-database adapter and passes them as props to
 * `PublicProfileDisplay`.  No Supabase calls, no auth checks.
 */
export default function DemoProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { demoUser } = useDemo();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [stats, setStats] = useState({ created: 0, participating: 0 });
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const user = await getUserProfileByUsername(username);
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setProfile(user);

      const [ints, userStats, userReviews] = await Promise.all([
        getUserInterests(user.id),
        getUserPlanStats(user.id),
        getUserReviews(user.id),
      ]);
      setInterests(ints);
      setStats(userStats);
      setReviews(userReviews);

      if (userReviews.length > 0) {
        const sum = userReviews.reduce((acc, rv) => acc + rv.rating, 0);
        setAverageRating({
          average: Math.round((sum / userReviews.length) * 10) / 10,
          count: userReviews.length,
        });
      }

      setLoading(false);
    }
    load();
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="w-8 h-8 mx-auto mb-2 text-primary animate-pulse" />
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return notFound();
  }

  const isOwner = profile.id === demoUser.id;

  return (
    <PublicProfileDisplay
      profile={profile}
      interests={interests}
      stats={stats}
      isOwner={isOwner}
      currentUserId={demoUser.id}
      reviews={reviews}
      averageRating={averageRating}
    />
  );
}
