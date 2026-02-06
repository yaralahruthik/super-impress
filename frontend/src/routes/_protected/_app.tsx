import { createFileRoute, Outlet } from "@tanstack/react-router";
import AppLayout from "@/layouts/app-layout";

export const Route = createFileRoute("/_protected/_app")({
  component: AppLayoutComponent,
});

function AppLayoutComponent() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
