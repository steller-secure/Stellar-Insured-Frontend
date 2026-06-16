import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider-enhanced";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { LoadingProvider } from "@/contexts/LoadingContext";
import GlobalLoader from "@/components/loaders/GlobalLoader";
import { ToastProvider } from "@/components/ui/toast";
import { NotificationProvider } from "@/context/NotificationContext";
import { JsonLd } from "@/components/JsonLd";
import { assertEnv } from "@/config/env";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WebVitals } from "@/components/web-vitals";
import {
  createOrganizationSchema,
  createRootMetadata,
  createWebSiteSchema,
} from "@/lib/metadata";

assertEnv();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = createRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <JsonLd
          data={[createOrganizationSchema(), createWebSiteSchema()]}
        />
        <ThemeProvider>
          <Suspense fallback={null}>
            <ErrorBoundary>
              <AnalyticsProvider>
                <WebVitals />
                <ToastProvider>
                  <NotificationProvider>
                    <AuthProvider>
                      <LoadingProvider>
                        <GlobalLoader />
                        {children}
                      </LoadingProvider>
                    </AuthProvider>
                  </NotificationProvider>
                </ToastProvider>
              </AnalyticsProvider>
            </ErrorBoundary>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
