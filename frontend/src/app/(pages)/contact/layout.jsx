import { getWebsiteInfo } from "@/lib/services/serverSideAPICall";
import ContactUs from "./page";

export async function generateMetadata() {
  const websiteInfo = await getWebsiteInfo();
  return {
    title: `Contact Us - ${websiteInfo?.websiteName}`,
    description:
      "Have questions or need support? Reach out to Tech Electronics — we're here to help!",
  };
}
export default function ContactPage() {
  return <ContactUs />;
}
