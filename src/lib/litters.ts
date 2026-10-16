import type { BadgeTone } from "@/components/ui/badge";
import type { LitterStatus, PuppyStatus } from "./types";

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
