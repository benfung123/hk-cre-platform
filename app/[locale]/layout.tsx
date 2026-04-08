import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ToastProvider } from '@/components/ui/toast-provider';
import { DiagnosticsProvider } from '@/components/diagnostics-provider';
import "../globals.css";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  
  const baseUrl = 'https://hk-cre-platform.vercel.app';
  
  return {
    title: {
      template: `%s | ${t('metadata.title')}`,
      default: t('metadata.title'),
    },
    description: t('metadata.description'),
    keywords: ['香港商業地產', '寫字樓', '租金', '成交', '地產數據', 'HK Commercial Real Estate', 'Office Rental', 'Property Data'],
    authors: [{ name: 'HK CRE Platform' }],
    creator: 'HK CRE Platform',
    publisher: 'HK CRE Platform',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en-HK': '/en',
        'zh-HK': '/zh-hk',
        'zh-CN': '/zh-cn',
      },
    },
    icons: {
      icon: [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_HK' : locale === 'zh-hk' ? 'zh_HK' : 'zh_CN',
      alternateLocale: ['en_HK', 'zh_HK', 'zh_CN'],
      url: baseUrl,
      siteName: t('metadata.title'),
      title: t('metadata.title'),
      description: t('metadata.description'),
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('metadata.title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('metadata.title'),
      description: t('metadata.description'),
      images: ['/og-image.png'],
      creator: '@hkcreplatform',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            <DiagnosticsProvider>
              <Navbar />
              <main className="flex-1 px-4 sm:px-6 lg:px-8">{children}</main>
              <footer className="border-t py-6 text-center text-sm text-muted-foreground">
                <div className="container">
                  © {new Date().getFullYear()} HK CRE Platform. All rights reserved.
                </div>
              </footer>
            </DiagnosticsProvider>
          </ToastProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
