import { ChefHat } from "lucide-react";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const px = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  return (
    <div className="flex items-center gap-3">
      <div className={`${px} rounded-2xl bg-gradient-hero grid place-items-center shadow-soft`}>
        <ChefHat className="h-1/2 w-1/2 text-primary-foreground" />
      </div>
      <span className={`${text} font-bold tracking-tight text-foreground`} style={{ fontFamily: "'Playfair Display', serif" }}>
        CocinaStock
      </span>
    </div>
  );
}
