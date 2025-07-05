"use client";

import clsx from "clsx";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  Headphones,
  Search,
  ChevronUp,
  House,
  Layers,
  Phone,
  Info,
  LogOut,
} from "lucide-react";
import { FaComputer } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import AvatarCom from "@/components/Avatar";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

import LoadingIndicator from "./LoadingIndicator";

import {
  useGetProtectedQuery,
  useGetUserQuery,
  useLogoutUserMutation,
} from "@/lib/services/auth";
import { useFetchCartQuery } from "@/lib/services/cart";
import { useGetAllProductQuery } from "@/lib/services/product";
import { useGetInfoQuery } from "@/lib/services/websiteInfo";
import Cart from "./cart";
import Aos from "aos";

const menu = [
  {
    id: 1,
    title: "Home",
    path: "/",
    icon: <House className=" w-4 h-4" />,
  },
  {
    id: 2,
    title: "Products",
    path: "/products",
    icon: <FaComputer className=" w-4 h-4" />,
  },
  {
    id: 3,
    title: "Categories",
    path: "/categories",
    icon: <Layers className=" w-4 h-4" />,
  },
  {
    id: 4,
    title: "About",
    path: "/about",
    icon: <Info className=" w-4 h-4" />,
  },
  {
    id: 5,
    title: "Contact",
    path: "/contact",
    icon: <Phone className="  w-4 h-4" />,
  },
];

