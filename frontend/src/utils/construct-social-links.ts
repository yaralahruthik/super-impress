import type { PostListResponsePostsItemPublicationsItemPlatform } from "@/api/superimpress.schemas";
import { LINKEDIN } from "@/constants";

type ConstructSocialLinkOptions = {
  platform: PostListResponsePostsItemPublicationsItemPlatform;
  platformPostId?: string | null;
  url?: string | null;
};

const buildLinkedInUrl = (platformPostId: string): string => {
  const urn = platformPostId.startsWith("urn:")
    ? platformPostId
    : `urn:li:share:${platformPostId}`;

  return `${LINKEDIN.feedBaseUrl}${urn}`;
};

export const constructSocialLink = ({
  platform,
  platformPostId,
  url,
}: ConstructSocialLinkOptions): string | null => {
  if (url) {
    return url;
  }

  if (!platformPostId) {
    return null;
  }

  if (platform === "linkedin") {
    return buildLinkedInUrl(platformPostId);
  }

  return null;
};
