import { Inter } from "next/font/google";

import "./globals.css";
import StoreProvider from "./StoreProvider";
import { getWebsiteInfo } from "@/lib/services/serverSideAPICall";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export async function generateMetadata() {
  const websiteInfo = await getWebsiteInfo();

  return {
    title: websiteInfo?.websiteName || "Shop",
    description: "Browse our tech gear and gadgets.",
    icons: {
      icon: websiteInfo?.logoImage || "/favicon.ico",
    },
    openGraph: {
      title: websiteInfo?.websiteName || "Shop",
      description: "Explore premium electronics and accessories.",
    },
  };
}
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
