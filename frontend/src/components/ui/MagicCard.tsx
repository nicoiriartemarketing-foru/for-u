import type { HTMLAttributes, ReactNode } from 'react';

type MagicCardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: 'article' | 'section' | 'div';
};

export default function MagicCard({ children, as = 'article', className = '', ...props }: MagicCardProps) {
  const Component = as;
  return <Component className={`magic-card ${className}`.trim()} {...props}>{children}</Component>;
}
