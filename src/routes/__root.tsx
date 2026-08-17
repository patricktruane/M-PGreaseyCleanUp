import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title:
          "M & P Greasey Clean Up Inc — Grease & Degreasing Specialists | Wilkes-Barre, PA",
      },
      {
        name: "description",
        content:
          "Commercial & industrial grease removal serving Wilkes-Barre and Northeastern Pennsylvania since 2002. Kitchen degreasing, grease trap & interceptor cleaning, exhaust hood & duct cleaning, pressure washing, and scheduled maintenance plans. Call (570) 825-5403.",
      },
      { name: "theme-color", content: "#0b1220" },
      {
        property: "og:title",
        content:
          "M & P Greasey Clean Up Inc — Grease Down. Standards Up.",
      },
      {
        property: "og:description",
        content:
          "Commercial kitchen degreasing, grease trap cleaning, hood & duct cleaning, and industrial degreasing across Northeastern Pennsylvania. Get a straightforward quote — call (570) 825-5403.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
