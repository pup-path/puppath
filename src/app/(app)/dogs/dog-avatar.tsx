import { cn } from "@/lib/utils";

export function DogAvatar({ name, sex, url, size = "md", className }: { name: string; sex: string | null; url: string | null; size?: "sm" | "md" | "lg"; className?: string }) {
  const dims = { sm: "h-10 w-10 text-sm", md: "h-14 w-14 text-base", lg: "h-32 w-32 text-3xl" }[size];
  const tint = sex === "male" ? "bg-blue-100 text-blue-800" : "bg-peach-soft text-plum";
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={name} className={cn(dims, "shrink-0 rounded-xl object-cover", className)} />
  ) : (
    <div className={cn(dims, tint, "flex shrink-0 items-center justify-center rounded-xl font-semibold", className)}>{name[0]?.toUpperCase()}</div>
  );
}
