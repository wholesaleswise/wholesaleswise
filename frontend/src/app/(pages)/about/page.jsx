"use client";

import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useCallback } from "react";
import Loading from "@/components/Loading";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useGetAllAboutQuery } from "@/lib/services/about";

function About() {
  const { data: aboutList, isLoading, error } = useGetAllAboutQuery();

  // Memoize AOS initialization to prevent unnecessary re-initialization
  const initializeAOS = useCallback(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // Initialize AOS only once when the component mounts
  useEffect(() => {
    initializeAOS();
  }, [initializeAOS]);

  // Refresh AOS when aboutList changes
  useEffect(() => {
    AOS.refresh();
  }, [aboutList]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center text-red-500">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-[80vh] mt-6 lg:px-20">
      <div className="py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>About Us</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {aboutList?.length === 0 ? (
        <p className="text-center text-red-600 py-10">No records found.</p>
      ) : error ? (
        <p className="text-center text-red-600 py-10">
          {error?.data?.message || "Failed to load data."}
        </p>
      ) : (
        aboutList?.map((item) => (
          <div
            key={item._id}
            className="py-6 flex flex-col gap-4 text-black"
            data-aos="fade-up"
          >
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: item.aboutContent }}
            />
          </div>
        ))
      )}
    </div>
  );
}

export default About;
