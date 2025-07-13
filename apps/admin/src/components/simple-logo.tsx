import { Link } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";

export function SimpleLogo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex justify-center gap-2 md:justify-start text-foreground ${className}`}
    >
      <Link to="/" className="flex items-center gap-2 font-medium">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEnd className="size-4" />
        </div>
        TribeNest
      </Link>
    </div>
  );
}
