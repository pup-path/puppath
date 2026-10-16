import { cn } from "@/lib/utils";

/** NBG mark from the wireframes: sun and palms in a peach circle. */
export function Logo({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const dims = { sm: "h-9 w-9", md: "h-14 w-14", lg: "h-24 w-24" }[size];
  return (
    <div className={cn(dims, "relative flex items-center justify-center overflow-hidden rounded-full bg-peach", className)}>
      <svg viewBox="0 0 40 40" className="h-[70%] w-[70%]" aria-hidden>
        <circle cx="25" cy="15" r="10" fill="#E89B3C" />
        <path
          d="M12 35 L14 20 M14 20 C10 18 8 14 10 12 M14 20 C12 16 14 12 18 12 M14 20 C16 17 20 16 22 18"
          stroke="#2D2D2D"
          strokeWidth="1.5"
          fill="none"
        />
        <path d="M20 35 L21 24 M21 24 C18 23 17 20 18 18 M21 24 C20 21 22 18 25 19" stroke="#2D2D2D" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );
}
