import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon: Icon, action, className }: PageHeaderProps) {
  return (
    <div className={`mb-6 flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-7 w-7 text-primary sm:h-8 sm:w-8" />}
          <h1 className="font-headline text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
        </div>
        {description && <p className="text-sm text-muted-foreground md:text-base">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
