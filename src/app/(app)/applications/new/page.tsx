import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { NewEnquiryForm } from "./form";

export const metadata = { title: "Add enquiry" };

export default function NewApplicationPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/pipeline" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Pipeline
      </Link>
      <PageHeader title="Add an enquiry" description="For people who came in on WhatsApp, Instagram or the phone. Website enquiries arrive here on their own." />
      <Card>
        <NewEnquiryForm />
      </Card>
    </div>
  );
}
