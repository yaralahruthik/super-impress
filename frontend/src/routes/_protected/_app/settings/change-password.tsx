import { createFileRoute } from "@tanstack/react-router";
import ChangePasswordPage from "@/features/settings/change-password-page";

export const Route = createFileRoute(
  "/_protected/_app/settings/change-password"
)({
  component: ChangePasswordPage,
});
