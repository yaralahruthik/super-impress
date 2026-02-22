import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import * as z from "zod";
import { useChangePassword } from "@/api/better-auth/better-auth";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { getErrorMessage } from "@/utils/get-error-message";

const formSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ChangePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { mutate, isPending } = useChangePassword();

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      setError(null);
      setSuccess(false);
      mutate(
        {
          data: {
            currentPassword: value.currentPassword,
            newPassword: value.newPassword,
          },
        },
        {
          onSuccess: () => {
            setSuccess(true);
            setTimeout(() => {
              navigate({ to: "/" });
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
    <div className="space-y-6">
      <AppBreadcrumbs
        items={[
          { label: "Settings", to: "/settings" },
          { label: "Change Password" },
        ]}
      />
      <div>
        <h1 className="font-bold text-2xl">Change Password</h1>
        <p className="text-muted-foreground">Update your account password</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>New Password</CardTitle>
          <CardDescription>
            Enter your current password and choose a new one
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            id="change-password-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <fieldset className="space-y-4" disabled={isPending || success}>
              <FieldGroup>
                <form.Field
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="currentPassword">
                          Current Password
                        </FieldLabel>
                        <Input
                          aria-invalid={isInvalid}
                          autoComplete="current-password"
                          id="currentPassword"
                          name="currentPassword"
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
                  name="currentPassword"
                />

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
                <output className="rounded-md bg-green-100 px-4 py-3 text-green-800 text-sm dark:bg-green-900/30 dark:text-green-400">
                  Password changed successfully! Redirecting...
                </output>
              )}

              <Button aria-busy={isPending} className="w-full" type="submit">
                {isPending ? "Changing Password..." : "Change Password"}
              </Button>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
