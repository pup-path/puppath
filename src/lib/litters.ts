import type { BadgeTone } from "@/components/ui/badge";
import type { AllocationStatus, LitterStatus, PuppyStatus } from "./types";

export const LITTER_STATUSES: LitterStatus[] = ["planned", "confirmed", "born", "weaning", "ready", "complete"];

export const LITTER_STATUS_META: Record<LitterStatus, { label: string; tone: BadgeTone; hint: string }> = {
  planned: { label: "Planned", tone: "gray", hint: "Pairing chosen, waiting on the heat or mating." },
  confirmed: { label: "Pregnant", tone: "yellow", hint: "Mating done, pregnancy confirmed, counting down." },
  born: { label: "Born", tone: "brand", hint: "Puppies on the ground. Weeks 1 to 3." },
  weaning: { label: "Weaning", tone: "brand", hint: "Weeks 3 to 6. Matching happens here." },
  ready: { label: "Ready", tone: "green", hint: "Weeks 7 to 8. Vet work done, go-home dates set." },
  complete: { label: "Complete", tone: "green", hint: "All puppies placed." },
};

export const PUPPY_STATUS_META: Record<PuppyStatus, { label: string; tone: BadgeTone }> = {
  available: { label: "Available", tone: "brand" },
  held: { label: "Holding", tone: "yellow" },
  matched: { label: "Matched", tone: "green" },
  placed: { label: "Gone home", tone: "gray" },
  deceased: { label: "Deceased", tone: "gray" },
};

export const COLLAR_COLOURS = ["Pink", "Blue", "Green", "Red", "Yellow", "Purple", "Orange", "Black", "White", "Teal", "Brown", "Grey"];

export const GESTATION_DAYS = 63;
export const GO_HOME_WEEKS = 8;

export const ALLOCATION_META: Record<AllocationStatus, { label: string; tone: BadgeTone; hint: string }> = {
  offered: { label: "Offered", tone: "yellow", hint: "Waiting to hear back from the family." },
  accepted: { label: "Accepted", tone: "green", hint: "They said yes. Confirm once the balance or paperwork is sorted." },
  confirmed: { label: "Confirmed", tone: "green", hint: "Locked in. Mark collected on go-home day." },
  collected: { label: "Gone home", tone: "gray", hint: "Puppy has gone home." },
  declined: { label: "Declined", tone: "red", hint: "The family passed on this puppy." },
  cancelled: { label: "Cancelled", tone: "gray", hint: "Offer withdrawn." },
};

/** What a breeder can do next with an allocation in a given state. */
export const ALLOCATION_NEXT: Record<AllocationStatus, { to: AllocationStatus; label: string; variant?: "default" | "outline" | "ghost" | "destructive" }[]> = {
  offered: [
    { to: "accepted", label: "They said yes" },
    { to: "declined", label: "They passed", variant: "outline" },
    { to: "cancelled", label: "Withdraw offer", variant: "ghost" },
  ],
  accepted: [
    { to: "confirmed", label: "Confirm match" },
    { to: "cancelled", label: "Cancel", variant: "ghost" },
  ],
  confirmed: [
    { to: "collected", label: "Gone home today" },
    { to: "cancelled", label: "Cancel", variant: "ghost" },
  ],
  collected: [],
  declined: [],
  cancelled: [],
};