const Navbar = () => {
  const profileRef = useRef(null);
  const desktopWrapperRef = useRef(null);
  const mobileWrapperRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const [searchedProducts, setSearchedProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  // Fetch all products and website info
  const { data: productData } = useGetAllProductQuery();
  const { data: info } = useGetInfoQuery();

  // Get user data and authentication status
  const { data: userData, isSuccess, isLoading } = useGetUserQuery();
  const { data: userlogin } = useGetProtectedQuery();
  const [logoutUser, status] = useLogoutUserMutation();
  const user = isSuccess ? userData.user : null;
  const { data: cartData } = useFetchCartQuery(
    { userId: user?._id },
    { skip: !user?._id }
  );

  // Update products when product data is fetched
  useEffect(() => {
    if (productData?.products) {
      const filteredProducts = productData.products.filter(
        (product) => product.productTotalStockQty > 1
      );
      setProducts(filteredProducts);
    }
  }, [productData]);

  // Initialize search from URL parameters
  const initialSearch = searchParams.get("search") || "";

  // Toggle mobile menu visibility
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const cartCount = cartData?.data?.length || 0;

  // Set authentication status from protected query data
  useEffect(() => {
    if (userlogin) {
      setIsAuthenticated(userlogin?.is_auth);
    }
  }, [userlogin]);

  // Set search state based on URL search parameter
  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  // Clear search on route change if not on products page
  useEffect(() => {
    if (!pathname.startsWith("/products")) {
      setSearch("");
    }
  }, [pathname]);

  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: true,
      offset: 100,
      easing: "ease-in-out",
    });
  }, []);

  // Close profile dropdown if click is outside of profile ref
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [profileOpen]);

  // Filter products based on search input
  useEffect(() => {
    const filtered = products.filter((product) =>
      product?.productName?.toLowerCase().includes(search.toLowerCase())
    );
    setSearchedProducts(filtered);
  }, [search, products]);

  // Hide suggestions if clicked outside on desktop or mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideDesktop =
        desktopWrapperRef.current &&
        !desktopWrapperRef.current.contains(event.target);
      const clickedOutsideMobile =
        mobileWrapperRef.current &&
        !mobileWrapperRef.current.contains(event.target);

      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search on enter key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearchClick(event);
      }
    };

    if (desktopWrapperRef.current) {
      desktopWrapperRef.current.addEventListener("keydown", handleKeyDown);
    }

    if (mobileWrapperRef.current) {
      mobileWrapperRef.current.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (desktopWrapperRef.current) {
        desktopWrapperRef.current.removeEventListener("keydown", handleKeyDown);
      }
      if (mobileWrapperRef.current) {
        mobileWrapperRef.current.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [search]);

  // Handle search button click
  const handleSearchClick = (e) => {
    e.preventDefault();
    const trimmed = search.trim();
    if (trimmed) {
      router.replace(`/products?search=${trimmed}`);
    } else {
      router.replace("/");
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      const response = await logoutUser();

      if (response.data && response.data.status === "success") {
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handle suggestion click (navigate to product page)
  const handleSuggestionClick = (slug) => {
    console.log("click", slug);
    router.push(`/product/${slug}`);
    setShowSuggestions(false);
    setSearch("");
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-40 bg-orange-50  shadow-sm ">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          {/* Logo */}
          <div>
            <Logo className="h-10 w-auto object-cover" isShow={true} />
          </div>

          {/* Desktop search bar */}
          <div
            ref={desktopWrapperRef}
            className="hidden sm:flex items-center w-[45%] lg:w-1/2 max-w-xl relative  rounded-md "
          >
            <Input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Find your favorite items..."
              className="flex-1 border-2 text-sm border-color px-4 py-2 focus-visible:ring-0 focus-visible:ring-ring outline-none  rounded-l-md rounded-r-none   "
            />

            <Button
              onClick={handleSearchClick}
              className="rounded-none bg-primary hover:bg-hover rounded-r-md  text-white px-4"
            >
              <Search size={24} />
            </Button>

            {/* Suggestions dropdown */}
            {showSuggestions && searchedProducts.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white shadow-md z-50 max-h-60 overflow-y-auto  rounded-md">
                {searchedProducts.map((product) => (
                  <div
                    key={product?._id}
                    onClick={() => handleSuggestionClick(product?.slug)}
                    className="flex items-center gap-2 p-3 cursor-pointer hover:bg-secondary "
                  >
                    <img
                      src={product?.productImageUrls[0]}
                      alt={product?.productName}
                      className="w-12 h-12 object-contain rounded"
                    />
                    <div>
                      <div className="font-medium text-sm">
                        {product?.productName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.category?.categoryName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart and Profile section */}
          <div className="flex items-center gap-3 md:gap-6">
            {/* Cart */}
            <Sheet>
              <SheetTrigger asChild>
                <div className="relative cursor-pointer text-gray-700 hover:text-primary">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full px-1">
                    {cartCount}
                  </span>
                </div>
              </SheetTrigger>
              <SheetContent className="min-h-[80vh] max-h-screen overflow-y-auto  scrollbar-none">
                <SheetHeader>
                  <SheetTitle>Your Cart Items</SheetTitle>
                  <SheetDescription>
                    Review your cart and make any necessary changes.
                  </SheetDescription>
                </SheetHeader>
                <Cart />
                {cartData?.data?.length > 0 && (
                  <SheetFooter>
                    <SheetClose asChild>
                      <div className="flex flex-col gap-4 w-full">
                        <Link
                          href="/checkout"
                          className=" bg-primary text-primary-foreground shadow bg-primary:hover w-full px-4 py-2 hover:bg-hover  rounded-md text-center"
                        >
                          Checkout
                        </Link>

                        <Link
                          href="/products"
                          type="button"
                          className="bg-transparent w-full px-4 py-2 text-center items-center text-gray-800 border border-gray-300 hover:bg-gray-200 hover:text-gray-800 rounded-md"
                        >
                          Continue Shopping
                        </Link>
                      </div>
                    </SheetClose>
                  </SheetFooter>
                )}
              </SheetContent>
            </Sheet>

            {/* Profile */}
            {user && isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2"
                >
                  <AvatarCom css="h-7 w-7 rounded-full" />
                  <span className="hidden lg:block text-sm font-bold hover:text-primary">
                    {user?.name || "Profile"}
                  </span>
                </button>

                {profileOpen && (
                  <>
                    <div className="absolute right-0 z-20 ">
                      <div className="flex justify-end">
                        <ChevronUp className="h-4 w-4 rotate-180  items-end " />
                      </div>

                      <div className="w-32  p-3  bg-white shadow-md rounded-md">
                        <Link
                          href={
                            user.roles?.[0] === "admin"
                              ? "/admin/dashboard"
                              : "/user/order"
                          }
                          className="block px-4 font-semibold bg-secondary hover:bg-[#fbcc97] py-2 mb-4 text-sm "
                        >
                          Dashboard
                        </Link>
                        <Button
                          onClick={handleLogout}
                          className="w-full text-left px-2 py-2 text-sm flex gap-2 rounded-none "
                        >
                          Log Out
                          <LogOut />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/account/login">
                <Button className="hidden md:block px-2 md:px-5 py-2">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <Button
              type="button"
              onClick={toggleMenu}
              className=" md:hidden  rounded-md px-2 bg-primary hover:bg-hover "
            >
              <svg
                className="size-10"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className=" bg-secondary">
          <div className="container mx-auto hidden md:flex justify-between items-center px-4  text-xs text-gray-700 ">
            <nav className="flex gap-2 lg:gap-6">
              {menu.map((item) => (
                <Link
                  key={item.id}
                  href={item.path}
                  className={clsx(
                    " hover:bg-primary font-semibold hover:text-white transition px-4 py-3 flex gap-2 uppercase items-center justify-center tracking-wide",
                    pathname === item.path ? " bg-primary text-white " : ""
                  )}
                >
                  <span className="text-xl ">{item.icon}</span>
                  {item.title}
                </Link>
              ))}
            </nav>
            {info?.data?.supportNumber && (
              <div className=" flex-col lg:flex lg:flex-row items-center text-center text-sm lg:gap-2">
                <div className=" flex gap-2 items-center ">
                  <Headphones className="h-5 w-5 text-primary" />
                  <a
                    href={`tel:${info?.data?.supportNumber}`}
                    className="font-bold text-primary cursor-pointer"
                  >
                    {info?.data?.supportNumber}
                  </a>
                </div>

                <span className="text-gray-500 text-xs ">Customer Support</span>
              </div>
            )}
          </div>
        </div>

        {/* mobile search bar */}
        <div className="sm:hidden px-4 py-4 bg-orange-100  ">
          <div
            ref={mobileWrapperRef}
            className="   flex items-center rounded-md relative"
          >
            <Input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Find your favorite items..."
              className="flex-1 border-2 border-color px-4 py-2 text-sm focus-visible:ring-0 focus-visible:ring-ring outline-none  rounded-l-md rounded-r-none "
            />
            <Button
              onClick={handleSearchClick}
              className="rounded-none bg-primary hover:bg-hover rounded-r-md  text-white px-4"
            >
              <Search size={24} />
            </Button>
            {showSuggestions && searchedProducts.length > 0 && (
              <div className="absolute top-full  bg-white shadow-md z-50 max-h-60 overflow-y-auto  rounded-md">
                {searchedProducts.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleSuggestionClick(product?.slug)}
                    className="flex items-center gap-2 p-3 cursor-pointer hover:bg-secondary "
                  >
                    <img
                      src={product?.productImageUrls[0]}
                      alt={product.productName}
                      className="w-12 h-12 object-contain rounded"
                    />
                    <div>
                      <div className="font-medium text-sm">
                        {product.productName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.category?.categoryName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {menuOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
          >
            <div
              data-aos="fade-left"
              data-aos-duration="200"
              data-aos-delay="0"
              className="fixed right-0 top-0 h-full w-60 flex flex-col justify-between overflow-y-auto z-50 bg-gray-100 px-5  py-6 shadow-lg"
            >
              {/* Header: Logo and Close */}
              <div className="flex items-center justify-between mb-6">
                <Logo className="h-12 w-auto object-contain" />
                <Button
                  type="button"
                  onClick={toggleMenu}
                  className="rounded-md px-2 py-1 hover:bg-hover transition"
                  aria-label="Close menu"
                >
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>

              {/* Menu Links */}
              <nav className="flex flex-col items-start justify-center gap-4 text-gray-800 text-[15px] font-medium">
                {menu.map((item) => (
                  <Link
                    key={item.id}
                    href={item.path}
                    onClick={toggleMenu}
                    className={clsx(
                      "flex items-center  gap-3 px-6 py-1 rounded-md w-full transition-colors",
                      pathname === item.path
                        ? "bg-primary text-white font-semibold"
                        : "hover:bg-primary"
                    )}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.title}
                  </Link>
                ))}
              </nav>

              {/* Sign In and Support Section */}
              <div className="mt-8">
                {!user && !isAuthenticated && (
                  <Link href="/account/login" onClick={toggleMenu}>
                    <Button className="w-full  text-white py-2 rounded-md font-semibold text-sm">
                      Sign In
                    </Button>
                  </Link>
                )}

                {info?.data?.supportNumber && (
                  <div className="flex flex-col justify-center items-center text-sm mt-6">
                    <div className="flex gap-2 items-center">
                      <Headphones className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-500 text-xs">
                        Customer Support
                      </span>
                    </div>
                    <a
                      href={`tel:${info?.data?.supportNumber}`}
                      className="font-bold text-primary mt-1"
                    >
                      {info?.data?.supportNumber}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
