import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
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
      { name: 'theme-color', content: '#000000' },
      ...seo({
        title: 'Leonardo Petrucci — Senior Frontend Engineer @ Webflow',
        description: `Leonardo Petrucci's personal site. A collection of my work, projects, and thoughts. Senior Frontend Engineer at Webflow, building modern web apps with TypeScript and React.`,
        image: '/OpenGraph.png',
        imageAlt: 'Leonardo Petrucci — Senior Frontend Engineer @ Webflow',
        url: '/',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      { rel: 'icon', href: '/favicon.png', type: 'image/png' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'canonical', href: 'https://petruc.ci/' },
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
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var m=document.cookie.match(/(?:^|; )theme=([^;]*)/);var t=m?decodeURIComponent(m[1]):null;if(!t)t='dark';var d=t==='dark';var h=document.documentElement,b=document.body;if(d){h.classList.add('dark');if(b)b.classList.add('dark')}else{h.classList.remove('dark');if(b)b.classList.remove('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="font-departure">
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
