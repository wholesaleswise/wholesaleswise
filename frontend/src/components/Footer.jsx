"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useGetAllSocialLinksQuery } from "@/lib/services/socialLink";
import { useGetInfoQuery } from "@/lib/services/websiteInfo";
import { Mail, MapPin, PhoneCall } from "lucide-react";

import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
  FaViber,
  FaWhatsapp,
  FaTelegramPlane,
  FaSnapchatGhost,
  FaTiktok,
  FaGithub,
} from "react-icons/fa";
import { useGetAllProductQuery } from "@/lib/services/product";

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const { data: response } = useGetAllSocialLinksQuery();
  const { data: websiteData } = useGetInfoQuery();
  const currentYear = new Date().getFullYear();
  const [websiteInfo, setWebsiteInfo] = useState(null);
  const [products, setProducts] = useState([]);

  const {
    data: productData,
    isLoading,
    isError,
    status,
  } = useGetAllProductQuery();
  useEffect(() => {
    if (productData?.products) {
      setProducts(productData?.products);
    }
  }, [productData]);
  useEffect(() => {
    if (response) setSocialLinks(response);
  }, [response]);

  useEffect(() => {
    if (websiteData?.data) setWebsiteInfo(websiteData.data);
  }, [websiteData]);

  const getSocialIcon = (name) => {
    const icons = {
      facebook: { icon: <FaFacebook />, color: "#062e83" },
      instagram: { icon: <FaInstagram />, color: "#E1306C" },
      linkedin: { icon: <FaLinkedinIn />, color: "#0077B5" },
      twitter: { icon: <FaTwitter />, color: "#1DA1F2" },
      youtube: { icon: <FaYoutube />, color: "#FF0000" },
      viber: { icon: <FaViber />, color: "#665CAC" },
      whatsapp: { icon: <FaWhatsapp />, color: "#25D366" },
      telegram: { icon: <FaTelegramPlane />, color: "#0088cc" },
      snapchat: { icon: <FaSnapchatGhost />, color: "#FFFC00" },
      tiktok: { icon: <FaTiktok />, color: "#010101" },
      github: { icon: <FaGithub />, color: "#333" },
    };

    const key = name?.toLowerCase();
    return icons[key] || null;
  };

  return (
    <>
      {productData && (
        <>
          <footer className="bg-[#282626] text-white px-4">
            <div className="container mx-auto">
              <div className=" py-10 flex flex-col md:flex-row md:justify-around gap-10 ">
                <div>
                  {!websiteInfo?.websiteName && websiteInfo?.logoImage && (
                    <Link href="/" className="flex mb-4 h-12 w-12">
                      <img src={websiteInfo?.logoImage || null} alt={" Logo"} />
                    </Link>
                  )}
                  <ul className="space-y-4 text-light text-sm">
                    <li className="flex items-start">
                      {websiteInfo?.websiteName && (
                        <span className="uppercase text-lg md:text-xl font-semibold text-primary hover:text-hover">
                          {websiteInfo?.websiteName}
                        </span>
                      )}
                    </li>
                    <li className="flex items-start">
                      <MapPin size={22} className="mr-2 mt-1 text-light " />
                      <span className="max-w-xs">{websiteInfo?.address}</span>
                    </li>
                    <li className="flex items-center hover:text-primary">
                      <Mail size={18} className="mr-2 text-light " />
                      <a href={`mailto:${websiteInfo?.email}`}>
                        {websiteInfo?.email}
                      </a>
                    </li>
                    <li className="flex items-center">
                      <PhoneCall size={18} className="mr-2 text-light " />
                      <span>{websiteInfo?.supportNumber}</span>
                    </li>
                  </ul>
                </div>

                {/* Company */}
                <div className="md:text-center ">
                  <h2 className="text-lg md:text-xl font-semibold mb-4 uppercase  text-primary">
                    Company
                  </h2>
                  <ul className="space-y-3 text-light text-sm">
                    <li>
                      <Link href="/about" className="hover:text-primary ">
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="hover:text-primary ">
                        Contact Us
                      </Link>
                    </li>
                    <li>
                      <Link href="/categories" className="hover:text-primary ">
                        Categories
                      </Link>
                    </li>
                    <li>
                      <Link href="/products" className="hover:text-primary ">
                        Products
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Social Media */}
                <div>
                  <h2 className="text-lg md:text-xl text-primary font-semibold mb-4 uppercase">
                    Follow Us
                  </h2>
                  <div className="flex space-x-4">
                    {socialLinks.map((social) => {
                      const socialData = getSocialIcon(social?.socialLinkName);
                      if (!socialData) return null;

                      return (
                        <a
                          key={social?._id}
                          href={social?.socialLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xl hover:scale-110 text-white rounded-full p-1"
                          style={{
                            color: socialData.color,
                            backgroundColor: "white",
                          }}
                          aria-label={social?.socialLinkName}
                        >
                          {socialData.icon}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </footer>
          <footer className="bg-black text-white px-4">
            <div className="container mx-auto">
              <div className=" border-t border-gray-700 py-4  flex flex-col lg:flex-row justify-between items-center gap-4 text-xs   ">
                <p className="text-center lg:text-left text-primary">
                  © {currentYear} {websiteInfo?.websiteName}. All rights
                  reserved.
                </p>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-end">
                  <a href="/privacy-policy" className="text-primary">
                    Privacy Policy
                  </a>
                  <p>|</p>
                  <a href="/terms-condition" className="text-primary">
                    Terms and Conditions
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </>
  );
};

export default Footer;
