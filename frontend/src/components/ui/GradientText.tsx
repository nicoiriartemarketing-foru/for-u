import type { HTMLAttributes, ReactNode } from 'react';

type GradientTextProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  as?: 'span' | 'strong' | 'em';
};

export default function GradientText({ children, as = 'span', className = '', ...props }: GradientTextProps) {
  const Component = as;
  return <Component className={`gradient-text ${className}`.trim()} {...props}>{children}</Component>;
}
