"use client";
import Loading from "@/components/Loading";
import { useGetAllTermsQuery } from "@/lib/services/termsCondition";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

const TermsAndConditions = () => {
  const { data: termsList, isLoading, error } = useGetAllTermsQuery();
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [termsList]);

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
              <BreadcrumbPage>Terms</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {termsList?.length === 0 ? (
        <p className="text-center text-red-600 py-10" data-aos="fade-up">
          No records found.
        </p>
      ) : error ? (
        <p className="text-center text-red-600 py-10" data-aos="fade-up">
          {error?.data?.message || "Failed to load data."}
        </p>
      ) : (
        termsList?.map((term) => (
          <div
            key={term._id}
            className="py-6 flex flex-col gap-4 text-black"
            data-aos="fade-up"
          >
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: term?.termsCondition }}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default TermsAndConditions;
