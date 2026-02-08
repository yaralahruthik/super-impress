import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordPage from "@/features/auth/reset-password/reset-password-page";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});
