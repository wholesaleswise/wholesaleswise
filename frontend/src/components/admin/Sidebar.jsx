"use client";
import {
  LayoutDashboard,
  LayoutList,
  ListOrdered,
  Layers,
  Settings,
  Users,
  LogOut,
} from "lucide-react";
import { NavMain } from "./AdminNav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import Logo from "../Logo";
import { useLogoutUserMutation } from "@/lib/services/auth";

const items = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
];

const data = {
  navMain: [
    {
      title: "Category",
      url: "/admin/category",
      icon: Layers,
      isActive: true,
      items: [
        { title: "Manage Category", url: "/admin/category" },
        { title: "Add Category", url: "/admin/category/create" },
      ],
    },
    {
      title: "Product",
      url: "/admin/product",
      icon: LayoutList,
      isActive: true,
      items: [
        { title: "Mange Products", url: "/admin/product" },
        { title: "Add Product", url: "/admin/product/create" },
      ],
    },
    {
      title: "Order",
      url: "/admin/order",
      icon: ListOrdered,
      isActive: true,
      items: [
        { title: "Manage Order", url: "/admin/order" },
        { title: "My Order", url: "/admin/my-order" },
      ],
    },

    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
      isActive: true,
      items: [
        { title: "Update Website Info", url: "/admin/settings" },

        { title: "Change Password", url: "/admin/settings/change-password" },
        { title: "Manage Coupon", url: "/admin/settings/coupon" },
        { title: "Manage Address", url: "/admin/settings/address" },

        {
          title: "Manage Social Media",
          url: "/admin/settings/social-media-link",
        },
        { title: "Manage Banner", url: "/admin/settings/home-banner" },
        { title: "Manage Review", url: "/admin/settings/manage-review" },
        {
          title: "Update Terms-condition",
          url: "/admin/settings/terms-condition",
        },
        {
          title: "Update Privacy-Policy",
          url: "/admin/settings/privacy-policy",
        },
        {
          title: "Update Contact",
          url: "/admin/settings/contact",
        },
        {
          title: "Update About",
          url: "/admin/settings/about",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }) {
  const router = useRouter();
  const pathname = usePathname();
  const [logoutUser, status] = useLogoutUserMutation();
  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response.data && response.data.status === "success") {
        router.push("/");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const className = "h-10 w-auto object-cover";
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel
            className={"mt-10 mb-4 items-center flex justify-center"}
          >
            <Logo className={className} isShow={true} />
          </SidebarGroupLabel>

          <SidebarMenu className="pt-4 pb-2">
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={`hover:bg-primary hover:text-white
                    ${
                      pathname.includes(item.url) ? "bg-primary text-white" : ""
                    }`}
                >
                  <Link href={item.url}>
                    <item.icon style={{ width: "22px", height: "22px" }} />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <NavMain items={data.navMain} />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Logout">
            <Button
              className="flex gap-1 mb-3 text-white hover:bg-hover hover:text-white "
              onClick={handleLogout}
            >
              <LogOut style={{ width: "22px", height: "22px" }} />
              {status?.isLoading ? <span>Loading</span> : <span>Logout</span>}
            </Button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
