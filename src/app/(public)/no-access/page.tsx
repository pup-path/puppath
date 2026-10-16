import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "No access" };

async function tryClaim() {
  "use server";
  const supabase = await createClient();
  const { data } = await supabase.rpc("claim_invite");
  if (data === true) redirect("/");
  redirect("/no-access?tried=1");
}

export default async function NoAccessPage({ searchParams }: { searchParams: Promise<{ tried?: string }> }) {
  const { tried } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // If an invite exists for this email, convert it silently.
  const { data: claimed } = await supabase.rpc("claim_invite");
  if (claimed === true) redirect("/");

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="text-xl font-bold">No access yet</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You&apos;re signed in as <strong>{user.email}</strong>, but that email hasn&apos;t been added to a breeder account.
        Ask Jonathan to add it, then try again.
      </p>
      {tried && <p className="mt-3 text-sm text-red-700">Still no invite for this email.</p>}
      <div className="mt-6 flex gap-3">
        <form action={tryClaim}>
          <Button type="submit">Try again</Button>
        </form>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="ghost">Sign out</Button>
        </form>
      </div>
    </Card>
  );
}
