import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import * as z from "zod";
import { usePostApiPosts } from "@/api/posts/posts";
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
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/utils/get-error-message";

const formSchema = z.object({
  title: z.string().trim(),
  content: z.string().trim().min(1, "Content is required"),
  tagsInput: z.string().trim(),
});

export default function CreatePostPage() {
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { mutate, isPending } = usePostApiPosts();

  const form = useForm({
    defaultValues: {
      title: "",
      content: "",
      tagsInput: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      setError(null);

      const tags = value.tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      mutate(
        {
          data: {
            title: value.title || undefined,
            content: value.content,
            tags: tags.length > 0 ? tags : undefined,
          },
        },
        {
          onSuccess: () => {
            navigate({ to: "/posts" });
          },
          onError: (error) => {
            setError(getErrorMessage(error));
          },
        }
      );
    },
  });

  return (
    <div className="max-w-2xl py-8 space-y-4">
      <AppBreadcrumbs
        items={[
          { label: "Posts", to: "/posts" },
          { label: "Create Post" },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>Create Post</CardTitle>
          <CardDescription>
            Create a new post to share your thoughts
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            id="create-post-form"
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
                        <FieldLabel htmlFor="title">Title</FieldLabel>
                        <Input
                          aria-invalid={isInvalid}
                          id="title"
                          name="title"
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter a title (optional)"
                          type="text"
                          value={field.state.value}
                        />
                        <p className="text-muted-foreground text-sm">
                          Give your post a descriptive title
                        </p>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                  name="title"
                />
                <form.Field
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="content">Content</FieldLabel>
                        <Textarea
                          aria-invalid={isInvalid}
                          id="content"
                          name="content"
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="What's on your mind?"
                          required
                          value={field.state.value}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                  name="content"
                />
                <form.Field
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="tagsInput">Tags</FieldLabel>
                        <Input
                          aria-invalid={isInvalid}
                          id="tagsInput"
                          name="tagsInput"
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="tech, programming, ideas"
                          type="text"
                          value={field.state.value}
                        />
                        <p className="text-muted-foreground text-sm">
                          Separate tags with commas
                        </p>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                  name="tagsInput"
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
                {isPending ? "Creating..." : "Create Post"}
              </Button>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
