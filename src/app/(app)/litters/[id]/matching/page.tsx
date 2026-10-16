import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ComingSoon } from "@/components/page-header";

export default async function MatchingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <Link href={`/litters/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink"><ArrowLeft className="h-4 w-4" /> Litter</Link>
      <ComingSoon title="Matching" step={6} body="Offer puppies to families on the waitlist, record their answer, and confirm the match. Puppy and application statuses update on their own." />
    </>
  );
}
