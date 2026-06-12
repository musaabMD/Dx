import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

type AppIconProps = {
  product: Product;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  sm: "size-10 rounded-[10px] [&_svg]:size-5",
  md: "size-14 rounded-2xl [&_svg]:size-7",
  lg: "size-20 rounded-[22px] [&_svg]:size-10",
  xl: "size-24 rounded-[26px] [&_svg]:size-12",
};

export function AppIcon({ product, size = "md", className }: AppIconProps) {
  const Icon = product.icon;

  return (
    <div
      className={cn(
        "relative isolate flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.48),inset_0_-12px_18px_rgba(0,0,0,0.16),0_7px_14px_rgba(24,24,27,0.18)] ring-1 ring-black/5",
        product.tile,
        sizes[size],
        className,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.18)_42%,rgba(255,255,255,0)_43%)]" />
      <div className="absolute inset-x-1 top-1 h-[38%] rounded-[inherit] bg-white/20 blur-[0.5px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.48),rgba(255,255,255,0)_34%)]" />
      <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]" />
      <Icon
        className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
        strokeWidth={2.35}
        aria-hidden="true"
      />
    </div>
  );
}
