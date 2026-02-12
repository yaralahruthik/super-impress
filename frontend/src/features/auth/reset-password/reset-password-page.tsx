import { useForm } from "@tanstack/react-form";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import * as z from "zod";
import { useResetPassword } from "@/api/better-auth/better-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/layouts/auth-layout";
import { getErrorMessage } from "@/utils/get-error-message";

const formSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function getResetLinkErrorMessage(error: string): string {
  if (error === "INVALID_TOKEN") {
    return "This password reset link is invalid or expired. Request a new one.";
  }
  return "This password reset link is invalid. Request a new one.";
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useRouterState({ select: (state) => state.location });
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const token = searchParams.get("token");
  const linkError = searchParams.get("error");
  const hasValidToken = Boolean(token) && !linkError;

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { mutate, isPending } = useResetPassword();

  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      if (!token) {
        setError("Password reset token is missing. Please request a new link.");
        return;
      }

      setError(null);
      setSuccess(false);
      mutate(
        {
          data: {
            newPassword: value.newPassword,
            token,
          },
        },
        {
          onSuccess: () => {
            setSuccess(true);
            setTimeout(() => {
              navigate({ to: "/login" });
            }, 1500);
          },
          onError: (error) => {
            setError(getErrorMessage(error));
          },
        }
      );
    },
  });

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Choose a new password for your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!hasValidToken && (
            <div
              className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-destructive text-sm"
              role="alert"
            >
              {linkError
                ? getResetLinkErrorMessage(linkError)
                : "Password reset token is missing. Request a new reset link."}
            </div>
          )}

          <form
            id="reset-password-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <fieldset
              className="space-y-4"
              disabled={!hasValidToken || isPending || success}
            >
              <FieldGroup>
                <form.Field
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="newPassword">
                          New Password
                        </FieldLabel>
                        <Input
                          aria-invalid={isInvalid}
                          autoComplete="new-password"
                          id="newPassword"
                          minLength={8}
                          name="newPassword"
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          required
                          type="password"
                          value={field.state.value}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                  name="newPassword"
                />
                <form.Field
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="confirmPassword">
                          Confirm New Password
                        </FieldLabel>
                        <Input
                          aria-invalid={isInvalid}
                          autoComplete="new-password"
                          id="confirmPassword"
                          minLength={8}
                          name="confirmPassword"
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          required
                          type="password"
                          value={field.state.value}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                  name="confirmPassword"
                />
              </FieldGroup>

              {error && (
                <div
                  className="rounded-md bg-destructive/10 px-4 py-3 text-destructive text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {success && (
                <output className="inline-flex rounded-md bg-green-100 px-4 py-3 text-green-800 text-sm dark:bg-green-900/30 dark:text-green-400">
                  Password reset successful! Redirecting to sign in...
                </output>
              )}

              <Button
                aria-busy={isPending}
                className="w-full"
                disabled={!hasValidToken}
                type="submit"
              >
                {isPending ? "Resetting password..." : "Reset Password"}
              </Button>
            </fieldset>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <div className="text-center text-sm">
            <Link
              className="font-medium text-primary hover:underline"
              to="/forgot-password"
            >
              Request a new reset link
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
