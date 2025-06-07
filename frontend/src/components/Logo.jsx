import { useGetInfoQuery } from "@/lib/services/websiteInfo";
import Link from "next/link";

export default function Info({ className = "h-10", isShow = false }) {
  const { data, isLoading, isError, error } = useGetInfoQuery();

  if (isLoading) {
    return <p className="text-center text-xs text-gray-500">Loading...</p>;
  }

  if (isError || !data?.data) {
    const message =
      error?.data?.message || "An error occurred while fetching website info.";
    return <p className="text-center text-red-500">{message}</p>;
  }

  const { logoImage, websiteName } = data.data;

  return (
    <div>
      <Link
        href="/"
        className="flex items-center justify-center gap-1 transition-transform duration-300 hover:scale-105"
      >
        {logoImage ? (
          <img
            src={logoImage}
            alt={`${websiteName} Logo`}
            className={className}
          />
        ) : null}

        {(!logoImage || isShow) && (
          <span className="capitalize text-sm md:text-base xl:text-lg font-bold tracking-tight font-sans bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent ">
            {websiteName}
          </span>
        )}
      </Link>
    </div>
  );
}
