import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import * as React from 'react';
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary';
import { NotFound } from '@/components/NotFound';
import appCss from '@/styles/app.css?url';
import { seo } from '@/utils/seo';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: 'Leonardo Petrucci',
        description: `Leonardo Petrucci's personal site. A collection of my work, projects, and thoughts.`,
        image: '/OpenGraph.png',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.png' },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
      {/* <footer className="mt-8 mb-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Leonardo Petrucci. All rights reserved.
      </footer> */}
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body className="font-departure dark">
        {/* <div className="flex flex-col items-center">
          <div className="max-w-4xl w-full"> */}
            {children}
            {/* <TanStackRouterDevtools position="bottom-right" /> */}
            <Scripts />
          {/* </div>
        </div> */}
      </body>
    </html>
  );
}
