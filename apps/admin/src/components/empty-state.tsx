import { cn } from "@tribe-nest/frontend-shared";
import { FolderClosed } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 items-center justify-center border border-dashed border-border rounded-lg p-12",
        className,
      )}
    >
      <FolderClosed size={50} className="text-muted-foreground" />
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {action}
    </div>
  );
}
export default EmptyState;
