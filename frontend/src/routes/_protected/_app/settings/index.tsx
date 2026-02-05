import { createFileRoute } from "@tanstack/react-router";
import SettingsPage from "@/features/settings/settings-page";

export const Route = createFileRoute("/_protected/_app/settings/")({
  component: SettingsPage,
});
