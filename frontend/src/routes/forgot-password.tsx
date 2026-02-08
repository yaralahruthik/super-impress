import { createFileRoute } from "@tanstack/react-router";
import ForgotPasswordPage from "@/features/auth/forgot-password/forgot-password-page";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});
