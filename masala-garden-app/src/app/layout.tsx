import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/lib/firebase/auth-context";

export const metadata: Metadata = {
  title: "Masala Garden - Authentic Indian Cuisine",
  description: "Experience authentic Indian flavors with fresh ingredients. Order online for dine-in, takeaway, or delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
