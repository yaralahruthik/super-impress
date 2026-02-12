import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as z from "zod";
import { usePostApiPostsByIdPublications } from "@/api/posts/posts";
import {
  ManualPublicationRequestPlatform,
  type PostListResponsePostsItemPublicationsItem,
} from "@/api/superimpress.schemas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/utils/get-error-message";
import { getPlatformLabel } from "./utils";

const platformValues = Object.values(
  ManualPublicationRequestPlatform
) as ManualPublicationRequestPlatform[];

const formSchema = z.object({
  platform: z.enum(
    platformValues as [
      ManualPublicationRequestPlatform,
      ...ManualPublicationRequestPlatform[],
    ]
  ),
  url: z.url({ message: "Please enter a valid URL" }).trim(),
});

function getSubmitButtonLabel({
  hasAvailablePlatforms,
  isPending,
}: {
  hasAvailablePlatforms: boolean;
  isPending: boolean;
}) {
  if (!hasAvailablePlatforms) {
    return "All Platforms Recorded";
  }

  if (isPending) {
    return "Saving...";
  }

  return "Mark as Published";
}

export default function MarkAsPublishedDialog({
  postId,
  publications,
  open,
  onOpenChange,
}: {
  postId: string;
  publications: PostListResponsePostsItemPublicationsItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { mutate, isPending } = usePostApiPostsByIdPublications();
  const publishedPlatforms = new Set(
    publications.map((publication) => publication.platform)
  );
  const availablePlatforms = platformValues.filter(
    (platform) => !publishedPlatforms.has(platform)
  );
  const hasAvailablePlatforms = availablePlatforms.length > 0;
  const defaultPlatform =
    availablePlatforms[0] ?? ("linkedin" as ManualPublicationRequestPlatform);

  const form = useForm({
    defaultValues: {
      platform: defaultPlatform,
      url: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      if (!hasAvailablePlatforms) {
        return;
      }

      if (!availablePlatforms.includes(value.platform)) {
        setError("This platform is already marked as published for this post.");
        return;
      }

      setError(null);
      mutate(
        {
          id: postId,
          data: {
            platform: value.platform,
            url: value.url,
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
            onOpenChange(false);
            form.reset();
          },
          onError: (err) => {
            setError(getErrorMessage(err));
          },
        }
      );
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Published</DialogTitle>
          <DialogDescription>
            Record that you published this post on a platform.
          </DialogDescription>
        </DialogHeader>

        <form
          id="mark-as-published-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <fieldset className="space-y-4" disabled={isPending}>
            <FieldGroup>
              {hasAvailablePlatforms ? (
                <>
                  <form.Field
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="platform">Platform</FieldLabel>
                          <select
                            aria-invalid={isInvalid}
                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 md:text-sm dark:bg-input/30"
                            id="platform"
                            name="platform"
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              field.handleChange(
                                e.target
                                  .value as ManualPublicationRequestPlatform
                              )
                            }
                            value={field.state.value}
                          >
                            {availablePlatforms.map((platform) => (
                              <option key={platform} value={platform}>
                                {getPlatformLabel(platform)}
                              </option>
                            ))}
                          </select>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                    name="platform"
                  />
                  <form.Field
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="url">Post URL</FieldLabel>
                          <Input
                            aria-invalid={isInvalid}
                            id="url"
                            name="url"
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="https://linkedin.com/posts/..."
                            type="url"
                            value={field.state.value}
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                    name="url"
                  />
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  All platforms have already been marked as published for this
                  post.
                </p>
              )}
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
            disabled={!hasAvailablePlatforms || isPending}
            form="mark-as-published-form"
            type="submit"
          >
            {getSubmitButtonLabel({
              hasAvailablePlatforms,
              isPending,
            })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
