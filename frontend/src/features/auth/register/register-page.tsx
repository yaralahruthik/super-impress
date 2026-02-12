import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import * as z from "zod";
import { useSignUpWithEmailAndPassword } from "@/api/better-auth/better-auth";
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
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { mutate, isPending } = useSignUpWithEmailAndPassword();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      setError(null);
      mutate(
        {
          data: {
            name: value.name,
            email: value.email,
            password: value.password,
          },
        },
        {
          onSuccess: () => {
            navigate({ to: "/login" });
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
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Enter your details to create a new account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            id="register-form"
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
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <Input
                          aria-invalid={isInvalid}
                          autoComplete="name"
                          id="name"
                          name="name"
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          required
                          type="text"
                          value={field.state.value}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                  name="name"
                />
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
                <form.Field
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input
                          aria-invalid={isInvalid}
                          autoComplete="new-password"
                          id="password"
                          minLength={8}
                          name="password"
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
                  name="password"
                />
                <form.Field
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="confirmPassword">
                          Confirm Password
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

              <Button aria-busy={isPending} className="w-full" type="submit">
                {isPending ? "Creating account..." : "Create Account"}
              </Button>
            </fieldset>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              className="font-medium text-primary hover:underline"
              to="/login"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
