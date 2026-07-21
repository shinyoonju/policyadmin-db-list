'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps, ReactNode } from 'react';

type TrackedLinkProps = ComponentProps<typeof Link> & {
  label: string;
  children: ReactNode;
};

export function TrackedLink({ label, href, children, onClick, ...props }: TrackedLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      onClick={(event) => {
        fetch('/api/log/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label, href: String(href), path: pathname }),
          keepalive: true
        }).catch(() => undefined);

        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
