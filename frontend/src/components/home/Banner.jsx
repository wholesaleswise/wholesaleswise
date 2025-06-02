"use client";
import { useEffect, useRef, useState } from "react";
import { useGetAllBannersQuery } from "@/lib/services/banner";
import toast from "react-hot-toast";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

export function HomePageBanner() {
  const [bannerData, setBannerData] = useState([]);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const { data, isLoading, isSuccess, isError, error } =
    useGetAllBannersQuery();

  useEffect(() => {
    if (isSuccess && data?.Banners) {
      setBannerData(data.Banners);
    } else if (isError && error?.data?.message) {
      toast.error(error.data.message);
    }
  }, [data, isSuccess, isError, error]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 h-72">
        <div className="w-full h-full bg-red-200 rounded-md animate-pulse flex justify-center items-center">
          <img src="/loader.gif" width={50} height={50} alt="Loading..." />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center text-red-600 font-semibold">
        {error?.data?.message || "Failed to load banner"}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 mt-6 relative">
      {bannerData.length ? (
        <>
          <button
            ref={prevRef}
            className="absolute z-10 top-1/2 left-2 transform -translate-y-1/2 bg-white shadow-md p-1 rounded-full text-sm hidden md:block"
          >
            <FaAngleLeft />
          </button>
          <button
            ref={nextRef}
            className="absolute z-10 top-1/2 right-2 transform -translate-y-1/2 bg-white shadow-md p-1 rounded-full text-sm hidden md:block"
          >
            <FaAngleRight />
          </button>

          <Swiper
            modules={[Navigation, Autoplay, Pagination]}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            pagination={{ clickable: true }}
            loop={true}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            className="rounded-lg overflow-hidden h-[180px] sm:h-[180px] md:h-[250px] lg:h-[300px] xl:h-[300px] "
          >
            {bannerData.map((banner, idx) => (
              <SwiperSlide key={idx}>
                <Link
                  href={banner.productLink || "/products"}
                  className="relative block h-[150px] sm:h-[160px] md:h-[200px] lg:h-[300px] xl:h-[300px]  bg-center bg-contain 2xl:bg-cover bg-no-repeat"
                  style={{ backgroundImage: `url(${banner.BannerImage})` }}
                  aria-label="Banner Link"
                />
              </SwiperSlide>
            ))}
          </Swiper>
          
        </>
      ) : (
        <div className="min-h-[60vh] flex justify-center items-center text-red-500 font-semibold">
          Banner data not found!
        </div>
      )}
    </div>
  );
}
