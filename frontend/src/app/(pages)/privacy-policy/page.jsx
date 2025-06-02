"use client";
import Loading from "@/components/Loading";
import { useGetAllPrivacyPoliciesQuery } from "@/lib/services/privacyPolicy";
import React, { useEffect } from "react";
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

const PrivacyPolicy = () => {
  const {
    data: policyList,
    isLoading,
    error,
  } = useGetAllPrivacyPoliciesQuery();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [policyList]);

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
              <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {policyList?.length === 0 ? (
        <p
          className="text-center min-h-[80vh] flex justify-center items-center text-red-600 py-10"
          data-aos="fade-up"
        >
          No records found.
        </p>
      ) : error ? (
        <p className="text-center text-red-600 py-10" data-aos="fade-up">
          {error?.data?.message || "Failed to load data."}
        </p>
      ) : (
        policyList?.map((policy) => (
          <div
            key={policy._id}
            className="py-6 flex flex-col gap-4 text-black"
            data-aos="fade-up"
          >
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: policy.privacyPolicy }}
            /> +``
          </div>
        ))
      )}
    </div>
  );
};

export default PrivacyPolicy;
