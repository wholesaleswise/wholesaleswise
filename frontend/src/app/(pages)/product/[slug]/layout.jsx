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
      };
    }

    const rawImage = product?.productImageUrls?.[0];
    const absoluteImage = rawImage?.startsWith("http")
      ? rawImage
      : `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com"
        }${rawImage}`;

    const title = `${product.productName} - ${websiteInfo?.websiteName}`;
    const description = `Explore top-quality ${product.productName} at Tech Electronics.`;

    return {
      title,
      description,
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
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return {
      title: "Error - Tech Electronics",
      description: "An error occurred while loading the product metadata.",
    };
  }
}

export default function ProductPage({ params }) {
  const { slug } = params;
  return <SingleProduct slug={slug} />;
}
