import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plane, Users, Route, MessageCircle } from "lucide-react";

const features = [
  {
    icon: Plane,
    title: "Browse plans",
    description:
      "Discover trips and activities posted by real travelers across Latin America.",
  },
  {
    icon: Route,
    title: "Create & collaborate",
    description:
      "Build your own travel plan and invite others to join. Split costs, share itineraries.",
  },
  {
    icon: Users,
    title: "Connect with travelers",
    description:
      "Find travel buddies, send friend requests, and build your network of like-minded explorers.",
  },
  {
    icon: MessageCircle,
    title: "Chat & coordinate",
    description:
      "Message teammates, leave reviews, and stay in the loop with notifications.",
  },
];

export default function DemoHomePage() {
  return (
    <div className="space-y-10 py-4">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <Card className="border-primary/30 dark:border-primary-light/30 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary-light/5">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-heading text-primary dark:text-primary-light">
            Explore The Orange Mate
          </CardTitle>
          <CardDescription className="text-base max-w-xl mx-auto pt-2">
            This is a read-only demo of the full experience. Browse plans, check
            out profiles, and see how travelers connect — no sign-up required.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          <Link
            href="/demo/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 dark:bg-primary-light dark:text-background dark:hover:bg-primary-light/90 transition-colors"
          >
            Start exploring →
          </Link>
        </CardContent>
      </Card>

      {/* ── Feature grid ──────────────────────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="shadow-sm">
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <span className="flex-shrink-0 rounded-md bg-primary/10 dark:bg-primary-light/10 p-2 text-primary dark:text-primary-light">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Sign-up CTA ───────────────────────────────────────────────── */}
      <Card className="text-center">
        <CardContent className="py-8 space-y-4">
          <p className="text-muted-foreground max-w-md mx-auto">
            Liked what you saw? Create a free account to post your own travel
            plans, connect with real adventurers, and start planning your next
            trip.
          </p>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 dark:bg-primary-light dark:text-background dark:hover:bg-primary-light/90 transition-colors"
          >
            Join The Orange Mate
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
