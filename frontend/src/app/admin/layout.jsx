import { AppSidebar } from "@/components/admin/Sidebar";
import AvatarCom from "@/components/Avatar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getWebsiteInfo } from "@/lib/services/serverSideAPICall";
import Protected from "@/protected/Protected";
import { Menu } from "lucide-react";

export async function generateMetadata() {
  const websiteInfo = await getWebsiteInfo();

  return {
    title: `Admin - ${websiteInfo?.websiteName}`,
    description: `Admin dashboard for managing ${websiteInfo?.websiteName}.`,
  };
}

export default function Page({ children }) {
  const css = "w-7 h-7";
  return (
    <Protected>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-x-auto">
          <header className="flex sticky top-0 z-20 bg-background justify-between h-16 shrink-0 items-center gap-2 border-b px-4">
            <div className="flex items-center">
              <SidebarTrigger className="-ml-1">
                <Menu style={{ width: "22px", height: "22px" }} />
                <span className="sr-only">Toggle Sidebar</span>{" "}
              </SidebarTrigger>
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <SidebarTrigger >
              <AvatarCom css={css} />
            </SidebarTrigger>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  );
}
