import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-heading text-primary">Protected Dashboard</h1>
        <p className="text-lg font-body text-neutral-gray">
          Welcome to your protected area! This page is only accessible to authenticated users.
        </p>
      </div>
      
      <div className="w-full">
        <div className="bg-success/10 border border-success rounded-[--radius] text-sm p-4 flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} className="text-success" />
          <span className="font-body text-success">
            This is a protected page that you can only see as an authenticated user
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-6 items-start">
        <h2 className="font-heading text-2xl text-neutral-black">Your User Details</h2>
        <div className="w-full bg-neutral-light border border-neutral-gray rounded-[--radius] p-4">
          <pre className="text-xs font-mono text-neutral-black max-h-32 overflow-auto">
            {JSON.stringify(data.user, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="text-center space-y-4">
                     <h2 className="font-heading text-2xl text-neutral-black">What&apos;s Next?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-white border border-neutral-gray rounded-[--radius] p-6">
            <h3 className="font-heading text-lg text-primary mb-2">Build Your App</h3>
            <p className="font-body text-neutral-gray">
              Start building your application with the authentication already set up.
            </p>
          </div>
          <div className="bg-neutral-white border border-neutral-gray rounded-[--radius] p-6">
            <h3 className="font-heading text-lg text-secondary mb-2">Explore Supabase</h3>
            <p className="font-body text-neutral-gray">
              Add database tables, real-time subscriptions, and more Supabase features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
