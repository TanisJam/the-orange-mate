import { BackButton } from "@/components/back-button";

interface PageHeaderProps {
  title: string;
  /** Explicit fallback destination when there is no in-app history. */
  backHref?: string;
  backLabel?: string;
  /** Optional actions rendered on the right of the title row. */
  actions?: React.ReactNode;
}

/**
 * Standard header for detail/inner pages: a hybrid Back button above a title
 * row with optional actions. Keeps back-navigation consistent across screens.
 */
export function PageHeader({
  title,
  backHref = "/dashboard",
  backLabel = "Volver",
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-3">
      <BackButton fallbackHref={backHref} label={backLabel} />
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl text-neutral-black dark:text-neutral-white">
          {title}
        </h1>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
