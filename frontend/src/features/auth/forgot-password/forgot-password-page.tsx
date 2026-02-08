import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import * as z from "zod";
import { useRequestPasswordReset } from "@/api/better-auth/better-auth";
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
import { URLS } from "@/constants";
import { AuthLayout } from "@/layouts/auth-layout";
import { getErrorMessage } from "@/utils/get-error-message";

const formSchema = z.object({
  email: z.email("Invalid email address"),
});

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { mutate, isPending } = useRequestPasswordReset();

  const redirectTo = URLS.app.endsWith("/")
    ? `${URLS.app}reset-password`
    : `${URLS.app}/reset-password`;

  const form = useForm({
    defaultValues: {
      email: "",
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
            email: value.email,
            redirectTo,
          },
        },
        {
          onSuccess: () => {
            setSuccess(true);
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
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter the email address for your account and we will send a reset
            link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            id="forgot-password-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <fieldset className="space-y-4" disabled={isPending}>
              <FieldGroup>
                <form.Field
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          aria-invalid={isInvalid}
                          autoComplete="email"
                          id="email"
                          name="email"
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          required
                          type="email"
                          value={field.state.value}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                  name="email"
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
                  If an account exists for this email, a reset link has been
                  sent.
                </output>
              )}

              <Button aria-busy={isPending} className="w-full" type="submit">
                {isPending ? "Sending link..." : "Send reset link"}
              </Button>
            </fieldset>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Remembered it? </span>
            <Link
              className="font-medium text-primary hover:underline"
              to="/login"
            >
              Back to sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
