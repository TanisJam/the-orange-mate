"use client";

interface UnreadBadgeProps {
  count: number;
}

export default function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count === 0) return null;

  return (
    <span className="absolute -top-2 -right-3 flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-primary px-1 text-[10px] font-heading text-neutral-white leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}
