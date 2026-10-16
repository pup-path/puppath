/**
 * The public application form, as data.
 *
 * Edit this file to change the questions Jen asks. Nothing else needs to
 * change: answers land in applications.home / applications.answers as jsonb
 * and render on the application page automatically. The five "typed" fields
 * (preferred_sex, preferred_colours, preferred_generation, timing, timing_note)
 * map to real columns so the pipeline can filter on them.
 */

export type Question =
  | { key: string; label: string; type: "text"; placeholder?: string; required?: boolean; hint?: string }
  | { key: string; label: string; type: "textarea"; placeholder?: string; required?: boolean; hint?: string }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[]; required?: boolean; hint?: string }
  | { key: string; label: string; type: "multi"; options: { value: string; label: string }[]; hint?: string }
  | { key: string; label: string; type: "yesno"; required?: boolean; hint?: string };

export interface Step {
  id: string;
  title: string;
  intro?: string;
  /** "home" answers go to applications.home, "answers" to applications.answers, "typed" to real columns */
  bucket: "contact" | "home" | "answers" | "typed";
  questions: Question[];
}

export const APPLICATION_STEPS: Step[] = [
  {
    id: "you",
    title: "About you",
    intro: "So we know who we're talking to.",
    bucket: "contact",
    questions: [
      { key: "first_name", label: "First name", type: "text", required: true },
      { key: "last_name", label: "Last name", type: "text", required: true },
      { key: "email", label: "Email", type: "text", required: true, placeholder: "you@example.com" },
      { key: "phone", label: "Mobile", type: "text", required: true, placeholder: "04xx xxx xxx" },
      { key: "suburb", label: "Suburb", type: "text", required: true },
      { key: "state", label: "State", type: "select", required: true, options: ["NSW", "VIC", "QLD", "ACT", "SA", "WA", "TAS", "NT"].map((s) => ({ value: s, label: s })) },
      { key: "postcode", label: "Postcode", type: "text", required: true },
      {
        key: "source",
        label: "How did you find Northern Beaches Groodles?",
        type: "select",
        required: true,
        options: [
          { value: "instagram", label: "Instagram" },
          { value: "facebook", label: "Facebook" },
          { value: "website", label: "Google / website" },
          { value: "referral", label: "A friend or a previous NBG family" },
          { value: "other", label: "Somewhere else" },
        ],
      },
      { key: "referred_by", label: "If someone referred you, who?", type: "text" },
    ],
  },
  {
    id: "home",
    title: "Your home",
    intro: "Honest answers help us match the right puppy to the right family. There are no wrong answers.",
    bucket: "home",
    questions: [
      {
        key: "household",
        label: "Who lives at home?",
        type: "select",
        required: true,
        options: [
          { value: "single", label: "Just me" },
          { value: "couple", label: "A couple" },
          { value: "family_young", label: "Family with children under 6" },
          { value: "family_older", label: "Family with children 6 and over" },
          { value: "share", label: "Share house" },
          { value: "other", label: "Other" },
        ],
      },
      { key: "children_ages", label: "If you have children, their ages", type: "text", placeholder: "e.g. 4 and 7" },
      {
        key: "home_type",
        label: "What kind of home?",
        type: "select",
        required: true,
        options: [
          { value: "house_yard", label: "House with a yard" },
          { value: "townhouse", label: "Townhouse or duplex with a courtyard" },
          { value: "apartment", label: "Apartment" },
          { value: "acreage", label: "Acreage or rural" },
        ],
      },
      { key: "fenced", label: "Is the outdoor area fully fenced?", type: "yesno", required: true },
      { key: "own_or_rent", label: "Do you own or rent?", type: "select", required: true, options: [{ value: "own", label: "Own" }, { value: "rent", label: "Rent, and pets are allowed" }, { value: "rent_unsure", label: "Rent, not sure about pets yet" }] },
      { key: "other_pets", label: "Other pets at home now", type: "textarea", placeholder: "Breed, age, temperament. Or 'none'." },
      {
        key: "hours_alone",
        label: "On a normal weekday, how long would the puppy be alone?",
        type: "select",
        required: true,
        options: [
          { value: "0-2", label: "Rarely, someone is usually home" },
          { value: "2-4", label: "2 to 4 hours" },
          { value: "4-6", label: "4 to 6 hours" },
          { value: "6-8", label: "6 to 8 hours" },
          { value: "8+", label: "More than 8 hours" },
        ],
      },
      { key: "alone_plan", label: "What's the plan for those hours?", type: "textarea", placeholder: "Doggy daycare, a walker, working from home, family nearby…" },
    ],
  },
  {
    id: "experience",
    title: "Your experience",
    bucket: "answers",
    questions: [
      {
        key: "dog_experience",
        label: "Have you owned a dog before?",
        type: "select",
        required: true,
        options: [
          { value: "first", label: "This will be my first dog" },
          { value: "as_child", label: "Growing up, not as an adult" },
          { value: "yes", label: "Yes, as an adult" },
          { value: "oodle", label: "Yes, including an oodle breed" },
        ],
      },
      { key: "previous_dogs", label: "Tell us about them", type: "textarea", placeholder: "Breeds, how long you had them, what happened to them." },
      { key: "training_plan", label: "How do you plan to approach training and socialising?", type: "textarea", required: true },
      { key: "grooming_aware", label: "Groodles need brushing several times a week and a professional groom every 6 to 8 weeks. Are you set up for that?", type: "yesno", required: true },
      { key: "holidays", label: "What happens with the dog when you travel?", type: "textarea" },
    ],
  },
  {
    id: "puppy",
    title: "The puppy you're hoping for",
    intro: "Preferences help us match, but the best matches are usually about temperament. Flexibility helps.",
    bucket: "typed",
    questions: [
      { key: "preferred_sex", label: "Boy or girl?", type: "select", required: true, options: [{ value: "any", label: "Either, temperament matters more" }, { value: "female", label: "Girl" }, { value: "male", label: "Boy" }] },
      {
        key: "preferred_colours",
        label: "Colours you'd love",
        type: "multi",
        options: ["Apricot", "Cream", "Red", "Chocolate", "Black", "Parti", "Any"].map((c) => ({ value: c.toLowerCase(), label: c })),
      },
      { key: "preferred_generation", label: "Size or generation preference", type: "text", placeholder: "e.g. mini, medium, F1b. Leave blank if unsure." },
      {
        key: "timing",
        label: "When are you hoping to bring a puppy home?",
        type: "select",
        required: true,
        options: [
          { value: "asap", label: "As soon as one is available" },
          { value: "next_litter", label: "The next litter" },
          { value: "flexible", label: "Flexible, happy to wait for the right one" },
          { value: "specific", label: "A specific time (tell us below)" },
        ],
      },
      { key: "timing_note", label: "Anything about timing we should know?", type: "text", placeholder: "e.g. not before March, we're away in Feb" },
    ],
  },
  {
    id: "final",
    title: "Last few things",
    bucket: "answers",
    questions: [
      { key: "why_groodle", label: "Why a groodle, and why NBG?", type: "textarea", required: true },
      { key: "activity", label: "What does a normal week look like for the dog? Walks, beach, kids' sport, quiet evenings…", type: "textarea" },
      { key: "vet", label: "Do you have a vet in mind?", type: "text" },
      { key: "anything_else", label: "Anything else you'd like us to know?", type: "textarea" },
      { key: "agree_contact", label: "Are you happy for Jen to contact you by phone or WhatsApp about your application?", type: "yesno", required: true },
    ],
  },
];

export const CONTACT_KEYS = ["first_name", "last_name", "email", "phone", "suburb", "state", "postcode", "source", "referred_by"] as const;
export const TYPED_KEYS = ["preferred_sex", "preferred_colours", "preferred_generation", "timing", "timing_note"] as const;
