"use client";
import Categories from "@/components/home/Categories";
import { HomePageBanner } from "@/components/home/Banner";
import Product from "@/components/home/Product";
import { useEffect, useState } from "react";
import { useGetAllCategoryQuery } from "@/lib/services/category";
import CategroyProduct from "@/components/home/CategoryProduct";
import RootLayout from "./(pages)/layout";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaArrowUp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useGetInfoQuery } from "@/lib/services/websiteInfo";

const Home = () => {
  const [categories, setCategories] = useState(null);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [websiteInfo, setWebsiteInfo] = useState(null);

  const {
    data: categoryData,
    isLoading,
    isError,
    isSuccess,
    status: getCategoryStatus,
  } = useGetAllCategoryQuery();
  const { data: websiteData } = useGetInfoQuery();

  useEffect(() => {
    if (categoryData?.categories || isSuccess) {
      setCategories(categoryData.categories);
    } else if (isError) {
      toast.error(`${getCategoryStatus?.error?.data?.error}..`);
    }
  }, [categoryData]);

  useEffect(() => {
    if (websiteData?.data) setWebsiteInfo(websiteData.data);
  }, [websiteData]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
      easing: "ease-in-out",
    });
  }, []);

  // Back to top logic
  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://embed.tawk.to/${websiteInfo?.tawkToId}`;
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = function () {
      const iframe = document.querySelector("iframe[src*='tawk.to']");
      if (iframe) {
        // Reset to bottom right
        iframe.style.left = null;
        iframe.style.right = "20px";
        iframe.style.bottom = "20px";
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [websiteInfo]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <RootLayout>
      <div className="container mx-auto overflow-x-hidden">
        <div data-aos="fade-down">
          <Categories />
        </div>

        <div data-aos="fade-up">
          <HomePageBanner />
        </div>

        <div data-aos="fade-left" data-aos-delay="100">
          <Product />
        </div>

        <div className="mb-10">
          {categories?.map((category, index) => (
            <div
              key={category?._id}
              className="container mx-auto"
              data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
              data-aos-delay={index * 100}
            >
              <CategroyProduct
                category={category?.categoryName}
                heading={category?.categoryName}
              />
            </div>
          ))}
        </div>

        {/* Back to Top Button */}
        {showTopBtn && (
          <Button
            onClick={scrollToTop}
            className="fixed bottom-14 right-8 z-30 p-2 rounded-full bg-primary  transition-all duration-300"
            data-aos="zoom-in"
          >
            <FaArrowUp />
          </Button>
        )}
      </div>
    </RootLayout>
  );
};

export default Home;
