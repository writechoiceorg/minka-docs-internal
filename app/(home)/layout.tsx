import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import type { ReactNode } from 'react';
import {
  NavbarMenu,
  NavbarMenuContent,
  NavbarMenuLink,
  NavbarMenuTrigger,
} from 'fumadocs-ui/layouts/home/navbar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      {...baseOptions()}
      links={[
        {
          type: 'custom',
          // only displayed on navbar, not mobile menu
          on: 'nav',
          children: (
            <NavbarMenu>
              <NavbarMenuTrigger>Documentation</NavbarMenuTrigger>
              <NavbarMenuContent>
                <NavbarMenuLink href="/docs">Overview</NavbarMenuLink>
                <NavbarMenuLink href="/docs/introduction-to-minka">Introduction to Minka</NavbarMenuLink>
                <NavbarMenuLink href="/docs/alias-directory">Alias Directory</NavbarMenuLink>
                <NavbarMenuLink href="/docs/Quickstart">Quickstart</NavbarMenuLink>
                <NavbarMenuLink href="/docs/using-the-alias-directory">Using the Alias Directory</NavbarMenuLink>
              </NavbarMenuContent>
            </NavbarMenu>
          ),
        },
      ]}
    >
      {children}
    </HomeLayout>
  );
}
