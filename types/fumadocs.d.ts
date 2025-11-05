import type { HomeLayoutProps as OriginalHomeLayoutProps } from 'fumadocs-ui/home-layout';
import type { HTMLAttributes, ReactNode, ReactNode as ReactNodeType } from 'react';

declare module 'fumadocs-ui/home-layout' {
  export declare function HomeLayout(
    props: OriginalHomeLayoutProps &
      Omit<HTMLAttributes<HTMLElement>, keyof OriginalHomeLayoutProps>,
  ): ReactNode;

  export type { OriginalHomeLayoutProps as HomeLayoutProps };
}

// Global types for fumadocs - these are used by the App Router
declare global {
  type PageProps<T extends string = string> = {
    params: Promise<{ slug?: string[] }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  };

  type LayoutProps<T extends string = string> = {
    children: ReactNodeType;
    params?: Promise<Record<string, string | string[] | undefined>>;
  };
}