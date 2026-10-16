import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { getApplication } from "@/lib/data/applications";
import { StageBadge } from "@/components/stage-badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StageMenu } from "../../pipeline/stage-menu";
import { Timeline } from "./timeline";
import { AddActivity } from "./add-activity";
import { AssessmentForm, DepositForm, PersonForm } from "./forms";
import { fullName, initials } from "@/lib/utils";
import { fmtDate, aud } from "@/lib/format";
import { SOURCE_LABEL, STAGE_META } from "@/lib/stages";

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getApplication(id);
  if (!result) notFound();
  const { application: app, activities } = result;
  const person = app.people;

  const homeEntries = Object.entries(app.home ?? {});
  const answerEntries = Object.entries(app.answers ?? {});

  return (
    <>
      <Link href="/pipeline" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Pipeline
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-peach text-lg font-semibold text-ink">{initials(person)}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-ink">{fullName(person)}</h1>
            <StageBadge stage={app.stage} />
            {app.stage === "waitlisted" && app.waitlist_position && <span className="text-sm text-muted-foreground">#{app.waitlist_position} on the waitlist</span>}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {person.email && (
              <a href={`mailto:${person.email}`} className="inline-flex items-center gap-1 hover:text-ink">
                <Mail className="h-3.5 w-3.5" /> {person.email}
              </a>
            )}
            {person.phone && (
              <a href={`tel:${person.phone}`} className="inline-flex items-center gap-1 hover:text-ink">
                <Phone className="h-3.5 w-3.5" /> {person.phone}
              </a>
            )}
            {(person.suburb || person.state) && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {[person.suburb, person.state, person.postcode].filter(Boolean).join(" ")}
              </span>
            )}
            {person.source && <span>via {SOURCE_LABEL[person.source]}{person.referred_by ? ` (${person.referred_by})` : ""}</span>}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{STAGE_META[app.stage].hint}</p>
        </div>
        <div className="flex items-center gap-2">
          {person.phone && (
            <Button variant="outline" size="sm" asChild>
              <a href={`https://wa.me/${person.phone.replace(/\D/g, "").replace(/^0/, "61")}`} target="_blank" rel="noreferrer">WhatsApp</a>
            </Button>
          )}
          <StageMenu id={app.id} stage={app.stage} label="Move stage" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: the application */}
        <div className="space-y-6 lg:col-span-3">
          {app.stage === "approved" && (
            <Card className="border-yellow-300 bg-yellow-50">
              <CardHeader className="mb-2">
                <CardTitle>Deposit requested {fmtDate(app.deposit_requested_at)}</CardTitle>
              </CardHeader>
              <p className="mb-3 text-sm text-yellow-900">When the transfer shows up, record it here. That moves them onto the waitlist automatically.</p>
              <DepositForm id={app.id} />
            </Card>
          )}
          {app.deposit_received_at && (
            <p className="text-sm text-muted-foreground">
              Deposit {app.deposit_amount ? aud(app.deposit_amount) : ""} received {fmtDate(app.deposit_received_at)}.
            </p>
          )}
          {app.closed_at && (
            <Card className="border-red-200 bg-red-50">
              <p className="text-sm text-red-900">
                {STAGE_META[app.stage].label} {fmtDate(app.closed_at)}{app.close_reason ? `: ${app.close_reason}` : ""}
              </p>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Jen&apos;s assessment</CardTitle>
            </CardHeader>
            <AssessmentForm app={app} />
          </Card>

          {app.enquiry_message && (
            <Card>
              <CardHeader>
                <CardTitle>Original enquiry</CardTitle>
              </CardHeader>
              <p className="whitespace-pre-wrap text-sm">{app.enquiry_message}</p>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Application answers</CardTitle>
              {app.submitted_at && <span className="text-xs text-muted-foreground">Submitted {fmtDate(app.submitted_at)}</span>}
            </CardHeader>
            {homeEntries.length === 0 && answerEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No application form yet. Once they submit the form the answers show here.</p>
            ) : (
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                {[...homeEntries, ...answerEntries].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k.replace(/_/g, " ")}</dt>
                    <dd className="whitespace-pre-wrap text-ink">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact details</CardTitle>
            </CardHeader>
            <PersonForm person={person} applicationId={app.id} />
          </Card>
        </div>

        {/* Right: the timeline */}
        <div className="lg:col-span-2">
          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <span className="text-xs text-muted-foreground">{activities.length} entries</span>
            </CardHeader>
            <AddActivity applicationId={app.id} personId={person.id} />
            <div className="mt-5 max-h-[70vh] overflow-y-auto pr-1">
              <Timeline activities={activities} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
