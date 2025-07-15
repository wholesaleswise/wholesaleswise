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
    title: websiteInfo?.websiteName,
    description: "Browse our tech gear and gadgets.",
    keywords: websiteInfo?.keywords,
    icons: {
      icon: websiteInfo?.logoImage,
    },
    openGraph: {
      title: websiteInfo?.websiteName,
      description: "Explore premium electronics and accessories.",
      url: websiteInfo?.websiteUrl,
      images: [
        {
          url: websiteInfo?.logoImage,
          width: 800,
          height: 600,
          alt: `${websiteInfo?.websiteName} Logo`,
        },
      ],
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
