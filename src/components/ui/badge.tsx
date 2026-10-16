import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        gray: "bg-gray-100 text-gray-800 border-gray-300",
        green: "bg-green-100 text-green-800 border-green-300",
        yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
        red: "bg-red-100 text-red-800 border-red-300",
        blue: "bg-blue-100 text-blue-800 border-blue-300",
        brand: "bg-orange-100 text-orange-800 border-orange-300",
        plum: "bg-peach-soft text-plum border-peach",
      },
    },
    defaultVariants: { tone: "gray" },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

export function Badge({ className, tone, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
