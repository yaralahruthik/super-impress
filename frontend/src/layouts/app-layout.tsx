import { useRouterState } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { ErrorBoundary } from "@/components/error-boundary";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useRouterState({ select: (state) => state.location });

  return (
    <SidebarProvider>
      <ErrorBoundary resetKeys={[location.href]}>
        <AppSidebar />
        <main className="w-full space-y-4 p-4">
          <SidebarTrigger />
          <div>{children}</div>
        </main>
      </ErrorBoundary>
    </SidebarProvider>
  );
}
