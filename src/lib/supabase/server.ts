import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component: proxy.ts refreshes the session instead.
          }
        },
      },
    },
  );
}

/**
 * Current member (auth user + breeder membership). Redirects to /login when
 * signed out and to /no-access when signed in but not a member of any breeder.
 * Memoised per request so layouts and pages can both call it.
 */
export const getMember = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("id, breeder_id, full_name, role, breeders(name)")
    .eq("id", user.id)
    .maybeSingle();
  if (!member) redirect("/no-access");

  return {
    userId: user.id,
    email: user.email ?? "",
    breederId: member.breeder_id,
    fullName: member.full_name ?? user.email ?? "",
    role: member.role,
    breederName: (member.breeders as unknown as { name: string } | null)?.name ?? "PupPath",
  };
});
