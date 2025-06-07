import {
  getSingleProductServerSide,
  getWebsiteInfo,
} from "@/lib/services/serverSideAPICall";
import SingleProduct from "./page";

export async function generateMetadata({ params }) {
  const { slug } = params;

  try {
    const product = await getSingleProductServerSide(slug);
    const websiteInfo = await getWebsiteInfo();

    if (!product) {
      return {
        title: `Product Not Found - ${websiteInfo?.websiteName} `,
        description: "The requested product could not be found.",
        keywords: "Product Not Found, Error, Tech Electronics",
      };
    }

    const rawImage = product?.productImageUrls?.[0];
    const absoluteImage = rawImage?.startsWith("http")
      ? rawImage
      : `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com"
        }${rawImage}`;

    const title = `${product.productName} - ${websiteInfo?.websiteName}`;

    // Use keywords from the database
    const keywords = product?.keywords;

    // Description with product name
    const description = `Explore top-quality ${product.productName} at ${websiteInfo?.websiteName}. Keywords: ${keywords}`;

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        images: absoluteImage
          ? [
              {
                url: absoluteImage,
                width: 800,
                height: 600,
                alt: product.productName,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: absoluteImage ? [absoluteImage] : [],
      },

      head: [
        {
          name: "keywords",
          content: keywords,
        },
      ],
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return {
      title: "Error - Tech Electronics",
      description: "An error occurred while loading the product metadata.",
      keywords: "Error, Tech Electronics, Product Not Found",
    };
  }
}

export default function ProductPage({ params }) {
  const { slug } = params;
  return <SingleProduct slug={slug} />;
}
