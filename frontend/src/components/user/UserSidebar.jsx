"use client";
import { ListOrdered, LogOut, BadgeDollarSign, Users } from "lucide-react";

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

import { useLogoutUserMutation } from "@/lib/services/auth";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import Logo from "../Logo";

const items = [
  {
    title: "Orders",
    url: "/user/order",
    icon: ListOrdered,
  },
  {
    title: "Profile",
    url: "/user/profile",
    icon: Users,
  },
];

export function UserSidebar({ ...props }) {
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
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Logout">
            <Button
              className="flex gap-1 mb-3 text-white"
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
