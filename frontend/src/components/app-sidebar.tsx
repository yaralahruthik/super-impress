import {
  IconHome,
  IconLogout,
  IconNotes,
  IconSettings,
} from "@tabler/icons-react";
import { Link, type LinkProps, useRouter } from "@tanstack/react-router";
import { useSignOut } from "@/api/better-auth/better-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";

const items: {
  title: string;
  url: LinkProps["to"];
  icon: React.ElementType;
}[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: IconHome,
  },
  {
    title: "Posts",
    url: "/posts",
    icon: IconNotes,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: IconSettings,
  },
];

function LogOutButton() {
  const router = useRouter();
  const { mutate } = useSignOut();

  const handleLogout = () => {
    mutate(
      { data: {} },
      {
        onSuccess: () => {
          router.invalidate();
        },
      }
    );
  };
  return (
    <SidebarMenuButton onClick={handleLogout}>
      <IconLogout />
      <span>Logout</span>
    </SidebarMenuButton>
  );
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
                <Logo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <LogOutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
