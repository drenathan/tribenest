export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4 flex-col md:flex-row gap-2 md:justify-between md:items-center">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground md:max-w-md">{description}</p>
      </div>
      {action}
    </div>
  );
}

export default PageHeader;
