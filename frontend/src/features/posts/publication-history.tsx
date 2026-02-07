import { IconExternalLink } from "@tabler/icons-react";
import type { PostListResponsePostsItemPublicationsItem } from "@/api/superimpress.schemas";
import { constructSocialLink } from "@/utils/construct-social-links";
import { formatDate } from "@/utils/format-date";
import { getPlatformIcon, getPlatformLabel } from "./utils";

function PublicationHistoryItem({
  publication,
}: {
  publication: PostListResponsePostsItemPublicationsItem;
}) {
  const Icon = getPlatformIcon(publication.platform);
  const label = getPlatformLabel(publication.platform);
  const isManual = !publication.accountId;
  const resolvedUrl = constructSocialLink({
    platform: publication.platform,
    platformPostId: publication.platformPostId,
    url: publication.url,
  });

  return (
    <li className="flex items-center gap-2 text-xs">
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
        {formatDate(publication.publishedAt, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </span>
    </li>
  );
}

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
      {publications.map((publication) => (
        <PublicationHistoryItem
          key={publication.id}
          publication={publication}
        />
      ))}
    </ul>
  );
}
