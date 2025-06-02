export async function getWebsiteInfo() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/info/website-info`,
      {
        cache: "no-store",
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) {
      console.error("Failed to fetch website info:", res.statusText);
      return null;
    }

    const data = await res.json();

    return data?.data;
  } catch (err) {
    console.error("Error fetching website info:", err);
    return null;
  }
}

export async function getSingleProductServerSide(slug) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/${slug}`,
      {
        cache: "no-store",
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) {
      console.error(
        `Error fetching product: ${res.status} - ${res.statusText}`
      );
      return null;
    }

    const data = await res.json();
    return data?.product;
  } catch (error) {
    console.error("Server error fetching product:", error);
    return null;
  }
}
