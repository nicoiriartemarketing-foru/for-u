import type { HTMLAttributes, ReactNode } from 'react';

type MagicBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export default function MagicBadge({ children, className = '', ...props }: MagicBadgeProps) {
  return <span className={`magic-badge ${className}`.trim()} {...props}>{children}</span>;
}
