import { Card } from "@/components/ui/card";
import { EnquiryForm } from "./form";

export const metadata = { title: "Enquire about a puppy" };

export default function EnquirePage() {
  return (
    <Card>
      <h1 className="text-2xl font-bold">Say hello</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell us a little about you and the puppy you&apos;re hoping for. Jen reads every message herself and will reply within a couple of days.
      </p>
      <EnquiryForm />
    </Card>
  );
}
