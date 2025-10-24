import type { HomeLayoutProps as OriginalHomeLayoutProps } from 'fumadocs-ui/home-layout';
import type { HTMLAttributes, ReactNode } from 'react';

declare module 'fumadocs-ui/home-layout' {
  export declare function HomeLayout(
    props: OriginalHomeLayoutProps &
      Omit<HTMLAttributes<HTMLElement>, keyof OriginalHomeLayoutProps>,
  ): ReactNode;

  export type { OriginalHomeLayoutProps as HomeLayoutProps };
}