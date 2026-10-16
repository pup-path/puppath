export type ApplicationStage =
  | "enquiry" | "applied" | "reviewing" | "approved" | "waitlisted" | "matched" | "placed"
  | "declined" | "withdrawn" | "on_hold";

export type PersonSource = "website" | "instagram" | "facebook" | "referral" | "whatsapp" | "other";
export type SexPreference = "male" | "female" | "any";
export type TimingPreference = "asap" | "next_litter" | "flexible" | "specific";
export type DogSex = "male" | "female";
export type LitterStatus = "planned" | "confirmed" | "born" | "weaning" | "ready" | "complete";
export type PuppyStatus = "available" | "held" | "matched" | "placed" | "deceased";
export type AllocationStatus = "offered" | "accepted" | "declined" | "confirmed" | "collected" | "cancelled";
export type ActivityType = "note" | "message" | "call" | "email" | "meeting" | "stage_change" | "allocation" | "system";
export type ActivityDirection = "in" | "out";
export type ActivityChannel = "whatsapp" | "email" | "sms" | "phone" | "in_person" | "web";

export interface Person {
  id: string;
  breeder_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  source: PersonSource | null;
  referred_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  breeder_id: string;
  person_id: string;
  stage: ApplicationStage;
  waitlist_position: number | null;
  enquiry_message: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  deposit_requested_at: string | null;
  deposit_received_at: string | null;
  deposit_amount: number | null;
  closed_at: string | null;
  close_reason: string | null;
  preferred_sex: SexPreference | null;
  preferred_colours: string[];
  preferred_generation: string | null;
  timing: TimingPreference | null;
  timing_note: string | null;
  home: Record<string, string>;
  answers: Record<string, string>;
  internal_rating: number | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationWithPerson extends Application {
  people: Person;
}

export interface Activity {
  id: string;
  breeder_id: string;
  person_id: string;
  application_id: string | null;
  litter_id: string | null;
  puppy_id: string | null;
  type: ActivityType;
  direction: ActivityDirection | null;
  channel: ActivityChannel | null;
  body: string | null;
  occurred_at: string;
  created_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Dog {
  id: string;
  breeder_id: string;
  name: string;
  registered_name: string | null;
  call_name: string | null;
  sex: DogSex;
  breed_type: string | null;
  generation: string | null;
  dob: string | null;
  colour: string | null;
  microchip: string | null;
  sire_id: string | null;
  dam_id: string | null;
  is_external: boolean;
  owner_person_id: string | null;
  status: "active" | "retired" | "deceased";
  photo_path: string | null;
  notes: string | null;
}

export interface Litter {
  id: string;
  breeder_id: string;
  code: string;
  dam_id: string | null;
  sire_id: string | null;
  mating_date: string | null;
  due_date: string | null;
  whelped_date: string | null;
  go_home_date: string | null;
  status: LitterStatus;
  expected_count: number | null;
  notes: string | null;
}

export interface Puppy {
  id: string;
  breeder_id: string;
  litter_id: string;
  collar_colour: string | null;
  temp_name: string | null;
  sex: DogSex | null;
  colour: string | null;
  birth_weight_g: number | null;
  microchip: string | null;
  status: PuppyStatus;
  temperament_notes: string | null;
  notes: string | null;
}

export interface Allocation {
  id: string;
  breeder_id: string;
  puppy_id: string;
  application_id: string;
  status: AllocationStatus;
  offered_at: string;
  responded_at: string | null;
  collected_at: string | null;
  notes: string | null;
}
