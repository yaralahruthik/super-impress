import { IconExternalLink } from "@tabler/icons-react";
import type { PostListResponsePostsItemPublicationsItem } from "@/api/superimpress.schemas";
import { constructSocialLink } from "@/utils/construct-social-links";
import { getPlatformIcon, getPlatformLabel } from "./utils";

export default function PublicationHistory({
  publications,
}: {
  publications: PostListResponsePostsItemPublicationsItem[];
}) {
  if (publications.length === 0) {
    return (
      <p className="text-muted-foreground text-xs">No publications yet.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {publications.map((pub) => {
        const Icon = getPlatformIcon(pub.platform);
        const label = getPlatformLabel(pub.platform);
        const isManual = !pub.accountId;
        const resolvedUrl = constructSocialLink({
          platform: pub.platform,
          platformPostId: pub.platformPostId,
          url: pub.url,
        });

        return (
          <li className="flex items-center gap-2 text-xs" key={pub.id}>
            <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="font-medium">{label}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                isManual
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {isManual ? "Manual" : "Via linked account"}
            </span>
            {resolvedUrl && (
              <a
                className="ml-auto inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                href={resolvedUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <IconExternalLink className="size-3" />
              </a>
            )}
            <span className="text-muted-foreground">
              {new Date(pub.publishedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
