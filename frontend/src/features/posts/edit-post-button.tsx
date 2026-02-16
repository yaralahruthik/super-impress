import { IconEdit } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as z from "zod";
import { usePatchApiPostsById } from "@/api/posts/posts";
import type { PostListResponsePostsItem } from "@/api/superimpress.schemas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export default function EditPostButton({
  post,
}: {
  post: PostListResponsePostsItem;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { mutate, isPending } = usePatchApiPostsById();

  const form = useForm({
    defaultValues: {
      title: post.title ?? "",
      content: post.content ?? "",
      tagsInput: post.tags?.join(", ") ?? "",
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
          id: post.id.toString(),
          data: {
            title: value.title || undefined,
            content: value.content,
            tags: tags.length > 0 ? tags : undefined,
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["/api/posts"],
            });
            setOpen(false);
          },
          onError: (err) => {
            setError(getErrorMessage(err));
          },
        }
      );
    },
  });

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setError(null);
          form.reset();
        }
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <IconEdit className="size-4" />
          Edit Post
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <form
          id="edit-post-form"
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
                      <FieldLabel htmlFor="edit-title">Title</FieldLabel>
                      <Input
                        aria-invalid={isInvalid}
                        id="edit-title"
                        name="title"
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter a title (optional)"
                        type="text"
                        value={field.state.value}
                      />
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
                      <FieldLabel htmlFor="edit-content">Content</FieldLabel>
                      <Textarea
                        aria-invalid={isInvalid}
                        id="edit-content"
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
                      <FieldLabel htmlFor="edit-tagsInput">Tags</FieldLabel>
                      <Input
                        aria-invalid={isInvalid}
                        id="edit-tagsInput"
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
          </fieldset>
        </form>
        <DialogFooter>
          <Button
            aria-busy={isPending}
            disabled={isPending}
            form="edit-post-form"
            type="submit"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
