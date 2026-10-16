import { Card } from "@/components/ui/card";
import { ApplicationForm } from "./form";
import { APPLICATION_STEPS } from "@/lib/application-form";

export const metadata = { title: "Puppy application" };

export default function ApplyPage() {
  return (
    <Card>
      <h1 className="text-2xl font-bold">Puppy application</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        About ten minutes. {APPLICATION_STEPS.length} short sections. Your answers go straight to Jen and nowhere else.
      </p>
      <ApplicationForm steps={APPLICATION_STEPS} />
    </Card>
  );
}
