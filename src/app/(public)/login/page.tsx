import { Card } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <Card className="mx-auto max-w-md">
      <h1 className="text-xl font-bold">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Enter your email and we&apos;ll send you a sign-in link. No password.</p>
      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <LoginForm next={next} />
    </Card>
  );
}
