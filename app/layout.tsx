import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import "./globals.css";
import Loader from "./components/loader";
import GoogleAnalytics from "./components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Empowerdreamz",
  description: "we help people in need",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${nunitoSans.variable}`}>
      <head>
        <GoogleAnalytics />
      </head>
    
   <body className={`bg-white ${nunitoSans.className}`} data-cjcrx="addYes" cz-shortcut-listen="true">

        
        <Loader>
          {children}
        </Loader>
          
      </body>
    </html>
  );
}