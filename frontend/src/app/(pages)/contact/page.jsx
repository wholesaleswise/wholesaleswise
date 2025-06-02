"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { useGetAllSocialLinksQuery } from "@/lib/services/socialLink";
import { useGetAllContactsQuery } from "@/lib/services/contact";

import Loading from "@/components/Loading";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ContactUs = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const { data: response, error, isLoading } = useGetAllSocialLinksQuery();
  const {
    data: contactList,
    isLoading: getLoading,
    error: isError,
  } = useGetAllContactsQuery();
  useEffect(() => {
    if (response) {
      setSocialLinks(response);
    }
  }, [response]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [contactList, socialLinks]);

  if (getLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center text-red-500">
        <Loading />
      </div>
    );
  }

  return (
    <div className=" container mx-auto p-4 l min-h-[80vh] lg:px-20">
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
              <BreadcrumbPage>Contact Us</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="mt-2">
        {contactList?.length === 0 ? (
          <p className="text-center text-red-600 py-10">No records found.</p>
        ) : isError ? (
          <p className="text-center text-red-600 py-10">
            {isError?.data?.message || "Failed to load data."}
          </p>
        ) : (
          contactList?.map((contact) => (
            <div
              key={contact._id}
               data-aos="fade-up"
              className="grid grid-cols-1 lg:grid-cols-2  text-black"
            >
              <div data-aos="fade-right">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: contact.contactContent }}
                />
                <div className="mt-4">
                  <strong className="text-gray-800 text-base md:text-lg">
                    Follow Us:
                  </strong>
                  <div className="">
                    {socialLinks.length === 0 ? (
                      <p>No social links available.</p>
                    ) : (
                      socialLinks.map((social) => (
                        <Link
                          key={social?._id}
                          href={social?.socialLink}
                          className="text-blue-800 hover:text-blue-900 transition-all duration-300 flex items-center space-x-2 text-sm md:text-base"
                        >
                          <span>{social?.socialLinkName}</span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div data-aos="fade-left">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Our Location :
                </h2>
                <iframe
                  src={contact.mapEmbedUrl}
                  width="100%"
                  height="400"
                  allowFullScreen=""
                  loading="lazy"
                  className="rounded border"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactUs;
