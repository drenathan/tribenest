import { FolderClosed } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col gap-6 items-center justify-center border border-dashed border-border rounded-lg p-12">
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
